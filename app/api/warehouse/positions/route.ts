import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const bodyshopId = searchParams.get("bodyshop_id")

    if (!bodyshopId) {
      return NextResponse.json({ error: "Bodyshop ID is required" }, { status: 400 })
    }

    const positions = await executeQuery(
      `SELECT * FROM warehouse_positions 
       WHERE bodyshop_id = ? AND is_active = TRUE 
       ORDER BY scaffale, area, livello, posizione`,
      [bodyshopId],
    )

    return NextResponse.json({ positions })
  } catch (error) {
    console.error("Error fetching warehouse positions:", error)
    return NextResponse.json({ error: "Failed to fetch positions" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { bodyshop_id, scaffale, area, livello, posizione, description } = await request.json()

    if (!bodyshop_id || !scaffale || !area || !livello || !posizione) {
      return NextResponse.json({ error: "All position fields are required" }, { status: 400 })
    }

    const position_code = `${scaffale.padStart(2, "0")}-${area.padStart(2, "0")}-${livello.padStart(2, "0")}-${posizione.padStart(2, "0")}`

    const result = await executeQuery(
      `INSERT INTO warehouse_positions (bodyshop_id, scaffale, area, livello, posizione, position_code, description)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [bodyshop_id, scaffale, area, livello, posizione, position_code, description || ""],
    )

    const newPosition = await executeQuery("SELECT * FROM warehouse_positions WHERE id = ?", [result.insertId])

    return NextResponse.json({ position: newPosition[0] }, { status: 201 })
  } catch (error) {
    console.error("Error creating warehouse position:", error)
    return NextResponse.json({ error: "Failed to create position" }, { status: 500 })
  }
}
