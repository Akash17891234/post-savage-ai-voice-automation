# PostSavage.ai - AI Voice Automation Platform

**Developer:** Akash Krishna 
**Live Demo:** [https://postsavageagenticai.vercel.app](https://postsavageagenticai.vercel.app)

---

## 📋 Project Overview

PostSavage.ai is an intelligent voice automation platform designed to revolutionize customer interactions for appointment-based businesses. The system uses advanced AI to handle inbound phone calls, book appointments, send SMS confirmations, and provide comprehensive analytics through a real-time dashboard.

This project demonstrates the integration of telephony, AI language models, SMS messaging, and full-stack web development to create a production-ready business solution.

---

## 🎯 Key Features

### Voice AI Agent
- **Natural Conversations** - AI agent handles phone calls with human-like voice quality
- **Appointment Booking** - Collects customer name, preferred date, and time through conversational flow
- **Intelligent Transfer** - Automatically escalates to live agents when needed
- **Emotion Detection** - Analyzes customer sentiment in real-time

### SMS Automation
- **Instant Confirmations** - Sends appointment details via SMS immediately after booking
- **Follow-up Sequences** - Automated follow-up messages based on call outcomes
- **Two-way Messaging** - Handles incoming SMS responses

### Admin Dashboard
- **Real-time Analytics** - Monitor calls, bookings, and customer interactions
- **Call History** - Complete transcripts and sentiment analysis
- **Customer Management** - Track customer interaction history
- **SMS Logs** - View all sent and received messages

---

## 🛠️ Technology Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **React 19** - Latest React with Server Components
- **TypeScript** - Type-safe development
- **Tailwind CSS v4** - Modern utility-first styling
- **shadcn/ui** - High-quality component library

### Backend
- **Next.js API Routes** - Serverless backend functions
- **Vercel AI SDK** - AI model integration
- **Twilio** - Voice calls and SMS messaging
- **Upstash Redis** - Real-time data storage

### AI & Voice
- **Vercel AI Gateway** - AI model routing and management
- **Amazon Polly Neural Voices** - Natural text-to-speech
- **Twilio Speech Recognition** - Speech-to-text with phone call optimizations

---

## 📦 Installation

### Prerequisites
- Node.js 18+ installed
- Twilio account with phone number
- Upstash Redis database (optional)

### Setup Steps

1. **Clone the repository**
\`\`\`bash
git clone https://github.com/Akash17891234/Post-savage-ai-voice-automation.git
cd Post-savage-ai-voice-automation
\`\`\`

2. **Install dependencies**
\`\`\`bash
npm install
\`\`\`

3. **Configure environment variables**

Create a `.env.local` file:

\`\`\`env
# Twilio Configuration
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+19786438223

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Redis (Optional)
UPSTASH-KV_KV_REST_API_URL=your_redis_url
UPSTASH-KV_KV_REST_API_TOKEN=your_redis_token
\`\`\`

4. **Run development server**
\`\`\`bash
npm run dev
\`\`\`

5. **Configure Twilio webhook**

Go to your Twilio console and set the voice webhook URL to:
\`\`\`
https://your-domain.com/api/phone/incoming
\`\`\`

---

## 🚀 Usage

### Making a Test Call

1. Call your Twilio phone number: **+1 (978) 643-8223**
2. The AI agent will greet you and ask how it can help
3. Say "I'd like to book an appointment"
4. Provide your name, preferred date, and specific time
5. Receive SMS confirmation with appointment details

### Accessing the Dashboard

Visit the admin dashboard at `/dashboard` to view:
- Total calls and booking statistics
- Recent call history with transcripts
- Customer list with interaction history
- SMS message logs
- Scheduled follow-ups

---

## 🏗️ Project Architecture

\`\`\`
├── app/
│   ├── api/              # API routes
│   │   ├── phone/        # Twilio voice endpoints
│   │   ├── follow-up/    # SMS automation
│   │   └── dashboard/    # Dashboard data API
│   ├── dashboard/        # Admin dashboard pages
│   └── page.tsx          # Landing page
├── components/           # React components
│   ├── ui/              # shadcn/ui components
│   └── *.tsx            # Custom components
├── lib/
│   ├── redis.ts         # Database operations
│   ├── twilio.ts        # Twilio utilities
│   ├── types.ts         # TypeScript definitions
│   └── follow-up-templates.ts  # SMS templates
└── public/              # Static assets
\`\`\`

---

## 🔧 Key Implementation Details

### Voice Call Flow
1. Incoming call triggers `/api/phone/incoming`
2. AI generates greeting using Vercel AI SDK
3. Twilio captures speech and sends to `/api/phone/process-speech`
4. AI analyzes input, extracts appointment data
5. System validates and stores information
6. Sends SMS confirmation via Twilio

### Data Management
- In-memory storage for active call sessions
- Redis for persistent data (optional)
- Automatic fallback when database unavailable

### AI Integration
- Uses `generateText` from Vercel AI SDK
- Custom prompts for appointment booking context
- Aggressive data extraction from natural language

---

## 📊 Features Demonstration

### Conversation Example
\`\`\`
AI: "Hello! Thank you for calling PostSavage. I'm your AI assistant. How can I help you today?"
Customer: "I'd like to book an appointment"
AI: "I'd be happy to help you book an appointment! May I have your name please?"
Customer: "It's John Smith"
AI: "Thank you, John! What date would work best for you?"
Customer: "Next Monday"
AI: "Great! And what specific time works for you?"
Customer: "2 PM"
AI: "Perfect! I've booked your appointment for Monday at 2:00 PM. You'll receive a confirmation via text message shortly. Is there anything else I can help you with?"
\`\`\`

---

## 🐛 Troubleshooting

### Common Issues

**Voice agent says "technical difficulties"**
- Verify Twilio webhook URL is correct
- Check environment variables are set
- Ensure `NEXT_PUBLIC_APP_URL` is configured

**Dashboard shows no data**
- Redis connection may be failing (system uses in-memory fallback)
- Check browser console for errors
- Refresh after making a test call

**AI doesn't understand speech**
- Speak clearly and wait for prompt
- Use specific times (e.g., "2 PM" not "afternoon")
- Check Twilio account balance

---

## 🚀 Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Import repository in Vercel dashboard
3. Add environment variables in Vercel project settings
4. Deploy
5. Update Twilio webhook to production URL

---

## 📈 Future Enhancements

- Multi-language support
- Calendar integration (Google Calendar, Outlook)
- Appointment reminders (24hr, 1hr before)
- SMS-based rescheduling
- Voice cloning for brand consistency
- CRM integrations (Salesforce, HubSpot)
- Advanced analytics and reporting

---

## 👤 About the Developer

**Akash Krishna**  
Final Year Internship Project

This project showcases full-stack development skills including:
- AI/ML integration
- Real-time telephony systems
- RESTful API design
- Modern React development
- Database architecture
- Production deployment

---

## 📝 License

This project is developed as part of an educational internship program.

---

## 🙏 Acknowledgments

Special thanks to my internship mentor and the team for their guidance and support throughout this project.

---

**Built with:** Next.js, TypeScript, Twilio, Vercel AI SDK, and Tailwind CSS
