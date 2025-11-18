import { db } from "@/lib/redis"

export async function POST(req: Request) {
  try {
    const { callId } = await req.json()

    const callSession = await db.getCallSession(callId)
    if (!callSession) {
      return new Response(JSON.stringify({ error: "Call session not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Calculate call duration
    const startTime = new Date(callSession.startTime).getTime()
    const endTime = Date.now()
    const duration = Math.floor((endTime - startTime) / 1000) // in seconds

    // Update call session
    await db.updateCallSession(callId, {
      status: "completed",
      endTime: new Date().toISOString(),
      duration,
    })

    return Response.json({
      success: true,
      duration,
      outcome: callSession.outcome || "no_action",
    })
  } catch (error) {
    console.error("[v0] End call error:", error)
    return new Response(JSON.stringify({ error: "Failed to end call" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
