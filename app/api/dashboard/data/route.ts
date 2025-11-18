import { db } from "@/lib/redis"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const [recentCalls, stats, recentSMS] = await Promise.all([
      db.getRecentCalls(10),
      db.getCallStats(),
      db.getRecentSMS(10),
    ])

    return NextResponse.json({
      calls: recentCalls,
      stats,
      sms: recentSMS,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v0] Dashboard data error:", error)
    return NextResponse.json({
      calls: [],
      stats: { totalCalls: 0, activeCalls: 0, appointmentsBooked: 0, averageSentiment: "neutral" },
      sms: [],
      timestamp: new Date().toISOString(),
    })
  }
}
