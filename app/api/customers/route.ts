import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

export async function GET() {
  try {
    const customers = await executeQuery("SELECT * FROM customers ORDER BY created_at DESC")
    return NextResponse.json(customers)
  } catch (error) {
    console.error("[v0] Error fetching customers:", error)
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const tablesExist = await executeQuery(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name IN ('clients', 'customers')
    `)

    if ((tablesExist as any)[0].count < 2) {
      console.log("[v0] Required tables (clients, customers) do not exist")
      return NextResponse.json(
        { error: "Database tables not found. Please run database setup first." },
        { status: 400 },
      )
    }

    const body = await request.json()
    console.log("[v0] Received customer data:", body)

    const {
      first_name,
      last_name,
      email,
      phone,
      address,
      city,
      postal_code,
      tax_code,
      company_name,
      vat_number,
      bodyshop_id,
    } = body

    if (!first_name || !last_name || !email || !phone) {
      console.log("[v0] Missing required fields")
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    let clientCount = 0
    try {
      const clientCodeResult = await executeQuery("SELECT COUNT(*) as count FROM clients WHERE bodyshop_id = ?", [
        bodyshop_id || 1,
      ])
      clientCount = (clientCodeResult as any)[0].count
      console.log("[v0] Client count for bodyshop:", clientCount)
    } catch (countError) {
      console.error("[v0] Error counting clients, using default:", countError)
      clientCount = 0
    }

    const client_code = `CLI${String(clientCount + 1).padStart(4, "0")}`
    console.log("[v0] Generated client code:", client_code)

    try {
      const result = await executeQuery(
        `INSERT INTO clients (client_code, first_name, last_name, email, phone, address, city, postal_code, bodyshop_id, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          client_code,
          first_name,
          last_name,
          email,
          phone,
          address || null,
          city || null,
          postal_code || null,
          bodyshop_id || 1,
        ],
      )

      const insertResult = result as any
      const clientId = insertResult.insertId
      console.log("[v0] New client created with ID:", clientId)

      return NextResponse.json(
        {
          id: clientId,
          client_code,
          first_name,
          last_name,
          email,
          phone,
          message: "Client created successfully",
        },
        { status: 201 },
      )
    } catch (insertError) {
      console.error("[v0] Error inserting client:", insertError)
      return NextResponse.json(
        { error: "Database error during client insertion", details: insertError.message },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("[v0] Error creating client:", error)
    return NextResponse.json(
      {
        error: "Failed to create client",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
