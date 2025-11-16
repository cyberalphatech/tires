-- Create warehouse_positions table (warehouse location management)
CREATE TABLE IF NOT EXISTS `warehouse_positions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `bodyshop_id` int(11) NOT NULL,
  `scaffale` varchar(10) NOT NULL,
  `area` varchar(10) NOT NULL,
  `livello` varchar(10) NOT NULL,
  `posizione` varchar(10) NOT NULL,
  `position_code` varchar(50) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `max_capacity` int(11) DEFAULT 4,
  `current_occupancy` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_position_code` (`position_code`),
  KEY `idx_bodyshop_id` (`bodyshop_id`),
  KEY `idx_scaffale_area` (`scaffale`, `area`),
  KEY `idx_position_hierarchy` (`scaffale`, `area`, `livello`, `posizione`),
  CONSTRAINT `fk_warehouse_positions_bodyshop` FOREIGN KEY (`bodyshop_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample warehouse position data
INSERT INTO `warehouse_positions` (`bodyshop_id`, `scaffale`, `area`, `livello`, `posizione`, `position_code`, `description`) VALUES
(1, '01', '01', '01', '01', '01-01-01-01', 'Scaffale 1 - Area 1 - Livello 1 - Posizione 1'),
(1, '01', '01', '01', '02', '01-01-01-02', 'Scaffale 1 - Area 1 - Livello 1 - Posizione 2'),
(1, '01', '01', '02', '01', '01-01-02-01', 'Scaffale 1 - Area 1 - Livello 2 - Posizione 1'),
(3, '01', '01', '01', '01', '01-01-01-01', 'GMO Scaffale 1 - Area 1 - Livello 1 - Posizione 1'),
(3, '01', '01', '01', '02', '01-01-01-02', 'GMO Scaffale 1 - Area 1 - Livello 1 - Posizione 2');
