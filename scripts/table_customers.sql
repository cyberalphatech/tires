-- Create customers table (bodyshops)
CREATE TABLE IF NOT EXISTS `customers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_name` varchar(255) NOT NULL,
  `contact_person` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL UNIQUE,
  `password` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `postal_code` varchar(20) DEFAULT NULL,
  `country` varchar(100) DEFAULT 'Italy',
  `vat_number` varchar(50) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_email` (`email`),
  KEY `idx_business_name` (`business_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample bodyshop data
INSERT INTO `customers` (`id`, `business_name`, `contact_person`, `email`, `password`, `phone`, `address`, `city`, `postal_code`, `vat_number`) VALUES
(1, 'AutoService Milano', 'Mario Rossi', 'mario@autoservice.it', '$2b$10$example', '+39 02 1234567', 'Via Roma 123', 'Milano', '20100', 'IT12345678901'),
(2, 'Pneumatici Express', 'Giuseppe Verdi', 'giuseppe@pneumatici.it', '$2b$10$example', '+39 06 7654321', 'Via Nazionale 456', 'Roma', '00100', 'IT98765432109'),
(3, 'GMO', 'GMO Manager', 'gmo@gnail.com', 'password', '+39 011 9876543', 'Via Torino 789', 'Torino', '10100', 'IT11223344556');
