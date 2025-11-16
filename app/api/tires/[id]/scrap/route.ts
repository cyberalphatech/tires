import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const tireId = params.id
    const body = await request.json()
    const { reason, disposal_method } = body

    if (!reason) {
      return NextResponse.json({ error: "Disposal reason is required" }, { status: 400 })
    }

    // Update tire status to scrapped
    await executeQuery("UPDATE tires SET status = 'scrapped', updated_at = NOW() WHERE id = ?", [tireId])

    // Add to scrapped tires table
    const result = await executeQuery(
      `INSERT INTO scrapped_tires (tire_id, reason, disposal_method, disposal_date) 
       VALUES (?, ?, ?, NOW())`,
      [tireId, reason, disposal_method],
    )

    const insertResult = result as any
    const scrappedRecord = await executeQuery("SELECT * FROM scrapped_tires WHERE id = ?", [insertResult.insertId])

    return NextResponse.json(scrappedRecord[0], { status: 201 })
  } catch (error) {
    console.error("[v0] Error scrapping tire:", error)
    return NextResponse.json({ error: "Failed to scrap tire" }, { status: 500 })
  }
}
