export async function GET() {
  const templates = [
    {
      id: "appointment_confirmation",
      name: "Appointment Confirmation",
      template:
        "Hi {name}! Your appointment is confirmed for {date} at {time}. Reply CONFIRM to verify or call us to reschedule.",
      variables: ["name", "date", "time"],
    },
    {
      id: "appointment_reminder",
      name: "Appointment Reminder",
      template: "Reminder: You have an appointment tomorrow at {time}. Reply YES to confirm or NO to reschedule.",
      variables: ["time"],
    },
    {
      id: "followup_missed_call",
      name: "Missed Call Follow-up",
      template: "Hi! We tried to reach you. Reply with a good time to call back or visit {website} to book online.",
      variables: ["website"],
    },
    {
      id: "thank_you",
      name: "Thank You Message",
      template: "Thank you for choosing {business}! We appreciate your business. Reply HELP for assistance anytime.",
      variables: ["business"],
    },
    {
      id: "booking_link",
      name: "Booking Link",
      template: "Book your appointment easily: {link}. Questions? Reply to this message or call us!",
      variables: ["link"],
    },
  ]

  return Response.json({ templates })
}
