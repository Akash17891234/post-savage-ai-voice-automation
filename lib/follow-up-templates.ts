// Follow-up SMS templates for different scenarios

export interface FollowUpTemplate {
  id: string
  name: string
  scenario: string
  timing: "immediate" | "1hour" | "3hours" | "24hours"
  message: (data: any) => string
}

export const followUpTemplates: FollowUpTemplate[] = [
  {
    id: "appointment_booked",
    name: "Appointment Confirmation",
    scenario: "After successfully booking an appointment",
    timing: "immediate",
    message: (data) =>
      `Hi ${data.name}! 🎉 Your appointment is confirmed for ${data.date} at ${data.time}. We'll send you a reminder 24 hours before. Reply CANCEL to cancel or RESCHEDULE to change. - PostSavage.ai`,
  },
  {
    id: "appointment_reminder_24h",
    name: "24-Hour Reminder",
    scenario: "24 hours before appointment",
    timing: "24hours",
    message: (data) =>
      `Hi ${data.name}! Reminder: Your appointment is tomorrow (${data.date}) at ${data.time}. Reply CONFIRM if you're coming or RESCHEDULE to change. See you soon! - PostSavage.ai`,
  },
  {
    id: "missed_call",
    name: "Missed Call Follow-up",
    scenario: "When customer doesn't complete the call",
    timing: "1hour",
    message: (data) =>
      `Hi! We noticed you called PostSavage.ai earlier. We'd love to help you! Reply with your question or call us back at ${data.phoneNumber}. - PostSavage.ai`,
  },
  {
    id: "general_inquiry",
    name: "General Inquiry Follow-up",
    scenario: "After a general inquiry call",
    timing: "3hours",
    message: (data) =>
      `Hi! Thanks for calling PostSavage.ai. ${data.name ? `${data.name}, ` : ""}We're here if you have any more questions. Reply to this message or call us anytime! - PostSavage.ai`,
  },
  {
    id: "transferred_to_agent",
    name: "Agent Transfer Follow-up",
    scenario: "After transferring to live agent",
    timing: "1hour",
    message: (data) =>
      `Hi ${data.name || "there"}! Thanks for speaking with our team. ${data.resolved ? "We hope we resolved your issue!" : "Let us know if you need anything else."} Reply anytime! - PostSavage.ai`,
  },
  {
    id: "no_appointment_booked",
    name: "Booking Encouragement",
    scenario: "When call ends without booking",
    timing: "3hours",
    message: (data) =>
      `Hi! Thanks for your interest in PostSavage.ai. ${data.name ? `${data.name}, ` : ""}Ready to book an appointment? Reply BOOK or call us back. We're here to help! - PostSavage.ai`,
  },
]

export function getTemplateByScenario(scenario: string): FollowUpTemplate | undefined {
  return followUpTemplates.find((t) => t.id === scenario)
}

export function generateFollowUpMessage(scenario: string, data: any): string {
  const template = getTemplateByScenario(scenario)
  if (!template) {
    return `Hi! Thanks for calling PostSavage.ai. We're here if you need anything. Reply anytime!`
  }
  return template.message(data)
}
