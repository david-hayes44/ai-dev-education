"use client"

import Link from "next/link"
import Image from "next/image"
import { MainLayout } from "@/components/layout/main-layout"
import { FloatingChat } from "@/components/chat/floating-chat"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Download, Command, Terminal, Layers, Brain, Users, Code, FileCode } from "lucide-react"

export default function CursorGuidePage() {
  return (
    <>
      <MainLayout>
        <div className="container py-12 max-w-6xl">
          <div className="mb-10">
            <h1 className="text-4xl font-bold mb-4">Cursor Setup & Usage Guide</h1>
            <p className="text-xl text-muted-foreground">
              A comprehensive guide to setting up and using Cursor for AI-assisted development, from beginner to advanced workflows.
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-6 mb-10">
            <div className="flex-1 bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-lg p-8">
              <h2 className="text-2xl font-bold mb-4">Why Cursor?</h2>
              <p className="mb-4">
                Cursor is a powerful code editor built on VSCode with integrated AI capabilities that can dramatically improve your development workflow.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <span className="bg-green-500/20 text-green-700 dark:text-green-300 p-1 rounded-full mr-2 mt-1">✓</span>
                  <span>AI-powered code generation and completion</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-green-500/20 text-green-700 dark:text-green-300 p-1 rounded-full mr-2 mt-1">✓</span>
                  <span>Intelligent code explanation and refactoring</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-green-500/20 text-green-700 dark:text-green-300 p-1 rounded-full mr-2 mt-1">✓</span>
                  <span>Built-in terminal AI assistance</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-green-500/20 text-green-700 dark:text-green-300 p-1 rounded-full mr-2 mt-1">✓</span>
                  <span>Advanced bug finding and fixing</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-green-500/20 text-green-700 dark:text-green-300 p-1 rounded-full mr-2 mt-1">✓</span>
                  <span>Workflow automation through YOLO mode</span>
                </li>
              </ul>
              <div>
                <Link href="https://cursor.sh" target="_blank">
                  <Button>
                    Download Cursor <Download className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="flex-1 bg-slate-50 dark:bg-slate-900 rounded-lg p-8">
              <h2 className="text-2xl font-bold mb-4">Getting Started</h2>
              <p className="mb-6">
                New to Cursor? Follow our step-by-step guide to get up and running quickly with AI-assisted development.
              </p>
              <div className="space-y-4">
                <Link href="/tools/cursor/setup">
                  <Button variant="outline" className="w-full justify-between">
                    <span>Installation & Setup</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/tools/cursor/core-features">
                  <Button variant="outline" className="w-full justify-between">
                    <span>Core Features & Shortcuts</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/tools/cursor/workflows">
                  <Button variant="outline" className="w-full justify-between">
                    <span>Development Workflows</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/tools/cursor/project-rules">
                  <Button variant="outline" className="w-full justify-between">
                    <span>Project Rules & Configuration</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <h2 className="text-3xl font-bold mb-6">Explore Cursor Guides</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            <Card>
              <CardHeader>
                <Command className="h-8 w-8 mb-2 text-primary" />
                <CardTitle>Core Features</CardTitle>
                <CardDescription>Learn the essential Cursor features that will immediately boost your productivity.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Command-K for quick changes</li>
                  <li>• Command-I for agent interactions</li>
                  <li>• Intelligent code completion</li>
                  <li>• Tab navigation techniques</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Link href="/tools/cursor/core-features">
                  <Button variant="ghost" size="sm" className="gap-2">
                    Learn more <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <Terminal className="h-8 w-8 mb-2 text-primary" />
                <CardTitle>YOLO Mode</CardTitle>
                <CardDescription>Discover how to unleash Cursor's automation capabilities with YOLO mode.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Automated testing and fixes</li>
                  <li>• Build error resolution</li>
                  <li>• Safe configuration options</li>
                  <li>• Practical use cases</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Link href="/tools/cursor/advanced-features">
                  <Button variant="ghost" size="sm" className="gap-2">
                    Learn more <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <Brain className="h-8 w-8 mb-2 text-primary" />
                <CardTitle>Context Management</CardTitle>
                <CardDescription>Learn how to optimize model context for more accurate AI responses.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Understanding model context</li>
                  <li>• Context enhancement techniques</li>
                  <li>• MCP integration with Cursor</li>
                  <li>• Handling complex projects</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Link href="/tools/cursor/context-management">
                  <Button variant="ghost" size="sm" className="gap-2">
                    Learn more <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-8 w-8 mb-2 text-primary" />
                <CardTitle>Team Collaboration</CardTitle>
                <CardDescription>Establish effective patterns for team-based usage of Cursor.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Shared context management</li>
                  <li>• Standardized workflows</li>
                  <li>• Code review for AI content</li>
                  <li>• Version control best practices</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Link href="/tools/cursor/team-collaboration">
                  <Button variant="ghost" size="sm" className="gap-2">
                    Learn more <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <Layers className="h-8 w-8 mb-2 text-primary" />
                <CardTitle>Workflows</CardTitle>
                <CardDescription>Integrate Cursor into different development approaches effectively.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Exploratory coding</li>
                  <li>• Test-driven development</li>
                  <li>• Debugging workflows</li>
                  <li>• Handling complex tasks</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Link href="/tools/cursor/workflows">
                  <Button variant="ghost" size="sm" className="gap-2">
                    Learn more <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <FileCode className="h-8 w-8 mb-2 text-primary" />
                <CardTitle>Project Rules</CardTitle>
                <CardDescription>Learn how to configure project-specific rules for better AI assistance.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Creating Cursor rules</li>
                  <li>• Implementation plans</li>
                  <li>• Custom prompt templates</li>
                  <li>• Project configuration</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Link href="/tools/cursor/project-rules">
                  <Button variant="ghost" size="sm" className="gap-2">
                    Learn more <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>

          <div className="bg-muted p-8 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Why AI-Assisted Development?</h2>
            <p className="mb-6">
              AI-assisted development represents a paradigm shift in how we write code. Rather than replacing developers,
              tools like Cursor augment their capabilities, allowing them to focus on higher-level problem solving.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-3">Traditional Development</h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>Manual coding of repetitive patterns</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>Time spent searching documentation</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>Manually resolving syntax errors</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>Context switching for minor tasks</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3">AI-Assisted Development</h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    <span>Focus on architecture and problem-solving</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    <span>Instant code generation for common patterns</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    <span>Automated error detection and fixing</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    <span>Reduced context switching with inline help</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
      <FloatingChat />
    </>
  )
} 