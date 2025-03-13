"use client"

import Link from "next/link"
import { ArrowRight, CheckSquare, Info, AlertTriangle, BookOpen, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { MainLayout } from "@/components/layout/main-layout"
import { FloatingChat } from "@/components/chat/floating-chat"

export default function BestPracticesPage() {
  return (
    <>
      <MainLayout>
        <div className="container mx-auto px-6 sm:px-8 py-10 md:py-12">
          {/* Header with breadcrumb */}
          <div className="mb-8">
            <nav className="mb-4 flex items-center text-sm text-muted-foreground">
              <Link href="/" className="hover:text-foreground">
                Home
              </Link>
              <span className="mx-2 text-muted-foreground">/</span>
              <span className="text-foreground">Best Practices</span>
            </nav>
            <h1 className="mb-2 text-4xl font-extrabold tracking-tight md:text-5xl">
              Best Practices
            </h1>
            <p className="text-xl text-muted-foreground">
              Optimize your AI-assisted development workflow with proven techniques
            </p>
          </div>

          {/* Featured card */}
          <div className="mb-12 rounded-xl border bg-card p-6 shadow-sm">
            <div className="flex flex-col gap-6 md:flex-row md:items-center">
              <div className="rounded-full bg-primary/10 p-4 text-primary md:p-5">
                <Star className="h-8 w-8 md:h-10 md:w-10" />
              </div>
              <div className="flex-1">
                <h3 className="mb-2 text-2xl font-bold">Cursor Rules for AI-Assisted Development</h3>
                <p className="mb-4 text-muted-foreground md:mb-0">
                  Our comprehensive guide to creating effective Cursor rules that enhance AI collaboration
                  and maintain code quality.
                </p>
              </div>
              <Button asChild>
                <Link href="/best-practices/cursor-rules">
                  Read Guide <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Main content */}
          <div className="grid gap-12">
            {/* Introduction section */}
            <section>
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="lead text-xl">
                  Following best practices for AI-assisted development ensures you get the most value from
                  AI tools while maintaining high code quality and security standards.
                </p>
                
                <p>
                  This guide covers essential practices for prompt engineering, context management, 
                  code review, and integrating AI tools into your development workflow.
                </p>

                <div className="my-8 rounded-xl bg-muted p-6">
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-primary/10 p-2 text-primary">
                      <Info className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="mb-2 text-lg font-medium">What You'll Learn</h3>
                      <p className="text-muted-foreground">
                        The best practices in this section are organized into categories covering different
                        aspects of AI-assisted development, from effective prompting to ensuring security.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Categories */}
            <Tabs defaultValue="prompting" className="mt-6">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:w-auto">
                <TabsTrigger value="prompting">Prompting</TabsTrigger>
                <TabsTrigger value="context">Context</TabsTrigger>
                <TabsTrigger value="review">Code Review</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
              </TabsList>
              
              <TabsContent value="prompting" className="mt-6">
                <div className="grid gap-6">
                  <h2 className="text-2xl font-bold">Effective Prompting</h2>
                  <p className="text-muted-foreground">
                    Crafting effective prompts is essential for getting high-quality, relevant responses from AI assistants.
                  </p>
                  
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                      <AccordionTrigger className="text-lg font-medium">Be Specific and Clear</AccordionTrigger>
                      <AccordionContent>
                        <div className="prose dark:prose-invert">
                          <p>
                            Clearly state what you want the AI to do, providing all necessary information upfront.
                            Include details such as programming language, frameworks, patterns to follow, and any constraints.
                          </p>
                          <div className="rounded-md bg-muted p-4">
                            <h4 className="text-sm font-medium">Example: Good Prompt</h4>
                            <p className="text-sm text-muted-foreground">
                              "Create a React component that displays a paginated list of users. 
                              The component should use TypeScript, follow the repository's existing styling patterns, 
                              support filtering by name, and handle loading/error states."
                            </p>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="item-2">
                      <AccordionTrigger className="text-lg font-medium">Provide Context</AccordionTrigger>
                      <AccordionContent>
                        <div className="prose dark:prose-invert">
                          <p>
                            Include relevant background information and context about your codebase or the problem you're solving.
                            This helps the AI understand your needs better.
                          </p>
                          <div className="rounded-md bg-muted p-4">
                            <h4 className="text-sm font-medium">Example: Good Prompt</h4>
                            <p className="text-sm text-muted-foreground">
                              "I'm working on a Next.js e-commerce site that uses Tailwind for styling and React Query for data fetching.
                              I need a component that shows product recommendations based on the currently viewed item. 
                              The API endpoint is already set up at '/api/recommendations?productId=123'."
                            </p>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="item-3">
                      <AccordionTrigger className="text-lg font-medium">Use Iterative Refinement</AccordionTrigger>
                      <AccordionContent>
                        <div className="prose dark:prose-invert">
                          <p>
                            Instead of expecting perfect results from a single prompt, use an iterative approach.
                            Start with a basic request, then refine with follow-up prompts that build on previous responses.
                          </p>
                          <div className="rounded-md bg-muted p-4">
                            <h4 className="text-sm font-medium">Example: Iterative Process</h4>
                            <ol className="mt-2 space-y-2 text-sm text-muted-foreground">
                              <li>Initial: "Create a basic authentication system using NextAuth.js"</li>
                              <li>Refinement: "Add Google and GitHub as OAuth providers"</li>
                              <li>Further refinement: "Update the UI to match our existing design system"</li>
            </ol>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                  
                  <div className="mt-4">
                    <Button asChild>
                      <Link href="/best-practices/effective-prompting">
                        View Complete Prompting Guide <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="context" className="mt-6">
                <div className="grid gap-6">
                  <h2 className="text-2xl font-bold">Context Management</h2>
                  <p className="text-muted-foreground">
                    Effectively managing context ensures AI tools have the information they need to provide relevant assistance.
                  </p>
                  
                  <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-green-500/10">
                          <CheckSquare className="h-4 w-4 text-green-500" />
                        </div>
                        <CardTitle>Do: Provide Relevant Files</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          When asking for help with a specific component or function, make sure to include
                          related files that provide context, such as parent components, utility functions,
                          or type definitions.
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/10">
                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                        </div>
                        <CardTitle>Don't: Overload with Irrelevant Context</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          Including too many files or unrelated code can overwhelm the AI and lead to less
                          relevant responses. Be selective about what context you provide.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="mt-4">
                    <Button asChild>
                      <Link href="/best-practices/context-management">
                        View Complete Context Guide <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="review" className="mt-6">
                <div className="grid gap-6">
                  <h2 className="text-2xl font-bold">AI-Assisted Code Review</h2>
                  <p className="text-muted-foreground">
                    Learn how to effectively use AI to enhance your code review process without compromising quality.
                  </p>
                  
                  <div className="mt-4">
                    <Button asChild>
                      <Link href="/best-practices/ai-code-review">
                        View Code Review Guide <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="security" className="mt-6">
                <div className="grid gap-6">
                  <h2 className="text-2xl font-bold">Security Considerations</h2>
                  <p className="text-muted-foreground">
                    Ensure your AI-assisted development workflow maintains security best practices.
                  </p>
                  
                  <div className="grid gap-6 md:grid-cols-2">
                    <Card className="border-destructive/30">
                      <CardHeader>
                        <CardTitle className="text-lg">Data Privacy</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          Be mindful of sharing sensitive information with AI assistants, including API keys,
                          passwords, personally identifiable information, and proprietary code.
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-destructive/30">
                      <CardHeader>
                        <CardTitle className="text-lg">Code Verification</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          Always review and verify AI-generated code for security vulnerabilities,
                          especially when handling user input, authentication, or data processing.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="mt-4">
                    <Button asChild>
                      <Link href="/best-practices/security">
                        View Security Guide <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Resources grid */}
            <section>
              <h2 className="mb-6 text-3xl font-bold">Related Resources</h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader className="pb-3">
                    <div className="mb-2 rounded-full bg-primary/10 p-2 w-10 h-10 flex items-center justify-center">
                      <BookOpen className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle>Prompt Engineering Guide</CardTitle>
                    <CardDescription>
                      Master the art of effective AI prompting
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      A comprehensive guide to crafting effective prompts for different AI development tasks.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Link 
                      href="/resources/prompt-engineering" 
                      className="inline-flex items-center text-primary hover:underline"
                    >
                      Read guide <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <div className="mb-2 rounded-full bg-secondary/10 p-2 w-10 h-10 flex items-center justify-center">
                      <CheckSquare className="h-5 w-5 text-secondary" />
                    </div>
                    <CardTitle>AI Workflow Templates</CardTitle>
                    <CardDescription>
                      Ready-to-use workflows for common development tasks
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Optimized workflows for bug fixing, feature development, refactoring, and more.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Link 
                      href="/resources/workflow-templates" 
                      className="inline-flex items-center text-secondary hover:underline"
                    >
                      Browse templates <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <div className="mb-2 rounded-full bg-accent/10 p-2 w-10 h-10 flex items-center justify-center">
                      <Info className="h-5 w-5 text-accent" />
                    </div>
                    <CardTitle>Common Pitfalls</CardTitle>
                    <CardDescription>
                      Mistakes to avoid in AI-assisted development
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Learn about common pitfalls and how to avoid them when working with AI coding assistants.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Link 
                      href="/best-practices/common-pitfalls" 
                      className="inline-flex items-center text-accent hover:underline"
                    >
                      Learn more <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </CardFooter>
                </Card>
            </div>
            </section>
          </div>
        </div>
      </MainLayout>
      <FloatingChat />
    </>
  )
} 