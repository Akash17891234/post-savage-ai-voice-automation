import { makeOutboundCall } from "@/lib/twilio"
import { db } from "@/lib/redis"
import { nanoid } from "nanoid"

export async function POST(req: Request) {
  try {
    const { customerPhone, purpose } = await req.json()

    // Create call session
    const sessionId = nanoid()
    await db.createCallSession({
      id: sessionId,
      customerId: customerPhone,
      customerPhone,
      status: "active",
      startTime: new Date().toISOString(),
      sentiment: "neutral",
      intent: purpose || "outbound_call",
      transcript: [],
    })

    // Make outbound call
    const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://your-app.vercel.app"}/api/phone/incoming`
    const result = await makeOutboundCall(customerPhone, callbackUrl)

    if (!result.success) {
      await db.updateCallSession(sessionId, { status: "failed" })
      return Response.json({ error: result.error }, { status: 500 })
    }

    return Response.json({
      success: true,
      callId: sessionId,
      twilioCallSid: result.callSid,
    })
  } catch (error) {
    console.error("[v0] Outbound call error:", error)
    return Response.json({ error: "Failed to initiate outbound call" }, { status: 500 })
  }
}
