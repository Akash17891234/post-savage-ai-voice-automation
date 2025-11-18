import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageSquare } from "lucide-react"
import { db } from "@/lib/redis"
import Link from "next/link"

export async function RecentSMS() {
  const messages = await db.getRecentSMS(10)

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold">Recent SMS</h2>
        </div>
        <Link href="/dashboard/sms" className="text-sm text-primary hover:underline">
          View All
        </Link>
      </div>

      <div className="space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No messages yet</p>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className="p-4 border border-border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{message.customerPhone}</span>
                <Badge
                  variant={
                    message.status === "sent" ? "default" : message.status === "delivered" ? "secondary" : "destructive"
                  }
                >
                  {message.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{message.content}</p>
              <p className="text-xs text-muted-foreground">{new Date(message.sentAt).toLocaleString()}</p>
            </div>
          ))
        )}
      </div>
    </Card>
  )
}
