import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useRestaurant } from './useRestaurant';
import { toast } from '@/hooks/use-toast';

export interface MenuItem {
  id: string;
  restaurant_id: string;
  name: string;
  description?: string;
  category: string;
  sale_price: number;
  cost_price: number;
  profit_margin: number;
  is_available: boolean;
  preparation_time?: number;
  created_at: string;
  updated_at: string;
}

export interface MenuItemIngredient {
  id: string;
  menu_item_id: string;
  inventory_item_id: string;
  quantity_needed: number;
  unit: string;
  created_at: string;
  inventory_items?: {
    name: string;
    unit: string;
    cost_per_unit: number;
    current_stock: number;
  };
}

export interface MenuSuggestion {
  id: string;
  restaurant_id: string;
  menu_item_id: string;
  suggestion_type: 'low_stock' | 'out_of_stock' | 'high_cost' | 'optimize_price';
  message: string;
  priority: 'low' | 'medium' | 'high';
  is_resolved: boolean;
  created_at: string;
  resolved_at?: string;
  menu_items?: {
    name: string;
  };
}

export const useMenu = () => {
  const { user } = useAuth();
  const { currentRestaurant } = useRestaurant();
  const queryClient = useQueryClient();

  const { data: menuItems, isLoading: loadingMenuItems } = useQuery({
    queryKey: ['menu-items', currentRestaurant?.id],
    queryFn: async () => {
      if (!currentRestaurant?.id) return [];
      
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('restaurant_id', currentRestaurant.id)
        .order('category', { ascending: true });

      if (error) throw error;
      return data as MenuItem[];
    },
    enabled: !!currentRestaurant?.id,
  });

  const { data: menuSuggestions, isLoading: loadingSuggestions } = useQuery({
    queryKey: ['menu-suggestions', currentRestaurant?.id],
    queryFn: async () => {
      if (!currentRestaurant?.id) return [];
      
      const { data, error } = await supabase
        .from('menu_suggestions')
        .select(`
          *,
          menu_items (name)
        `)
        .eq('restaurant_id', currentRestaurant.id)
        .eq('is_resolved', false)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as MenuSuggestion[];
    },
    enabled: !!currentRestaurant?.id,
  });

  const createMenuItemMutation = useMutation({
    mutationFn: async (itemData: Omit<MenuItem, 'id' | 'created_at' | 'updated_at' | 'cost_price' | 'profit_margin' | 'restaurant_id'>) => {
      const { data, error } = await supabase
        .from('menu_items')
        .insert([{
          ...itemData,
          restaurant_id: currentRestaurant?.id,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-items'] });
      toast({
        title: "Prato adicionado!",
        description: "O prato foi adicionado ao cardápio com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao adicionar prato",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMenuItemMutation = useMutation({
    mutationFn: async ({ id, ...updateData }: Partial<MenuItem> & { id: string }) => {
      const { data, error } = await supabase
        .from('menu_items')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-items'] });
      toast({
        title: "Prato atualizado!",
        description: "As alterações foram salvas com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar prato",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMenuItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-items'] });
      toast({
        title: "Prato removido",
        description: "O prato foi removido do cardápio com sucesso.",
      });
    },
  });

  const getMenuItemIngredients = useQuery({
    queryKey: ['menu-item-ingredients'],
    queryFn: async () => {
      if (!currentRestaurant?.id) return [];
      
      const { data, error } = await supabase
        .from('menu_item_ingredients')
        .select(`
          *,
          inventory_items (name, unit, cost_per_unit, current_stock)
        `)
        .eq('menu_items.restaurant_id', currentRestaurant.id);

      if (error) throw error;
      return data as MenuItemIngredient[];
    },
    enabled: !!currentRestaurant?.id,
  });

  const addIngredientToMenuItemMutation = useMutation({
    mutationFn: async (data: Omit<MenuItemIngredient, 'id' | 'created_at'>) => {
      const { data: result, error } = await supabase
        .from('menu_item_ingredients')
        .insert([data])
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-item-ingredients'] });
      queryClient.invalidateQueries({ queryKey: ['menu-items'] });
      toast({
        title: "Ingrediente adicionado!",
        description: "O ingrediente foi vinculado ao prato com sucesso.",
      });
    },
  });

  const removeIngredientFromMenuItemMutation = useMutation({
    mutationFn: async (ingredientId: string) => {
      const { error } = await supabase
        .from('menu_item_ingredients')
        .delete()
        .eq('id', ingredientId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-item-ingredients'] });
      queryClient.invalidateQueries({ queryKey: ['menu-items'] });
      toast({
        title: "Ingrediente removido",
        description: "O ingrediente foi removido do prato com sucesso.",
      });
    },
  });

  const generateSuggestionsMutation = useMutation({
    mutationFn: async () => {
      if (!currentRestaurant?.id) throw new Error('Restaurante não encontrado');
      
      const { error } = await supabase.rpc('generate_menu_suggestions', {
        restaurant_id_param: currentRestaurant.id
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-suggestions'] });
      queryClient.invalidateQueries({ queryKey: ['menu-items'] });
      toast({
        title: "Sugestões atualizadas!",
        description: "As sugestões do cardápio foram atualizadas com base no estoque atual.",
      });
    },
  });

  const resolveSuggestionMutation = useMutation({
    mutationFn: async (suggestionId: string) => {
      const { error } = await supabase
        .from('menu_suggestions')
        .update({ 
          is_resolved: true,
          resolved_at: new Date().toISOString()
        })
        .eq('id', suggestionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-suggestions'] });
      toast({
        title: "Sugestão resolvida",
        description: "A sugestão foi marcada como resolvida.",
      });
    },
  });

  return {
    menuItems: menuItems || [],
    menuSuggestions: menuSuggestions || [],
    menuItemIngredients: getMenuItemIngredients.data || [],
    isLoading: loadingMenuItems || loadingSuggestions,
    createMenuItem: createMenuItemMutation.mutate,
    updateMenuItem: updateMenuItemMutation.mutate,
    deleteMenuItem: deleteMenuItemMutation.mutate,
    addIngredientToMenuItem: addIngredientToMenuItemMutation.mutate,
    removeIngredientFromMenuItem: removeIngredientFromMenuItemMutation.mutate,
    generateSuggestions: generateSuggestionsMutation.mutate,
    resolveSuggestion: resolveSuggestionMutation.mutate,
    isCreating: createMenuItemMutation.isPending,
    isUpdating: updateMenuItemMutation.isPending,
    isDeleting: deleteMenuItemMutation.isPending,
  };
};