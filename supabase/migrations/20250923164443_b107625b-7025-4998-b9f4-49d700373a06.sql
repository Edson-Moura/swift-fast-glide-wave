-- Criar tabela para redes de restaurantes
CREATE TABLE public.restaurant_chains (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  headquarters_address TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  admin_user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.restaurant_chains ENABLE ROW LEVEL SECURITY;

-- Políticas para chains
CREATE POLICY "Chain admins can manage their chains" 
ON public.restaurant_chains 
FOR ALL 
USING (admin_user_id = auth.uid());

CREATE POLICY "Chain members can view their chains" 
ON public.restaurant_chains 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM restaurant_members rm
  JOIN restaurants r ON r.id = rm.restaurant_id
  WHERE r.chain_id = restaurant_chains.id 
  AND rm.user_id = auth.uid()
));

-- Adicionar chain_id à tabela restaurants
ALTER TABLE public.restaurants 
ADD COLUMN chain_id UUID REFERENCES public.restaurant_chains(id);

-- Criar índice para melhor performance
CREATE INDEX idx_restaurants_chain_id ON public.restaurants(chain_id);

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
CREATE TRIGGER update_restaurant_chains_updated_at
  BEFORE UPDATE ON public.restaurant_chains
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_chain_settings_updated_at
  BEFORE UPDATE ON public.chain_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Funções para relatórios consolidados
CREATE OR REPLACE FUNCTION public.get_chain_inventory_summary(chain_id_param UUID, start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days', end_date DATE DEFAULT CURRENT_DATE)
RETURNS TABLE (
  restaurant_id UUID,
  restaurant_name TEXT,
  total_items INTEGER,
  total_value NUMERIC,
  low_stock_items INTEGER,
  categories_count INTEGER
) 
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id as restaurant_id,
    r.name as restaurant_name,
    COUNT(ii.id)::INTEGER as total_items,
    COALESCE(SUM(ii.current_stock * ii.cost_per_unit), 0) as total_value,
    COUNT(CASE WHEN ii.current_stock <= ii.min_stock THEN 1 END)::INTEGER as low_stock_items,
    COUNT(DISTINCT ii.category)::INTEGER as categories_count
  FROM restaurants r
  LEFT JOIN inventory_items ii ON ii.restaurant_id = r.id
  WHERE r.chain_id = chain_id_param
  GROUP BY r.id, r.name
  ORDER BY r.name;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_chain_menu_performance(chain_id_param UUID)
RETURNS TABLE (
  restaurant_id UUID,
  restaurant_name TEXT,
  total_menu_items INTEGER,
  avg_profit_margin NUMERIC,
  high_cost_items INTEGER,
  unavailable_items INTEGER
) 
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id as restaurant_id,
    r.name as restaurant_name,
    COUNT(mi.id)::INTEGER as total_menu_items,
    COALESCE(AVG(mi.profit_margin), 0) as avg_profit_margin,
    COUNT(CASE WHEN mi.cost_price > mi.sale_price THEN 1 END)::INTEGER as high_cost_items,
    COUNT(CASE WHEN NOT mi.is_available THEN 1 END)::INTEGER as unavailable_items
  FROM restaurants r
  LEFT JOIN menu_items mi ON mi.restaurant_id = r.id
  WHERE r.chain_id = chain_id_param
  GROUP BY r.id, r.name
  ORDER BY r.name;
END;
$$;