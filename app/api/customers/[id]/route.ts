import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const customerId = params.id
    const customer = await executeQuery("SELECT * FROM customers WHERE id = ?", [customerId])

    if (!customer || (customer as any[]).length === 0) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    return NextResponse.json((customer as any[])[0])
  } catch (error) {
    console.error("[v0] Error fetching customer:", error)
    return NextResponse.json({ error: "Failed to fetch customer" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const customerId = params.id
    const body = await request.json()
    const { first_name, last_name, email, phone, address, city, postal_code } = body

    await executeQuery(
      `UPDATE customers 
       SET first_name = ?, last_name = ?, email = ?, phone = ?, 
           address = ?, city = ?, postal_code = ?, updated_at = NOW()
       WHERE id = ?`,
      [first_name, last_name, email, phone, address, city, postal_code, customerId],
    )

    const updatedCustomer = await executeQuery("SELECT * FROM customers WHERE id = ?", [customerId])

    return NextResponse.json((updatedCustomer as any[])[0])
  } catch (error) {
    console.error("[v0] Error updating customer:", error)
    return NextResponse.json({ error: "Failed to update customer" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const customerId = params.id

    const vehicles = await executeQuery("SELECT COUNT(*) as count FROM vehicles WHERE customer_id = ?", [customerId])

    if ((vehicles as any[])[0].count > 0) {
      return NextResponse.json({ error: "Cannot delete customer with existing vehicles" }, { status: 400 })
    }

    await executeQuery("DELETE FROM customers WHERE id = ?", [customerId])

    return NextResponse.json({ message: "Customer deleted successfully" })
  } catch (error) {
    console.error("[v0] Error deleting customer:", error)
    return NextResponse.json({ error: "Failed to delete customer" }, { status: 500 })
  }
}
