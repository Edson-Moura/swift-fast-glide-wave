import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useRestaurant } from '@/hooks/useRestaurant';

export interface Product {
  id: string;
  name: string;
  category: string;
  category_name?: string;
  current_stock: number;
  min_stock: number;
  max_stock?: number;
  unit: string;
  cost_per_unit: number;
  supplier_id?: string;
  supplier_name?: string;
  expiry_date?: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface StockMovement {
  id: string;
  product_id: string;
  product_name: string;
  type: 'entrada' | 'saida' | 'ajuste';
  quantity: number;
  unit_cost?: number;
  total_cost?: number;
  reason: string;
  reference?: string;
  date: string;
  created_at: string;
}

export interface InventoryAlert {
  id: string;
  product_id: string;
  product_name: string;
  type: 'low_stock' | 'expired' | 'expiring_soon' | 'restock_suggestion' | 'high_sales' | 'out_of_stock';
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  is_read: boolean;
  created_at: string;
  action_required?: boolean;
  suggested_quantity?: number;
  expiry_date?: string;
}

export const useInventory = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [alerts, setAlerts] = useState<InventoryAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  const { currentRestaurant } = useRestaurant();

  // Calculate stats
  const stats = {
    totalProducts: products.length,
    activeProducts: products.filter(p => p.current_stock > 0).length,
    totalValue: products.reduce((sum, p) => sum + (p.current_stock * p.cost_per_unit), 0),
    lowStockCount: products.filter(p => p.current_stock <= p.min_stock).length,
  };

  const lowStockItems = products.filter(p => p.current_stock <= p.min_stock);

  // Fetch all data
  const fetchProducts = async () => {
    if (!currentRestaurant?.id) return;

    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('restaurant_id', currentRestaurant.id)
        .order('name');

      if (error) throw error;

      const productsData: Product[] = data?.map(item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        current_stock: item.current_stock,
        min_stock: item.min_stock,
        max_stock: item.max_stock,
        unit: item.unit,
        cost_per_unit: item.cost_per_unit,
        supplier_id: item.supplier_id,
        created_at: item.created_at,
        updated_at: item.updated_at
      })) || [];

      setProducts(productsData);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const fetchCategories = async () => {
    if (!currentRestaurant?.id) return;

    try {
      // Get unique categories from products
      const uniqueCategories = [...new Set(products.map(p => p.category))];
      const categoriesData: Category[] = uniqueCategories.map(cat => ({
        id: cat,
        name: cat,
        created_at: new Date().toISOString()
      }));

      setCategories(categoriesData);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const fetchAlerts = async () => {
    if (!currentRestaurant?.id) return;

    try {
      const { data, error } = await supabase
        .from('alerts')
        .select(`
          *,
          inventory_items(name)
        `)
        .eq('restaurant_id', currentRestaurant.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const alertsData: InventoryAlert[] = data?.map(alert => ({
        id: alert.id,
        product_id: alert.item_id || '',
        product_name: (alert.inventory_items as any)?.name || 'Produto desconhecido',
        type: alert.type as any,
        message: alert.message,
        priority: 'medium' as any,
        is_read: alert.is_read,
        created_at: alert.created_at
      })) || [];

      setAlerts(alertsData);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // Add new product
  const addProduct = async (productData: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'supplier_name'>) => {
    if (!currentRestaurant?.id) return;

    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .insert({
          name: productData.name,
          category: productData.category,
          current_stock: productData.current_stock,
          min_stock: productData.min_stock,
          max_stock: productData.max_stock,
          unit: productData.unit,
          cost_per_unit: productData.cost_per_unit,
          supplier_id: productData.supplier_id,
          restaurant_id: currentRestaurant.id
        })
        .select()
        .single();

      if (error) throw error;

      await fetchProducts();
      
      toast({
        title: "Sucesso",
        description: "Produto adicionado com sucesso!"
      });

      return data;
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  // Update product
  const updateProduct = async (id: string, productData: Partial<Product>) => {
    try {
      const { error } = await supabase
        .from('inventory_items')
        .update({
          name: productData.name,
          category: productData.category,
          current_stock: productData.current_stock,
          min_stock: productData.min_stock,
          max_stock: productData.max_stock,
          unit: productData.unit,
          cost_per_unit: productData.cost_per_unit,
          supplier_id: productData.supplier_id,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      await fetchProducts();
      
      toast({
        title: "Sucesso",
        description: "Produto atualizado com sucesso!"
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  // Delete product
  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('inventory_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchProducts();
      
      toast({
        title: "Sucesso",
        description: "Produto removido com sucesso!"
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  // Add stock movement
  const addStockMovement = async (movement: {
    product_id: string;
    type: 'entrada' | 'saida' | 'ajuste';
    quantity: number;
    unit_cost?: number;
    reason: string;
    reference?: string;
  }) => {
    if (!currentRestaurant?.id) return;

    try {
      // Get current product stock
      const product = products.find(p => p.id === movement.product_id);
      if (!product) throw new Error('Produto não encontrado');

      let newStock = product.current_stock;
      
      switch (movement.type) {
        case 'entrada':
          newStock += movement.quantity;
          break;
        case 'saida':
          newStock -= movement.quantity;
          break;
        case 'ajuste':
          newStock = movement.quantity; // For adjustments, quantity is the new total
          break;
      }

      // Update product stock
      await updateProduct(movement.product_id, { current_stock: newStock });

      // Record movement in consumption_history if it's a consumption
      if (movement.type === 'saida') {
        await supabase
          .from('consumption_history')
          .insert({
            item_id: movement.product_id,
            quantity: movement.quantity,
            date: new Date().toISOString().split('T')[0],
            restaurant_id: currentRestaurant.id
          });
      }

      toast({
        title: "Sucesso",
        description: "Movimentação registrada com sucesso!"
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  // Mark alert as read
  const markAlertAsRead = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('alerts')
        .update({ is_read: true })
        .eq('id', alertId);

      if (error) throw error;

      setAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, is_read: true } : alert
      ));
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!currentRestaurant?.id) return;
      
      setLoading(true);
      try {
        await Promise.all([
          fetchProducts(),
          fetchAlerts()
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentRestaurant?.id]);

  useEffect(() => {
    if (products.length > 0) {
      fetchCategories();
    }
  }, [products]);

  return {
    products,
    categories,
    movements,
    alerts,
    loading,
    stats,
    lowStockItems,
    addProduct,
    updateProduct,
    deleteProduct,
    addStockMovement,
    markAlertAsRead,
    refetch: () => Promise.all([fetchProducts(), fetchAlerts()])
  };
};