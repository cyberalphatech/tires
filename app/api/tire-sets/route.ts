import { type NextRequest, NextResponse } from "next/server"
import mysql from "mysql2/promise"

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number.parseInt(process.env.DB_PORT || "3306"),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
})

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Creating tire set...")

    const body = await request.json()
    const { name, season, vehicle_id, color, client_id, tire_ids } = body

    console.log("[v0] Tire set data:", { name, season, vehicle_id, color, client_id, tire_ids })

    // Create tire set
    const [setResult] = await (await connection).execute(
      `INSERT INTO tire_sets (name, season, vehicle_id, color, client_id, created_at) 
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [name, season, vehicle_id || null, color, client_id],
    )

    const setId = (setResult as any).insertId
    console.log("[v0] Created tire set with ID:", setId)

    // Update tires to belong to this set
    if (tire_ids && tire_ids.length > 0) {
      const placeholders = tire_ids.map(() => "?").join(",")
      await (await connection).execute(`UPDATE tires SET tire_set_id = ? WHERE id IN (${placeholders})`, [
        setId,
        ...tire_ids,
      ])
      console.log("[v0] Updated", tire_ids.length, "tires with set ID")
    }

    return NextResponse.json({
      success: true,
      setId,
      message: "Tire set created successfully",
    })
  } catch (error) {
    console.error("[v0] Error creating tire set:", error)
    return NextResponse.json({ error: "Failed to create tire set" }, { status: 500 })
  }
}
