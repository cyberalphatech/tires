import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, email, password, phone, address, city, postalCode, taxCode } = await request.json()

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json({ error: "Nome, cognome, email e password sono richiesti" }, { status: 400 })
    }

    console.log("[v0] Customer registration attempt for email:", email)

    // Check if customer already exists
    const existingCustomers = await db.execute("SELECT id FROM customers WHERE email = ?", [email])

    const existingArray = existingCustomers as any[]
    if (existingArray.length > 0) {
      return NextResponse.json({ error: "Un account con questa email esiste già" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Generate customer code
    const customerCode = `CUST${Date.now().toString().slice(-6)}`

    // Insert new customer
    const result = await db.execute(
      `INSERT INTO customers (customer_code, first_name, last_name, email, password_hash, phone, address, city, postal_code, tax_code) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        customerCode,
        firstName,
        lastName,
        email,
        hashedPassword,
        phone || null,
        address || null,
        city || null,
        postalCode || null,
        taxCode || null,
      ],
    )

    console.log("[v0] Customer registered successfully:", email)

    return NextResponse.json({
      success: true,
      message: "Registrazione completata con successo",
    })
  } catch (error) {
    console.error("[v0] Customer registration error:", error)
    return NextResponse.json({ error: "Errore interno del server" }, { status: 500 })
  }
}
