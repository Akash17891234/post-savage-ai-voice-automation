import { Redis } from "@upstash/redis"

const redisUrl = process.env["UPSTASH-KV_KV_REST_API_URL"]
const redisToken = process.env["UPSTASH-KV_KV_REST_API_TOKEN"]

const memoryStore = new Map<string, any>()

let redisInstance: Redis | null = null
let isRedisAvailable = false

async function testRedisConnection(): Promise<boolean> {
  if (!redisInstance) return false
  
  try {
    // Try a simple ping operation
    await redisInstance.set("test:connection", "ok", { ex: 1 })
    await redisInstance.get("test:connection")
    return true
  } catch (error) {
    console.error("Redis connection test failed:", error)
    console.error("Disabling Redis and using memory-only storage")
    return false
  }
}

if (redisUrl && redisToken) {
  console.log("Redis URL detected:", redisUrl?.substring(0, 30) + "...")
  
  if (!redisUrl.startsWith("https://")) {
    console.error("Redis URL is invalid - must start with https://")
    isRedisAvailable = false
  } else {
    try {
      redisInstance = new Redis({
        url: redisUrl,
        token: redisToken,
      })
      console.log("Redis client created, will test on first use")
    } catch (error) {
      console.error("Redis initialization failed:", error)
      isRedisAvailable = false
    }
  }
} else {
  console.warn("Redis credentials missing. Using in-memory storage only.")
  isRedisAvailable = false
}

export const redis = redisInstance

// Data types for our voice agent system
export interface CallSession {
  id: string
  customerId: string
  customerPhone: string
  status: "active" | "completed" | "transferred" | "failed"
  startTime: string
  endTime?: string
  duration?: number
  sentiment: "positive" | "neutral" | "negative"
  intent: string
  transcript: ConversationMessage[]
  outcome?: "appointment_booked" | "transferred_to_agent" | "sms_sent" | "no_action"
  appointmentDetails?: AppointmentDetails
}

export interface ConversationMessage {
  role: "user" | "assistant"
  content: string
  timestamp: string
  sentiment?: string
  emotion?: string
}

export interface AppointmentDetails {
  date: string
  time: string
  service: string
  notes?: string
}

export interface Customer {
  id: string
  phone: string
  name?: string
  email?: string
  callHistory: string[] // Array of call session IDs
  lastContact: string
  totalCalls: number
  appointmentsBooked: number
}

export interface SMSMessage {
  id: string
  customerId: string
  customerPhone: string
  content: string
  sentAt: string
  status: "sent" | "delivered" | "failed"
  relatedCallId?: string
}

export interface FollowUpSchedule {
  id: string
  callId: string
  customerId: string
  customerPhone: string
  scenario: string
  scheduledFor: string
  status: "pending" | "sent" | "failed"
  messageContent: string
  createdAt: string
}

async function safeRedisOperation<T>(
  operation: () => Promise<T>,
  fallback: T
): Promise<T> {
  // If Redis was already marked as unavailable, skip
  if (!isRedisAvailable && redisInstance) {
    return fallback
  }
  
  // If this is the first operation, test the connection
  if (redisInstance && isRedisAvailable === false) {
    const connected = await testRedisConnection()
    if (!connected) {
      isRedisAvailable = false
      redisInstance = null
      return fallback
    }
    isRedisAvailable = true
  }
  
  if (!redisInstance || !isRedisAvailable) {
    return fallback
  }
  
  try {
    return await operation()
  } catch (error) {
    console.error("Redis operation failed, disabling Redis:", error)
    isRedisAvailable = false
    redisInstance = null
    return fallback
  }
}

export const db = {
  // Call Sessions
  async createCallSession(session: CallSession): Promise<void> {
    memoryStore.set(`call:${session.id}`, session)
    
    await safeRedisOperation(async () => {
      if (redisInstance) {
        await redisInstance.set(`call:${session.id}`, JSON.stringify(session))
        await redisInstance.zadd("calls:recent", { score: Date.now(), member: session.id })
        await redisInstance.expire(`call:${session.id}`, 60 * 60 * 24 * 30)
      }
    }, undefined)
  },

  async getCallSession(callId: string): Promise<CallSession | null> {
    const memoryData = memoryStore.get(`call:${callId}`)
    if (memoryData) return memoryData
    
    return await safeRedisOperation(async () => {
      if (redisInstance) {
        const data = await redisInstance.get(`call:${callId}`)
        if (data) {
          const parsed = typeof data === 'string' ? JSON.parse(data) : data
          return parsed as CallSession
        }
      }
      return null
    }, null)
  },

  async updateCallSession(callId: string, updates: Partial<CallSession>): Promise<void> {
    const existing = await this.getCallSession(callId)
    const updated = existing ? { ...existing, ...updates } : updates as CallSession
    
    memoryStore.set(`call:${callId}`, updated)
    
    await safeRedisOperation(async () => {
      if (redisInstance) {
        await redisInstance.set(`call:${callId}`, JSON.stringify(updated))
      }
    }, undefined)
  },

  async getRecentCalls(limit = 50): Promise<CallSession[]> {
    const redisCalls = await safeRedisOperation(async () => {
      if (redisInstance) {
        const callIds = await redisInstance.zrange("calls:recent", 0, limit - 1, { rev: true })
        const calls = await Promise.all(
          callIds.map(async (id) => {
            const call = await this.getCallSession(id as string)
            return call
          }),
        )
        return calls.filter((call): call is CallSession => call !== null)
      }
      return []
    }, [])
    
    if (redisCalls.length > 0) return redisCalls
    
    // Fallback to memory
    const memoryCalls = Array.from(memoryStore.entries())
      .filter(([key]) => key.startsWith('call:'))
      .map(([_, value]) => value as CallSession)
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
      .slice(0, limit)
    return memoryCalls
  },

  // Customers
  async createOrUpdateCustomer(customer: Customer): Promise<void> {
    memoryStore.set(`customer:${customer.id}`, customer)
    memoryStore.set(`customer:phone:${customer.phone}`, customer.id)
    
    await safeRedisOperation(async () => {
      if (redisInstance) {
        await redisInstance.set(`customer:${customer.id}`, JSON.stringify(customer))
        await redisInstance.set(`customer:phone:${customer.phone}`, customer.id)
      }
    }, undefined)
  },

  async getCustomerByPhone(phone: string): Promise<Customer | null> {
    const memoryId = memoryStore.get(`customer:phone:${phone}`)
    if (memoryId) {
      return memoryStore.get(`customer:${memoryId}`) || null
    }
    
    return await safeRedisOperation(async () => {
      if (redisInstance) {
        const customerId = await redisInstance.get(`customer:phone:${phone}`)
        if (!customerId) return null
        const data = await redisInstance.get(`customer:${customerId}`)
        return data ? (typeof data === 'string' ? JSON.parse(data) : data) as Customer : null
      }
      return null
    }, null)
  },

  async getCustomer(customerId: string): Promise<Customer | null> {
    const memoryData = memoryStore.get(`customer:${customerId}`)
    if (memoryData) return memoryData
    
    return await safeRedisOperation(async () => {
      if (redisInstance) {
        const data = await redisInstance.get(`customer:${customerId}`)
        return data ? (typeof data === 'string' ? JSON.parse(data) : data) as Customer : null
      }
      return null
    }, null)
  },

  // SMS Messages
  async createSMSMessage(message: SMSMessage): Promise<void> {
    memoryStore.set(`sms:${message.id}`, message)
    
    await safeRedisOperation(async () => {
      if (redisInstance) {
        await redisInstance.set(`sms:${message.id}`, JSON.stringify(message))
        await redisInstance.zadd("sms:recent", { score: Date.now(), member: message.id })
        await redisInstance.expire(`sms:${message.id}`, 60 * 60 * 24 * 30)
      }
    }, undefined)
  },

  async getSMSMessage(messageId: string): Promise<SMSMessage | null> {
    const memoryData = memoryStore.get(`sms:${messageId}`)
    if (memoryData) return memoryData
    
    return await safeRedisOperation(async () => {
      if (redisInstance) {
        const data = await redisInstance.get(`sms:${messageId}`)
        return data ? (typeof data === 'string' ? JSON.parse(data) : data) as SMSMessage : null
      }
      return null
    }, null)
  },

  async getRecentSMS(limit = 50): Promise<SMSMessage[]> {
    const redisSMS = await safeRedisOperation(async () => {
      if (redisInstance) {
        const messageIds = await redisInstance.zrange("sms:recent", 0, limit - 1, { rev: true })
        const messages = await Promise.all(
          messageIds.map(async (id) => {
            const message = await this.getSMSMessage(id as string)
            return message
          }),
        )
        return messages.filter((msg): msg is SMSMessage => msg !== null)
      }
      return []
    }, [])
    
    if (redisSMS.length > 0) return redisSMS
    
    // Fallback to memory
    const memorySMS = Array.from(memoryStore.entries())
      .filter(([key]) => key.startsWith('sms:'))
      .map(([_, value]) => value as SMSMessage)
      .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())
      .slice(0, limit)
    return memorySMS
  },

  // Follow-Up Schedules
  async scheduleFollowUp(followUp: FollowUpSchedule): Promise<void> {
    memoryStore.set(`followup:${followUp.id}`, followUp)
    
    await safeRedisOperation(async () => {
      if (redisInstance) {
        await redisInstance.set(`followup:${followUp.id}`, JSON.stringify(followUp))
        await redisInstance.zadd("followups:pending", { score: new Date(followUp.scheduledFor).getTime(), member: followUp.id })
        await redisInstance.expire(`followup:${followUp.id}`, 60 * 60 * 24 * 7)
      }
    }, undefined)
  },

  async getFollowUp(followUpId: string): Promise<FollowUpSchedule | null> {
    const memoryData = memoryStore.get(`followup:${followUpId}`)
    if (memoryData) return memoryData
    
    return await safeRedisOperation(async () => {
      if (redisInstance) {
        const data = await redisInstance.get(`followup:${followUpId}`)
        return data ? (typeof data === 'string' ? JSON.parse(data) : data) as FollowUpSchedule : null
      }
      return null
    }, null)
  },

  async updateFollowUpStatus(followUpId: string, status: "pending" | "sent" | "failed"): Promise<void> {
    const followUp = await this.getFollowUp(followUpId)
    if (followUp) {
      followUp.status = status
      memoryStore.set(`followup:${followUpId}`, followUp)
      
      await safeRedisOperation(async () => {
        if (redisInstance) {
          await redisInstance.set(`followup:${followUpId}`, JSON.stringify(followUp))
          if (status === "sent" || status === "failed") {
            await redisInstance.zrem("followups:pending", followUpId)
          }
        }
      }, undefined)
    }
  },

  async getPendingFollowUps(beforeTimestamp?: number): Promise<FollowUpSchedule[]> {
    const redisFollowUps = await safeRedisOperation(async () => {
      if (redisInstance) {
        const maxScore = beforeTimestamp || Date.now()
        const followUpIds = await redisInstance.zrange("followups:pending", 0, maxScore, { byScore: true })
        const followUps = await Promise.all(
          followUpIds.map(async (id) => {
            const followUp = await this.getFollowUp(id as string)
            return followUp
          }),
        )
        return followUps.filter((f): f is FollowUpSchedule => f !== null)
      }
      return []
    }, [])
    
    if (redisFollowUps.length > 0) return redisFollowUps
    
    // Fallback to memory
    const maxTimestamp = beforeTimestamp || Date.now()
    const memoryFollowUps = Array.from(memoryStore.entries())
      .filter(([key]) => key.startsWith('followup:'))
      .map(([_, value]) => value as FollowUpSchedule)
      .filter(f => f.status === 'pending' && new Date(f.scheduledFor).getTime() <= maxTimestamp)
    return memoryFollowUps
  },

  async getFollowUpsByCall(callId: string): Promise<FollowUpSchedule[]> {
    const allPending = await this.getPendingFollowUps(Date.now() + 1000 * 60 * 60 * 24 * 7)
    return allPending.filter((f) => f.callId === callId)
  },

  // Analytics
  async getCallStats(): Promise<{
    totalCalls: number
    activeCalls: number
    appointmentsBooked: number
    averageSentiment: string
  }> {
    const recentCalls = await this.getRecentCalls(100)
    const activeCalls = recentCalls.filter((call) => call.status === "active").length
    const appointmentsBooked = recentCalls.filter((call) => call.outcome === "appointment_booked").length

    const sentiments = recentCalls.map((call) => call.sentiment)
    const positiveSentiments = sentiments.filter((s) => s === "positive").length
    const averageSentiment =
      sentiments.length > 0 && positiveSentiments / sentiments.length > 0.6
        ? "positive"
        : sentiments.length > 0 && positiveSentiments / sentiments.length > 0.3
          ? "neutral"
          : "negative"

    return {
      totalCalls: recentCalls.length,
      activeCalls,
      appointmentsBooked,
      averageSentiment,
    }
  },
}
