-- Terceira parte: Funções para relatórios consolidados
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

-- Função para consolidar dados de estoque de toda a rede
CREATE OR REPLACE FUNCTION public.get_chain_consolidated_inventory(chain_id_param UUID)
RETURNS TABLE (
  item_name TEXT,
  category TEXT,
  total_stock NUMERIC,
  total_value NUMERIC,
  restaurants_with_item INTEGER,
  avg_cost_per_unit NUMERIC,
  total_low_stock_restaurants INTEGER
) 
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ii.name as item_name,
    ii.category,
    SUM(ii.current_stock) as total_stock,
    SUM(ii.current_stock * ii.cost_per_unit) as total_value,
    COUNT(DISTINCT ii.restaurant_id)::INTEGER as restaurants_with_item,
    AVG(ii.cost_per_unit) as avg_cost_per_unit,
    COUNT(CASE WHEN ii.current_stock <= ii.min_stock THEN 1 END)::INTEGER as total_low_stock_restaurants
  FROM inventory_items ii
  JOIN restaurants r ON r.id = ii.restaurant_id
  WHERE r.chain_id = chain_id_param
  GROUP BY ii.name, ii.category
  ORDER BY total_value DESC, item_name;
END;
$$;