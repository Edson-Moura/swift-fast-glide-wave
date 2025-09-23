-- Fix restaurant creation RLS policy
-- Remove the restrictive policy that prevents restaurant creation
DROP POLICY IF EXISTS "Admins can manage restaurants" ON public.restaurants;

-- Create separate policies for different operations
-- Allow authenticated users to insert new restaurants
CREATE POLICY "Authenticated users can create restaurants" 
ON public.restaurants 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Only restaurant admins can update or delete restaurants  
CREATE POLICY "Admins can update restaurants" 
ON public.restaurants 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 
  FROM public.restaurant_members 
  WHERE restaurant_members.restaurant_id = restaurants.id 
    AND restaurant_members.user_id = auth.uid() 
    AND restaurant_members.role = 'admin'::app_role 
    AND restaurant_members.is_active = true
));

CREATE POLICY "Admins can delete restaurants" 
ON public.restaurants 
FOR DELETE 
USING (EXISTS (
  SELECT 1 
  FROM public.restaurant_members 
  WHERE restaurant_members.restaurant_id = restaurants.id 
    AND restaurant_members.user_id = auth.uid() 
    AND restaurant_members.role = 'admin'::app_role 
    AND restaurant_members.is_active = true
));