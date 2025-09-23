-- Função para adicionar automaticamente o criador como admin
CREATE OR REPLACE FUNCTION public.handle_new_restaurant()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Adicionar o criador do restaurante como admin
  INSERT INTO public.restaurant_members (user_id, restaurant_id, role)
  VALUES (auth.uid(), NEW.id, 'admin');
  
  RETURN NEW;
END;
$$;

-- Trigger para executar quando um novo restaurante é criado
CREATE TRIGGER on_restaurant_created
  AFTER INSERT ON public.restaurants
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_restaurant();