import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const bodyshopId = params.id

    const inventorySummary = await executeQuery(
      `
      SELECT 
        t.season,
        t.status,
        t.warehouse_location,
        COUNT(*) as count,
        AVG(t.tread_depth) as avg_tread_depth,
        GROUP_CONCAT(DISTINCT t.brand) as brands
      FROM tires t
      LEFT JOIN clients c ON t.client_id = c.id
      WHERE c.bodyshop_id = ? AND t.status IN ('stored', 'in_use')
      GROUP BY t.season, t.status, t.warehouse_location
      ORDER BY t.season, t.warehouse_location
    `,
      [bodyshopId],
    )

    const detailedInventory = await executeQuery(
      `
      SELECT 
        t.*,
        c.first_name,
        c.last_name,
        c.client_code,
        v.license_plate,
        v.make,
        v.model
      FROM tires t
      LEFT JOIN clients c ON t.client_id = c.id
      LEFT JOIN vehicles v ON t.vehicle_id = v.id
      WHERE c.bodyshop_id = ? AND t.status IN ('stored', 'in_use')
      ORDER BY t.warehouse_location, t.season, t.created_at DESC
    `,
      [bodyshopId],
    )

    return NextResponse.json({
      summary: inventorySummary,
      detailed: detailedInventory,
    })
  } catch (error) {
    console.error("Error fetching inventory:", error)
    return NextResponse.json({ error: "Failed to fetch inventory" }, { status: 500 })
  }
}
