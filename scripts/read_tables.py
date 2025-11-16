import mysql.connector
import sys

try:
    # <CHANGE> Adding connection timeout and autocommit for better reliability
    connection = mysql.connector.connect(
        host='143.95.235.24',
        database='shopreal_gomme',
        user='shopreal_gomme',
        password='!bSpRG4ejuC@',
        port=3306,
        connection_timeout=10,
        autocommit=True
    )
    
    cursor = connection.cursor()
    
    print("=== DATABASE CONNECTION SUCCESSFUL ===")
    print(f"Connected to database: shopreal_gomme")
    print()
    
    # Show all tables
    cursor.execute("SHOW TABLES")
    tables = cursor.fetchall()
    
    print("=== ALL TABLES IN DATABASE ===")
    if tables:
        for i, table in enumerate(tables, 1):
            print(f"{i}. {table[0]}")
    else:
        print("No tables found in database")
    
    print(f"\nTotal tables: {len(tables)}")
    
    # <CHANGE> Adding detailed analysis of expected vs actual tables
    expected_tables = ['customers', 'clients', 'vehicles', 'tires', 'warehouse_positions']
    existing_table_names = [table[0] for table in tables]
    
    print("\n=== MISSING TABLES ANALYSIS ===")
    missing_tables = []
    for expected in expected_tables:
        if expected not in existing_table_names:
            missing_tables.append(expected)
            print(f"✗ MISSING: {expected}")
        else:
            print(f"✓ EXISTS: {expected}")
    
    if missing_tables:
        print(f"\nTables that need to be created: {', '.join(missing_tables)}")
    else:
        print("\nAll expected tables exist!")
    
    # Check specifically for warehouse_positions table
    print("\n=== WAREHOUSE_POSITIONS TABLE DETAILS ===")
    if 'warehouse_positions' in existing_table_names:
        print("✓ warehouse_positions table EXISTS")
        
        # Show table structure
        cursor.execute("DESCRIBE warehouse_positions")
        columns = cursor.fetchall()
        print("\nTable structure:")
        for col in columns:
            print(f"  - {col[0]} ({col[1]})")
            
        # Show row count
        cursor.execute("SELECT COUNT(*) FROM warehouse_positions")
        count = cursor.fetchone()[0]
        print(f"\nRows in table: {count}")
    else:
        print("✗ warehouse_positions table NOT FOUND - needs to be created")
    
    cursor.close()
    connection.close()
    
except mysql.connector.Error as error:
    print(f"Error connecting to MySQL: {error}")
    sys.exit(1)
except Exception as e:
    print(f"Unexpected error: {e}")
    sys.exit(1)
