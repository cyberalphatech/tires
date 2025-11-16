-- Create tires table (tire storage records)
CREATE TABLE IF NOT EXISTS `tires` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `client_id` int(11) NOT NULL,
  `vehicle_id` int(11) DEFAULT NULL,
  `warehouse_position_id` int(11) DEFAULT NULL,
  `tire_code` varchar(50) DEFAULT NULL,
  `brand` varchar(100) NOT NULL,
  `model` varchar(100) NOT NULL,
  `size` varchar(50) NOT NULL,
  `season` enum('Winter','Summer','All-Season') NOT NULL,
  `dot_code` varchar(20) DEFAULT NULL,
  `production_year` int(4) DEFAULT NULL,
  `tread_depth` decimal(3,1) DEFAULT NULL,
  `condition_rating` enum('Excellent','Good','Fair','Poor') DEFAULT 'Good',
  `position` enum('Front Left','Front Right','Rear Left','Rear Right') DEFAULT NULL,
  `storage_date` date DEFAULT NULL,
  `retrieval_date` date DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `is_stored` tinyint(1) DEFAULT 1,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_client_id` (`client_id`),
  KEY `idx_vehicle_id` (`vehicle_id`),
  KEY `idx_warehouse_position_id` (`warehouse_position_id`),
  KEY `idx_tire_code` (`tire_code`),
  KEY `idx_season` (`season`),
  KEY `idx_brand_model` (`brand`, `model`),
  KEY `idx_storage_date` (`storage_date`),
  CONSTRAINT `fk_tires_client` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_tires_vehicle` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_tires_warehouse_position` FOREIGN KEY (`warehouse_position_id`) REFERENCES `warehouse_positions` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample tire data
INSERT INTO `tires` (`client_id`, `vehicle_id`, `tire_code`, `brand`, `model`, `size`, `season`, `dot_code`, `production_year`, `tread_depth`, `condition_rating`, `position`, `storage_date`) VALUES
(1, 1, 'TIR001', 'Michelin', 'Pilot Sport 4', '205/55R16', 'Summer', '2023', 2023, 7.5, 'Good', 'Front Left', '2024-01-15'),
(1, 1, 'TIR002', 'Michelin', 'Pilot Sport 4', '205/55R16', 'Summer', '2023', 2023, 7.2, 'Good', 'Front Right', '2024-01-15'),
(2, 3, 'TIR003', 'Continental', 'WinterContact', '225/50R17', 'Winter', '2022', 2022, 6.8, 'Good', 'Rear Left', '2024-02-10'),
(3, 4, 'TIR004', 'Bridgestone', 'Turanza', '195/65R15', 'All-Season', '2023', 2023, 8.0, 'Excellent', 'Front Left', '2024-03-05');
