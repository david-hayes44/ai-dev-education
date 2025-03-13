import { ReactNode } from "react"
import { FloatingChatButton } from "@/components/ui/floating-chat-button"

export default function MainAppLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <FloatingChatButton />
    </>
  )
} 