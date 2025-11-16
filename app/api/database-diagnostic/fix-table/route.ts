import { type NextRequest, NextResponse } from "next/server"
import mysql from "mysql2/promise"

const tableSchemas = {
  customers: `
    CREATE TABLE customers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      business_name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      phone VARCHAR(20),
      address TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_email (email)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `,

  clients: `
    CREATE TABLE clients (
      id INT AUTO_INCREMENT PRIMARY KEY,
      bodyshop_id INT NOT NULL,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      email VARCHAR(255),
      phone VARCHAR(20),
      address TEXT,
      client_code VARCHAR(50) UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (bodyshop_id) REFERENCES customers(id) ON DELETE CASCADE,
      INDEX idx_bodyshop_id (bodyshop_id),
      INDEX idx_client_code (client_code)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `,

  vehicles: `
    CREATE TABLE vehicles (
      id INT AUTO_INCREMENT PRIMARY KEY,
      client_id INT NOT NULL,
      bodyshop_id INT NOT NULL,
      license_plate VARCHAR(20) NOT NULL,
      brand VARCHAR(100),
      model VARCHAR(100),
      year INT,
      fuel_type ENUM('Benzina', 'Diesel', 'GPL', 'Metano', 'Elettrica', 'Ibrida') DEFAULT 'Benzina',
      color VARCHAR(50),
      mileage INT DEFAULT 0,
      image_filename VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
      FOREIGN KEY (bodyshop_id) REFERENCES customers(id) ON DELETE CASCADE,
      INDEX idx_client_id (client_id),
      INDEX idx_bodyshop_id (bodyshop_id),
      INDEX idx_license_plate (license_plate)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `,

  warehouse_positions: `
    CREATE TABLE warehouse_positions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      bodyshop_id INT NOT NULL,
      scaffale VARCHAR(10) NOT NULL,
      area VARCHAR(10) NOT NULL,
      livello VARCHAR(10) NOT NULL,
      posizione VARCHAR(10) NOT NULL,
      position_code VARCHAR(50) NOT NULL,
      description TEXT,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (bodyshop_id) REFERENCES customers(id) ON DELETE CASCADE,
      UNIQUE KEY unique_position (bodyshop_id, scaffale, area, livello, posizione),
      INDEX idx_bodyshop_id (bodyshop_id),
      INDEX idx_position_code (position_code)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `,

  tires: `
    CREATE TABLE tires (
      id INT AUTO_INCREMENT PRIMARY KEY,
      client_id INT NOT NULL,
      vehicle_id INT,
      warehouse_position_id INT,
      brand VARCHAR(100),
      model VARCHAR(100),
      size VARCHAR(50),
      season ENUM('Estive', 'Invernali', 'Quattro Stagioni') DEFAULT 'Estive',
      dot_code VARCHAR(20),
      condition ENUM('Nuovo', 'Buono', 'Discreto', 'Usurato') DEFAULT 'Buono',
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
      FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL,
      FOREIGN KEY (warehouse_position_id) REFERENCES warehouse_positions(id) ON DELETE SET NULL,
      INDEX idx_client_id (client_id),
      INDEX idx_vehicle_id (vehicle_id),
      INDEX idx_warehouse_position_id (warehouse_position_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `,
}

export async function POST(request: NextRequest) {
  let connection: mysql.Connection | null = null

  try {
    const { tableName } = await request.json()

    if (!tableName || !tableSchemas[tableName as keyof typeof tableSchemas]) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid table name",
        },
        { status: 400 },
      )
    }

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

    console.log(`[v0] Creating table: ${tableName}`)

    // Drop table if exists and create new one
    await connection.execute(`DROP TABLE IF EXISTS ${tableName}`)
    await connection.execute(tableSchemas[tableName as keyof typeof tableSchemas])

    console.log(`[v0] Successfully created table: ${tableName}`)

    return NextResponse.json({
      success: true,
      message: `Table ${tableName} created successfully`,
    })
  } catch (error) {
    console.error(`[v0] Error creating table:`, error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}
