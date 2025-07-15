-- First, let's create a proper admin user that works
-- We'll insert directly into auth.users and admin_users tables

-- Insert into auth.users (this creates the actual user account)
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  role,
  aud,
  confirmation_token,
  email_change_token_new,
  recovery_token
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  '00000000-0000-0000-0000-000000000000',
  'admin@portal.com',
  crypt('admin123', gen_salt('bf')),
  now(),
  now(),
  now(),
  'authenticated',
  'authenticated',
  '',
  '',
  ''
);

-- Now insert the admin record
INSERT INTO admin_users (user_id, role, permissions) 
VALUES ('11111111-1111-1111-1111-111111111111', 'admin', ARRAY['manage_manufacturers', 'manage_products', 'manage_leads', 'site_analytics'])
ON CONFLICT (user_id) DO NOTHING;

-- Remove the policy that allows users to insert into admin_users
DROP POLICY IF EXISTS "Users can create admin access" ON admin_users;