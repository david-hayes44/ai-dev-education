// Placeholder implementation of the toast system
import { useState } from 'react'

export type ToastProps = {
  title?: string
  description?: string
  variant?: 'default' | 'destructive'
  duration?: number
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const toast = (props: ToastProps) => {
    console.log('Toast:', props)
    setToasts((current) => [...current, props])
    // In a real implementation, this would show a toast notification
  }

  return {
    toast,
    toasts,
    dismiss: (index: number) => {
      setToasts((current) => current.filter((_, i) => i !== index))
    },
    dismissAll: () => {
      setToasts([])
    },
  }
} 