import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { verifyToken } from "@/lib/jwt"

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

    const { seedId, userId, planted } = await request.json()

    if (!seedId || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const db = await connectDB()

    // Verify user exists
    const userExists = await db.collection("users").findOne({ id: userId })
    if (!userExists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Verify seed exists
    const seed = await db.collection("seeds").findOne({ id: seedId })
    if (!seed) {
      return NextResponse.json({ error: "Seed not found" }, { status: 404 })
    }

    const plantCount = userExists.plants?.length || 0
    const plantId = `plant_${plantCount + 1}_${userId}`

    const newPlant = {
      id: plantId,
      name: seed.name,
      userId,
      planted: planted ? new Date(planted) : new Date(),
      lastProofPicture: null,
      pictures: [],
    }

    const plantResult = await db.collection("plants").insertOne(newPlant)
    await db.collection("users").updateOne({ id: userId }, { $push: { plants: plantId } })

    // Increment plant_given count for the seed
    await db.collection("seeds").updateOne({ id: seedId }, { $inc: { plant_given: 1 } })

    return NextResponse.json({ _id: plantResult.insertedId, ...newPlant }, { status: 201 })
  } catch (error) {
    console.error("[v0] Plant creation error:", error)
    return NextResponse.json({ error: "Failed to create plant" }, { status: 500 })
  }
}
