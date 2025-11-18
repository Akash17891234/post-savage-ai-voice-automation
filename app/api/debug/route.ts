import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID ? "Set ✓" : "Missing ✗",
    TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN ? "Set ✓" : "Missing ✗",
    TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER,
    webhookUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://postsavageagenticai.vercel.app"}/api/phone/process-speech`,
  })
}
