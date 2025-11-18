import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Phone, ArrowLeft, Filter } from "lucide-react"
import { db } from "@/lib/redis"
import Link from "next/link"

export default async function CallsPage() {
  const calls = await db.getRecentCalls(100)

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">All Calls</h1>
            <p className="text-muted-foreground">View and manage all customer calls</p>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{calls.length} Total Calls</Badge>
            <Badge variant="default">{calls.filter((c) => c.status === "active").length} Active</Badge>
          </div>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>

        <div className="space-y-4">
          {calls.length === 0 ? (
            <Card className="p-12">
              <div className="text-center text-muted-foreground">
                <Phone className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No calls yet</h3>
                <p>Calls will appear here once customers start calling</p>
              </div>
            </Card>
          ) : (
            calls.map((call) => (
              <Card key={call.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Phone className="w-5 h-5 text-primary" />
                      <span className="text-lg font-semibold">{call.customerPhone}</span>
                      <Badge
                        variant={
                          call.status === "completed"
                            ? "default"
                            : call.status === "active"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {call.status}
                      </Badge>
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

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Start Time</p>
                        <p className="text-sm font-medium">{new Date(call.startTime).toLocaleString()}</p>
                      </div>
                      {call.duration && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Duration</p>
                          <p className="text-sm font-medium">
                            {Math.floor(call.duration / 60)}m {call.duration % 60}s
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Intent</p>
                        <p className="text-sm font-medium capitalize">{call.intent}</p>
                      </div>
                      {call.outcome && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Outcome</p>
                          <p className="text-sm font-medium capitalize">{call.outcome.replace(/_/g, " ")}</p>
                        </div>
                      )}
                    </div>

                    {call.appointmentDetails && (
                      <div className="bg-muted p-3 rounded-lg mb-4">
                        <p className="text-sm font-semibold mb-2">Appointment Booked</p>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Date:</span> {call.appointmentDetails.date}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Time:</span> {call.appointmentDetails.time}
                          </div>
                          <div className="col-span-2">
                            <span className="text-muted-foreground">Service:</span> {call.appointmentDetails.service}
                          </div>
                        </div>
                      </div>
                    )}

                    {call.transcript && call.transcript.length > 0 && (
                      <div className="border-t pt-4">
                        <p className="text-sm font-semibold mb-2">Conversation Transcript</p>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {call.transcript.map((msg, idx) => (
                            <div
                              key={idx}
                              className={`text-sm p-2 rounded ${
                                msg.role === "assistant" ? "bg-primary/10 ml-4" : "bg-muted mr-4"
                              }`}
                            >
                              <span className="font-medium">{msg.role === "assistant" ? "AI Agent" : "Customer"}:</span>{" "}
                              {msg.content}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
