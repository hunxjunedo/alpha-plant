import { MongoClient, type Db } from "mongodb"

let db: Db

export async function connectDB(): Promise<Db> {
  if (db) return db

  const mongoUri = process.env.MONGODB_URI
  if (!mongoUri) {
    throw new Error("MONGODB_URI is not defined in environment variables")
  }

  const client = new MongoClient(mongoUri)
  await client.connect()
  db = client.db(process.env.MONGODB_DB || "admin_panel")

  return db
}

export async function getDB(): Promise<Db> {
  if (!db) {
    return connectDB()
  }
  return db
}
