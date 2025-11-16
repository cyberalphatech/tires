import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const season = searchParams.get("season")
    const status = searchParams.get("status")
    const clientId = searchParams.get("client_id")
    const bodyshopId = searchParams.get("bodyshop_id")

    let query = `
      SELECT t.*, 
             v.license_plate, v.make, v.model, v.year,
             c.first_name, c.last_name 
      FROM tires t 
      LEFT JOIN vehicles v ON t.vehicle_id = v.id 
      LEFT JOIN clients c ON t.client_id = c.id 
      WHERE 1=1
    `
    const params: any[] = []

    if (season) {
      query += " AND t.season = ?"
      params.push(season)
    }

    if (status) {
      query += " AND t.status = ?"
      params.push(status)
    }

    if (clientId) {
      query += " AND t.client_id = ?"
      params.push(clientId)
    }

    if (bodyshopId) {
      query += " AND t.bodyshop_id = ?"
      params.push(bodyshopId)
    }

    query += " ORDER BY t.created_at DESC"

    const tires = await executeQuery(query, params)
    return NextResponse.json(tires)
  } catch (error) {
    console.error("[v0] Error fetching tires:", error)
    return NextResponse.json({ error: "Failed to fetch tires" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("[v0] Received tire data:", body)

    const {
      vehicle_id,
      client_id,
      bodyshop_id,
      tire_code,
      brand,
      size,
      position,
      season,
      dot_code,
      tread_depth,
      condition,
      purchase_price,
      warehouse_location,
      status,
      notes,
      storage_date,
      installation_date,
      removal_date,
      deposit_type,
      model,
    } = body

    console.log("[v0] Deposit type received:", deposit_type)
    console.log("[v0] Status received:", status)
    console.log("[v0] Deposit type after processing:", deposit_type || "storage")
    console.log("[v0] Status after processing:", status || "active")

    if (!client_id || !bodyshop_id || !tire_code || !brand || !size || !position || !season) {
      console.log("[v0] Missing required fields:", {
        client_id,
        bodyshop_id,
        tire_code,
        brand,
        size,
        position,
        season,
      })
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    try {
      const tableStructure = await executeQuery("DESCRIBE tires")
      console.log("[v0] Tires table structure:", tableStructure)

      // Check if deposit_type and status columns exist
      const columns = tableStructure.map((col: any) => col.Field)
      console.log("[v0] Available columns:", columns)
      console.log("[v0] Has deposit_type column:", columns.includes("deposit_type"))
      console.log("[v0] Has status column:", columns.includes("status"))
    } catch (tableError) {
      console.error("[v0] Error checking table structure:", tableError)
      return NextResponse.json({ error: "Tires table not found. Please create the table first." }, { status: 500 })
    }

    const safeParams = [
      vehicle_id || null,
      client_id,
      bodyshop_id,
      tire_code,
      brand,
      model || null,
      size,
      position,
      season,
      dot_code || null,
      tread_depth || null,
      condition,
      purchase_price || null,
      warehouse_location || null,
      deposit_type || "storage",
      storage_date || null,
      installation_date || null,
      removal_date || null,
      status || "active",
      notes || null,
    ]

    console.log("[v0] Safe parameters for insertion:", safeParams)
    console.log("[v0] Deposit type in safeParams (index 14):", safeParams[14])
    console.log("[v0] Status in safeParams (index 18):", safeParams[18])

    const result = await executeQuery(
      `INSERT INTO tires (vehicle_id, client_id, bodyshop_id, tire_code, brand, model, size, position, season, 
                         dot_code, tread_depth, \`condition\`, purchase_price, warehouse_location, deposit_type,
                         storage_date, installation_date, removal_date, status, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      safeParams,
    )

    console.log("[v0] Insert result:", result)
    const insertResult = result as any
    const tireId = insertResult.insertId

    const insertedTire = await executeQuery("SELECT deposit_type, status FROM tires WHERE id = ?", [tireId])
    console.log("[v0] Inserted tire deposit_type and status:", insertedTire[0])

    if (storage_date) {
      try {
        console.log("[v0] Creating date_deposits entry for tire:", tireId)
        await executeQuery(
          `INSERT INTO date_deposits (tire_id, movement_type, movement_date, bodyshop_id, notes) 
           VALUES (?, 'in', ?, ?, ?)`,
          [tireId, storage_date, bodyshop_id, `Pneumatico depositato - ${deposit_type || "storage"}`],
        )
        console.log("[v0] Date deposits entry created successfully")
      } catch (depositError) {
        console.error("[v0] Error creating date_deposits entry:", depositError)
      }
    }

    const newTire = await executeQuery("SELECT * FROM tires WHERE id = ?", [tireId])

    return NextResponse.json(newTire[0], { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating tire:", error)
    if (error instanceof Error) {
      console.error("[v0] Error message:", error.message)
      console.error("[v0] Error stack:", error.stack)
    }
    return NextResponse.json(
      {
        error: "Failed to create tire",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
