"use client"

import * as React from "react"
import { X, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ChatContainer } from "@/components/chat/chat-container"
import { useLocalStorage } from "@/hooks/use-local-storage"

export function FloatingChat() {
  const [isOpen, setIsOpen] = useLocalStorage<boolean>("floating-chat-open", false)

  return (
    <div className="fixed bottom-0 right-0 z-50 p-4 md:p-6">
      {isOpen ? (
        <div className="flex h-[600px] w-[350px] flex-col overflow-hidden rounded-lg border bg-background shadow-lg md:w-[450px]">
          <div className="flex items-center justify-between border-b p-4">
            <h3 className="font-semibold">AI Assistant</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1 overflow-hidden">
            <ChatContainer />
          </div>
        </div>
      ) : (
        <Button
          size="icon"
          className="h-12 w-12 rounded-full shadow-lg"
          onClick={() => setIsOpen(true)}
          aria-label="Open chat"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}
    </div>
  )
} 