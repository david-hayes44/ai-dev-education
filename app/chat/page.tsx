"use client"

import { Suspense } from "react"
import { ChatClient } from "@/components/chat/chat-client"
import { ChatProvider } from "@/contexts/chat-context"
import { ChatClientLayout } from "./client-layout"

export default function ChatPage() {
  return (
    <ChatClientLayout>
      <main className="container mx-auto py-6 px-4 md:px-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Chat Playground</h1>
          <p className="text-muted-foreground">
            Experiment with different models and settings for AI-assisted development
          </p>
        </div>
        
        <Suspense fallback={<div className="text-center p-12">Loading chat interface...</div>}>
          <ChatProvider>
            <ChatClient />
          </ChatProvider>
        </Suspense>
      </main>
    </ChatClientLayout>
  )
} 