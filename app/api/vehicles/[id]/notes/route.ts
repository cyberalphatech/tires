import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const vehicleId = params.id
    const notes = await executeQuery("SELECT * FROM notes_history WHERE vehicle_id = ? ORDER BY created_at DESC", [
      vehicleId,
    ])

    return NextResponse.json(notes)
  } catch (error) {
    console.error("[v0] Error fetching notes:", error)
    return NextResponse.json({ error: "Failed to fetch notes" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const vehicleId = params.id
    const body = await request.json()
    const { note } = body

    if (!note || note.trim() === "") {
      return NextResponse.json({ error: "Note content is required" }, { status: 400 })
    }

    const result = await executeQuery(`INSERT INTO notes_history (vehicle_id, note) VALUES (?, ?)`, [
      vehicleId,
      note.trim(),
    ])

    const insertResult = result as any
    const newNote = await executeQuery("SELECT * FROM notes_history WHERE id = ?", [insertResult.insertId])

    return NextResponse.json(newNote[0], { status: 201 })
  } catch (error) {
    console.error("[v0] Error adding note:", error)
    return NextResponse.json({ error: "Failed to add note" }, { status: 500 })
  }
}
