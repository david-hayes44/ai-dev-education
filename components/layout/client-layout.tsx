"use client"

import { ReactNode, useState, useEffect } from "react"
import { Sidebar } from "@/components/navigation/Sidebar"
import { MainLayout } from "@/components/layout/main-layout"
import { NavigationProvider } from "@/contexts/navigation-context"

export default function ClientLayout({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  // Set mounted state after hydration
  useEffect(() => {
    // Use requestAnimationFrame to ensure browser has completed painting
    // before we set mounted to true
    const timeoutId = setTimeout(() => {
      setMounted(true);
    }, 0);
    
    return () => clearTimeout(timeoutId);
  }, []);

  // Return a simple layout during SSR
  if (!mounted) {
    return (
      <div className="relative flex min-h-screen flex-col">
        <main className="flex-1">{children}</main>
      </div>
    );
  }

  return (
    <NavigationProvider>
      {/* Persistent sidebar for all pages */}
      <Sidebar />
      
      <MainLayout>
        {children}
      </MainLayout>
    </NavigationProvider>
  )
} 