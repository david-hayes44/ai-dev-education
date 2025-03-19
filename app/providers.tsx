"use client"

import React from 'react'
import { ThemeProvider } from "@/components/providers/theme-provider"
import { EnhancedChatProvider } from "@/contexts/enhanced-chat-context"
import { NavigationProvider } from "@/contexts/navigation-context"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <NavigationProvider>
        <EnhancedChatProvider>
          {children}
        </EnhancedChatProvider>
      </NavigationProvider>
    </ThemeProvider>
  )
} 