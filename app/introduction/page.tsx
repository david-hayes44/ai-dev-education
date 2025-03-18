import Link from "next/link"
import { Metadata } from "next"
import { ArrowRight, BookOpen, Info, CheckCircle2, Star, FileText, Lightbulb, Code } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { generateMetadata } from "@/lib/content-utils"
import { Callout, ContentPage } from "@/components/content"

export const metadata: Metadata = generateMetadata({
  title: "Introduction to AI-Assisted Development",
  description: "Begin your journey to mastering AI-powered development techniques and unlock new levels of productivity.",
  keywords: ["AI-assisted development", "introduction", "getting started", "AI tools", "productivity"],
  section: "introduction"
})

export default function IntroductionPage() {
  return (
    <ContentPage>
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
          <h1 id="introduction" className="mb-2 text-4xl font-extrabold tracking-tight md:text-5xl">
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
            <h2 id="overview" className="text-2xl font-bold mb-4">What is AI-Assisted Development?</h2>
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="lead text-xl">
                AI-assisted development is revolutionizing how developers create software by providing intelligent tools that enhance productivity, improve code quality, and streamline workflows.
              </p>
              <p>
                Through the power of large language models (LLMs) and specialized AI systems, developers can now leverage AI to assist with coding tasks, generate solutions, refactor code, explain complex concepts, and much more.
              </p>
            </div>
          </section>

          {/* Key benefits section */}
          <section>
            <h2 id="benefits" className="text-2xl font-bold mb-4">Key Benefits</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <CardTitle className="text-lg">Enhanced Productivity</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Spend less time on repetitive tasks and more time on creative problem-solving.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <CardTitle className="text-lg">Improved Code Quality</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Catch bugs early, receive intelligent refactoring suggestions, and maintain consistent code standards.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-500" />
                    <CardTitle className="text-lg">Better Documentation</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Generate comprehensive documentation that helps teammates understand your code more easily.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Getting started section */}
          <section>
            <h2 id="getting-started" className="text-2xl font-bold mb-4">Getting Started</h2>
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p>
                The journey to becoming proficient with AI-assisted development starts with understanding the core concepts and tools available to you:
              </p>
              
              <Callout type="info" title="Start small and build gradually">
                Focus on integrating AI tools into your existing workflow before trying to transform your entire development process.
              </Callout>
              
              <h3 id="first-steps" className="text-xl font-semibold mt-6">First Steps</h3>
              <ol>
                <li>Explore AI coding assistants like GitHub Copilot, Cursor, or Codeium</li>
                <li>Learn about prompt engineering techniques to get better results</li>
                <li>Understand the Model Context Protocol (MCP) for enhanced AI interactions</li>
                <li>Practice integrating AI tools into your daily development workflow</li>
              </ol>
              
              <div className="mt-6 flex gap-4">
                <Button asChild>
                  <Link href="/introduction/getting-started">
                    Getting Started Guide
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/introduction/concepts">
                    Core Concepts
                    <BookOpen className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </ContentPage>
  )
} 