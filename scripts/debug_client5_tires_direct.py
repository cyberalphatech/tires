import mysql.connector
import os
import json
from datetime import datetime

def connect_to_database():
    try:
        connection = mysql.connector.connect(
            host=os.getenv('DB_HOST', '143.95.235.24'),
            port=int(os.getenv('DB_PORT', '3306')),
            user=os.getenv('DB_USER', 'shopreal_gomme'),
            password=os.getenv('DB_PASSWORD', '!bSpRG4ejuC@'),
            database=os.getenv('DB_NAME', 'shopreal_gomme')
        )
        return connection
    except mysql.connector.Error as err:
        print(f"❌ Database connection failed: {err}")
        return None

def debug_client5_tires():
    connection = connect_to_database()
    if not connection:
        return
    
    cursor = connection.cursor(dictionary=True)
    
    print("🔍 DEBUGGING CLIENT 5 TIRES")
    print("=" * 50)
    
    # 1. Check if client 5 exists
    print("\n1. Checking if client 5 exists:")
    cursor.execute("SELECT * FROM clients WHERE id = 5")
    client = cursor.fetchone()
    if client:
        print(f"✅ Client 5 found: {client['first_name']} {client['last_name']}")
        print(f"   Bodyshop ID: {client.get('bodyshop_id', 'N/A')}")
    else:
        print("❌ Client 5 not found!")
        return
    
    # 2. Check all tires for client 5 (no filters)
    print("\n2. All tires for client 5 (no filters):")
    cursor.execute("SELECT * FROM tires WHERE client_id = 5")
    all_tires = cursor.fetchall()
    print(f"   Total tires found: {len(all_tires)}")
    
    for tire in all_tires:
        print(f"   - Tire ID {tire['id']}: {tire['brand']} {tire['size']} (Status: {tire.get('status', 'N/A')})")
    
    # 3. Check tires with status filtering
    print("\n3. Tires with status 'stored' or 'active':")
    cursor.execute("SELECT * FROM tires WHERE client_id = 5 AND status IN ('stored', 'active')")
    filtered_tires = cursor.fetchall()
    print(f"   Filtered tires found: {len(filtered_tires)}")
    
    # 4. Simulate the exact API query
    print("\n4. Simulating exact API query:")
    api_query = """
    SELECT 
        t.id,
        t.tire_code,
        t.brand,
        t.model,
        t.size,
        t.season,
        t.position,
        t.condition,
        t.tread_depth,
        t.dot_code,
        t.storage_date,
        t.deposit_type,
        t.status,
        t.warehouse_location,
        v.license_plate,
        wp.position_code as warehouse_position_code,
        wp.description as warehouse_position_description
    FROM tires t
    LEFT JOIN vehicles v ON t.vehicle_id = v.id
    LEFT JOIN warehouse_positions wp ON t.warehouse_location = wp.id
    WHERE t.client_id = %s AND t.status IN ('stored', 'active')
    ORDER BY t.created_at DESC
    """
    
    cursor.execute(api_query, (5,))
    api_result = cursor.fetchall()
    print(f"   API query result count: {len(api_result)}")
    
    if api_result:
        print("   API query results:")
        for tire in api_result:
            print(f"   - {tire['brand']} {tire['size']} (Status: {tire['status']}, Warehouse: {tire['warehouse_position_code']})")
    else:
        print("   ❌ API query returned no results!")
        
        # Debug why API query fails
        print("\n5. Debugging API query failure:")
        
        # Check without status filter
        cursor.execute("SELECT COUNT(*) as count FROM tires WHERE client_id = 5")
        count_no_filter = cursor.fetchone()['count']
        print(f"   Tires without status filter: {count_no_filter}")
        
        # Check with each status individually
        for status in ['stored', 'active', 'inactive', 'disposed']:
            cursor.execute("SELECT COUNT(*) as count FROM tires WHERE client_id = 5 AND status = %s", (status,))
            count = cursor.fetchone()['count']
            print(f"   Tires with status '{status}': {count}")
    
    # 6. Check warehouse_positions table
    print("\n6. Checking warehouse_positions table:")
    cursor.execute("SELECT COUNT(*) as count FROM warehouse_positions")
    wp_count = cursor.fetchone()['count']
    print(f"   Total warehouse positions: {wp_count}")
    
    cursor.close()
    connection.close()
    print("\n✅ Diagnostic complete!")

if __name__ == "__main__":
    debug_client5_tires()
