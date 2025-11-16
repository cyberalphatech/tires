-- Create date_deposits table to track tire deposit movements
-- This table keeps track of when tires go in or out of the deposit

DROP TABLE IF EXISTS date_deposits;

CREATE TABLE date_deposits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tire_id INT NOT NULL,
    movement_type ENUM('in', 'out') NOT NULL,
    movement_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    bodyshop_id INT NOT NULL,
    user_name VARCHAR(100) NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    CONSTRAINT fk_date_deposits_tire 
        FOREIGN KEY (tire_id) REFERENCES tires(id) 
        ON DELETE CASCADE,
    
    CONSTRAINT fk_date_deposits_bodyshop 
        FOREIGN KEY (bodyshop_id) REFERENCES customers(id) 
        ON DELETE CASCADE,
    
    -- Indexes for better performance
    INDEX idx_tire_id (tire_id),
    INDEX idx_movement_date (movement_date),
    INDEX idx_bodyshop_id (bodyshop_id),
    INDEX idx_movement_type (movement_type)
);

-- Insert sample data for testing
INSERT INTO date_deposits (tire_id, movement_type, movement_date, bodyshop_id, user_name, notes) VALUES
(1, 'in', '2024-01-15 10:30:00', 1, 'Mario Rossi', 'Pneumatico depositato per cambio stagionale'),
(1, 'out', '2024-04-20 14:15:00', 1, 'Luigi Bianchi', 'Pneumatico ritirato per rimontaggio'),
(2, 'in', '2024-02-10 09:45:00', 1, 'Mario Rossi', 'Deposito pneumatici invernali'),
(3, 'in', '2024-03-05 16:20:00', 2, 'Giuseppe Verdi', 'Pneumatici estivi in deposito');

-- Create a view for easy querying of deposit movements with tire details
CREATE VIEW deposit_movements_view AS
SELECT 
    dd.id,
    dd.tire_id,
    t.tire_code,
    t.brand,
    t.size,
    t.season,
    CONCAT(c.first_name, ' ', c.last_name) AS client_name,
    v.license_plate,
    dd.movement_type,
    dd.movement_date,
    dd.user_name,
    dd.notes,
    dd.created_at
FROM date_deposits dd
JOIN tires t ON dd.tire_id = t.id
LEFT JOIN clients c ON t.client_id = c.id
LEFT JOIN vehicles v ON t.vehicle_id = v.id
ORDER BY dd.movement_date DESC;
