import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { verifyToken } from "@/lib/jwt"
import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB in bytes

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userToken = request.cookies.get("user_token")?.value
    if (!userToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const payload = await verifyToken(userToken)
    if (!payload || payload.role !== "user") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const formData = await request.formData()
    const file = formData.get("file") as File
    if (!file) return NextResponse.json({ error: "Missing image file" }, { status: 400 })

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size must be less than 5MB (current: ${(file.size / 1024 / 1024).toFixed(2)}MB)` },
        { status: 413 },
      )
    }

    const { id: plantId } = await params
    const db = await connectDB()

    const plant = await db.collection("plants").findOne({ id: plantId })
    if (!plant) return NextResponse.json({ error: "Plant not found" }, { status: 404 })

    if (plant.userId !== payload.userId) {
      return NextResponse.json({ error: "Unauthorized access to plant" }, { status: 403 })
    }

    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    const lastUpload = plant.lastProofPicture ? new Date(plant.lastProofPicture) : null
    if (lastUpload && lastUpload >= startOfDay) {
      return NextResponse.json({ error: "Only one picture allowed per day" }, { status: 429 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uploadResponse = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "plants",
            transformation: [{ width: 1000, height: 1000, crop: "limit", quality: "auto", fetch_format: "auto" }],
          },
          (error, result) => {
            if (error) reject(error)
            else resolve(result)
          },
        )
        .end(buffer)
    })

    const newPicture = {
      src: uploadResponse.secure_url,
      uploaded: now,
    }

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
