"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Code, BookOpen, Layers, Braces, ExternalLink, ServerCog, Database } from "lucide-react"
import Image from "next/image"

export default function Home() {
  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative overflow-hidden hero-pattern">
        <div className="gradient-bg absolute inset-0 z-0"></div>
        <div className="container relative z-10 mx-auto px-4 py-16 sm:py-24 md:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-6 text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl">
              <span className="gradient-text">The AI Dev Odyssey</span>
            </h1>
            <h2 className="mb-8 text-2xl font-medium tracking-tight text-gray-700 dark:text-gray-300 md:text-3xl">
              Your Journey into AI-Assisted Development
            </h2>
            <p className="mb-10 text-lg text-gray-600 dark:text-gray-400 md:text-xl">
              Master AI-assisted development and Model Context Protocol (MCP)
              to transform your coding workflow and build more powerful applications.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" className="h-12 px-8 text-base">
                <Link href="/introduction" className="flex items-center">
                  Start Your Journey <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="h-12 border-accent px-8 text-base text-accent hover:bg-accent/10 dark:border-accent dark:text-accent dark:hover:bg-accent/10">
                <Link href="/mcp" className="flex items-center">
                  Explore MCP <ExternalLink className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="pointer-events-none absolute -bottom-6 left-0 right-0 z-0 flex justify-center">
          <div className="h-12 w-full max-w-7xl bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 blur-xl"></div>
        </div>
        
        {/* Code Snippets Overlay */}
        <div className="pointer-events-none absolute bottom-0 left-0 opacity-10 dark:opacity-5 2xl:opacity-20">
          <pre className="text-xs text-gray-700 dark:text-gray-300 md:text-sm">
            <code>{`
function getContext() {
  return {
    model: "claude-3",
    temperature: 0.7,
    plugins: ["code-interpreter"]
  };
}
            `}</code>
          </pre>
        </div>
        
        <div className="pointer-events-none absolute right-0 top-20 opacity-10 dark:opacity-5 2xl:opacity-20">
          <pre className="text-xs text-gray-700 dark:text-gray-300 md:text-sm">
            <code>{`
const MCP = {
  fetch: async (context) => {
    // Get model context
    return modelContext;
  }
}
            `}</code>
          </pre>
        </div>
      </section>

      {/* Supabase Testing Section */}
      <section className="bg-blue-50 py-12 dark:bg-blue-950 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
              <Database className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="mb-3 text-3xl font-bold text-gray-900 dark:text-white">
              Supabase Integration Testing
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-400">
              Use these tools to test the Supabase integration for storage, authentication and database functionality.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Server-Side Storage Test */}
            <div className="rounded-xl border border-blue-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-blue-800 dark:bg-gray-900">
              <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">Server-Side Storage</h3>
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                Test file uploads using server-side API to bypass CORS issues.
              </p>
              <Link 
                href="/server-storage-test" 
                className="inline-flex items-center text-blue-600 hover:underline dark:text-blue-400"
              >
                Open Test <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>

            {/* Direct Storage Test */}
            <div className="rounded-xl border border-blue-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-blue-800 dark:bg-gray-900">
              <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">Direct Storage Test</h3>
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                Test client-side storage API with direct uploads to Supabase.
              </p>
              <Link 
                href="/supabase-direct-storage-test" 
                className="inline-flex items-center text-blue-600 hover:underline dark:text-blue-400"
              >
                Open Test <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>

            {/* Connection Diagnostics */}
            <div className="rounded-xl border border-blue-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-blue-800 dark:bg-gray-900">
              <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">Connection Diagnostics</h3>
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                Diagnose Supabase connection issues and check configuration.
              </p>
              <Link 
                href="/supabase-diagnostics" 
                className="inline-flex items-center text-blue-600 hover:underline dark:text-blue-400"
              >
                Open Test <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>

            {/* Supabase Test Hub */}
            <div className="rounded-xl border border-blue-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-blue-800 dark:bg-gray-900">
              <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">Test Hub</h3>
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                View all Supabase test pages from a central location.
              </p>
              <Link 
                href="/supabase-test" 
                className="inline-flex items-center text-blue-600 hover:underline dark:text-blue-400"
              >
                Open Hub <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="bg-white py-16 dark:bg-gray-950 sm:py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
              Begin Your AI Development Journey
            </h2>
            <p className="mx-auto max-w-3xl text-lg text-gray-600 dark:text-gray-400">
              Discover how AI-assisted development and the Model Context Protocol
              can revolutionize your coding workflow and enhance your applications.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature Card 1 */}
            <div className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary dark:bg-primary/20">
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="mb-3 text-xl font-bold">Introduction to AI Dev</h3>
              <p className="mb-4 text-gray-600 dark:text-gray-400">
                Learn the fundamentals of AI-assisted development and how it transforms
                traditional coding workflows.
              </p>
              <Link 
                href="/introduction" 
                className="inline-flex items-center text-primary hover:underline"
              >
                Get Started <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>

            {/* Feature Card 2 */}
            <div className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10 text-secondary dark:bg-secondary/20">
                <Code className="h-6 w-6" />
              </div>
              <h3 className="mb-3 text-xl font-bold">Understanding MCP</h3>
              <p className="mb-4 text-gray-600 dark:text-gray-400">
                Dive into the Model Context Protocol and learn how it standardizes
                context sharing between AI tools.
              </p>
              <Link 
                href="/mcp" 
                className="inline-flex items-center text-secondary hover:underline"
              >
                Learn More <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>

            {/* Feature Card 3 */}
            <div className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent dark:bg-accent/20">
                <Layers className="h-6 w-6" />
              </div>
              <h3 className="mb-3 text-xl font-bold">Best Practices</h3>
              <p className="mb-4 text-gray-600 dark:text-gray-400">
                Explore proven strategies for effective, secure AI-assisted development
                with practical examples.
              </p>
              <Link 
                href="/best-practices" 
                className="inline-flex items-center text-accent hover:underline"
              >
                Explore <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>

            {/* Feature Card 4 */}
            <div className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary dark:bg-primary/20">
                <Braces className="h-6 w-6" />
              </div>
              <h3 className="mb-3 text-xl font-bold">AI Development Tools</h3>
              <p className="mb-4 text-gray-600 dark:text-gray-400">
                Discover practical usage guidance for Cursor, Windsurf, Claude,
                and other AI development tools.
              </p>
              <Link 
                href="/tools" 
                className="inline-flex items-center text-primary hover:underline"
              >
                Discover Tools <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>

            {/* Feature Card 5 */}
            <div className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10 text-secondary dark:bg-secondary/20">
                <ServerCog className="h-6 w-6" />
              </div>
              <h3 className="mb-3 text-xl font-bold">Building MCP Servers</h3>
              <p className="mb-4 text-gray-600 dark:text-gray-400">
                Learn how to implement MCP servers with detailed architecture components
                and implementation guides.
              </p>
              <Link 
                href="/servers" 
                className="inline-flex items-center text-secondary hover:underline"
              >
                Build Now <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>

            {/* Feature Card 6 */}
            <div className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent dark:bg-accent/20">
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="mb-3 text-xl font-bold">Learning Resources</h3>
              <p className="mb-4 text-gray-600 dark:text-gray-400">
                Access comprehensive knowledge base, glossary, and curated external
                resources for AI development.
              </p>
              <Link 
                href="/resources" 
                className="inline-flex items-center text-accent hover:underline"
              >
                Browse Resources <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="gradient-bg relative py-16 sm:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 text-center shadow-xl dark:bg-gray-900 sm:p-10">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
              Ready to Enhance Your Development Skills?
            </h2>
            <p className="mb-8 text-lg text-gray-600 dark:text-gray-400">
              Start your AI Dev Odyssey today and transform the way you write, review, and deploy code.
            </p>
            <Button size="lg" className="h-12 px-8 text-base">
              <Link href="/introduction" className="flex items-center">
                Begin Learning <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
