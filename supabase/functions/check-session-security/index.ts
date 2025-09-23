import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Função para detectar dispositivo
function getDeviceInfo(userAgent: string) {
  const mobile = /Mobile|Android|iPhone|iPad/.test(userAgent);
  const tablet = /iPad|Tablet/.test(userAgent);
  const desktop = !mobile && !tablet;
  
  return {
    type: mobile ? 'mobile' : tablet ? 'tablet' : 'desktop',
    browser: getBrowser(userAgent),
    os: getOS(userAgent),
    is_mobile: mobile
  };
}

function getBrowser(userAgent: string): string {
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  return 'Unknown';
}

function getOS(userAgent: string): string {
  if (userAgent.includes('Windows')) return 'Windows';
  if (userAgent.includes('Mac')) return 'MacOS';
  if (userAgent.includes('Linux')) return 'Linux';
  if (userAgent.includes('Android')) return 'Android';
  if (userAgent.includes('iOS')) return 'iOS';
  return 'Unknown';
}

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
    const userAgent = req.headers.get('user-agent') || '';
    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip');

    // Detectar informações do dispositivo
    const deviceInfo = getDeviceInfo(userAgent);

    // Verificar atividade suspeita
    const { data: suspiciousCheck } = await supabaseClient.rpc('detect_suspicious_login', {
      _user_id: user.id,
      _ip_address: ipAddress,
      _user_agent: userAgent,
      _event_type: 'session_check'
    });

    // Verificar se 2FA está ativo
    const { data: settings } = await supabaseClient
      .from('user_2fa_settings')
      .select('is_enabled, failed_attempts, locked_until')
      .eq('user_id', user.id)
      .single();

    // Verificar se está bloqueado
    const { data: isLocked } = await supabaseClient.rpc('is_2fa_locked', {
      _user_id: user.id
    });

    // Buscar sessões ativas
    const { data: activeSessions } = await supabaseClient
      .from('active_sessions')
      .select('*')
      .eq('user_id', user.id)
      .gt('expires_at', new Date().toISOString());

    // Criar ou atualizar sessão atual
    const sessionToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

    await supabaseClient
      .from('active_sessions')
      .upsert({
        user_id: user.id,
        session_token: sessionToken,
        ip_address: ipAddress,
        user_agent: userAgent,
        device_info: deviceInfo,
        expires_at: expiresAt.toISOString()
      });

    const response = {
      user_id: user.id,
      security_status: {
        has_2fa: settings?.is_enabled || false,
        is_2fa_locked: isLocked || false,
        failed_attempts: settings?.failed_attempts || 0,
        requires_2fa: suspiciousCheck?.requires_2fa || false,
        risk_score: suspiciousCheck?.risk_score || 0,
        is_suspicious: suspiciousCheck?.is_suspicious || false
      },
      device_info: deviceInfo,
      session_info: {
        session_token: sessionToken,
        expires_at: expiresAt.toISOString(),
        active_sessions_count: activeSessions?.length || 0
      },
      recommendations: []
    };

    // Adicionar recomendações baseadas no risco
    if (suspiciousCheck?.risk_score > 25) {
      response.recommendations.push('Ativar verificação em duas etapas imediatamente');
    }
    
    if (suspiciousCheck?.risk_score > 15 && !settings?.is_enabled) {
      response.recommendations.push('Considere ativar autenticação de dois fatores');
    }

    if ((activeSessions?.length || 0) > 3) {
      response.recommendations.push('Muitas sessões ativas. Considere fazer logout de dispositivos não utilizados');
    }

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Erro em check-session-security:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Erro interno' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});