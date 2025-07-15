-- Add some sample products and leads for demonstration
-- Get the manufacturer ID for the admin user
DO $$
DECLARE
  manufacturer_uuid uuid;
BEGIN
  -- Get the manufacturer ID
  SELECT id INTO manufacturer_uuid 
  FROM manufacturers 
  WHERE email = 'vaibhav@admin.com';
  
  -- Add sample products
  INSERT INTO products (name, category, price, quantity, location, manufacturer_id, image) VALUES
  ('High-Performance Laptop', 'Electronics', 1299.99, '50 units', 'San Francisco, CA', manufacturer_uuid, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500'),
  ('Wireless Headphones', 'Electronics', 199.99, '200 units', 'San Francisco, CA', manufacturer_uuid, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'),
  ('Smart Watch Pro', 'Electronics', 399.99, '100 units', 'San Francisco, CA', manufacturer_uuid, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'),
  ('Gaming Keyboard', 'Electronics', 89.99, '150 units', 'San Francisco, CA', manufacturer_uuid, 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=500'),
  ('4K Monitor', 'Electronics', 349.99, '75 units', 'San Francisco, CA', manufacturer_uuid, 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500')
  ON CONFLICT DO NOTHING;
  
  -- Add sample leads
  INSERT INTO leads (buyer_name, buyer_email, buyer_phone, message, manufacturer_id, product_id, status) 
  SELECT 
    'John Smith',
    'john.smith@example.com',
    '+1-555-0100',
    'Hi, I am interested in bulk purchasing laptops for my company. Could you please provide a quote for 20 units?',
    manufacturer_uuid,
    p.id,
    'new'
  FROM products p 
  WHERE p.name = 'High-Performance Laptop' AND p.manufacturer_id = manufacturer_uuid
  ON CONFLICT DO NOTHING;
  
  INSERT INTO leads (buyer_name, buyer_email, buyer_phone, message, manufacturer_id, product_id, status) 
  SELECT 
    'Sarah Johnson',
    'sarah.j@techcorp.com',
    '+1-555-0101',
    'Looking for wireless headphones for our office team. Need around 50 units. What are your bulk pricing options?',
    manufacturer_uuid,
    p.id,
    'contacted'
  FROM products p 
  WHERE p.name = 'Wireless Headphones' AND p.manufacturer_id = manufacturer_uuid
  ON CONFLICT DO NOTHING;
  
  INSERT INTO leads (buyer_name, buyer_email, message, manufacturer_id, product_id, status) 
  SELECT 
    'Mike Chen',
    'mike.chen@startup.io',
    'Interested in the 4K monitors for our design team. Can we schedule a demo?',
    manufacturer_uuid,
    p.id,
    'converted'
  FROM products p 
  WHERE p.name = '4K Monitor' AND p.manufacturer_id = manufacturer_uuid
  ON CONFLICT DO NOTHING;
END $$;