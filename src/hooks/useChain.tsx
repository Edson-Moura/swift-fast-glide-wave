import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface RestaurantChain {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  headquarters_address: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  admin_user_id: string;
  created_at: string;
  updated_at: string;
}

interface ChainRestaurant {
  id: string;
  name: string;
  chain_id: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  description: string | null;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  font_family: string;
  created_at: string;
  updated_at: string;
}

interface ChainStats {
  totalRestaurants: number;
  totalInventoryValue: number;
  totalMenuItems: number;
  avgProfitMargin: number;
  totalLowStockItems: number;
}

export const useChain = () => {
  const { user } = useAuth();
  const [chains, setChains] = useState<RestaurantChain[]>([]);
  const [currentChain, setCurrentChain] = useState<RestaurantChain | null>(null);
  const [chainRestaurants, setChainRestaurants] = useState<ChainRestaurant[]>([]);
  const [chainStats, setChainStats] = useState<ChainStats>({
    totalRestaurants: 0,
    totalInventoryValue: 0,
    totalMenuItems: 0,
    avgProfitMargin: 0,
    totalLowStockItems: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserChains();
    } else {
      setChains([]);
      setCurrentChain(null);
      setChainRestaurants([]);
      setLoading(false);
    }
  }, [user]);

  const fetchUserChains = async () => {
    if (!user) return;

    try {
      // Buscar chains onde o usuário é admin
      const { data: adminChains, error: adminError } = await supabase
        .from('restaurant_chains')
        .select('*')
        .eq('admin_user_id', user.id);

      if (adminError) throw adminError;

      // Buscar chains onde o usuário é membro de algum restaurante
      const { data: memberChains, error: memberError } = await supabase
        .from('restaurant_chains')
        .select(`
          *,
          restaurants!inner (
            restaurant_members!inner (
              user_id
            )
          )
        `)
        .eq('restaurants.restaurant_members.user_id', user.id);

      if (memberError) throw memberError;

      // Combinar e remover duplicatas
      const allChains = [...(adminChains || []), ...(memberChains || [])];
      const uniqueChains = allChains.filter((chain, index, self) => 
        index === self.findIndex(c => c.id === chain.id)
      );

      setChains(uniqueChains);

      // Definir chain atual
      if (uniqueChains.length > 0) {
        setCurrentChain(uniqueChains[0]);
        await fetchChainRestaurants(uniqueChains[0].id);
        await fetchChainStats(uniqueChains[0].id);
      }
    } catch (error: any) {
      console.error('Error fetching chains:', error);
      toast({
        title: "Erro ao carregar redes",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchChainRestaurants = async (chainId: string) => {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('chain_id', chainId)
        .order('name');

      if (error) throw error;
      setChainRestaurants(data || []);
    } catch (error: any) {
      console.error('Error fetching chain restaurants:', error);
    }
  };

  const fetchChainStats = async (chainId: string) => {
    try {
      // Buscar resumo de inventário
      const { data: inventoryData, error: inventoryError } = await supabase
        .rpc('get_chain_inventory_summary', { chain_id_param: chainId });

      if (inventoryError) throw inventoryError;

      // Buscar performance do menu
      const { data: menuData, error: menuError } = await supabase
        .rpc('get_chain_menu_performance', { chain_id_param: chainId });

      if (menuError) throw menuError;

      // Calcular estatísticas
      const totalRestaurants = chainRestaurants.length;
      const totalInventoryValue = inventoryData?.reduce((sum: number, item: any) => sum + Number(item.total_value), 0) || 0;
      const totalMenuItems = menuData?.reduce((sum: number, item: any) => sum + item.total_menu_items, 0) || 0;
      const avgProfitMargin = menuData?.reduce((sum: number, item: any) => sum + Number(item.avg_profit_margin), 0) / (menuData?.length || 1) || 0;
      const totalLowStockItems = inventoryData?.reduce((sum: number, item: any) => sum + item.low_stock_items, 0) || 0;

      setChainStats({
        totalRestaurants,
        totalInventoryValue,
        totalMenuItems,
        avgProfitMargin,
        totalLowStockItems
      });
    } catch (error: any) {
      console.error('Error fetching chain stats:', error);
    }
  };

  const createChain = async (chainData: Omit<RestaurantChain, 'id' | 'created_at' | 'updated_at' | 'admin_user_id'>) => {
    if (!user) {
      return { error: 'User not authenticated' };
    }

    try {
      const { data, error } = await supabase
        .from('restaurant_chains')
        .insert({ ...chainData, admin_user_id: user.id })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Rede criada",
        description: "Sua rede de restaurantes foi criada com sucesso!",
      });

      await fetchUserChains();
      return { data, error: null };
    } catch (error: any) {
      console.error('Error creating chain:', error);
      toast({
        title: "Erro ao criar rede",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const updateChain = async (chainId: string, chainData: Partial<RestaurantChain>) => {
    try {
      const { error } = await supabase
        .from('restaurant_chains')
        .update(chainData)
        .eq('id', chainId);

      if (error) throw error;

      toast({
        title: "Rede atualizada",
        description: "As informações da rede foram atualizadas com sucesso!",
      });

      await fetchUserChains();
      return { error: null };
    } catch (error: any) {
      console.error('Error updating chain:', error);
      toast({
        title: "Erro ao atualizar rede",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const addRestaurantToChain = async (restaurantId: string, chainId: string) => {
    try {
      const { error } = await supabase
        .from('restaurants')
        .update({ chain_id: chainId })
        .eq('id', restaurantId);

      if (error) throw error;

      toast({
        title: "Restaurante adicionado",
        description: "O restaurante foi adicionado à rede com sucesso!",
      });

      await fetchChainRestaurants(chainId);
      await fetchChainStats(chainId);
      return { error: null };
    } catch (error: any) {
      console.error('Error adding restaurant to chain:', error);
      toast({
        title: "Erro ao adicionar restaurante",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const removeRestaurantFromChain = async (restaurantId: string) => {
    try {
      const { error } = await supabase
        .from('restaurants')
        .update({ chain_id: null })
        .eq('id', restaurantId);

      if (error) throw error;

      toast({
        title: "Restaurante removido",
        description: "O restaurante foi removido da rede.",
      });

      if (currentChain) {
        await fetchChainRestaurants(currentChain.id);
        await fetchChainStats(currentChain.id);
      }
      return { error: null };
    } catch (error: any) {
      console.error('Error removing restaurant from chain:', error);
      toast({
        title: "Erro ao remover restaurante",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const switchChain = async (chainId: string) => {
    const chain = chains.find(c => c.id === chainId);
    if (chain) {
      setCurrentChain(chain);
      await fetchChainRestaurants(chainId);
      await fetchChainStats(chainId);
    }
  };

  const canManageChain = currentChain && currentChain.admin_user_id === user?.id;

  return {
    chains,
    currentChain,
    chainRestaurants,
    chainStats,
    loading,
    createChain,
    updateChain,
    addRestaurantToChain,
    removeRestaurantFromChain,
    switchChain,
    canManageChain,
    refetch: fetchUserChains,
  };
};