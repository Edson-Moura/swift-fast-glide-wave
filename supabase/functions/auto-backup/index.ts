import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Buscar todos os restaurantes com backup automático ativado
    const { data: settings, error: settingsError } = await supabaseClient
      .from('backup_settings')
      .select('*')
      .eq('auto_backup_enabled', true);

    if (settingsError) {
      throw settingsError;
    }

    if (!settings || settings.length === 0) {
      return new Response(JSON.stringify({
        message: 'Nenhum restaurante com backup automático encontrado'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    const results = [];

    for (const setting of settings) {
      try {
        // Verificar se precisa fazer backup (baseado na frequência)
        const { data: lastBackup } = await supabaseClient
          .from('data_backups')
          .select('created_at')
          .eq('restaurant_id', setting.restaurant_id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        const now = new Date();
        const lastBackupTime = lastBackup ? new Date(lastBackup.created_at) : new Date(0);
        const hoursSinceLastBackup = (now.getTime() - lastBackupTime.getTime()) / (1000 * 60 * 60);

        if (hoursSinceLastBackup < setting.backup_frequency) {
          results.push({
            restaurant_id: setting.restaurant_id,
            status: 'skipped',
            reason: 'Backup recente existe'
          });
          continue;
        }

        // Criar backups para cada tipo configurado
        for (const backupType of setting.backup_types) {
          let backupData = {};

          switch (backupType) {
            case 'inventory':
              const { data: inventoryData } = await supabaseClient
                .from('inventory_items')
                .select('*')
                .eq('restaurant_id', setting.restaurant_id);
              backupData = { inventory_items: inventoryData };
              break;

            case 'menu':
              const { data: menuData } = await supabaseClient
                .from('menu_items')
                .select('*')
                .eq('restaurant_id', setting.restaurant_id);
              
              const menuIds = menuData?.map(item => item.id) || [];
              const { data: ingredientsData } = menuIds.length > 0 ? await supabaseClient
                .from('menu_item_ingredients')
                .select('*')
                .in('menu_item_id', menuIds) : { data: [] };
              
              backupData = { menu_items: menuData, ingredients: ingredientsData };
              break;

            case 'transactions':
              const { data: purchaseData } = await supabaseClient
                .from('purchase_history')
                .select('*')
                .eq('restaurant_id', setting.restaurant_id);
              
              const { data: consumptionData } = await supabaseClient
                .from('consumption_history')
                .select('*')
                .eq('restaurant_id', setting.restaurant_id);
              
              backupData = { purchases: purchaseData, consumption: consumptionData };
              break;

            case 'sales':
              // Placeholder para dados de vendas quando implementado
              backupData = { sales: [] };
              break;
          }

          // Criar backup usando a função do banco
          const { data: backupId, error: backupError } = await supabaseClient
            .rpc('create_data_backup', {
              _restaurant_id: setting.restaurant_id,
              _backup_type: backupType,
              _backup_data: backupData
            });

          if (backupError) {
            console.error(`Erro ao criar backup ${backupType}:`, backupError);
            results.push({
              restaurant_id: setting.restaurant_id,
              backup_type: backupType,
              status: 'error',
              error: backupError.message
            });
          } else {
            results.push({
              restaurant_id: setting.restaurant_id,
              backup_type: backupType,
              status: 'success',
              backup_id: backupId
            });
          }
        }

        // Limpar backups antigos baseado na retenção
        const retentionDate = new Date();
        retentionDate.setDate(retentionDate.getDate() - setting.retention_days);

        const { error: cleanupError } = await supabaseClient
          .from('data_backups')
          .delete()
          .eq('restaurant_id', setting.restaurant_id)
          .lt('created_at', retentionDate.toISOString());

        if (cleanupError) {
          console.error('Erro na limpeza de backups antigos:', cleanupError);
        }

      } catch (error) {
        console.error(`Erro no backup do restaurante ${setting.restaurant_id}:`, error);
        results.push({
          restaurant_id: setting.restaurant_id,
          status: 'error',
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
      }
    }

    return new Response(JSON.stringify({
      message: 'Processo de backup automático concluído',
      results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Erro em auto-backup:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Erro interno' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});