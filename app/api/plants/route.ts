import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { verifyToken } from "@/lib/jwt"

export async function POST(request: NextRequest) {
  try {

    const { name, userId, planted } = await request.json()

    if (!name || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const db = await connectDB()

    const userExists = await db.collection("users").findOne({ id: userId })
    if (!userExists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const plantId = `plant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const newPlant = {
      id: plantId,
      name,
      userId,
      planted: planted ? new Date(planted) : new Date(),
      lastProofPicture: null,
      pictures: [],
    }

    const plantResult = await db.collection("plants").insertOne(newPlant)

    await db.collection("users").updateOne({ id: userId }, { $push: { plants: plantId } })

    return NextResponse.json({ _id: plantResult.insertedId, ...newPlant }, { status: 201 })
  } catch (error) {
    console.error("[v0] Plant creation error:", error)
    return NextResponse.json({ error: "Failed to create plant" }, { status: 500 })
  }
}
