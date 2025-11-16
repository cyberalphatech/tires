import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const bodyshopId = params.id

    const stats = await executeQuery(
      `
      SELECT 
        (SELECT COUNT(*) FROM clients WHERE bodyshop_id = ?) as total_clients,
        (SELECT COUNT(*) FROM vehicles v JOIN clients c ON v.client_id = c.id WHERE c.bodyshop_id = ?) as total_vehicles,
        (SELECT COUNT(*) FROM tires t JOIN clients c ON t.client_id = c.id WHERE c.bodyshop_id = ?) as total_tires,
        (SELECT COUNT(*) FROM tires t JOIN clients c ON t.client_id = c.id WHERE c.bodyshop_id = ? AND t.season = 'winter') as winter_tires,
        (SELECT COUNT(*) FROM tires t JOIN clients c ON t.client_id = c.id WHERE c.bodyshop_id = ? AND t.season = 'summer') as summer_tires,
        (SELECT COUNT(*) FROM tires t JOIN clients c ON t.client_id = c.id WHERE c.bodyshop_id = ? AND t.status = 'stored') as stored_tires
    `,
      [bodyshopId, bodyshopId, bodyshopId, bodyshopId, bodyshopId, bodyshopId],
    )

    const recentActivities = await executeQuery(
      `
      SELECT 
        'tire_change' as activity_type,
        t.id as item_id,
        CONCAT(c.first_name, ' ', c.last_name) as client_name,
        v.license_plate,
        t.brand,
        t.size,
        t.updated_at as activity_date
      FROM tires t
      JOIN clients c ON t.client_id = c.id
      LEFT JOIN vehicles v ON t.vehicle_id = v.id
      WHERE c.bodyshop_id = ?
      ORDER BY t.updated_at DESC
      LIMIT 10
    `,
      [bodyshopId],
    )

    return NextResponse.json({
      stats: (stats as any[])[0],
      recentActivities,
    })
  } catch (error) {
    console.error("Error fetching dashboard data:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 })
  }
}
