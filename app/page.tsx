"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl">
      <div className="py-12 text-center md:py-20">
        <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl">
          AI-Dev Education Platform
        </h1>
        <p className="mx-auto mb-8 max-w-3xl text-lg text-gray-600 dark:text-gray-400 md:text-xl">
          Learn AI-assisted development and master Model Context Protocol (MCP) 
          to build powerful AI-augmented applications
        </p>
        
        <div className="flex flex-wrap justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/concepts">
              Start Learning <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/mcp">
              Explore MCP Guides
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {/* Feature Cards */}
        <div className="rounded-lg border bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h3 className="mb-3 text-xl font-bold">AI-Dev Concepts</h3>
          <p className="mb-4 text-gray-600 dark:text-gray-400">
            Learn the core concepts behind AI-assisted development and how to 
            effectively work with AI tools.
          </p>
          <Link 
            href="/concepts" 
            className="inline-flex items-center text-blue-600 hover:underline dark:text-blue-400"
          >
            Learn More <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        
        <div className="rounded-lg border bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h3 className="mb-3 text-xl font-bold">MCP Guides</h3>
          <p className="mb-4 text-gray-600 dark:text-gray-400">
            Comprehensive guides to understanding and implementing Model Context Protocol
            in your applications.
          </p>
          <Link 
            href="/mcp" 
            className="inline-flex items-center text-blue-600 hover:underline dark:text-blue-400"
          >
            Learn More <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        
        <div className="rounded-lg border bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h3 className="mb-3 text-xl font-bold">Integration</h3>
          <p className="mb-4 text-gray-600 dark:text-gray-400">
            Step-by-step tutorials on integrating MCP with popular frameworks and platforms.
          </p>
          <Link 
            href="/integration" 
            className="inline-flex items-center text-blue-600 hover:underline dark:text-blue-400"
          >
            Learn More <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
