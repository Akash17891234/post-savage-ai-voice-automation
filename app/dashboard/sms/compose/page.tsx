import { SMSComposer } from "@/components/sms-composer"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ComposeSMSPage() {
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
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Compose SMS</h1>
            <p className="text-muted-foreground">Send a message to your customers or use AI to generate one</p>
          </div>

          <SMSComposer />

          <Card className="mt-6 p-6 bg-muted/50">
            <h3 className="font-semibold mb-2">SMS Best Practices</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Keep messages under 160 characters to avoid splitting</li>
              <li>• Include a clear call-to-action</li>
              <li>• Personalize with customer name when possible</li>
              <li>• Use AI generation for context-aware follow-ups</li>
              <li>• Always provide opt-out instructions for marketing messages</li>
            </ul>
          </Card>
        </div>
      </main>
    </div>
  )
}
