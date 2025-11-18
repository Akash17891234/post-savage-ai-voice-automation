// Shared types for the voice agent system
export type CallStatus = "active" | "completed" | "transferred" | "failed"
export type Sentiment = "positive" | "neutral" | "negative"
export type CallOutcome = "appointment_booked" | "transferred_to_agent" | "sms_sent" | "no_action"

export interface VoiceAgentConfig {
  businessName: string
  businessType: string
  services: string[]
  appointmentTypes: string[]
  workingHours: {
    start: string
    end: string
    timezone: string
  }
  transferThreshold: number // 0-1, when to transfer to human
  emotionalIntelligence: boolean
  smsFollowUp: boolean
}
