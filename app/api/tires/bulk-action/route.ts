import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Bulk action API called")

    const body = await request.json()
    console.log("[v0] Request body:", JSON.stringify(body, null, 2))

    const { tireIds, action, bodyshopId, warehouseAssignments } = body

    console.log("[v0] Parsed parameters:", { tireIds, action, bodyshopId, warehouseAssignments })

    if (!tireIds || !Array.isArray(tireIds) || tireIds.length === 0) {
      console.log("[v0] Error: No tire IDs provided")
      return NextResponse.json({ error: "No tire IDs provided" }, { status: 400 })
    }

    if (!action) {
      console.log("[v0] Error: No action specified")
      return NextResponse.json({ error: "No action specified" }, { status: 400 })
    }

    if (!bodyshopId) {
      console.log("[v0] Error: No bodyshop ID provided")
      return NextResponse.json({ error: "No bodyshop ID provided" }, { status: 400 })
    }

    console.log("[v0] Bulk action:", action, "for tires:", tireIds, "bodyshop:", bodyshopId)

    if (action === "remove_and_store") {
      console.log("[v0] Processing remove_and_store action")

      let availablePositions
      try {
        console.log("[v0] Querying available warehouse positions...")
        console.log("[v0] Query parameters - bodyshopId:", bodyshopId, "limit:", tireIds.length)
        console.log(
          "[v0] Executing query: SELECT wp.id, wp.position_code, wp.scaffale, wp.area, wp.livello, wp.posizione FROM warehouse_positions wp LEFT JOIN tires t ON t.warehouse_location = wp.id AND t.status = 'stored' WHERE wp.bodyshop_id = ? AND t.id IS NULL ORDER BY wp.scaffale, wp.area, wp.livello, wp.posizione LIMIT ?",
        )

        availablePositions = await executeQuery(
          `SELECT wp.id, wp.position_code, wp.scaffale, wp.area, wp.livello, wp.posizione
           FROM warehouse_positions wp
           LEFT JOIN tires t ON t.warehouse_location = wp.id AND t.status = 'stored'
           WHERE wp.bodyshop_id = ? AND t.id IS NULL
           ORDER BY wp.scaffale, wp.area, wp.livello, wp.posizione
           LIMIT ?`,
          [bodyshopId, tireIds.length],
        )
        console.log("[v0] Available positions found:", availablePositions.length)
        console.log("[v0] Available positions data:", JSON.stringify(availablePositions, null, 2))
      } catch (queryError) {
        console.error("[v0] Error querying warehouse positions:", queryError)
        console.error("[v0] Query error message:", queryError instanceof Error ? queryError.message : "Unknown error")
        console.error("[v0] Query error stack:", queryError instanceof Error ? queryError.stack : "No stack trace")
        console.error("[v0] Query error code:", (queryError as any)?.code)
        console.error("[v0] Query error errno:", (queryError as any)?.errno)
        console.error("[v0] Query error sqlState:", (queryError as any)?.sqlState)
        console.error("[v0] Query error sqlMessage:", (queryError as any)?.sqlMessage)
        return NextResponse.json({ error: "Database error querying warehouse positions" }, { status: 500 })
      }

      if (availablePositions.length < tireIds.length) {
        console.log("[v0] Not enough warehouse positions available")
        return NextResponse.json(
          {
            error: "Not enough available warehouse positions",
            available: availablePositions.length,
            needed: tireIds.length,
          },
          { status: 400 },
        )
      }

      // If warehouse assignments are provided, use them; otherwise use automatic assignments
      const assignments =
        warehouseAssignments ||
        availablePositions.map((pos: any, index: number) => ({
          tireId: tireIds[index],
          warehouseLocationId: pos.id,
          positionCode: pos.position_code,
        }))

      console.log("[v0] Warehouse assignments:", assignments)

      for (const assignment of assignments) {
        try {
          console.log("[v0] Updating tire:", assignment.tireId, "to position:", assignment.positionCode)
          console.log(
            "[v0] Update parameters - tireId:",
            assignment.tireId,
            "warehouseLocationId:",
            assignment.warehouseLocationId,
            "type:",
            typeof assignment.warehouseLocationId,
          )

          if (!assignment.tireId || !assignment.warehouseLocationId) {
            console.error("[v0] Invalid assignment parameters:", assignment)
            return NextResponse.json(
              { error: `Invalid assignment parameters for tire ${assignment.tireId}` },
              { status: 400 },
            )
          }

          const updateResult = await executeQuery(
            `UPDATE tires 
             SET status = 'stored', warehouse_location = ?, storage_date = NOW(), updated_at = NOW() 
             WHERE id = ?`,
            [assignment.warehouseLocationId, assignment.tireId],
          )

          console.log("[v0] Update result for tire", assignment.tireId, ":", updateResult)

          // Log the movement
          const depositResult = await executeQuery(
            `INSERT INTO date_deposits (tire_id, movement_type, movement_date, bodyshop_id, notes) 
             VALUES (?, 'in', NOW(), ?, ?)`,
            [assignment.tireId, bodyshopId, `Pneumatico smontato e depositato in posizione ${assignment.positionCode}`],
          )

          console.log("[v0] Deposit log result for tire", assignment.tireId, ":", depositResult)

          console.log("[v0] Successfully updated tire:", assignment.tireId)
        } catch (updateError) {
          console.error("[v0] Error updating tire:", assignment.tireId, "Error:", updateError)
          console.error("[v0] Error message:", updateError instanceof Error ? updateError.message : "Unknown error")
          console.error("[v0] Error stack:", updateError instanceof Error ? updateError.stack : "No stack trace")
          console.error("[v0] Assignment data:", JSON.stringify(assignment, null, 2))
          return NextResponse.json(
            {
              error: `Failed to update tire ${assignment.tireId}: ${updateError instanceof Error ? updateError.message : "Unknown error"}`,
            },
            { status: 500 },
          )
        }
      }

      console.log("[v0] Successfully completed remove_and_store action")
      return NextResponse.json({
        message: `Successfully removed and stored ${tireIds.length} tires`,
        assignments: assignments,
        updatedCount: tireIds.length,
      })
    }

    let newStatus: string
    let warehouseLocation: string | null = null
    let movementType: "in" | "out"
    let movementNotes: string

    switch (action) {
      case "install":
        newStatus = "in_use"
        warehouseLocation = null // Clear warehouse location when installing
        movementType = "out"
        movementNotes = "Pneumatico installato su veicolo"
        break
      case "remove":
        newStatus = "stored"
        movementType = "in"
        movementNotes = "Pneumatico rimosso e depositato"
        break
      case "dispose":
        newStatus = "scrapped"
        warehouseLocation = null // Clear warehouse location when disposing
        movementType = "out"
        movementNotes = "Pneumatico smaltito"
        break
      case "store":
        newStatus = "stored"
        movementType = "in"
        movementNotes = "Pneumatico depositato"
        break
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    const placeholders = tireIds.map(() => "?").join(",")
    const updateParams = [newStatus, warehouseLocation, ...tireIds]

    await executeQuery(
      `UPDATE tires 
       SET status = ?, warehouse_location = ?, updated_at = NOW() 
       WHERE id IN (${placeholders})`,
      updateParams,
    )

    for (const tireId of tireIds) {
      try {
        await executeQuery(
          `INSERT INTO date_deposits (tire_id, movement_type, movement_date, bodyshop_id, notes) 
           VALUES (?, ?, NOW(), ?, ?)`,
          [tireId, movementType, bodyshopId, movementNotes],
        )
      } catch (depositError) {
        console.error(`[v0] Error logging movement for tire ${tireId}:`, depositError)
      }
    }

    return NextResponse.json({
      message: `Successfully ${action}ed ${tireIds.length} tires`,
      updatedCount: tireIds.length,
    })
  } catch (error) {
    console.error("[v0] Error performing bulk action:", error)
    console.error("[v0] Error stack:", error instanceof Error ? error.stack : "No stack trace")
    return NextResponse.json(
      { error: "Failed to perform bulk action", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
