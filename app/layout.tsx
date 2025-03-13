import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import TanstackClientProvider from '@/components/providers/tanstack-client-provider'
import { ThemeProvider } from '@/components/providers/theme-provider'
import ClientLayout from '@/components/layout/client-layout'

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
})
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
})

export const metadata: Metadata = {
  title: 'The AI Dev Odyssey | AI-Assisted Development Education',
  description: 'Embark on a journey to master AI-assisted development, Model Context Protocol (MCP), and modern development workflows.',
  keywords: 'AI-assisted development, MCP, Model Context Protocol, programming, education, best practices, AI tools',
  authors: [{ name: 'AI Dev Odyssey Team' }],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <TanstackClientProvider>
            <ClientLayout>{children}</ClientLayout>
          </TanstackClientProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
