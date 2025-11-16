import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const vehicleId = params.id
    const vehicle = await executeQuery(
      `
      SELECT v.*, c.first_name, c.last_name, c.email, c.phone 
      FROM vehicles v 
      LEFT JOIN clients c ON v.client_id = c.id 
      WHERE v.id = ?
    `,
      [vehicleId],
    )

    if (!vehicle || (vehicle as any[]).length === 0) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 })
    }

    return NextResponse.json((vehicle as any[])[0])
  } catch (error) {
    console.error("[v0] Error fetching vehicle:", error)
    return NextResponse.json({ error: "Failed to fetch vehicle" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  console.log("[v0] =================================")
  console.log("[v0] PUT METHOD CALLED - Vehicle ID:", params.id)
  console.log("[v0] Request URL:", request.url)
  console.log("[v0] Request method:", request.method)
  console.log("[v0] =================================")

  try {
    const vehicleId = params.id
    console.log("[v0] PUT request for vehicle ID:", vehicleId)

    const formData = await request.formData()
    console.log("[v0] FormData entries:")
    for (const [key, value] of formData.entries()) {
      console.log(`[v0] ${key}:`, typeof value === "object" ? `File(${(value as File).name})` : value)
    }

    const licensePlate = formData.get("license_plate") as string
    const make = formData.get("make") as string
    const model = formData.get("model") as string
    const year = formData.get("year") as string
    const fuelType = formData.get("fuel_type") as string
    const color = formData.get("color") as string
    const currentKm = formData.get("current_km") as string
    const carImage = formData.get("carPicture") as File | null

    console.log("[v0] Parsed fields:", {
      licensePlate,
      make,
      model,
      year,
      fuelType,
      color,
      currentKm,
      hasImage: carImage && carImage.size > 0,
    })

    if (!licensePlate || !make || !model || !year) {
      console.log("[v0] Missing required fields:", {
        licensePlate: !!licensePlate,
        make: !!make,
        model: !!model,
        year: !!year,
      })
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const parsedYear = Number.parseInt(year, 10)
    const parsedCurrentKm = currentKm && currentKm.trim() !== "" ? Number.parseInt(currentKm, 10) : null

    console.log("[v0] Parsed numeric values:", { parsedYear, parsedCurrentKm })

    if (isNaN(parsedYear) || parsedYear < 1900 || parsedYear > new Date().getFullYear() + 1) {
      console.log("[v0] Invalid year:", parsedYear)
      return NextResponse.json({ error: "Invalid year value" }, { status: 400 })
    }

    console.log("[v0] Fetching existing vehicle data...")
    const existingVehicle = await executeQuery("SELECT image_urls FROM vehicles WHERE id = ?", [vehicleId])
    console.log("[v0] Existing vehicle query result:", existingVehicle)

    if ((existingVehicle as any[]).length === 0) {
      console.log("[v0] Vehicle not found for ID:", vehicleId)
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 })
    }

    let imageUrls = (existingVehicle as any[])[0].image_urls
    console.log("[v0] Current image URLs:", imageUrls)

    if (carImage && carImage.size > 0) {
      try {
        console.log("[v0] Processing new image:", carImage.name, carImage.size)
        const timestamp = Date.now()
        const extension = carImage.name.split(".").pop() || "jpg"
        const filename = `vehicle_${timestamp}.${extension}`
        imageUrls = filename
        console.log("[v0] New image processed:", filename)
      } catch (imageError) {
        console.error("[v0] Error processing image:", imageError)
      }
    }

    const updateParams = [
      licensePlate,
      make,
      model,
      parsedYear,
      fuelType || null,
      color || null,
      parsedCurrentKm,
      imageUrls,
      vehicleId,
    ]
    console.log("[v0] UPDATE query parameters:", updateParams)

    console.log("[v0] Executing UPDATE query...")
    await executeQuery(
      `UPDATE vehicles 
       SET license_plate = ?, make = ?, model = ?, year = ?, 
           fuel_type = ?, color = ?, current_km = ?, image_urls = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      updateParams,
    )

    console.log("[v0] UPDATE query completed successfully")

    console.log("[v0] Fetching updated vehicle data...")
    const updatedVehicle = await executeQuery("SELECT * FROM vehicles WHERE id = ?", [vehicleId])
    console.log("[v0] Updated vehicle data:", updatedVehicle)

    return NextResponse.json((updatedVehicle as any[])[0])
  } catch (error) {
    console.error("[v0] Error updating vehicle:", error)
    console.error("[v0] Error stack:", error instanceof Error ? error.stack : "No stack trace")
    return NextResponse.json({ error: "Failed to update vehicle" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const vehicleId = params.id

    const tires = await executeQuery("SELECT COUNT(*) as count FROM tires WHERE vehicle_id = ?", [vehicleId])
    if ((tires as any[])[0].count > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete vehicle with existing tires. Please remove or reassign tires first.",
        },
        { status: 400 },
      )
    }

    const existingVehicle = await executeQuery("SELECT id FROM vehicles WHERE id = ?", [vehicleId])
    if ((existingVehicle as any[]).length === 0) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 })
    }

    await executeQuery("DELETE FROM vehicles WHERE id = ?", [vehicleId])

    console.log("[v0] Vehicle deleted successfully:", vehicleId)
    return NextResponse.json({ message: "Vehicle deleted successfully" })
  } catch (error) {
    console.error("[v0] Error deleting vehicle:", error)
    return NextResponse.json({ error: "Failed to delete vehicle" }, { status: 500 })
  }
}
