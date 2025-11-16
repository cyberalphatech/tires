import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const bodyshopId = params.id
    const { searchParams } = new URL(request.url)
    const season = searchParams.get("season")
    const status = searchParams.get("status")
    const clientId = searchParams.get("client_id")

    let query = `
      SELECT 
        t.*,
        c.first_name,
        c.last_name,
        c.client_code,
        v.license_plate,
        v.make,
        v.model,
        v.year
      FROM tires t
      LEFT JOIN clients c ON t.client_id = c.id
      LEFT JOIN vehicles v ON t.vehicle_id = v.id
      WHERE c.bodyshop_id = ?
    `
    const params_array: any[] = [bodyshopId]

    if (season) {
      query += " AND t.season = ?"
      params_array.push(season)
    }

    if (status) {
      query += " AND t.status = ?"
      params_array.push(status)
    }

    if (clientId) {
      query += " AND t.client_id = ?"
      params_array.push(clientId)
    }

    query += " ORDER BY t.created_at DESC"

    const tires = await executeQuery(query, params_array)
    return NextResponse.json(tires)
  } catch (error) {
    console.error("Error fetching bodyshop tires:", error)
    return NextResponse.json({ error: "Failed to fetch tires" }, { status: 500 })
  }
}
