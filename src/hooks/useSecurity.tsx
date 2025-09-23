import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useRestaurant } from '@/hooks/useRestaurant';
import { toast } from '@/hooks/use-toast';

export interface BackupSettings {
  id: string;
  restaurant_id: string;
  auto_backup_enabled: boolean;
  backup_frequency: number;
  retention_days: number;
  backup_types: string[];
  encryption_enabled: boolean;
}

export interface TwoFASettings {
  id?: string;
  user_id: string;
  secret: string;
  is_enabled: boolean;
  backup_codes: string[];
  recovery_email?: string;
  last_used_at?: string;
}

export interface SecurityLog {
  id: string;
  user_id?: string;
  restaurant_id?: string;
  event_type: string;
  event_details: any;
  ip_address?: unknown;
  user_agent?: string;
  created_at: string;
}

export const useSecurity = () => {
  const { user } = useAuth();
  const { currentRestaurant } = useRestaurant();
  const [loading, setLoading] = useState(false);

  // Backup Management
  const createBackup = useCallback(async (backupType: string) => {
    if (!user || !currentRestaurant) {
      toast({
        title: "Erro",
        description: "Usuário ou restaurante não encontrado",
        variant: "destructive",
      });
      return null;
    }

    setLoading(true);
    try {
      let backupData = {};
      
      // Coletar dados baseado no tipo de backup
      switch (backupType) {
        case 'inventory':
          const { data: inventoryData } = await supabase
            .from('inventory_items')
            .select('*')
            .eq('restaurant_id', currentRestaurant.id);
          backupData = { inventory_items: inventoryData };
          break;
          
        case 'menu':
          const { data: menuData } = await supabase
            .from('menu_items')
            .select('*')
            .eq('restaurant_id', currentRestaurant.id);
          const { data: ingredientsData } = await supabase
            .from('menu_item_ingredients')
            .select('*')
            .in('menu_item_id', menuData?.map(item => item.id) || []);
          backupData = { menu_items: menuData, ingredients: ingredientsData };
          break;
          
        case 'transactions':
          const { data: purchaseData } = await supabase
            .from('purchase_history')
            .select('*')
            .eq('restaurant_id', currentRestaurant.id);
          const { data: consumptionData } = await supabase
            .from('consumption_history')
            .select('*')
            .eq('restaurant_id', currentRestaurant.id);
          backupData = { purchases: purchaseData, consumption: consumptionData };
          break;
          
        case 'sales':
          // Placeholder para dados de vendas quando implementado
          backupData = { sales: [] };
          break;
      }

      // Criar backup usando a função do banco
      const { data, error } = await supabase.rpc('create_data_backup', {
        _restaurant_id: currentRestaurant.id,
        _backup_type: backupType,
        _backup_data: backupData
      });

      if (error) throw error;

      toast({
        title: "Backup Criado",
        description: `Backup de ${backupType} criado com sucesso`,
      });

      return data;
    } catch (error: any) {
      console.error('Erro ao criar backup:', error);
      toast({
        title: "Erro no Backup",
        description: error.message,
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, currentRestaurant]);

  const getBackups = useCallback(async () => {
    if (!currentRestaurant) return [];

    try {
      const { data, error } = await supabase
        .from('data_backups')
        .select('*')
        .eq('restaurant_id', currentRestaurant.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Erro ao buscar backups:', error);
      return [];
    }
  }, [currentRestaurant]);

  const getBackupSettings = useCallback(async (): Promise<BackupSettings | null> => {
    if (!currentRestaurant) return null;

    try {
      const { data, error } = await supabase
        .from('backup_settings')
        .select('*')
        .eq('restaurant_id', currentRestaurant.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error: any) {
      console.error('Erro ao buscar configurações de backup:', error);
      return null;
    }
  }, [currentRestaurant]);

  const updateBackupSettings = useCallback(async (settings: Partial<BackupSettings>) => {
    if (!currentRestaurant) return false;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('backup_settings')
        .upsert({
          restaurant_id: currentRestaurant.id,
          ...settings
        });

      if (error) throw error;

      toast({
        title: "Configurações Atualizadas",
        description: "Configurações de backup salvas com sucesso",
      });

      return true;
    } catch (error: any) {
      console.error('Erro ao atualizar configurações:', error);
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [currentRestaurant]);

  // 2FA Management
  const setup2FA = useCallback(async () => {
    if (!user) return null;

    try {
      const { data, error } = await supabase.functions.invoke('setup-2fa');
      
      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Erro ao configurar 2FA:', error);
      toast({
        title: "Erro no 2FA",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  }, [user]);

  const verify2FA = useCallback(async (token: string) => {
    if (!user) return false;

    try {
      const { data, error } = await supabase.functions.invoke('verify-2fa', {
        body: { token }
      });
      
      if (error) throw error;
      
      if (data.success) {
        toast({
          title: "2FA Ativado",
          description: "Autenticação de dois fatores ativada com sucesso",
        });
      }
      
      return data.success;
    } catch (error: any) {
      console.error('Erro ao verificar 2FA:', error);
      toast({
        title: "Erro na Verificação",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  }, [user]);

  const disable2FA = useCallback(async (password: string) => {
    if (!user) return false;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('disable-2fa', {
        body: { password }
      });

      if (error) throw error;
      
      if (data.success) {
        toast({
          title: "2FA Desativado",
          description: "Autenticação de dois fatores foi desativada",
        });
      }

      return data.success;
    } catch (error: any) {
      console.error('Erro ao desativar 2FA:', error);
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const get2FASettings = useCallback(async (): Promise<TwoFASettings | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('user_2fa_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error: any) {
      console.error('Erro ao buscar configurações 2FA:', error);
      return null;
    }
  }, [user]);

  // Security Logs
  const getSecurityLogs = useCallback(async (): Promise<SecurityLog[]> => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('security_logs')
        .select('*')
        .or(`user_id.eq.${user.id},restaurant_id.eq.${currentRestaurant?.id}`)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Erro ao buscar logs de segurança:', error);
      return [];
    }
  }, [user, currentRestaurant]);

  const logSecurityEvent = useCallback(async (eventType: string, eventDetails: any) => {
    try {
      const { error } = await supabase
        .from('security_logs')
        .insert({
          user_id: user?.id,
          restaurant_id: currentRestaurant?.id,
          event_type: eventType,
          event_details: eventDetails
        });

      if (error) throw error;
    } catch (error: any) {
      console.error('Erro ao registrar evento de segurança:', error);
    }
  }, [user, currentRestaurant]);

  // Session security
  const checkSessionSecurity = useCallback(async () => {
    if (!user) return null;

    try {
      const { data, error } = await supabase.functions.invoke('check-session-security');
      
      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Erro ao verificar segurança da sessão:', error);
      return null;
    }
  }, [user]);

  return {
    loading,
    // Backup functions
    createBackup,
    getBackups,
    getBackupSettings,
    updateBackupSettings,
    // 2FA functions  
    setup2FA,
    verify2FA,
    disable2FA,
    get2FASettings,
    // Security logs
    getSecurityLogs,
    logSecurityEvent,
    // Session security
    checkSessionSecurity
  };
};