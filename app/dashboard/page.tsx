import { Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Phone, MessageSquare, Users, Settings, Send } from "lucide-react"
import { DashboardStats } from "@/components/dashboard-stats"
import { RecentCalls } from "@/components/recent-calls"
import { RecentSMS } from "@/components/recent-sms"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Phone className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">PostSavage.ai</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/dashboard" className="text-sm font-medium text-primary">
              Dashboard
            </Link>
            <Link href="/dashboard/calls" className="text-sm font-medium hover:text-primary transition-colors">
              Calls
            </Link>
            <Link href="/dashboard/customers" className="text-sm font-medium hover:text-primary transition-colors">
              Customers
            </Link>
            <Link href="/dashboard/sms" className="text-sm font-medium hover:text-primary transition-colors">
              SMS
            </Link>
            <Link href="/dashboard/follow-ups" className="text-sm font-medium hover:text-primary transition-colors">
              Follow-ups
            </Link>
          </nav>
          <Button variant="outline" size="icon">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Monitor your AI voice agent performance and customer interactions</p>
        </div>

        {/* Stats */}
        <Suspense fallback={<StatsLoading />}>
          <DashboardStats />
        </Suspense>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Phone className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Test Voice Agent</h3>
                <p className="text-sm text-muted-foreground">Try the AI agent</p>
              </div>
              <Button asChild>
                <Link href="/dashboard/test">Test</Link>
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Send SMS</h3>
                <p className="text-sm text-muted-foreground">Message customers</p>
              </div>
              <Button asChild>
                <Link href="/dashboard/sms/compose">Send</Link>
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">View Customers</h3>
                <p className="text-sm text-muted-foreground">Manage contacts</p>
              </div>
              <Button asChild>
                <Link href="/dashboard/customers">View</Link>
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Send className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Follow-ups</h3>
                <p className="text-sm text-muted-foreground">Automated SMS</p>
              </div>
              <Button asChild>
                <Link href="/dashboard/follow-ups">View</Link>
              </Button>
            </div>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Suspense fallback={<ActivityLoading />}>
            <RecentCalls />
          </Suspense>
          <Suspense fallback={<ActivityLoading />}>
            <RecentSMS />
          </Suspense>
        </div>
      </main>
    </div>
  )
}

function StatsLoading() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="p-6">
          <div className="h-20 animate-pulse bg-muted rounded" />
        </Card>
      ))}
    </div>
  )
}

function ActivityLoading() {
  return (
    <Card className="p-6">
      <div className="h-96 animate-pulse bg-muted rounded" />
    </Card>
  )
}
