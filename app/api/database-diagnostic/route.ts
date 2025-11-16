import { NextResponse } from "next/server"
import mysql from "mysql2/promise"

const requiredTables = {
  customers: {
    columns: ["id", "business_name", "email", "password", "phone", "address", "created_at", "updated_at"],
    foreignKeys: [],
  },
  clients: {
    columns: [
      "id",
      "bodyshop_id",
      "first_name",
      "last_name",
      "email",
      "phone",
      "address",
      "client_code",
      "created_at",
      "updated_at",
    ],
    foreignKeys: ["bodyshop_id -> customers(id)"],
  },
  vehicles: {
    columns: [
      "id",
      "client_id",
      "bodyshop_id",
      "license_plate",
      "brand",
      "model",
      "year",
      "fuel_type",
      "color",
      "mileage",
      "image_filename",
      "created_at",
      "updated_at",
    ],
    foreignKeys: ["client_id -> clients(id)", "bodyshop_id -> customers(id)"],
  },
  warehouse_positions: {
    columns: [
      "id",
      "bodyshop_id",
      "scaffale",
      "area",
      "livello",
      "posizione",
      "position_code",
      "description",
      "is_active",
      "created_at",
      "updated_at",
    ],
    foreignKeys: ["bodyshop_id -> customers(id)"],
  },
  tires: {
    columns: [
      "id",
      "client_id",
      "vehicle_id",
      "warehouse_position_id",
      "brand",
      "model",
      "size",
      "season",
      "dot_code",
      "condition",
      "notes",
      "created_at",
      "updated_at",
    ],
    foreignKeys: [
      "client_id -> clients(id)",
      "vehicle_id -> vehicles(id)",
      "warehouse_position_id -> warehouse_positions(id)",
    ],
  },
}

export async function GET() {
  let connection: mysql.Connection | null = null

  try {
    // Create database connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: Number.parseInt(process.env.DB_PORT || "3306"),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      connectTimeout: 10000,
      acquireTimeout: 10000,
    })

    console.log("[v0] Database connection established for diagnostic")

    // Get all existing tables
    const [existingTablesResult] = await connection.execute("SHOW TABLES")
    const existingTables = (existingTablesResult as any[]).map((row) => Object.values(row)[0] as string)

    console.log("[v0] Existing tables:", existingTables)

    const tableAnalysis = []
    const missingTables = []
    let issuesFound = 0

    // Analyze each required table
    for (const [tableName, tableInfo] of Object.entries(requiredTables)) {
      const exists = existingTables.includes(tableName)

      if (!exists) {
        missingTables.push(tableName)
        tableAnalysis.push({
          name: tableName,
          exists: false,
        })
        issuesFound++
      } else {
        // Get table structure
        try {
          const [columnsResult] = await connection.execute(`DESCRIBE ${tableName}`)
          const existingColumns = (columnsResult as any[]).map((row) => row.Field)
          const missingColumns = tableInfo.columns.filter((col) => !existingColumns.includes(col))

          if (missingColumns.length > 0) {
            issuesFound++
          }

          tableAnalysis.push({
            name: tableName,
            exists: true,
            columns: existingColumns,
            missingColumns,
            foreignKeys: tableInfo.foreignKeys,
          })
        } catch (error) {
          console.error(`[v0] Error analyzing table ${tableName}:`, error)
          issuesFound++
          tableAnalysis.push({
            name: tableName,
            exists: true,
            columns: [],
            missingColumns: tableInfo.columns,
            foreignKeys: tableInfo.foreignKeys,
          })
        }
      }
    }

    const summary = {
      totalTables: Object.keys(requiredTables).length,
      existingTables: Object.keys(requiredTables).length - missingTables.length,
      missingTables: missingTables.length,
      issuesFound,
    }

    return NextResponse.json({
      connected: true,
      tables: tableAnalysis,
      missingTables,
      summary,
    })
  } catch (error) {
    console.error("[v0] Database diagnostic error:", error)
    return NextResponse.json({
      connected: false,
      error: error instanceof Error ? error.message : "Unknown database error",
      tables: [],
      missingTables: Object.keys(requiredTables),
      summary: {
        totalTables: Object.keys(requiredTables).length,
        existingTables: 0,
        missingTables: Object.keys(requiredTables).length,
        issuesFound: 1,
      },
    })
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}
