import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const clientId = params.id

    console.log(`[v0] Attempting to delete client ID: ${clientId}`)

    const vehicles = await executeQuery("SELECT COUNT(*) as count FROM vehicles WHERE client_id = ?", [clientId])
    console.log(`[v0] Found ${(vehicles as any[])[0].count} vehicles for client ${clientId}`)

    if ((vehicles as any[])[0].count > 0) {
      return NextResponse.json({ error: "Cannot delete client with existing vehicles" }, { status: 400 })
    }

    const tires = await executeQuery("SELECT COUNT(*) as count FROM tires WHERE bodyshop_id = ?", [clientId])
    console.log(`[v0] Found ${(tires as any[])[0].count} tires for client ${clientId}`)

    if ((tires as any[])[0].count > 0) {
      return NextResponse.json({ error: "Cannot delete client with existing tires" }, { status: 400 })
    }

    const result = await executeQuery("DELETE FROM clients WHERE id = ?", [clientId])
    console.log(`[v0] Delete result:`, result)

    return NextResponse.json({ message: "Client deleted successfully" })
  } catch (error) {
    console.error("[v0] Error deleting client:", error)
    return NextResponse.json({ error: "Failed to delete client" }, { status: 500 })
  }
}
