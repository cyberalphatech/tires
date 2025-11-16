-- Useful views and functions for the tire management system

-- View for customer tire inventory
CREATE OR REPLACE VIEW customer_tire_inventory AS
SELECT 
    c.id as customer_id,
    c.first_name,
    c.last_name,
    v.license_plate,
    v.make,
    v.model,
    t.id as tire_id,
    t.tire_code,
    t.brand,
    t.size,
    t.season,
    t.position,
    t.tread_depth,
    t.condition,
    t.status,
    t.warehouse_location,
    td.storage_location,
    td.deposit_date
FROM customers c
JOIN vehicles v ON c.id = v.customer_id
JOIN tires t ON v.id = t.vehicle_id
LEFT JOIN tire_deposits td ON t.id = td.tire_id
ORDER BY c.last_name, c.first_name, v.license_plate, t.season, t.position;

-- View for active tire deposits
CREATE OR REPLACE VIEW active_deposits AS
SELECT 
    td.id as deposit_id,
    c.first_name,
    c.last_name,
    v.license_plate,
    t.tire_code,
    t.brand,
    t.size,
    t.season,
    t.condition,
    td.deposit_date,
    td.storage_location,
    td.storage_fee,
    CURRENT_DATE - td.deposit_date as days_stored
FROM tire_deposits td
JOIN customers c ON td.customer_id = c.id
JOIN vehicles v ON td.vehicle_id = v.id
JOIN tires t ON td.tire_id = t.id
WHERE td.retrieval_date IS NULL
ORDER BY td.deposit_date DESC;

-- Function to get customer's seasonal tires
CREATE OR REPLACE FUNCTION get_customer_seasonal_tires(
    customer_uuid UUID,
    tire_season VARCHAR(10)
)
RETURNS TABLE (
    tire_id UUID,
    vehicle_license_plate VARCHAR(10),
    tire_code VARCHAR(50),
    brand VARCHAR(50),
    size VARCHAR(20),
    position VARCHAR(20),
    tread_depth DECIMAL(3,1),
    condition VARCHAR(20),
    status VARCHAR(20),
    warehouse_location VARCHAR(50)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id,
        v.license_plate,
        t.tire_code,
        t.brand,
        t.size,
        t.position,
        t.tread_depth,
        t.condition,
        t.status,
        t.warehouse_location
    FROM tires t
    JOIN vehicles v ON t.vehicle_id = v.id
    WHERE t.customer_id = customer_uuid 
    AND t.season = tire_season
    ORDER BY v.license_plate, t.position;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate storage fees
CREATE OR REPLACE FUNCTION calculate_storage_fee(
    deposit_id_param UUID
)
RETURNS DECIMAL(8,2) AS $$
DECLARE
    days_stored INTEGER;
    daily_rate DECIMAL(8,2) := 0.50; -- 50 cents per day
    base_fee DECIMAL(8,2) := 25.00; -- base monthly fee
    total_fee DECIMAL(8,2);
BEGIN
    SELECT CURRENT_DATE - deposit_date INTO days_stored
    FROM tire_deposits 
    WHERE id = deposit_id_param;
    
    IF days_stored IS NULL THEN
        RETURN 0;
    END IF;
    
    -- Calculate fee: base fee + daily rate for days over 30
    IF days_stored <= 30 THEN
        total_fee := base_fee;
    ELSE
        total_fee := base_fee + ((days_stored - 30) * daily_rate);
    END IF;
    
    RETURN total_fee;
END;
$$ LANGUAGE plpgsql;
