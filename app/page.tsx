"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Code, BookOpen, Layers, Braces, ExternalLink, ServerCog } from "lucide-react"
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

      {/* New & Noteworthy Section */}
      <section className="py-16 sm:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/90 via-purple-900/90 to-pink-800/90"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="h-full w-full" style={{ backgroundImage: 'url("/grid-pattern.svg")', backgroundSize: '30px 30px' }}></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-10">
            <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
              New &amp; Noteworthy
            </h2>
            <p className="mx-auto max-w-3xl text-lg text-indigo-100">
              Check out our latest features and tools designed to enhance your AI development experience.
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden shadow-2xl">
            <div className="md:flex">
              <div className="md:w-1/2 p-8 md:p-10">
                <div className="inline-block bg-indigo-600/20 text-indigo-200 px-3 py-1 rounded-full text-sm font-medium mb-4">
                  New Feature
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">4-Box Report Builder</h3>
                <p className="text-indigo-100 mb-6">
                  Generate professional status reports in minutes with our new AI-powered 4-Box Report Builder. 
                  Perfect for project updates, weekly summaries, and team communications.
                </p>
                
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-indigo-300 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-indigo-100">Upload project documents for automatic analysis</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-indigo-300 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-indigo-100">Generate structured reports with accomplishments, insights, decisions, and next steps</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-indigo-300 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-indigo-100">Refine your report through chat and direct editing</span>
                  </li>
                </ul>
                
                <Link 
                  href="/staff-hub/assistants/report-builder" 
                  className="inline-flex items-center px-6 py-3 rounded-lg bg-white text-indigo-900 hover:bg-indigo-100 font-medium transition-colors"
                >
                  Try the Report Builder
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </div>
              
              <div className="md:w-1/2 bg-gradient-to-br from-indigo-800 to-purple-900 flex items-center justify-center p-8">
                <div className="w-full max-w-md aspect-video rounded-lg overflow-hidden shadow-lg border border-indigo-700/50 bg-indigo-950/50 p-4">
                  <div className="h-full w-full flex flex-col">
                    <div className="bg-indigo-800/40 h-10 rounded-t-md flex items-center px-4 border-b border-indigo-700/30">
                      <div className="w-3 h-3 rounded-full bg-red-400 mr-2"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-400 mr-2"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400 mr-2"></div>
                      <div className="text-indigo-200 text-sm ml-2">4-Box Report Builder</div>
                    </div>
                    <div className="flex-1 grid grid-cols-2 gap-2 p-2">
                      <div className="bg-indigo-700/30 rounded p-2 border border-indigo-600/30">
                        <div className="text-xs text-indigo-300">Accomplishments</div>
                        <div className="mt-1 h-2 bg-indigo-600/20 rounded"></div>
                        <div className="mt-1 h-2 bg-indigo-600/20 rounded w-3/4"></div>
                        <div className="mt-1 h-2 bg-indigo-600/20 rounded w-1/2"></div>
                      </div>
                      <div className="bg-indigo-700/30 rounded p-2 border border-indigo-600/30">
                        <div className="text-xs text-indigo-300">Insights</div>
                        <div className="mt-1 h-2 bg-indigo-600/20 rounded"></div>
                        <div className="mt-1 h-2 bg-indigo-600/20 rounded w-2/3"></div>
                        <div className="mt-1 h-2 bg-indigo-600/20 rounded w-1/2"></div>
                      </div>
                      <div className="bg-indigo-700/30 rounded p-2 border border-indigo-600/30">
                        <div className="text-xs text-indigo-300">Decisions</div>
                        <div className="mt-1 h-2 bg-indigo-600/20 rounded"></div>
                        <div className="mt-1 h-2 bg-indigo-600/20 rounded w-4/5"></div>
                        <div className="mt-1 h-2 bg-indigo-600/20 rounded w-2/3"></div>
                      </div>
                      <div className="bg-indigo-700/30 rounded p-2 border border-indigo-600/30">
                        <div className="text-xs text-indigo-300">Next Steps</div>
                        <div className="mt-1 h-2 bg-indigo-600/20 rounded"></div>
                        <div className="mt-1 h-2 bg-indigo-600/20 rounded w-3/5"></div>
                        <div className="mt-1 h-2 bg-indigo-600/20 rounded w-2/5"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
