import Link from "next/link"
import { Metadata } from "next"
import { ArrowRight, BookOpen, Info, CheckCircle2, Star, FileText, Lightbulb, Code } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { generateMetadata } from "@/lib/content-utils"
import { Callout } from "@/components/content"

export const metadata: Metadata = generateMetadata({
  title: "Introduction to AI-Assisted Development",
  description: "Begin your journey to mastering AI-powered development techniques and unlock new levels of productivity.",
  keywords: ["AI-assisted development", "introduction", "getting started", "AI tools", "productivity"],
  section: "introduction"
})

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
                      <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                      <span>Fundamental concepts of AI-assisted development</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                      <span>Practical benefits for individuals and teams</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                      <span>How to get started with AI coding tools</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                      <span>Practical workflow integration techniques</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <h2>AI-Assisted Development: A New Paradigm</h2>
            <p>
              AI-assisted development represents a fundamental shift in how software is created. 
              By pairing human creativity and expertise with AI's pattern recognition and code generation 
              capabilities, developers can achieve unprecedented levels of productivity and quality.
            </p>
            <p>
              Unlike traditional development where every line of code must be manually written, AI assistance 
              offers intelligent collaboration that can:
            </p>
            <ul>
              <li>Generate code based on natural language descriptions</li>
              <li>Complete partial code with context-aware suggestions</li>
              <li>Explain unfamiliar code patterns and algorithms</li>
              <li>Automate routine tasks like testing and documentation</li>
              <li>Suggest optimizations and potential improvements</li>
            </ul>
          </div>
        </section>

        {/* Topic cards */}
        <section>
          <h2 className="text-3xl font-bold tracking-tight mb-6">Core Topics</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <div className="rounded-full w-12 h-12 bg-primary/10 flex items-center justify-center mb-2">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Core Concepts</CardTitle>
                <CardDescription>
                  Understand the fundamental principles and technologies
                </CardDescription>
              </CardHeader>
              <CardContent className="prose prose-sm dark:prose-invert">
                <ul>
                  <li>Large Language Models (LLMs)</li>
                  <li>Context management</li>
                  <li>Model Context Protocol (MCP)</li>
                  <li>AI-Human collaboration patterns</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Link 
                  href="/introduction/concepts" 
                  className="text-sm text-primary flex items-center"
                >
                  <span>Learn core concepts</span>
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="rounded-full w-12 h-12 bg-primary/10 flex items-center justify-center mb-2">
                  <Star className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Key Benefits</CardTitle>
                <CardDescription>
                  Discover the advantages for productivity and quality
                </CardDescription>
              </CardHeader>
              <CardContent className="prose prose-sm dark:prose-invert">
                <ul>
                  <li>Accelerated development cycles</li>
                  <li>Improved code quality and consistency</li>
                  <li>Learning acceleration for teams</li>
                  <li>Focus on high-value problem solving</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Link 
                  href="/introduction/benefits" 
                  className="text-sm text-primary flex items-center"
                >
                  <span>Explore benefits</span>
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="rounded-full w-12 h-12 bg-primary/10 flex items-center justify-center mb-2">
                  <Lightbulb className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Getting Started</CardTitle>
                <CardDescription>
                  Practical steps to begin your AI-assisted journey
                </CardDescription>
              </CardHeader>
              <CardContent className="prose prose-sm dark:prose-invert">
                <ul>
                  <li>Choosing the right AI tools</li>
                  <li>Environment setup</li>
                  <li>Effective prompt techniques</li>
                  <li>Workflow integration strategies</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Link 
                  href="/introduction/getting-started" 
                  className="text-sm text-primary flex items-center"
                >
                  <span>Get started</span>
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </CardFooter>
            </Card>
          </div>
        </section>

        {/* Key points section */}
        <section>
          <div className="prose prose-lg dark:prose-invert max-w-none mb-8">
            <h2>Why AI-Assisted Development Matters</h2>
            <p>
              The integration of AI into development workflows isn't just a trend—it's a 
              fundamental shift that addresses long-standing challenges in software development:
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5 text-primary" />
                  <span>Overcoming Complexity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  As software systems grow more complex, AI assistance helps developers navigate 
                  and understand intricate codebases, complex dependencies, and sophisticated patterns.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-primary" />
                  <span>Developer Experience</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  AI tools reduce cognitive load by handling routine tasks, allowing developers 
                  to focus on creative problem-solving and higher-level architecture decisions.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <span>Knowledge Accessibility</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  AI brings vast programming knowledge directly into the development environment, 
                  democratizing access to best practices and patterns across all experience levels.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowRight className="h-5 w-5 text-primary" />
                  <span>Future-Ready Skills</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Learning to effectively collaborate with AI tools represents a crucial skill set 
                  for developers as the industry continues to evolve with AI integration.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Getting started CTA */}
        <section className="mt-8">
          <div className="rounded-xl bg-primary/5 p-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight mb-4">
                Ready to Begin Your AI-Assisted Development Journey?
              </h2>
              <p className="text-xl text-muted-foreground mb-6">
                Explore our comprehensive guides to transform your development workflow.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg">
                  <Link href="/introduction/concepts">
                    Explore Core Concepts
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/introduction/getting-started">
                    Getting Started Guide
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