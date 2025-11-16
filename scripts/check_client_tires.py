import mysql.connector
import os
from datetime import datetime

def check_client_tires():
    try:
        # Database connection
        connection = mysql.connector.connect(
            host=os.getenv('DB_HOST', '143.95.235.24'),
            port=int(os.getenv('DB_PORT', '3306')),
            user=os.getenv('DB_USER', 'shopreal_gomme'),
            password=os.getenv('DB_PASSWORD', '!bSpRG4ejuC@'),
            database=os.getenv('DB_NAME', 'shopreal_gomme')
        )
        
        cursor = connection.cursor(dictionary=True)
        
        print("=== TIRE DATA DIAGNOSTIC FOR CLIENT 5 ===")
        print(f"Timestamp: {datetime.now()}")
        print()
        
        # Check if tires table exists
        cursor.execute("SHOW TABLES LIKE 'tires'")
        table_exists = cursor.fetchone()
        
        if not table_exists:
            print("❌ ERROR: 'tires' table does not exist!")
            return
        
        print("✅ 'tires' table exists")
        
        # Check table structure
        cursor.execute("DESCRIBE tires")
        columns = cursor.fetchall()
        print(f"\n📋 TIRES TABLE STRUCTURE ({len(columns)} columns):")
        for col in columns:
            print(f"  - {col['Field']} ({col['Type']}) {'NOT NULL' if col['Null'] == 'NO' else 'NULL'}")
        
        # Check total tires count
        cursor.execute("SELECT COUNT(*) as total FROM tires")
        total_tires = cursor.fetchone()['total']
        print(f"\n📊 TOTAL TIRES IN DATABASE: {total_tires}")
        
        # Check if client 5 exists
        cursor.execute("SELECT * FROM clients WHERE id = 5")
        client = cursor.fetchone()
        
        if not client:
            print("❌ ERROR: Client with ID 5 does not exist!")
            return
        
        print(f"✅ Client 5 exists: {client['first_name']} {client['last_name']}")
        
        # Check tires for client 5
        cursor.execute("""
            SELECT 
                t.*,
                v.license_plate,
                v.brand as vehicle_brand,
                v.model as vehicle_model
            FROM tires t
            LEFT JOIN vehicles v ON t.vehicle_id = v.id
            WHERE t.client_id = 5
        """)
        
        client_tires = cursor.fetchall()
        print(f"\n🔍 TIRES FOR CLIENT 5: {len(client_tires)} found")
        
        if client_tires:
            for i, tire in enumerate(client_tires, 1):
                print(f"\n  Tire {i}:")
                print(f"    ID: {tire['id']}")
                print(f"    Code: {tire.get('tire_code', 'N/A')}")
                print(f"    Brand: {tire['brand']}")
                print(f"    Model: {tire.get('model', 'N/A')}")
                print(f"    Size: {tire['size']}")
                print(f"    Season: {tire.get('season', 'N/A')}")
                print(f"    Status: {tire.get('status', 'N/A')}")
                print(f"    Vehicle: {tire.get('license_plate', 'N/A')} ({tire.get('vehicle_brand', 'N/A')} {tire.get('vehicle_model', 'N/A')})")
                print(f"    Storage Date: {tire.get('storage_date', 'N/A')}")
                print(f"    Created: {tire.get('created_at', 'N/A')}")
        else:
            print("  ❌ No tires found for client 5")
            
            # Check if there are tires for other clients
            cursor.execute("SELECT DISTINCT client_id, COUNT(*) as count FROM tires GROUP BY client_id")
            other_clients = cursor.fetchall()
            
            if other_clients:
                print(f"\n  📋 TIRES BY CLIENT:")
                for client_data in other_clients:
                    print(f"    Client {client_data['client_id']}: {client_data['count']} tires")
            else:
                print("  ❌ No tires found for any client in the database")
        
        # Check API endpoint simulation
        print(f"\n🔗 API ENDPOINT SIMULATION:")
        cursor.execute("""
            SELECT 
                t.id,
                t.tire_code,
                t.brand,
                t.model,
                t.size,
                t.season,
                t.condition as tire_condition,
                t.tread_depth,
                t.dot_code,
                t.storage_date,
                t.deposit_type,
                t.status,
                v.license_plate,
                v.brand as vehicle_brand,
                v.model as vehicle_model,
                wp.position_code,
                wp.description as warehouse_description
            FROM tires t
            LEFT JOIN vehicles v ON t.vehicle_id = v.id
            LEFT JOIN warehouse_positions wp ON t.warehouse_location = wp.id
            WHERE t.client_id = 5
            AND (t.status = 'stored' OR t.status = 'active')
        """)
        
        api_result = cursor.fetchall()
        print(f"  API Query Result: {len(api_result)} tires")
        
        if api_result:
            for tire in api_result:
                print(f"    - {tire['brand']} {tire.get('model', 'N/A')} ({tire['size']}) - Status: {tire.get('status', 'N/A')}")
        
    except mysql.connector.Error as e:
        print(f"❌ DATABASE ERROR: {e}")
    except Exception as e:
        print(f"❌ GENERAL ERROR: {e}")
    finally:
        if 'connection' in locals() and connection.is_connected():
            cursor.close()
            connection.close()
            print(f"\n✅ Database connection closed")

if __name__ == "__main__":
    check_client_tires()
