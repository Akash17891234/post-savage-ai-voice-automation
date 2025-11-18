import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MessageSquare, ArrowLeft, Plus, Phone } from "lucide-react"
import { db } from "@/lib/redis"
import Link from "next/link"

export default async function SMSPage() {
  const messages = await db.getRecentSMS(100)

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">SMS Messages</h1>
            <p className="text-muted-foreground">View and manage all SMS communications</p>
          </div>
          <Link href="/dashboard/sms/compose">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Compose SMS
            </Button>
          </Link>
        </div>

        <div className="mb-6">
          <Badge variant="secondary">{messages.length} Total Messages</Badge>
        </div>

        <div className="space-y-4">
          {messages.length === 0 ? (
            <Card className="p-12">
              <div className="text-center text-muted-foreground">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No messages yet</h3>
                <p className="mb-4">Start sending SMS messages to your customers</p>
                <Link href="/dashboard/sms/compose">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Send First Message
                  </Button>
                </Link>
              </div>
            </Card>
          ) : (
            messages.map((message) => (
              <Card key={message.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-semibold">{message.customerPhone}</p>
                      <p className="text-xs text-muted-foreground">{new Date(message.sentAt).toLocaleString()}</p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      message.status === "delivered"
                        ? "default"
                        : message.status === "sent"
                          ? "secondary"
                          : "destructive"
                    }
                  >
                    {message.status}
                  </Badge>
                </div>

                <div className="bg-muted p-4 rounded-lg mb-4">
                  <p className="text-sm">{message.content}</p>
                </div>

                {message.relatedCallId && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    <span>Related to call: {message.relatedCallId.slice(0, 8)}...</span>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
