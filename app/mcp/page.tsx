"use client"

import Link from "next/link"
import { ArrowRight, Code, Puzzle, Layers, ExternalLink, Github, BookOpen, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function MCPPage() {
  return (
    <div className="container mx-auto px-6 sm:px-8 py-10 md:py-12">
      {/* Header with breadcrumb */}
      <div className="mb-8">
        <nav className="mb-4 flex items-center text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <span className="mx-2 text-muted-foreground">/</span>
          <span className="text-foreground">MCP</span>
        </nav>
        <h1 className="mb-2 text-4xl font-extrabold tracking-tight md:text-5xl">
          <span className="gradient-text">Model Context Protocol</span>
        </h1>
        <p className="text-xl text-muted-foreground">
          Learn about the standard protocol for context sharing between AI tools
        </p>
      </div>

      {/* Hero banner */}
      <div className="relative mb-12 overflow-hidden rounded-xl bg-secondary/10 p-8 shadow-sm dark:bg-secondary/5">
        <div className="absolute -right-10 -top-10 h-40 w-40 rotate-12 rounded-3xl bg-secondary/20 blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 h-40 w-40 -rotate-12 rounded-3xl bg-primary/20 blur-3xl"></div>
        
        <div className="relative z-10 grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="mb-4 text-2xl font-bold md:text-3xl">What is MCP?</h2>
            <p className="mb-6 text-muted-foreground">
              Model Context Protocol (MCP) is a standardized way for AI tools to share context about the code they're working with.
              It helps create seamless experiences across tools and enhances AI model capabilities.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild>
                <Link href="/mcp/basics">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="https://github.com/cursor-ai/model-context-protocol" target="_blank">
                  <Github className="mr-2 h-4 w-4" /> GitHub Repo
                </Link>
              </Button>
            </div>
          </div>
          <div className="rounded-lg border bg-card p-4 text-sm text-muted-foreground shadow-sm">
            <div className="mb-2 flex items-center">
              <div className="mr-2 flex">
                <div className="mr-1 h-3 w-3 rounded-full bg-red-500"></div>
                <div className="mr-1 h-3 w-3 rounded-full bg-yellow-500"></div>
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
              </div>
              <div className="font-mono text-xs">mcp-example.json</div>
            </div>
            <pre className="overflow-x-auto p-2 font-mono text-xs">
{`{
  "context": {
    "model": "claude-3-opus",
    "repoName": "my-project",
    "workspacePath": "/path/to/workspace",
    "files": [
      {
        "path": "src/components/Button.tsx",
        "content": "...",
        "metadata": {
          "lastModified": "2023-12-01T12:00:00Z"
        }
      }
    ],
    "cursor": {
      "path": "src/components/Button.tsx",
      "position": { "line": 10, "character": 5 }
    }
  }
}`}
            </pre>
          </div>
        </div>
      </div>

      {/* Tab section */}
      <Tabs defaultValue="overview" className="mb-12">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="benefits">Benefits</TabsTrigger>
          <TabsTrigger value="implementation">Implementation</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-6">
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p>
              MCP provides a standard way for AI development tools to share context, improving 
              the ability of AI models to understand your codebase and provide relevant assistance.
            </p>
            <p>
              By standardizing context sharing, MCP enables tools to interoperate seamlessly, 
              creating a more cohesive development experience across different environments.
            </p>
            <ul className="space-y-2">
              <li>Standardized format for sharing code context</li>
              <li>Improved AI model understanding of your codebase</li>
              <li>Enhanced interoperability between AI development tools</li>
              <li>Future-proof design for compatibility with upcoming AI enhancements</li>
            </ul>
          </div>
        </TabsContent>
        <TabsContent value="benefits" className="mt-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-lg border bg-card p-6">
              <h3 className="mb-2 text-xl font-bold">For Developers</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-1 h-4 w-4 flex-shrink-0 text-primary" />
                  <span>Seamless experience across different AI development tools</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-1 h-4 w-4 flex-shrink-0 text-primary" />
                  <span>More accurate AI assistance with better context awareness</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-1 h-4 w-4 flex-shrink-0 text-primary" />
                  <span>Reduced need to repeat information when switching tools</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-1 h-4 w-4 flex-shrink-0 text-primary" />
                  <span>Improved code generation and suggestions</span>
                </li>
              </ul>
            </div>
            <div className="rounded-lg border bg-card p-6">
              <h3 className="mb-2 text-xl font-bold">For Tool Creators</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-1 h-4 w-4 flex-shrink-0 text-secondary" />
                  <span>Standard protocol reduces implementation complexity</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-1 h-4 w-4 flex-shrink-0 text-secondary" />
                  <span>Enhanced interoperability with other development tools</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-1 h-4 w-4 flex-shrink-0 text-secondary" />
                  <span>Future-proof design compatible with model advancements</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-1 h-4 w-4 flex-shrink-0 text-secondary" />
                  <span>Improved user experience through consistent context handling</span>
                </li>
              </ul>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="implementation" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex flex-col gap-4">
              <h3 className="text-xl font-bold">Getting Started with MCP</h3>
              <p className="text-muted-foreground">
                Implementing MCP in your tools or workflows is straightforward. 
                Follow these steps to get started:
              </p>
              <ol className="ml-5 list-decimal space-y-2 text-muted-foreground">
                <li>Understand the MCP schema structure</li>
                <li>Implement context collection in your tool</li>
                <li>Add context transmission capabilities</li>
                <li>Test with compatible tools</li>
            </ol>
              <div className="mt-4">
                <Button asChild>
                  <Link href="/mcp/implementation">
                    View Implementation Guide <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
            <div className="rounded-lg border bg-card p-6">
              <h3 className="mb-4 text-xl font-bold">Resources</h3>
              <ul className="space-y-4">
                <li>
                  <Link 
                    href="https://github.com/cursor-ai/model-context-protocol" 
                    className="flex items-center justify-between rounded-md p-2 transition-colors hover:bg-muted" 
                    target="_blank"
                  >
                    <div className="flex items-center">
                      <Github className="mr-2 h-5 w-5" />
                      <div>
                        <div className="font-medium">Official MCP Repository</div>
                        <div className="text-sm text-muted-foreground">GitHub</div>
                      </div>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/resources/documentation/mcp-schema" 
                    className="flex items-center justify-between rounded-md p-2 transition-colors hover:bg-muted"
                  >
                    <div className="flex items-center">
                      <BookOpen className="mr-2 h-5 w-5" />
                      <div>
                        <div className="font-medium">MCP Schema Documentation</div>
                        <div className="text-sm text-muted-foreground">Complete reference</div>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/resources/examples/mcp-examples" 
                    className="flex items-center justify-between rounded-md p-2 transition-colors hover:bg-muted"
                  >
                    <div className="flex items-center">
                      <Code className="mr-2 h-5 w-5" />
                      <div>
                        <div className="font-medium">Example Implementations</div>
                        <div className="text-sm text-muted-foreground">Code samples</div>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Topics grid */}
      <section className="mb-12">
        <h2 className="mb-6 text-3xl font-bold">Explore MCP Topics</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Topic 1 */}
          <Card>
            <CardHeader className="pb-3">
              <div className="mb-2 rounded-full bg-primary/10 p-2 w-10 h-10 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <CardTitle>MCP Basics</CardTitle>
              <CardDescription>
                Core concepts and fundamentals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Learn the basic structure and principles behind the Model Context Protocol.
              </p>
            </CardContent>
            <CardFooter>
              <Link 
                href="/mcp/basics" 
                className="inline-flex items-center text-primary hover:underline"
              >
                Learn more <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </CardFooter>
          </Card>

          {/* Topic 2 */}
          <Card>
            <CardHeader className="pb-3">
              <div className="mb-2 rounded-full bg-secondary/10 p-2 w-10 h-10 flex items-center justify-center">
                <Puzzle className="h-5 w-5 text-secondary" />
              </div>
              <CardTitle>Benefits</CardTitle>
              <CardDescription>
                Advantages of adopting MCP
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Explore how MCP enhances AI development workflows and improves tool interoperability.
              </p>
            </CardContent>
            <CardFooter>
              <Link 
                href="/mcp/benefits" 
                className="inline-flex items-center text-secondary hover:underline"
              >
                Read more <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </CardFooter>
          </Card>

          {/* Topic 3 */}
          <Card>
            <CardHeader className="pb-3">
              <div className="mb-2 rounded-full bg-accent/10 p-2 w-10 h-10 flex items-center justify-center">
                <Layers className="h-5 w-5 text-accent" />
              </div>
              <CardTitle>Context Management</CardTitle>
              <CardDescription>
                Working with code context
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Learn effective strategies for managing and transmitting code context between tools.
              </p>
            </CardContent>
            <CardFooter>
              <Link 
                href="/mcp/context-management" 
                className="inline-flex items-center text-accent hover:underline"
              >
                Discover <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </CardFooter>
          </Card>

          {/* Topic 4 */}
          <Card>
            <CardHeader className="pb-3">
              <div className="mb-2 rounded-full bg-primary/10 p-2 w-10 h-10 flex items-center justify-center">
                <Code className="h-5 w-5 text-primary" />
              </div>
              <CardTitle>Implementation</CardTitle>
              <CardDescription>
                Adding MCP to your tools
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Practical guide to implementing MCP in development tools and workflows.
              </p>
            </CardContent>
            <CardFooter>
              <Link 
                href="/mcp/implementation" 
                className="inline-flex items-center text-primary hover:underline"
              >
                Get started <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="rounded-xl gradient-bg p-8 shadow-sm">
        <div className="mx-auto max-w-3xl rounded-xl bg-background p-8 shadow-md">
          <div className="text-center">
            <h2 className="mb-4 text-2xl font-bold md:text-3xl">Ready to Implement MCP?</h2>
            <p className="mb-6 text-muted-foreground">
              Start integrating the Model Context Protocol into your development workflow today.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg">
                <Link href="/mcp/implementation">
                  Implementation Guide
                </Link>
              </Button>
              <Button variant="outline" asChild size="lg">
                <Link href="/resources/examples/mcp-examples">
                  View Examples
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
} 