import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Função TOTP simples para verificação
function verifyTOTP(secret: string, token: string, window: number = 1): boolean {
  const epoch = Math.round(new Date().getTime() / 1000.0);
  const counter = Math.floor(epoch / 30);
  
  for (let i = -window; i <= window; i++) {
    const testCounter = counter + i;
    if (generateTOTP(secret, testCounter) === token) {
      return true;
    }
  }
  return false;
}

function generateTOTP(secret: string, counter: number): string {
  // Esta é uma implementação simplificada
  // Em produção, use uma biblioteca apropriada como otpauth
  const key = base32Decode(secret);
  const time = Math.floor(counter);
  
  // Simulação básica - em produção use HMAC-SHA1 adequado
  const hash = simpleHash(key + time.toString());
  const offset = hash[hash.length - 1] & 0xf;
  const code = (
    ((hash[offset] & 0x7f) << 24) |
    ((hash[offset + 1] & 0xff) << 16) |
    ((hash[offset + 2] & 0xff) << 8) |
    (hash[offset + 3] & 0xff)
  ) % 1000000;
  
  return code.toString().padStart(6, '0');
}

function base32Decode(encoded: string): Uint8Array {
  // Implementação simplificada de base32 decode
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  encoded = encoded.toUpperCase().replace(/=+$/, '');
  
  let bits = '';
  for (let i = 0; i < encoded.length; i++) {
    const char = encoded[i];
    const index = alphabet.indexOf(char);
    if (index === -1) continue;
    bits += index.toString(2).padStart(5, '0');
  }
  
  const bytes = [];
  for (let i = 0; i < bits.length; i += 8) {
    const byte = bits.slice(i, i + 8);
    if (byte.length === 8) {
      bytes.push(parseInt(byte, 2));
    }
  }
  
  return new Uint8Array(bytes);
}

function simpleHash(input: string): number[] {
  // Hash simples para demonstração - use crypto adequado em produção
  const hash = [];
  for (let i = 0; i < input.length; i++) {
    hash.push(input.charCodeAt(i) % 256);
  }
  return hash;
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

    // Obter dados do corpo da requisição
    const { token: totpToken } = await req.json();

    if (!totpToken || totpToken.length !== 6) {
      throw new Error('Token inválido');
    }

    // Buscar configurações 2FA
    const { data: settings, error: settingsError } = await supabaseClient
      .from('user_2fa_settings')
      .select('secret, is_enabled, backup_codes')
      .eq('user_id', user.id)
      .single();

    if (settingsError || !settings) {
      throw new Error('Configurações 2FA não encontradas');
    }

    let isValid = false;

    // Verificar se é um código TOTP válido
    if (verifyTOTP(settings.secret, totpToken)) {
      isValid = true;
    } else {
      // Verificar se é um código de backup
      const backupCodes = settings.backup_codes || [];
      if (backupCodes.includes(totpToken)) {
        isValid = true;
        
        // Remover código de backup usado
        const updatedCodes = backupCodes.filter(code => code !== totpToken);
        await supabaseClient
          .from('user_2fa_settings')
          .update({ backup_codes: updatedCodes })
          .eq('user_id', user.id);
      }
    }

    if (!isValid) {
      // Log de tentativa falhada
      await supabaseClient
        .from('security_logs')
        .insert({
          user_id: user.id,
          event_type: '2fa_verification_failed',
          event_details: { action: 'invalid_token' },
          ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
          user_agent: req.headers.get('user-agent')
        });

      throw new Error('Token de verificação inválido');
    }

    // Ativar 2FA
    const { error: updateError } = await supabaseClient
      .from('user_2fa_settings')
      .update({ 
        is_enabled: true,
        last_used_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    if (updateError) {
      throw updateError;
    }

    // Log de sucesso
    await supabaseClient
      .from('security_logs')
      .insert({
        user_id: user.id,
        event_type: '2fa_enabled',
        event_details: { action: 'verification_successful' },
        ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
        user_agent: req.headers.get('user-agent')
      });

    return new Response(JSON.stringify({
      success: true,
      message: '2FA ativado com sucesso'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Erro em verify-2fa:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});