import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { verifyToken } from "@/lib/jwt"

export async function GET(request:NextRequest) {
  try {
    const token = request.cookies.get("admin_token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const payload = await verifyToken(token)
    if (!payload || payload.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const db = await connectDB()
    const seeds = await db.collection("seeds").find({}).toArray()
    return NextResponse.json(seeds)
  } catch (error) {
    console.error("[v0] Failed to fetch seeds:", error)
    return NextResponse.json({ error: "Failed to fetch seeds" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("admin_token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const payload = await verifyToken(token)
    if (!payload || payload.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name } = await request.json()

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    const db = await connectDB()

    // Check if seed already exists
    const existingSeed = await db.collection("seeds").findOne({ name })
    if (existingSeed) {
      return NextResponse.json({ error: "Seed type already exists" }, { status: 409 })
    }

    // Generate seed ID
    const seedCount = await db.collection("seeds").countDocuments()
    const seedId = `seed_${seedCount + 1}`

    const newSeed = {
      id: seedId,
      name,
      plant_given: 0,
    }

    const result = await db.collection("seeds").insertOne(newSeed)

    return NextResponse.json({ _id: result.insertedId, ...newSeed }, { status: 201 })
  } catch (error) {
    console.error("[v0] Seed creation error:", error)
    return NextResponse.json({ error: "Failed to create seed" }, { status: 500 })
  }
}
