-- Tires Table Creation Script for Manual Upload
-- This script creates the tires table with all required columns and relationships

DROP TABLE IF EXISTS `tires`;

CREATE TABLE `tires` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `client_id` int(11) NOT NULL,
  `vehicle_id` int(11) DEFAULT NULL,
  `bodyshop_id` int(11) NOT NULL,
  `warehouse_position_id` int(11) DEFAULT NULL,
  `brand` varchar(100) NOT NULL,
  `model` varchar(100) NOT NULL,
  `size` varchar(50) NOT NULL,
  `season` enum('Summer','Winter','All Season') NOT NULL DEFAULT 'Summer',
  `dot_code` varchar(20) DEFAULT NULL,
  `condition_rating` enum('Excellent','Good','Fair','Poor') NOT NULL DEFAULT 'Good',
  `tread_depth` decimal(3,1) DEFAULT NULL,
  `pressure` decimal(4,1) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `storage_date` date NOT NULL,
  `removal_date` date DEFAULT NULL,
  `is_mounted` tinyint(1) NOT NULL DEFAULT 0,
  `position` enum('Front Left','Front Right','Rear Left','Rear Right','Spare') DEFAULT NULL,
  `image_filename` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_client_id` (`client_id`),
  KEY `idx_vehicle_id` (`vehicle_id`),
  KEY `idx_bodyshop_id` (`bodyshop_id`),
  KEY `idx_warehouse_position_id` (`warehouse_position_id`),
  KEY `idx_storage_date` (`storage_date`),
  KEY `idx_season` (`season`),
  CONSTRAINT `fk_tires_client` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_tires_vehicle` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_tires_bodyshop` FOREIGN KEY (`bodyshop_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_tires_warehouse_position` FOREIGN KEY (`warehouse_position_id`) REFERENCES `warehouse_positions` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample data for testing
INSERT INTO `tires` (`client_id`, `vehicle_id`, `bodyshop_id`, `warehouse_position_id`, `brand`, `model`, `size`, `season`, `dot_code`, `condition_rating`, `tread_depth`, `storage_date`, `notes`) VALUES
(1, 1, 3, 1, 'Michelin', 'Pilot Sport 4', '225/45R17', 'Summer', '2023', 'Excellent', 8.5, '2024-01-15', 'Stored for winter season'),
(1, 1, 3, 2, 'Continental', 'WinterContact TS 860', '225/45R17', 'Winter', '2022', 'Good', 7.2, '2024-04-20', 'Winter tires in good condition'),
(2, 2, 3, 3, 'Bridgestone', 'Turanza T005', '205/55R16', 'All Season', '2023', 'Good', 6.8, '2024-02-10', 'All season tires');
