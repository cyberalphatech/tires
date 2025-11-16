-- Complete Tire Management System Database Schema
-- Execute this file manually in your MySQL database

-- Drop existing tables if they exist (in reverse order due to foreign keys)
DROP TABLE IF EXISTS tires;
DROP TABLE IF EXISTS vehicles;
DROP TABLE IF EXISTS clients;
DROP TABLE IF EXISTS warehouse_positions;
DROP TABLE IF EXISTS customers;

-- Create customers table (bodyshops)
CREATE TABLE customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    business_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'Italy',
    vat_number VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_business_name (business_name)
);

-- Create warehouse_positions table
CREATE TABLE warehouse_positions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bodyshop_id INT NOT NULL,
    scaffale VARCHAR(10) NOT NULL,
    area VARCHAR(10) NOT NULL,
    livello VARCHAR(10) NOT NULL,
    posizione VARCHAR(10) NOT NULL,
    position_code VARCHAR(50) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (bodyshop_id) REFERENCES customers(id) ON DELETE CASCADE,
    UNIQUE KEY unique_position (bodyshop_id, scaffale, area, livello, posizione),
    INDEX idx_bodyshop_id (bodyshop_id),
    INDEX idx_position_code (position_code),
    INDEX idx_scaffale_area (scaffale, area)
);

-- Create clients table (individual clients of bodyshops)
CREATE TABLE clients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bodyshop_id INT NOT NULL,
    client_code VARCHAR(50),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'Italy',
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (bodyshop_id) REFERENCES customers(id) ON DELETE CASCADE,
    INDEX idx_bodyshop_id (bodyshop_id),
    INDEX idx_client_code (client_code),
    INDEX idx_name (first_name, last_name),
    INDEX idx_email (email)
);

-- Create vehicles table
CREATE TABLE vehicles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT NOT NULL,
    license_plate VARCHAR(20) NOT NULL,
    brand VARCHAR(100),
    model VARCHAR(100),
    year INT,
    color VARCHAR(50),
    vin VARCHAR(50),
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    INDEX idx_client_id (client_id),
    INDEX idx_license_plate (license_plate),
    INDEX idx_brand_model (brand, model)
);

-- Create tires table
CREATE TABLE tires (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vehicle_id INT NOT NULL,
    position_id INT,
    tire_code VARCHAR(100),
    brand VARCHAR(100),
    model VARCHAR(100),
    size VARCHAR(50),
    season ENUM('winter', 'summer', 'all_season') NOT NULL,
    dot_code VARCHAR(20),
    year_manufactured INT,
    tread_depth DECIMAL(3,1),
    condition_rating ENUM('excellent', 'good', 'fair', 'poor') DEFAULT 'good',
    storage_location VARCHAR(100),
    notes TEXT,
    stored_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    FOREIGN KEY (position_id) REFERENCES warehouse_positions(id) ON DELETE SET NULL,
    INDEX idx_vehicle_id (vehicle_id),
    INDEX idx_position_id (position_id),
    INDEX idx_tire_code (tire_code),
    INDEX idx_season (season),
    INDEX idx_brand_model (brand, model),
    INDEX idx_stored_date (stored_date)
);

-- Insert sample data for testing
INSERT INTO customers (business_name, contact_person, email, phone, address, city, postal_code, vat_number) VALUES
('GMO Pneumatici', 'Giuseppe Massa', 'gmo@gnail.com', '+393474236357', 'Via Roma 123', 'Milano', '20100', 'IT12345678901'),
('AutoService Pro', 'Marco Rossi', 'info@autoservicepro.it', '+390123456789', 'Via Torino 45', 'Torino', '10100', 'IT98765432109');

-- Insert sample warehouse positions
INSERT INTO warehouse_positions (bodyshop_id, scaffale, area, livello, posizione, position_code, description) VALUES
(1, '01', '01', '01', '01', '01-01-01-01', 'Scaffale 1, Area 1, Livello 1, Posizione 1'),
(1, '01', '01', '01', '02', '01-01-01-02', 'Scaffale 1, Area 1, Livello 1, Posizione 2'),
(1, '01', '01', '01', '03', '01-01-01-03', 'Scaffale 1, Area 1, Livello 1, Posizione 3'),
(1, '01', '01', '02', '01', '01-01-02-01', 'Scaffale 1, Area 1, Livello 2, Posizione 1'),
(1, '01', '01', '02', '02', '01-01-02-02', 'Scaffale 1, Area 1, Livello 2, Posizione 2'),
(1, '01', '02', '01', '01', '01-02-01-01', 'Scaffale 1, Area 2, Livello 1, Posizione 1'),
(1, '01', '02', '01', '02', '01-02-01-02', 'Scaffale 1, Area 2, Livello 1, Posizione 2'),
(1, '02', '01', '01', '01', '02-01-01-01', 'Scaffale 2, Area 1, Livello 1, Posizione 1');

-- Insert sample clients
INSERT INTO clients (bodyshop_id, client_code, first_name, last_name, email, phone, address, city, postal_code) VALUES
(1, 'CLI001', 'Mario', 'Bianchi', 'mario.bianchi@email.com', '+393331234567', 'Via Milano 10', 'Milano', '20100'),
(1, 'CLI002', 'Giulia', 'Verdi', 'giulia.verdi@email.com', '+393339876543', 'Corso Italia 25', 'Milano', '20100'),
(1, 'CLI003', 'Luca', 'Neri', 'luca.neri@email.com', '+393335555555', 'Piazza Duomo 1', 'Milano', '20100');

-- Insert sample vehicles
INSERT INTO vehicles (client_id, license_plate, brand, model, year, color) VALUES
(1, 'AB123CD', 'Fiat', 'Punto', 2018, 'Bianco'),
(1, 'EF456GH', 'Volkswagen', 'Golf', 2020, 'Nero'),
(2, 'IJ789KL', 'BMW', 'Serie 3', 2019, 'Grigio'),
(3, 'MN012OP', 'Audi', 'A4', 2021, 'Blu');

-- Insert sample tires
INSERT INTO tires (vehicle_id, position_id, tire_code, brand, model, size, season, dot_code, year_manufactured, tread_depth, condition_rating, stored_date) VALUES
(1, 1, 'TIR001', 'Michelin', 'Pilot Sport', '205/55R16', 'summer', '2318', 2023, 7.5, 'good', '2024-01-15'),
(1, 2, 'TIR002', 'Michelin', 'Pilot Sport', '205/55R16', 'summer', '2318', 2023, 7.2, 'good', '2024-01-15'),
(1, 3, 'TIR003', 'Pirelli', 'Winter Sottozero', '205/55R16', 'winter', '4523', 2023, 8.0, 'excellent', '2024-04-20'),
(1, 4, 'TIR004', 'Pirelli', 'Winter Sottozero', '205/55R16', 'winter', '4523', 2023, 7.8, 'excellent', '2024-04-20'),
(2, 5, 'TIR005', 'Continental', 'PremiumContact', '225/45R17', 'summer', '1823', 2023, 6.5, 'fair', '2024-02-10'),
(3, 6, 'TIR006', 'Bridgestone', 'Blizzak', '225/50R17', 'winter', '3623', 2023, 8.5, 'excellent', '2024-03-05');

-- Create indexes for better performance
CREATE INDEX idx_tires_season_active ON tires(season, is_active);
CREATE INDEX idx_vehicles_active ON vehicles(is_active);
CREATE INDEX idx_clients_active ON clients(is_active);
CREATE INDEX idx_warehouse_positions_active ON warehouse_positions(is_active);

-- Show created tables
SHOW TABLES;

-- Show table structures
DESCRIBE customers;
DESCRIBE clients;
DESCRIBE vehicles;
DESCRIBE tires;
DESCRIBE warehouse_positions;

SELECT 'Database schema created successfully!' as status;
