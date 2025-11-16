-- Sample data for testing the tire management system

-- Insert sample customers
INSERT INTO customers (first_name, last_name, email, phone, address, city, postal_code, tax_code) VALUES
('Mario', 'Rossi', 'mario.rossi@email.com', '+39 333 1234567', 'Via Roma 123', 'Milano', '20100', 'RSSMRA80A01F205X'),
('Giulia', 'Bianchi', 'giulia.bianchi@email.com', '+39 347 9876543', 'Corso Italia 45', 'Torino', '10100', 'BNCGLI85B15L219Y'),
('Luca', 'Verdi', 'luca.verdi@email.com', '+39 320 5555555', 'Piazza Garibaldi 7', 'Roma', '00100', 'VRDLCU90C20H501Z'),
('Anna', 'Ferrari', 'anna.ferrari@email.com', '+39 338 7777777', 'Via Dante 89', 'Napoli', '80100', 'FRRANN88D25F839W');

-- Insert sample vehicles
INSERT INTO vehicles (customer_id, license_plate, make, model, year, vin, engine_type, fuel_type, total_km) VALUES
((SELECT id FROM customers WHERE email = 'mario.rossi@email.com'), 'AB123CD', 'BMW', '320d', 2020, 'WBAVA31070NM12345', '2.0 TDI', 'Diesel', 45000),
((SELECT id FROM customers WHERE email = 'mario.rossi@email.com'), 'EF456GH', 'Audi', 'A4', 2019, 'WAUZZZ8K1DA123456', '2.0 TFSI', 'Benzina', 38000),
((SELECT id FROM customers WHERE email = 'giulia.bianchi@email.com'), 'IJ789KL', 'Mercedes', 'C220', 2021, 'WDD2050461A123456', '2.2 CDI', 'Diesel', 25000),
((SELECT id FROM customers WHERE email = 'luca.verdi@email.com'), 'MN012OP', 'Volkswagen', 'Golf', 2018, 'WVWZZZ1KZJW123456', '1.6 TDI', 'Diesel', 62000),
((SELECT id FROM customers WHERE email = 'anna.ferrari@email.com'), 'QR345ST', 'Fiat', '500', 2022, 'ZFA31200001234567', '1.2', 'Benzina', 15000);

-- Insert sample tires
INSERT INTO tires (vehicle_id, customer_id, tire_code, brand, size, season, position, dot_code, production_year, tread_depth, condition, purchase_price, installation_date, km_at_installation, max_km_before_disposal, warehouse_location, status) VALUES
-- BMW 320d - Winter tires (stored)
((SELECT id FROM vehicles WHERE license_plate = 'AB123CD'), (SELECT id FROM customers WHERE email = 'mario.rossi@email.com'), 'WT001', 'Michelin', '225/50R17', 'winter', 'front_left', 'DOT1234', 2023, 6.5, 'good', 180.00, '2023-11-15', 42000, 80000, 'A1-B3', 'stored'),
((SELECT id FROM vehicles WHERE license_plate = 'AB123CD'), (SELECT id FROM customers WHERE email = 'mario.rossi@email.com'), 'WT002', 'Michelin', '225/50R17', 'winter', 'front_right', 'DOT1234', 2023, 6.3, 'good', 180.00, '2023-11-15', 42000, 80000, 'A1-B4', 'stored'),
((SELECT id FROM vehicles WHERE license_plate = 'AB123CD'), (SELECT id FROM customers WHERE email = 'mario.rossi@email.com'), 'WT003', 'Michelin', '225/50R17', 'winter', 'rear_left', 'DOT1234', 2023, 6.8, 'good', 180.00, '2023-11-15', 42000, 80000, 'A1-B5', 'stored'),
((SELECT id FROM vehicles WHERE license_plate = 'AB123CD'), (SELECT id FROM customers WHERE email = 'mario.rossi@email.com'), 'WT004', 'Michelin', '225/50R17', 'winter', 'rear_right', 'DOT1234', 2023, 6.7, 'good', 180.00, '2023-11-15', 42000, 80000, 'A1-B6', 'stored'),

-- BMW 320d - Summer tires (active)
((SELECT id FROM vehicles WHERE license_plate = 'AB123CD'), (SELECT id FROM customers WHERE email = 'mario.rossi@email.com'), 'ST001', 'Continental', '225/50R17', 'summer', 'front_left', 'DOT5678', 2022, 5.2, 'fair', 160.00, '2024-04-01', 44000, 75000, NULL, 'active'),
((SELECT id FROM vehicles WHERE license_plate = 'AB123CD'), (SELECT id FROM customers WHERE email = 'mario.rossi@email.com'), 'ST002', 'Continental', '225/50R17', 'summer', 'front_right', 'DOT5678', 2022, 5.0, 'fair', 160.00, '2024-04-01', 44000, 75000, NULL, 'active'),
((SELECT id FROM vehicles WHERE license_plate = 'AB123CD'), (SELECT id FROM customers WHERE email = 'mario.rossi@email.com'), 'ST003', 'Continental', '225/50R17', 'summer', 'rear_left', 'DOT5678', 2022, 5.5, 'fair', 160.00, '2024-04-01', 44000, 75000, NULL, 'active'),
((SELECT id FROM vehicles WHERE license_plate = 'AB123CD'), (SELECT id FROM customers WHERE email = 'mario.rossi@email.com'), 'ST004', 'Continental', '225/50R17', 'summer', 'rear_right', 'DOT5678', 2022, 5.3, 'fair', 160.00, '2024-04-01', 44000, 75000, NULL, 'active'),

-- Mercedes C220 - Winter tires (stored)
((SELECT id FROM vehicles WHERE license_plate = 'IJ789KL'), (SELECT id FROM customers WHERE email = 'giulia.bianchi@email.com'), 'MW001', 'Pirelli', '205/60R16', 'winter', 'front_left', 'DOT9876', 2023, 7.2, 'excellent', 150.00, '2023-12-01', 22000, 70000, 'B2-C1', 'stored'),
((SELECT id FROM vehicles WHERE license_plate = 'IJ789KL'), (SELECT id FROM customers WHERE email = 'giulia.bianchi@email.com'), 'MW002', 'Pirelli', '205/60R16', 'winter', 'front_right', 'DOT9876', 2023, 7.0, 'excellent', 150.00, '2023-12-01', 22000, 70000, 'B2-C2', 'stored'),
((SELECT id FROM vehicles WHERE license_plate = 'IJ789KL'), (SELECT id FROM customers WHERE email = 'giulia.bianchi@email.com'), 'MW003', 'Pirelli', '205/60R16', 'winter', 'rear_left', 'DOT9876', 2023, 7.1, 'excellent', 150.00, '2023-12-01', 22000, 70000, 'B2-C3', 'stored'),
((SELECT id FROM vehicles WHERE license_plate = 'IJ789KL'), (SELECT id FROM customers WHERE email = 'giulia.bianchi@email.com'), 'MW004', 'Pirelli', '205/60R16', 'winter', 'rear_right', 'DOT9876', 2023, 7.3, 'excellent', 150.00, '2023-12-01', 22000, 70000, 'B2-C4', 'stored');

-- Insert sample tire deposits
INSERT INTO tire_deposits (customer_id, vehicle_id, tire_id, deposit_type, deposit_date, storage_location, storage_fee, condition_at_deposit) VALUES
-- BMW winter tires deposit
((SELECT id FROM customers WHERE email = 'mario.rossi@email.com'), (SELECT id FROM vehicles WHERE license_plate = 'AB123CD'), (SELECT id FROM tires WHERE tire_code = 'WT001'), 'removed_from_vehicle', '2024-04-01', 'A1-B3', 25.00, 'good'),
((SELECT id FROM customers WHERE email = 'mario.rossi@email.com'), (SELECT id FROM vehicles WHERE license_plate = 'AB123CD'), (SELECT id FROM tires WHERE tire_code = 'WT002'), 'removed_from_vehicle', '2024-04-01', 'A1-B4', 25.00, 'good'),
((SELECT id FROM customers WHERE email = 'mario.rossi@email.com'), (SELECT id FROM vehicles WHERE license_plate = 'AB123CD'), (SELECT id FROM tires WHERE tire_code = 'WT003'), 'removed_from_vehicle', '2024-04-01', 'A1-B5', 25.00, 'good'),
((SELECT id FROM customers WHERE email = 'mario.rossi@email.com'), (SELECT id FROM vehicles WHERE license_plate = 'AB123CD'), (SELECT id FROM tires WHERE tire_code = 'WT004'), 'removed_from_vehicle', '2024-04-01', 'A1-B6', 25.00, 'good'),

-- Mercedes winter tires deposit
((SELECT id FROM customers WHERE email = 'giulia.bianchi@email.com'), (SELECT id FROM vehicles WHERE license_plate = 'IJ789KL'), (SELECT id FROM tires WHERE tire_code = 'MW001'), 'removed_from_vehicle', '2024-04-15', 'B2-C1', 20.00, 'excellent'),
((SELECT id FROM customers WHERE email = 'giulia.bianchi@email.com'), (SELECT id FROM vehicles WHERE license_plate = 'IJ789KL'), (SELECT id FROM tires WHERE tire_code = 'MW002'), 'removed_from_vehicle', '2024-04-15', 'B2-C2', 20.00, 'excellent'),
((SELECT id FROM customers WHERE email = 'giulia.bianchi@email.com'), (SELECT id FROM vehicles WHERE license_plate = 'IJ789KL'), (SELECT id FROM tires WHERE tire_code = 'MW003'), 'removed_from_vehicle', '2024-04-15', 'B2-C3', 20.00, 'excellent'),
((SELECT id FROM customers WHERE email = 'giulia.bianchi@email.com'), (SELECT id FROM vehicles WHERE license_plate = 'IJ789KL'), (SELECT id FROM tires WHERE tire_code = 'MW004'), 'removed_from_vehicle', '2024-04-15', 'B2-C4', 20.00, 'excellent');

-- Insert sample KM history
INSERT INTO km_history (vehicle_id, km_reading, reading_date, service_type, notes) VALUES
((SELECT id FROM vehicles WHERE license_plate = 'AB123CD'), 42000, '2023-11-15', 'tire_change', 'Cambio gomme invernali'),
((SELECT id FROM vehicles WHERE license_plate = 'AB123CD'), 44000, '2024-04-01', 'tire_change', 'Cambio gomme estive'),
((SELECT id FROM vehicles WHERE license_plate = 'AB123CD'), 45000, '2024-08-15', 'maintenance', 'Controllo generale'),
((SELECT id FROM vehicles WHERE license_plate = 'IJ789KL'), 22000, '2023-12-01', 'tire_change', 'Montaggio gomme invernali'),
((SELECT id FROM vehicles WHERE license_plate = 'IJ789KL'), 24000, '2024-04-15', 'tire_change', 'Montaggio gomme estive'),
((SELECT id FROM vehicles WHERE license_plate = 'IJ789KL'), 25000, '2024-09-01', 'inspection', 'Controllo pneumatici');

-- Insert sample notes
INSERT INTO notes_history (vehicle_id, customer_id, note_text, note_type, created_by) VALUES
((SELECT id FROM vehicles WHERE license_plate = 'AB123CD'), (SELECT id FROM customers WHERE email = 'mario.rossi@email.com'), 'Cliente molto soddisfatto del servizio. Richiede sempre appuntamento mattutino.', 'general', 'Marco Tecnico'),
((SELECT id FROM vehicles WHERE license_plate = 'AB123CD'), (SELECT id FROM customers WHERE email = 'mario.rossi@email.com'), 'Gomme estive da sostituire entro 5000 km. Battistrada consumato.', 'tire_service', 'Luca Meccanico'),
((SELECT id FROM vehicles WHERE license_plate = 'IJ789KL'), (SELECT id FROM customers WHERE email = 'giulia.bianchi@email.com'), 'Veicolo sempre in ottime condizioni. Cliente attenta alla manutenzione.', 'general', 'Marco Tecnico'),
((SELECT id FROM vehicles WHERE license_plate = 'MN012OP'), (SELECT id FROM customers WHERE email = 'luca.verdi@email.com'), 'Richiesta preventivo per gomme nuove. Budget limitato.', 'tire_service', 'Anna Commerciale');
