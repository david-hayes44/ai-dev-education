"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"

const navItems = [
  {
    path: "/",
    label: "Home",
  },
  {
    path: "/ai-dev",
    label: "AI-Dev Concepts",
  },
  {
    path: "/mcp",
    label: "MCP Guides",
  },
  {
    path: "/integration",
    label: "Integration",
  },
  {
    path: "/building-servers",
    label: "Building MCP Servers",
  },
  {
    path: "/best-practices",
    label: "Best Practices",
  },
]

export function MobileNav() {
  const pathname = usePathname()
  const [open, setOpen] = React.useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0">
        <div className="px-7">
          <Link
            href="/"
            className="flex items-center"
            onClick={() => setOpen(false)}
          >
            <span className="font-bold text-xl">AI-Dev Platform</span>
          </Link>
        </div>
        <div className="flex flex-col space-y-3 mt-6">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              onClick={() => setOpen(false)}
              className={cn(
                "px-7 py-2 text-base font-medium transition-colors hover:text-foreground/80",
                pathname === item.path
                  ? "bg-muted text-foreground"
                  : "text-foreground/60"
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  )
} 