export async function POST(req: Request) {
  console.log("[v0] TEST CALL ENDPOINT HIT")

  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna">This is a test. The webhook is working correctly.</Say>
  <Hangup/>
</Response>`

  return new Response(twiml, {
    headers: { "Content-Type": "text/xml" },
  })
}

export async function GET() {
  return Response.json({
    status: "ok",
    message: "Test endpoint is reachable",
    env: {
      hasAppUrl: !!process.env.NEXT_PUBLIC_APP_URL,
      hasTwilioSid: !!process.env.TWILIO_ACCOUNT_SID,
      hasTwilioToken: !!process.env.TWILIO_AUTH_TOKEN,
      hasTwilioPhone: !!process.env.TWILIO_PHONE_NUMBER,
    },
  })
}
