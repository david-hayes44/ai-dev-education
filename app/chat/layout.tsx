import { ReactNode } from "react"

export const metadata = {
  title: "Chat Assistant | AI-Dev Education",
  description: "Chat with our AI assistant for help with AI-assisted development and MCP concepts",
}

export default function ChatLayout({ children }: { children: ReactNode }) {
  // No need to wrap with MainLayout as the parent layout already provides this structure
  return children
} 