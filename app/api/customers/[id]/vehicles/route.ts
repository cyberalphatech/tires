import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const customerId = params.id

    const vehicles = await executeQuery("SELECT * FROM vehicles WHERE customer_id = ? ORDER BY created_at DESC", [
      customerId,
    ])

    return NextResponse.json(vehicles)
  } catch (error) {
    console.error("[v0] Error fetching customer vehicles:", error)
    return NextResponse.json({ error: "Failed to fetch customer vehicles" }, { status: 500 })
  }
}
