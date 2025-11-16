import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const bodyshopId = formData.get("bodyshop_id") as string

    if (!file || !bodyshopId) {
      return NextResponse.json({ error: "File e bodyshop_id sono richiesti" }, { status: 400 })
    }

    // Read file content
    const text = await file.text()
    const lines = text.split("\n").filter((line) => line.trim())

    if (lines.length < 2) {
      return NextResponse.json(
        { error: "Il file deve contenere almeno una riga di dati oltre all'header" },
        { status: 400 },
      )
    }

    // Skip header row
    const dataLines = lines.slice(1)
    let successCount = 0
    const errors: string[] = []

    for (let i = 0; i < dataLines.length; i++) {
      const line = dataLines[i].trim()
      if (!line) continue

      try {
        // Parse CSV line (simple split by comma)
        const columns = line.split(",").map((col) => col.trim().replace(/"/g, ""))

        if (columns.length < 4) {
          errors.push(`Riga ${i + 2}: Numero insufficiente di colonne`)
          continue
        }

        const [scaffale, area, livello, posizione, description = ""] = columns

        if (!scaffale || !area || !livello || !posizione) {
          errors.push(`Riga ${i + 2}: Campi obbligatori mancanti`)
          continue
        }

        // Generate position code
        const positionCode = `${scaffale.padStart(2, "0")}-${area.padStart(2, "0")}-${livello.padStart(2, "0")}-${posizione.padStart(2, "0")}`

        // Check if position already exists
        const existingPosition = await executeQuery(
          "SELECT id FROM warehouse_positions WHERE bodyshop_id = ? AND position_code = ?",
          [bodyshopId, positionCode],
        )

        if (Array.isArray(existingPosition) && existingPosition.length > 0) {
          errors.push(`Riga ${i + 2}: Posizione ${positionCode} già esistente`)
          continue
        }

        // Insert position
        await executeQuery(
          `INSERT INTO warehouse_positions 
           (bodyshop_id, scaffale, area, livello, posizione, position_code, description, is_active) 
           VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
          [bodyshopId, scaffale, area, livello, posizione, positionCode, description],
        )

        successCount++
      } catch (error) {
        console.error(`Error processing line ${i + 2}:`, error)
        errors.push(`Riga ${i + 2}: Errore durante l'elaborazione`)
      }
    }

    return NextResponse.json({
      success: successCount,
      errors: errors,
    })
  } catch (error) {
    console.error("Error importing positions:", error)
    return NextResponse.json({ error: "Errore interno del server" }, { status: 500 })
  }
}
