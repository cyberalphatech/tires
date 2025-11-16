import mysql from "mysql2/promise"

const dbConfig = {
  host: process.env.DB_HOST || "143.95.235.24",
  port: Number.parseInt(process.env.DB_PORT || "3306"),
  user: process.env.DB_USER || "shopreal_gomme",
  password: process.env.DB_PASSWORD || "!bSpRG4ejuC@",
  database: process.env.DB_NAME || "shopreal_gomme",
  connectTimeout: 60000,
  acquireTimeout: 60000,
  timeout: 60000,
  ssl: false,
}

export async function getConnection() {
  try {
    const connection = await mysql.createConnection(dbConfig)
    return connection
  } catch (error) {
    console.error("[v0] Database connection error:", error)
    throw new Error("Failed to connect to database")
  }
}

export async function executeQuery(query: string, params: any[] = []) {
  let connection
  try {
    connection = await getConnection()
    const [results] = await connection.execute(query, params)
    return results
  } catch (error) {
    console.error("[v0] Database query error:", error)
    throw error
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

export const db = {
  execute: executeQuery,
  getConnection,
}

export default db
