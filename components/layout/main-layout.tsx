"use client"

import { ReactNode } from "react"
import { Header } from "@/components/layout/header"
import { MobileNav } from "@/components/layout/mobile-nav"
import { Footer } from "@/components/layout/footer"

interface MainLayoutProps {
  children: ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <div className="flex items-center px-4 md:px-6">
        <Header />
        <div className="md:hidden">
          <MobileNav />
        </div>
      </div>
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
} 