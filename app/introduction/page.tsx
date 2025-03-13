import Link from "next/link"
import { ArrowRight, BookOpen, Info, CheckCircle2, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function IntroductionPage() {
  return (
    <div className="container mx-auto px-6 sm:px-8 py-10 md:py-12">
      {/* Header with breadcrumb */}
      <div className="mb-8">
        <nav className="mb-4 flex items-center text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <span className="mx-2 text-muted-foreground">/</span>
          <span className="text-foreground">Introduction</span>
        </nav>
        <h1 className="mb-2 text-4xl font-extrabold tracking-tight md:text-5xl">
          Introduction to AI-Assisted Development
        </h1>
        <p className="text-xl text-muted-foreground">
          Begin your journey to mastering AI-powered development techniques
        </p>
      </div>

      {/* Main content */}
      <div className="grid gap-12">
        {/* Overview section */}
        <section>
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="lead text-xl">
              AI-assisted development is transforming how developers write, review, and maintain code. 
              This guide introduces the core concepts and helps you understand how to integrate AI 
              effectively into your development workflow.
            </p>
            
            <p>
              Throughout this section, you'll learn the foundational elements of AI-assisted development, 
              key benefits, and how to get started with tools that support the Model Context Protocol (MCP).
            </p>

            <div className="my-8 rounded-xl bg-muted p-6">
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-primary/10 p-2 text-primary">
                  <Info className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="mb-2 text-lg font-medium">What You'll Learn</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" /> 
                      Core concepts of AI-assisted development
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" /> 
                      Benefits and limitations of AI tools
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" /> 
                      How to effectively prompt AI for better results
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" /> 
                      Setting up your first AI-assisted project
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Topics grid */}
        <section>
          <h2 className="mb-6 text-3xl font-bold">Explore Topics</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Topic 1 */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-xl">Core Concepts</CardTitle>
                <CardDescription>
                  Understand the fundamental principles of AI-assisted development
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Explore key concepts like prompt engineering, context management, and
                  the role of Large Language Models in development.
                </p>
              </CardContent>
              <CardFooter>
                <Link 
                  href="/introduction/concepts" 
                  className="inline-flex items-center text-primary hover:underline"
                >
                  Learn more <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </CardFooter>
            </Card>

            {/* Topic 2 */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-xl">Benefits</CardTitle>
                <CardDescription>
                  Discover how AI tools can enhance your development workflow
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Learn about productivity gains, code quality improvements, and
                  onboarding advantages provided by AI-assisted development.
                </p>
              </CardContent>
              <CardFooter>
                <Link 
                  href="/introduction/benefits" 
                  className="inline-flex items-center text-primary hover:underline"
                >
                  Explore benefits <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </CardFooter>
            </Card>

            {/* Topic 3 */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-xl">Getting Started</CardTitle>
                <CardDescription>
                  Set up your first AI-assisted development environment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Follow our step-by-step guide to configure your development 
                  environment with MCP-compatible tools.
                </p>
              </CardContent>
              <CardFooter>
                <Link 
                  href="/introduction/getting-started" 
                  className="inline-flex items-center text-primary hover:underline"
                >
                  Get started <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </CardFooter>
            </Card>
          </div>
        </section>

        {/* Featured resource */}
        <section className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            <div className="rounded-full bg-primary/10 p-4 text-primary md:p-5">
              <Star className="h-8 w-8 md:h-10 md:w-10" />
            </div>
            <div className="flex-1">
              <h3 className="mb-2 text-2xl font-bold">AI Development Basics Guide</h3>
              <p className="mb-4 text-muted-foreground md:mb-0">
                Our comprehensive guide helps beginners understand the fundamentals 
                of working with AI coding assistants.
              </p>
            </div>
            <Button asChild>
              <Link href="/resources/ai-dev-basics-guide">
                Read Guide <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>

        {/* Next steps */}
        <section>
          <h2 className="mb-6 text-3xl font-bold">Next Steps</h2>
          <p className="mb-6 text-lg text-muted-foreground">
            After exploring the introduction, continue your journey with these recommended sections:
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Link 
              href="/mcp" 
              className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-sm transition-colors hover:bg-muted"
            >
              <div className="rounded-full bg-secondary/10 p-2 text-secondary">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium">Understanding MCP</h3>
                <p className="text-sm text-muted-foreground">
                  Learn about the Model Context Protocol
                </p>
              </div>
              <ArrowRight className="ml-auto h-5 w-5 text-muted-foreground" />
            </Link>
            
            <Link 
              href="/best-practices" 
              className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-sm transition-colors hover:bg-muted"
            >
              <div className="rounded-full bg-accent/10 p-2 text-accent">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium">Best Practices</h3>
                <p className="text-sm text-muted-foreground">
                  Effective patterns for AI-assisted development
                </p>
              </div>
              <ArrowRight className="ml-auto h-5 w-5 text-muted-foreground" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
} 