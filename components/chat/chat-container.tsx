"use client"

import * as React from "react"
import { ChatInput } from "@/components/chat/chat-input"
import { ChatMessage } from "@/components/chat/chat-message"
import { ModelSelector } from "@/components/chat/model-selector"
import { Settings } from "lucide-react"
import { 
  getRecentMessages, 
  processUserMessage, 
  ChatMessage as ChatMessageType 
} from "@/lib/chat-service"
import { Button } from "@/components/ui/button"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogTrigger 
} from "@/components/ui/dialog"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"

// Sample initial welcome message
const welcomeMessage: ChatMessageType = {
  id: "welcome",
  type: "assistant",
  content: "👋 Hello! I&apos;m your AI assistant for AI-Dev Education. How can I help you learn about AI-assisted development and MCP today?",
  timestamp: new Date()
}

export function ChatContainer() {
  const [messages, setMessages] = React.useState<ChatMessageType[]>([welcomeMessage])
  const [isLoading, setIsLoading] = React.useState(false)
  const [isInitialized, setIsInitialized] = React.useState(false)
  const [selectedModel, setSelectedModel] = React.useState("openai/gpt-3.5-turbo")
  const [temperature, setTemperature] = React.useState(0.7)
  const [maxTokens, setMaxTokens] = React.useState(1000)
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
      const assistantMessage = await processUserMessage(
        content, 
        selectedModel,
        temperature,
        maxTokens
      )
      
      // Update messages with the response
      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error sending message:", error)
      
      // Add error message
      const errorMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: "I&apos;m sorry, I encountered an error processing your request. Please try again later.",
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-full flex-col rounded-lg border bg-background shadow-sm">
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h2 className="text-lg font-semibold">AI Assistant</h2>
          <p className="text-sm text-muted-foreground">
            Ask questions about AI-Dev and MCP concepts
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Settings">
              <Settings className="h-5 w-5" />
              <span className="sr-only">Open settings</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Chat Settings</DialogTitle>
              <DialogDescription>
                Customize your AI assistant&apos;s behavior
              </DialogDescription>
            </DialogHeader>
            <div className="mt-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="model">AI Model</Label>
                <ModelSelector 
                  selectedModel={selectedModel} 
                  onSelect={setSelectedModel} 
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="temperature">Temperature: {temperature.toFixed(1)}</Label>
                </div>
                <Slider 
                  id="temperature"
                  min={0} 
                  max={1} 
                  step={0.1} 
                  value={[temperature]}
                  onValueChange={(values) => setTemperature(values[0])} 
                />
                <p className="text-xs text-muted-foreground">
                  Higher values make responses more creative, lower values make them more deterministic.
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="max-tokens">Max Tokens: {maxTokens}</Label>
                </div>
                <Slider 
                  id="max-tokens"
                  min={100} 
                  max={4000} 
                  step={100} 
                  value={[maxTokens]}
                  onValueChange={(values) => setMaxTokens(values[0])} 
                />
                <p className="text-xs text-muted-foreground">
                  Controls the maximum length of the generated response.
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
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