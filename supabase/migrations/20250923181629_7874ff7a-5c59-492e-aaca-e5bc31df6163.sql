-- Criar tabela para backups automáticos de dados críticos
CREATE TABLE public.data_backups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL,
  backup_type TEXT NOT NULL, -- 'inventory', 'transactions', 'sales', 'menu'
  backup_data JSONB NOT NULL,
  checksum TEXT NOT NULL, -- Hash para verificar integridade
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL
);

-- Criar tabela para configurações de 2FA
CREATE TABLE public.user_2fa_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  secret TEXT NOT NULL, -- Segredo TOTP criptografado
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  backup_codes TEXT[] NOT NULL DEFAULT '{}', -- Códigos de backup criptografados
  recovery_email TEXT,
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para logs de segurança
CREATE TABLE public.security_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  restaurant_id UUID,
  event_type TEXT NOT NULL, -- 'login', 'failed_login', 'backup_created', 'data_access', '2fa_enabled'
  event_details JSONB NOT NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para configurações de backup
CREATE TABLE public.backup_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL UNIQUE,
  auto_backup_enabled BOOLEAN NOT NULL DEFAULT true,
  backup_frequency INTEGER NOT NULL DEFAULT 24, -- Horas entre backups
  retention_days INTEGER NOT NULL DEFAULT 30,
  backup_types TEXT[] NOT NULL DEFAULT ARRAY['inventory', 'transactions', 'sales', 'menu'],
  encryption_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS Policies para data_backups
ALTER TABLE public.data_backups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Restaurant members can view their backups" 
ON public.data_backups 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM restaurant_members 
  WHERE restaurant_id = data_backups.restaurant_id 
  AND user_id = auth.uid()
  AND role IN ('admin', 'manager')
));

CREATE POLICY "Admins can create backups" 
ON public.data_backups 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM restaurant_members 
  WHERE restaurant_id = data_backups.restaurant_id 
  AND user_id = auth.uid()
  AND role IN ('admin', 'manager')
) AND created_by = auth.uid());

-- RLS Policies para user_2fa_settings
ALTER TABLE public.user_2fa_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own 2FA settings" 
ON public.user_2fa_settings 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS Policies para security_logs
ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Restaurant admins can view security logs" 
ON public.security_logs 
FOR SELECT 
USING (
  (restaurant_id IS NULL AND user_id = auth.uid()) OR
  EXISTS (
    SELECT 1 FROM restaurant_members 
    WHERE restaurant_id = security_logs.restaurant_id 
    AND user_id = auth.uid()
    AND role = 'admin'
  )
);

CREATE POLICY "System can create security logs" 
ON public.security_logs 
FOR INSERT 
WITH CHECK (true);

-- RLS Policies para backup_settings
ALTER TABLE public.backup_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Restaurant admins can manage backup settings" 
ON public.backup_settings 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM restaurant_members 
  WHERE restaurant_id = backup_settings.restaurant_id 
  AND user_id = auth.uid()
  AND role = 'admin'
));

-- Trigger para atualizar updated_at nas tabelas necessárias
CREATE TRIGGER update_user_2fa_settings_updated_at
BEFORE UPDATE ON public.user_2fa_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_backup_settings_updated_at
BEFORE UPDATE ON public.backup_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Função para criar backup de dados críticos
CREATE OR REPLACE FUNCTION public.create_data_backup(
  _restaurant_id UUID,
  _backup_type TEXT,
  _backup_data JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  backup_id UUID;
  data_checksum TEXT;
BEGIN
  -- Gerar checksum para verificação de integridade
  data_checksum := encode(sha256(convert_to(_backup_data::text, 'UTF8')), 'hex');
  
  -- Inserir backup
  INSERT INTO public.data_backups (
    restaurant_id, 
    backup_type, 
    backup_data, 
    checksum, 
    created_by
  ) VALUES (
    _restaurant_id,
    _backup_type,
    _backup_data,
    data_checksum,
    auth.uid()
  ) RETURNING id INTO backup_id;
  
  -- Log de segurança
  INSERT INTO public.security_logs (
    user_id,
    restaurant_id,
    event_type,
    event_details
  ) VALUES (
    auth.uid(),
    _restaurant_id,
    'backup_created',
    jsonb_build_object(
      'backup_id', backup_id,
      'backup_type', _backup_type,
      'data_size', length(_backup_data::text)
    )
  );
  
  RETURN backup_id;
END;
$$;