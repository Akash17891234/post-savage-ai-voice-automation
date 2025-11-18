import { generateObject } from "ai"
import { z } from "zod"

export const maxDuration = 30

// Advanced sentiment and emotion analysis
const EmotionAnalysisSchema = z.object({
  sentiment: z.enum(["positive", "neutral", "negative"]),
  emotion: z.enum(["happy", "excited", "neutral", "confused", "frustrated", "angry", "sad"]),
  confidence: z.number().min(0).max(1),
  shouldTransfer: z.boolean(),
  suggestedAction: z.enum(["continue", "transfer_to_agent", "send_sms", "book_appointment", "end_call"]),
  reasoning: z.string(),
})

export async function POST(req: Request) {
  try {
    const { transcript, customerPhone } = await req.json()

    // Use AI to analyze the conversation deeply
    const { object } = await generateObject({
      model: "openai/gpt-4o-mini",
      schema: EmotionAnalysisSchema,
      prompt: `Analyze this customer conversation and determine:
1. Overall sentiment (positive, neutral, negative)
2. Customer's emotional state
3. Whether we should transfer to a human agent
4. What action to take next

Conversation transcript:
${transcript.map((msg: any) => `${msg.role}: ${msg.content}`).join("\n")}

Consider:
- Customer frustration level
- Complexity of their request
- Whether AI can handle this effectively
- If they explicitly asked for a human`,
    })

    return Response.json(object)
  } catch (error) {
    console.error("[v0] Analysis error:", error)
    return new Response(JSON.stringify({ error: "Failed to analyze conversation" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
