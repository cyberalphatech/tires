import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { executeQuery } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { bodyshop_id, first_name, last_name, email, phone, address, city, postal_code, tax_code, password } = body

    if (!bodyshop_id || !first_name || !last_name || !phone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Generate client code
    const clientCodeResult = await executeQuery("SELECT COUNT(*) as count FROM clients WHERE bodyshop_id = ?", [
      bodyshop_id,
    ])
    const clientCount = (clientCodeResult as any)[0].count
    const client_code = `CL${bodyshop_id}${String(clientCount + 1).padStart(3, "0")}`

    let password_hash = null
    if (password) {
      password_hash = await bcrypt.hash(password, 10)
    }

    const result = await executeQuery(
      `
      INSERT INTO clients (bodyshop_id, client_code, first_name, last_name, email, phone, address, city, postal_code, tax_code, password_hash) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        bodyshop_id,
        client_code,
        first_name,
        last_name,
        email,
        phone,
        address,
        city,
        postal_code,
        tax_code,
        password_hash,
      ],
    )

    const insertResult = result as any
    const newClient = await executeQuery("SELECT * FROM clients WHERE id = ?", [insertResult.insertId])

    return NextResponse.json(newClient[0], { status: 201 })
  } catch (error) {
    console.error("Error creating client:", error)
    return NextResponse.json({ error: "Failed to create client" }, { status: 500 })
  }
}
