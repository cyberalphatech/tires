import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { businessName, email, password, phone, address } = await request.json()

    if (!businessName || !email || !password) {
      return NextResponse.json({ error: "Nome officina, email e password sono richiesti" }, { status: 400 })
    }

    const existingBodyshops = await db.execute("SELECT id FROM customers WHERE email = ?", [email])

    const bodyshopArray = existingBodyshops as any[]
    if (bodyshopArray.length > 0) {
      return NextResponse.json({ error: "Un'officina con questa email esiste già" }, { status: 409 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    const customerCode = `BS${Date.now().toString().slice(-6)}`

    const result = await db.execute(
      `INSERT INTO customers (customer_code, business_name, contact_person, email, password_hash, phone, address, is_active, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 1, NOW())`,
      [customerCode, businessName, businessName, email, hashedPassword, phone || null, address || null],
    )

    const insertResult = result as any
    const bodyshopId = insertResult.insertId

    return NextResponse.json({
      success: true,
      message: "Officina registrata con successo",
      bodyshopId,
      customerCode,
    })
  } catch (error) {
    console.error("Bodyshop registration error:", error)
    return NextResponse.json({ error: "Errore interno del server" }, { status: 500 })
  }
}
