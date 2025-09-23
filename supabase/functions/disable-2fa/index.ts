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
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Verificar autenticação
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Autorização necessária');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData.user) {
      throw new Error('Usuário não autenticado');
    }

    const user = userData.user;

    // Obter dados do corpo da requisição
    const { password } = await req.json();

    if (!password) {
      throw new Error('Senha é obrigatória para desativar 2FA');
    }

    // Verificar senha atual
    const { error: signInError } = await supabaseClient.auth.signInWithPassword({
      email: user.email!,
      password: password
    });

    if (signInError) {
      throw new Error('Senha incorreta');
    }

    // Desativar 2FA
    const { error: updateError } = await supabaseClient
      .from('user_2fa_settings')
      .update({ 
        is_enabled: false,
        failed_attempts: 0,
        locked_until: null
      })
      .eq('user_id', user.id);

    if (updateError) {
      throw updateError;
    }

    // Log de segurança
    await supabaseClient
      .from('security_logs')
      .insert({
        user_id: user.id,
        event_type: '2fa_disabled',
        event_details: { action: 'user_disabled_2fa' },
        ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
        user_agent: req.headers.get('user-agent')
      });

    return new Response(JSON.stringify({
      success: true,
      message: '2FA desativado com sucesso'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Erro em disable-2fa:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});