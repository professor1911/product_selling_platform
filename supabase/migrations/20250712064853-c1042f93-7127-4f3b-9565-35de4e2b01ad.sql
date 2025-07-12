-- Create profiles table for manufacturers
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  manufacturer_id UUID REFERENCES public.manufacturers(id) ON DELETE SET NULL,
  role TEXT NOT NULL DEFAULT 'manufacturer',
  approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create leads table for buyer inquiries
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  manufacturer_id UUID REFERENCES public.manufacturers(id) ON DELETE CASCADE,
  buyer_name TEXT NOT NULL,
  buyer_email TEXT NOT NULL,
  buyer_phone TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Enable RLS on leads table  
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create policies for leads
CREATE POLICY "Public can insert leads" 
ON public.leads 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Manufacturers can view their leads" 
ON public.leads 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.manufacturer_id = leads.manufacturer_id
    AND profiles.approved = true
  )
);

CREATE POLICY "Manufacturers can update their leads" 
ON public.leads 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.manufacturer_id = leads.manufacturer_id
    AND profiles.approved = true
  )
);

-- Update products RLS policies for manufacturer access
DROP POLICY IF EXISTS "Allow public read access on products" ON public.products;

CREATE POLICY "Public can read products" 
ON public.products 
FOR SELECT 
USING (true);

CREATE POLICY "Manufacturers can manage their products" 
ON public.products 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.manufacturer_id = products.manufacturer_id
    AND profiles.approved = true
  )
);

-- Add triggers for timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user profile creation (for when you manually approve manufacturers)
CREATE OR REPLACE FUNCTION public.handle_new_manufacturer_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, role, approved)
  VALUES (NEW.id, 'manufacturer', false);
  RETURN NEW;
END;
$$;

-- Trigger to create profile for new users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_manufacturer_user();