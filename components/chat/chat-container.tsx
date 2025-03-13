"use client"

import * as React from "react"
import { useChat } from "@/contexts/chat-context"
import { ChatInput } from "@/components/chat/chat-input"
import { ChatMessage, MessageType } from "@/components/chat/chat-message"

export function ChatContainer() {
  const { currentSession, isLoading, sendMessage } = useChat()
  const chatEndRef = React.useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  React.useEffect(() => {
    scrollToBottom()
  }, [currentSession?.messages])

  const handleSubmit = async (content: string) => {
    await sendMessage(content)
  }

  if (!currentSession) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Loading chat...</p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col rounded-lg border bg-background shadow-sm">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">{currentSession.title}</h2>
        <p className="text-sm text-muted-foreground">
          Ask questions about AI-Dev and MCP concepts
        </p>
      </div>
      <div className="flex-1 overflow-y-auto p-0">
        <div className="flex flex-col">
          {currentSession.messages.map((message) => {
            // Skip the system message
            if (message.role === "system") return null;
            
            return (
              <ChatMessage
                key={message.id}
                type={message.role === "user" ? "user" : "assistant"}
                content={message.content}
                metadata={message.metadata}
              />
            );
          })}
          <div ref={chatEndRef} />
        </div>
      </div>
      <ChatInput onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  )
} 