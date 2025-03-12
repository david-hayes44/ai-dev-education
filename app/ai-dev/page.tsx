"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { FloatingChat } from "@/components/chat/floating-chat"

export default function AiDevPage() {
  return (
    <>
      <MainLayout>
        <div className="container py-12">
          <h1 className="text-4xl font-bold mb-6">AI-Dev Concepts</h1>
          <div className="prose dark:prose-invert max-w-none">
            <p className="lead">
              AI-assisted development is transforming how developers write code, debug issues, and design systems. This guide introduces key concepts and techniques.
            </p>
            
            <h2>What is AI-Assisted Development?</h2>
            <p>
              AI-assisted development refers to the use of artificial intelligence tools to enhance the software development process. These tools can help with code generation, debugging, refactoring, and more.
            </p>
            
            <h2>Key Benefits</h2>
            <ul>
              <li>Increased productivity through automated code generation</li>
              <li>Improved code quality with AI-powered suggestions</li>
              <li>Faster debugging and error resolution</li>
              <li>Enhanced learning through AI explanations of complex code</li>
            </ul>
            
            <h2>Common AI Development Tools</h2>
            <p>
              Modern AI development tools include code completion systems, pair programming assistants, and specialized code generation models. These tools integrate with your development environment to provide real-time assistance.
            </p>
            
            <h2>Getting Started</h2>
            <p>
              To begin with AI-assisted development:
            </p>
            <ol>
              <li>Choose an IDE with AI integration (like Cursor)</li>
              <li>Learn effective prompting techniques</li>
              <li>Understand the Model Context Protocol (MCP) for better AI-human collaboration</li>
              <li>Practice iterative development with AI feedback</li>
            </ol>
            
            <div className="bg-muted p-4 rounded-lg my-6">
              <p className="font-medium">Note: This is placeholder content. The actual educational content will be more comprehensive and include interactive code examples.</p>
            </div>
          </div>
        </div>
      </MainLayout>
      <FloatingChat />
    </>
  )
} 