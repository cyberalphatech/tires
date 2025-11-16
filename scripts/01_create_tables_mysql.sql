-- Tire Management System - MySQL Database Schema
-- Run this script first to create all tables and relationships

-- Create database (optional - uncomment if needed)
-- CREATE DATABASE tire_management;
-- USE tire_management;

-- Customers table
CREATE TABLE customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_code VARCHAR(20) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    postal_code VARCHAR(20),
    tax_code VARCHAR(50),
    vat_number VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_customer_code (customer_code),
    INDEX idx_email (email),
    INDEX idx_phone (phone)
);

-- Vehicles table
CREATE TABLE vehicles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    license_plate VARCHAR(20) UNIQUE NOT NULL,
    make VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INT,
    vin VARCHAR(50),
    engine_type VARCHAR(50),
    fuel_type VARCHAR(50),
    current_km INT DEFAULT 0,
    image_urls JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    INDEX idx_license_plate (license_plate),
    INDEX idx_customer_id (customer_id),
    INDEX idx_make_model (make, model)
);

-- Tires table
CREATE TABLE tires (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tire_code VARCHAR(50) UNIQUE NOT NULL,
    customer_id INT NOT NULL,
    vehicle_id INT,
    brand VARCHAR(100),
    size VARCHAR(50) NOT NULL,
    season ENUM('winter', 'summer', 'all_season') NOT NULL,
    position VARCHAR(20), -- A6, A5, P6, P4, etc.
    dot_code VARCHAR(20),
    manufacture_year INT,
    tread_depth DECIMAL(3,1), -- in mm
    condition_rating ENUM('excellent', 'good', 'fair', 'poor') DEFAULT 'good',
    purchase_price DECIMAL(10,2),
    installation_date DATE,
    removal_date DATE,
    max_km_before_disposal INT,
    current_km INT DEFAULT 0,
    warehouse_location VARCHAR(100),
    status ENUM('in_use', 'stored', 'scrapped', 'sold') DEFAULT 'stored',
    deposit_type ENUM('removed_from_vehicle', 'purchased_from_customer') NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL,
    INDEX idx_tire_code (tire_code),
    INDEX idx_customer_id (customer_id),
    INDEX idx_vehicle_id (vehicle_id),
    INDEX idx_season (season),
    INDEX idx_status (status),
    INDEX idx_warehouse_location (warehouse_location)
);

-- KM History table
CREATE TABLE km_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vehicle_id INT NOT NULL,
    recorded_km INT NOT NULL,
    previous_km INT,
    km_difference INT,
    recorded_date DATE NOT NULL,
    service_type VARCHAR(100), -- tire change, maintenance, etc.
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    INDEX idx_vehicle_id (vehicle_id),
    INDEX idx_recorded_date (recorded_date)
);

-- Notes History table
CREATE TABLE notes_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vehicle_id INT NOT NULL,
    note_text TEXT NOT NULL,
    note_type VARCHAR(50) DEFAULT 'general', -- general, maintenance, tire_change, etc.
    created_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    INDEX idx_vehicle_id (vehicle_id),
    INDEX idx_note_type (note_type),
    INDEX idx_created_at (created_at)
);

-- Scrapped Tires table
CREATE TABLE scrapped_tires (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tire_id INT NOT NULL,
    customer_id INT NOT NULL,
    vehicle_id INT,
    tire_code VARCHAR(50) NOT NULL,
    brand VARCHAR(100),
    size VARCHAR(50),
    season ENUM('winter', 'summer', 'all_season'),
    scrap_reason VARCHAR(255) NOT NULL,
    scrap_date DATE NOT NULL,
    final_tread_depth DECIMAL(3,1),
    final_km INT,
    disposal_method VARCHAR(100), -- recycling, landfill, etc.
    disposal_cost DECIMAL(10,2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (tire_id) REFERENCES tires(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL,
    INDEX idx_tire_id (tire_id),
    INDEX idx_customer_id (customer_id),
    INDEX idx_scrap_date (scrap_date),
    INDEX idx_season (season)
);

-- Tire Deposits table (for tracking storage operations)
CREATE TABLE tire_deposits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    vehicle_id INT,
    deposit_date DATE NOT NULL,
    retrieval_date DATE,
    total_tires INT DEFAULT 0,
    season ENUM('winter', 'summer', 'mixed') NOT NULL,
    storage_location VARCHAR(100),
    deposit_fee DECIMAL(10,2),
    status ENUM('active', 'retrieved', 'partial') DEFAULT 'active',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL,
    INDEX idx_customer_id (customer_id),
    INDEX idx_deposit_date (deposit_date),
    INDEX idx_status (status),
    INDEX idx_season (season)
);
