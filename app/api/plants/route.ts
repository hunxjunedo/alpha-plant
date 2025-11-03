import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    const { name, userId, planted } = await request.json()

    if (!name || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const db = await connectDB()

    const plantId = `plant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const newPlant = {
      id: plantId,
      name,
      planted: planted ? new Date(planted) : new Date(),
      last_proof_picture: null,
      pictures: [],
    }

    const plantResult = await db.collection("plants").insertOne(newPlant)

    await db.collection("users").updateOne({ id: userId }, { $push: { plants: plantId } })

    return NextResponse.json({ _id: plantResult.insertedId, ...newPlant }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create plant" }, { status: 500 })
  }
}
