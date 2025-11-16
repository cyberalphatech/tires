import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email e password sono richiesti" }, { status: 400 })
    }

    const jwtSecret = process.env.JWT_SECRET || "tires-pro-secret-key-2024"

    try {
      const customers = await db.execute(
        "SELECT id, email, password_hash, business_name, contact_person FROM customers WHERE email = ? AND password_hash IS NOT NULL",
        [email],
      )

      const customerArray = customers as any[]
      if (customerArray.length > 0) {
        const customer = customerArray[0]

        const isValidPassword = await bcrypt.compare(password, customer.password_hash)
        if (!isValidPassword) {
          return NextResponse.json({ error: "Credenziali non valide" }, { status: 401 })
        }

        const token = jwt.sign(
          {
            userId: customer.id,
            email: customer.email,
            role: "bodyshop",
            userType: "customer",
          },
          jwtSecret,
          { expiresIn: "24h" },
        )

        const response = NextResponse.json({
          success: true,
          user: {
            id: customer.id,
            email: customer.email,
            name: customer.business_name || customer.contact_person,
            role: "bodyshop",
            userType: "customer",
          },
        })

        response.cookies.set("auth-token", token, {
          httpOnly: true,
          secure: false, // Disabled secure for development
          sameSite: "lax",
          maxAge: 86400,
          path: "/",
        })

        return response
      }
    } catch (customerError) {
      console.log("Customer table query failed, trying users table")
    }

    const users = await db.execute(
      "SELECT id, email, password_hash, first_name, last_name, role FROM users WHERE email = ?",
      [email],
    )

    const userArray = users as any[]
    if (userArray.length === 0) {
      return NextResponse.json({ error: "Credenziali non valide" }, { status: 401 })
    }

    const user = userArray[0]

    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    if (!isValidPassword) {
      return NextResponse.json({ error: "Credenziali non valide" }, { status: 401 })
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        userType: "user",
      },
      jwtSecret,
      { expiresIn: "24h" },
    )

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: `${user.first_name} ${user.last_name}`,
        role: user.role,
        userType: "user",
      },
    })

    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: false, // Disabled secure for development
      sameSite: "lax",
      maxAge: 86400,
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Errore interno del server" }, { status: 500 })
  }
}
