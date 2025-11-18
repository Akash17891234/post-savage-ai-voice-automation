import { streamText } from "ai"
import { db } from "@/lib/redis"
import { nanoid } from "nanoid"

export const maxDuration = 60

// System prompt for the emotionally-intelligent voice agent
const AGENT_SYSTEM_PROMPT = `You are an emotionally-intelligent AI voice agent for PostSavage.ai, a voice automation platform for revenue teams.

Your role:
- Answer customer calls with a warm, professional, human-like voice
- Understand customer needs and emotions in real-time
- Book appointments efficiently
- Transfer complex calls to live agents when needed
- Send follow-up SMS messages when appropriate

Emotional Intelligence Guidelines:
- Detect customer sentiment (positive, neutral, negative) from their tone and words
- Adjust your tone and pace based on customer emotions
- Show empathy for frustrated customers
- Be enthusiastic with excited customers
- Stay calm and professional with angry customers

Conversation Flow:
1. Greet the customer warmly
2. Ask how you can help them today
3. Listen carefully to their needs
4. If they want to book an appointment:
   - Ask for preferred date and time
   - Confirm service type
   - Collect contact information
   - Confirm all details
5. If the request is too complex or customer is very upset:
   - Offer to transfer to a live agent
   - Explain you're connecting them now
6. If appropriate, offer to send a follow-up SMS with details

Keep responses:
- Natural and conversational (like a real person)
- Brief and to the point (2-3 sentences max)
- Focused on the customer's immediate need
- Professional but friendly

Current business info:
- Business: PostSavage.ai
- Services: Voice automation, AI call handling, appointment booking
- Available: 24/7`

export async function POST(req: Request) {
  try {
    const { messages, customerPhone, callId } = await req.json()

    // Create or get call session
    const sessionId = callId || nanoid()
    let callSession = await db.getCallSession(sessionId)

    if (!callSession) {
      // Create new call session
      callSession = {
        id: sessionId,
        customerId: customerPhone,
        customerPhone,
        status: "active",
        startTime: new Date().toISOString(),
        sentiment: "neutral",
        intent: "unknown",
        transcript: [],
      }
      await db.createCallSession(callSession)

      // Update or create customer record
      let customer = await db.getCustomerByPhone(customerPhone)
      if (!customer) {
        customer = {
          id: nanoid(),
          phone: customerPhone,
          callHistory: [sessionId],
          lastContact: new Date().toISOString(),
          totalCalls: 1,
          appointmentsBooked: 0,
        }
      } else {
        customer.callHistory.push(sessionId)
        customer.totalCalls += 1
        customer.lastContact = new Date().toISOString()
      }
      await db.createOrUpdateCustomer(customer)
    }

    // Analyze sentiment and intent from the latest message
    const latestMessage = messages[messages.length - 1]
    const sentiment = analyzeSentiment(latestMessage.content)
    const intent = detectIntent(latestMessage.content)

    // Update call session with new message and analysis
    callSession.transcript.push({
      role: latestMessage.role,
      content: latestMessage.content,
      timestamp: new Date().toISOString(),
      sentiment,
    })
    callSession.sentiment = sentiment
    callSession.intent = intent

    await db.updateCallSession(sessionId, {
      transcript: callSession.transcript,
      sentiment,
      intent,
    })

    // Stream AI response with emotional intelligence
    const result = streamText({
      model: "openai/gpt-4o-mini",
      system: AGENT_SYSTEM_PROMPT,
      messages,
      temperature: 0.7,
      maxTokens: 150,
      onFinish: async ({ text }) => {
        // Save assistant response to transcript
        callSession!.transcript.push({
          role: "assistant",
          content: text,
          timestamp: new Date().toISOString(),
        })
        await db.updateCallSession(sessionId, {
          transcript: callSession!.transcript,
        })

        // Check if we should trigger actions based on intent
        if (intent === "book_appointment") {
          // Extract appointment details from conversation
          const appointmentDetails = extractAppointmentDetails(text)
          if (appointmentDetails) {
            await db.updateCallSession(sessionId, {
              outcome: "appointment_booked",
              appointmentDetails,
            })

            // Update customer appointment count
            const customer = await db.getCustomerByPhone(customerPhone)
            if (customer) {
              customer.appointmentsBooked += 1
              await db.createOrUpdateCustomer(customer)
            }
          }
        }
      },
    })

    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.error("[v0] Voice agent error:", error)
    return new Response(JSON.stringify({ error: "Failed to process voice request" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

// Sentiment analysis helper
function analyzeSentiment(text: string): "positive" | "neutral" | "negative" {
  const lowerText = text.toLowerCase()

  // Positive indicators
  const positiveWords = ["great", "thanks", "perfect", "awesome", "excellent", "love", "happy", "yes"]
  const positiveCount = positiveWords.filter((word) => lowerText.includes(word)).length

  // Negative indicators
  const negativeWords = ["bad", "terrible", "angry", "frustrated", "upset", "no", "cancel", "complaint"]
  const negativeCount = negativeWords.filter((word) => lowerText.includes(word)).length

  if (positiveCount > negativeCount && positiveCount > 0) return "positive"
  if (negativeCount > positiveCount && negativeCount > 0) return "negative"
  return "neutral"
}

// Intent detection helper
function detectIntent(text: string): string {
  const lowerText = text.toLowerCase()

  if (
    lowerText.includes("book") ||
    lowerText.includes("appointment") ||
    lowerText.includes("schedule") ||
    lowerText.includes("reserve")
  ) {
    return "book_appointment"
  }

  if (lowerText.includes("cancel") || lowerText.includes("reschedule")) {
    return "modify_appointment"
  }

  if (lowerText.includes("speak to") || lowerText.includes("talk to") || lowerText.includes("human")) {
    return "transfer_to_agent"
  }

  if (lowerText.includes("information") || lowerText.includes("hours") || lowerText.includes("location")) {
    return "general_inquiry"
  }

  return "unknown"
}

// Extract appointment details from conversation
function extractAppointmentDetails(text: string): { date: string; time: string; service: string } | null {
  // Simple extraction - in production, use more sophisticated NLP
  const dateMatch = text.match(/\b\d{1,2}\/\d{1,2}\/\d{4}\b/)
  const timeMatch = text.match(/\b\d{1,2}:\d{2}\s?(AM|PM|am|pm)\b/)

  if (dateMatch && timeMatch) {
    return {
      date: dateMatch[0],
      time: timeMatch[0],
      service: "General Consultation",
    }
  }

  return null
}
