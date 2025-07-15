-- Make vaibhav@admin.com a working admin user
INSERT INTO admin_users (user_id, role, permissions) 
VALUES ('60e86549-9c89-4b13-bda3-43975be07fd8', 'admin', ARRAY['manage_manufacturers', 'manage_products', 'manage_leads', 'site_analytics'])
ON CONFLICT (user_id) DO UPDATE SET
  role = 'admin',
  permissions = ARRAY['manage_manufacturers', 'manage_products', 'manage_leads', 'site_analytics'];