-- Criar função para verificar força da senha
CREATE OR REPLACE FUNCTION public.check_password_strength(password text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb := '{}';
  score integer := 0;
BEGIN
  -- Verificar comprimento mínimo
  IF length(password) >= 8 THEN
    score := score + 1;
    result := jsonb_set(result, '{length}', 'true');
  ELSE
    result := jsonb_set(result, '{length}', 'false');
  END IF;
  
  -- Verificar letras maiúsculas
  IF password ~ '[A-Z]' THEN
    score := score + 1;
    result := jsonb_set(result, '{uppercase}', 'true');
  ELSE
    result := jsonb_set(result, '{uppercase}', 'false');
  END IF;
  
  -- Verificar letras minúsculas
  IF password ~ '[a-z]' THEN
    score := score + 1;
    result := jsonb_set(result, '{lowercase}', 'true');
  ELSE
    result := jsonb_set(result, '{lowercase}', 'false');
  END IF;
  
  -- Verificar números
  IF password ~ '[0-9]' THEN
    score := score + 1;
    result := jsonb_set(result, '{numbers}', 'true');
  ELSE
    result := jsonb_set(result, '{numbers}', 'false');
  END IF;
  
  -- Verificar caracteres especiais
  IF password ~ '[^A-Za-z0-9]' THEN
    score := score + 1;
    result := jsonb_set(result, '{special}', 'true');
  ELSE
    result := jsonb_set(result, '{special}', 'false');
  END IF;
  
  result := jsonb_set(result, '{score}', to_jsonb(score));
  result := jsonb_set(result, '{strength}', 
    CASE 
      WHEN score >= 4 THEN '"strong"'
      WHEN score >= 3 THEN '"medium"'
      ELSE '"weak"'
    END
  );
  
  RETURN result;
END;
$$;

-- Melhorar tabela de logs de segurança com mais campos
ALTER TABLE security_logs 
ADD COLUMN IF NOT EXISTS session_id text,
ADD COLUMN IF NOT EXISTS device_info jsonb,
ADD COLUMN IF NOT EXISTS location_info jsonb,
ADD COLUMN IF NOT EXISTS risk_score integer DEFAULT 0;

-- Criar índices para melhor performance nos logs
CREATE INDEX IF NOT EXISTS idx_security_logs_user_id_created_at 
ON security_logs(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_security_logs_event_type 
ON security_logs(event_type);

CREATE INDEX IF NOT EXISTS idx_security_logs_restaurant_id 
ON security_logs(restaurant_id);

-- Função para detectar tentativas de login suspeitas
CREATE OR REPLACE FUNCTION public.detect_suspicious_login(
  _user_id uuid,
  _ip_address inet,
  _user_agent text,
  _event_type text DEFAULT 'login_attempt'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recent_attempts integer := 0;
  different_ips integer := 0;
  risk_score integer := 0;
  result jsonb := '{}';
BEGIN
  -- Contar tentativas de login nas últimas 15 minutos
  SELECT COUNT(*) INTO recent_attempts
  FROM security_logs
  WHERE user_id = _user_id
    AND event_type LIKE '%login%'
    AND created_at > NOW() - INTERVAL '15 minutes';
  
  -- Contar IPs diferentes nas últimas 24 horas
  SELECT COUNT(DISTINCT ip_address) INTO different_ips
  FROM security_logs
  WHERE user_id = _user_id
    AND ip_address IS NOT NULL
    AND created_at > NOW() - INTERVAL '24 hours';
  
  -- Calcular score de risco
  risk_score := 0;
  
  IF recent_attempts > 5 THEN
    risk_score := risk_score + 30;
  ELSIF recent_attempts > 3 THEN
    risk_score := risk_score + 20;
  ELSIF recent_attempts > 1 THEN
    risk_score := risk_score + 10;
  END IF;
  
  IF different_ips > 5 THEN
    risk_score := risk_score + 25;
  ELSIF different_ips > 3 THEN
    risk_score := risk_score + 15;
  ELSIF different_ips > 1 THEN
    risk_score := risk_score + 5;
  END IF;
  
  result := jsonb_build_object(
    'risk_score', risk_score,
    'recent_attempts', recent_attempts,
    'different_ips', different_ips,
    'is_suspicious', risk_score > 25,
    'requires_2fa', risk_score > 15
  );
  
  -- Registrar log de segurança
  INSERT INTO security_logs (
    user_id,
    event_type,
    event_details,
    ip_address,
    user_agent,
    risk_score
  ) VALUES (
    _user_id,
    _event_type,
    result,
    _ip_address,
    _user_agent,
    risk_score
  );
  
  RETURN result;
END;
$$;

-- Criar tabela para sessões ativas (ajuda a detectar múltiplos logins)
CREATE TABLE IF NOT EXISTS public.active_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  session_token text NOT NULL UNIQUE,
  ip_address inet,
  user_agent text,
  device_info jsonb,
  location_info jsonb,
  last_activity timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.active_sessions ENABLE ROW LEVEL SECURITY;

-- RLS para sessões ativas
CREATE POLICY "Users can view their own sessions"
ON public.active_sessions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own sessions"
ON public.active_sessions
FOR ALL
USING (auth.uid() = user_id);

-- Índices para sessões ativas
CREATE INDEX IF NOT EXISTS idx_active_sessions_user_id 
ON active_sessions(user_id);

CREATE INDEX IF NOT EXISTS idx_active_sessions_expires_at 
ON active_sessions(expires_at);

-- Função para limpar sessões expiradas
CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM active_sessions 
  WHERE expires_at < NOW();
END;
$$;

-- Melhorar configurações de 2FA com mais segurança
ALTER TABLE user_2fa_settings 
ADD COLUMN IF NOT EXISTS failed_attempts integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS locked_until timestamp with time zone,
ADD COLUMN IF NOT EXISTS setup_completed_at timestamp with time zone;

-- Função para verificar se 2FA está bloqueado
CREATE OR REPLACE FUNCTION public.is_2fa_locked(_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  locked_until_time timestamp with time zone;
BEGIN
  SELECT locked_until INTO locked_until_time
  FROM user_2fa_settings
  WHERE user_id = _user_id;
  
  RETURN locked_until_time IS NOT NULL AND locked_until_time > NOW();
END;
$$;