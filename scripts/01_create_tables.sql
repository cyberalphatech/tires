-- Tire Management System Database Schema
-- Created for Italian tire service shops handling seasonal tire changes

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    postal_code VARCHAR(10),
    tax_code VARCHAR(16), -- Italian Codice Fiscale
    vat_number VARCHAR(11), -- Italian Partita IVA
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    license_plate VARCHAR(10) NOT NULL UNIQUE,
    make VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    year INTEGER,
    vin VARCHAR(17),
    engine_type VARCHAR(50),
    fuel_type VARCHAR(20),
    total_km INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tires table
CREATE TABLE IF NOT EXISTS tires (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    tire_code VARCHAR(50),
    brand VARCHAR(50),
    size VARCHAR(20), -- e.g., 205/55R16
    season VARCHAR(10) CHECK (season IN ('winter', 'summer', 'all_season')),
    position VARCHAR(20), -- e.g., 'front_left', 'front_right', 'rear_left', 'rear_right', 'spare'
    dot_code VARCHAR(20),
    production_year INTEGER,
    tread_depth DECIMAL(3,1), -- in mm
    condition VARCHAR(20) DEFAULT 'good' CHECK (condition IN ('excellent', 'good', 'fair', 'poor')),
    purchase_price DECIMAL(8,2),
    installation_date DATE,
    km_at_installation INTEGER,
    max_km_before_disposal INTEGER,
    warehouse_location VARCHAR(50),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'stored', 'scrapped', 'sold')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tire deposits/storage records
CREATE TABLE IF NOT EXISTS tire_deposits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
    tire_id UUID REFERENCES tires(id) ON DELETE CASCADE,
    deposit_type VARCHAR(20) CHECK (deposit_type IN ('removed_from_vehicle', 'purchased_from_customer')),
    deposit_date DATE NOT NULL DEFAULT CURRENT_DATE,
    retrieval_date DATE,
    storage_location VARCHAR(100),
    storage_fee DECIMAL(8,2),
    condition_at_deposit VARCHAR(20) CHECK (condition_at_deposit IN ('excellent', 'good', 'fair', 'poor')),
    condition_at_retrieval VARCHAR(20) CHECK (condition_at_retrieval IN ('excellent', 'good', 'fair', 'poor')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vehicle kilometer history
CREATE TABLE IF NOT EXISTS km_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    km_reading INTEGER NOT NULL,
    reading_date DATE NOT NULL DEFAULT CURRENT_DATE,
    service_type VARCHAR(50), -- e.g., 'tire_change', 'maintenance', 'inspection'
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vehicle notes history
CREATE TABLE IF NOT EXISTS notes_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    note_text TEXT NOT NULL,
    note_type VARCHAR(30) DEFAULT 'general', -- e.g., 'general', 'maintenance', 'tire_service'
    created_by VARCHAR(100), -- staff member name
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scrapped tires tracking
CREATE TABLE IF NOT EXISTS scrapped_tires (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tire_id UUID NOT NULL REFERENCES tires(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
    scrap_date DATE NOT NULL DEFAULT CURRENT_DATE,
    scrap_reason VARCHAR(100), -- e.g., 'worn_out', 'damaged', 'age', 'customer_request'
    final_tread_depth DECIMAL(3,1),
    km_at_scrap INTEGER,
    disposal_method VARCHAR(50), -- e.g., 'recycling', 'landfill', 'retreading'
    disposal_cost DECIMAL(8,2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vehicles_customer_id ON vehicles(customer_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_license_plate ON vehicles(license_plate);
CREATE INDEX IF NOT EXISTS idx_tires_vehicle_id ON tires(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_tires_customer_id ON tires(customer_id);
CREATE INDEX IF NOT EXISTS idx_tires_season ON tires(season);
CREATE INDEX IF NOT EXISTS idx_tires_status ON tires(status);
CREATE INDEX IF NOT EXISTS idx_tire_deposits_customer_id ON tire_deposits(customer_id);
CREATE INDEX IF NOT EXISTS idx_tire_deposits_vehicle_id ON tire_deposits(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_km_history_vehicle_id ON km_history(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_notes_history_vehicle_id ON notes_history(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_scrapped_tires_customer_id ON scrapped_tires(customer_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tires_updated_at BEFORE UPDATE ON tires FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tire_deposits_updated_at BEFORE UPDATE ON tire_deposits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
