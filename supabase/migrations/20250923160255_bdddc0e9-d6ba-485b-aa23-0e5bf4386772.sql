-- Create menu items table
CREATE TABLE public.menu_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  sale_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  cost_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  profit_margin NUMERIC(5,2) NOT NULL DEFAULT 0,
  is_available BOOLEAN NOT NULL DEFAULT true,
  preparation_time INTEGER, -- in minutes
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

-- Create policies for menu items
CREATE POLICY "Authorized users can manage menu items" 
ON public.menu_items 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM restaurant_members 
    WHERE restaurant_members.restaurant_id = menu_items.restaurant_id 
    AND restaurant_members.user_id = auth.uid() 
    AND restaurant_members.role IN ('admin', 'manager', 'chef')
  )
);

CREATE POLICY "Restaurant members can view menu items" 
ON public.menu_items 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM restaurant_members 
    WHERE restaurant_members.restaurant_id = menu_items.restaurant_id 
    AND restaurant_members.user_id = auth.uid()
  )
);

-- Create menu item ingredients relationship table
CREATE TABLE public.menu_item_ingredients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  menu_item_id UUID NOT NULL REFERENCES public.menu_items(id) ON DELETE CASCADE,
  inventory_item_id UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
  quantity_needed NUMERIC(10,3) NOT NULL DEFAULT 0,
  unit TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure unique combination of menu item and ingredient
  UNIQUE(menu_item_id, inventory_item_id)
);

-- Enable RLS
ALTER TABLE public.menu_item_ingredients ENABLE ROW LEVEL SECURITY;

-- Create policies for menu item ingredients
CREATE POLICY "Authorized users can manage menu item ingredients" 
ON public.menu_item_ingredients 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM restaurant_members rm
    JOIN menu_items mi ON mi.restaurant_id = rm.restaurant_id
    WHERE mi.id = menu_item_ingredients.menu_item_id
    AND rm.user_id = auth.uid() 
    AND rm.role IN ('admin', 'manager', 'chef')
  )
);

CREATE POLICY "Restaurant members can view menu item ingredients" 
ON public.menu_item_ingredients 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM restaurant_members rm
    JOIN menu_items mi ON mi.restaurant_id = rm.restaurant_id
    WHERE mi.id = menu_item_ingredients.menu_item_id
    AND rm.user_id = auth.uid()
  )
);

-- Create menu suggestions table for inventory-based recommendations
CREATE TABLE public.menu_suggestions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL,
  menu_item_id UUID NOT NULL REFERENCES public.menu_items(id) ON DELETE CASCADE,
  suggestion_type TEXT NOT NULL CHECK (suggestion_type IN ('low_stock', 'out_of_stock', 'high_cost', 'optimize_price')),
  message TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  is_resolved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.menu_suggestions ENABLE ROW LEVEL SECURITY;

-- Create policies for menu suggestions
CREATE POLICY "Restaurant members can view menu suggestions" 
ON public.menu_suggestions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM restaurant_members 
    WHERE restaurant_members.restaurant_id = menu_suggestions.restaurant_id 
    AND restaurant_members.user_id = auth.uid()
  )
);

CREATE POLICY "Authorized users can manage menu suggestions" 
ON public.menu_suggestions 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM restaurant_members 
    WHERE restaurant_members.restaurant_id = menu_suggestions.restaurant_id 
    AND restaurant_members.user_id = auth.uid() 
    AND restaurant_members.role IN ('admin', 'manager', 'chef')
  )
);

-- Create trigger for automatic timestamp updates on menu_items
CREATE TRIGGER update_menu_items_updated_at
  BEFORE UPDATE ON public.menu_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to calculate menu item cost based on ingredients
CREATE OR REPLACE FUNCTION public.calculate_menu_item_cost(menu_item_id_param UUID)
RETURNS NUMERIC AS $$
DECLARE
  total_cost NUMERIC := 0;
  ingredient_record RECORD;
BEGIN
  -- Sum up the cost of all ingredients for this menu item
  FOR ingredient_record IN
    SELECT 
      mii.quantity_needed,
      ii.cost_per_unit
    FROM menu_item_ingredients mii
    JOIN inventory_items ii ON ii.id = mii.inventory_item_id
    WHERE mii.menu_item_id = menu_item_id_param
  LOOP
    total_cost := total_cost + (ingredient_record.quantity_needed * ingredient_record.cost_per_unit);
  END LOOP;
  
  RETURN COALESCE(total_cost, 0);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

-- Create function to check menu item availability based on ingredient stock
CREATE OR REPLACE FUNCTION public.check_menu_item_availability(menu_item_id_param UUID)
RETURNS BOOLEAN AS $$
DECLARE
  ingredient_record RECORD;
  portions_available NUMERIC;
  min_portions NUMERIC := 999999;
BEGIN
  -- Check each ingredient to see how many portions can be made
  FOR ingredient_record IN
    SELECT 
      mii.quantity_needed,
      ii.current_stock,
      ii.name as ingredient_name
    FROM menu_item_ingredients mii
    JOIN inventory_items ii ON ii.id = mii.inventory_item_id
    WHERE mii.menu_item_id = menu_item_id_param
  LOOP
    -- Calculate how many portions this ingredient allows
    IF ingredient_record.quantity_needed > 0 THEN
      portions_available := ingredient_record.current_stock / ingredient_record.quantity_needed;
      min_portions := LEAST(min_portions, portions_available);
    END IF;
  END LOOP;
  
  -- Return true if at least 1 portion can be made
  RETURN COALESCE(min_portions, 0) >= 1;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

-- Create function to generate menu suggestions based on inventory levels
CREATE OR REPLACE FUNCTION public.generate_menu_suggestions(restaurant_id_param UUID)
RETURNS VOID AS $$
DECLARE
  menu_record RECORD;
  cost_price NUMERIC;
  is_available BOOLEAN;
  suggestion_text TEXT;
BEGIN
  -- Clear old suggestions
  DELETE FROM menu_suggestions 
  WHERE restaurant_id = restaurant_id_param 
  AND created_at < NOW() - INTERVAL '1 day';
  
  -- Check each menu item
  FOR menu_record IN
    SELECT id, name, sale_price, cost_price as current_cost_price
    FROM menu_items 
    WHERE restaurant_id = restaurant_id_param
    AND is_available = true
  LOOP
    -- Calculate current cost
    cost_price := calculate_menu_item_cost(menu_record.id);
    
    -- Check availability
    is_available := check_menu_item_availability(menu_record.id);
    
    -- Generate suggestions based on availability
    IF NOT is_available THEN
      suggestion_text := 'Prato "' || menu_record.name || '" não pode ser preparado devido a ingredientes em falta no estoque.';
      
      INSERT INTO menu_suggestions (restaurant_id, menu_item_id, suggestion_type, message, priority)
      VALUES (restaurant_id_param, menu_record.id, 'out_of_stock', suggestion_text, 'high')
      ON CONFLICT DO NOTHING;
    END IF;
    
    -- Generate cost-related suggestions
    IF cost_price > menu_record.sale_price THEN
      suggestion_text := 'Prato "' || menu_record.name || '" tem custo (R$ ' || 
                        ROUND(cost_price, 2) || ') maior que preço de venda (R$ ' || 
                        ROUND(menu_record.sale_price, 2) || '). Considere ajustar o preço.';
      
      INSERT INTO menu_suggestions (restaurant_id, menu_item_id, suggestion_type, message, priority)
      VALUES (restaurant_id_param, menu_record.id, 'high_cost', suggestion_text, 'medium')
      ON CONFLICT DO NOTHING;
    END IF;
    
    -- Update menu item cost price
    UPDATE menu_items 
    SET cost_price = cost_price,
        profit_margin = CASE 
          WHEN cost_price > 0 THEN ((sale_price - cost_price) / cost_price * 100)
          ELSE 0 
        END
    WHERE id = menu_record.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;