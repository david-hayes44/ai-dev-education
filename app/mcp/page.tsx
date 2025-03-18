"use client"

import Link from "next/link"
import { ArrowRight, Code, Puzzle, Layers, ExternalLink, Github, BookOpen, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Container } from "@/components/ui/container"
import { PageHeader } from "@/components/page-header"
import { LegacyTableOfContents } from "@/components/content"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function MCPPage() {
  return (
    <>
      <PageHeader
        title="Model Context Protocol"
        description="Learn about the standard protocol for context sharing between AI tools"
      />
      
      <Container className="py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Table of Contents - only visible on larger screens */}
          <div className="hidden lg:block lg:col-span-3">
            <LegacyTableOfContents 
              items={[
                {
                  id: "what-is-mcp",
                  title: "What is MCP?",
                  level: 2,
                },
                {
                  id: "key-concepts",
                  title: "Key Concepts",
                  level: 2,
                },
                {
                  id: "benefits",
                  title: "Benefits of MCP",
                  level: 2,
                },
                {
                  id: "use-cases",
                  title: "Common Use Cases",
                  level: 2,
                },
                {
                  id: "resources",
                  title: "Resources & Tools",
                  level: 2,
                },
                {
                  id: "sections",
                  title: "Framework Sections",
                  level: 2,
                }
              ]}
            />
          </div>
          
          {/* Main content */}
          <div className="lg:col-span-9">
            {/* Hero banner */}
            <div className="relative mb-12 overflow-hidden rounded-xl bg-secondary/10 p-8 shadow-sm dark:bg-secondary/5">
              <div className="absolute -right-10 -top-10 h-40 w-40 rotate-12 rounded-3xl bg-secondary/20 blur-3xl"></div>
              <div className="absolute -bottom-10 -left-10 h-40 w-40 -rotate-12 rounded-3xl bg-primary/20 blur-3xl"></div>
              
              <div id="what-is-mcp" className="relative z-10 grid gap-8 md:grid-cols-2">
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
                <div className="flex items-center justify-center">
                  <div className="aspect-square w-full max-w-[240px] rounded-lg bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 p-6">
                    <div className="h-full w-full rounded bg-card p-6 shadow-lg flex items-center justify-center">
                      <Puzzle className="h-16 w-16 text-primary" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Concepts */}
            <section id="key-concepts" className="mb-16">
              <h2 className="mb-6 text-2xl font-bold md:text-3xl">Key Concepts</h2>
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <span className="mr-2 flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Code className="h-4 w-4" />
                      </span>
                      Context Objects
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Standard format for representing code context, including file contents, cursor position, 
                      workspace information, and model-specific data.
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <span className="mr-2 flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Layers className="h-4 w-4" />
                      </span>
                      Context Scopes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Different levels of context (global, project, file) that allow for appropriate granularity
                      when sharing information between tools.
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-6 rounded-lg border bg-card p-4 text-sm text-muted-foreground shadow-sm">
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
            </section>

            {/* Benefits */}
            <section id="benefits" className="mb-16">
              <h2 className="mb-6 text-2xl font-bold md:text-3xl">Benefits of MCP</h2>
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Seamless Integration</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Allows AI tools to share context seamlessly, enabling smoother workflows across different 
                      development environments.
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Enhanced AI Capabilities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Provides AI models with richer context, resulting in more accurate and relevant assistance 
                      for development tasks.
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Standardized Format</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Establishes a common language for tools to communicate about code context, reducing 
                      fragmentation in the ecosystem.
                    </p>
                  </CardContent>
                </Card>
              </div>
              <div className="mt-6">
                <Link href="/mcp/benefits" className="flex items-center text-primary hover:underline">
                  Explore all benefits <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </div>
            </section>

            {/* Use Cases */}
            <section id="use-cases" className="mb-16">
              <h2 className="mb-6 text-2xl font-bold md:text-3xl">Common Use Cases</h2>
              <div className="space-y-4">
                <div className="rounded-lg border p-4">
                  <h3 className="mb-2 font-medium">Cross-Tool Collaboration</h3>
                  <p className="text-sm text-muted-foreground">
                    Share context between different AI coding assistants, allowing users to switch tools 
                    without losing important context.
                  </p>
                </div>
                
                <div className="rounded-lg border p-4">
                  <h3 className="mb-2 font-medium">IDE Integration</h3>
                  <p className="text-sm text-muted-foreground">
                    Enable IDEs and code editors to provide context-aware AI assistance by implementing 
                    MCP for communication with AI services.
                  </p>
                </div>
                
                <div className="rounded-lg border p-4">
                  <h3 className="mb-2 font-medium">Custom Tool Building</h3>
                  <p className="text-sm text-muted-foreground">
                    Create specialized development tools that leverage shared context to provide targeted 
                    functionality for specific development needs.
                  </p>
                </div>
              </div>
            </section>

            {/* Resources & Tools */}
            <section id="resources" className="mb-16">
              <h2 className="mb-6 text-2xl font-bold md:text-3xl">Resources & Tools</h2>
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="flex flex-col">
                  <CardHeader>
                    <CardTitle>Official Documentation</CardTitle>
                    <CardDescription>
                      Comprehensive guides and reference materials
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-sm text-muted-foreground">
                      Explore the official MCP documentation for detailed specifications, tutorials, 
                      and best practices.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" asChild className="w-full">
                      <Link href="https://github.com/cursor-ai/model-context-protocol" target="_blank">
                        <BookOpen className="mr-2 h-4 w-4" /> View Documentation
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card className="flex flex-col">
                  <CardHeader>
                    <CardTitle>MCP SDK</CardTitle>
                    <CardDescription>
                      Development libraries and utilities
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-sm text-muted-foreground">
                      Use the official MCP SDK to easily implement the protocol in your own tools 
                      and applications.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" asChild className="w-full">
                      <Link href="https://github.com/cursor-ai/model-context-protocol" target="_blank">
                        <Github className="mr-2 h-4 w-4" /> View on GitHub
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </section>

            {/* Framework Sections */}
            <section id="sections" className="mb-16">
              <h2 className="mb-6 text-2xl font-bold md:text-3xl">Framework Sections</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="flex flex-col">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Basics</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-sm text-muted-foreground">
                      Fundamental concepts, terminology, and structure of the Model Context Protocol.
                    </p>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <Button variant="outline" asChild className="w-full">
                      <Link href="/mcp/basics">
                        <ArrowRight className="mr-2 h-4 w-4" /> Explore Basics
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card className="flex flex-col">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Benefits</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-sm text-muted-foreground">
                      Advantages of using MCP for AI-assisted development and tool integration.
                    </p>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <Button variant="outline" asChild className="w-full">
                      <Link href="/mcp/benefits">
                        <ArrowRight className="mr-2 h-4 w-4" /> Explore Benefits
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card className="flex flex-col">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Context Management</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-sm text-muted-foreground">
                      Techniques for effectively managing and optimizing context in AI-assisted development.
                    </p>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <Button variant="outline" asChild className="w-full">
                      <Link href="/mcp/context-management">
                        <ArrowRight className="mr-2 h-4 w-4" /> Explore Context Management
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card className="flex flex-col">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Implementation</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-sm text-muted-foreground">
                      Practical guides for implementing MCP in different environments and languages.
                    </p>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <Button variant="outline" asChild className="w-full">
                      <Link href="/mcp/implementation">
                        <ArrowRight className="mr-2 h-4 w-4" /> Explore Implementation
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card className="flex flex-col">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Building Servers</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-sm text-muted-foreground">
                      Learn how to build servers that implement the Model Context Protocol.
                    </p>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <Button variant="outline" asChild className="w-full">
                      <Link href="/building-servers">
                        <ArrowRight className="mr-2 h-4 w-4" /> Explore Server Building
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card className="flex flex-col">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Server Architecture</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-sm text-muted-foreground">
                      Understand the architecture and components of MCP servers.
                    </p>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <Button variant="outline" asChild className="w-full">
                      <Link href="/servers/architecture">
                        <ArrowRight className="mr-2 h-4 w-4" /> Explore Architecture
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </section>
          </div>
        </div>
      </Container>
    </>
  )
} 