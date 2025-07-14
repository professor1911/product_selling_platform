-- Create temporary admin user directly in admin_users table
-- This bypasses the normal signup flow for testing
INSERT INTO admin_users (user_id, role, permissions) 
VALUES ('00000000-0000-0000-0000-000000000001', 'admin', ARRAY['manage_manufacturers', 'manage_products', 'manage_leads', 'site_analytics']);