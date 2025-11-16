import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const bodyshopId = params.id

    console.log("[v0] Fetching clients for bodyshop ID:", bodyshopId)

    // Check if there are any clients in the database at all
    const allClients = await executeQuery("SELECT id, bodyshop_id, first_name, last_name FROM clients LIMIT 10")
    console.log("[v0] All clients in database (first 10):", allClients)

    const clients = await executeQuery(
      `
      SELECT 
        c.*,
        COUNT(DISTINCT v.id) as vehicle_count,
        COUNT(DISTINCT t.id) as tire_count
      FROM clients c
      LEFT JOIN vehicles v ON c.id = v.client_id
      LEFT JOIN tires t ON c.id = t.client_id
      WHERE c.bodyshop_id = ?
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `,
      [bodyshopId],
    )

    console.log("[v0] Clients found for bodyshop", bodyshopId, ":", clients)
    console.log("[v0] Number of clients found:", clients.length)

    return NextResponse.json(clients)
  } catch (error) {
    console.error("Error fetching bodyshop clients:", error)
    return NextResponse.json({ error: "Failed to fetch clients" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const bodyshopId = params.id
    const body = await request.json()
    const { first_name, last_name, email, phone, address, city, postal_code, tax_code } = body

    if (!first_name || !last_name || !phone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const clientCodeResult = await executeQuery("SELECT COUNT(*) as count FROM clients WHERE bodyshop_id = ?", [
      bodyshopId,
    ])
    const clientCount = (clientCodeResult as any)[0].count
    const client_code = `CL${bodyshopId}${String(clientCount + 1).padStart(3, "0")}`

    const result = await executeQuery(
      `
      INSERT INTO clients (bodyshop_id, client_code, first_name, last_name, email, phone, address, city, postal_code, tax_code) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [bodyshopId, client_code, first_name, last_name, email, phone, address, city, postal_code, tax_code],
    )

    const insertResult = result as any
    const newClient = await executeQuery("SELECT * FROM clients WHERE id = ?", [insertResult.insertId])

    return NextResponse.json(newClient[0], { status: 201 })
  } catch (error) {
    console.error("Error creating client:", error)
    return NextResponse.json({ error: "Failed to create client" }, { status: 500 })
  }
}
