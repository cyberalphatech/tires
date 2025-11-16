-- Complete Tire Management System Database Setup
-- This script creates all required tables with proper relationships

-- Drop existing tables if they exist (in correct order to handle foreign keys)
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
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_business_name (business_name)
);

-- Create clients table (individual clients of bodyshops)
CREATE TABLE clients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bodyshop_id INT NOT NULL,
    client_code VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'Italy',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (bodyshop_id) REFERENCES customers(id) ON DELETE CASCADE,
    INDEX idx_bodyshop_id (bodyshop_id),
    INDEX idx_client_code (client_code),
    INDEX idx_email (email)
);

-- Create vehicles table
CREATE TABLE vehicles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT NOT NULL,
    license_plate VARCHAR(20) UNIQUE NOT NULL,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INT,
    color VARCHAR(50),
    vin VARCHAR(50),
    engine_type VARCHAR(50),
    fuel_type VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    INDEX idx_client_id (client_id),
    INDEX idx_license_plate (license_plate)
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
    INDEX idx_position_code (position_code)
);

-- Create tires table
CREATE TABLE tires (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vehicle_id INT NOT NULL,
    position VARCHAR(20) NOT NULL,
    brand VARCHAR(100),
    model VARCHAR(100),
    size VARCHAR(50),
    season ENUM('winter', 'summer', 'all_season') NOT NULL,
    dot_code VARCHAR(20),
    year_manufactured INT,
    tread_depth DECIMAL(3,1),
    condition_rating INT CHECK (condition_rating BETWEEN 1 AND 10),
    warehouse_position_id INT,
    storage_date DATE,
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    FOREIGN KEY (warehouse_position_id) REFERENCES warehouse_positions(id) ON DELETE SET NULL,
    INDEX idx_vehicle_id (vehicle_id),
    INDEX idx_season (season),
    INDEX idx_warehouse_position_id (warehouse_position_id)
);

-- Insert sample data for testing
INSERT INTO customers (business_name, contact_person, email, phone, address, city, postal_code, password_hash) VALUES
('GMO Pneumatici', 'Giuseppe Massa', 'gmo@gnail.com', '+393474236357', 'Via Roma 123', 'Milano', '20100', '$2b$10$example_hash_for_password'),
('AutoService Pro', 'Marco Rossi', 'info@autoservicepro.it', '+393331234567', 'Via Torino 45', 'Torino', '10100', '$2b$10$example_hash_for_password2');

-- Insert sample clients
INSERT INTO clients (bodyshop_id, client_code, first_name, last_name, email, phone, address, city, postal_code) VALUES
(1, 'GMO001', 'Mario', 'Bianchi', 'mario.bianchi@email.com', '+393331111111', 'Via Milano 10', 'Milano', '20100'),
(1, 'GMO002', 'Luigi', 'Verdi', 'luigi.verdi@email.com', '+393332222222', 'Via Roma 20', 'Milano', '20100'),
(1, 'GMO003', 'Anna', 'Rossi', 'anna.rossi@email.com', '+393333333333', 'Via Napoli 30', 'Milano', '20100');

-- Insert sample vehicles
INSERT INTO vehicles (client_id, license_plate, brand, model, year, color) VALUES
(1, 'AB123CD', 'Fiat', 'Punto', 2018, 'Bianco'),
(1, 'EF456GH', 'Volkswagen', 'Golf', 2020, 'Nero'),
(2, 'IJ789KL', 'BMW', 'Serie 3', 2019, 'Grigio'),
(3, 'MN012OP', 'Audi', 'A4', 2021, 'Blu');

-- Insert sample warehouse positions
INSERT INTO warehouse_positions (bodyshop_id, scaffale, area, livello, posizione, position_code, description) VALUES
(1, '01', '01', '01', '01', '01-01-01-01', 'Scaffale 1, Area 1, Livello 1, Posizione 1'),
(1, '01', '01', '01', '02', '01-01-01-02', 'Scaffale 1, Area 1, Livello 1, Posizione 2'),
(1, '01', '01', '01', '03', '01-01-01-03', 'Scaffale 1, Area 1, Livello 1, Posizione 3'),
(1, '01', '01', '02', '01', '01-01-02-01', 'Scaffale 1, Area 1, Livello 2, Posizione 1'),
(1, '01', '01', '02', '02', '01-01-02-02', 'Scaffale 1, Area 1, Livello 2, Posizione 2');

-- Insert sample tires
INSERT INTO tires (vehicle_id, position, brand, model, size, season, dot_code, year_manufactured, tread_depth, condition_rating, warehouse_position_id, storage_date) VALUES
(1, 'Anteriore Sinistro', 'Michelin', 'Pilot Sport', '205/55R16', 'summer', '2318', 2023, 7.5, 8, 1, '2024-01-15'),
(1, 'Anteriore Destro', 'Michelin', 'Pilot Sport', '205/55R16', 'summer', '2318', 2023, 7.2, 8, 2, '2024-01-15'),
(1, 'Posteriore Sinistro', 'Michelin', 'Pilot Sport', '205/55R16', 'summer', '2318', 2023, 6.8, 7, 3, '2024-01-15'),
(1, 'Posteriore Destro', 'Michelin', 'Pilot Sport', '205/55R16', 'summer', '2318', 2023, 7.0, 7, 4, '2024-01-15'),
(2, 'Anteriore Sinistro', 'Continental', 'WinterContact', '225/45R17', 'winter', '1523', 2023, 8.2, 9, 5, '2024-02-10'),
(2, 'Anteriore Destro', 'Continental', 'WinterContact', '225/45R17', 'winter', '1523', 2023, 8.0, 9, NULL, '2024-02-10');

COMMIT;
