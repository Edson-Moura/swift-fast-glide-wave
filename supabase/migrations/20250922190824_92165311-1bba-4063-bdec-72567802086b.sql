-- Create restaurants table
CREATE TABLE public.restaurants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create profiles table for additional user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create restaurant_members table to link users to restaurants
CREATE TABLE public.restaurant_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'staff',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, restaurant_id)
);

-- Enable Row Level Security
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;  
ALTER TABLE public.restaurant_members ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID, restaurant_id UUID)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.restaurant_members
  WHERE restaurant_members.user_id = get_user_role.user_id
    AND restaurant_members.restaurant_id = get_user_role.restaurant_id
    AND is_active = true
  LIMIT 1;
$$;

-- Create function to check if user has role in restaurant
CREATE OR REPLACE FUNCTION public.has_restaurant_role(user_id UUID, restaurant_id UUID, required_role TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.restaurant_members
    WHERE restaurant_members.user_id = has_restaurant_role.user_id
      AND restaurant_members.restaurant_id = has_restaurant_role.restaurant_id
      AND restaurant_members.role = required_role
      AND is_active = true
  );
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for restaurants
CREATE POLICY "Restaurant members can view their restaurants"
ON public.restaurants
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.restaurant_members
    WHERE restaurant_members.restaurant_id = restaurants.id
      AND restaurant_members.user_id = auth.uid()
      AND restaurant_members.is_active = true
  )
);

CREATE POLICY "Admins can manage restaurants"
ON public.restaurants
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.restaurant_members
    WHERE restaurant_members.restaurant_id = restaurants.id
      AND restaurant_members.user_id = auth.uid()
      AND restaurant_members.role = 'admin'
      AND restaurant_members.is_active = true
  )
);

-- RLS Policies for restaurant_members
CREATE POLICY "Members can view restaurant memberships"
ON public.restaurant_members
FOR SELECT
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.restaurant_members rm
    WHERE rm.restaurant_id = restaurant_members.restaurant_id
      AND rm.user_id = auth.uid()
      AND rm.role IN ('admin', 'manager')
      AND rm.is_active = true
  )
);

CREATE POLICY "Admins and managers can manage memberships"
ON public.restaurant_members
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.restaurant_members rm
    WHERE rm.restaurant_id = restaurant_members.restaurant_id
      AND rm.user_id = auth.uid()
      AND rm.role IN ('admin', 'manager')
      AND rm.is_active = true
  )
);

-- Function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name'
  );
  RETURN NEW;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_restaurants_updated_at
  BEFORE UPDATE ON public.restaurants
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_restaurant_members_updated_at
  BEFORE UPDATE ON public.restaurant_members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();