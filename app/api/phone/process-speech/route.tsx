import { generateText } from "ai"
import { db } from "@/lib/redis"
import { sendAppointmentSMS } from "@/lib/twilio"
import type { CallSession } from "@/lib/redis"

export const maxDuration = 60

const AGENT_SYSTEM_PROMPT = `You are a warm, professional AI assistant for PostSavage.ai who helps book appointments.

CURRENT BOOKING STATUS:
{{APPOINTMENT_STATE}}

YOUR JOB:
1. If ALL information is collected (Name, Date, SPECIFIC Time like "2:00 PM") → Say: "Perfect! Your appointment is confirmed for [Date] at [Time], [Name]. I'll text you the details. Anything else I can help with?"
2. If information is MISSING or VAGUE → Ask for only ONE missing piece in a friendly way
3. When customer gives you info → Acknowledge it warmly ("Great!", "Got it!", "Perfect!")

IMPORTANT TIME RULES:
- "morning" or "afternoon" is NOT ENOUGH - you MUST ask for a specific time
- Ask like: "What specific time works best? For example, 10 AM, 2:30 PM, etc."
- Only accept times like: "10:00 AM", "2 PM", "3:30 PM", etc.

RULES:
- NEVER ask for info you already have (check CURRENT BOOKING STATUS above)
- Keep it brief (1-2 sentences max)
- Sound human and warm, not robotic
- If they say "no" or "that's it" → Thank them and end call
`

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const speechResult = formData.get("SpeechResult") as string
    const callId = new URL(req.url).searchParams.get("callId")
    const from = formData.get("From") as string

    console.log("=== NEW TURN ===")
    console.log("Speech:", speechResult, "CallID:", callId, "From:", from)

    if (!callId) {
      throw new Error("Missing callId")
    }

    const VOICE_ID = "Polly.Joanna-Neural"

    if (!speechResult || speechResult.trim().length === 0) {
      const retryTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather 
    input="speech" 
    action="${process.env.NEXT_PUBLIC_APP_URL}/api/phone/process-speech?callId=${callId}" 
    method="POST" 
    speechTimeout="auto" 
    timeout="5" 
    language="en-US" 
    speechModel="phone_call"
    enhanced="true">
    <Say voice="${VOICE_ID}">I didn't hear anything. Are you still there?</Say>
  </Gather>
  <Say voice="${VOICE_ID}">Thank you for calling. Goodbye.</Say>
  <Hangup/>
</Response>`
      return new Response(retryTwiml, {
        headers: { "Content-Type": "text/xml" },
      })
    }

    let callSession = await db.getCallSession(callId)
    if (!callSession) {
      console.log("Creating new session")
      callSession = {
        id: callId,
        customerId: from || "unknown",
        customerPhone: from || "unknown",
        status: "active",
        startTime: new Date().toISOString(),
        sentiment: "neutral",
        intent: "general_inquiry",
        transcript: [],
        appointmentDetails: undefined,
        customerName: "",
      } as CallSession
      await db.createCallSession(callSession)
    }

    let appointmentDetails = callSession.appointmentDetails || { date: "", time: "", service: "General Appointment" }
    let customerName = callSession.customerName || ""
    let transcript = callSession.transcript || []

    console.log("BEFORE - Name:", customerName, "Appointment:", appointmentDetails)

    transcript.push({
      role: "user",
      content: speechResult,
      timestamp: new Date().toISOString(),
    })

    const extractedData = extractAppointmentData(speechResult)
    console.log("Extracted from speech:", extractedData)

    if (extractedData.name && extractedData.name.length > 1) {
      customerName = extractedData.name
      console.log("✓ Saved name:", extractedData.name)
    }
    if (extractedData.date) {
      appointmentDetails.date = extractedData.date
      console.log("✓ Saved date:", extractedData.date)
    }
    if (extractedData.time) {
      appointmentDetails.time = extractedData.time
      console.log("✓ Saved time:", extractedData.time)
    }

    console.log("AFTER - Name:", customerName, "Appointment:", appointmentDetails)

    const appointmentComplete = !!(customerName && appointmentDetails.date && appointmentDetails.time)
    console.log("Appointment complete?", appointmentComplete)

    await db.updateCallSession(callId, {
      transcript,
      customerName,
      appointmentDetails: appointmentDetails.date || appointmentDetails.time ? appointmentDetails : undefined,
      sentiment: analyzeSentiment(speechResult),
      intent: detectIntent(speechResult),
      status: appointmentComplete ? "completed" : "active",
      outcome: appointmentComplete ? "appointment_booked" : undefined,
    } as any)

    let text = ""
    try {
      const stateDescription = `
      Name: ${customerName || "NOT PROVIDED YET"}
      Date: ${appointmentDetails.date || "NOT PROVIDED YET"}
      Time: ${appointmentDetails.time || "NOT PROVIDED YET"}
      Status: ${appointmentComplete ? "COMPLETE - Confirm booking now!" : "INCOMPLETE - Ask for missing info"}
      `
      
      const systemPrompt = AGENT_SYSTEM_PROMPT.replace("{{APPOINTMENT_STATE}}", stateDescription)

      const messages = transcript.slice(-6).map((msg: any) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      }))

      const result = await generateText({
        model: "openai/gpt-4o-mini",
        system: systemPrompt,
        messages,
        temperature: 0.7,
        maxTokens: 100,
      })

      text = result.text
      console.log("AI says:", text)
    } catch (aiError) {
      console.error("AI error:", aiError)
      
      if (appointmentComplete) {
        text = `Perfect! Your appointment is confirmed for ${appointmentDetails.date} at ${appointmentDetails.time}. I'll text you the details. Anything else?`
      } else if (!customerName) {
        text = "I'd love to help you book an appointment. May I have your name?"
      } else if (!appointmentDetails.date) {
        text = `Great, ${customerName}! What date would you like?`
      } else if (!appointmentDetails.time) {
        text = "What specific time works best? For example, 10 AM, 2:30 PM, etc."
      } else {
        text = "How can I help you today?"
      }
    }

    transcript.push({
      role: "assistant",
      content: text,
      timestamp: new Date().toISOString(),
    })

    await db.updateCallSession(callId, { transcript } as any)

    const lowerSpeech = speechResult.toLowerCase().trim()
    const wantsToEnd =
      lowerSpeech === "no" ||
      lowerSpeech === "nope" ||
      lowerSpeech === "nothing" ||
      lowerSpeech.includes("that's it") ||
      lowerSpeech.includes("nothing else") ||
      lowerSpeech.includes("i'm good") ||
      lowerSpeech.includes("all set") ||
      lowerSpeech.includes("goodbye")

    let twiml = ""

    if (wantsToEnd && appointmentComplete && from) {
      console.log("Sending confirmation SMS to", from)
      
      const customer = await db.getCustomerByPhone(from)
      if (customer) {
        await db.createOrUpdateCustomer({
          ...customer,
          name: customerName,
          appointmentsBooked: (customer.appointmentsBooked || 0) + 1,
          lastContact: new Date().toISOString(),
        })
      }
      
      sendAppointmentSMS(from, { 
        name: customerName, 
        date: appointmentDetails.date, 
        time: appointmentDetails.time 
      }).catch((e) => console.error("SMS error:", e))

      twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="${VOICE_ID}">Perfect! I've texted you the details for your appointment on ${escapeXml(appointmentDetails.date)} at ${escapeXml(appointmentDetails.time)}. Thank you, ${escapeXml(customerName)}. Have a great day!</Say>
  <Hangup/>
</Response>`
    } else if (wantsToEnd) {
      twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="${VOICE_ID}">Thank you for calling PostSavage. Have a wonderful day!</Say>
  <Hangup/>
</Response>`
    } else {
      twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather 
    input="speech" 
    action="${process.env.NEXT_PUBLIC_APP_URL}/api/phone/process-speech?callId=${callId}" 
    method="POST" 
    speechTimeout="auto" 
    timeout="6" 
    language="en-US" 
    speechModel="phone_call"
    enhanced="true"
    hints="appointment,book,yes,no,Monday,Tuesday,Wednesday,Thursday,Friday">
    <Say voice="${VOICE_ID}">${escapeXml(text)}</Say>
  </Gather>
  <Gather 
    input="speech" 
    action="${process.env.NEXT_PUBLIC_APP_URL}/api/phone/process-speech?callId=${callId}" 
    method="POST" 
    speechTimeout="auto" 
    timeout="5" 
    language="en-US">
    <Say voice="${VOICE_ID}">Are you still there?</Say>
  </Gather>
  <Say voice="${VOICE_ID}">Thank you for calling. Goodbye.</Say>
  <Hangup/>
</Response>`
    }

    return new Response(twiml, {
      headers: { "Content-Type": "text/xml" },
    })
  } catch (error) {
    console.error("ERROR:", error)

    const VOICE_ID = "Polly.Joanna-Neural"
    const errorTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="${VOICE_ID}">I apologize. Let me help you. What can I do for you?</Say>
  <Gather 
    input="speech" 
    action="${process.env.NEXT_PUBLIC_APP_URL || "https://postsavageagenticai.vercel.app"}/api/phone/process-speech?callId=${new URL(req.url).searchParams.get("callId")}" 
    method="POST" 
    speechTimeout="auto" 
    timeout="5" 
    language="en-US">
    <Say voice="${VOICE_ID}">How can I assist you?</Say>
  </Gather>
  <Say voice="${VOICE_ID}">Thank you for calling. Goodbye.</Say>
  <Hangup/>
</Response>`

    return new Response(errorTwiml, {
      headers: { "Content-Type": "text/xml" },
    })
  }
}

function extractAppointmentData(text: string) {
  const data: any = {}
  const lower = text.toLowerCase()

  const namePatterns = [
    /(?:my name is|i'm|i am|this is|call me|it's)\s+([a-z][a-z\s]{1,30})/i,
    /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)$/,  // Just "John" or "John Smith"
  ]

  for (const pattern of namePatterns) {
    const match = text.match(pattern)
    if (match && match[1]) {
      const candidate = match[1].trim()
      const stopWords = ["here", "calling", "trying", "looking", "speaking", "hello", "good", "great", "appointment", "book"]
      if (!stopWords.some(word => candidate.toLowerCase().includes(word)) && candidate.length > 1) {
        data.name = candidate.charAt(0).toUpperCase() + candidate.slice(1).toLowerCase()
        break
      }
    }
  }

  const dateKeywords = ["tomorrow", "today", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
  const months = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"]
  
  for (const keyword of [...dateKeywords, ...months]) {
    if (lower.includes(keyword)) {
      if (lower.includes("next " + keyword)) {
        data.date = "next " + keyword
      } else {
        data.date = keyword
      }
      break
    }
  }

  const timePattern = /(\d{1,2})(?::(\d{2}))?\s*(am|pm|a\.m\.|p\.m\.)/i
  const timeMatch = text.match(timePattern)
  if (timeMatch) {
    // Found specific time like "2:00 PM" or "10 AM"
    data.time = timeMatch[0].trim()
  }
  // Do NOT accept vague times like "morning" or "afternoon" anymore

  return data
}

function analyzeSentiment(text: string): "positive" | "neutral" | "negative" {
  const lowerText = text.toLowerCase()
  const positiveWords = ["great", "thanks", "perfect", "awesome", "yes", "wonderful"]
  const negativeWords = ["bad", "terrible", "angry", "frustrated", "upset", "horrible"]

  const positiveCount = positiveWords.filter((word) => lowerText.includes(word)).length
  const negativeCount = negativeWords.filter((word) => lowerText.includes(word)).length

  if (positiveCount > negativeCount && positiveCount > 0) return "positive"
  if (negativeCount > positiveCount && negativeCount > 0) return "negative"
  return "neutral"
}

function detectIntent(text: string): string {
  const lowerText = text.toLowerCase()

  if (lowerText.includes("book") || lowerText.includes("appointment") || lowerText.includes("schedule")) {
    return "book_appointment"
  }
  if (lowerText.includes("speak to") || lowerText.includes("talk to") || lowerText.includes("human")) {
    return "transfer_to_agent"
  }
  return "general_inquiry"
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}
