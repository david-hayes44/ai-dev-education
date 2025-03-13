"use client"

import { ReactNode } from "react"

export function ChatClientLayout({ children }: { children: ReactNode }) {
  // We don't need to wrap with MainLayout here as the app already has a layout structure
  return <>{children}</>
} 