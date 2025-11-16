-- Add test tire data for client 5 to verify tire cards display
-- This will create sample tires so we can see the tire cards working

INSERT INTO tires (
    client_id, 
    bodyshop_id, 
    tire_code, 
    brand, 
    model,
    size, 
    season, 
    position, 
    `condition`, 
    tread_depth, 
    purchase_price, 
    warehouse_location, 
    deposit_type,
    storage_date,
    status, 
    notes
) VALUES 
(5, 3, 'T1703123456001', 'Michelin', 'Pilot Sport 4', '225/45R17', 'summer', 'storage', 'good', 7.5, 150.00, '1', 'seasonal', '2024-01-15', 'stored', 'Pneumatici estivi cliente Andorno'),
(5, 3, 'T1703123456002', 'Pirelli', 'Winter Sottozero', '225/45R17', 'winter', 'storage', 'excellent', 8.2, 180.00, '2', 'seasonal', '2024-01-15', 'stored', 'Pneumatici invernali cliente Andorno'),
(5, 3, 'T1703123456003', 'Continental', 'ContiSportContact', '225/45R17', 'summer', 'storage', 'fair', 6.0, 140.00, '3', 'seasonal', '2024-01-20', 'stored', 'Set pneumatici di ricambio'),
(5, 3, 'T1703123456004', 'Bridgestone', 'Blizzak', '225/45R17', 'winter', 'storage', 'good', 7.8, 170.00, '4', 'seasonal', '2024-01-20', 'stored', 'Pneumatici invernali premium');
