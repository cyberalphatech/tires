import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { bodyshopId: string } }) {
  try {
    console.log("[v0] Visual warehouse API called for bodyshop:", params.bodyshopId)
    const bodyshopId = params.bodyshopId

    try {
      const tableCheck = await executeQuery("SHOW TABLES LIKE 'warehouse_positions'", [])
      if (tableCheck.length === 0) {
        console.log("[v0] warehouse_positions table does not exist")
        return NextResponse.json([]) // Return empty array if table doesn't exist
      }
    } catch (tableError) {
      console.error("[v0] Error checking table existence:", tableError)
      return NextResponse.json([])
    }

    const query = `
      SELECT 
        wp.id,
        wp.scaffale,
        wp.area,
        wp.livello,
        wp.posizione,
        wp.position_code,
        wp.description,
        wp.is_active
      FROM warehouse_positions wp
      WHERE wp.bodyshop_id = ?
      ORDER BY wp.scaffale, wp.area, wp.livello, wp.posizione
    `

    console.log("[v0] Executing query with bodyshopId:", bodyshopId)
    const positions = await executeQuery(query, [bodyshopId])
    console.log("[v0] Found positions:", positions.length)

    if (!positions || positions.length === 0) {
      console.log("[v0] No positions found for bodyshop:", bodyshopId)
      return NextResponse.json([])
    }

    const enrichedPositions = await Promise.all(
      positions.map(async (position: any) => {
        try {
          const tireQuery = `SELECT COUNT(*) as tire_count FROM tires WHERE warehouse_location = ?`
          const tireResult = await executeQuery(tireQuery, [position.id.toString()])
          const tireCount = tireResult[0]?.tire_count || 0

          let clientName = null
          if (tireCount > 0) {
            try {
              const clientQuery = `
                SELECT DISTINCT CONCAT(c.first_name, ' ', c.last_name) as client_name
                FROM tires t
                JOIN clients c ON t.client_id = c.id
                WHERE t.warehouse_location = ?
                LIMIT 1
              `
              const clientResult = await executeQuery(clientQuery, [position.id.toString()])
              clientName = clientResult[0]?.client_name || null
            } catch (clientError) {
              console.error("[v0] Error getting client name for position:", position.position_code, clientError)
            }
          }

          return {
            ...position,
            occupied: tireCount > 0,
            tire_count: tireCount,
            client_name: clientName,
          }
        } catch (error) {
          console.error("[v0] Error enriching position:", position.position_code, error)
          return {
            ...position,
            occupied: false,
            tire_count: 0,
            client_name: null,
          }
        }
      }),
    )

    console.log("[v0] Returning enriched positions:", enrichedPositions.length)
    return NextResponse.json(enrichedPositions)
  } catch (error) {
    console.error("[v0] Error fetching warehouse visual data:", error)
    return NextResponse.json([])
  }
}
