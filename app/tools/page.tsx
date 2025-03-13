import Link from "next/link"
import { ArrowRight, Wrench, Monitor, Terminal, Bot, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function ToolsPage() {
  return (
    <div className="container mx-auto px-6 sm:px-8 py-10 md:py-12">
      {/* Header with breadcrumb */}
      <div className="mb-8">
        <nav className="mb-4 flex items-center text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <span className="mx-2 text-muted-foreground">/</span>
          <span className="text-foreground">AI Development Tools</span>
        </nav>
        <h1 className="mb-2 text-4xl font-extrabold tracking-tight md:text-5xl">
          AI Development Tools
        </h1>
        <p className="text-xl text-muted-foreground">
          Discover tools that enhance your AI-assisted development workflow
        </p>
      </div>

      {/* Introduction */}
      <section className="mb-12">
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <p className="lead text-xl">
            The right tools can dramatically improve your productivity and code quality when
            working with AI assistants. This guide introduces essential tools for AI-assisted development,
            with a focus on those that support the Model Context Protocol (MCP).
          </p>
          
          <div className="my-8 rounded-xl bg-card p-6 border">
            <h3 className="mb-4 text-xl font-bold">Why Tools Matter</h3>
            <p>
              AI-assisted development is about more than just asking an AI to write code for you.
              Specialized tools help you:
            </p>
            <ul>
              <li>Provide better context to AI models</li>
              <li>Move seamlessly between different AI assistants</li>
              <li>Integrate AI capabilities into your existing workflow</li>
              <li>Balance human expertise with AI capabilities</li>
            </ul>
          </div>
        </div>
      </section>

      {/* IDE Category */}
      <section className="mb-12">
        <div className="mb-6">
          <h2 className="text-3xl font-bold">AI-Enhanced IDEs</h2>
          <p className="mt-2 text-lg text-muted-foreground">
            Modern development environments with integrated AI capabilities
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="flex flex-col">
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Monitor className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Cursor</CardTitle>
              <CardDescription>
                IDE built for AI-assisted development
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <span className="font-medium mr-2">MCP Support:</span>
                  <span className="text-green-500">Full</span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="font-medium mr-2">Platforms:</span>
                  <span>Windows, macOS, Linux</span>
                </div>
                <p className="mt-4 text-muted-foreground">
                  A powerful IDE built specifically for AI-assisted development, with deep 
                  integration of AI capabilities and full MCP support.
                </p>
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/tools/cursor">
                    Learn More <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href="https://cursor.sh" target="_blank">
                    Website <ExternalLink className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardFooter>
          </Card>
          
          <Card className="flex flex-col">
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10">
                <Monitor className="h-6 w-6 text-secondary" />
              </div>
              <CardTitle>VS Code + Extensions</CardTitle>
              <CardDescription>
                Enhanced VS Code for AI development
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <span className="font-medium mr-2">MCP Support:</span>
                  <span className="text-amber-500">Partial</span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="font-medium mr-2">Platforms:</span>
                  <span>Windows, macOS, Linux</span>
                </div>
                <p className="mt-4 text-muted-foreground">
                  Visual Studio Code with AI-specific extensions that add code generation,
                  explanation, and other AI capabilities.
                </p>
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/tools/vscode">
                    Learn More <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href="https://code.visualstudio.com/" target="_blank">
                    Website <ExternalLink className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardFooter>
          </Card>
          
          <Card className="flex flex-col">
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                <Terminal className="h-6 w-6 text-accent" />
              </div>
              <CardTitle>JetBrains AI Assistant</CardTitle>
              <CardDescription>
                AI capabilities for JetBrains IDEs
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <span className="font-medium mr-2">MCP Support:</span>
                  <span className="text-red-500">Limited</span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="font-medium mr-2">Platforms:</span>
                  <span>Windows, macOS, Linux</span>
                </div>
                <p className="mt-4 text-muted-foreground">
                  AI capabilities integrated into the JetBrains suite of IDEs,
                  including IntelliJ IDEA, PyCharm, WebStorm, and others.
                </p>
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/tools/jetbrains">
                    Learn More <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href="https://www.jetbrains.com/ai/" target="_blank">
                    Website <ExternalLink className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </section>
      
      {/* AI Assistant Category */}
      <section className="mb-12">
        <div className="mb-6">
          <h2 className="text-3xl font-bold">AI Models & Assistants</h2>
          <p className="mt-2 text-lg text-muted-foreground">
            AI models specifically tuned for code and development tasks
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="flex flex-col">
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Bot className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Claude</CardTitle>
              <CardDescription>
                Anthropic's conversational AI assistant
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <span className="font-medium mr-2">Best For:</span>
                  <span>Code understanding, generation, documentation</span>
                </div>
                <p className="mt-4 text-muted-foreground">
                  Claude excels at understanding complex code contexts and generating
                  high-quality, well-documented code across multiple languages.
                </p>
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <Button variant="outline" size="sm" asChild>
                <Link href="/tools/claude">
                  Learn More <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="flex flex-col">
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10">
                <Bot className="h-6 w-6 text-secondary" />
              </div>
              <CardTitle>OpenAI Codex</CardTitle>
              <CardDescription>
                GPT models specialized for code
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <span className="font-medium mr-2">Best For:</span>
                  <span>Code completion, generation, transformation</span>
                </div>
                <p className="mt-4 text-muted-foreground">
                  OpenAI's Codex models power tools like GitHub Copilot and offer
                  powerful code completion and generation capabilities.
                </p>
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <Button variant="outline" size="sm" asChild>
                <Link href="/tools/openai">
                  Learn More <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="flex flex-col">
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                <Bot className="h-6 w-6 text-accent" />
              </div>
              <CardTitle>Other AI Models</CardTitle>
              <CardDescription>
                Additional AI assistants for development
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-muted-foreground">
                Explore other AI models and assistants that can be integrated into
                your development workflow, including open-source options.
              </p>
            </CardContent>
            <CardFooter className="pt-0">
              <Button variant="outline" size="sm" asChild>
                <Link href="/tools/other-models">
                  Explore Models <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>
      
      {/* Specialized Tools Category */}
      <section className="mb-12">
        <div className="mb-6">
          <h2 className="text-3xl font-bold">Specialized Tools</h2>
          <p className="mt-2 text-lg text-muted-foreground">
            Tools for specific AI development tasks
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="flex flex-col">
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Wrench className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>MCP Validator</CardTitle>
              <CardDescription>
                Validate your MCP implementation
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-muted-foreground">
                A tool for validating that your MCP implementation follows the specification
                and is compatible with other MCP-enabled tools.
              </p>
            </CardContent>
            <CardFooter className="pt-0">
              <Button variant="outline" size="sm" asChild>
                <Link href="/tools/mcp-validator">
                  Learn More <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="flex flex-col">
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10">
                <Wrench className="h-6 w-6 text-secondary" />
              </div>
              <CardTitle>AI Plugin Development Kit</CardTitle>
              <CardDescription>
                Build plugins for AI assistants
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-muted-foreground">
                A toolkit for developing plugins that extend the capabilities of AI assistants
                and integrate with other development tools.
              </p>
            </CardContent>
            <CardFooter className="pt-0">
              <Button variant="outline" size="sm" asChild>
                <Link href="/tools/plugin-dev-kit">
                  Learn More <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="flex flex-col">
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                <Wrench className="h-6 w-6 text-accent" />
              </div>
              <CardTitle>Context Manager</CardTitle>
              <CardDescription>
                Manage AI context across tools
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-muted-foreground">
                A utility for managing and synchronizing context between different AI tools,
                ensuring consistent context across your development workflow.
              </p>
            </CardContent>
            <CardFooter className="pt-0">
              <Button variant="outline" size="sm" asChild>
                <Link href="/tools/context-manager">
                  Learn More <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>
      
      {/* CTA */}
      <section className="rounded-xl gradient-bg p-8 shadow-sm">
        <div className="mx-auto max-w-3xl rounded-xl bg-background p-8 shadow-md">
          <div className="text-center">
            <h2 className="mb-4 text-2xl font-bold md:text-3xl">Ready to Enhance Your Workflow?</h2>
            <p className="mb-6 text-muted-foreground">
              Explore our detailed guides for each tool to learn how to integrate them into your development process.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg">
                <Link href="/learning-paths/ai-tools-mastery">
                  AI Tools Learning Path
                </Link>
              </Button>
              <Button variant="outline" asChild size="lg">
                <Link href="/resources/tool-comparison">
                  Compare All Tools
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
} 