import Link from "next/link"
import { Metadata } from "next"
import { ArrowRight, Code, TestTube, Lightbulb, PencilRuler } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { generateMetadata } from "@/lib/content-utils"

export const metadata: Metadata = generateMetadata({
  title: "AI-Assisted Development Workshops",
  description: "Practical, hands-on workshops for applying AI to real development workflows like testing, refactoring, and code review.",
  keywords: ["AI workshops", "testing", "practical", "hands-on", "Cursor", "Windsurf"],
  section: "workshops"
})

export default function WorkshopsPage() {
  return (
    <div className="container mx-auto px-6 sm:px-8 py-10 md:py-12">
      {/* Header with breadcrumb */}
      <div className="mb-8">
        <nav className="mb-4 flex items-center text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <span className="mx-2 text-muted-foreground">/</span>
          <span className="text-foreground">Workshops</span>
        </nav>
        <h1 className="mb-2 text-4xl font-extrabold tracking-tight md:text-5xl">
          AI-Assisted Development Workshops
        </h1>
        <p className="text-xl text-muted-foreground">
          Practical, hands-on guides for applying AI to real-world development tasks
        </p>
      </div>

      {/* Main content */}
      <div className="grid gap-12">
        {/* Overview section */}
        <section>
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="lead text-xl">
              Our workshops provide step-by-step guidance for applying AI tools to specific 
              development tasks. Unlike theoretical content, these workshops are designed 
              for active participation—you'll upload your own code, follow along with examples, 
              and see immediate results.
            </p>
            
            <div className="my-8 rounded-xl bg-primary/5 p-6">
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <div className="rounded-full bg-primary/10 p-2 text-primary">
                  <TestTube className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="mb-2 text-lg font-medium">Why Focus on Practical Application?</h3>
                  <p className="text-muted-foreground">
                    Testing, refactoring, and code review are perfect entry points for AI-assisted 
                    development. These discrete tasks have clear success criteria, can be completed 
                    in a single session, and demonstrate immediate benefits—making them ideal for 
                    learning how tools like Cursor and Windsurf can enhance your workflow.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Workshop cards */}
        <section>
          <h2 className="text-3xl font-bold tracking-tight mb-6">Available Workshops</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="flex flex-col">
              <CardHeader className="pb-3">
                <div className="rounded-full w-12 h-12 bg-primary/10 flex items-center justify-center mb-2">
                  <TestTube className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>AI-Assisted Testing Workshop</CardTitle>
                <CardDescription>
                  Learn how to use AI to generate, improve, and analyze tests
                </CardDescription>
              </CardHeader>
              <CardContent className="prose prose-sm dark:prose-invert flex-grow">
                <p>
                  This hands-on workshop teaches you how to leverage AI tools for testing, covering:
                </p>
                <ul>
                  <li>Generating unit tests with AI assistance</li>
                  <li>Improving test coverage through AI analysis</li>
                  <li>Using Test-Driven Development with AI</li>
                  <li>Testing legacy code with AI guidance</li>
                </ul>
                <p>
                  Perfect for developers who want to write better tests, faster, while maintaining 
                  high-quality standards.
                </p>
              </CardContent>
              <CardFooter>
                <Link 
                  href="/workshops/testing" 
                  className="text-sm text-primary flex items-center"
                >
                  <span>Begin workshop</span>
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </CardFooter>
            </Card>

            <Card className="flex flex-col opacity-75">
              <CardHeader className="pb-3">
                <div className="rounded-full w-12 h-12 bg-primary/10 flex items-center justify-center mb-2">
                  <PencilRuler className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>AI-Assisted Refactoring Workshop</CardTitle>
                <CardDescription>
                  Transform and improve code with AI guidance
                </CardDescription>
              </CardHeader>
              <CardContent className="prose prose-sm dark:prose-invert flex-grow">
                <p>
                  Learn practical techniques for refactoring code with AI assistance:
                </p>
                <ul>
                  <li>Identifying refactoring opportunities</li>
                  <li>Modernizing legacy code patterns</li>
                  <li>Improving code structure and organization</li>
                  <li>Maintaining functionality during refactoring</li>
                </ul>
                <p>
                  Ideal for developers working with existing codebases who want to improve quality 
                  and maintainability.
                </p>
              </CardContent>
              <CardFooter>
                <span className="text-sm text-muted-foreground flex items-center">
                  <span>Coming soon</span>
                </span>
              </CardFooter>
            </Card>
          </div>
        </section>

        {/* Upload your own code section */}
        <section>
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="flex flex-col gap-6 md:flex-row md:items-center">
              <div className="rounded-full bg-primary/10 p-4 text-primary md:p-5">
                <Code className="h-8 w-8 md:h-10 md:w-10" />
              </div>
              <div className="flex-1">
                <h3 className="mb-2 text-2xl font-bold">Upload Your Own Code</h3>
                <p className="mb-4 text-muted-foreground md:mb-0">
                  Our workshops allow you to upload your own tests or code samples 
                  to see firsthand how AI can help with your specific challenges.
                </p>
              </div>
              <Button asChild>
                <Link href="/workshops/testing">
                  Try with your code <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Why this helps section */}
        <section>
          <h2 className="text-3xl font-bold tracking-tight mb-6">Why Workshops Help Engineers</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TestTube className="h-5 w-5 text-primary" />
                  <span>Practice Over Theory</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Engineers learn best by doing. These workshops provide concrete, executable 
                  examples rather than abstract concepts.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  <span>Immediate Application</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  The skills learned can be applied immediately to your daily work, 
                  showing immediate productivity benefits.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5 text-primary" />
                  <span>Real-World Context</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Using your own code means you're solving real problems, not 
                  artificial examples disconnected from your work.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  )
} 