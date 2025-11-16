-- Views and Utility Queries for Tire Management System - MySQL Version
-- Run this script last to create helpful views and procedures

-- View: Customer tire inventory summary
CREATE VIEW customer_tire_inventory AS
SELECT 
    c.id as customer_id,
    c.customer_code,
    CONCAT(c.first_name, ' ', c.last_name) as customer_name,
    COUNT(t.id) as total_tires,
    SUM(CASE WHEN t.season = 'winter' THEN 1 ELSE 0 END) as winter_tires,
    SUM(CASE WHEN t.season = 'summer' THEN 1 ELSE 0 END) as summer_tires,
    SUM(CASE WHEN t.status = 'stored' THEN 1 ELSE 0 END) as stored_tires,
    SUM(CASE WHEN t.status = 'in_use' THEN 1 ELSE 0 END) as in_use_tires,
    SUM(CASE WHEN t.status = 'scrapped' THEN 1 ELSE 0 END) as scrapped_tires
FROM customers c
LEFT JOIN tires t ON c.id = t.customer_id
GROUP BY c.id, c.customer_code, c.first_name, c.last_name;

-- View: Vehicle tire status
CREATE VIEW vehicle_tire_status AS
SELECT 
    v.id as vehicle_id,
    v.license_plate,
    CONCAT(v.make, ' ', v.model) as vehicle_name,
    v.current_km,
    c.customer_code,
    CONCAT(c.first_name, ' ', c.last_name) as customer_name,
    COUNT(t.id) as total_tires,
    SUM(CASE WHEN t.status = 'stored' THEN 1 ELSE 0 END) as stored_tires,
    SUM(CASE WHEN t.status = 'in_use' THEN 1 ELSE 0 END) as in_use_tires,
    GROUP_CONCAT(DISTINCT t.season) as available_seasons
FROM vehicles v
JOIN customers c ON v.customer_id = c.id
LEFT JOIN tires t ON v.id = t.vehicle_id
GROUP BY v.id, v.license_plate, v.make, v.model, v.current_km, c.customer_code, c.first_name, c.last_name;

-- View: Warehouse inventory by location
CREATE VIEW warehouse_inventory AS
SELECT 
    t.warehouse_location,
    COUNT(*) as tire_count,
    GROUP_CONCAT(DISTINCT t.season) as seasons,
    GROUP_CONCAT(DISTINCT t.brand) as brands,
    AVG(t.tread_depth) as avg_tread_depth,
    MIN(t.created_at) as oldest_tire_date,
    MAX(t.created_at) as newest_tire_date
FROM tires t
WHERE t.status = 'stored' AND t.warehouse_location IS NOT NULL
GROUP BY t.warehouse_location
ORDER BY t.warehouse_location;

-- View: Tires needing attention (low tread depth or high km)
CREATE VIEW tires_needing_attention AS
SELECT 
    t.id,
    t.tire_code,
    c.customer_code,
    CONCAT(c.first_name, ' ', c.last_name) as customer_name,
    v.license_plate,
    t.brand,
    t.size,
    t.season,
    t.tread_depth,
    t.current_km,
    t.max_km_before_disposal,
    CASE 
        WHEN t.tread_depth < 3.0 THEN 'Low tread depth'
        WHEN t.current_km >= t.max_km_before_disposal THEN 'High mileage'
        WHEN t.condition_rating = 'poor' THEN 'Poor condition'
        ELSE 'Other'
    END as attention_reason,
    t.warehouse_location,
    t.status
FROM tires t
JOIN customers c ON t.customer_id = c.id
LEFT JOIN vehicles v ON t.vehicle_id = v.id
WHERE 
    t.tread_depth < 3.0 
    OR t.current_km >= t.max_km_before_disposal 
    OR t.condition_rating = 'poor'
ORDER BY 
    CASE 
        WHEN t.tread_depth < 1.6 THEN 1
        WHEN t.current_km >= t.max_km_before_disposal THEN 2
        WHEN t.condition_rating = 'poor' THEN 3
        ELSE 4
    END;

-- View: Monthly tire operations summary
CREATE VIEW monthly_operations_summary AS
SELECT 
    DATE_FORMAT(created_at, '%Y-%m') as month_year,
    COUNT(*) as total_operations,
    SUM(CASE WHEN status = 'stored' THEN 1 ELSE 0 END) as tires_stored,
    SUM(CASE WHEN status = 'scrapped' THEN 1 ELSE 0 END) as tires_scrapped,
    SUM(CASE WHEN deposit_type = 'purchased_from_customer' THEN 1 ELSE 0 END) as tires_purchased,
    AVG(tread_depth) as avg_tread_depth
FROM tires
GROUP BY DATE_FORMAT(created_at, '%Y-%m')
ORDER BY month_year DESC;

-- Stored procedure to get customer tire history
DELIMITER //
CREATE PROCEDURE GetCustomerTireHistory(IN customer_id_param INT)
BEGIN
    SELECT 
        t.tire_code,
        t.brand,
        t.size,
        t.season,
        v.license_plate,
        t.installation_date,
        t.removal_date,
        t.tread_depth,
        t.current_km,
        t.status,
        t.warehouse_location,
        t.notes
    FROM tires t
    LEFT JOIN vehicles v ON t.vehicle_id = v.id
    WHERE t.customer_id = customer_id_param
    ORDER BY t.created_at DESC;
END //
DELIMITER ;

-- Stored procedure to update vehicle km and create history record
DELIMITER //
CREATE PROCEDURE UpdateVehicleKm(
    IN vehicle_id_param INT, 
    IN new_km INT, 
    IN service_type_param VARCHAR(100),
    IN notes_param TEXT
)
BEGIN
    DECLARE old_km INT DEFAULT 0;
    
    -- Get current km
    SELECT current_km INTO old_km FROM vehicles WHERE id = vehicle_id_param;
    
    -- Update vehicle km
    UPDATE vehicles SET 
        current_km = new_km,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = vehicle_id_param;
    
    -- Insert km history record
    INSERT INTO km_history (vehicle_id, recorded_km, previous_km, km_difference, recorded_date, service_type, notes)
    VALUES (vehicle_id_param, new_km, old_km, new_km - old_km, CURDATE(), service_type_param, notes_param);
    
END //
DELIMITER ;

-- Function to calculate tire remaining life percentage
DELIMITER //
CREATE FUNCTION CalculateTireLife(current_km INT, max_km INT, tread_depth DECIMAL(3,1))
RETURNS DECIMAL(5,2)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE km_life_percent DECIMAL(5,2) DEFAULT 100.0;
    DECLARE tread_life_percent DECIMAL(5,2) DEFAULT 100.0;
    
    -- Calculate based on km (assuming max_km is the limit)
    IF max_km > 0 THEN
        SET km_life_percent = GREATEST(0, (max_km - current_km) / max_km * 100);
    END IF;
    
    -- Calculate based on tread depth (assuming 8.0mm is new, 1.6mm is legal limit)
    IF tread_depth > 0 THEN
        SET tread_life_percent = GREATEST(0, (tread_depth - 1.6) / (8.0 - 1.6) * 100);
    END IF;
    
    -- Return the lower of the two percentages
    RETURN LEAST(km_life_percent, tread_life_percent);
END //
DELIMITER ;
