"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  React.useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global error:", error)
  }, [error])

  return (
    <html>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center px-6 py-16 text-center">
          <div className="flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-destructive/10">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="mb-2 text-2xl font-bold">Critical Error</h1>
          <p className="mb-6 text-muted-foreground">
            A critical error has occurred. We're working on fixing it.
          </p>
          <div className="flex gap-4">
            <Button onClick={() => reset()} variant="default">
              Try again
            </Button>
            <Button onClick={() => window.location.href = "/"} variant="outline">
              Go to home page
            </Button>
          </div>
        </div>
      </body>
    </html>
  )
} 