"use client"

import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background">
      <div className="container max-w-screen-2xl py-8 md:py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-semibold">AI-Dev Education Platform</h3>
            <p className="text-sm text-muted-foreground">
              Educating developers on AI-assisted development and Model Context Protocol (MCP).
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <h3 className="text-base font-medium">Resources</h3>
              <Link href="/ai-dev" className="text-sm text-muted-foreground hover:text-foreground">
                AI-Dev Concepts
              </Link>
              <Link href="/mcp" className="text-sm text-muted-foreground hover:text-foreground">
                MCP Guides
              </Link>
              <Link href="/integration" className="text-sm text-muted-foreground hover:text-foreground">
                Integration
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-base font-medium">More</h3>
              <Link href="/building-servers" className="text-sm text-muted-foreground hover:text-foreground">
                Building MCP Servers
              </Link>
              <Link href="/best-practices" className="text-sm text-muted-foreground hover:text-foreground">
                Best Practices
              </Link>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-base font-medium">Legal</h3>
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">
              Terms of Service
            </Link>
          </div>
        </div>
        <div className="mt-8 border-t border-border pt-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} AI-Dev Education Platform. All rights reserved.
        </div>
      </div>
    </footer>
  )
} 