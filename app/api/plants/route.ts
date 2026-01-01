import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"

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

    const plantCount = userExists.plants?.length || 0
    const plantId = `plant_${plantCount + 1}_${userId}`

    // Ensure uniqueness if the user somehow has multiple plant_X IDs
    let finalPlantId = plantId
    let counter = 1
    let exists = await db.collection("plants").findOne({ id: finalPlantId })
    while (exists) {
      finalPlantId = `plant_${plantCount + counter + 1}_${userId}`
      exists = await db.collection("plants").findOne({ id: finalPlantId })
      counter++
    }

    const newPlant = {
      id: finalPlantId,
      name,
      userId,
      planted: planted ? new Date(planted) : new Date(),
      lastProofPicture: null,
      pictures: [],
    }

    const plantResult = await db.collection("plants").insertOne(newPlant)

    await db.collection("users").updateOne({ id: userId }, { $push: { plants: finalPlantId } })

    return NextResponse.json({ _id: plantResult.insertedId, ...newPlant }, { status: 201 })
  } catch (error) {
    console.error("[v0] Plant creation error:", error)
    return NextResponse.json({ error: "Failed to create plant" }, { status: 500 })
  }
}
