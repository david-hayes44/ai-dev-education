"use client"

import * as React from "react"
import { useChat } from "@/contexts/chat-context"
import { ChatContainer } from "@/components/chat/chat-container"

/**
 * Simple wrapper component around ChatContainer
 * This component exists for backwards compatibility and may be removed in future
 */
export function Chat() {
  return <ChatContainer />
} 