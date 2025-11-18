export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const callSid = formData.get("CallSid") as string
    const callStatus = formData.get("CallStatus") as string
    const callDuration = formData.get("CallDuration") as string

    console.log("[v0] Call status update:", callSid, callStatus, callDuration)

    // Find call session by Twilio CallSid (in production, you'd store this mapping)
    // For now, we'll just log the status

    return new Response("OK", { status: 200 })
  } catch (error) {
    console.error("[v0] Status webhook error:", error)
    return new Response("Error", { status: 500 })
  }
}
