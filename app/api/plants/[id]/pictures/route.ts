import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { verifyToken } from "@/lib/jwt"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check for either admin or user token
    const adminToken = request.cookies.get("admin_token")?.value
    const userToken = request.cookies.get("user_token")?.value
    const token = adminToken || userToken

    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { src } = await request.json()
    if (!src) return NextResponse.json({ error: "Missing image source" }, { status: 400 })

    const { id: plantId } = await params
    const db = await connectDB()

    const plant = await db.collection("plants").findOne({ id: plantId })
    if (!plant) return NextResponse.json({ error: "Plant not found" }, { status: 404 })

    // If it's a user, ensure they own the plant
    if (payload.role === "user" && plant.userId !== payload.userId) {
      return NextResponse.json({ error: "Unauthorized access to plant" }, { status: 403 })
    }

    const now = new Date()
    const pictureId = `pic_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`

    const newPicture = {
      id: pictureId,
      plantId,
      userId: plant.userId,
      src,
      uploaded: now,
    }

    // Update the plant with the new picture and lastProofPicture date
    await db.collection("plants").updateOne(
      { id: plantId },
      {
        $push: { pictures: newPicture },
        $set: { lastProofPicture: now },
      },
    )

    return NextResponse.json(newPicture, { status: 201 })
  } catch (error) {
    console.error("[v0] Picture upload error:", error)
    return NextResponse.json({ error: "Failed to upload picture" }, { status: 500 })
  }
}
