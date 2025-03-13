"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useChat } from "@/contexts/chat-context"
import { ChatContainer } from "@/components/chat/chat-container"
import { ChatHistory } from "@/components/chat/chat-history"
import { UserPreferences } from "@/components/chat/user-preferences"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Settings } from "lucide-react"
import { useState } from "react"

// Component for handling URL query parameters
function ChatWithQueryHandler() {
  const searchParams = useSearchParams()
  const { sendMessage } = useChat()
  
  useEffect(() => {
    const query = searchParams.get('query')
    if (query) {
      // Send the query from URL parameters
      sendMessage(query)
    }
  }, [searchParams, sendMessage])
  
  return <ChatContainer />
}

// Main chat client component - exported for use in the chat page
export function ChatClient() {
  const [showMobileHistory, setShowMobileHistory] = useState(false)
  const [showPreferences, setShowPreferences] = useState(false)
  
  return (
    <div className="bg-background rounded-lg border shadow h-[calc(100vh-12rem)]">
      {/* Mobile: Slide over navigation for chat history */}
      <div className={`
        fixed inset-0 z-50 bg-background/80 backdrop-blur-sm 
        md:hidden transition-opacity duration-200
        ${showMobileHistory ? 'opacity-100' : 'opacity-0 pointer-events-none'}
      `}>
        <div className={`
          fixed inset-y-0 left-0 z-50 w-3/4 max-w-xs bg-background border-r p-0
          transform transition-transform duration-200
          ${showMobileHistory ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="h-full flex flex-col">
            <ChatHistory />
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-0 top-1/2 h-8 w-8 -mr-4 rounded-full bg-primary text-primary-foreground shadow-md"
            onClick={() => setShowMobileHistory(false)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Mobile: Slide over for preferences */}
      <div className={`
        fixed inset-0 z-50 bg-background/80 backdrop-blur-sm 
        md:hidden transition-opacity duration-200
        ${showPreferences ? 'opacity-100' : 'opacity-0 pointer-events-none'}
      `}>
        <div className={`
          fixed inset-y-0 right-0 z-50 w-3/4 max-w-xs bg-background border-l p-0
          transform transition-transform duration-200
          ${showPreferences ? 'translate-x-0' : 'translate-x-full'}
        `}>
          <div className="h-full flex flex-col">
            <UserPreferences />
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute left-0 top-1/2 h-8 w-8 -ml-4 rounded-full bg-primary text-primary-foreground shadow-md"
            onClick={() => setShowPreferences(false)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Main desktop layout */}
      <div className="flex h-full">
        {/* Mobile navigation buttons */}
        <div className="absolute top-0 left-0 right-0 p-2 md:hidden flex justify-between z-10">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 bg-background/80 backdrop-blur-sm border shadow-sm"
            onClick={() => setShowMobileHistory(true)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 bg-background/80 backdrop-blur-sm border shadow-sm"
            onClick={() => setShowPreferences(true)}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Desktop three column layout */}
        <div className="hidden md:block md:w-72 lg:w-80 border-r">
          <ChatHistory />
        </div>
        
        <div className="flex-1">
          <ChatWithQueryHandler />
        </div>
        
        <div className="hidden md:block md:w-72 lg:w-80">
          <UserPreferences />
        </div>
      </div>
    </div>
  )
} 