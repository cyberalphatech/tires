-- Complete Tires Pro Database Export with Client Structure
-- Generated: $(date)
-- Database: shopreal_gomme
-- 
-- This file contains the complete database structure and data
-- including the new client-bodyshop relationship structure

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";

-- Database structure
CREATE DATABASE IF NOT EXISTS `shopreal_gomme` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `shopreal_gomme`;

-- BodyShops table (formerly customers - now represents tire service businesses)
DROP TABLE IF EXISTS `customers`;
CREATE TABLE `customers` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `customer_code` varchar(20) NOT NULL,
    `business_name` varchar(200) NOT NULL,
    `contact_person` varchar(100),
    `email` varchar(255),
    `phone` varchar(20),
    `address` text,
    `city` varchar(100),
    `postal_code` varchar(20),
    `tax_code` varchar(50),
    `vat_number` varchar(50),
    `password_hash` varchar(255),
    `is_active` tinyint(1) DEFAULT 1,
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `customer_code` (`customer_code`),
    UNIQUE KEY `email` (`email`),
    KEY `idx_customer_code` (`customer_code`),
    KEY `idx_email` (`email`),
    KEY `idx_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Clients table (car owners who use bodyshop services)
DROP TABLE IF EXISTS `clients`;
CREATE TABLE `clients` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `bodyshop_id` int(11) NOT NULL,
    `client_code` varchar(20) NOT NULL,
    `first_name` varchar(100) NOT NULL,
    `last_name` varchar(100) NOT NULL,
    `email` varchar(255),
    `phone` varchar(20),
    `address` text,
    `city` varchar(100),
    `postal_code` varchar(20),
    `tax_code` varchar(50),
    `password_hash` varchar(255),
    `is_active` tinyint(1) DEFAULT 1,
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `client_code` (`client_code`),
    KEY `idx_bodyshop_id` (`bodyshop_id`),
    KEY `idx_client_code` (`client_code`),
    KEY `idx_email` (`email`),
    KEY `idx_phone` (`phone`),
    CONSTRAINT `fk_clients_bodyshop` FOREIGN KEY (`bodyshop_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Vehicles table (updated to reference clients)
DROP TABLE IF EXISTS `vehicles`;
CREATE TABLE `vehicles` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `client_id` int(11) NOT NULL,
    `bodyshop_id` int(11) NOT NULL,
    `license_plate` varchar(20) NOT NULL,
    `make` varchar(100) NOT NULL,
    `model` varchar(100) NOT NULL,
    `year` int(11),
    `vin` varchar(50),
    `engine_type` varchar(50),
    `fuel_type` varchar(50),
    `current_km` int(11) DEFAULT 0,
    `image_urls` json,
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `license_plate` (`license_plate`),
    KEY `idx_client_id` (`client_id`),
    KEY `idx_bodyshop_id` (`bodyshop_id`),
    KEY `idx_license_plate` (`license_plate`),
    KEY `idx_make_model` (`make`,`model`),
    CONSTRAINT `fk_vehicles_client` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_vehicles_bodyshop` FOREIGN KEY (`bodyshop_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tires table (updated to reference clients and bodyshops)
DROP TABLE IF EXISTS `tires`;
CREATE TABLE `tires` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `tire_code` varchar(50) NOT NULL,
    `client_id` int(11) NOT NULL,
    `bodyshop_id` int(11) NOT NULL,
    `vehicle_id` int(11),
    `brand` varchar(100),
    `size` varchar(50) NOT NULL,
    `season` enum('winter','summer','all_season') NOT NULL,
    `position` varchar(20),
    `dot_code` varchar(20),
    `manufacture_year` int(11),
    `tread_depth` decimal(3,1),
    `condition_rating` enum('excellent','good','fair','poor') DEFAULT 'good',
    `purchase_price` decimal(10,2),
    `installation_date` date,
    `removal_date` date,
    `max_km_before_disposal` int(11),
    `current_km` int(11) DEFAULT 0,
    `warehouse_location` varchar(100),
    `status` enum('in_use','stored','scrapped','sold') DEFAULT 'stored',
    `deposit_type` enum('removed_from_vehicle','purchased_from_customer') NOT NULL,
    `notes` text,
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `tire_code` (`tire_code`),
    KEY `idx_client_id` (`client_id`),
    KEY `idx_bodyshop_id` (`bodyshop_id`),
    KEY `idx_vehicle_id` (`vehicle_id`),
    KEY `idx_tire_code` (`tire_code`),
    KEY `idx_season` (`season`),
    KEY `idx_status` (`status`),
    KEY `idx_warehouse_location` (`warehouse_location`),
    CONSTRAINT `fk_tires_client` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_tires_bodyshop` FOREIGN KEY (`bodyshop_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_tires_vehicle` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- KM History table
DROP TABLE IF EXISTS `km_history`;
CREATE TABLE `km_history` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `vehicle_id` int(11) NOT NULL,
    `recorded_km` int(11) NOT NULL,
    `previous_km` int(11),
    `km_difference` int(11),
    `recorded_date` date NOT NULL,
    `service_type` varchar(100),
    `notes` text,
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_vehicle_id` (`vehicle_id`),
    KEY `idx_recorded_date` (`recorded_date`),
    CONSTRAINT `fk_km_history_vehicle` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Notes History table
DROP TABLE IF EXISTS `notes_history`;
CREATE TABLE `notes_history` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `vehicle_id` int(11) NOT NULL,
    `note_text` text NOT NULL,
    `note_type` varchar(50) DEFAULT 'general',
    `created_by` varchar(100),
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_vehicle_id` (`vehicle_id`),
    KEY `idx_note_type` (`note_type`),
    KEY `idx_created_at` (`created_at`),
    CONSTRAINT `fk_notes_history_vehicle` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Scrapped Tires table
DROP TABLE IF EXISTS `scrapped_tires`;
CREATE TABLE `scrapped_tires` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `tire_id` int(11) NOT NULL,
    `client_id` int(11) NOT NULL,
    `bodyshop_id` int(11) NOT NULL,
    `vehicle_id` int(11),
    `tire_code` varchar(50) NOT NULL,
    `brand` varchar(100),
    `size` varchar(50),
    `season` enum('winter','summer','all_season'),
    `scrap_reason` varchar(255) NOT NULL,
    `scrap_date` date NOT NULL,
    `final_tread_depth` decimal(3,1),
    `final_km` int(11),
    `disposal_method` varchar(100),
    `disposal_cost` decimal(10,2),
    `notes` text,
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_tire_id` (`tire_id`),
    KEY `idx_client_id` (`client_id`),
    KEY `idx_bodyshop_id` (`bodyshop_id`),
    KEY `idx_scrap_date` (`scrap_date`),
    KEY `idx_season` (`season`),
    CONSTRAINT `fk_scrapped_tires_tire` FOREIGN KEY (`tire_id`) REFERENCES `tires` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_scrapped_tires_client` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_scrapped_tires_bodyshop` FOREIGN KEY (`bodyshop_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_scrapped_tires_vehicle` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tire Deposits table
DROP TABLE IF EXISTS `tire_deposits`;
CREATE TABLE `tire_deposits` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `client_id` int(11) NOT NULL,
    `bodyshop_id` int(11) NOT NULL,
    `vehicle_id` int(11),
    `deposit_date` date NOT NULL,
    `retrieval_date` date,
    `total_tires` int(11) DEFAULT 0,
    `season` enum('winter','summer','mixed') NOT NULL,
    `storage_location` varchar(100),
    `deposit_fee` decimal(10,2),
    `status` enum('active','retrieved','partial') DEFAULT 'active',
    `notes` text,
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_client_id` (`client_id`),
    KEY `idx_bodyshop_id` (`bodyshop_id`),
    KEY `idx_deposit_date` (`deposit_date`),
    KEY `idx_status` (`status`),
    KEY `idx_season` (`season`),
    CONSTRAINT `fk_tire_deposits_client` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_tire_deposits_bodyshop` FOREIGN KEY (`bodyshop_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_tire_deposits_vehicle` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Users table (admin/staff)
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `username` varchar(100) NOT NULL,
    `email` varchar(255) NOT NULL,
    `password_hash` varchar(255) NOT NULL,
    `role` enum('admin','manager','user') DEFAULT 'user',
    `first_name` varchar(100),
    `last_name` varchar(100),
    `is_active` tinyint(1) DEFAULT 1,
    `last_login` timestamp NULL DEFAULT NULL,
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `username` (`username`),
    UNIQUE KEY `email` (`email`),
    KEY `idx_username` (`username`),
    KEY `idx_email` (`email`),
    KEY `idx_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample data for BodyShops (customers)
INSERT INTO `customers` (`id`, `customer_code`, `business_name`, `contact_person`, `email`, `phone`, `address`, `city`, `postal_code`, `tax_code`, `vat_number`, `password_hash`, `is_active`) VALUES
(1, 'BS001', 'AutoService Milano', 'Giuseppe Verdi', 'info@autoservice-milano.com', '+39 02 1234567', 'Via Roma 123', 'Milano', '20100', '12345678901', 'IT12345678901', '$2b$10$rQZ8kHWKQOuXlY5qJ7mGHOxvK8fJ9nL2mP3qR4sT5uV6wX7yZ8aB9c', 1),
(2, 'BS002', 'Pneumatici Roma', 'Marco Rossi', 'info@pneumatici-roma.com', '+39 06 2345678', 'Via Venezia 45', 'Roma', '00100', '23456789012', 'IT23456789012', '$2b$10$rQZ8kHWKQOuXlY5qJ7mGHOxvK8fJ9nL2mP3qR4sT5uV6wX7yZ8aB9c', 1);

-- Sample data for Clients
INSERT INTO `clients` (`id`, `bodyshop_id`, `client_code`, `first_name`, `last_name`, `email`, `phone`, `address`, `city`, `postal_code`, `tax_code`, `password_hash`, `is_active`) VALUES
(1, 1, 'CL001', 'Mario', 'Rossi', 'mario.rossi@email.com', '+39 123 456 7890', 'Via Roma 123', 'Milano', '20100', 'RSSMRA80A01F205X', '$2b$10$rQZ8kHWKQOuXlY5qJ7mGHOxvK8fJ9nL2mP3qR4sT5uV6wX7yZ8aB9c', 1),
(2, 1, 'CL002', 'Giulia', 'Bianchi', 'giulia.bianchi@email.com', '+39 234 567 8901', 'Via Venezia 45', 'Roma', '00100', 'BNCGLI85B02H501Y', '$2b$10$rQZ8kHWKQOuXlY5qJ7mGHOxvK8fJ9nL2mP3qR4sT5uV6wX7yZ8aB9c', 1),
(3, 2, 'CL003', 'Luca', 'Verdi', 'luca.verdi@email.com', '+39 345 678 9012', 'Corso Italia 67', 'Torino', '10100', 'VRDLCU90C03L219Z', '$2b$10$rQZ8kHWKQOuXlY5qJ7mGHOxvK8fJ9nL2mP3qR4sT5uV6wX7yZ8aB9c', 1);

-- Sample data for Vehicles
INSERT INTO `vehicles` (`id`, `client_id`, `bodyshop_id`, `license_plate`, `make`, `model`, `year`, `current_km`) VALUES
(1, 1, 1, 'AB123CD', 'BMW', '320d', 2020, 45000),
(2, 1, 1, 'EF456GH', 'Audi', 'A4', 2019, 52000),
(3, 2, 1, 'IJ789KL', 'Mercedes', 'C200', 2021, 28000),
(4, 3, 2, 'MN012OP', 'Volkswagen', 'Golf', 2018, 67000);

-- Sample data for Users (admin/staff)
INSERT INTO `users` (`id`, `username`, `email`, `password_hash`, `role`, `first_name`, `last_name`, `is_active`) VALUES
(1, 'admin', 'admin@tirespro.com', '$2b$10$rQZ8kHWKQOuXlY5qJ7mGHOxvK8fJ9nL2mP3qR4sT5uV6wX7yZ8aB9c', 'admin', 'Admin', 'User', 1),
(2, 'manager', 'manager@tirespro.com', '$2b$10$rQZ8kHWKQOuXlY5qJ7mGHOxvK8fJ9nL2mP3qR4sT5uV6wX7yZ8aB9c', 'manager', 'Manager', 'User', 1),
(3, 'user', 'user@tirespro.com', '$2b$10$rQZ8kHWKQOuXlY5qJ7mGHOxvK8fJ9nL2mP3qR4sT5uV6wX7yZ8aB9c', 'user', 'Standard', 'User', 1);

-- Views for reporting
CREATE OR REPLACE VIEW `bodyshop_summary` AS
SELECT 
    c.id,
    c.customer_code,
    c.business_name,
    c.contact_person,
    c.email,
    c.phone,
    COUNT(DISTINCT cl.id) as total_clients,
    COUNT(DISTINCT v.id) as total_vehicles,
    COUNT(DISTINCT t.id) as total_tires,
    COUNT(DISTINCT CASE WHEN t.season = 'winter' THEN t.id END) as winter_tires,
    COUNT(DISTINCT CASE WHEN t.season = 'summer' THEN t.id END) as summer_tires
FROM customers c
LEFT JOIN clients cl ON c.id = cl.bodyshop_id
LEFT JOIN vehicles v ON cl.id = v.client_id
LEFT JOIN tires t ON cl.id = t.client_id
GROUP BY c.id, c.customer_code, c.business_name, c.contact_person, c.email, c.phone;

CREATE OR REPLACE VIEW `client_summary` AS
SELECT 
    cl.id,
    cl.client_code,
    CONCAT(cl.first_name, ' ', cl.last_name) as full_name,
    cl.email,
    cl.phone,
    c.business_name as bodyshop_name,
    COUNT(DISTINCT v.id) as total_vehicles,
    COUNT(DISTINCT t.id) as total_tires,
    COUNT(DISTINCT CASE WHEN t.season = 'winter' THEN t.id END) as winter_tires,
    COUNT(DISTINCT CASE WHEN t.season = 'summer' THEN t.id END) as summer_tires
FROM clients cl
JOIN customers c ON cl.bodyshop_id = c.id
LEFT JOIN vehicles v ON cl.id = v.client_id
LEFT JOIN tires t ON cl.id = t.client_id
GROUP BY cl.id, cl.client_code, cl.first_name, cl.last_name, cl.email, cl.phone, c.business_name;

CREATE OR REPLACE VIEW `tire_inventory` AS
SELECT 
    t.id,
    t.tire_code,
    CONCAT(cl.first_name, ' ', cl.last_name) as client_name,
    c.business_name as bodyshop_name,
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
JOIN clients cl ON t.client_id = cl.id
JOIN customers c ON t.bodyshop_id = c.id
LEFT JOIN vehicles v ON t.vehicle_id = v.id
WHERE t.status != 'scrapped'
ORDER BY t.created_at DESC;

-- Set AUTO_INCREMENT values
ALTER TABLE `customers` AUTO_INCREMENT = 3;
ALTER TABLE `clients` AUTO_INCREMENT = 4;
ALTER TABLE `vehicles` AUTO_INCREMENT = 5;
ALTER TABLE `tires` AUTO_INCREMENT = 1;
ALTER TABLE `km_history` AUTO_INCREMENT = 1;
ALTER TABLE `notes_history` AUTO_INCREMENT = 1;
ALTER TABLE `scrapped_tires` AUTO_INCREMENT = 1;
ALTER TABLE `tire_deposits` AUTO_INCREMENT = 1;
ALTER TABLE `users` AUTO_INCREMENT = 4;

SET FOREIGN_KEY_CHECKS = 1;
COMMIT;

-- End of export
