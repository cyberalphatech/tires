import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const clientId = params.id

    console.log("[v0] Fetching vehicles for client ID:", clientId)

    // Check if vehicles table exists
    const tablesResult = await executeQuery("SHOW TABLES LIKE 'vehicles'")

    if (!tablesResult || tablesResult.length === 0) {
      console.log("[v0] Vehicles table does not exist")
      return NextResponse.json([])
    }

    // Check if clients table exists
    const clientsTableResult = await executeQuery("SHOW TABLES LIKE 'clients'")

    if (!clientsTableResult || clientsTableResult.length === 0) {
      console.log("[v0] Clients table does not exist")
      return NextResponse.json([])
    }

    // Fetch vehicles for the specific client
    const vehicles = await executeQuery(
      `
      SELECT 
        v.*,
        c.first_name,
        c.last_name
      FROM vehicles v
      LEFT JOIN clients c ON v.client_id = c.id
      WHERE v.client_id = ?
      ORDER BY v.created_at DESC
    `,
      [clientId],
    )

    console.log("[v0] Found vehicles:", vehicles?.length || 0)

    return NextResponse.json(vehicles || [])
  } catch (error) {
    console.error("[v0] Error fetching client vehicles:", error)

    // Return empty array instead of error to prevent infinite loops
    return NextResponse.json([])
  }
}
