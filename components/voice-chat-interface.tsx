"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Phone, PhoneOff, Send, Mic, MicOff } from "lucide-react"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
}

interface VoiceChatInterfaceProps {
  customerPhone: string
  onCallEnd?: (callId: string) => void
}

export function VoiceChatInterface({ customerPhone, onCallEnd }: VoiceChatInterfaceProps) {
  const [callId, setCallId] = useState<string>("")
  const [isCallActive, setIsCallActive] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const startCall = () => {
    setIsCallActive(true)
    const newCallId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    setCallId(newCallId)
    setMessages([])
  }

  const endCall = async () => {
    if (callId) {
      try {
        await fetch("/api/voice-agent/end-call", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ callId }),
        })
        onCallEnd?.(callId)
      } catch (error) {
        console.error("[v0] Failed to end call:", error)
      }
    }
    setIsCallActive(false)
    setCallId("")
  }

  const transferToAgent = async () => {
    if (callId) {
      try {
        await fetch("/api/voice-agent/transfer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ callId, reason: "Customer requested human agent" }),
        })

        const transferMessage: Message = {
          id: `msg_${Date.now()}`,
          role: "assistant",
          content: "Transferring you to a live agent. Please hold...",
          timestamp: Date.now(),
        }
        setMessages((prev) => [...prev, transferMessage])
      } catch (error) {
        console.error("[v0] Failed to transfer call:", error)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !isCallActive || isMuted) return

    const userMessage: Message = {
      id: `msg_${Date.now()}_user`,
      role: "user",
      content: input,
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/voice-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          customerPhone,
          callId,
        }),
      })

      if (!response.ok) throw new Error("Failed to get response")

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let assistantContent = ""

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split("\n")

          for (const line of lines) {
            if (line.startsWith("0:")) {
              try {
                const content = line.slice(2).trim()
                if (content) {
                  assistantContent += content
                }
              } catch (e) {
                console.error("[v0] Error parsing chunk:", e)
              }
            }
          }
        }
      }

      const assistantMessage: Message = {
        id: `msg_${Date.now()}_assistant`,
        role: "assistant",
        content: assistantContent || "I'm here to help. How can I assist you?",
        timestamp: Date.now(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("[v0] Error sending message:", error)
      const errorMessage: Message = {
        id: `msg_${Date.now()}_error`,
        role: "assistant",
        content: "I apologize, but I'm having trouble responding right now. Please try again.",
        timestamp: Date.now(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">Voice Agent Interface</h3>
          <p className="text-sm text-muted-foreground">Customer: {customerPhone}</p>
        </div>
        <div className="flex items-center gap-2">
          {isCallActive && (
            <>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsMuted(!isMuted)}
                className={cn(isMuted && "bg-destructive text-destructive-foreground")}
              >
                {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>
              <Button variant="outline" onClick={transferToAgent}>
                Transfer to Agent
              </Button>
            </>
          )}
          {isCallActive ? (
            <Button variant="destructive" onClick={endCall}>
              <PhoneOff className="w-4 h-4 mr-2" />
              End Call
            </Button>
          ) : (
            <Button onClick={startCall}>
              <Phone className="w-4 h-4 mr-2" />
              Start Call
            </Button>
          )}
        </div>
      </div>

      {isCallActive && (
        <>
          <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                <Phone className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Call started. Waiting for customer...</p>
              </div>
            )}
            {messages.map((message) => (
              <div key={message.id} className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[80%] rounded-lg px-4 py-2",
                    message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted",
                  )}
                >
                  <p className="text-sm">{message.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg px-4 py-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type customer message..."
              disabled={!isCallActive || isMuted}
            />
            <Button type="submit" disabled={!isCallActive || isMuted || !input.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </>
      )}
    </Card>
  )
}
