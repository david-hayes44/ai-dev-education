"use client"

import * as React from "react"
import { ChatInput } from "@/components/chat/chat-input"
import { ChatMessage, MessageType } from "@/components/chat/chat-message"

interface Message {
  id: string
  type: MessageType
  content: string
}

// Sample initial messages for demonstration
const initialMessages: Message[] = [
  {
    id: "1",
    type: "assistant",
    content: "👋 Hello! I'm your AI assistant for AI-Dev Education. How can I help you learn about AI-assisted development and MCP today?"
  }
]

export function ChatContainer() {
  const [messages, setMessages] = React.useState<Message[]>(initialMessages)
  const [isLoading, setIsLoading] = React.useState(false)
  const chatEndRef = React.useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  React.useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (content: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content
    }
    
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)
    
    try {
      // Simulating AI response with a timeout
      setTimeout(() => {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: "assistant",
          content: "This is a placeholder response. In the future, this will be integrated with the OpenRouter API to provide actual AI responses."
        }
        
        setMessages(prev => [...prev, assistantMessage])
        setIsLoading(false)
      }, 1000)
      
      // Here we would integrate with OpenRouter API in the future
    } catch (error) {
      console.error("Error sending message:", error)
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-full flex-col rounded-lg border bg-background shadow-sm">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">AI Assistant</h2>
        <p className="text-sm text-muted-foreground">
          Ask questions about AI-Dev and MCP concepts
        </p>
      </div>
      <div className="flex-1 overflow-y-auto p-0">
        <div className="flex flex-col">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              type={message.type}
              content={message.content}
            />
          ))}
          <div ref={chatEndRef} />
        </div>
      </div>
      <ChatInput onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  )
} 