-- Sample Data for Tire Management System - MySQL Version
-- Run this script after creating tables to add test data

-- Insert sample customers
INSERT INTO customers (customer_code, first_name, last_name, email, phone, address, city, postal_code, tax_code) VALUES
('CUST001', 'Mario', 'Rossi', 'mario.rossi@email.com', '+39 333 1234567', 'Via Roma 123', 'Milano', '20100', 'RSSMRA80A01F205X'),
('CUST002', 'Giulia', 'Bianchi', 'giulia.bianchi@email.com', '+39 347 9876543', 'Corso Italia 45', 'Torino', '10100', 'BNCGLI85B15L219Y'),
('CUST003', 'Luca', 'Ferrari', 'luca.ferrari@email.com', '+39 320 5555555', 'Piazza Duomo 7', 'Firenze', '50100', 'FRRLCU90C20D612Z'),
('CUST004', 'Anna', 'Conti', 'anna.conti@email.com', '+39 366 7777777', 'Via Veneto 89', 'Roma', '00100', 'CNTNNA75D25H501W');

-- Insert sample vehicles
INSERT INTO vehicles (customer_id, license_plate, make, model, year, vin, engine_type, fuel_type, current_km) VALUES
(1, 'AB123CD', 'BMW', '320d', 2020, 'WBAVA31070NM12345', '2.0 TDI', 'Diesel', 45000),
(1, 'EF456GH', 'Audi', 'A4', 2019, 'WAUZZZ8K1DA123456', '2.0 TFSI', 'Benzina', 38000),
(2, 'IJ789KL', 'Mercedes', 'C220', 2021, 'WDD2050461A123456', '2.0 CDI', 'Diesel', 25000),
(3, 'MN012OP', 'Volkswagen', 'Golf', 2018, '1VWAA7A32JC123456', '1.6 TDI', 'Diesel', 62000),
(4, 'QR345ST', 'Fiat', '500X', 2022, 'ZFACP4A36NP123456', '1.3 MultiJet', 'Diesel', 15000);

-- Insert sample tires
INSERT INTO tires (tire_code, customer_id, vehicle_id, brand, size, season, position, dot_code, manufacture_year, tread_depth, condition_rating, warehouse_location, status, deposit_type, notes) VALUES
-- BMW 320d - Winter tires (stored)
('FF925AB', 1, 1, 'Michelin', '205/55R16', 'winter', 'A6', 'DOT1234', 2023, 7.0, 'good', 'A-12-3', 'stored', 'removed_from_vehicle', 'Pneumatici invernali BMW, buone condizioni'),
('FF925AC', 1, 1, 'Michelin', '205/55R16', 'winter', 'A5', 'DOT1235', 2023, 6.8, 'good', 'A-12-4', 'stored', 'removed_from_vehicle', 'Pneumatici invernali BMW'),
('FF925AD', 1, 1, 'Michelin', '205/55R16', 'winter', 'P6', 'DOT1236', 2023, 7.2, 'good', 'A-12-5', 'stored', 'removed_from_vehicle', 'Pneumatici invernali BMW'),
('FF925AE', 1, 1, 'Michelin', '205/55R16', 'winter', 'P4', 'DOT1237', 2023, 6.9, 'good', 'A-12-6', 'stored', 'removed_from_vehicle', 'Pneumatici invernali BMW'),

-- Audi A4 - Summer tires (in use)
('SU456AB', 1, 2, 'Continental', '225/50R17', 'summer', 'A6', 'DOT2234', 2022, 5.5, 'fair', NULL, 'in_use', 'removed_from_vehicle', 'Pneumatici estivi Audi'),
('SU456AC', 1, 2, 'Continental', '225/50R17', 'summer', 'A5', 'DOT2235', 2022, 5.3, 'fair', NULL, 'in_use', 'removed_from_vehicle', 'Pneumatici estivi Audi'),
('SU456AD', 1, 2, 'Continental', '225/50R17', 'summer', 'P6', 'DOT2236', 2022, 5.8, 'fair', NULL, 'in_use', 'removed_from_vehicle', 'Pneumatici estivi Audi'),
('SU456AE', 1, 2, 'Continental', '225/50R17', 'summer', 'P4', 'DOT2237', 2022, 5.4, 'fair', NULL, 'in_use', 'removed_from_vehicle', 'Pneumatici estivi Audi'),

-- Mercedes C220 - Winter tires (stored)
('WI789AB', 2, 3, 'Pirelli', '225/45R18', 'winter', 'A6', 'DOT3234', 2023, 8.0, 'excellent', 'B-15-1', 'stored', 'purchased_from_customer', 'Pneumatici acquistati dal cliente'),
('WI789AC', 2, 3, 'Pirelli', '225/45R18', 'winter', 'A5', 'DOT3235', 2023, 7.8, 'excellent', 'B-15-2', 'stored', 'purchased_from_customer', 'Pneumatici acquistati dal cliente'),

-- Volkswagen Golf - Mixed tires
('VW012AB', 3, 4, 'Bridgestone', '195/65R15', 'summer', 'A6', 'DOT4234', 2021, 4.2, 'poor', 'C-08-1', 'stored', 'removed_from_vehicle', 'Da sostituire presto'),
('VW012AC', 3, 4, 'Bridgestone', '195/65R15', 'summer', 'A5', 'DOT4235', 2021, 4.0, 'poor', 'C-08-2', 'stored', 'removed_from_vehicle', 'Da sostituire presto');

-- Insert sample KM history
INSERT INTO km_history (vehicle_id, recorded_km, previous_km, km_difference, recorded_date, service_type, notes) VALUES
(1, 45000, 42000, 3000, '2024-01-15', 'Cambio gomme invernali', 'Montaggio pneumatici invernali'),
(1, 42000, 38000, 4000, '2023-10-20', 'Cambio gomme estive', 'Smontaggio pneumatici invernali'),
(2, 38000, 35000, 3000, '2024-01-10', 'Controllo pneumatici', 'Verifica pressione e usura'),
(3, 25000, 22000, 3000, '2024-01-20', 'Deposito gomme invernali', 'Cambio stagionale'),
(4, 62000, 58000, 4000, '2024-01-05', 'Manutenzione ordinaria', 'Controllo generale veicolo');

-- Insert sample notes
INSERT INTO notes_history (vehicle_id, note_text, note_type, created_by) VALUES
(1, 'Cliente molto soddisfatto del servizio di deposito gomme', 'general', 'Mario Meccanico'),
(1, 'Pneumatici invernali in ottime condizioni, possono durare ancora 2 stagioni', 'tire_change', 'Mario Meccanico'),
(2, 'Consigliato cambio pneumatici entro 10.000 km', 'maintenance', 'Luigi Tecnico'),
(3, 'Cliente richiede preventivo per pneumatici nuovi', 'general', 'Mario Meccanico'),
(4, 'Pneumatici molto usurati, sostituzione urgente', 'tire_change', 'Luigi Tecnico');

-- Insert sample tire deposits
INSERT INTO tire_deposits (customer_id, vehicle_id, deposit_date, total_tires, season, storage_location, deposit_fee, status, notes) VALUES
(1, 1, '2024-01-15', 4, 'winter', 'Settore A - Scaffale 12', 80.00, 'active', 'Deposito pneumatici invernali BMW 320d'),
(2, 3, '2024-01-20', 2, 'winter', 'Settore B - Scaffale 15', 40.00, 'active', 'Deposito parziale pneumatici Mercedes'),
(3, 4, '2023-12-10', 4, 'summer', 'Settore C - Scaffale 08', 80.00, 'active', 'Deposito pneumatici estivi VW Golf');

-- Insert sample scrapped tires
INSERT INTO scrapped_tires (tire_id, customer_id, vehicle_id, tire_code, brand, size, season, scrap_reason, scrap_date, final_tread_depth, final_km, disposal_method, notes) VALUES
(11, 3, 4, 'VW012AB', 'Bridgestone', '195/65R15', 'summer', 'Usura eccessiva', '2024-01-25', 1.5, 62000, 'Riciclaggio', 'Pneumatico non più sicuro per la circolazione'),
(12, 3, 4, 'VW012AC', 'Bridgestone', '195/65R15', 'summer', 'Usura eccessiva', '2024-01-25', 1.3, 62000, 'Riciclaggio', 'Pneumatico non più sicuro per la circolazione');
