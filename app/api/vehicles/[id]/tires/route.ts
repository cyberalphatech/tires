import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const vehicleId = params.id
    const { searchParams } = new URL(request.url)
    const season = searchParams.get("season")
    const status = searchParams.get("status")

    let query = "SELECT * FROM tires WHERE vehicle_id = ?"
    const queryParams: any[] = [vehicleId]

    if (season) {
      query += " AND season = ?"
      queryParams.push(season)
    }

    if (status) {
      query += " AND status = ?"
      queryParams.push(status)
    }

    query += " ORDER BY position"

    const tires = await executeQuery(query, queryParams)

    return NextResponse.json(tires)
  } catch (error) {
    console.error("[v0] Error fetching vehicle tires:", error)
    return NextResponse.json({ error: "Failed to fetch vehicle tires" }, { status: 500 })
  }
}
