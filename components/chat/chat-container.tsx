"use client"

import * as React from "react"
import { ChatInput } from "@/components/chat/chat-input"
import { ChatMessage } from "@/components/chat/chat-message"
import { getRecentMessages, processUserMessage, ChatMessage as ChatMessageType } from "@/lib/chat-service"

// Sample initial welcome message
const welcomeMessage: ChatMessageType = {
  id: "welcome",
  type: "assistant",
  content: "👋 Hello! I'm your AI assistant for AI-Dev Education. How can I help you learn about AI-assisted development and MCP today?",
  timestamp: new Date()
}

export function ChatContainer() {
  const [messages, setMessages] = React.useState<ChatMessageType[]>([welcomeMessage])
  const [isLoading, setIsLoading] = React.useState(false)
  const [isInitialized, setIsInitialized] = React.useState(false)
  const chatEndRef = React.useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Load messages from Firestore on component mount
  React.useEffect(() => {
    const loadMessages = async () => {
      try {
        const recentMessages = await getRecentMessages()
        
        // If we have messages from Firestore, use those instead of the welcome message
        if (recentMessages.length > 0) {
          setMessages(recentMessages)
        }
        
        setIsInitialized(true)
      } catch (error) {
        console.error("Error loading messages:", error)
        setIsInitialized(true)
      }
    }
    
    loadMessages()
  }, [])

  React.useEffect(() => {
    if (isInitialized) {
      scrollToBottom()
    }
  }, [messages, isInitialized])

  const handleSubmit = async (content: string) => {
    // Add user message to UI immediately for better UX
    const tempUserMessage: ChatMessageType = {
      id: Date.now().toString(),
      type: "user",
      content,
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, tempUserMessage])
    setIsLoading(true)
    
    try {
      // Process the message with our chat service
      const assistantMessage = await processUserMessage(content)
      
      // Update messages with the response
      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error sending message:", error)
      
      // Add error message
      const errorMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: "I'm sorry, I encountered an error processing your request. Please try again later.",
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, errorMessage])
    } finally {
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
          {isLoading && (
            <div className="p-4 text-sm text-muted-foreground italic">
              AI assistant is thinking...
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </div>
      <ChatInput onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  )
} 