import { NextResponse } from "next/server"
import { db } from "@/lib/redis"
import { sendFollowUpSMS } from "@/lib/twilio"
import { nanoid } from "nanoid"

export async function POST(req: Request) {
  try {
    const pendingFollowUps = await db.getPendingFollowUps()

    console.log("[v0] Processing", pendingFollowUps.length, "pending follow-ups")

    const results = await Promise.all(
      pendingFollowUps.map(async (followUp) => {
        try {
          const result = await sendFollowUpSMS(followUp.customerPhone, followUp.messageContent, followUp.callId)

          if (result.success) {
            await db.updateFollowUpStatus(followUp.id, "sent")

            const smsMessage = {
              id: result.messageId || nanoid(),
              customerId: followUp.customerId,
              customerPhone: followUp.customerPhone,
              content: followUp.messageContent,
              sentAt: new Date().toISOString(),
              status: "sent" as const,
              relatedCallId: followUp.callId,
            }
            await db.createSMSMessage(smsMessage)

            console.log("[v0] Follow-up sent successfully:", followUp.id)
            return { followUpId: followUp.id, success: true }
          } else {
            await db.updateFollowUpStatus(followUp.id, "failed")
            console.error("[v0] Follow-up send failed:", followUp.id, result.error)
            return { followUpId: followUp.id, success: false, error: result.error }
          }
        } catch (error) {
          console.error("[v0] Error processing follow-up:", followUp.id, error)
          await db.updateFollowUpStatus(followUp.id, "failed")
          return { followUpId: followUp.id, success: false, error: String(error) }
        }
      }),
    )

    const successCount = results.filter((r) => r.success).length
    const failCount = results.filter((r) => !r.success).length

    return NextResponse.json({
      success: true,
      processed: results.length,
      sent: successCount,
      failed: failCount,
      results,
    })
  } catch (error) {
    console.error("[v0] Error sending follow-ups:", error)
    return NextResponse.json({ error: "Failed to send follow-ups" }, { status: 500 })
  }
}
