-- Create FAQs table for help center
CREATE TABLE public.faqs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT NOT NULL,
  priority INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create support tickets table
CREATE TABLE public.support_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  priority TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create support responses table  
CREATE TABLE public.support_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_staff_response BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_responses ENABLE ROW LEVEL SECURITY;

-- FAQs policies (public read access)
CREATE POLICY "Anyone can view active FAQs"
ON public.faqs
FOR SELECT
USING (is_active = true);

-- Support tickets policies
CREATE POLICY "Users can create support tickets"
ON public.support_tickets
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own tickets"
ON public.support_tickets
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own tickets"
ON public.support_tickets
FOR UPDATE
USING (auth.uid() = user_id);

-- Support responses policies
CREATE POLICY "Users can view responses to their tickets"
ON public.support_responses
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.support_tickets 
    WHERE support_tickets.id = support_responses.ticket_id 
    AND support_tickets.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create responses to their tickets"
ON public.support_responses
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.support_tickets 
    WHERE support_tickets.id = support_responses.ticket_id 
    AND support_tickets.user_id = auth.uid()
  )
);

-- Insert some sample FAQs
INSERT INTO public.faqs (question, answer, category, priority) VALUES
('Como criar minha primeira receita?', 'Para criar uma receita, vá até "Cardápio" no menu principal, clique em "Novo Prato" e adicione os ingredientes necessários. O sistema calculará automaticamente os custos baseados no seu inventário.', 'menu', 10),
('Como configurar alertas de estoque baixo?', 'No módulo "Inventário", edite cada produto e defina os valores mínimos e máximos de estoque. O sistema enviará alertas automáticos quando o estoque atingir o nível mínimo.', 'inventory', 9),
('Como adicionar fornecedores?', 'Vá até "Fornecedores" no menu e clique em "Novo Fornecedor". Preencha as informações de contato e vincule os produtos que eles fornecem.', 'suppliers', 8),
('Como funciona a análise de demanda?', 'A IA analisa seu histórico de vendas, padrões sazonais e tendências para prever a demanda futura. Isso ajuda a otimizar compras e evitar desperdícios.', 'analytics', 7),
('Como configurar backup automático?', 'Na seção "Segurança", ative o backup automático e escolha a frequência desejada. Seus dados serão salvos automaticamente na nuvem.', 'security', 6),
('Posso gerenciar múltiplos restaurantes?', 'Sim! Com o plano adequado, você pode criar uma rede de restaurantes e ter relatórios consolidados de todas as unidades.', 'general', 5);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_faqs_updated_at
BEFORE UPDATE ON public.faqs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_support_tickets_updated_at
BEFORE UPDATE ON public.support_tickets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();