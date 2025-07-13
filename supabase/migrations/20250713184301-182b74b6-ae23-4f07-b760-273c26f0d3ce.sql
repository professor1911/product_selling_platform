-- Create admin users table
CREATE TABLE public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  role TEXT NOT NULL DEFAULT 'admin',
  permissions TEXT[] DEFAULT ARRAY['manage_manufacturers', 'manage_products', 'manage_leads', 'site_analytics'],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on admin_users
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Admin users can view their own profile
CREATE POLICY "Admin users can view their own profile" 
ON public.admin_users 
FOR SELECT 
USING (auth.uid() = user_id);

-- Admin users can update their own profile
CREATE POLICY "Admin users can update their own profile" 
ON public.admin_users 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for admin users timestamp updates
CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON public.admin_users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create security definer function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = user_uuid
  );
$$;

-- Create policies for admins to manage manufacturers
CREATE POLICY "Admins can manage all manufacturers" 
ON public.manufacturers 
FOR ALL 
USING (public.is_admin());

-- Create policies for admins to manage all profiles
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (public.is_admin());

CREATE POLICY "Admins can update all profiles" 
ON public.profiles 
FOR UPDATE 
USING (public.is_admin());

-- Create policies for admins to view all leads
CREATE POLICY "Admins can view all leads" 
ON public.leads 
FOR SELECT 
USING (public.is_admin());

CREATE POLICY "Admins can manage all leads" 
ON public.leads 
FOR ALL 
USING (public.is_admin());

-- Create policies for admins to manage all products
CREATE POLICY "Admins can manage all products" 
ON public.products 
FOR ALL 
USING (public.is_admin());