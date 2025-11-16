-- Drop existing vehicles table if it exists to avoid conflicts
DROP TABLE IF EXISTS `vehicles`;

-- Create vehicles table with all required columns for the API
CREATE TABLE `vehicles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `client_id` int(11) NOT NULL,
  `license_plate` varchar(20) NOT NULL,
  `brand` varchar(100) NOT NULL,
  `model` varchar(100) NOT NULL,
  `year` int(4) NOT NULL,
  `fuel_type` varchar(50) DEFAULT 'Benzina',
  `color` varchar(50) DEFAULT NULL,
  `mileage` int(11) DEFAULT 0,
  `image_filename` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_client_id` (`client_id`),
  KEY `idx_license_plate` (`license_plate`),
  CONSTRAINT `fk_vehicles_client` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample data for testing
INSERT INTO `vehicles` (`client_id`, `license_plate`, `brand`, `model`, `year`, `fuel_type`, `color`, `mileage`) VALUES
(1, 'AB123CD', 'Fiat', '500', 2020, 'Benzina', 'Bianco', 25000),
(2, 'EF456GH', 'Volkswagen', 'Golf', 2019, 'Diesel', 'Nero', 45000),
(3, 'IJ789KL', 'BMW', 'Serie 3', 2021, 'Benzina', 'Grigio', 15000);
