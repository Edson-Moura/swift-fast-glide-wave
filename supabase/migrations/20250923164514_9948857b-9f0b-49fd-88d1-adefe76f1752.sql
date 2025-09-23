-- Primeira parte: Criar tabela de chains e adicionar coluna chain_id aos restaurants
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

-- Adicionar chain_id à tabela restaurants
ALTER TABLE public.restaurants 
ADD COLUMN chain_id UUID REFERENCES public.restaurant_chains(id);

-- Criar índice para melhor performance
CREATE INDEX idx_restaurants_chain_id ON public.restaurants(chain_id);

-- Políticas básicas para chains (sem referência a chain_id ainda)
CREATE POLICY "Chain admins can manage their chains" 
ON public.restaurant_chains 
FOR ALL 
USING (admin_user_id = auth.uid());

-- Trigger para atualizar updated_at
CREATE TRIGGER update_restaurant_chains_updated_at
  BEFORE UPDATE ON public.restaurant_chains
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();