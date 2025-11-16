import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const vehicleId = params.id
    const kmHistory = await executeQuery("SELECT * FROM km_history WHERE vehicle_id = ? ORDER BY date_recorded DESC", [
      vehicleId,
    ])

    return NextResponse.json(kmHistory)
  } catch (error) {
    console.error("[v0] Error fetching KM history:", error)
    return NextResponse.json({ error: "Failed to fetch KM history" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const vehicleId = params.id
    const body = await request.json()
    const { km_reading, date_recorded, notes } = body

    if (!km_reading) {
      return NextResponse.json({ error: "KM reading is required" }, { status: 400 })
    }

    const result = await executeQuery(
      `INSERT INTO km_history (vehicle_id, km_reading, date_recorded, notes) 
       VALUES (?, ?, ?, ?)`,
      [vehicleId, km_reading, date_recorded || new Date(), notes],
    )

    // Update vehicle's total_km
    await executeQuery("UPDATE vehicles SET total_km = ? WHERE id = ?", [km_reading, vehicleId])

    const insertResult = result as any
    const newRecord = await executeQuery("SELECT * FROM km_history WHERE id = ?", [insertResult.insertId])

    return NextResponse.json(newRecord[0], { status: 201 })
  } catch (error) {
    console.error("[v0] Error adding KM record:", error)
    return NextResponse.json({ error: "Failed to add KM record" }, { status: 500 })
  }
}
