import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { verifyToken } from "@/lib/jwt";

export async function GET(request: NextRequest, { params } ) {
  try {
    const token = request.cookies.get("admin_token") || request.cookies.get("user_token");
 
    if(!token){
        return NextResponse.json({ error: "who are you ?" }, { status: 401 })
    }
    const payload = await verifyToken(token.value);
    if (!payload){
       return NextResponse.json({ error: "who are you ?" }, { status: 401 })
    }


    const db = await connectDB()
    const {id} = await params;
    let searchFilter : any = {id};
    if (payload.role === 'user'){
      searchFilter = {id, userId: payload.userId}
    }
    const plant = await db.collection("plants").findOne(searchFilter)

    if (!plant) {
      return NextResponse.json({ error: "Plant not found" }, { status: 404 })
    }

    return NextResponse.json(plant)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch plant" }, { status: 500 })
  }
}
