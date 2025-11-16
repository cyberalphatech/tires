-- Create vehicles table (client vehicles)
CREATE TABLE IF NOT EXISTS `vehicles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `client_id` int(11) NOT NULL,
  `license_plate` varchar(20) NOT NULL,
  `brand` varchar(100) NOT NULL,
  `model` varchar(100) NOT NULL,
  `year` int(4) DEFAULT NULL,
  `color` varchar(50) DEFAULT NULL,
  `vin` varchar(50) DEFAULT NULL,
  `engine_type` varchar(50) DEFAULT NULL,
  `fuel_type` enum('Gasoline','Diesel','Electric','Hybrid','LPG','CNG') DEFAULT 'Gasoline',
  `notes` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_license_plate` (`license_plate`),
  KEY `idx_client_id` (`client_id`),
  KEY `idx_brand_model` (`brand`, `model`),
  CONSTRAINT `fk_vehicles_client` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample vehicle data
INSERT INTO `vehicles` (`client_id`, `license_plate`, `brand`, `model`, `year`, `color`, `fuel_type`) VALUES
(1, 'AB123CD', 'Fiat', '500', 2020, 'Bianco', 'Gasoline'),
(1, 'EF456GH', 'Volkswagen', 'Golf', 2019, 'Nero', 'Diesel'),
(2, 'IJ789KL', 'BMW', 'X3', 2021, 'Grigio', 'Diesel'),
(3, 'MN012OP', 'Toyota', 'Yaris', 2022, 'Rosso', 'Hybrid');
