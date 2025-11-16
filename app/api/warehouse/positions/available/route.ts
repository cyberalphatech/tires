import { type NextRequest, NextResponse } from "next/server"
import mysql from "mysql2/promise"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const bodyshopId = searchParams.get("bodyshop_id")

    if (!bodyshopId) {
      return NextResponse.json({ error: "bodyshop_id is required" }, { status: 400 })
    }

    // Create database connection
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: Number.parseInt(process.env.DB_PORT || "3306"),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    })

    console.log("[v0] Fetching available positions for bodyshop:", bodyshopId)

    const allPositionsQuery = `
      SELECT wp.id, wp.position_code, wp.description
      FROM warehouse_positions wp
      WHERE wp.bodyshop_id = ?
      ORDER BY wp.position_code
    `
    const [allPositions] = await connection.execute(allPositionsQuery, [bodyshopId])
    console.log("[v0] Total warehouse positions for bodyshop:", allPositions.length)

    const occupiedQuery = `
      SELECT DISTINCT t.warehouse_location
      FROM tires t
      WHERE t.warehouse_location IS NOT NULL
      AND t.bodyshop_id = ?
    `
    const [occupiedRows] = await connection.execute(occupiedQuery, [bodyshopId])
    const occupiedPositionIds = occupiedRows.map((row) => row.warehouse_location)
    console.log("[v0] Occupied position IDs:", occupiedPositionIds)

    const availablePositions = allPositions.filter((position) => !occupiedPositionIds.includes(position.id))

    console.log("[v0] Available warehouse positions found:", availablePositions.length)
    console.log("[v0] Available positions:", availablePositions)

    await connection.end()

    return NextResponse.json({ positions: availablePositions })
  } catch (error) {
    console.error("Error fetching available warehouse positions:", error)
    return NextResponse.json({ error: "Failed to fetch available warehouse positions" }, { status: 500 })
  }
}
