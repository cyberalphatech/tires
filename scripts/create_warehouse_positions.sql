CREATE TABLE IF NOT EXISTS warehouse_positions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  bodyshop_id INT NOT NULL,
  scaffale VARCHAR(10) NOT NULL,
  area VARCHAR(10) NOT NULL,
  livello VARCHAR(10) NOT NULL,
  posizione VARCHAR(10) NOT NULL,
  position_code VARCHAR(50) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_position (bodyshop_id, scaffale, area, livello, posizione),
  INDEX idx_bodyshop_id (bodyshop_id),
  INDEX idx_position_code (position_code),
  INDEX idx_active (is_active),
  FOREIGN KEY (bodyshop_id) REFERENCES customers(id) ON DELETE CASCADE
);
