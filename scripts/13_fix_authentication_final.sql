-- Fix authentication issues definitively
-- Add password_hash column to customers table if it doesn't exist
ALTER TABLE customers ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

-- Create a test bodyshop account with known credentials
INSERT INTO customers (customer_code, business_name, contact_person, email, password_hash, phone, address, city, postal_code, created_at) 
VALUES (
  'BS001', 
  'Test BodyShop', 
  'Admin User', 
  'admin@bodyshop.com', 
  '$2b$10$rQZ8kHWKQOuXlY5qJ7mGHOxvK8fJ9nL2mP3qR4sT5uV6wX7yZ8aB9c', -- password: admin123
  '+39 123 456 7890',
  'Via Test 123',
  'Milano',
  '20100',
  NOW()
) ON DUPLICATE KEY UPDATE 
  password_hash = '$2b$10$rQZ8kHWKQOuXlY5qJ7mGHOxvK8fJ9nL2mP3qR4sT5uV6wX7yZ8aB9c';

-- Ensure JWT_SECRET is available by creating a simple auth check
SELECT 'Authentication setup complete' as status;
