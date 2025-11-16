import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const clientId = params.id
    console.log(`[v0] Starting client details fetch for ID: ${clientId}`)

    const clientQuery = `
      SELECT 
        id, client_code, first_name, last_name, email, phone, 
        address, created_at
      FROM clients 
      WHERE id = ?
    `
    console.log(`[v0] Executing client query for ID: ${clientId}`)
    const clientResult = await executeQuery(clientQuery, [clientId])
    console.log(`[v0] Client query result:`, clientResult)

    if (!Array.isArray(clientResult) || clientResult.length === 0) {
      console.log(`[v0] Client not found for ID: ${clientId}`)
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    const client = clientResult[0]
    console.log(`[v0] Found client:`, client)

    let vehicles = []
    try {
      console.log(`[v0] Fetching vehicles for client ${clientId}`)
      const vehiclesQuery = `
        SELECT 
          v.id, v.license_plate, v.make, v.model, v.year
        FROM vehicles v
        WHERE v.client_id = ?
        ORDER BY v.license_plate
      `
      const vehiclesResult = await executeQuery(vehiclesQuery, [clientId])
      vehicles = Array.isArray(vehiclesResult) ? vehiclesResult : []
      console.log(`[v0] Found ${vehicles.length} vehicles:`, vehicles)
    } catch (vehicleError) {
      console.error("[v0] Error fetching vehicles:", vehicleError)
      vehicles = []
    }

    let tires = []
    try {
      console.log(`[v0] Fetching tires for client ${clientId}`)
      const tiresQuery = `
        SELECT 
          t.id, t.tire_code, t.brand, t.model, t.size, t.season, t.position, 
          t.condition, t.tread_depth, t.dot_code, t.storage_date, t.deposit_type,
          t.status, t.warehouse_location, t.installation_date, t.removal_date,
          t.purchase_price, t.notes, t.created_at,
          v.license_plate, v.make as vehicle_make, v.model as vehicle_model,
          wp.position_code, wp.description as warehouse_description
        FROM tires t
        LEFT JOIN vehicles v ON t.vehicle_id = v.id
        LEFT JOIN warehouse_positions wp ON t.warehouse_location = wp.id
        WHERE t.client_id = ?
        ORDER BY t.created_at DESC
      `
      const tiresResult = await executeQuery(tiresQuery, [clientId])
      tires = Array.isArray(tiresResult) ? tiresResult : []
      console.log(`[v0] Found ${tires.length} tires for client ${clientId}:`, tires)
      console.log(
        `[v0] Tire statuses:`,
        tires.map((t) => ({ id: t.id, status: t.status })),
      )
    } catch (tireError) {
      console.error("[v0] Error fetching tires:", tireError)
      tires = []
    }

    const clientDetails = {
      ...client,
      vehicles,
      tires,
    }

    console.log(`[v0] Returning client details:`, clientDetails)
    return NextResponse.json(clientDetails)
  } catch (error) {
    console.error("[v0] Error in client details API:", error)
    return NextResponse.json({ error: "Failed to fetch client details", details: error.message }, { status: 500 })
  }
}
