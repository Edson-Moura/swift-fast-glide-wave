-- Segunda parte: Criar tabelas restantes e políticas com chain_id
CREATE POLICY "Chain members can view their chains" 
ON public.restaurant_chains 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM restaurant_members rm
  JOIN restaurants r ON r.id = rm.restaurant_id  
  WHERE r.chain_id = restaurant_chains.id 
  AND rm.user_id = auth.uid()
));

-- Criar tabela para consolidar relatórios de rede
CREATE TABLE public.chain_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chain_id UUID NOT NULL REFERENCES public.restaurant_chains(id),
  report_type TEXT NOT NULL, -- 'inventory', 'sales', 'costs', 'performance'
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  data JSONB NOT NULL,
  generated_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS para chain_reports
ALTER TABLE public.chain_reports ENABLE ROW LEVEL SECURITY;

-- Políticas para chain_reports
CREATE POLICY "Chain members can view reports" 
ON public.chain_reports 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM restaurant_members rm
  JOIN restaurants r ON r.id = rm.restaurant_id
  WHERE r.chain_id = chain_reports.chain_id 
  AND rm.user_id = auth.uid()
  AND rm.role IN ('admin', 'manager')
));

CREATE POLICY "Chain admins can manage reports" 
ON public.chain_reports 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM restaurant_chains rc
  WHERE rc.id = chain_reports.chain_id 
  AND rc.admin_user_id = auth.uid()
));

-- Criar tabela para configurações de rede
CREATE TABLE public.chain_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chain_id UUID NOT NULL REFERENCES public.restaurant_chains(id),
  setting_key TEXT NOT NULL,
  setting_value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(chain_id, setting_key)
);

-- Habilitar RLS para chain_settings
ALTER TABLE public.chain_settings ENABLE ROW LEVEL SECURITY;

-- Políticas para chain_settings
CREATE POLICY "Chain admins can manage settings" 
ON public.chain_settings 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM restaurant_chains rc
  WHERE rc.id = chain_settings.chain_id 
  AND rc.admin_user_id = auth.uid()
));

CREATE POLICY "Chain members can view settings" 
ON public.chain_settings 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM restaurant_members rm
  JOIN restaurants r ON r.id = rm.restaurant_id
  WHERE r.chain_id = chain_settings.chain_id 
  AND rm.user_id = auth.uid()
));

-- Trigger para atualizar updated_at
CREATE TRIGGER update_chain_settings_updated_at
  BEFORE UPDATE ON public.chain_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();