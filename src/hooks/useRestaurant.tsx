import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Restaurant {
  id: string;
  name: string;
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

interface RestaurantMember {
  id: string;
  user_id: string;
  restaurant_id: string;
  role: 'admin' | 'manager' | 'chef' | 'staff' | 'inventory';
  created_at: string;
}

export const useRestaurant = () => {
  const { user } = useAuth();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [currentRestaurant, setCurrentRestaurant] = useState<Restaurant | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [members, setMembers] = useState<RestaurantMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserRestaurants();
    } else {
      setRestaurants([]);
      setCurrentRestaurant(null);
      setUserRole(null);
      setMembers([]);
      setLoading(false);
    }
  }, [user]);

  const fetchUserRestaurants = async () => {
    if (!user) return;

    try {
      // Fetch user's restaurant memberships with restaurant data
      const { data: memberships, error } = await supabase
        .from('restaurant_members')
        .select(`
          *,
          restaurants (*)
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      const userRestaurants = memberships?.map(m => m.restaurants).filter(Boolean) || [];
      setRestaurants(userRestaurants);

      // Set current restaurant to the first one (you can implement restaurant switching later)
      if (userRestaurants.length > 0) {
        setCurrentRestaurant(userRestaurants[0]);
        const userMembership = memberships?.find(m => m.restaurants?.id === userRestaurants[0].id);
        setUserRole(userMembership?.role || null);
        
        // Fetch restaurant members
        await fetchRestaurantMembers(userRestaurants[0].id);
      }
    } catch (error: any) {
      console.error('Error fetching restaurants:', error);
      toast({
        title: "Erro ao carregar restaurantes",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRestaurantMembers = async (restaurantId: string) => {
    try {
      const { data, error } = await supabase
        .from('restaurant_members')
        .select('*')
        .eq('restaurant_id', restaurantId);

      if (error) throw error;
      setMembers((data || []) as RestaurantMember[]);
    } catch (error: any) {
      console.error('Error fetching members:', error);
    }
  };

  const createRestaurant = async (restaurantData: Omit<Restaurant, 'id' | 'created_at' | 'updated_at'>) => {
    console.log('User authentication status:', { user: !!user, userId: user?.id });
    
    if (!user) {
      console.error('User not authenticated');
      return { error: 'User not authenticated' };
    }

    try {
      console.log('Creating restaurant with data:', restaurantData);
      
      // Create restaurant (trigger will add user as admin automatically)
      const { error: restaurantError } = await supabase
        .from('restaurants')
        .insert(restaurantData);

      if (restaurantError) throw restaurantError;

      toast({
        title: "Restaurante criado",
        description: "Seu restaurante foi configurado com sucesso!",
      });

      // Refresh data
      await fetchUserRestaurants();
      
      return { data: null, error: null };
    } catch (error: any) {
      console.error('Error creating restaurant:', error);
      toast({
        title: "Erro ao criar restaurante",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const inviteMember = async (email: string, role: RestaurantMember['role']) => {
    if (!currentRestaurant || !['admin', 'manager'].includes(userRole || '')) {
      return { error: 'Unauthorized' };
    }

    try {
      // This would typically send an invitation email
      // For now, we'll just show a success message
      toast({
        title: "Convite enviado",
        description: `Convite para ${email} como ${role} foi enviado.`,
      });

      return { error: null };
    } catch (error: any) {
      console.error('Error inviting member:', error);
      toast({
        title: "Erro ao enviar convite",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const updateMemberRole = async (memberId: string, newRole: RestaurantMember['role']) => {
    if (!currentRestaurant || !['admin', 'manager'].includes(userRole || '')) {
      return { error: 'Unauthorized' };
    }

    try {
      const { error } = await supabase
        .from('restaurant_members')
        .update({ role: newRole })
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: "Role atualizado",
        description: "As permissões do membro foram atualizadas.",
      });

      // Refresh members
      await fetchRestaurantMembers(currentRestaurant.id);
      
      return { error: null };
    } catch (error: any) {
      console.error('Error updating member role:', error);
      toast({
        title: "Erro ao atualizar role",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const removeMember = async (memberId: string) => {
    if (!currentRestaurant || !['admin', 'manager'].includes(userRole || '')) {
      return { error: 'Unauthorized' };
    }

    try {
      const { error } = await supabase
        .from('restaurant_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: "Membro removido",
        description: "O membro foi removido do restaurante.",
      });

      // Refresh members
      await fetchRestaurantMembers(currentRestaurant.id);
      
      return { error: null };
    } catch (error: any) {
      console.error('Error removing member:', error);
      toast({
        title: "Erro ao remover membro",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const canManageMembers = ['admin', 'manager'].includes(userRole || '');
  const canManageRestaurant = userRole === 'admin';

  return {
    restaurants,
    currentRestaurant,
    userRole,
    members,
    loading,
    createRestaurant,
    inviteMember,
    updateMemberRole,
    removeMember,
    canManageMembers,
    canManageRestaurant,
    refetch: fetchUserRestaurants,
  };
};