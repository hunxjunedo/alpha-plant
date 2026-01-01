import { jwtVerify, SignJWT } from "jose"

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET)

export async function signToken(payload: Record<string, unknown>): Promise<string> {
  return new SignJWT(payload).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("24h").sign(SECRET)
}

export async function verifyToken(token: string): Promise<Record<string, unknown> | null> {
  try {
    const verified = await jwtVerify(token, SECRET)
    return verified.payload
  } catch {
    return null
  }
}
