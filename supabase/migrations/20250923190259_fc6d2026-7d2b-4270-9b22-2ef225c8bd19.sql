-- Criar tabela para rastreamento de desperdício
CREATE TABLE public.waste_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL,
  inventory_item_id UUID NOT NULL,
  quantity_wasted NUMERIC NOT NULL DEFAULT 0,
  unit TEXT NOT NULL,
  waste_reason TEXT NOT NULL,
  waste_category TEXT NOT NULL DEFAULT 'expired', -- expired, preparation_error, spoiled, damaged, other
  cost_impact NUMERIC NOT NULL DEFAULT 0,
  registered_by UUID NOT NULL,
  waste_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.waste_tracking ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para waste_tracking
CREATE POLICY "Restaurant members can view waste tracking" 
ON public.waste_tracking 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM restaurant_members 
    WHERE restaurant_members.restaurant_id = waste_tracking.restaurant_id 
    AND restaurant_members.user_id = auth.uid()
  )
);

CREATE POLICY "Authorized users can manage waste tracking" 
ON public.waste_tracking 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM restaurant_members 
    WHERE restaurant_members.restaurant_id = waste_tracking.restaurant_id 
    AND restaurant_members.user_id = auth.uid() 
    AND restaurant_members.role IN ('admin', 'manager', 'inventory', 'chef')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM restaurant_members 
    WHERE restaurant_members.restaurant_id = waste_tracking.restaurant_id 
    AND restaurant_members.user_id = auth.uid() 
    AND restaurant_members.role IN ('admin', 'manager', 'inventory', 'chef')
  )
);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_waste_tracking_updated_at
BEFORE UPDATE ON public.waste_tracking
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Função para calcular estatísticas de desperdício
CREATE OR REPLACE FUNCTION public.get_waste_statistics(
  restaurant_id_param UUID,
  start_date DATE DEFAULT (CURRENT_DATE - INTERVAL '30 days'),
  end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE(
  total_waste_cost NUMERIC,
  total_items_wasted INTEGER,
  most_wasted_item TEXT,
  most_wasted_item_cost NUMERIC,
  waste_by_category JSONB,
  waste_by_reason JSONB,
  daily_waste_trend JSONB
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  category_data JSONB;
  reason_data JSONB;
  trend_data JSONB;
BEGIN
  -- Calcular estatísticas por categoria
  SELECT jsonb_object_agg(waste_category, total_cost) INTO category_data
  FROM (
    SELECT 
      waste_category,
      SUM(cost_impact) as total_cost
    FROM waste_tracking wt
    WHERE wt.restaurant_id = restaurant_id_param
      AND waste_date BETWEEN start_date AND end_date
    GROUP BY waste_category
  ) cat_stats;
  
  -- Calcular estatísticas por motivo
  SELECT jsonb_object_agg(waste_reason, total_cost) INTO reason_data
  FROM (
    SELECT 
      waste_reason,
      SUM(cost_impact) as total_cost
    FROM waste_tracking wt
    WHERE wt.restaurant_id = restaurant_id_param
      AND waste_date BETWEEN start_date AND end_date
    GROUP BY waste_reason
  ) reason_stats;
  
  -- Calcular tendência diária
  SELECT jsonb_object_agg(waste_date::TEXT, daily_cost) INTO trend_data
  FROM (
    SELECT 
      waste_date,
      SUM(cost_impact) as daily_cost
    FROM waste_tracking wt
    WHERE wt.restaurant_id = restaurant_id_param
      AND waste_date BETWEEN start_date AND end_date
    GROUP BY waste_date
    ORDER BY waste_date
  ) daily_stats;

  RETURN QUERY
  SELECT 
    COALESCE(SUM(wt.cost_impact), 0) as total_waste_cost,
    COUNT(wt.id)::INTEGER as total_items_wasted,
    (
      SELECT ii.name
      FROM waste_tracking wt2
      JOIN inventory_items ii ON ii.id = wt2.inventory_item_id
      WHERE wt2.restaurant_id = restaurant_id_param
        AND wt2.waste_date BETWEEN start_date AND end_date
      GROUP BY ii.name, wt2.inventory_item_id
      ORDER BY SUM(wt2.cost_impact) DESC
      LIMIT 1
    ) as most_wasted_item,
    (
      SELECT SUM(wt2.cost_impact)
      FROM waste_tracking wt2
      JOIN inventory_items ii ON ii.id = wt2.inventory_item_id
      WHERE wt2.restaurant_id = restaurant_id_param
        AND wt2.waste_date BETWEEN start_date AND end_date
      GROUP BY wt2.inventory_item_id
      ORDER BY SUM(wt2.cost_impact) DESC
      LIMIT 1
    ) as most_wasted_item_cost,
    COALESCE(category_data, '{}'::jsonb) as waste_by_category,
    COALESCE(reason_data, '{}'::jsonb) as waste_by_reason,
    COALESCE(trend_data, '{}'::jsonb) as daily_waste_trend
  FROM waste_tracking wt
  WHERE wt.restaurant_id = restaurant_id_param
    AND wt.waste_date BETWEEN start_date AND end_date;
END;
$$;

-- Função para gerar sugestões de redução de desperdício
CREATE OR REPLACE FUNCTION public.generate_waste_reduction_suggestions(
  restaurant_id_param UUID
)
RETURNS TABLE(
  suggestion_type TEXT,
  priority TEXT,
  message TEXT,
  estimated_savings NUMERIC
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  -- Sugestão para itens com alto desperdício por validade
  SELECT 
    'expired_items'::TEXT,
    CASE 
      WHEN total_cost > 500 THEN 'high'
      WHEN total_cost > 200 THEN 'medium'
      ELSE 'low'
    END as priority,
    'Item "' || item_name || '" tem desperdício frequente por validade (R$ ' || 
    ROUND(total_cost, 2) || ' nos últimos 30 dias). Considere reduzir pedidos ou melhorar rotatividade.' as message,
    total_cost * 0.7 as estimated_savings
  FROM (
    SELECT 
      ii.name as item_name,
      SUM(wt.cost_impact) as total_cost
    FROM waste_tracking wt
    JOIN inventory_items ii ON ii.id = wt.inventory_item_id
    WHERE wt.restaurant_id = restaurant_id_param
      AND wt.waste_category = 'expired'
      AND wt.waste_date > CURRENT_DATE - INTERVAL '30 days'
    GROUP BY ii.name, wt.inventory_item_id
    HAVING SUM(wt.cost_impact) > 100
    ORDER BY total_cost DESC
    LIMIT 5
  ) expired_analysis
  
  UNION ALL
  
  -- Sugestão para erros de preparo frequentes
  SELECT 
    'preparation_errors'::TEXT,
    'medium'::TEXT,
    'Há ' || error_count || ' registros de erro de preparo nos últimos 30 dias (R$ ' || 
    ROUND(total_cost, 2) || '). Considere treinamento adicional da equipe.' as message,
    total_cost * 0.8 as estimated_savings
  FROM (
    SELECT 
      COUNT(*) as error_count,
      SUM(wt.cost_impact) as total_cost
    FROM waste_tracking wt
    WHERE wt.restaurant_id = restaurant_id_param
      AND wt.waste_category = 'preparation_error'
      AND wt.waste_date > CURRENT_DATE - INTERVAL '30 days'
    HAVING COUNT(*) > 5
  ) prep_analysis
  
  UNION ALL
  
  -- Sugestão geral se desperdício total for alto
  SELECT 
    'general_waste'::TEXT,
    'high'::TEXT,
    'Desperdício total alto: R$ ' || ROUND(total_cost, 2) || 
    ' nos últimos 30 dias. Implemente controles mais rígidos e treinamento da equipe.' as message,
    total_cost * 0.3 as estimated_savings
  FROM (
    SELECT SUM(wt.cost_impact) as total_cost
    FROM waste_tracking wt
    WHERE wt.restaurant_id = restaurant_id_param
      AND wt.waste_date > CURRENT_DATE - INTERVAL '30 days'
    HAVING SUM(wt.cost_impact) > 1000
  ) general_analysis;
END;
$$;