import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email e password sono richiesti" }, { status: 400 })
    }

    console.log("[v0] Customer login attempt for email:", email)

    // Check if customer exists
    const customers = await db.execute(
      "SELECT id, customer_code, first_name, last_name, email, password_hash, phone, address, city FROM customers WHERE email = ? AND password_hash IS NOT NULL",
      [email],
    )

    const customerArray = customers as any[]
    if (customerArray.length === 0) {
      console.log("[v0] Customer not found:", email)
      return NextResponse.json({ error: "Credenziali non valide" }, { status: 401 })
    }

    const customer = customerArray[0]
    console.log("[v0] Customer found, verifying password")

    // Verify password
    const isValidPassword = await bcrypt.compare(password, customer.password_hash)
    if (!isValidPassword) {
      console.log("[v0] Invalid password for customer:", email)
      return NextResponse.json({ error: "Credenziali non valide" }, { status: 401 })
    }

    console.log("[v0] Customer password verified")

    // Update last login
    await db.execute("UPDATE customers SET last_login = NOW() WHERE id = ?", [customer.id])

    // Return customer data
    const response = NextResponse.json({
      success: true,
      customer: {
        id: customer.id,
        customerCode: customer.customer_code,
        firstName: customer.first_name,
        lastName: customer.last_name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        city: customer.city,
      },
    })

    console.log("[v0] Customer login successful:", email)
    return response
  } catch (error) {
    console.error("[v0] Customer login error:", error)
    return NextResponse.json({ error: "Errore interno del server" }, { status: 500 })
  }
}
