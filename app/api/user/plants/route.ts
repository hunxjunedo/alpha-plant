import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { verifyToken } from "@/lib/jwt"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("user_token")?.value
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload || payload.role !== "user") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await connectDB()
    const plants = await db.collection("plants").find({ userId: payload.userId }).toArray()

    return NextResponse.json(plants)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch plants" }, { status: 500 })
  }
}
