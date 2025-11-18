"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Send, CheckCircle, XCircle, Calendar } from "lucide-react"

interface FollowUp {
  id: string
  callId: string
  customerPhone: string
  scenario: string
  scheduledFor: string
  status: "pending" | "sent" | "failed"
  messageContent: string
  createdAt: string
}

export default function FollowUpsPage() {
  const [followUps, setFollowUps] = useState<FollowUp[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    fetchFollowUps()
  }, [])

  async function fetchFollowUps() {
    try {
      const response = await fetch("/api/follow-up/list")
      if (response.ok) {
        const data = await response.json()
        setFollowUps(data.followUps || [])
      }
    } catch (error) {
      console.error("Error fetching follow-ups:", error)
    } finally {
      setLoading(false)
    }
  }

  async function sendPendingFollowUps() {
    setSending(true)
    try {
      const response = await fetch("/api/follow-up/send", {
        method: "POST",
      })
      if (response.ok) {
        const result = await response.json()
        alert(`Sent ${result.sent} follow-ups successfully!`)
        fetchFollowUps()
      }
    } catch (error) {
      console.error("Error sending follow-ups:", error)
      alert("Failed to send follow-ups")
    } finally {
      setSending(false)
    }
  }

  const pendingCount = followUps.filter((f) => f.status === "pending").length
  const sentCount = followUps.filter((f) => f.status === "sent").length

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Follow-up Messages</h1>
          <p className="text-muted-foreground">Automated SMS follow-ups after calls</p>
        </div>
        <Button onClick={sendPendingFollowUps} disabled={sending || pendingCount === 0}>
          <Send className="mr-2 h-4 w-4" />
          {sending ? "Sending..." : `Send ${pendingCount} Pending`}
        </Button>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <Clock className="h-8 w-8 text-yellow-500" />
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold">{pendingCount}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-sm text-muted-foreground">Sent</p>
              <p className="text-2xl font-bold">{sentCount}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <XCircle className="h-8 w-8 text-red-500" />
            <div>
              <p className="text-sm text-muted-foreground">Failed</p>
              <p className="text-2xl font-bold">{followUps.filter((f) => f.status === "failed").length}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="mb-4 text-xl font-semibold">Scheduled Follow-ups</h2>
        {loading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : followUps.length === 0 ? (
          <p className="text-muted-foreground">No follow-ups scheduled</p>
        ) : (
          <div className="space-y-4">
            {followUps.map((followUp) => (
              <div key={followUp.id} className="flex items-start gap-4 rounded-lg border p-4">
                <Calendar className="mt-1 h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="font-medium">{followUp.customerPhone}</span>
                    <Badge
                      variant={
                        followUp.status === "sent"
                          ? "default"
                          : followUp.status === "failed"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {followUp.status}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{followUp.scenario.replace(/_/g, " ")}</span>
                  </div>
                  <p className="mb-2 text-sm text-muted-foreground">{followUp.messageContent}</p>
                  <p className="text-xs text-muted-foreground">
                    Scheduled for: {new Date(followUp.scheduledFor).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
