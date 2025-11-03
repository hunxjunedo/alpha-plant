import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = await connectDB()
    const plant = await db.collection("plants").findOne({ id: params.id })

    if (!plant) {
      return NextResponse.json({ error: "Plant not found" }, { status: 404 })
    }

    return NextResponse.json(plant)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch plant" }, { status: 500 })
  }
}
