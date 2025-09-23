import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRestaurant } from '@/hooks/useRestaurant';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface PricingRule {
  id: string;
  name: string;
  markup_percentage: number;
  min_profit_margin: number;
  category_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ItemPricing {
  id: string;
  item_name: string;
  current_cost: number;
  suggested_price: number;
  current_price?: number;
  profit_margin: number;
  category: string;
  markup_percentage: number;
  supplier: string;
  last_updated: string;
}

export interface PricingSummary {
  total_items: number;
  items_needing_update: number;
  average_margin: number;
  total_potential_revenue: number;
  cost_inflation_trend: number;
}

export const usePriceManagement = () => {
  const { user } = useAuth();
  const { currentRestaurant } = useRestaurant();
  const [pricingData, setPricingData] = useState<ItemPricing[]>([]);
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([]);
  const [summary, setSummary] = useState<PricingSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && currentRestaurant) {
      fetchPricingData();
    }
  }, [user, currentRestaurant]);

  const fetchPricingData = async () => {
    if (!currentRestaurant) return;

    try {
      setLoading(true);
      
      // Fetch inventory items with pricing data
      const { data: items, error: itemsError } = await supabase
        .from('inventory_items')
        .select('*');

      if (itemsError) throw itemsError;

      // Process pricing data
      const pricing = processItemPricing(items || []);
      setPricingData(pricing);

      // Calculate summary
      const summaryData = calculatePricingSummary(pricing);
      setSummary(summaryData);

    } catch (error: any) {
      console.error('Error fetching pricing data:', error);
      toast({
        title: "Erro ao carregar dados de preços",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const processItemPricing = (items: any[]): ItemPricing[] => {
    return items.map(item => {
      const currentCost = Number(item.cost_per_unit || 0);
      const defaultMarkup = 2.5; // 150% markup padrão
      const suggestedPrice = currentCost * defaultMarkup;
      const profitMargin = currentCost > 0 ? ((suggestedPrice - currentCost) / suggestedPrice) * 100 : 0;
      
      return {
        id: item.id,
        item_name: item.name,
        current_cost: currentCost,
        suggested_price: Math.round(suggestedPrice * 100) / 100,
        profit_margin: Math.round(profitMargin * 100) / 100,
        category: item.category || 'Sem Categoria',
        markup_percentage: ((suggestedPrice / currentCost - 1) * 100) || 0,
        supplier: item.supplier || 'N/A',
        last_updated: item.updated_at
      };
    });
  };

  const calculatePricingSummary = (pricing: ItemPricing[]): PricingSummary => {
    const totalItems = pricing.length;
    const itemsNeedingUpdate = pricing.filter(item => 
      item.profit_margin < 20 || item.markup_percentage < 50
    ).length;
    
    const avgMargin = pricing.reduce((sum, item) => sum + item.profit_margin, 0) / totalItems || 0;
    const totalPotentialRevenue = pricing.reduce((sum, item) => sum + item.suggested_price, 0);
    
    return {
      total_items: totalItems,
      items_needing_update: itemsNeedingUpdate,
      average_margin: Math.round(avgMargin * 100) / 100,
      total_potential_revenue: Math.round(totalPotentialRevenue * 100) / 100,
      cost_inflation_trend: 2.5 // Simulado - seria calculado com base em histórico
    };
  };

  const updateItemPrice = async (itemId: string, newPrice: number) => {
    try {
      // Em um sistema real, você teria uma tabela de preços separada
      // Por enquanto, vamos simular a atualização
      
      setPricingData(current => 
        current.map(item => 
          item.id === itemId 
            ? {
                ...item,
                current_price: newPrice,
                profit_margin: item.current_cost > 0 
                  ? ((newPrice - item.current_cost) / newPrice) * 100 
                  : 0
              }
            : item
        )
      );

      toast({
        title: "Preço atualizado",
        description: "O preço do item foi atualizado com sucesso.",
      });

    } catch (error: any) {
      console.error('Error updating price:', error);
      toast({
        title: "Erro ao atualizar preço",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const recalculateAllPrices = async (globalMarkup?: number) => {
    try {
      const markup = globalMarkup || 2.5;
      
      setPricingData(current => 
        current.map(item => {
          const newSuggestedPrice = item.current_cost * markup;
          const newProfitMargin = item.current_cost > 0 
            ? ((newSuggestedPrice - item.current_cost) / newSuggestedPrice) * 100 
            : 0;
          
          return {
            ...item,
            suggested_price: Math.round(newSuggestedPrice * 100) / 100,
            profit_margin: Math.round(newProfitMargin * 100) / 100,
            markup_percentage: ((markup - 1) * 100)
          };
        })
      );

      toast({
        title: "Preços recalculados",
        description: `Todos os preços foram recalculados com markup de ${((markup - 1) * 100).toFixed(1)}%.`,
      });

    } catch (error: any) {
      console.error('Error recalculating prices:', error);
      toast({
        title: "Erro ao recalcular preços",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const applyPricingRuleByCategory = async (categoryName: string, markup: number) => {
    try {
      setPricingData(current => 
        current.map(item => {
          if (item.category === categoryName) {
            const newSuggestedPrice = item.current_cost * markup;
            const newProfitMargin = item.current_cost > 0 
              ? ((newSuggestedPrice - item.current_cost) / newSuggestedPrice) * 100 
              : 0;
            
            return {
              ...item,
              suggested_price: Math.round(newSuggestedPrice * 100) / 100,
              profit_margin: Math.round(newProfitMargin * 100) / 100,
              markup_percentage: ((markup - 1) * 100)
            };
          }
          return item;
        })
      );

      toast({
        title: "Regra aplicada",
        description: `Preços da categoria "${categoryName}" foram atualizados.`,
      });

    } catch (error: any) {
      console.error('Error applying pricing rule:', error);
      toast({
        title: "Erro ao aplicar regra",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return {
    pricingData,
    pricingRules,
    summary,
    loading,
    updateItemPrice,
    recalculateAllPrices,
    applyPricingRuleByCategory,
    refetch: fetchPricingData
  };
};