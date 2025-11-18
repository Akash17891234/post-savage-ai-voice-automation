import { generateText } from "ai"
import { db } from "@/lib/redis"

export async function POST(req: Request) {
  try {
    const { callId, messageType, context } = await req.json()

    let prompt = ""

    if (callId) {
      // Generate based on call conversation
      const callSession = await db.getCallSession(callId)
      if (!callSession) {
        return Response.json({ error: "Call session not found" }, { status: 404 })
      }

      prompt = `Based on this customer conversation, generate a helpful follow-up SMS message.

Conversation:
${callSession.transcript.map((msg) => `${msg.role}: ${msg.content}`).join("\n")}

Message type: ${messageType || "general_followup"}
Additional context: ${context || "None"}

Requirements:
- Keep it under 160 characters
- Be friendly and professional
- Include relevant details (appointment time, confirmation, etc.)
- End with a clear call-to-action if needed

Generate only the SMS message text, nothing else.`
    } else {
      // Generate based on message type and context
      prompt = `Generate a professional SMS message for a customer.

Message type: ${messageType}
Context: ${context || "General follow-up"}

Requirements:
- Keep it under 160 characters
- Be friendly and professional
- Include a clear call-to-action
- Represent PostSavage.ai voice automation platform

Generate only the SMS message text, nothing else.`
    }

    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt,
      temperature: 0.7,
      maxTokens: 100,
    })

    return Response.json({
      message: text.trim(),
      characterCount: text.trim().length,
    })
  } catch (error) {
    console.error("[v0] SMS generation error:", error)
    return Response.json({ error: "Failed to generate SMS" }, { status: 500 })
  }
}
