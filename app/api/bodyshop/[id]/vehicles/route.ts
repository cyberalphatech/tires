import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const bodyshopId = params.id

    try {
      const tableCheck = await executeQuery(`
        SELECT COUNT(*) as count 
        FROM information_schema.tables 
        WHERE table_schema = DATABASE() 
        AND table_name IN ('vehicles', 'clients')
      `)

      if ((tableCheck as any)[0].count < 2) {
        console.log("[v0] Required tables don't exist yet, returning empty array")
        return NextResponse.json([])
      }
    } catch (tableError) {
      console.log("[v0] Error checking tables, returning empty array:", tableError)
      return NextResponse.json([])
    }

    const query = `
      SELECT 
        v.id,
        v.license_plate,
        v.brand,
        v.model,
        v.year,
        CONCAT(c.first_name, ' ', c.last_name) as client_name,
        v.created_at
      FROM vehicles v
      LEFT JOIN clients c ON v.client_id = c.id
      WHERE c.bodyshop_id = ?
      ORDER BY v.created_at DESC
    `

    const vehicles = await executeQuery(query, [bodyshopId])
    return NextResponse.json(vehicles || [])
  } catch (error) {
    console.error("[v0] Error fetching vehicles:", error)
    return NextResponse.json([])
  }
}
