import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { signToken } from "@/lib/jwt"

export async function POST(request: NextRequest) {
  try {
    const { id, password } = await request.json()

    if (!id || !password) {
      return NextResponse.json({ error: "Missing ID or password" }, { status: 400 })
    }

    const db = await connectDB()
    const user = await db.collection("users").findOne({ id })

    if (!user || user.password !== password) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const token = await signToken({
      role: "user",
      userId: user.id,
      fullName: user.fullName,
      iat: Date.now(),
    })

    const response = NextResponse.json({ success: true, user: { id: user.id, fullName: user.fullName } })
    response.cookies.set({
      name: "user_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 86400, // 24 hours
    })
    return response
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
