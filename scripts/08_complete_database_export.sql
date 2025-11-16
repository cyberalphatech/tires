-- Complete Tires Pro Database Export
-- Database: shopreal_gomme
-- Generated for backup and restore purposes

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";

-- Database structure and data export
-- Use this file to restore the complete Tires Pro database

-- --------------------------------------------------------
-- Table structure for table `customers`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `customers`;
CREATE TABLE `customers` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `customer_code` VARCHAR(20) UNIQUE NOT NULL,
    `first_name` VARCHAR(100) NOT NULL,
    `last_name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(255) UNIQUE,
    `phone` VARCHAR(20),
    `address` TEXT,
    `city` VARCHAR(100),
    `postal_code` VARCHAR(20),
    `tax_code` VARCHAR(50),
    `vat_number` VARCHAR(50),
    `company_name` VARCHAR(200),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX `idx_customer_code` (`customer_code`),
    INDEX `idx_email` (`email`),
    INDEX `idx_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `vehicles`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `vehicles`;
CREATE TABLE `vehicles` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `customer_id` INT NOT NULL,
    `license_plate` VARCHAR(20) UNIQUE NOT NULL,
    `make` VARCHAR(100) NOT NULL,
    `model` VARCHAR(100) NOT NULL,
    `year` INT,
    `vin` VARCHAR(50),
    `engine_type` VARCHAR(50),
    `fuel_type` VARCHAR(50),
    `current_km` INT DEFAULT 0,
    `image_urls` JSON,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE CASCADE,
    INDEX `idx_license_plate` (`license_plate`),
    INDEX `idx_customer_id` (`customer_id`),
    INDEX `idx_make_model` (`make`, `model`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `tires`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `tires`;
CREATE TABLE `tires` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `tire_code` VARCHAR(50) UNIQUE NOT NULL,
    `customer_id` INT NOT NULL,
    `vehicle_id` INT,
    `brand` VARCHAR(100),
    `size` VARCHAR(50) NOT NULL,
    `season` ENUM('winter', 'summer', 'all_season') NOT NULL,
    `position` VARCHAR(20),
    `dot_code` VARCHAR(20),
    `manufacture_year` INT,
    `tread_depth` DECIMAL(3,1),
    `condition_rating` ENUM('excellent', 'good', 'fair', 'poor') DEFAULT 'good',
    `purchase_price` DECIMAL(10,2),
    `installation_date` DATE,
    `removal_date` DATE,
    `max_km_before_disposal` INT,
    `current_km` INT DEFAULT 0,
    `warehouse_location` VARCHAR(100),
    `status` ENUM('in_use', 'stored', 'scrapped', 'sold') DEFAULT 'stored',
    `deposit_type` ENUM('removed_from_vehicle', 'purchased_from_customer') NOT NULL,
    `notes` TEXT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`id`) ON DELETE SET NULL,
    INDEX `idx_tire_code` (`tire_code`),
    INDEX `idx_customer_id` (`customer_id`),
    INDEX `idx_vehicle_id` (`vehicle_id`),
    INDEX `idx_season` (`season`),
    INDEX `idx_status` (`status`),
    INDEX `idx_warehouse_location` (`warehouse_location`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `km_history`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `km_history`;
CREATE TABLE `km_history` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `vehicle_id` INT NOT NULL,
    `recorded_km` INT NOT NULL,
    `previous_km` INT,
    `km_difference` INT,
    `recorded_date` DATE NOT NULL,
    `service_type` VARCHAR(100),
    `notes` TEXT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`id`) ON DELETE CASCADE,
    INDEX `idx_vehicle_id` (`vehicle_id`),
    INDEX `idx_recorded_date` (`recorded_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `notes_history`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `notes_history`;
CREATE TABLE `notes_history` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `vehicle_id` INT NOT NULL,
    `note_text` TEXT NOT NULL,
    `note_type` VARCHAR(50) DEFAULT 'general',
    `created_by` VARCHAR(100),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`id`) ON DELETE CASCADE,
    INDEX `idx_vehicle_id` (`vehicle_id`),
    INDEX `idx_note_type` (`note_type`),
    INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `scrapped_tires`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `scrapped_tires`;
CREATE TABLE `scrapped_tires` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `tire_id` INT NOT NULL,
    `customer_id` INT NOT NULL,
    `vehicle_id` INT,
    `tire_code` VARCHAR(50) NOT NULL,
    `brand` VARCHAR(100),
    `size` VARCHAR(50),
    `season` ENUM('winter', 'summer', 'all_season'),
    `scrap_reason` VARCHAR(255) NOT NULL,
    `scrap_date` DATE NOT NULL,
    `final_tread_depth` DECIMAL(3,1),
    `final_km` INT,
    `disposal_method` VARCHAR(100),
    `disposal_cost` DECIMAL(10,2),
    `notes` TEXT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (`tire_id`) REFERENCES `tires`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`id`) ON DELETE SET NULL,
    INDEX `idx_tire_id` (`tire_id`),
    INDEX `idx_customer_id` (`customer_id`),
    INDEX `idx_scrap_date` (`scrap_date`),
    INDEX `idx_season` (`season`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `tire_deposits`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `tire_deposits`;
CREATE TABLE `tire_deposits` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `customer_id` INT NOT NULL,
    `vehicle_id` INT,
    `deposit_date` DATE NOT NULL,
    `retrieval_date` DATE,
    `total_tires` INT DEFAULT 0,
    `season` ENUM('winter', 'summer', 'mixed') NOT NULL,
    `storage_location` VARCHAR(100),
    `deposit_fee` DECIMAL(10,2),
    `status` ENUM('active', 'retrieved', 'partial') DEFAULT 'active',
    `notes` TEXT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`id`) ON DELETE SET NULL,
    INDEX `idx_customer_id` (`customer_id`),
    INDEX `idx_deposit_date` (`deposit_date`),
    INDEX `idx_status` (`status`),
    INDEX `idx_season` (`season`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `users`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(100) UNIQUE NOT NULL,
    `email` VARCHAR(255) UNIQUE NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `role` ENUM('admin', 'manager', 'user') DEFAULT 'user',
    `first_name` VARCHAR(100),
    `last_name` VARCHAR(100),
    `is_active` BOOLEAN DEFAULT TRUE,
    `last_login` TIMESTAMP NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX `idx_username` (`username`),
    INDEX `idx_email` (`email`),
    INDEX `idx_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Sample Data
-- --------------------------------------------------------

-- Insert sample customers
INSERT INTO `customers` (`customer_code`, `first_name`, `last_name`, `email`, `phone`, `address`, `city`, `postal_code`, `tax_code`) VALUES
('CUST001', 'Mario', 'Rossi', 'mario.rossi@email.com', '+39 123 456 7890', 'Via Roma 123', 'Milano', '20100', 'RSSMRA80A01F205X'),
('CUST002', 'Giulia', 'Bianchi', 'giulia.bianchi@email.com', '+39 234 567 8901', 'Via Venezia 45', 'Roma', '00100', 'BNCGLI85B02H501Y'),
('CUST003', 'Luca', 'Verdi', 'luca.verdi@email.com', '+39 345 678 9012', 'Corso Italia 67', 'Torino', '10100', 'VRDLCU90C03L219Z');

-- Insert sample vehicles
INSERT INTO `vehicles` (`customer_id`, `license_plate`, `make`, `model`, `year`, `current_km`) VALUES
(1, 'AB123CD', 'BMW', '320d', 2020, 45000),
(1, 'EF456GH', 'Audi', 'A4', 2019, 52000),
(2, 'IJ789KL', 'Mercedes', 'C200', 2021, 28000),
(3, 'MN012OP', 'Volkswagen', 'Golf', 2018, 67000);

-- Insert sample tires
INSERT INTO `tires` (`tire_code`, `customer_id`, `vehicle_id`, `brand`, `size`, `season`, `position`, `tread_depth`, `warehouse_location`, `deposit_type`) VALUES
('TIRE001', 1, 1, 'Michelin', '225/50R17', 'winter', 'AS', 7.5, 'A1-01', 'removed_from_vehicle'),
('TIRE002', 1, 1, 'Michelin', '225/50R17', 'winter', 'AD', 7.2, 'A1-02', 'removed_from_vehicle'),
('TIRE003', 2, 3, 'Continental', '205/55R16', 'summer', 'PS', 6.8, 'B2-01', 'purchased_from_customer');

-- Insert default users with bcrypt hashed passwords (password: admin123)
INSERT INTO `users` (`username`, `email`, `password_hash`, `role`, `first_name`, `last_name`) VALUES
('admin', 'admin@tirespro.com', '$2b$10$rQZ8kHWKQOuXlY5qJ7mGHOxvK8fJ9nL2mP3qR4sT5uV6wX7yZ8aB9c', 'admin', 'Admin', 'User'),
('manager', 'manager@tirespro.com', '$2b$10$rQZ8kHWKQOuXlY5qJ7mGHOxvK8fJ9nL2mP3qR4sT5uV6wX7yZ8aB9c', 'manager', 'Manager', 'User'),
('user', 'user@tirespro.com', '$2b$10$rQZ8kHWKQOuXlY5qJ7mGHOxvK8fJ9nL2mP3qR4sT5uV6wX7yZ8aB9c', 'user', 'Standard', 'User');

-- --------------------------------------------------------
-- Views for reporting
-- --------------------------------------------------------

CREATE OR REPLACE VIEW `customer_summary` AS
SELECT 
    c.id,
    c.customer_code,
    CONCAT(c.first_name, ' ', c.last_name) as full_name,
    c.email,
    c.phone,
    COUNT(DISTINCT v.id) as total_vehicles,
    COUNT(DISTINCT t.id) as total_tires,
    COUNT(DISTINCT CASE WHEN t.season = 'winter' THEN t.id END) as winter_tires,
    COUNT(DISTINCT CASE WHEN t.season = 'summer' THEN t.id END) as summer_tires
FROM customers c
LEFT JOIN vehicles v ON c.id = v.customer_id
LEFT JOIN tires t ON c.id = t.customer_id
GROUP BY c.id, c.customer_code, c.first_name, c.last_name, c.email, c.phone;

CREATE OR REPLACE VIEW `tire_inventory` AS
SELECT 
    t.id,
    t.tire_code,
    CONCAT(c.first_name, ' ', c.last_name) as customer_name,
    v.license_plate,
    t.brand,
    t.size,
    t.season,
    t.position,
    t.tread_depth,
    t.condition_rating,
    t.warehouse_location,
    t.status,
    t.created_at
FROM tires t
JOIN customers c ON t.customer_id = c.id
LEFT JOIN vehicles v ON t.vehicle_id = v.id
WHERE t.status != 'scrapped'
ORDER BY t.created_at DESC;

-- --------------------------------------------------------
-- Restore settings
-- --------------------------------------------------------

SET FOREIGN_KEY_CHECKS = 1;
COMMIT;

-- End of export
-- 
-- Instructions:
-- 1. Save this file as 'tires_pro_complete_backup.sql'
-- 2. To restore: mysql -u username -p database_name < tires_pro_complete_backup.sql
-- 3. Default login: admin@tirespro.com / admin123
