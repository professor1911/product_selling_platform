-- Create a manufacturer for the admin user vaibhav@admin.com and update their profile
-- First, create a manufacturer company for the admin
INSERT INTO manufacturers (
  id,
  name,
  description,
  email,
  phone,
  website,
  location,
  employees,
  founded,
  certifications
) VALUES (
  gen_random_uuid(),
  'TechCorp Manufacturing',
  'Leading technology manufacturing company specializing in electronics and hardware components.',
  'vaibhav@admin.com',
  '+1-555-0123',
  'https://techcorp.example.com',
  'San Francisco, CA',
  '100-500',
  '2010',
  ARRAY['ISO 9001', 'ISO 14001', 'CE Certification']
) ON CONFLICT DO NOTHING;

-- Get the manufacturer ID we just created
DO $$
DECLARE
  manufacturer_uuid uuid;
BEGIN
  -- Get the manufacturer ID
  SELECT id INTO manufacturer_uuid 
  FROM manufacturers 
  WHERE email = 'vaibhav@admin.com';
  
  -- Update the profile to link to this manufacturer and approve it
  INSERT INTO profiles (user_id, role, manufacturer_id, approved)
  VALUES ('60e86549-9c89-4b13-bda3-43975be07fd8', 'manufacturer', manufacturer_uuid, true)
  ON CONFLICT (user_id) DO UPDATE SET
    manufacturer_id = manufacturer_uuid,
    approved = true;
END $$;