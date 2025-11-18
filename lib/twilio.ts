// Twilio integration for phone calls and SMS
// Note: Users need to add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER to environment variables

export interface TwilioConfig {
  accountSid: string
  authToken: string
  phoneNumber: string
}

export function getTwilioConfig(): TwilioConfig | null {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const phoneNumber = process.env.TWILIO_PHONE_NUMBER

  if (!accountSid || !authToken || !phoneNumber) {
    console.warn("Twilio credentials not configured")
    return null
  }

  return { accountSid, authToken, phoneNumber }
}

export async function makeOutboundCall(
  to: string,
  callbackUrl: string,
): Promise<{ success: boolean; callSid?: string; error?: string }> {
  const config = getTwilioConfig()
  if (!config) {
    return { success: false, error: "Twilio not configured" }
  }

  try {
    // In production, use Twilio SDK to make the call
    // const client = twilio(config.accountSid, config.authToken)
    // const call = await client.calls.create({
    //   to,
    //   from: config.phoneNumber,
    //   url: callbackUrl,
    // })

    // For now, return mock response
    return {
      success: true,
      callSid: `CA${Math.random().toString(36).substr(2, 32)}`,
    }
  } catch (error) {
    console.error("Outbound call error:", error)
    return { success: false, error: "Failed to initiate call" }
  }
}

export async function sendAppointmentSMS(
  to: string,
  appointmentDetails: { name: string; date: string; time: string },
): Promise<{ success: boolean; error?: string }> {
  const config = getTwilioConfig()
  if (!config) {
    return { success: false, error: "Twilio not configured" }
  }

  try {
    const message = `Hi ${appointmentDetails.name}! Your appointment is confirmed for ${appointmentDetails.date} at ${appointmentDetails.time}. Thank you for choosing PostSavage.ai! Reply CANCEL to cancel.`

    // Make actual Twilio API call to send SMS
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${config.accountSid}:${config.authToken}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        To: to,
        From: config.phoneNumber,
        Body: message,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error("SMS send error:", error)
      return { success: false, error: "Failed to send SMS" }
    }

    console.log("Appointment SMS sent successfully to:", to)
    return { success: true }
  } catch (error) {
    console.error("SMS sending error:", error)
    return { success: false, error: "Failed to send SMS" }
  }
}

export async function sendFollowUpSMS(
  to: string,
  message: string,
  relatedCallId?: string,
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const config = getTwilioConfig()
  if (!config) {
    return { success: false, error: "Twilio not configured" }
  }

  try {
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${config.accountSid}:${config.authToken}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        To: to,
        From: config.phoneNumber,
        Body: message,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error("Follow-up SMS send error:", error)
      return { success: false, error: "Failed to send follow-up SMS" }
    }

    const result = await response.json()
    console.log("Follow-up SMS sent successfully to:", to, "MessageSid:", result.sid)
    return { success: true, messageId: result.sid }
  } catch (error) {
    console.error("Follow-up SMS sending error:", error)
    return { success: false, error: "Failed to send follow-up SMS" }
  }
}
