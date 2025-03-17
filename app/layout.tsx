import { Inter as FontSans } from "next/font/google"
import "@/app/globals.css"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { AuthProvider } from "@/components/providers/auth-provider"
import { Toaster } from "@/components/ui/sonner"
import { cn } from "@/lib/utils"
import TanstackClientProvider from "@/components/providers/tanstack-client-provider"
import ClientLayout from "@/components/layout/client-layout"
import { NavigationProvider } from "@/contexts/navigation-context"

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata = {
  title: "AI Development Guide",
  description: "Comprehensive guide to AI development with MCP",
  icons: {
    icon: [
      { url: '/icon.png', type: 'image/png' }
    ],
    apple: [
      { url: '/icon.png', type: 'image/png' }
    ],
    shortcut: ['/icon.png']
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <TanstackClientProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AuthProvider>
              <NavigationProvider>
                <ClientLayout>{children}</ClientLayout>
                <Toaster />
              </NavigationProvider>
            </AuthProvider>
          </ThemeProvider>
        </TanstackClientProvider>
      </body>
    </html>
  )
}
