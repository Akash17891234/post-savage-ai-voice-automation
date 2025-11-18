"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MessageSquare, Sparkles, Send } from "lucide-react"

interface SMSComposerProps {
  customerPhone?: string
  callId?: string
  onSent?: (messageId: string) => void
}

export function SMSComposer({ customerPhone, callId, onSent }: SMSComposerProps) {
  const [phone, setPhone] = useState(customerPhone || "")
  const [message, setMessage] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSending, setIsSending] = useState(false)

  const generateMessage = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch("/api/sms/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          callId,
          messageType: "general_followup",
        }),
      })

      const data = await response.json()
      setMessage(data.message)
    } catch (error) {
      console.error("[v0] Failed to generate message:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const sendMessage = async () => {
    if (!phone || !message) return

    setIsSending(true)
    try {
      const response = await fetch("/api/sms/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerPhone: phone,
          callId,
          customMessage: message,
        }),
      })

      const data = await response.json()
      if (data.success) {
        onSent?.(data.messageId)
        setMessage("")
      }
    } catch (error) {
      console.error("[v0] Failed to send message:", error)
    } finally {
      setIsSending(false)
    }
  }

  const characterCount = message.length
  const isOverLimit = characterCount > 160

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Send SMS</h3>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="phone">Customer Phone</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+1234567890"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={!!customerPhone}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <Label htmlFor="message">Message</Label>
            <Button variant="ghost" size="sm" onClick={generateMessage} disabled={isGenerating}>
              <Sparkles className="w-4 h-4 mr-1" />
              {isGenerating ? "Generating..." : "AI Generate"}
            </Button>
          </div>
          <Textarea
            id="message"
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className={isOverLimit ? "border-destructive" : ""}
          />
          <p className={`text-sm mt-1 ${isOverLimit ? "text-destructive" : "text-muted-foreground"}`}>
            {characterCount}/160 characters
          </p>
        </div>

        <Button onClick={sendMessage} disabled={!phone || !message || isOverLimit || isSending} className="w-full">
          <Send className="w-4 h-4 mr-2" />
          {isSending ? "Sending..." : "Send SMS"}
        </Button>
      </div>
    </Card>
  )
}
