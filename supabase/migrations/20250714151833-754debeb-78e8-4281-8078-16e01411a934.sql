-- Insert dummy admin user
-- First, create a dummy user entry (this would normally be created by Supabase Auth)
-- For testing, we'll use a known UUID that you can reference

-- Insert admin user record
INSERT INTO public.admin_users (user_id, role, permissions) 
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',  -- Dummy admin user ID
  'admin',
  ARRAY['manage_manufacturers', 'manage_products', 'manage_leads', 'site_analytics']
);

-- Insert manufacturer profile (approved)
INSERT INTO public.profiles (user_id, role, approved, manufacturer_id)
VALUES (
  '550e8400-e29b-41d4-a716-446655440001',  -- Dummy manufacturer user ID
  'manufacturer',
  true,
  (SELECT id FROM public.manufacturers LIMIT 1)  -- Link to first manufacturer
);

-- Insert manufacturer profile (pending approval)
INSERT INTO public.profiles (user_id, role, approved, manufacturer_id)
VALUES (
  '550e8400-e29b-41d4-a716-446655440002',  -- Dummy pending manufacturer user ID
  'manufacturer',
  false,
  (SELECT id FROM public.manufacturers OFFSET 1 LIMIT 1)  -- Link to second manufacturer if exists
);

-- Create some dummy manufacturers if none exist
INSERT INTO public.manufacturers (name, description, location, email, phone, website)
VALUES 
  ('TechCorp Manufacturing', 'Leading technology manufacturer', 'San Francisco, CA', 'contact@techcorp.com', '+1-555-0100', 'https://techcorp.com'),
  ('Green Solutions Ltd', 'Sustainable manufacturing solutions', 'Portland, OR', 'info@greensolutions.com', '+1-555-0200', 'https://greensolutions.com')
ON CONFLICT DO NOTHING;