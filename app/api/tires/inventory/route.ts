import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

export async function GET() {
  try {
    const inventory = await executeQuery(`
      SELECT 
        season,
        status,
        COUNT(*) as count,
        AVG(tread_depth) as avg_tread_depth,
        MIN(tread_depth) as min_tread_depth,
        MAX(tread_depth) as max_tread_depth
      FROM tires 
      GROUP BY season, status
      ORDER BY season, status
    `)

    const summary = await executeQuery(`
      SELECT 
        COUNT(*) as total_tires,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_tires,
        COUNT(CASE WHEN status = 'stored' THEN 1 END) as stored_tires,
        COUNT(CASE WHEN status = 'scrapped' THEN 1 END) as scrapped_tires,
        COUNT(CASE WHEN season = 'winter' THEN 1 END) as winter_tires,
        COUNT(CASE WHEN season = 'summer' THEN 1 END) as summer_tires
      FROM tires
    `)

    return NextResponse.json({
      inventory,
      summary: (summary as any[])[0],
    })
  } catch (error) {
    console.error("[v0] Error fetching tire inventory:", error)
    return NextResponse.json({ error: "Failed to fetch tire inventory" }, { status: 500 })
  }
}
