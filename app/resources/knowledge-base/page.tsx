import Link from "next/link"
import { ArrowRight, Book, Bookmark, FileSearch, Filter, GitBranch, Search, ShieldCheck, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

export default function KnowledgeBasePage() {
  return (
    <div className="container mx-auto px-6 sm:px-8 py-10 md:py-12">
      {/* Header with breadcrumb */}
      <div className="mb-8">
        <nav className="mb-4 flex items-center text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <span className="mx-2 text-muted-foreground">/</span>
          <Link href="/resources" className="hover:text-foreground">
            Resources
          </Link>
          <span className="mx-2 text-muted-foreground">/</span>
          <span className="text-foreground">Knowledge Base</span>
        </nav>
        <h1 className="mb-2 text-4xl font-extrabold tracking-tight md:text-5xl">
          Knowledge Base
        </h1>
        <p className="text-xl text-muted-foreground">
          Comprehensive guides, references, and resources for AI-assisted development
        </p>
      </div>

      {/* Search and filter section */}
      <div className="mb-8 rounded-lg border bg-card p-6 shadow-sm">
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Search Knowledge Base</h2>
          <p className="text-muted-foreground mb-4">
            Find specific topics, rules, guides, and more throughout our knowledge base
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Search for topics, rules, or keywords..." 
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Filters</span>
            </Button>
            <Button>
              <Search className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Search</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Featured categories */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Featured Categories</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="flex flex-col">
            <CardHeader>
              <div className="mb-2 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <ShieldCheck className="h-5 w-5 text-primary" />
              </div>
              <CardTitle>Cursor Rules</CardTitle>
              <CardDescription>Best practices for AI-assisted development</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-muted-foreground">
                Browse a comprehensive collection of Cursor rules to enhance your AI-assisted 
                development workflows and improve collaboration.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="gap-2">
                <Link href="/resources/knowledge-base/cursor-rules">
                  Explore Rules <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="flex flex-col">
            <CardHeader>
              <div className="mb-2 h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center">
                <Book className="h-5 w-5 text-secondary" />
              </div>
              <CardTitle>Reference Guides</CardTitle>
              <CardDescription>Technical documentation and API references</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-muted-foreground">
                In-depth technical documentation, API references, and implementation 
                guides for building with MCP and AI tools.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="gap-2">
                <Link href="/resources/knowledge-base/reference-guides">
                  View References <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="flex flex-col">
            <CardHeader>
              <div className="mb-2 h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                <GitBranch className="h-5 w-5 text-accent" />
              </div>
              <CardTitle>Code Examples</CardTitle>
              <CardDescription>Ready-to-use code patterns and snippets</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-muted-foreground">
                Browse practical code examples, patterns, and snippets to accelerate
                your development with AI tools and MCP implementations.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="gap-2">
                <Link href="/resources/knowledge-base/code-examples">
                  Explore Code <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* Cursor Rules Explorer (Featured Section) */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Cursor Rules Explorer</h2>
          <Button asChild variant="outline" size="sm">
            <Link href="/resources/knowledge-base/cursor-rules">
              View All Rules
            </Link>
          </Button>
        </div>

        <Tabs defaultValue="all" className="mb-6">
          <TabsList className="w-full grid grid-cols-4 mb-6">
            <TabsTrigger value="all">All Rules</TabsTrigger>
            <TabsTrigger value="codingStandards">Coding Standards</TabsTrigger>
            <TabsTrigger value="collaboration">Collaboration</TabsTrigger>
            <TabsTrigger value="projectSetup">Project Setup</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="pt-2">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border p-4 hover:bg-accent/5 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <h3 className="font-medium">best-practices</h3>
                  </div>
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                    General
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Guidelines for creating clean, maintainable, and effective code when working with AI assistants.
                </p>
                <div className="mt-3">
                  <Link href="/resources/knowledge-base/cursor-rules/best-practices" className="text-sm text-primary hover:underline">
                    View Rule
                  </Link>
                </div>
              </div>

              <div className="rounded-lg border p-4 hover:bg-accent/5 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-secondary" />
                    <h3 className="font-medium">collab-rule</h3>
                  </div>
                  <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/20">
                    Collaboration
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Best practices for optimizing AI and human development interactions in collaborative environments.
                </p>
                <div className="mt-3">
                  <Link href="/resources/knowledge-base/cursor-rules/collab-rule" className="text-sm text-secondary hover:underline">
                    View Rule
                  </Link>
                </div>
              </div>

              <div className="rounded-lg border p-4 hover:bg-accent/5 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-accent" />
                    <h3 className="font-medium">cursor_project_rules</h3>
                  </div>
                  <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
                    Project Setup
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Guidelines to follow when setting up new projects with AI assistance to ensure consistency and quality.
                </p>
                <div className="mt-3">
                  <Link href="/resources/knowledge-base/cursor-rules/cursor_project_rules" className="text-sm text-accent hover:underline">
                    View Rule
                  </Link>
                </div>
              </div>

              <div className="rounded-lg border p-4 hover:bg-accent/5 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <h3 className="font-medium">project-docs-rules</h3>
                  </div>
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                    Documentation
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Standards for creating consistent, comprehensive project documentation with AI assistance.
                </p>
                <div className="mt-3">
                  <Link href="/resources/knowledge-base/cursor-rules/project-docs-rules" className="text-sm text-primary hover:underline">
                    View Rule
                  </Link>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="codingStandards" className="text-center pt-6">
            <FileSearch className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">Coding Standards</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Explore our complete collection of coding standards rules in the full Cursor Rules explorer.
            </p>
            <Button asChild>
              <Link href="/resources/knowledge-base/cursor-rules?category=codingStandards">
                View All Coding Standards
              </Link>
            </Button>
          </TabsContent>
          
          <TabsContent value="collaboration" className="text-center pt-6">
            <FileSearch className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">Collaboration Rules</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Explore our complete collection of collaboration rules in the full Cursor Rules explorer.
            </p>
            <Button asChild>
              <Link href="/resources/knowledge-base/cursor-rules?category=collaboration">
                View All Collaboration Rules
              </Link>
            </Button>
          </TabsContent>
          
          <TabsContent value="projectSetup" className="text-center pt-6">
            <FileSearch className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">Project Setup Rules</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Explore our complete collection of project setup rules in the full Cursor Rules explorer.
            </p>
            <Button asChild>
              <Link href="/resources/knowledge-base/cursor-rules?category=projectSetup">
                View All Project Setup Rules
              </Link>
            </Button>
          </TabsContent>
        </Tabs>
      </section>

      {/* Recently Updated */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Recently Updated</h2>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col sm:flex-row gap-4 rounded-lg border p-4 hover:bg-accent/5 transition-colors">
              <div className="flex-grow">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="font-medium">Advanced Context Management Techniques</h3>
                  <Badge variant="outline" className="text-xs">Updated</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  Learn advanced strategies for managing context in MCP implementations, including new techniques for large context windows.
                </p>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Bookmark className="mr-1 h-3 w-3" /> Reference Guide
                  <span className="mx-2">•</span>
                  <span>Updated 3 days ago</span>
                </div>
              </div>
              <div className="flex items-center">
                <Button asChild variant="ghost" size="sm">
                  <Link href="/resources/knowledge-base/reference-guides/advanced-context-management">
                    Read Article <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="rounded-xl gradient-bg p-8 shadow-sm">
        <div className="mx-auto max-w-3xl rounded-xl bg-background p-8 shadow-md">
          <div className="text-center">
            <h2 className="mb-4 text-2xl font-bold md:text-3xl">
              Ready to Optimize Your AI Workflows?
            </h2>
            <p className="mb-6 text-muted-foreground">
              Explore our Cursor Rules to implement best practices for AI-assisted development in your team.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg">
                <Link href="/resources/knowledge-base/cursor-rules">
                  Explore Cursor Rules
                </Link>
              </Button>
              <Button variant="outline" asChild size="lg">
                <Link href="/learning-paths">
                  Browse Learning Paths
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
} 