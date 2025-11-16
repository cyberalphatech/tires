import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { scaffale, area, livello, posizione, description, is_active } = await request.json()
    const positionId = params.id

    if (!scaffale || !area || !livello || !posizione) {
      return NextResponse.json({ error: "All position fields are required" }, { status: 400 })
    }

    const position_code = `${scaffale.padStart(2, "0")}-${area.padStart(2, "0")}-${livello.padStart(2, "0")}-${posizione.padStart(2, "0")}`

    await executeQuery(
      `UPDATE warehouse_positions 
       SET scaffale = ?, area = ?, livello = ?, posizione = ?, position_code = ?, description = ?, is_active = ?
       WHERE id = ?`,
      [scaffale, area, livello, posizione, position_code, description || "", is_active !== false, positionId],
    )

    const updatedPosition = await executeQuery("SELECT * FROM warehouse_positions WHERE id = ?", [positionId])

    return NextResponse.json({ position: updatedPosition[0] })
  } catch (error) {
    console.error("Error updating warehouse position:", error)
    return NextResponse.json({ error: "Failed to update position" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const positionId = params.id

    await executeQuery("UPDATE warehouse_positions SET is_active = FALSE WHERE id = ?", [positionId])

    return NextResponse.json({ message: "Position deleted successfully" })
  } catch (error) {
    console.error("Error deleting warehouse position:", error)
    return NextResponse.json({ error: "Failed to delete position" }, { status: 500 })
  }
}
