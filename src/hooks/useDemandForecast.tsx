import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useRestaurant } from '@/hooks/useRestaurant';
import { useToast } from '@/components/ui/use-toast';

export interface DemandForecast {
  product_id: string;
  product_name: string;
  current_stock: number;
  daily_consumption_avg: number;
  weekly_consumption_avg: number;
  monthly_consumption_avg: number;
  predicted_stockout_date: string | null;
  days_until_stockout: number;
  suggested_reorder_quantity: number;
  confidence_level: 'high' | 'medium' | 'low';
  trend: 'increasing' | 'stable' | 'decreasing';
  seasonality_factor: number;
}

export interface HistoricalSales {
  date: string;
  product_id: string;
  product_name: string;
  quantity_sold: number;
  revenue: number;
  day_of_week: string;
  week_of_year: number;
  month: number;
}

export interface DemandTrend {
  product_id: string;
  product_name: string;
  trend_direction: 'up' | 'down' | 'stable';
  trend_percentage: number;
  period: 'weekly' | 'monthly';
  last_updated: string;
}

export const useDemandForecast = () => {
  const [demandForecasts, setDemandForecasts] = useState<DemandForecast[]>([]);
  const [historicalSales, setHistoricalSales] = useState<HistoricalSales[]>([]);
  const [demandTrends, setDemandTrends] = useState<DemandTrend[]>([]);
  const [loading, setLoading] = useState(false);
  const { currentRestaurant } = useRestaurant();
  const { toast } = useToast();

  // Buscar dados históricos de vendas dos últimos 90 dias
  const fetchHistoricalSales = useCallback(async () => {
    if (!currentRestaurant?.id) return;

    try {
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      const { data: consumptionData, error } = await supabase
        .from('consumption_history')
        .select(`
          date,
          item_id,
          quantity,
          inventory_items(name, current_stock, cost_per_unit)
        `)
        .eq('restaurant_id', currentRestaurant.id)
        .gte('date', ninetyDaysAgo.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (error) throw error;

      const salesData: HistoricalSales[] = consumptionData?.map((record) => {
        const date = new Date(record.date);
        const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
        
        return {
          date: record.date,
          product_id: record.item_id,
          product_name: (record as any).inventory_items?.name || 'Produto',
          quantity_sold: record.quantity,
          revenue: record.quantity * ((record as any).inventory_items?.cost_per_unit || 0),
          day_of_week: dayNames[date.getDay()],
          week_of_year: Math.ceil((date.getDate() - date.getDay() + 1) / 7),
          month: date.getMonth() + 1
        };
      }) || [];

      setHistoricalSales(salesData);
      return salesData;
    } catch (error: any) {
      console.error('Error fetching historical sales:', error);
      toast({
        title: "Erro",
        description: "Erro ao buscar histórico de vendas: " + error.message,
        variant: "destructive"
      });
      return [];
    }
  }, [currentRestaurant?.id, toast]);

  // Calcular previsões de demanda baseadas nos dados históricos
  const calculateDemandForecasts = useCallback((salesData: HistoricalSales[]) => {
    const productForecasts = new Map<string, {
      product_name: string;
      daily_sales: number[];
      weekly_sales: number[];
      monthly_sales: number[];
      current_stock: number;
      recent_trend: number[];
    }>();

    // Agrupar vendas por produto
    salesData.forEach((sale) => {
      if (!productForecasts.has(sale.product_id)) {
        productForecasts.set(sale.product_id, {
          product_name: sale.product_name,
          daily_sales: [],
          weekly_sales: [],
          monthly_sales: [],
          current_stock: 0,
          recent_trend: []
        });
      }

      const productData = productForecasts.get(sale.product_id)!;
      productData.daily_sales.push(sale.quantity_sold);
      
      // Agregar por semana e mês será feito posteriormente
    });

    // Buscar estoque atual
    const getProductStock = async (productId: string) => {
      const { data } = await supabase
        .from('inventory_items')
        .select('current_stock')
        .eq('id', productId)
        .single();
      
      return data?.current_stock || 0;
    };

    // Calcular previsões para cada produto
    const forecasts: DemandForecast[] = Array.from(productForecasts.entries()).map(([productId, data]) => {
      // Calcular médias
      const dailyAvg = data.daily_sales.length > 0 
        ? data.daily_sales.reduce((sum, sale) => sum + sale, 0) / data.daily_sales.length 
        : 0;
      
      const weeklyAvg = dailyAvg * 7;
      const monthlyAvg = dailyAvg * 30;

      // Calcular tendência (últimos 30 dias vs 30 dias anteriores)
      const recentSales = data.daily_sales.slice(-30);
      const previousSales = data.daily_sales.slice(-60, -30);
      
      const recentAvg = recentSales.length > 0 
        ? recentSales.reduce((sum, sale) => sum + sale, 0) / recentSales.length 
        : 0;
      
      const previousAvg = previousSales.length > 0 
        ? previousSales.reduce((sum, sale) => sum + sale, 0) / previousSales.length 
        : 0;

      let trend: 'increasing' | 'stable' | 'decreasing' = 'stable';
      if (recentAvg > previousAvg * 1.1) trend = 'increasing';
      else if (recentAvg < previousAvg * 0.9) trend = 'decreasing';

      // Calcular fator de sazonalidade (simples - baseado no dia da semana)
      const seasonalityFactor = 1.0; // Por enquanto, sem sazonalidade complexa

      // Estimar dias até esgotamento
      const currentStock = data.current_stock || 0;
      const adjustedDailyConsumption = dailyAvg * seasonalityFactor;
      const daysUntilStockout = adjustedDailyConsumption > 0 
        ? Math.floor(currentStock / adjustedDailyConsumption) 
        : Infinity;

      // Data prevista de esgotamento
      const stockoutDate = daysUntilStockout < Infinity 
        ? new Date(Date.now() + daysUntilStockout * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        : null;

      // Quantidade sugerida para reposição (baseada em consumo de 14 dias + margem de segurança)
      const suggestedQuantity = Math.ceil(adjustedDailyConsumption * 14 * 1.2);

      // Nível de confiança baseado na quantidade de dados
      let confidenceLevel: 'high' | 'medium' | 'low' = 'low';
      if (data.daily_sales.length > 60) confidenceLevel = 'high';
      else if (data.daily_sales.length > 30) confidenceLevel = 'medium';

      return {
        product_id: productId,
        product_name: data.product_name,
        current_stock: currentStock,
        daily_consumption_avg: dailyAvg,
        weekly_consumption_avg: weeklyAvg,
        monthly_consumption_avg: monthlyAvg,
        predicted_stockout_date: stockoutDate,
        days_until_stockout: daysUntilStockout === Infinity ? -1 : daysUntilStockout,
        suggested_reorder_quantity: suggestedQuantity,
        confidence_level: confidenceLevel,
        trend,
        seasonality_factor: seasonalityFactor
      };
    });

    return forecasts;
  }, []);

  // Atualizar previsões
  const updateForecasts = useCallback(async () => {
    setLoading(true);
    try {
      const salesData = await fetchHistoricalSales();
      if (salesData && salesData.length > 0) {
        const forecasts = calculateDemandForecasts(salesData);
        
        // Buscar estoque atual para cada produto
        const stockPromises = forecasts.map(async (forecast) => {
          const { data } = await supabase
            .from('inventory_items')
            .select('current_stock')
            .eq('id', forecast.product_id)
            .single();
          
          return {
            ...forecast,
            current_stock: data?.current_stock || 0
          };
        });

        const forecastsWithStock = await Promise.all(stockPromises);
        setDemandForecasts(forecastsWithStock);

        // Calcular tendências de demanda
        const trends: DemandTrend[] = forecastsWithStock.map(forecast => ({
          product_id: forecast.product_id,
          product_name: forecast.product_name,
          trend_direction: forecast.trend === 'increasing' ? 'up' : 
                          forecast.trend === 'decreasing' ? 'down' : 'stable',
          trend_percentage: 0, // Calcular baseado nos dados
          period: 'weekly',
          last_updated: new Date().toISOString()
        }));

        setDemandTrends(trends);
      }
    } catch (error: any) {
      console.error('Error updating forecasts:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar previsões: " + error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [fetchHistoricalSales, calculateDemandForecasts, toast]);

  // Buscar produtos com maior demanda
  const getHighDemandProducts = useCallback((limit: number = 10) => {
    return demandForecasts
      .filter(forecast => forecast.daily_consumption_avg > 0)
      .sort((a, b) => b.daily_consumption_avg - a.daily_consumption_avg)
      .slice(0, limit);
  }, [demandForecasts]);

  // Buscar produtos com risco de esgotamento
  const getCriticalStockProducts = useCallback((daysThreshold: number = 7) => {
    return demandForecasts
      .filter(forecast => 
        forecast.days_until_stockout > 0 && 
        forecast.days_until_stockout <= daysThreshold
      )
      .sort((a, b) => a.days_until_stockout - b.days_until_stockout);
  }, [demandForecasts]);

  // Atualizar dados inicialmente e a cada hora
  useEffect(() => {
    updateForecasts();
    
    // Atualizar a cada hora
    const interval = setInterval(updateForecasts, 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [updateForecasts]);

  return {
    demandForecasts,
    historicalSales,
    demandTrends,
    loading,
    updateForecasts,
    getHighDemandProducts,
    getCriticalStockProducts
  };
};