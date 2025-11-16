-- Create users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'manager', 'user') DEFAULT 'user',
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_role (role)
);

-- Updated schema to match login API expectations with password_hash and first_name/last_name fields
-- Insert default admin user (password: admin123)
INSERT INTO users (username, email, password_hash, first_name, last_name, role) VALUES 
('admin', 'admin@tirespro.com', '$2a$12$LQv3c1yqBWVHxkd0LQ4YCOdHrADfEqJpq2viEUzE8/.1pKlYyAYHm', 'Admin', 'User', 'admin')
ON DUPLICATE KEY UPDATE email = email;

-- Insert sample users for testing
INSERT INTO users (username, email, password_hash, first_name, last_name, role) VALUES 
('manager', 'manager@tirespro.com', '$2a$12$LQv3c1yqBWVHxkd0LQ4YCOdHrADfEqJpq2viEUzE8/.1pKlYyAYHm', 'Manager', 'User', 'manager'),
('user', 'user@tirespro.com', '$2a$12$LQv3c1yqBWVHxkd0LQ4YCOdHrADfEqJpq2viEUzE8/.1pKlYyAYHm', 'Standard', 'User', 'user')
ON DUPLICATE KEY UPDATE email = email;
