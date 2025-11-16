-- Add authentication fields to customers table
ALTER TABLE customers 
ADD COLUMN password_hash VARCHAR(255) AFTER email,
ADD COLUMN is_active BOOLEAN DEFAULT TRUE AFTER password_hash,
ADD COLUMN last_login TIMESTAMP NULL AFTER is_active;

-- Create index for customer email login
CREATE INDEX idx_customers_email ON customers(email);

-- Insert sample customers with login credentials (password: customer123)
INSERT INTO customers (first_name, last_name, email, password_hash, phone, address, city, postal_code, tax_code, customer_code) VALUES 
('Mario', 'Rossi', 'mario.rossi@email.com', '$2a$12$LQv3c1yqBWVHxkd0LQ4YCOdHrADfEqJpq2viEUzE8/.1pKlYyAYHm', '+39 123 456 7890', 'Via Roma 123', 'Milano', '20100', 'RSSMRA80A01F205X', 'CUST001'),
('Giulia', 'Bianchi', 'giulia.bianchi@email.com', '$2a$12$LQv3c1yqBWVHxkd0LQ4YCOdHrADfEqJpq2viEUzE8/.1pKlYyAYHm', '+39 234 567 8901', 'Via Venezia 45', 'Roma', '00100', 'BNCGLI85B02H501Y', 'CUST002'),
('Luca', 'Verdi', 'luca.verdi@email.com', '$2a$12$LQv3c1yqBWVHxkd0LQ4YCOdHrADfEqJpq2viEUzE8/.1pKlYyAYHm', '+39 345 678 9012', 'Corso Italia 67', 'Torino', '10100', 'VRDLCU90C03L219Z', 'CUST003')
ON DUPLICATE KEY UPDATE email = email;
