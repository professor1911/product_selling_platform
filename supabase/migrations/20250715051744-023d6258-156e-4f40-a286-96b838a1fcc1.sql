-- Clean up any problematic entries and create a proper admin user
-- First, remove any invalid entries from admin_users that don't have corresponding auth users
DELETE FROM admin_users WHERE user_id NOT IN (SELECT id FROM auth.users);

-- Remove the problematic direct auth.users insert
DELETE FROM auth.users WHERE id = '11111111-1111-1111-1111-111111111111';

-- Remove the corresponding admin_users entry
DELETE FROM admin_users WHERE user_id = '11111111-1111-1111-1111-111111111111';