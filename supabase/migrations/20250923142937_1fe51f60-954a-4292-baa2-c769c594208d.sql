-- Tabela para armazenar posts agendados
CREATE TABLE public.scheduled_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  image_url TEXT,
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'tiktok', 'linkedin')),
  format TEXT NOT NULL CHECK (format IN ('square', 'vertical', 'horizontal')),
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'published', 'failed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.scheduled_posts ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view scheduled posts from their restaurant" 
ON public.scheduled_posts 
FOR SELECT 
USING (
  restaurant_id IN (
    SELECT restaurant_id 
    FROM public.restaurant_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create scheduled posts for their restaurant" 
ON public.scheduled_posts 
FOR INSERT 
WITH CHECK (
  restaurant_id IN (
    SELECT restaurant_id 
    FROM public.restaurant_members 
    WHERE user_id = auth.uid()
  )
  AND user_id = auth.uid()
);

CREATE POLICY "Users can update their scheduled posts" 
ON public.scheduled_posts 
FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their scheduled posts" 
ON public.scheduled_posts 
FOR DELETE 
USING (user_id = auth.uid());

-- Tabela para templates de conteúdo
CREATE TABLE public.content_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  template_type TEXT NOT NULL CHECK (template_type IN ('promotion', 'menu', 'event', 'general')),
  content TEXT NOT NULL,
  default_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS para templates
ALTER TABLE public.content_templates ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para templates
CREATE POLICY "Users can view content templates from their restaurant" 
ON public.content_templates 
FOR SELECT 
USING (
  restaurant_id IN (
    SELECT restaurant_id 
    FROM public.restaurant_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create content templates for their restaurant" 
ON public.content_templates 
FOR INSERT 
WITH CHECK (
  restaurant_id IN (
    SELECT restaurant_id 
    FROM public.restaurant_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update content templates from their restaurant" 
ON public.content_templates 
FOR UPDATE 
USING (
  restaurant_id IN (
    SELECT restaurant_id 
    FROM public.restaurant_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete content templates from their restaurant" 
ON public.content_templates 
FOR DELETE 
USING (
  restaurant_id IN (
    SELECT restaurant_id 
    FROM public.restaurant_members 
    WHERE user_id = auth.uid()
  )
);

-- Trigger para atualizar timestamps
CREATE TRIGGER update_scheduled_posts_updated_at
BEFORE UPDATE ON public.scheduled_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_content_templates_updated_at
BEFORE UPDATE ON public.content_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();