"use client"

import Link from "next/link"
import Image from "next/image"
import { MainLayout } from "@/components/layout/main-layout"
import { FloatingChat } from "@/components/chat/floating-chat"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Command, Terminal, Code, MessageSquare, Search, Keyboard } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function CursorCoreFeaturesPage() {
  return (
    <>
      <MainLayout>
        <div className="container py-12 max-w-6xl">
          <div className="mb-8">
            <nav className="mb-4 flex items-center text-sm text-muted-foreground">
              <Link href="/" className="hover:text-foreground">Home</Link>
              <span className="mx-2 text-muted-foreground">/</span>
              <Link href="/tools" className="hover:text-foreground">Tools</Link>
              <span className="mx-2 text-muted-foreground">/</span>
              <Link href="/tools/cursor" className="hover:text-foreground">Cursor</Link>
              <span className="mx-2 text-muted-foreground">/</span>
              <span className="text-foreground">Core Features</span>
            </nav>

            <h1 className="text-4xl font-bold mb-4">Cursor Core Features & Shortcuts</h1>
            <p className="text-xl text-muted-foreground">
              Master the essential features and keyboard shortcuts to boost your productivity with Cursor.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <div className="lg:col-span-2">
              <div className="prose dark:prose-invert max-w-none">
                <h2>Essential Cursor Commands</h2>
                <p>
                  Cursor enhances the familiar VSCode interface with powerful AI capabilities. These are the core commands
                  you'll use daily to interact with Cursor's AI features.
                </p>

                <h3>Command-K: Quick Changes</h3>
                <p>
                  The Command-K shortcut (Ctrl+K on Windows/Linux) is one of the most powerful features in Cursor.
                  It allows you to make quick edits to selected code with natural language instructions.
                </p>

                <div className="not-prose my-6 bg-slate-50 dark:bg-slate-900 rounded-lg p-6">
                  <h4 className="text-xl font-semibold mb-4 flex items-center">
                    <Command className="h-5 w-5 mr-2 text-primary" />
                    How to use Command-K
                  </h4>
                  <ol className="space-y-3 mb-4">
                    <li className="flex items-start">
                      <span className="bg-blue-500/20 text-blue-700 dark:text-blue-300 p-1 rounded-full mr-2 mt-0.5">1</span>
                      <span>Select the code you want to modify</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-blue-500/20 text-blue-700 dark:text-blue-300 p-1 rounded-full mr-2 mt-0.5">2</span>
                      <span>Press Command-K (Ctrl+K on Windows/Linux)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-blue-500/20 text-blue-700 dark:text-blue-300 p-1 rounded-full mr-2 mt-0.5">3</span>
                      <span>Type your instruction (e.g., "Make this function more efficient")</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-blue-500/20 text-blue-700 dark:text-blue-300 p-1 rounded-full mr-2 mt-0.5">4</span>
                      <span>Press Enter and wait for the AI to modify your code</span>
                    </li>
                  </ol>
                  <div className="bg-primary/5 rounded p-3 text-sm">
                    <strong>Example instructions:</strong>
                    <ul className="mt-2 space-y-1">
                      <li>"Convert this to use async/await"</li>
                      <li>"Add error handling to this function"</li>
                      <li>"Optimize this database query"</li>
                      <li>"Add JSDoc comments to this function"</li>
                      <li>"Refactor to use a more functional approach"</li>
                    </ul>
                  </div>
                </div>

                <h3>Command-I: AI Chat</h3>
                <p>
                  Command-I (Ctrl+I on Windows/Linux) opens an inline chat with the AI about your selected code
                  or current file. Unlike Command-K which immediately modifies code, Command-I starts an
                  interactive conversation where you can ask questions, get explanations, or request guidance.
                </p>

                <div className="not-prose my-6 bg-slate-50 dark:bg-slate-900 rounded-lg p-6">
                  <h4 className="text-xl font-semibold mb-4 flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2 text-primary" />
                    How to use Command-I
                  </h4>
                  <ol className="space-y-3 mb-4">
                    <li className="flex items-start">
                      <span className="bg-blue-500/20 text-blue-700 dark:text-blue-300 p-1 rounded-full mr-2 mt-0.5">1</span>
                      <span>Select code (optional) or position your cursor where you want context</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-blue-500/20 text-blue-700 dark:text-blue-300 p-1 rounded-full mr-2 mt-0.5">2</span>
                      <span>Press Command-I (Ctrl+I on Windows/Linux)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-blue-500/20 text-blue-700 dark:text-blue-300 p-1 rounded-full mr-2 mt-0.5">3</span>
                      <span>Type your question or prompt</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-blue-500/20 text-blue-700 dark:text-blue-300 p-1 rounded-full mr-2 mt-0.5">4</span>
                      <span>Chat with the AI and ask follow-up questions</span>
                    </li>
                  </ol>
                  <div className="bg-primary/5 rounded p-3 text-sm">
                    <strong>Example prompts:</strong>
                    <ul className="mt-2 space-y-1">
                      <li>"Explain what this code does"</li>
                      <li>"What's wrong with this function?"</li>
                      <li>"How can I make this code more secure?"</li>
                      <li>"Generate unit tests for this component"</li>
                      <li>"Write documentation for this API"</li>
                    </ul>
                  </div>
                </div>

                <h3>Terminal AI Assistance</h3>
                <p>
                  Cursor provides AI assistance directly in the terminal, helping you with shell commands,
                  debugging errors, and understanding outputs. Simply press Command-K (Ctrl+K) in the terminal
                  to activate Terminal AI.
                </p>

                <div className="not-prose my-6 bg-slate-50 dark:bg-slate-900 rounded-lg p-6">
                  <h4 className="text-xl font-semibold mb-4 flex items-center">
                    <Terminal className="h-5 w-5 mr-2 text-primary" />
                    Using Terminal AI
                  </h4>
                  <ol className="space-y-3 mb-4">
                    <li className="flex items-start">
                      <span className="bg-blue-500/20 text-blue-700 dark:text-blue-300 p-1 rounded-full mr-2 mt-0.5">1</span>
                      <span>Open the terminal in Cursor (Ctrl+` or through the menu)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-blue-500/20 text-blue-700 dark:text-blue-300 p-1 rounded-full mr-2 mt-0.5">2</span>
                      <span>Run a command or encounter an error</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-blue-500/20 text-blue-700 dark:text-blue-300 p-1 rounded-full mr-2 mt-0.5">3</span>
                      <span>Press Command-K (Ctrl+K on Windows/Linux)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-blue-500/20 text-blue-700 dark:text-blue-300 p-1 rounded-full mr-2 mt-0.5">4</span>
                      <span>Ask for help or explanation</span>
                    </li>
                  </ol>
                  <div className="bg-primary/5 rounded p-3 text-sm">
                    <strong>Example terminal prompts:</strong>
                    <ul className="mt-2 space-y-1">
                      <li>"Fix this error"</li>
                      <li>"What does this output mean?"</li>
                      <li>"Generate a command to find all JS files over 100KB"</li>
                      <li>"Create a Docker build command for this project"</li>
                      <li>"Explain what happened in the last git merge"</li>
                    </ul>
                  </div>
                </div>

                <h3>AI Code Completion</h3>
                <p>
                  Cursor provides intelligent code completion that goes beyond simple autocomplete. 
                  It understands context and can generate entire functions, methods, or code blocks
                  based on your comments or function signatures.
                </p>
                <p>
                  Simply start typing and Cursor will suggest completions. Press Tab to accept the suggestion.
                  For more extensive completions, try providing a detailed comment describing what you want to implement.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-100 dark:from-purple-950/50 dark:to-blue-950/50 dark:border-purple-900">
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold mb-2 flex items-center">
                    <Keyboard className="h-5 w-5 mr-2 text-primary" />
                    Keyboard Shortcuts Cheat Sheet
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span>AI Chat</span>
                      <span className="font-mono bg-background/80 px-1.5 py-0.5 rounded text-xs">Ctrl/Cmd + I</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Quick Edit</span>
                      <span className="font-mono bg-background/80 px-1.5 py-0.5 rounded text-xs">Ctrl/Cmd + K</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Terminal AI</span>
                      <span className="font-mono bg-background/80 px-1.5 py-0.5 rounded text-xs">Ctrl/Cmd + K</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Command Palette</span>
                      <span className="font-mono bg-background/80 px-1.5 py-0.5 rounded text-xs">Ctrl/Cmd + Shift + P</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Open Settings</span>
                      <span className="font-mono bg-background/80 px-1.5 py-0.5 rounded text-xs">Ctrl/Cmd + ,</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Open Terminal</span>
                      <span className="font-mono bg-background/80 px-1.5 py-0.5 rounded text-xs">Ctrl/Cmd + `</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Search in Files</span>
                      <span className="font-mono bg-background/80 px-1.5 py-0.5 rounded text-xs">Ctrl/Cmd + Shift + F</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Go to File</span>
                      <span className="font-mono bg-background/80 px-1.5 py-0.5 rounded text-xs">Ctrl/Cmd + P</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold mb-3">Common Tasks</h3>
                  <Tabs defaultValue="generate">
                    <TabsList className="grid grid-cols-3 mb-4">
                      <TabsTrigger value="generate">Generate</TabsTrigger>
                      <TabsTrigger value="explain">Explain</TabsTrigger>
                      <TabsTrigger value="refactor">Refactor</TabsTrigger>
                    </TabsList>

                    <TabsContent value="generate" className="space-y-2">
                      <p className="text-sm text-muted-foreground mb-2">Try these prompts to generate code</p>
                      <ul className="space-y-2 text-sm">
                        <li className="bg-primary/5 p-2 rounded">"Create a React component for a login form"</li>
                        <li className="bg-primary/5 p-2 rounded">"Generate a function to filter an array by multiple properties"</li>
                        <li className="bg-primary/5 p-2 rounded">"Write a unit test for this function"</li>
                      </ul>
                    </TabsContent>

                    <TabsContent value="explain" className="space-y-2">
                      <p className="text-sm text-muted-foreground mb-2">Try these prompts to understand code</p>
                      <ul className="space-y-2 text-sm">
                        <li className="bg-primary/5 p-2 rounded">"Explain this algorithm step by step"</li>
                        <li className="bg-primary/5 p-2 rounded">"What does this error message mean?"</li>
                        <li className="bg-primary/5 p-2 rounded">"How does this regex pattern work?"</li>
                      </ul>
                    </TabsContent>

                    <TabsContent value="refactor" className="space-y-2">
                      <p className="text-sm text-muted-foreground mb-2">Try these prompts to improve code</p>
                      <ul className="space-y-2 text-sm">
                        <li className="bg-primary/5 p-2 rounded">"Refactor this to use the repository pattern"</li>
                        <li className="bg-primary/5 p-2 rounded">"Make this code more performant"</li>
                        <li className="bg-primary/5 p-2 rounded">"Convert this class component to a functional component"</li>
                      </ul>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold mb-3">Learning Path</h3>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center text-white font-medium text-sm">1</div>
                      <div className="ml-3">
                        <p className="font-medium">Setup & Installation</p>
                        <p className="text-xs text-muted-foreground">Get Cursor up and running</p>
                      </div>
                    </div>
                    <div className="w-0.5 h-6 bg-green-500 ml-4"></div>
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center text-white font-medium text-sm">2</div>
                      <div className="ml-3">
                        <p className="font-medium text-green-700 dark:text-green-300">Core Features</p>
                        <p className="text-xs text-muted-foreground">You are here</p>
                      </div>
                    </div>
                    <div className="w-0.5 h-6 bg-muted ml-4"></div>
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-medium text-sm">3</div>
                      <div className="ml-3">
                        <Link href="/tools/cursor/workflows">
                          <p className="font-medium hover:text-primary">Development Workflows</p>
                          <p className="text-xs text-muted-foreground">Apply Cursor to real projects</p>
                        </Link>
                      </div>
                    </div>
                    <div className="w-0.5 h-6 bg-muted ml-4"></div>
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-medium text-sm">4</div>
                      <div className="ml-3">
                        <Link href="/tools/cursor/advanced-features">
                          <p className="font-medium hover:text-primary">Advanced Features</p>
                          <p className="text-xs text-muted-foreground">Master YOLO mode and more</p>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex justify-between items-center mt-8 pt-8 border-t">
            <Link href="/tools/cursor/setup">
              <Button variant="outline">
                <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
                Installation & Setup
              </Button>
            </Link>
            <Link href="/tools/cursor/workflows">
              <Button>
                Development Workflows
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </MainLayout>
      <FloatingChat />
    </>
  )
} 