-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create restaurants table
CREATE TABLE public.restaurants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#3B82F6',
  secondary_color TEXT DEFAULT '#1E40AF',
  font_family TEXT DEFAULT 'Inter',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create restaurant members table for user roles
CREATE TABLE public.restaurant_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'chef', 'staff', 'inventory')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(restaurant_id, user_id)
);

-- Create inventory items table
CREATE TABLE public.inventory_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  unit TEXT NOT NULL,
  current_stock DECIMAL(10,2) NOT NULL DEFAULT 0,
  min_stock DECIMAL(10,2) NOT NULL DEFAULT 0,
  max_stock DECIMAL(10,2),
  cost_per_unit DECIMAL(10,2) NOT NULL DEFAULT 0,
  supplier_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create consumption history table
CREATE TABLE public.consumption_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
  quantity DECIMAL(10,2) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create alerts table
CREATE TABLE public.alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  item_id UUID REFERENCES public.inventory_items(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('low_stock', 'expired', 'price_change')),
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create restock suggestions table
CREATE TABLE public.restock_suggestions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
  suggested_quantity DECIMAL(10,2) NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create suppliers table
CREATE TABLE public.suppliers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  payment_terms TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create purchase history table
CREATE TABLE public.purchase_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  supplier_id UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  purchase_date DATE NOT NULL,
  invoice_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consumption_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restock_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for restaurants
CREATE POLICY "Users can view restaurants they are members of" ON public.restaurants FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.restaurant_members 
    WHERE restaurant_id = restaurants.id AND user_id = auth.uid()
  )
);

CREATE POLICY "Admins can update restaurant details" ON public.restaurants FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.restaurant_members 
    WHERE restaurant_id = restaurants.id AND user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Users can create restaurants" ON public.restaurants FOR INSERT WITH CHECK (true);

-- Create RLS policies for restaurant members
CREATE POLICY "Users can view members of their restaurants" ON public.restaurant_members FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.restaurant_members rm
    WHERE rm.restaurant_id = restaurant_members.restaurant_id AND rm.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage restaurant members" ON public.restaurant_members FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.restaurant_members rm
    WHERE rm.restaurant_id = restaurant_members.restaurant_id AND rm.user_id = auth.uid() AND rm.role = 'admin'
  )
);

CREATE POLICY "Users can join restaurants" ON public.restaurant_members FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for inventory items
CREATE POLICY "Restaurant members can view inventory" ON public.inventory_items FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.restaurant_members 
    WHERE restaurant_id = inventory_items.restaurant_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Authorized users can manage inventory" ON public.inventory_items FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.restaurant_members 
    WHERE restaurant_id = inventory_items.restaurant_id AND user_id = auth.uid() 
    AND role IN ('admin', 'manager', 'inventory')
  )
);

-- Create RLS policies for consumption history
CREATE POLICY "Restaurant members can view consumption history" ON public.consumption_history FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.restaurant_members 
    WHERE restaurant_id = consumption_history.restaurant_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Authorized users can manage consumption history" ON public.consumption_history FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.restaurant_members 
    WHERE restaurant_id = consumption_history.restaurant_id AND user_id = auth.uid() 
    AND role IN ('admin', 'manager', 'inventory', 'chef')
  )
);

-- Create similar policies for other tables
CREATE POLICY "Restaurant members can view alerts" ON public.alerts FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.restaurant_members 
    WHERE restaurant_id = alerts.restaurant_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Restaurant members can view restock suggestions" ON public.restock_suggestions FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.restaurant_members 
    WHERE restaurant_id = restock_suggestions.restaurant_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Restaurant members can view suppliers" ON public.suppliers FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.restaurant_members 
    WHERE restaurant_id = suppliers.restaurant_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Authorized users can manage suppliers" ON public.suppliers FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.restaurant_members 
    WHERE restaurant_id = suppliers.restaurant_id AND user_id = auth.uid() 
    AND role IN ('admin', 'manager')
  )
);

CREATE POLICY "Restaurant members can view purchase history" ON public.purchase_history FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.restaurant_members 
    WHERE restaurant_id = purchase_history.restaurant_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Authorized users can manage purchase history" ON public.purchase_history FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.restaurant_members 
    WHERE restaurant_id = purchase_history.restaurant_id AND user_id = auth.uid() 
    AND role IN ('admin', 'manager')
  )
);

-- Create storage bucket for logos and images
INSERT INTO storage.buckets (id, name, public) VALUES ('restaurant-assets', 'restaurant-assets', true);

-- Create storage policies
CREATE POLICY "Restaurant members can view assets" ON storage.objects FOR SELECT USING (bucket_id = 'restaurant-assets');

CREATE POLICY "Restaurant members can upload assets" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'restaurant-assets' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Restaurant members can update their assets" ON storage.objects FOR UPDATE USING (
  bucket_id = 'restaurant-assets' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Restaurant members can delete their assets" ON storage.objects FOR DELETE USING (
  bucket_id = 'restaurant-assets' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_restaurants_updated_at BEFORE UPDATE ON public.restaurants FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON public.inventory_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON public.suppliers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();