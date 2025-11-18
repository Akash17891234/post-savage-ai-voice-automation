export async function POST(req: Request) {
  console.log("=== INCOMING CALL RECEIVED ===")

  try {
    const formData = await req.formData()
    const from = formData.get("From") as string
    const callSid = formData.get("CallSid") as string

    console.log("From:", from, "CallSid:", callSid)

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://postsavageagenticai.vercel.app"
    const sessionId = Date.now().toString()
    const webhookUrl = `${baseUrl}/api/phone/process-speech?callId=${sessionId}`

    console.log("Webhook URL:", webhookUrl)

    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather 
    input="speech" 
    action="${webhookUrl}" 
    method="POST" 
    speechTimeout="auto" 
    timeout="8" 
    language="en-US" 
    speechModel="phone_call"
    enhanced="true"
    hints="appointment, book, schedule, meeting, consultation, service, yes, no, help">
    <Say voice="Polly.Joanna">Hello! Thank you for calling Post Savage A I. I'm your A I agent, and I'm here to help you. How can I assist you today?</Say>
  </Gather>
  <Gather 
    input="speech" 
    action="${webhookUrl}" 
    method="POST" 
    speechTimeout="auto" 
    timeout="8" 
    language="en-US" 
    speechModel="phone_call"
    enhanced="true">
    <Say voice="Polly.Joanna">I didn't quite catch that. Please tell me how I can help you.</Say>
  </Gather>
  <Say voice="Polly.Joanna">Thank you for calling. Goodbye.</Say>
  <Hangup/>
</Response>`

    return new Response(twiml, {
      headers: { "Content-Type": "text/xml" },
    })
  } catch (error) {
    console.error("CRITICAL ERROR:", error)

    const fallbackTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna">Hello! Thank you for calling Post Savage A I. Our system is currently being updated. Please try again in a few minutes.</Say>
  <Hangup/>
</Response>`

    return new Response(fallbackTwiml, {
      headers: { "Content-Type": "text/xml" },
    })
  }
}
