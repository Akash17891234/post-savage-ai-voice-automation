import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Phone, Clock } from 'lucide-react'
import { db } from "@/lib/redis"
import Link from "next/link"

export async function RecentCalls() {
  const calls = await db.getRecentCalls(10)

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Phone className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold">Recent Calls</h2>
        </div>
        <Link href="/dashboard/calls" className="text-sm text-primary hover:underline">
          View All
        </Link>
      </div>

      <div className="space-y-4">
        {calls.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Phone className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No calls yet</p>
            <p className="text-xs mt-1">Call +1 (978) 643-8223 to test</p>
          </div>
        ) : (
          calls.map((call) => {
            const customerName = (call as any).customerName
            const appointmentDetails = call.appointmentDetails
            
            return (
              <div key={call.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">
                      {call.customerPhone}
                      {customerName && <span className="text-muted-foreground"> - {customerName}</span>}
                    </span>
                    <Badge
                      variant={
                        call.status === "completed" ? "default" : call.status === "active" ? "secondary" : "destructive"
                      }
                    >
                      {call.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(call.startTime).toLocaleString()}
                    </span>
                    {call.duration && (
                      <span>
                        {Math.floor(call.duration / 60)}m {call.duration % 60}s
                      </span>
                    )}
                  </div>
                  {appointmentDetails && appointmentDetails.date && appointmentDetails.time && (
                    <div className="mt-2 text-sm">
                      <span className="text-green-600 font-medium">✓ Appointment: </span>
                      <span className="text-muted-foreground">
                        {appointmentDetails.date} at {appointmentDetails.time}
                      </span>
                    </div>
                  )}
                  {call.outcome && (
                    <p className="text-sm text-muted-foreground mt-1 capitalize">{call.outcome.replace("_", " ")}</p>
                  )}
                </div>
                <Badge
                  variant={
                    call.sentiment === "positive"
                      ? "default"
                      : call.sentiment === "negative"
                        ? "destructive"
                        : "secondary"
                  }
                >
                  {call.sentiment}
                </Badge>
              </div>
            )
          })
        )}
      </div>
    </Card>
  )
}
