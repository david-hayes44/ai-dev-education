import { cn } from "@/lib/utils"
import * as React from "react"

export function Container({ 
  className, 
  ...props 
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("container mx-auto px-4 md:px-8", className)}
      {...props}
    />
  )
} 