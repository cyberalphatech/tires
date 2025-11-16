-- Check if all required tables exist and show their structure
-- This script verifies the Tires Pro database setup

-- Check if all tables exist
SELECT 
    TABLE_NAME,
    TABLE_ROWS,
    CREATE_TIME,
    UPDATE_TIME
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = 'shopreal_gomme'
ORDER BY TABLE_NAME;

-- Show structure of each table
DESCRIBE customers;
DESCRIBE vehicles;
DESCRIBE tires;
DESCRIBE km_history;
DESCRIBE notes_history;
DESCRIBE scrapped_tires;
DESCRIBE tire_deposits;
DESCRIBE users;

-- Check foreign key constraints
SELECT 
    CONSTRAINT_NAME,
    TABLE_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'shopreal_gomme'
AND REFERENCED_TABLE_NAME IS NOT NULL
ORDER BY TABLE_NAME, CONSTRAINT_NAME;

-- Check indexes
SELECT 
    TABLE_NAME,
    INDEX_NAME,
    COLUMN_NAME,
    NON_UNIQUE
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = 'shopreal_gomme'
ORDER BY TABLE_NAME, INDEX_NAME;

-- Verify sample data exists
SELECT 'customers' as table_name, COUNT(*) as record_count FROM customers
UNION ALL
SELECT 'vehicles', COUNT(*) FROM vehicles
UNION ALL
SELECT 'users', COUNT(*) FROM users
UNION ALL
SELECT 'tires', COUNT(*) FROM tires
UNION ALL
SELECT 'km_history', COUNT(*) FROM km_history
UNION ALL
SELECT 'notes_history', COUNT(*) FROM notes_history
UNION ALL
SELECT 'scrapped_tires', COUNT(*) FROM scrapped_tires
UNION ALL
SELECT 'tire_deposits', COUNT(*) FROM tire_deposits;
