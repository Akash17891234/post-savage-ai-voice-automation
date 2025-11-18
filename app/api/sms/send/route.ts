import { generateText } from "ai"
import { db } from "@/lib/redis"
import { nanoid } from "nanoid"

export async function POST(req: Request) {
  try {
    const { customerPhone, callId, messageType, customMessage } = await req.json()

    let messageContent = customMessage

    // If no custom message, generate one based on call context
    if (!customMessage && callId) {
      const callSession = await db.getCallSession(callId)
      if (callSession) {
        const { text } = await generateText({
          model: "openai/gpt-4o-mini",
          prompt: `Based on this customer conversation, generate a helpful follow-up SMS message.

Conversation:
${callSession.transcript.map((msg) => `${msg.role}: ${msg.content}`).join("\n")}

Message type: ${messageType || "general_followup"}

Requirements:
- Keep it under 160 characters
- Be friendly and professional
- Include relevant details (appointment time, confirmation, etc.)
- End with a clear call-to-action if needed

Generate only the SMS message text, nothing else.`,
        })

        messageContent = text.trim()
      }
    }

    if (!messageContent) {
      return Response.json({ error: "No message content provided" }, { status: 400 })
    }

    // Send SMS via Twilio (in production)
    const success = await sendSMS(customerPhone, messageContent)

    // Save SMS to database
    const smsId = nanoid()
    await db.createSMSMessage({
      id: smsId,
      customerId: customerPhone,
      customerPhone,
      content: messageContent,
      sentAt: new Date().toISOString(),
      status: success ? "sent" : "failed",
      relatedCallId: callId,
    })

    // Update call session if related to a call
    if (callId) {
      await db.updateCallSession(callId, {
        outcome: "sms_sent",
      })
    }

    return Response.json({
      success,
      messageId: smsId,
      content: messageContent,
    })
  } catch (error) {
    console.error("[v0] SMS send error:", error)
    return Response.json({ error: "Failed to send SMS" }, { status: 500 })
  }
}

async function sendSMS(to: string, message: string): Promise<boolean> {
  // In production, use Twilio to send SMS
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const fromNumber = process.env.TWILIO_PHONE_NUMBER

  if (!accountSid || !authToken || !fromNumber) {
    console.warn("[v0] Twilio not configured, SMS not sent")
    return false
  }

  try {
    // const client = twilio(accountSid, authToken)
    // await client.messages.create({
    //   body: message,
    //   from: fromNumber,
    //   to: to,
    // })

    console.log("[v0] SMS sent to:", to, "Message:", message)
    return true
  } catch (error) {
    console.error("[v0] Twilio SMS error:", error)
    return false
  }
}
