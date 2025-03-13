"use client"

import { useRouter } from "next/navigation"
import { MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface FloatingChatButtonProps {
  className?: string
}

export function FloatingChatButton({ className }: FloatingChatButtonProps) {
  const router = useRouter()

  const handleClick = () => {
    router.push("/chat")
  }

  return (
    <Button
      onClick={handleClick}
      className={cn(
        "fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full p-0 shadow-md transition-all hover:shadow-lg",
        className
      )}
      variant="default"
      size="icon"
      aria-label="Open Chat"
    >
      <MessageCircle className="h-6 w-6" />
    </Button>
  )
} 