import { db } from "@/lib/redis"
import { nanoid } from "nanoid"

export async function POST(req: Request) {
  try {
    // Parse Twilio webhook data
    const formData = await req.formData()
    const from = formData.get("From") as string
    const body = formData.get("Body") as string
    const messageSid = formData.get("MessageSid") as string

    console.log("[v0] Incoming SMS from:", from, "Message:", body)

    // Save incoming SMS
    const smsId = nanoid()
    await db.createSMSMessage({
      id: smsId,
      customerId: from,
      customerPhone: from,
      content: body,
      sentAt: new Date().toISOString(),
      status: "delivered",
    })

    // Get customer to check if they have recent calls
    const customer = await db.getCustomerByPhone(from)
    let responseMessage = "Thank you for your message! We'll get back to you shortly."

    if (customer && customer.callHistory.length > 0) {
      // Get most recent call
      const recentCallId = customer.callHistory[customer.callHistory.length - 1]
      const recentCall = await db.getCallSession(recentCallId)

      if (recentCall && recentCall.status === "active") {
        // If there's an active call, this might be a response to something
        responseMessage =
          "Thanks for your message! Our AI agent will incorporate this information into your ongoing conversation."
      }
    }

    // Send auto-response
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${responseMessage}</Message>
</Response>`

    return new Response(twiml, {
      headers: { "Content-Type": "text/xml" },
    })
  } catch (error) {
    console.error("[v0] Incoming SMS error:", error)
    return new Response("Error", { status: 500 })
  }
}
