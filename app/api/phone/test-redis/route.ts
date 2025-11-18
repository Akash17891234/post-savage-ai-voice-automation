import { redis, db } from "@/lib/redis"

export async function GET() {
  try {
    console.log("[v0] Testing Redis connection...")

    // Test basic Redis operation
    await redis.set("test:connection", "working")
    const result = await redis.get("test:connection")

    console.log("[v0] Redis basic test result:", result)

    // Test database operations
    const testSession = {
      id: "test-session-" + Date.now(),
      customerId: "test-customer",
      customerPhone: "+1234567890",
      status: "active" as const,
      startTime: new Date().toISOString(),
      sentiment: "neutral" as const,
      intent: "test",
      transcript: [],
    }

    await db.createCallSession(testSession)
    const retrieved = await db.getCallSession(testSession.id)

    return Response.json({
      success: true,
      message: "Redis is working correctly",
      tests: {
        basicOperation: result === "working",
        databaseOperation: retrieved !== null,
      },
      environment: {
        hasUrl: !!process.env["UPSTASH-KV_KV_REST_API_URL"],
        hasToken: !!process.env["UPSTASH-KV_KV_REST_API_TOKEN"],
        hasAppUrl: !!process.env.NEXT_PUBLIC_APP_URL,
      },
    })
  } catch (error) {
    console.error("[v0] Redis test error:", error)
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
