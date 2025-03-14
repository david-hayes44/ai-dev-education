"use client"

import { ReactNode, useState, useEffect } from "react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { FloatingChat } from "@/components/chat/floating-chat"

interface MainLayoutProps {
  children: ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const [mounted, setMounted] = useState(false);

  // Set mounted state after hydration
  useEffect(() => {
    // Use requestAnimationFrame to ensure browser has completed painting
    const timeoutId = setTimeout(() => {
      setMounted(true);
    }, 50); // Small delay to ensure client-side rendering completes
    
    return () => clearTimeout(timeoutId);
  }, []);

  // Use separate component variables to avoid hydration mismatches
  const HeaderComponent = mounted ? <Header /> : null;
  const FooterComponent = mounted ? <Footer /> : null;
  const FloatingChatComponent = mounted ? <FloatingChat /> : null;

  return (
    <div className="relative flex min-h-screen flex-col md:pl-[80px] lg:pl-[90px]">
      {HeaderComponent}
      <main className="flex-1">{children}</main>
      {FooterComponent}
      {FloatingChatComponent}
    </div>
  )
} 