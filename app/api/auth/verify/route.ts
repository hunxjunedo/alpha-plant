import { type NextRequest, NextResponse } from "next/server"
import { signToken } from "@/lib/jwt"

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()
    const adminPassword = process.env.ADMIN_PASSWORD

    if (!adminPassword) {
      return NextResponse.json({ error: "type A error" }, { status: 500 })
    }

    if (password === adminPassword) {
      const token = await signToken({ role: "admin", iat: Date.now() })

      const response = NextResponse.json({ success: true, token })
      response.cookies.set({
        name: "admin_token",
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 86400, // 24 hours
      })
      return response
    }

    return NextResponse.json({ error: "Invalid password" }, { status: 401 })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
