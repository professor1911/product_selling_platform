-- Create manufacturers table
CREATE TABLE public.manufacturers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  location TEXT,
  website TEXT,
  email TEXT,
  phone TEXT,
  founded TEXT,
  employees TEXT,
  certifications TEXT[],
  rating DECIMAL(2,1) DEFAULT 0,
  total_products INTEGER DEFAULT 0,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  manufacturer_id UUID REFERENCES public.manufacturers(id) ON DELETE CASCADE,
  price DECIMAL(10,2) NOT NULL,
  quantity TEXT NOT NULL,
  image TEXT,
  category TEXT NOT NULL,
  rating DECIMAL(2,1) DEFAULT 0,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.manufacturers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (since this is a product catalog)
CREATE POLICY "Allow public read access on manufacturers" 
ON public.manufacturers 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public read access on products" 
ON public.products 
FOR SELECT 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_manufacturers_updated_at
  BEFORE UPDATE ON public.manufacturers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample manufacturers
INSERT INTO public.manufacturers (name, description, location, website, email, phone, founded, employees, certifications, rating, total_products, image) VALUES
('TechSound Corp', 'Leading manufacturer of premium audio equipment with over 15 years of experience in the industry. We specialize in wireless audio solutions and professional sound equipment.', 'California, USA', 'www.techsound.com', 'contact@techsound.com', '+1 (555) 123-4567', '2008', '150-200', ARRAY['ISO 9001', 'CE', 'FCC'], 4.8, 45, '/lovable-uploads/photo-1649972904349-6e44c42644a7.jpg'),
('HealthTech Solutions', 'Innovative health technology company focused on creating smart wearable devices that help people live healthier lives. Our products combine cutting-edge technology with user-friendly design.', 'Texas, USA', 'www.healthtech.com', 'info@healthtech.com', '+1 (555) 987-6543', '2012', '100-150', ARRAY['FDA', 'CE', 'ISO 13485'], 4.6, 28, '/lovable-uploads/photo-1488590528505-98d2b5aba04b.jpg'),
('NutriLife Industries', 'Premium nutrition and wellness products manufacturer', 'New York, USA', 'www.nutrilife.com', 'contact@nutrilife.com', '+1 (555) 456-7890', '2010', '75-100', ARRAY['FDA', 'USDA Organic'], 4.9, 15, '/lovable-uploads/photo-1518770660439-4636190af475.jpg'),
('OpticsTech Pro', 'Professional camera and optical equipment manufacturer', 'California, USA', 'www.opticstech.com', 'sales@opticstech.com', '+1 (555) 321-0987', '2005', '200-250', ARRAY['ISO 9001', 'CE'], 4.7, 32, '/lovable-uploads/photo-1486312338219-ce68d2c6f44d.jpg'),
('ComfortDesign Ltd', 'Ergonomic furniture and workspace solutions', 'Michigan, USA', 'www.comfortdesign.com', 'info@comfortdesign.com', '+1 (555) 654-3210', '2015', '50-75', ARRAY['GREENGUARD', 'FSC'], 4.5, 22, '/lovable-uploads/photo-1581091226825-a6a2a5aee158.jpg'),
('SecureHome Systems', 'Smart home security and automation solutions', 'Florida, USA', 'www.securehome.com', 'support@securehome.com', '+1 (555) 789-0123', '2018', '100-125', ARRAY['UL Listed', 'FCC'], 4.8, 18, '/lovable-uploads/photo-1526374965328-7f61d4dc18c5.jpg');

-- Insert sample products (getting manufacturer IDs from the inserted data)
INSERT INTO public.products (name, manufacturer_id, price, quantity, image, category, rating, location) 
SELECT 'Premium Wireless Headphones', id, 99.99, '1 piece', '/lovable-uploads/photo-1649972904349-6e44c42644a7.jpg', 'Electronics', 4.8, 'California, USA' FROM public.manufacturers WHERE name = 'TechSound Corp'
UNION ALL
SELECT 'Smart Fitness Tracker', id, 149.99, '1 piece', '/lovable-uploads/photo-1488590528505-98d2b5aba04b.jpg', 'Electronics', 4.6, 'Texas, USA' FROM public.manufacturers WHERE name = 'HealthTech Solutions'
UNION ALL
SELECT 'Organic Protein Powder', id, 45.99, '1 kg', '/lovable-uploads/photo-1518770660439-4636190af475.jpg', 'Health', 4.9, 'New York, USA' FROM public.manufacturers WHERE name = 'NutriLife Industries'
UNION ALL
SELECT 'Professional Camera Lens', id, 299.99, '1 piece', '/lovable-uploads/photo-1486312338219-ce68d2c6f44d.jpg', 'Electronics', 4.7, 'California, USA' FROM public.manufacturers WHERE name = 'OpticsTech Pro'
UNION ALL
SELECT 'Ergonomic Office Chair', id, 189.99, '1 piece', '/lovable-uploads/photo-1581091226825-a6a2a5aee158.jpg', 'Furniture', 4.5, 'Michigan, USA' FROM public.manufacturers WHERE name = 'ComfortDesign Ltd'
UNION ALL
SELECT 'Smart Home Security Kit', id, 249.99, '1 set', '/lovable-uploads/photo-1526374965328-7f61d4dc18c5.jpg', 'Electronics', 4.8, 'Florida, USA' FROM public.manufacturers WHERE name = 'SecureHome Systems';