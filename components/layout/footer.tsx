"use client"

import Link from "next/link"
import { Icons } from "@/components/icons"

export function Footer() {
  return (
    <footer className="border-t border-border bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto px-6 sm:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="md:col-span-1 space-y-4">
            <Link href="/" className="flex items-center">
              <span className="font-bold text-xl gradient-text">The AI Dev Odyssey</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Empower your journey in AI-assisted development with our comprehensive guides and best practices.
            </p>
            <div className="flex space-x-4">
              <Link href="https://github.com/ai-dev-education" className="text-muted-foreground hover:text-foreground transition-colors">
                <Icons.gitHub className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </Link>
              <Link href="https://twitter.com/aidevjourney" className="text-muted-foreground hover:text-foreground transition-colors">
                <Icons.twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="https://discord.gg/aidev" className="text-muted-foreground hover:text-foreground transition-colors">
                <Icons.discord className="h-5 w-5" />
                <span className="sr-only">Discord</span>
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-1">
            <h3 className="font-medium text-base mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/introduction" className="text-muted-foreground hover:text-foreground transition-colors">
                  Introduction
                </Link>
              </li>
              <li>
                <Link href="/mcp" className="text-muted-foreground hover:text-foreground transition-colors">
                  MCP Guides
                </Link>
              </li>
              <li>
                <Link href="/best-practices" className="text-muted-foreground hover:text-foreground transition-colors">
                  Best Practices
                </Link>
              </li>
              <li>
                <Link href="/servers" className="text-muted-foreground hover:text-foreground transition-colors">
                  Building MCP Servers
                </Link>
              </li>
              <li>
                <Link href="/tools" className="text-muted-foreground hover:text-foreground transition-colors">
                  AI Development Tools
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Resources */}
          <div className="md:col-span-1">
            <h3 className="font-medium text-base mb-4">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/learning-paths" className="text-muted-foreground hover:text-foreground transition-colors">
                  Learning Paths
                </Link>
              </li>
              <li>
                <Link href="/resources/documentation" className="text-muted-foreground hover:text-foreground transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/resources/examples" className="text-muted-foreground hover:text-foreground transition-colors">
                  Examples
                </Link>
              </li>
              <li>
                <Link href="/resources/videos" className="text-muted-foreground hover:text-foreground transition-colors">
                  Video Tutorials
                </Link>
              </li>
              <li>
                <Link href="/resources/api" className="text-muted-foreground hover:text-foreground transition-colors">
                  API Reference
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Contact & Legal */}
          <div className="md:col-span-1">
            <h3 className="font-medium text-base mb-4">Contact & Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-of-service" className="text-muted-foreground hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-border text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} The AI Dev Odyssey. All rights reserved.</p>
          <p className="mt-1">
            Built with <span className="text-primary">♥</span> for the AI development community.
          </p>
        </div>
      </div>
    </footer>
  )
} 