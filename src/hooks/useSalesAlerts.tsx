import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useRestaurant } from '@/hooks/useRestaurant';
import { useToast } from '@/components/ui/use-toast';
import { InventoryAlert } from '@/hooks/useInventory';

interface SalesData {
  product_id: string;
  product_name: string;
  total_sold: number;
  sales_velocity: number; // vendas por dia
  stock_remaining: number;
  estimated_stockout_days: number;
}

export const useSalesAlerts = () => {
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [salesAlerts, setSalesAlerts] = useState<InventoryAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const { currentRestaurant } = useRestaurant();
  const { toast } = useToast();

  // Buscar dados de vendas e consumo dos últimos 7 dias
  const fetchSalesData = useCallback(async () => {
    if (!currentRestaurant?.id) return;

    setLoading(true);
    try {
      // Buscar histórico de consumo dos últimos 7 dias
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: consumptionData, error: consumptionError } = await supabase
        .from('consumption_history')
        .select(`
          item_id,
          quantity,
          date,
          inventory_items(name, current_stock)
        `)
        .eq('restaurant_id', currentRestaurant.id)
        .gte('date', sevenDaysAgo.toISOString().split('T')[0])
        .order('date', { ascending: false });

      if (consumptionError) throw consumptionError;

      // Processar dados de vendas por produto
      const salesByProduct = new Map<string, {
        product_name: string;
        total_sold: number;
        current_stock: number;
        sales_dates: string[];
      }>();

      consumptionData?.forEach((record) => {
        const productId = record.item_id;
        const productName = (record as any).inventory_items?.name || 'Produto';
        const currentStock = (record as any).inventory_items?.current_stock || 0;
        
        if (!salesByProduct.has(productId)) {
          salesByProduct.set(productId, {
            product_name: productName,
            total_sold: 0,
            current_stock: currentStock,
            sales_dates: []
          });
        }

        const productData = salesByProduct.get(productId)!;
        productData.total_sold += record.quantity;
        productData.sales_dates.push(record.date);
      });

      // Calcular velocidade de vendas e estimar dias para esgotamento
      const salesDataArray: SalesData[] = Array.from(salesByProduct.entries()).map(([productId, data]) => {
        const uniqueDates = [...new Set(data.sales_dates)];
        const salesVelocity = data.total_sold / Math.max(uniqueDates.length, 1); // vendas por dia ativo
        const estimatedStockoutDays = salesVelocity > 0 ? Math.floor(data.current_stock / salesVelocity) : Infinity;

        return {
          product_id: productId,
          product_name: data.product_name,
          total_sold: data.total_sold,
          sales_velocity: salesVelocity,
          stock_remaining: data.current_stock,
          estimated_stockout_days: estimatedStockoutDays
        };
      });

      setSalesData(salesDataArray);
    } catch (error: any) {
      console.error('Error fetching sales data:', error);
      toast({
        title: "Erro",
        description: "Erro ao buscar dados de vendas: " + error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [currentRestaurant?.id, toast]);

  // Gerar alertas baseados nos dados de vendas
  const generateSalesAlerts = useCallback((): InventoryAlert[] => {
    const alerts: InventoryAlert[] = [];
    const now = new Date();

    salesData.forEach((product) => {
      // Alerta para produtos com vendas muito altas (acima da média + 2 desvios padrão)
      const averageSales = salesData.reduce((sum, p) => sum + p.sales_velocity, 0) / salesData.length;
      const salesStdDev = Math.sqrt(
        salesData.reduce((sum, p) => sum + Math.pow(p.sales_velocity - averageSales, 2), 0) / salesData.length
      );
      
      if (product.sales_velocity > averageSales + (salesStdDev * 1.5) && product.sales_velocity > 2) {
        alerts.push({
          id: `high_sales_${product.product_id}`,
          product_id: product.product_id,
          product_name: product.product_name,
          type: 'high_sales',
          message: `${product.product_name} tem vendas excepcionalmente altas (${product.sales_velocity.toFixed(1)} unidades/dia). Considere aumentar o estoque.`,
          priority: 'medium',
          is_read: false,
          created_at: now.toISOString(),
          action_required: true,
          suggested_quantity: Math.ceil(product.sales_velocity * 7) // Sugerir estoque para 7 dias
        });
      }

      // Alerta para produtos que podem esgotar em breve
      if (product.estimated_stockout_days <= 3 && product.estimated_stockout_days > 0 && product.stock_remaining > 0) {
        alerts.push({
          id: `stockout_warning_${product.product_id}`,
          product_id: product.product_id,
          product_name: product.product_name,
          type: 'out_of_stock',
          message: `${product.product_name} pode esgotar em ${product.estimated_stockout_days} dias com base nas vendas atuais (${product.sales_velocity.toFixed(1)}/dia).`,
          priority: product.estimated_stockout_days <= 1 ? 'critical' : 'high',
          is_read: false,
          created_at: now.toISOString(),
          action_required: true,
          suggested_quantity: Math.ceil(product.sales_velocity * 10) // Sugerir estoque para 10 dias
        });
      }

      // Alerta para produtos com vendas acima do estoque disponível nos próximos dias
      if (product.sales_velocity > 0 && product.stock_remaining < product.sales_velocity * 2) {
        alerts.push({
          id: `urgent_restock_${product.product_id}`,
          product_id: product.product_id,
          product_name: product.product_name,
          type: 'restock_suggestion',
          message: `Reposição urgente necessária para ${product.product_name}. Vendas atuais: ${product.sales_velocity.toFixed(1)}/dia, estoque: ${product.stock_remaining} unidades.`,
          priority: 'high',
          is_read: false,
          created_at: now.toISOString(),
          action_required: true,
          suggested_quantity: Math.ceil(product.sales_velocity * 14) // Sugerir estoque para 2 semanas
        });
      }
    });

    return alerts;
  }, [salesData]);

  // Atualizar alertas quando os dados de vendas mudarem
  useEffect(() => {
    const newAlerts = generateSalesAlerts();
    setSalesAlerts(newAlerts);
  }, [generateSalesAlerts]);

  // Buscar dados iniciais e configurar atualização periódica
  useEffect(() => {
    fetchSalesData();
    
    // Atualizar dados a cada 30 minutos
    const interval = setInterval(fetchSalesData, 30 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [fetchSalesData]);

  return {
    salesData,
    salesAlerts,
    loading,
    refreshSalesData: fetchSalesData,
    generateSalesAlerts
  };
};