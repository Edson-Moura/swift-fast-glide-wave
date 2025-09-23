import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface SubscriptionStatus {
  subscribed: boolean;
  plan: 'free' | 'basic' | 'professional' | 'enterprise';
  product_id: string | null;
  subscription_end: string | null;
}

// Define subscription tiers with pricing and features
export const SUBSCRIPTION_TIERS = {
  free: {
    name: 'Gratuito',
    price: 0,
    priceId: null,
    productId: null,
    features: [
      'Até 1 restaurante',
      'Até 2 usuários',
      'Gestão básica de estoque',
      'Cardápio simples',
      'Suporte por email'
    ],
    limits: {
      restaurants: 1,
      users: 2,
      inventory_items: 50,
      menu_items: 20
    }
  },
  basic: {
    name: 'Básico',
    price: 49,
    priceId: 'price_1SAaS34ol3ZhwS9mlyZIrtmp',
    productId: 'prod_T6o4MnOgGf9wUj',
    features: [
      'Até 1 restaurante',
      'Até 5 usuários',
      'Gestão completa de estoque',
      'Cardápio completo',
      'Relatórios básicos',
      'Suporte prioritário'
    ],
    limits: {
      restaurants: 1,
      users: 5,
      inventory_items: 500,
      menu_items: 100
    }
  },
  professional: {
    name: 'Profissional',
    price: 99,
    priceId: 'price_1SAaSL4ol3ZhwS9mQaV9iose',
    productId: 'prod_T6o4oRwHmsv44O',
    features: [
      'Até 1 restaurante',
      'Usuários ilimitados',
      'Gestão avançada de estoque',
      'Cardápio e preços inteligentes',
      'Relatórios avançados',
      'Gestão de fornecedores',
      'Suporte 24/7'
    ],
    limits: {
      restaurants: 1,
      users: -1, // unlimited
      inventory_items: -1,
      menu_items: -1
    }
  },
  enterprise: {
    name: 'Enterprise',
    price: 199,
    priceId: 'price_1SAaSr4ol3ZhwS9m2Jah8HBK',
    productId: 'prod_T6o5vBOrxJx0D0',
    features: [
      'Restaurantes ilimitados',
      'Usuários ilimitados',
      'Gestão de rede centralizada',
      'Relatórios consolidados',
      'API personalizada',
      'Suporte dedicado',
      'Treinamento incluído'
    ],
    limits: {
      restaurants: -1, // unlimited
      users: -1,
      inventory_items: -1,
      menu_items: -1
    }
  }
};

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>({
    subscribed: false,
    plan: 'free',
    product_id: null,
    subscription_end: null
  });
  const [loading, setLoading] = useState(true);

  const checkSubscription = useCallback(async () => {
    if (!user) {
      setSubscriptionStatus({
        subscribed: false,
        plan: 'free',
        product_id: null,
        subscription_end: null
      });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) {
        console.error('Error checking subscription:', error);
        throw error;
      }

      if (data) {
        setSubscriptionStatus(data);
      }
    } catch (error: any) {
      console.error('Error checking subscription:', error);
      toast({
        title: "Erro ao verificar assinatura",
        description: "Não foi possível verificar o status da sua assinatura.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  const createCheckoutSession = async (priceId: string) => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Você precisa estar logado para assinar um plano.",
        variant: "destructive",
      });
      return null;
    }

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId }
      });

      if (error) {
        console.error('Error creating checkout session:', error);
        throw error;
      }

      return data?.url;
    } catch (error: any) {
      console.error('Error creating checkout session:', error);
      toast({
        title: "Erro ao criar sessão de pagamento",
        description: "Não foi possível criar a sessão de pagamento.",
        variant: "destructive",
      });
      return null;
    }
  };

  const openCustomerPortal = async () => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Você precisa estar logado para gerenciar sua assinatura.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');

      if (error) {
        console.error('Error opening customer portal:', error);
        throw error;
      }

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      console.error('Error opening customer portal:', error);
      toast({
        title: "Erro ao abrir portal do cliente",
        description: "Não foi possível abrir o portal de gerenciamento.",
        variant: "destructive",
      });
    }
  };

  const getCurrentTier = () => {
    return SUBSCRIPTION_TIERS[subscriptionStatus.plan];
  };

  const canAccessFeature = (feature: string) => {
    const currentTier = getCurrentTier();
    
    // Always allow free tier features
    if (subscriptionStatus.plan === 'free') {
      return SUBSCRIPTION_TIERS.free.features.includes(feature);
    }

    // Check if current plan includes the feature
    return currentTier.features.includes(feature);
  };

  const isWithinLimits = (resource: 'restaurants' | 'users' | 'inventory_items' | 'menu_items', currentCount: number) => {
    const currentTier = getCurrentTier();
    const limit = currentTier.limits[resource];
    
    // -1 means unlimited
    if (limit === -1) return true;
    
    return currentCount < limit;
  };

  return {
    subscriptionStatus,
    loading,
    checkSubscription,
    createCheckoutSession,
    openCustomerPortal,
    getCurrentTier,
    canAccessFeature,
    isWithinLimits,
    tiers: SUBSCRIPTION_TIERS
  };
};