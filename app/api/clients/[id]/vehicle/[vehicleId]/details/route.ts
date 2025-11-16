import { type NextRequest, NextResponse } from "next/server"
import mysql from "mysql2/promise"

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number.parseInt(process.env.DB_PORT || "3306"),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
})

export async function GET(request: NextRequest, { params }: { params: { id: string; vehicleId: string } }) {
  try {
    console.log("[v0] Vehicle details API called with params:", params)

    const clientId = Number.parseInt(params.id)
    const vehicleId = Number.parseInt(params.vehicleId)

    console.log("[v0] Parsed IDs - clientId:", clientId, "vehicleId:", vehicleId)

    if (isNaN(clientId) || isNaN(vehicleId)) {
      console.log("[v0] Invalid IDs detected")
      return NextResponse.json({ error: "Invalid client or vehicle ID" }, { status: 400 })
    }

    console.log("[v0] Fetching vehicle details...")

    // Get vehicle details with client info
    const [vehicleRows] = await (await connection).execute(
      `SELECT v.*, c.first_name, c.last_name, c.client_code
       FROM vehicles v
       JOIN clients c ON v.client_id = c.id
       WHERE v.id = ? AND v.client_id = ?`,
      [vehicleId, clientId],
    )

    console.log("[v0] Vehicle query result:", vehicleRows)

    if (!Array.isArray(vehicleRows) || vehicleRows.length === 0) {
      console.log("[v0] Vehicle not found")
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 })
    }

    const vehicle = vehicleRows[0] as any
    console.log("[v0] Vehicle found:", vehicle)

    console.log("[v0] Fetching tires onboard...")

    // Get tires onboard (currently in use)
    const [tiresOnboardRows] = await (await connection).execute(
      `SELECT t.id, t.brand, t.model, t.size, t.season, t.position, 
              t.condition, t.tread_depth, t.installation_date
       FROM tires t
       WHERE t.vehicle_id = ? AND t.status = 'in_use'
       ORDER BY t.position`,
      [vehicleId],
    )

    console.log("[v0] Tires onboard result:", tiresOnboardRows)

    console.log("[v0] Fetching tires stored...")

    // Get tires stored (in deposit)
    const [tiresStoredRows] = await (await connection).execute(
      `SELECT t.id, t.brand, t.model, t.size, t.season, t.condition, 
              t.tread_depth, t.warehouse_location as storage_location, 
              t.storage_date, t.deposit_type,
              wp.position_code as storage_location_name
       FROM tires t
       LEFT JOIN warehouse_positions wp ON t.warehouse_location = wp.id
       WHERE t.vehicle_id = ? AND t.status IN ('stored', 'sold')
       ORDER BY t.storage_date DESC`,
      [vehicleId],
    )

    console.log("[v0] Tires stored result:", tiresStoredRows)

    console.log("[v0] Fetching tires dispatched...")

    // Get tires dispatched (removed/delivered)
    const [tiresDispatchedRows] = await (await connection).execute(
      `SELECT t.id, t.brand, t.model, t.size, t.season, t.condition, 
              t.removal_date, t.warehouse_location as dispatch_location
       FROM tires t
       WHERE t.vehicle_id = ? AND t.status = 'scrapped'
       ORDER BY t.removal_date DESC`,
      [vehicleId],
    )

    console.log("[v0] Tires dispatched result:", tiresDispatchedRows)

    const vehicleDetails = {
      id: vehicle.id,
      license_plate: vehicle.license_plate,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      fuel_type: vehicle.fuel_type,
      color: vehicle.color,
      current_km: vehicle.current_km,
      image_urls: vehicle.image_urls,
      client: {
        id: clientId,
        first_name: vehicle.first_name,
        last_name: vehicle.last_name,
        client_code: vehicle.client_code,
      },
      tiresOnboard: Array.isArray(tiresOnboardRows) ? tiresOnboardRows : [],
      tiresStored: Array.isArray(tiresStoredRows)
        ? tiresStoredRows.map((tire: any) => ({
            ...tire,
            storage_location: tire.storage_location_name || tire.storage_location,
          }))
        : [],
      tiresDispatched: Array.isArray(tiresDispatchedRows) ? tiresDispatchedRows : [],
    }

    console.log("[v0] Final vehicle details response:", vehicleDetails)

    return NextResponse.json(vehicleDetails)
  } catch (error) {
    console.error("[v0] Error fetching vehicle details:", error)
    console.error("[v0] Error stack:", error instanceof Error ? error.stack : "No stack trace")
    console.error("[v0] Error message:", error instanceof Error ? error.message : "Unknown error")
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
