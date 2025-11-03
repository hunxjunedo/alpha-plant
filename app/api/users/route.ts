import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"

export async function GET() {
  try {
    const db = await connectDB()
    const users = await db.collection("users").find({}).toArray()
    return NextResponse.json(users)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { id, password, house, plants } = await request.json()

    if (!id || !password || !house) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const db = await connectDB()
    const newUser = {
      id,
      password,
      created: new Date(),
      house,
      plants: plants || [],
    }

    const result = await db.collection("users").insertOne(newUser)
    return NextResponse.json({ _id: result.insertedId, ...newUser }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}
