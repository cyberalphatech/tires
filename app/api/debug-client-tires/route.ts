import { type NextRequest, NextResponse } from "next/server"
import mysql from "mysql2/promise"

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number.parseInt(process.env.DB_PORT || "3306"),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get("client_id") || "5"
    const bodyshopId = searchParams.get("bodyshop_id") || "3"

    console.log(`[v0] Debugging client ${clientId} for bodyshop ${bodyshopId}`)

    // Check if client exists and belongs to bodyshop
    const [clientRows] = await connection.execute(
      "SELECT id, first_name, last_name, bodyshop_id FROM clients WHERE id = ?",
      [clientId],
    )

    // Check total tires in database
    const [totalTiresRows] = await connection.execute("SELECT COUNT(*) as total FROM tires")

    // Check tires for this client
    const [clientTiresRows] = await connection.execute("SELECT * FROM tires WHERE client_id = ?", [clientId])

    // Check tires for this bodyshop
    const [bodyshopTiresRows] = await connection.execute("SELECT COUNT(*) as total FROM tires WHERE bodyshop_id = ?", [
      bodyshopId,
    ])

    // Check table structure
    const [tableStructure] = await connection.execute("DESCRIBE tires")

    const diagnostic = {
      client_id: clientId,
      bodyshop_id: bodyshopId,
      client_exists: Array.isArray(clientRows) && clientRows.length > 0,
      client_data: clientRows,
      total_tires_in_db: totalTiresRows,
      client_tires: clientTiresRows,
      bodyshop_tires: bodyshopTiresRows,
      tires_table_structure: tableStructure,
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(diagnostic)
  } catch (error) {
    console.error("[v0] Diagnostic error:", error)
    return NextResponse.json(
      {
        error: "Diagnostic failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
