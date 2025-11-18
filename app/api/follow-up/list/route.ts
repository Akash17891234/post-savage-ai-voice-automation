import { NextResponse } from "next/server"
import { db } from "@/lib/redis"

export async function GET() {
  try {
    const followUps = await db.getPendingFollowUps(Date.now() + 1000 * 60 * 60 * 24 * 7)

    return NextResponse.json({
      success: true,
      followUps,
      count: followUps.length,
    })
  } catch (error) {
    console.error("[v0] Error fetching follow-ups:", error)
    return NextResponse.json({ error: "Failed to fetch follow-ups" }, { status: 500 })
  }
}
