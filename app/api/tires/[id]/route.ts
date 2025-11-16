import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const tireId = params.id
    console.log("[v0] Fetching tire with ID:", tireId)

    const tire = await executeQuery(
      `
      SELECT t.*, v.license_plate, v.make, v.model, c.first_name, c.last_name 
      FROM tires t 
      LEFT JOIN vehicles v ON t.vehicle_id = v.id 
      LEFT JOIN clients c ON t.client_id = c.id 
      WHERE t.id = ?
    `,
      [tireId],
    )

    console.log("[v0] Query result:", tire)

    if (!tire || (tire as any[]).length === 0) {
      console.log("[v0] Tire not found")
      return NextResponse.json({ error: "Tire not found" }, { status: 404 })
    }

    console.log("[v0] Returning tire data:", (tire as any[])[0])
    return NextResponse.json((tire as any[])[0])
  } catch (error) {
    console.error("[v0] Error fetching tire:", error)
    return NextResponse.json({ error: "Failed to fetch tire" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const tireId = params.id
    const body = await request.json()
    const {
      tire_code,
      brand,
      size,
      position,
      season,
      dot_code,
      year,
      tread_depth,
      condition,
      purchase_price,
      warehouse_location,
      status,
      notes,
    } = body

    const finalWarehouseLocation = status === "in_use" ? null : warehouse_location

    console.log("[v0] Updating tire with status:", status)
    console.log("[v0] Original warehouse_location:", warehouse_location)
    console.log("[v0] Final warehouse_location:", finalWarehouseLocation)

    await executeQuery(
      `UPDATE tires 
       SET tire_code = ?, brand = ?, size = ?, position = ?, season = ?, 
           dot_code = ?, year = ?, tread_depth = ?, condition = ?, purchase_price = ?, 
           warehouse_location = ?, status = ?, notes = ?, updated_at = NOW()
       WHERE id = ?`,
      [
        tire_code,
        brand,
        size,
        position,
        season,
        dot_code,
        year,
        tread_depth,
        condition,
        purchase_price,
        finalWarehouseLocation, // Use finalWarehouseLocation instead of warehouse_location
        status,
        notes,
        tireId,
      ],
    )

    if (status === "in_use") {
      try {
        await executeQuery(
          `INSERT INTO date_deposits (tire_id, movement_type, movement_date, bodyshop_id, notes) 
           VALUES (?, 'out', NOW(), (SELECT bodyshop_id FROM tires WHERE id = ?), ?)`,
          [tireId, tireId, "Pneumatico installato su veicolo"],
        )
      } catch (depositError) {
        console.error("[v0] Error logging tire installation movement:", depositError)
      }
    } else if (status === "stored" && finalWarehouseLocation) {
      try {
        await executeQuery(
          `INSERT INTO date_deposits (tire_id, movement_type, movement_date, bodyshop_id, notes) 
           VALUES (?, 'in', NOW(), (SELECT bodyshop_id FROM tires WHERE id = ?), ?)`,
          [tireId, tireId, `Pneumatico depositato in posizione ${finalWarehouseLocation}`],
        )
      } catch (depositError) {
        console.error("[v0] Error logging tire storage movement:", depositError)
      }
    }

    const updatedTire = await executeQuery("SELECT * FROM tires WHERE id = ?", [tireId])

    return NextResponse.json((updatedTire as any[])[0])
  } catch (error) {
    console.error("[v0] Error updating tire:", error)
    return NextResponse.json({ error: "Failed to update tire" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const tireId = params.id

    await executeQuery("DELETE FROM tires WHERE id = ?", [tireId])

    return NextResponse.json({ message: "Tire deleted successfully" })
  } catch (error) {
    console.error("[v0] Error deleting tire:", error)
    return NextResponse.json({ error: "Failed to delete tire" }, { status: 500 })
  }
}
