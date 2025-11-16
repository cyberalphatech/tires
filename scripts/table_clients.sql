-- Create clients table (individual clients of bodyshops)
CREATE TABLE IF NOT EXISTS `clients` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `bodyshop_id` int(11) NOT NULL,
  `client_code` varchar(50) DEFAULT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `postal_code` varchar(20) DEFAULT NULL,
  `country` varchar(100) DEFAULT 'Italy',
  `date_of_birth` date DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_bodyshop_id` (`bodyshop_id`),
  KEY `idx_client_code` (`client_code`),
  KEY `idx_email` (`email`),
  KEY `idx_full_name` (`first_name`, `last_name`),
  CONSTRAINT `fk_clients_bodyshop` FOREIGN KEY (`bodyshop_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample client data
INSERT INTO `clients` (`bodyshop_id`, `client_code`, `first_name`, `last_name`, `email`, `phone`, `address`, `city`, `postal_code`) VALUES
(1, 'CLI001', 'Marco', 'Bianchi', 'marco.bianchi@email.it', '+39 333 1234567', 'Via Milano 10', 'Milano', '20100'),
(1, 'CLI002', 'Laura', 'Ferrari', 'laura.ferrari@email.it', '+39 333 2345678', 'Via Roma 20', 'Milano', '20100'),
(3, 'CLI003', 'Andrea', 'Rossi', 'andrea.rossi@email.it', '+39 333 3456789', 'Via Torino 30', 'Torino', '10100');
