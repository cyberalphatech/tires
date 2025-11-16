import { NextResponse } from "next/server"
import mysql from "mysql2/promise"

export async function GET() {
  const results = {
    timestamp: new Date().toISOString(),
    database_connection: false,
    vehicles_table_exists: false,
    vehicles_table_structure: null,
    clients_table_exists: false,
    test_insertion: null,
    error_details: null,
  }

  try {
    console.log("[v0] Starting database diagnostic...")

    // Create database connection
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: Number.parseInt(process.env.DB_PORT || "3306"),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      connectTimeout: 10000,
      acquireTimeout: 10000,
      timeout: 10000,
    })

    results.database_connection = true
    console.log("[v0] Database connection successful")

    // Check if vehicles table exists
    const [vehiclesTableCheck] = await connection.execute(
      "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = ? AND table_name = 'vehicles'",
      [process.env.DB_NAME],
    )

    results.vehicles_table_exists = (vehiclesTableCheck as any)[0].count > 0
    console.log("[v0] Vehicles table exists:", results.vehicles_table_exists)

    // Check if clients table exists
    const [clientsTableCheck] = await connection.execute(
      "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = ? AND table_name = 'clients'",
      [process.env.DB_NAME],
    )

    results.clients_table_exists = (clientsTableCheck as any)[0].count > 0
    console.log("[v0] Clients table exists:", results.clients_table_exists)

    // Get vehicles table structure if it exists
    if (results.vehicles_table_exists) {
      const [tableStructure] = await connection.execute("DESCRIBE vehicles")
      results.vehicles_table_structure = tableStructure
      console.log("[v0] Vehicles table structure retrieved")
    }

    // Try test insertion if both tables exist
    if (results.vehicles_table_exists && results.clients_table_exists) {
      try {
        // First check if there are any clients
        const [clientsCheck] = await connection.execute("SELECT id FROM clients LIMIT 1")

        if ((clientsCheck as any).length > 0) {
          const clientId = (clientsCheck as any)[0].id

          // Try inserting a test vehicle
          const [insertResult] = await connection.execute(
            `INSERT INTO vehicles (client_id, license_plate, brand, model, year, fuel_type, color, mileage, created_at) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [clientId, "TEST123", "TestBrand", "TestModel", 2023, "Benzina", "Rosso", 50000],
          )

          results.test_insertion = "SUCCESS: Test vehicle inserted successfully"

          // Clean up - delete the test record
          await connection.execute("DELETE FROM vehicles WHERE license_plate = 'TEST123'")
          console.log("[v0] Test insertion successful and cleaned up")
        } else {
          results.test_insertion = "SKIPPED: No clients found in database"
        }
      } catch (insertError: any) {
        results.test_insertion = `FAILED: ${insertError.message}`
        results.error_details = {
          code: insertError.code,
          errno: insertError.errno,
          sqlState: insertError.sqlState,
          sqlMessage: insertError.sqlMessage,
        }
        console.log("[v0] Test insertion failed:", insertError.message)
      }
    } else {
      results.test_insertion = "SKIPPED: Required tables do not exist"
    }

    await connection.end()
    console.log("[v0] Database diagnostic completed successfully")
  } catch (error: any) {
    console.error("[v0] Database diagnostic error:", error.message)
    results.error_details = {
      message: error.message,
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState,
    }
  }

  return NextResponse.json(results, { status: 200 })
}
