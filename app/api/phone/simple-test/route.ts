export async function POST() {
  console.log("[v0] SIMPLE TEST ENDPOINT HIT")

  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna">Hello! This is Post Savage A I. The system is working correctly. Goodbye.</Say>
  <Hangup/>
</Response>`

  return new Response(twiml, {
    headers: { "Content-Type": "text/xml" },
  })
}
