import { Card } from "@/components/ui/card"
import { Phone, CheckCircle, TrendingUp, Clock } from "lucide-react"
import { db } from "@/lib/redis"

export async function DashboardStats() {
  const stats = await db.getCallStats()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-2">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Phone className="w-5 h-5 text-primary" />
          </div>
          <span className="text-sm text-muted-foreground">Total</span>
        </div>
        <div className="text-3xl font-bold mb-1">{stats.totalCalls}</div>
        <p className="text-sm text-muted-foreground">Total Calls</p>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-2">
          <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>
          <span className="text-sm text-muted-foreground">Booked</span>
        </div>
        <div className="text-3xl font-bold mb-1">{stats.appointmentsBooked}</div>
        <p className="text-sm text-muted-foreground">Appointments Booked</p>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-2">
          <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
            <Clock className="w-5 h-5 text-blue-500" />
          </div>
          <span className="text-sm text-muted-foreground">Active</span>
        </div>
        <div className="text-3xl font-bold mb-1">{stats.activeCalls}</div>
        <p className="text-sm text-muted-foreground">Active Calls</p>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-2">
          <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-purple-500" />
          </div>
          <span className="text-sm text-muted-foreground">Sentiment</span>
        </div>
        <div className="text-3xl font-bold mb-1 capitalize">{stats.averageSentiment}</div>
        <p className="text-sm text-muted-foreground">Average Sentiment</p>
      </Card>
    </div>
  )
}
