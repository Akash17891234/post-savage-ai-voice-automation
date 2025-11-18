import { NextResponse } from "next/server"
import { db } from "@/lib/redis"
import { generateFollowUpMessage } from "@/lib/follow-up-templates"
import { nanoid } from "nanoid"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { callId, customerId, customerPhone, scenario, data, delayMinutes = 0 } = body

    if (!callId || !customerPhone || !scenario) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const message = generateFollowUpMessage(scenario, data)
    const scheduledFor = new Date(Date.now() + delayMinutes * 60 * 1000).toISOString()

    const followUp = {
      id: nanoid(),
      callId,
      customerId: customerId || nanoid(),
      customerPhone,
      scenario,
      scheduledFor,
      status: "pending" as const,
      messageContent: message,
      createdAt: new Date().toISOString(),
    }

    await db.scheduleFollowUp(followUp)

    console.log("[v0] Follow-up scheduled:", followUp.id, "for", scheduledFor)

    return NextResponse.json({
      success: true,
      followUpId: followUp.id,
      scheduledFor,
      message,
    })
  } catch (error) {
    console.error("[v0] Error scheduling follow-up:", error)
    return NextResponse.json({ error: "Failed to schedule follow-up" }, { status: 500 })
  }
}
