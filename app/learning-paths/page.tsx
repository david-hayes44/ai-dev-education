import Link from "next/link"
import { ArrowRight, BookOpen, Code, GraduationCap, Layers, Lightbulb, Rocket } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function LearningPathsPage() {
  return (
    <div className="container mx-auto px-6 sm:px-8 py-10 md:py-12">
      {/* Header with breadcrumb */}
      <div className="mb-8">
        <nav className="mb-4 flex items-center text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <span className="mx-2 text-muted-foreground">/</span>
          <span className="text-foreground">Learning Paths</span>
        </nav>
        <h1 className="mb-2 text-4xl font-extrabold tracking-tight md:text-5xl">
          Learning Paths
        </h1>
        <p className="text-xl text-muted-foreground">
          Structured learning journeys to master AI-assisted development
        </p>
      </div>

      {/* Hero section */}
      <div className="relative mb-12 overflow-hidden rounded-xl bg-primary/10 p-8 shadow-sm dark:bg-primary/5">
        <div className="absolute -right-10 -top-10 h-40 w-40 rotate-12 rounded-3xl bg-primary/20 blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 h-40 w-40 -rotate-12 rounded-3xl bg-accent/20 blur-3xl"></div>
        
        <div className="relative z-10 grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="mb-4 text-2xl font-bold md:text-3xl">Your AI Dev Journey</h2>
            <p className="mb-6 text-muted-foreground">
              Our learning paths provide structured, step-by-step guides to help you build expertise in AI-assisted development.
              Choose the path that aligns with your goals and experience level.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild>
                <Link href="#beginner-path">
                  Start Learning <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="#skill-assessment">
                  Take Skill Assessment <GraduationCap className="mr-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
          <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
            <h3 className="mb-4 text-lg font-medium">Available Learning Paths</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="mt-1 rounded-full bg-green-100 p-1 dark:bg-green-900">
                  <BookOpen className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <span className="font-medium">Beginner Path</span>
                  <p className="text-sm text-muted-foreground">AI foundations & basic prompting</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1 rounded-full bg-blue-100 p-1 dark:bg-blue-900">
                  <Code className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <span className="font-medium">Developer Path</span>
                  <p className="text-sm text-muted-foreground">AI tools for coding workflows</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1 rounded-full bg-purple-100 p-1 dark:bg-purple-900">
                  <Layers className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <span className="font-medium">MCP Architect Path</span>
                  <p className="text-sm text-muted-foreground">Designing & building MCP servers</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1 rounded-full bg-amber-100 p-1 dark:bg-amber-900">
                  <Rocket className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <span className="font-medium">Enterprise Path</span>
                  <p className="text-sm text-muted-foreground">AI deployment at scale</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Learning paths tabs */}
      <Tabs defaultValue="beginner" className="mb-12">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="beginner">Beginner</TabsTrigger>
          <TabsTrigger value="developer">Developer</TabsTrigger>
          <TabsTrigger value="architect">MCP Architect</TabsTrigger>
          <TabsTrigger value="enterprise">Enterprise</TabsTrigger>
        </TabsList>
        
        {/* Beginner path */}
        <TabsContent value="beginner" className="pt-6">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-4" id="beginner-path">Beginner Path</h2>
            <p className="text-xl text-muted-foreground mb-2">
              Start your AI-assisted development journey with the fundamentals
            </p>
            <div className="flex gap-2 mb-6">
              <Badge variant="outline" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 border-green-200 dark:border-green-800">
                Beginner Friendly
              </Badge>
              <Badge variant="outline" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                4-6 hours
              </Badge>
            </div>
            <p className="text-muted-foreground">
              This path introduces you to AI-assisted development concepts and gets you comfortable 
              with basic prompting techniques. Perfect for developers new to AI tools.
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="relative pl-8 before:absolute before:left-3 before:top-0 before:h-full before:w-0.5 before:bg-border">
              <div className="absolute left-0 top-1 flex h-6 w-6 items-center justify-center rounded-full border bg-background text-center font-bold">1</div>
              <h3 className="text-xl font-semibold mb-2">Introduction to AI-Assisted Development</h3>
              <p className="text-muted-foreground mb-4">
                Learn the core concepts of how AI can enhance your development workflow and understand
                the foundations of generative AI technology.
              </p>
              <Button asChild variant="outline" size="sm">
                <Link href="/introduction/concepts">
                  Start Module <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            
            <div className="relative pl-8 before:absolute before:left-3 before:top-0 before:h-full before:w-0.5 before:bg-border">
              <div className="absolute left-0 top-1 flex h-6 w-6 items-center justify-center rounded-full border bg-background text-center font-bold">2</div>
              <h3 className="text-xl font-semibold mb-2">Basic Prompting Techniques</h3>
              <p className="text-muted-foreground mb-4">
                Master the art of crafting effective prompts for AI tools to get more accurate and useful responses
                for your development tasks.
              </p>
              <Button asChild variant="outline" size="sm">
                <Link href="/best-practices/prompting-basics">
                  Start Module <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            
            <div className="relative pl-8 before:absolute before:left-3 before:top-0 before:h-full before:w-0.5 before:bg-border">
              <div className="absolute left-0 top-1 flex h-6 w-6 items-center justify-center rounded-full border bg-background text-center font-bold">3</div>
              <h3 className="text-xl font-semibold mb-2">Setting Up Your First AI-Assisted Project</h3>
              <p className="text-muted-foreground mb-4">
                Walk through setting up a development environment with AI tools and complete a 
                simple project with AI assistance.
              </p>
              <Button asChild variant="outline" size="sm">
                <Link href="/tools/getting-started">
                  Start Module <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            
            <div className="relative pl-8">
              <div className="absolute left-0 top-1 flex h-6 w-6 items-center justify-center rounded-full border bg-background text-center font-bold">4</div>
              <h3 className="text-xl font-semibold mb-2">Understanding AI Limitations & Best Practices</h3>
              <p className="text-muted-foreground mb-4">
                Learn about the limitations of AI tools and develop best practices for effectively
                integrating them into your workflow.
              </p>
              <Button asChild variant="outline" size="sm">
                <Link href="/best-practices/limitations">
                  Start Module <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
          
          <div className="mt-8 flex justify-center">
            <Button asChild size="lg">
              <Link href="/learning-paths/beginner/start">
                Begin This Path
              </Link>
            </Button>
          </div>
        </TabsContent>
        
        {/* Developer path - just a placeholder for now */}
        <TabsContent value="developer" className="pt-6">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-4">Developer Path</h2>
            <p className="text-xl text-muted-foreground mb-2">
              Leverage AI tools to enhance your coding workflow
            </p>
            <div className="flex gap-2 mb-6">
              <Badge variant="outline" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                Intermediate
              </Badge>
              <Badge variant="outline" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                8-10 hours
              </Badge>
            </div>
            <p className="text-muted-foreground">
              This path teaches you how to effectively use AI coding assistants, MCP-enabled IDEs,
              and other AI tools to accelerate your development workflow.
            </p>
          </div>
          
          <div className="rounded-lg border p-8 text-center">
            <Lightbulb className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">Coming Soon</h3>
            <p className="text-muted-foreground mb-6">
              We're currently developing this learning path. Check back soon or subscribe for updates.
            </p>
            <Button variant="outline">Subscribe for Updates</Button>
          </div>
        </TabsContent>
        
        {/* Architect path - placeholder */}
        <TabsContent value="architect" className="pt-6">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-4">MCP Architect Path</h2>
            <p className="text-xl text-muted-foreground mb-2">
              Design and build custom MCP servers for AI applications
            </p>
            <div className="flex gap-2 mb-6">
              <Badge variant="outline" className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 border-purple-200 dark:border-purple-800">
                Advanced
              </Badge>
              <Badge variant="outline" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                12-15 hours
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Learn how to architect and implement custom MCP servers that power AI-assisted
              development tools and applications.
            </p>
          </div>
          
          <div className="rounded-lg border p-8 text-center">
            <Lightbulb className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">Coming Soon</h3>
            <p className="text-muted-foreground mb-6">
              We're currently developing this learning path. Check back soon or subscribe for updates.
            </p>
            <Button variant="outline">Subscribe for Updates</Button>
          </div>
        </TabsContent>
        
        {/* Enterprise path - placeholder */}
        <TabsContent value="enterprise" className="pt-6">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-4">Enterprise Path</h2>
            <p className="text-xl text-muted-foreground mb-2">
              Deploy and scale AI development tools across your organization
            </p>
            <div className="flex gap-2 mb-6">
              <Badge variant="outline" className="bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300 border-amber-200 dark:border-amber-800">
                Advanced
              </Badge>
              <Badge variant="outline" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                15-20 hours
              </Badge>
            </div>
            <p className="text-muted-foreground">
              This path focuses on enterprise-grade deployment, security, compliance, and management
              of AI development tools at scale.
            </p>
          </div>
          
          <div className="rounded-lg border p-8 text-center">
            <Lightbulb className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">Coming Soon</h3>
            <p className="text-muted-foreground mb-6">
              We're currently developing this learning path. Check back soon or subscribe for updates.
            </p>
            <Button variant="outline">Subscribe for Updates</Button>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Featured learning resources */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6">Featured Learning Resources</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>AI Dev Certification</CardTitle>
              <CardDescription>Get certified in AI-assisted development</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Our certification program validates your skills in using AI tools for development
                and demonstrates your expertise to employers.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline">
                <Link href="/resources/certification">
                  Learn More
                </Link>
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Interactive Tutorials</CardTitle>
              <CardDescription>Hands-on learning experiences</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Practice using AI tools with our interactive tutorials that provide
                immediate feedback and guidance.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline">
                <Link href="/resources/tutorials">
                  Explore Tutorials
                </Link>
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Community Learning</CardTitle>
              <CardDescription>Learn with and from others</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Join our community of learners to share experiences, get help,
                and collaborate on AI-assisted development projects.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline">
                <Link href="/resources/community">
                  Join Community
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
            <h2 className="mb-4 text-2xl font-bold md:text-3xl">Ready to Start Your AI Dev Journey?</h2>
            <p className="mb-6 text-muted-foreground">
              Begin with our beginner path or take a skill assessment to find the right learning path for you.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg">
                <Link href="/learning-paths/beginner/start">
                  Start Beginner Path
                </Link>
              </Button>
              <Button variant="outline" asChild size="lg">
                <Link href="/learning-paths/assessment">
                  Take Skill Assessment
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
} 