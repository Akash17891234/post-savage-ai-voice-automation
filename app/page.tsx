import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Phone, MessageSquare, Users, Zap, TrendingUp, Clock } from "lucide-react"

export default function HomePage() {
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
            <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors">
              Features
            </Link>
            <Link href="#how-it-works" className="text-sm font-medium hover:text-primary transition-colors">
              How It Works
            </Link>
            <Link href="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">
              Dashboard
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/dashboard">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            AI-Powered Voice Automation
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance">
            Turn Every Call Into a <span className="text-primary">Booked Appointment</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 text-pretty max-w-2xl mx-auto">
            Domain-specific, emotionally-intelligent AI agents that handle inbound and outbound calls with
            human-realistic voice. Increase bookings, reduce costs, and never miss an opportunity.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/dashboard">Start Free Trial</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#how-it-works">See How It Works</Link>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-6">No credit card required • Setup in 5 minutes</p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-primary mb-2">3x</div>
            <div className="text-sm text-muted-foreground">More Appointments Booked</div>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-primary mb-2">60%</div>
            <div className="text-sm text-muted-foreground">Lower Cost Per Acquisition</div>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-primary mb-2">24/7</div>
            <div className="text-sm text-muted-foreground">Always Available</div>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Intelligent Voice AI That Actually Works</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Built specifically for revenue teams who need to maximize every customer interaction
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Card className="p-6">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Phone className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Real-Time Voice AI</h3>
            <p className="text-muted-foreground">
              Human-realistic voice responses that adapt to customer emotions and context in real-time
            </p>
          </Card>
          <Card className="p-6">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <MessageSquare className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Smart SMS Follow-ups</h3>
            <p className="text-muted-foreground">
              AI-generated text messages sent automatically based on conversation context and customer needs
            </p>
          </Card>
          <Card className="p-6">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Intelligent Routing</h3>
            <p className="text-muted-foreground">
              Seamlessly transfer complex calls to live agents when needed, with full context
            </p>
          </Card>
          <Card className="p-6">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Domain-Specific Training</h3>
            <p className="text-muted-foreground">
              Trained on your business data and industry knowledge for accurate, relevant responses
            </p>
          </Card>
          <Card className="p-6">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Emotional Intelligence</h3>
            <p className="text-muted-foreground">
              Detects customer sentiment and adjusts tone, pace, and approach accordingly
            </p>
          </Card>
          <Card className="p-6">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Instant Response</h3>
            <p className="text-muted-foreground">
              No wait times, no hold music. Every call is answered immediately with personalized service
            </p>
          </Card>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="container mx-auto px-4 py-20 bg-muted/30">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How PostSavage.ai Works</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Simple setup, powerful results</p>
        </div>
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              1
            </div>
            <h3 className="text-xl font-semibold mb-2">Configure Your Agent</h3>
            <p className="text-muted-foreground">
              Train the AI on your business, services, and appointment types in minutes
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              2
            </div>
            <h3 className="text-xl font-semibold mb-2">Connect Your Phone</h3>
            <p className="text-muted-foreground">
              Forward your business line or get a new number. Setup takes less than 5 minutes
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              3
            </div>
            <h3 className="text-xl font-semibold mb-2">Watch Bookings Grow</h3>
            <p className="text-muted-foreground">
              AI handles calls 24/7, books appointments, and sends follow-ups automatically
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="p-12 text-center bg-primary text-primary-foreground">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Your Call Handling?</h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Join revenue teams who are booking more appointments and reducing costs with AI voice automation
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/dashboard">Start Your Free Trial</Link>
          </Button>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                <Phone className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">PostSavage.ai</span>
            </div>
            <p className="text-sm text-muted-foreground">© 2025 PostSavage.ai. Voice automation for revenue teams.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
