import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Função para gerar códigos de backup
function generateBackupCodes(): string[] {
  const codes = [];
  for (let i = 0; i < 10; i++) {
    const code = Math.random().toString(36).substr(2, 8).toUpperCase();
    codes.push(code);
  }
  return codes;
}

// Função para gerar secret base32
function generateSecret(): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let secret = '';
  for (let i = 0; i < 32; i++) {
    secret += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return secret;
}

// Função para gerar URL do QR Code
function generateQRCodeUrl(secret: string, email: string): string {
  const issuer = 'RestaurantApp';
  const label = `${issuer}:${email}`;
  const otpauthUrl = `otpauth://totp/${encodeURIComponent(label)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauthUrl)}`;
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

    // Verificar se já tem 2FA configurado
    const { data: existing } = await supabaseClient
      .from('user_2fa_settings')
      .select('id, is_enabled')
      .eq('user_id', user.id)
      .single();

    if (existing?.is_enabled) {
      throw new Error('2FA já está ativado para este usuário');
    }

    // Gerar secret e códigos de backup
    const secret = generateSecret();
    const backupCodes = generateBackupCodes();
    
    // Gerar QR code URL
    const qrCodeUrl = generateQRCodeUrl(secret, user.email || '');

    // Salvar configuração (desabilitada até verificação)
    const { error: saveError } = await supabaseClient
      .from('user_2fa_settings')
      .upsert({
        user_id: user.id,
        secret: secret, // Em produção, isso deveria ser criptografado
        is_enabled: false,
        backup_codes: backupCodes, // Em produção, isso deveria ser criptografado
        recovery_email: user.email
      });

    if (saveError) {
      throw saveError;
    }

    // Log de segurança
    await supabaseClient
      .from('security_logs')
      .insert({
        user_id: user.id,
        event_type: '2fa_setup_started',
        event_details: { action: 'setup_initiated' },
        ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
        user_agent: req.headers.get('user-agent')
      });

    return new Response(JSON.stringify({
      secret,
      qr_code: qrCodeUrl,
      backup_codes: backupCodes
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Erro em setup-2fa:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Erro interno' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});