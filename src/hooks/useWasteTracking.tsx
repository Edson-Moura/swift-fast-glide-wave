import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useRestaurant } from './useRestaurant';

export interface WasteEntry {
  id?: string;
  restaurant_id?: string;
  inventory_item_id: string;
  quantity_wasted: number;
  unit: string;
  waste_reason: string;
  waste_category: 'expired' | 'preparation_error' | 'spoiled' | 'damaged' | 'other';
  cost_impact: number;
  registered_by: string;
  waste_date: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  inventory_items?: {
    name: string;
    unit: string;
  };
}

export interface WasteStatistics {
  total_waste_cost: number;
  total_items_wasted: number;
  most_wasted_item: string | null;
  most_wasted_item_cost: number | null;
  waste_by_category: any;
  waste_by_reason: any;
  daily_waste_trend: any;
}

export interface WasteSuggestion {
  suggestion_type: string;
  priority: string;
  message: string;
  estimated_savings: number;
}

export const useWasteTracking = () => {
  const [wasteEntries, setWasteEntries] = useState<WasteEntry[]>([]);
  const [statistics, setStatistics] = useState<WasteStatistics | null>(null);
  const [suggestions, setSuggestions] = useState<WasteSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const { currentRestaurant } = useRestaurant();
  const { toast } = useToast();

  const fetchWasteEntries = async (startDate?: string, endDate?: string) => {
    if (!currentRestaurant?.id) return;

    setLoading(true);
    try {
      let query = supabase
        .from('waste_tracking')
        .select('*')
        .eq('restaurant_id', currentRestaurant.id)
        .order('waste_date', { ascending: false });

      if (startDate && endDate) {
        query = query.gte('waste_date', startDate).lte('waste_date', endDate);
      }

      const { data: wasteData, error: wasteError } = await query;
      if (wasteError) throw wasteError;

      // Buscar informações dos itens de inventário separadamente
      if (wasteData && wasteData.length > 0) {
        const itemIds = [...new Set(wasteData.map(item => item.inventory_item_id))];
        const { data: itemsData, error: itemsError } = await supabase
          .from('inventory_items')
          .select('id, name, unit')
          .in('id', itemIds);

        if (itemsError) throw itemsError;

        // Mapear os dados combinando waste_tracking com inventory_items
        const enrichedData = wasteData.map(wasteItem => ({
          ...wasteItem,
          inventory_items: itemsData?.find(item => item.id === wasteItem.inventory_item_id) || {
            name: 'Item não encontrado',
            unit: 'Un.'
          }
        }));

        setWasteEntries(enrichedData as WasteEntry[]);
      } else {
        setWasteEntries([]);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar registros de desperdício",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const addWasteEntry = async (entry: Omit<WasteEntry, 'id' | 'created_at' | 'updated_at' | 'inventory_items'>) => {
    if (!currentRestaurant?.id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('waste_tracking')
        .insert({
          ...entry,
          restaurant_id: currentRestaurant.id,
        })
        .select()
        .single();

      if (error) throw error;

      setWasteEntries(prev => [data as WasteEntry, ...prev]);
      
      toast({
        title: "Desperdício registrado",
        description: "Registro de desperdício adicionado com sucesso.",
      });

      return data;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao registrar desperdício",
        description: error.message,
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async (startDate?: string, endDate?: string) => {
    if (!currentRestaurant?.id) return;

    try {
      const { data, error } = await supabase.rpc('get_waste_statistics', {
        restaurant_id_param: currentRestaurant.id,
        start_date: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end_date: endDate || new Date().toISOString().split('T')[0]
      });

      if (error) throw error;
      if (data && data.length > 0) {
        setStatistics(data[0] as WasteStatistics);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar estatísticas",
        description: error.message,
      });
    }
  };

  const fetchSuggestions = async () => {
    if (!currentRestaurant?.id) return;

    try {
      const { data, error } = await supabase.rpc('generate_waste_reduction_suggestions', {
        restaurant_id_param: currentRestaurant.id
      });

      if (error) throw error;
      setSuggestions(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar sugestões",
        description: error.message,
      });
    }
  };

  const deleteWasteEntry = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('waste_tracking')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setWasteEntries(prev => prev.filter(entry => entry.id !== id));
      
      toast({
        title: "Registro removido",
        description: "Registro de desperdício removido com sucesso.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao remover registro",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentRestaurant?.id) {
      fetchWasteEntries();
      fetchStatistics();
      fetchSuggestions();
    }
  }, [currentRestaurant?.id]);

  return {
    wasteEntries,
    statistics,
    suggestions,
    loading,
    fetchWasteEntries,
    addWasteEntry,
    fetchStatistics,
    fetchSuggestions,
    deleteWasteEntry,
  };
};