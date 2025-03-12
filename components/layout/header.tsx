"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"

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

export function Header() {
  const pathname = usePathname()
  
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500">AI-Dev Platform</span>
          </Link>
        </div>
        <nav className="hidden md:flex flex-1 items-center space-x-1 text-sm font-medium">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                "px-4 py-2 rounded-md transition-colors hover:text-foreground/80",
                pathname === item.path
                  ? "bg-muted text-foreground"
                  : "text-foreground/60"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
} 