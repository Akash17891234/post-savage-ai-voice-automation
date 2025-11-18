import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Phone, Calendar, ArrowLeft } from "lucide-react"
import { db } from "@/lib/redis"
import Link from "next/link"

export default async function CustomersPage() {
  const calls = await db.getRecentCalls(100)

  // Group calls by customer phone to create customer list
  const customerMap = new Map()

  for (const call of calls) {
    if (!customerMap.has(call.customerPhone)) {
      customerMap.set(call.customerPhone, {
        phone: call.customerPhone,
        customerId: call.customerId,
        totalCalls: 0,
        lastContact: call.startTime,
        appointmentsBooked: 0,
        averageSentiment: [] as string[],
      })
    }

    const customer = customerMap.get(call.customerPhone)
    customer.totalCalls++
    customer.averageSentiment.push(call.sentiment)

    if (call.outcome === "appointment_booked") {
      customer.appointmentsBooked++
    }

    if (new Date(call.startTime) > new Date(customer.lastContact)) {
      customer.lastContact = call.startTime
    }
  }

  const customers = Array.from(customerMap.values())

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
            <h1 className="text-3xl font-bold">Customers</h1>
            <p className="text-muted-foreground">Manage your customer contacts and history</p>
          </div>
        </div>

        <div className="mb-6">
          <Badge variant="secondary">{customers.length} Total Customers</Badge>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {customers.length === 0 ? (
            <Card className="p-12 col-span-full">
              <div className="text-center text-muted-foreground">
                <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No customers yet</h3>
                <p>Customers will appear here after their first call</p>
              </div>
            </Card>
          ) : (
            customers.map((customer) => {
              const positiveSentiments = customer.averageSentiment.filter((s: string) => s === "positive").length
              const sentimentScore = positiveSentiments / customer.averageSentiment.length
              const overallSentiment = sentimentScore > 0.6 ? "positive" : sentimentScore > 0.3 ? "neutral" : "negative"

              return (
                <Card key={customer.phone} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">{customer.phone}</p>
                        <p className="text-xs text-muted-foreground">ID: {customer.customerId.slice(0, 8)}...</p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        overallSentiment === "positive"
                          ? "default"
                          : overallSentiment === "negative"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {overallSentiment}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        Total Calls
                      </span>
                      <span className="font-medium">{customer.totalCalls}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Appointments
                      </span>
                      <span className="font-medium">{customer.appointmentsBooked}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Last Contact</span>
                      <span className="font-medium text-xs">{new Date(customer.lastContact).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t">
                    <Link href={`/dashboard/calls`}>
                      <Button variant="outline" size="sm" className="w-full bg-transparent">
                        View Call History
                      </Button>
                    </Link>
                  </div>
                </Card>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
