"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  React.useEffect(() => {
    // Log the error to an error reporting service
    console.error("Assistants error:", error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] px-6 py-16 text-center">
      <div className="flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-destructive/10">
        <AlertTriangle className="w-8 h-8 text-destructive" />
      </div>
      <h1 className="mb-2 text-2xl font-bold">Something went wrong in Custom Assistants</h1>
      <p className="mb-6 text-muted-foreground">
        {error.message || "An unexpected error occurred in the Custom Assistants section"}
      </p>
      <div className="flex gap-4">
        <Button onClick={() => reset()} variant="default">
          Try again
        </Button>
        <Button onClick={() => window.location.href = "/staff-hub"} variant="outline">
          Return to Hub
        </Button>
      </div>
    </div>
  )
} 