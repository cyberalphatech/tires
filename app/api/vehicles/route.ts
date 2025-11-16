import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

export async function GET() {
  try {
    try {
      await executeQuery("SELECT 1 FROM vehicles LIMIT 1")
      await executeQuery("SELECT 1 FROM clients LIMIT 1")
    } catch (tableError) {
      console.log("[v0] Tables don't exist yet, returning empty array")
      return NextResponse.json([])
    }

    const vehicles = await executeQuery(`
      SELECT v.*, c.first_name, c.last_name 
      FROM vehicles v 
      LEFT JOIN clients c ON v.client_id = c.id 
      ORDER BY v.created_at DESC
    `)
    return NextResponse.json(vehicles)
  } catch (error) {
    console.error("Error fetching vehicles:", error)
    return NextResponse.json({ error: "Failed to fetch vehicles" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Starting vehicle creation request")

    const formData = await request.formData()
    console.log("[v0] FormData received, parsing fields...")

    const clientId = formData.get("client_id") as string
    const bodyshopId = formData.get("bodyshop_id") as string
    const licensePlate = formData.get("license_plate") as string
    const make = formData.get("make") as string
    const model = formData.get("model") as string
    const year = formData.get("year") as string
    const fuelType = formData.get("fuel_type") as string
    const color = formData.get("color") as string
    const currentKm = formData.get("current_km") as string
    const carImage = formData.get("image_urls") as File | null

    console.log("[v0] Raw form data received:", {
      clientId,
      bodyshopId,
      licensePlate,
      make,
      model,
      year,
      fuelType,
      color,
      currentKm,
      hasImage: !!carImage,
    })

    console.log("[v0] Starting field validation...")

    const parsedYear = year && year.trim() !== "" ? Number.parseInt(year, 10) : null
    const parsedCurrentKm = currentKm && currentKm.trim() !== "" ? Number.parseInt(currentKm, 10) : null

    console.log("[v0] Parsed numeric values:", { parsedYear, parsedCurrentKm })

    // Validate that year is a valid number if provided
    if (year && (isNaN(parsedYear!) || parsedYear! < 1900 || parsedYear! > new Date().getFullYear() + 1)) {
      console.log("[v0] Invalid year value:", year)
      return NextResponse.json({ error: "Invalid year value" }, { status: 400 })
    }

    // Validate that currentKm is a valid number if provided
    if (currentKm && (isNaN(parsedCurrentKm!) || parsedCurrentKm! < 0)) {
      console.log("[v0] Invalid current_km value:", currentKm)
      return NextResponse.json({ error: "Invalid mileage value" }, { status: 400 })
    }

    if (!clientId || !licensePlate || !make || !model || !parsedYear) {
      console.log("[v0] Missing required fields validation failed:", {
        hasClientId: !!clientId,
        hasLicensePlate: !!licensePlate,
        hasMake: !!make,
        hasModel: !!model,
        hasParsedYear: !!parsedYear,
      })
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    console.log("[v0] Field validation passed, checking bodyshop_id...")

    let finalBodyshopId = bodyshopId
    if (!finalBodyshopId) {
      try {
        console.log("[v0] Fetching bodyshop_id for client:", clientId)
        const clientResult = await executeQuery("SELECT bodyshop_id FROM clients WHERE id = ?", [clientId])
        console.log("[v0] Client query result:", clientResult)

        if ((clientResult as any[]).length > 0) {
          finalBodyshopId = (clientResult as any[])[0].bodyshop_id
          console.log("[v0] Found bodyshop_id for client:", finalBodyshopId)
        } else {
          console.log("[v0] Client not found for ID:", clientId)
          return NextResponse.json({ error: "Client not found" }, { status: 400 })
        }
      } catch (clientError) {
        console.error("[v0] Error fetching client bodyshop_id:", clientError)
        return NextResponse.json({ error: "Failed to validate client" }, { status: 500 })
      }
    }

    console.log("[v0] Final bodyshop_id:", finalBodyshopId)

    try {
      console.log("[v0] Checking if vehicles table exists...")
      await executeQuery("SELECT 1 FROM vehicles LIMIT 1")
      console.log("[v0] Vehicles table exists")
    } catch (tableError) {
      console.log("[v0] Vehicles table doesn't exist, creating it...")
      console.error("[v0] Table check error:", tableError)

      try {
        await executeQuery(`
          CREATE TABLE vehicles (
            id INT AUTO_INCREMENT PRIMARY KEY,
            client_id INT NOT NULL,
            bodyshop_id INT NOT NULL,
            license_plate VARCHAR(20) NOT NULL UNIQUE,
            make VARCHAR(100) NOT NULL,
            model VARCHAR(100) NOT NULL,
            year INT NOT NULL,
            fuel_type VARCHAR(50),
            color VARCHAR(50),
            current_km INT,
            image_urls VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_client_id (client_id),
            INDEX idx_bodyshop_id (bodyshop_id),
            INDEX idx_license_plate (license_plate),
            FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
            FOREIGN KEY (bodyshop_id) REFERENCES customers(id) ON DELETE CASCADE
          )
        `)
        console.log("[v0] Vehicles table created successfully")
      } catch (createTableError) {
        console.error("[v0] Error creating vehicles table:", createTableError)
        return NextResponse.json({ error: "Database initialization failed" }, { status: 500 })
      }
    }

    try {
      console.log("[v0] Checking for existing license plate:", licensePlate)
      const existingVehicle = await executeQuery("SELECT id FROM vehicles WHERE license_plate = ?", [licensePlate])
      console.log("[v0] License plate check result:", existingVehicle)

      if ((existingVehicle as any[]).length > 0) {
        console.log("[v0] License plate already exists:", licensePlate)
        return NextResponse.json({ error: "License plate already exists" }, { status: 400 })
      }
    } catch (checkError) {
      console.error("[v0] Error checking existing license plate:", checkError)
      // Continue anyway - let database handle uniqueness constraint
    }

    let imageUrls = null
    if (carImage && carImage.size > 0) {
      try {
        console.log("[v0] Processing vehicle image:", carImage.name, carImage.size)

        const timestamp = Date.now()
        const extension = carImage.name.split(".").pop() || "jpg"
        const filename = `vehicle_${timestamp}.${extension}`

        // Convert file to blob URL for temporary storage
        const bytes = await carImage.arrayBuffer()
        const blob = new Blob([bytes], { type: carImage.type })

        // For now, just store the filename - in production you'd upload to Vercel Blob or similar
        imageUrls = filename

        console.log("[v0] Vehicle image processed successfully:", imageUrls)
        console.log("[v0] Note: Image storage requires Vercel Blob or similar service in production")
      } catch (imageError) {
        console.error("[v0] Error processing image:", imageError)
        // Don't fail the entire request for image issues
        console.log("[v0] Continuing vehicle creation without image")
        imageUrls = null
      }
    }

    try {
      const insertData = [
        clientId,
        finalBodyshopId,
        licensePlate,
        make,
        model,
        parsedYear,
        fuelType || null,
        color || null,
        parsedCurrentKm,
        imageUrls,
      ]

      console.log("[v0] Preparing to insert vehicle with data:", insertData)
      console.log(
        "[v0] Data types:",
        insertData.map((item) => typeof item),
      )

      const result = await executeQuery(
        `INSERT INTO vehicles (client_id, bodyshop_id, license_plate, make, model, year, fuel_type, color, current_km, image_urls) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        insertData,
      )

      console.log("[v0] Database insertion successful, result:", result)

      const insertResult = result as any
      const vehicleId = insertResult.insertId
      console.log("[v0] Vehicle created successfully with ID:", vehicleId)

      return NextResponse.json(
        {
          id: vehicleId,
          client_id: clientId,
          bodyshop_id: finalBodyshopId,
          license_plate: licensePlate,
          make,
          model,
          year: parsedYear,
          fuel_type: fuelType,
          color,
          current_km: parsedCurrentKm,
          image_urls: imageUrls,
          message: "Vehicle created successfully",
        },
        { status: 201 },
      )
    } catch (dbError) {
      console.error("[v0] Database insertion error details:", {
        error: dbError,
        message: (dbError as any).message,
        code: (dbError as any).code,
        errno: (dbError as any).errno,
        sqlState: (dbError as any).sqlState,
        sqlMessage: (dbError as any).sqlMessage,
      })
      return NextResponse.json(
        {
          error: "Failed to create vehicle",
          details: (dbError as any).message || "Database error",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("[v0] Top-level error creating vehicle:", {
      error,
      message: (error as any).message,
      stack: (error as any).stack,
    })
    return NextResponse.json({ error: "Failed to create vehicle" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const vehicleId = url.searchParams.get("id")

    if (!vehicleId) {
      return NextResponse.json({ error: "Vehicle ID is required" }, { status: 400 })
    }

    console.log("[v0] Deleting vehicle with ID:", vehicleId)

    // Check if vehicle exists
    const existingVehicle = await executeQuery("SELECT id FROM vehicles WHERE id = ?", [vehicleId])
    if ((existingVehicle as any[]).length === 0) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 })
    }

    // Delete the vehicle
    await executeQuery("DELETE FROM vehicles WHERE id = ?", [vehicleId])

    console.log("[v0] Vehicle deleted successfully:", vehicleId)
    return NextResponse.json({ message: "Vehicle deleted successfully" })
  } catch (error) {
    console.error("[v0] Error deleting vehicle:", error)
    return NextResponse.json({ error: "Failed to delete vehicle" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const vehicleId = url.searchParams.get("id")

    if (!vehicleId) {
      return NextResponse.json({ error: "Vehicle ID is required" }, { status: 400 })
    }

    console.log("[v0] Updating vehicle with ID:", vehicleId)

    const formData = await request.formData()
    const licensePlate = formData.get("license_plate") as string
    const make = formData.get("make") as string
    const model = formData.get("model") as string
    const year = formData.get("year") as string
    const fuelType = formData.get("fuel_type") as string
    const color = formData.get("color") as string
    const currentKm = formData.get("current_km") as string
    const carImage = formData.get("carPicture") as File | null

    // Validate required fields
    if (!licensePlate || !make || !model || !year) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const parsedYear = Number.parseInt(year, 10)
    const parsedCurrentKm = currentKm && currentKm.trim() !== "" ? Number.parseInt(currentKm, 10) : null

    // Validate year
    if (isNaN(parsedYear) || parsedYear < 1900 || parsedYear > new Date().getFullYear() + 1) {
      return NextResponse.json({ error: "Invalid year value" }, { status: 400 })
    }

    // Validate mileage if provided
    if (currentKm && (isNaN(parsedCurrentKm!) || parsedCurrentKm! < 0)) {
      return NextResponse.json({ error: "Invalid mileage value" }, { status: 400 })
    }

    // Check if vehicle exists
    const existingVehicle = await executeQuery("SELECT id, image_urls FROM vehicles WHERE id = ?", [vehicleId])
    if ((existingVehicle as any[]).length === 0) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 })
    }

    let imageUrls = (existingVehicle as any[])[0].image_urls

    // Handle image upload if provided
    if (carImage && carImage.size > 0) {
      try {
        const timestamp = Date.now()
        const extension = carImage.name.split(".").pop() || "jpg"
        const filename = `vehicle_${timestamp}.${extension}`
        imageUrls = filename
        console.log("[v0] New image processed:", filename)
      } catch (imageError) {
        console.error("[v0] Error processing image:", imageError)
      }
    }

    // Update the vehicle
    await executeQuery(
      `UPDATE vehicles SET 
        license_plate = ?, 
        make = ?, 
        model = ?, 
        year = ?, 
        fuel_type = ?, 
        color = ?, 
        current_km = ?, 
        image_urls = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [licensePlate, make, model, parsedYear, fuelType || null, color || null, parsedCurrentKm, imageUrls, vehicleId],
    )

    console.log("[v0] Vehicle updated successfully:", vehicleId)
    return NextResponse.json({ message: "Vehicle updated successfully" })
  } catch (error) {
    console.error("[v0] Error updating vehicle:", error)
    return NextResponse.json({ error: "Failed to update vehicle" }, { status: 500 })
  }
}
