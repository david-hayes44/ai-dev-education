import Link from "next/link"
import { ArrowRight, Server, Code, Database, Shield, FileCode, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function ServersPage() {
  return (
    <div className="container mx-auto px-6 sm:px-8 py-10 md:py-12">
      {/* Header with breadcrumb */}
      <div className="mb-8">
        <nav className="mb-4 flex items-center text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <span className="mx-2 text-muted-foreground">/</span>
          <span className="text-foreground">Building MCP Servers</span>
        </nav>
        <h1 className="mb-2 text-4xl font-extrabold tracking-tight md:text-5xl">
          Building MCP Servers
        </h1>
        <p className="text-xl text-muted-foreground">
          Learn how to create servers that implement the Model Context Protocol
        </p>
      </div>

      {/* Hero section */}
      <div className="relative mb-12 overflow-hidden rounded-xl bg-primary/10 p-8 shadow-sm dark:bg-primary/5">
        <div className="absolute -right-10 -top-10 h-40 w-40 rotate-12 rounded-3xl bg-primary/20 blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 h-40 w-40 -rotate-12 rounded-3xl bg-accent/20 blur-3xl"></div>
        
        <div className="relative z-10 grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="mb-4 text-2xl font-bold md:text-3xl">MCP Server Architecture</h2>
            <p className="mb-6 text-muted-foreground">
              An MCP server acts as an intermediary between the user and AI models, managing context, 
              handling requests, and formatting responses. Build powerful AI-assisted development tools with proper MCP implementation.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild>
                <Link href="/servers/architecture">
                  Explore Architecture <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/servers/examples">
                  View Examples <Code className="mr-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
          <div className="rounded-lg border bg-card p-6 text-muted-foreground shadow-sm">
            <h3 className="mb-4 text-lg font-medium">Key Components</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Server className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                <span>Context Management System</span>
              </li>
              <li className="flex items-start gap-2">
                <Database className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                <span>Model Interface Layer</span>
              </li>
              <li className="flex items-start gap-2">
                <Code className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                <span>Request Processing Pipeline</span>
              </li>
              <li className="flex items-start gap-2">
                <Shield className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                <span>Security & Authentication</span>
              </li>
              <li className="flex items-start gap-2">
                <FileCode className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                <span>Response Formatter</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Main content sections */}
      <div className="grid gap-12">
        {/* Architecture overview */}
        <section>
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <h2 className="text-3xl font-bold mb-6">Server Architecture Components</h2>
            <p className="lead text-xl">
              Building an MCP server requires several key components working together to provide a seamless experience
              for AI-assisted development tools.
            </p>
            <p>
              Each component of an MCP server plays a specific role in managing context, processing requests, and
              delivering formatted responses to enhance AI-assisted development workflows.
            </p>
          </div>
        </section>

        {/* Component cards grid */}
        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="flex flex-col">
            <CardHeader>
              <div className="mb-2 rounded-full bg-primary/10 p-2 w-10 h-10 flex items-center justify-center">
                <Server className="h-5 w-5 text-primary" />
              </div>
              <CardTitle>Architecture</CardTitle>
              <CardDescription>
                Core architectural patterns for MCP servers
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-muted-foreground">
                Learn about the different architectural approaches for building MCP servers,
                from monolithic designs to microservices.
              </p>
            </CardContent>
            <CardFooter>
              <Link 
                href="/servers/architecture" 
                className="inline-flex items-center text-primary hover:underline"
              >
                Learn more <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </CardFooter>
          </Card>

          <Card className="flex flex-col">
            <CardHeader>
              <div className="mb-2 rounded-full bg-secondary/10 p-2 w-10 h-10 flex items-center justify-center">
                <Code className="h-5 w-5 text-secondary" />
              </div>
              <CardTitle>Implementation</CardTitle>
              <CardDescription>
                Step-by-step guides to build your server
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-muted-foreground">
                Detailed implementation guides covering different technologies and frameworks
                for building production-ready MCP servers.
              </p>
            </CardContent>
            <CardFooter>
              <Link 
                href="/servers/implementation" 
                className="inline-flex items-center text-secondary hover:underline"
              >
                Start building <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </CardFooter>
          </Card>

          <Card className="flex flex-col">
            <CardHeader>
              <div className="mb-2 rounded-full bg-accent/10 p-2 w-10 h-10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-accent" />
              </div>
              <CardTitle>Security</CardTitle>
              <CardDescription>
                Securing your MCP server implementation
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-muted-foreground">
                Best practices for securing your MCP server, including authentication,
                authorization, and data protection considerations.
              </p>
            </CardContent>
            <CardFooter>
              <Link 
                href="/servers/security" 
                className="inline-flex items-center text-accent hover:underline"
              >
                Explore security <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </CardFooter>
          </Card>

          <Card className="flex flex-col">
            <CardHeader>
              <div className="mb-2 rounded-full bg-primary/10 p-2 w-10 h-10 flex items-center justify-center">
                <Database className="h-5 w-5 text-primary" />
              </div>
              <CardTitle>Context Management</CardTitle>
              <CardDescription>
                Efficiently manage model context
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-muted-foreground">
                Learn strategies for effective context management, including storage,
                retrieval, and optimization techniques.
              </p>
            </CardContent>
            <CardFooter>
              <Link 
                href="/servers/context-management" 
                className="inline-flex items-center text-primary hover:underline"
              >
                Discover strategies <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </CardFooter>
          </Card>

          <Card className="flex flex-col">
            <CardHeader>
              <div className="mb-2 rounded-full bg-secondary/10 p-2 w-10 h-10 flex items-center justify-center">
                <FileCode className="h-5 w-5 text-secondary" />
              </div>
              <CardTitle>Examples</CardTitle>
              <CardDescription>
                Real-world MCP server examples
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-muted-foreground">
                Explore example implementations of MCP servers in different languages
                and frameworks, with detailed code explanations.
              </p>
            </CardContent>
            <CardFooter>
              <Link 
                href="/servers/examples" 
                className="inline-flex items-center text-secondary hover:underline"
              >
                View examples <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </CardFooter>
          </Card>

          <Card className="flex flex-col">
            <CardHeader>
              <div className="mb-2 rounded-full bg-accent/10 p-2 w-10 h-10 flex items-center justify-center">
                <ExternalLink className="h-5 w-5 text-accent" />
              </div>
              <CardTitle>Deployment</CardTitle>
              <CardDescription>
                Deploy your MCP server to production
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-muted-foreground">
                Learn how to deploy your MCP server to various cloud platforms
                and configure it for high availability and scalability.
              </p>
            </CardContent>
            <CardFooter>
              <Link 
                href="/servers/deployment" 
                className="inline-flex items-center text-accent hover:underline"
              >
                Deployment options <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </CardFooter>
          </Card>
        </section>

        {/* CTA */}
        <section className="rounded-xl gradient-bg p-8 shadow-sm">
          <div className="mx-auto max-w-3xl rounded-xl bg-background p-8 shadow-md">
            <div className="text-center">
              <h2 className="mb-4 text-2xl font-bold md:text-3xl">Ready to Build Your Own MCP Server?</h2>
              <p className="mb-6 text-muted-foreground">
                Start with our step-by-step implementation guide and explore example code to accelerate your development.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button asChild size="lg">
                  <Link href="/servers/implementation">
                    Implementation Guide
                  </Link>
                </Button>
                <Button variant="outline" asChild size="lg">
                  <Link href="/resources/mcp-server-starter">
                    Get Starter Code
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
} 