"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChatProvider } from "@/contexts/chat-context"
import { ChatContainer } from "@/components/chat/chat-container"

export default function TestStructuredPage() {
  const [query, setQuery] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    
    setIsLoading(true)
    
    try {
      // Redirect to the chat page with a predefined query
      window.location.href = `/chat?query=${encodeURIComponent(query)}`
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <main className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Test Structured Outputs</h1>
        <p className="text-muted-foreground">
          Try asking about AI concepts to see structured explanations
        </p>
      </div>
      
      <div className="grid gap-6">
        <div className="rounded-lg border p-4">
          <h2 className="text-xl font-semibold mb-2">Example Queries</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>What is a large language model?</li>
            <li>Explain the concept of attention mechanism in transformers</li>
            <li>What is retrieval augmented generation? Include code examples</li>
            <li>Explain vector databases for advanced users</li>
            <li>What is the Model Context Protocol (MCP)?</li>
          </ul>
        </div>
        
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask about an AI concept..."
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Loading..." : "Ask"}
          </Button>
        </form>
        
        <div className="bg-background rounded-lg border shadow h-[calc(100vh-24rem)]">
          <ChatProvider>
            <ChatContainer />
          </ChatProvider>
        </div>
      </div>
    </main>
  )
} 