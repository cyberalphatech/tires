import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

export async function GET() {
  try {
    const scrappedTires = await executeQuery(`
      SELECT st.*, t.tire_code, t.brand, t.size, t.position, t.season,
             v.license_plate, v.make, v.model, 
             cl.first_name, cl.last_name,
             c.business_name, c.contact_person
      FROM scrapped_tires st
      LEFT JOIN tires t ON st.tire_id = t.id
      LEFT JOIN vehicles v ON st.vehicle_id = v.id
      LEFT JOIN clients cl ON st.client_id = cl.id
      LEFT JOIN customers c ON st.bodyshop_id = c.id
      ORDER BY st.scrap_date DESC
    `)

    return NextResponse.json(scrappedTires)
  } catch (error) {
    console.error("[v0] Error fetching scrapped tires:", error)
    return NextResponse.json({ error: "Failed to fetch scrapped tires" }, { status: 500 })
  }
}
