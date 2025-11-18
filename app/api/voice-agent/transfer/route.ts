import { db } from "@/lib/redis"

export async function POST(req: Request) {
  try {
    const { callId, reason } = await req.json()

    // Update call session to transferred status
    await db.updateCallSession(callId, {
      status: "transferred",
      outcome: "transferred_to_agent",
    })

    // In production, this would integrate with your phone system (Twilio, etc.)
    // to actually transfer the call to a live agent

    return Response.json({
      success: true,
      message: "Call transferred to live agent",
      transferReason: reason,
    })
  } catch (error) {
    console.error("[v0] Transfer error:", error)
    return new Response(JSON.stringify({ error: "Failed to transfer call" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
