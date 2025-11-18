# PostSavage.ai Voice Automation - Setup Guide

## Overview
Complete setup guide for deploying the PostSavage.ai voice automation system.

## Prerequisites
- Node.js 18+ installed
- Twilio account with phone number
- Upstash Redis account
- Vercel account (for deployment)

## Installation Steps

### 1. Clone and Install
\`\`\`bash
git clone https://github.com/yourusername/postsavage-ai-voice-automation.git
cd postsavage-ai-voice-automation
npm install
\`\`\`

### 2. Environment Variables
Create `.env.local` file:
\`\`\`env
# Twilio Configuration
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+19786438223

# Redis Configuration (Upstash)
UPSTASH-KV_KV_REST_API_URL=your_redis_url
UPSTASH-KV_KV_REST_API_TOKEN=your_redis_token

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
\`\`\`

### 3. Twilio Webhook Configuration
In Twilio Console, configure your phone number webhooks:

**Voice & Fax → Configure**
- A call comes in: `https://your-domain.com/api/phone/incoming` (HTTP POST)
- Call status changes: `https://your-domain.com/api/phone/status` (HTTP POST)

**Messaging**
- A message comes in: `https://your-domain.com/api/sms/incoming` (HTTP POST)

### 4. Run Development Server
\`\`\`bash
npm run dev
\`\`\`

Visit http://localhost:3000/dashboard to access the admin dashboard.

## Features

### Voice Agent
- Intelligent appointment booking
- Natural conversation flow
- Real-time sentiment analysis
- Seamless transfer to live agents

### SMS Automation
- Appointment confirmations
- Automated follow-up sequences
- Two-way SMS conversations
- Custom message templates

### Dashboard
- Real-time call monitoring
- Customer interaction history
- SMS message tracking
- Analytics and reporting

## Deployment

### Deploy to Vercel
\`\`\`bash
npm install -g vercel
vercel deploy --prod
\`\`\`

After deployment, update your Twilio webhooks to use the production URL.

## Troubleshooting

### Calls Not Working
- Verify Twilio credentials in environment variables
- Check webhook URLs are correct and accessible
- Ensure NEXT_PUBLIC_APP_URL is set to your domain

### Dashboard Not Showing Data
- Verify Redis connection with debug endpoint: `/api/debug/redis-check`
- Check browser console for errors
- Ensure environment variables are set correctly

### SMS Not Sending
- Verify Twilio phone number supports SMS
- Check TWILIO_PHONE_NUMBER format: +1XXXXXXXXXX
- Review Twilio logs for delivery status

## Architecture

### Tech Stack
- **Frontend**: Next.js 16, React 19, Tailwind CSS
- **Backend**: Next.js API Routes, Vercel AI SDK
- **Database**: Upstash Redis
- **Telephony**: Twilio Voice & SMS
- **Deployment**: Vercel

### Project Structure
\`\`\`
├── app/
│   ├── api/              # API routes
│   │   ├── phone/        # Voice call handlers
│   │   ├── sms/          # SMS handlers
│   │   └── follow-up/    # Follow-up automation
│   └── dashboard/        # Admin dashboard
├── components/           # React components
├── lib/                  # Utility functions
│   ├── redis.ts          # Database operations
│   └── twilio.ts         # Twilio integration
└── docs/                 # Documentation
\`\`\`

## Best Practices

### Security
- Never commit `.env.local` to git
- Use environment variables for all secrets
- Validate Twilio webhook signatures in production

### Performance
- Redis operations have in-memory fallbacks
- Async SMS sending prevents call blocking
- Efficient transcript storage with pagination

### Monitoring
- Check Vercel logs for errors
- Monitor Twilio usage and costs
- Track appointment booking conversion rates

## Support

For issues or questions, please open an issue on GitHub.

---

**Built by Akash Krishna**
**Project:** PostSavage.ai Voice Automation
**License:** MIT
\`\`\`
