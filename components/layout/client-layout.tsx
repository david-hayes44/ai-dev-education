"use client"

import { ReactNode } from "react"
import { FloatingChat } from "@/components/chat/floating-chat"
import { Sidebar } from "@/components/navigation/Sidebar"
import { MainLayout } from "@/components/layout/main-layout"

export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {/* Persistent sidebar for all pages */}
      <Sidebar />
      
      <MainLayout>
        {children}
      </MainLayout>
      
      <FloatingChat />
    </>
  )
} 