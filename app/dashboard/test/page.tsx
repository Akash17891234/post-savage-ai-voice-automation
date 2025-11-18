import { VoiceChatInterface } from "@/components/voice-chat-interface"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function TestPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40 py-4">
        <div className="container mx-auto px-4">
          <Button variant="ghost" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Test Voice Agent</h1>
            <p className="text-muted-foreground">
              Simulate a customer call to test your AI voice agent's responses and behavior
            </p>
          </div>

          <VoiceChatInterface customerPhone="+1234567890" />

          <Card className="mt-6 p-6 bg-muted/50">
            <h3 className="font-semibold mb-2">Testing Tips</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                • Try different conversation scenarios: booking appointments, asking questions, expressing frustration
              </li>
              <li>• Test the emotional intelligence by using positive, neutral, and negative language</li>
              <li>• Request to speak with a human agent to test the transfer functionality</li>
              <li>• Ask for SMS follow-ups to test the messaging system</li>
            </ul>
          </Card>
        </div>
      </main>
    </div>
  )
}
