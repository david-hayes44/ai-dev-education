"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { FloatingChat } from "@/components/chat/floating-chat"

export default function IntegrationPage() {
  return (
    <>
      <MainLayout>
        <div className="container py-12">
          <h1 className="text-4xl font-bold mb-6">Integration</h1>
          <div className="prose dark:prose-invert max-w-none">
            <p className="lead">
              Learn how to integrate AI-assisted development tools and MCP into your existing development workflow and projects.
            </p>
            
            <h2>IDE Integration</h2>
            <p>
              Modern AI development tools can be integrated with popular IDEs like VS Code, Cursor, and JetBrains products. This section covers installation, configuration, and best practices for each environment.
            </p>
            
            <h2>CI/CD Pipeline Integration</h2>
            <p>
              AI can enhance your continuous integration and deployment pipelines by:
            </p>
            <ul>
              <li>Automating code reviews</li>
              <li>Suggesting optimizations</li>
              <li>Detecting potential issues before deployment</li>
              <li>Generating test cases</li>
            </ul>
            
            <h2>Team Collaboration</h2>
            <p>
              Integrating AI tools in a team environment requires:
            </p>
            <ol>
              <li>Establishing shared conventions for AI interactions</li>
              <li>Setting up team-wide access to AI resources</li>
              <li>Creating guidelines for reviewing AI-generated code</li>
              <li>Defining when and how to use AI assistance</li>
            </ol>
            
            <h2>API Integration</h2>
            <p>
              For more advanced use cases, you can integrate AI capabilities directly into your applications using APIs like OpenAI, Anthropic, or OpenRouter. This section covers authentication, request formatting, and response handling.
            </p>
            
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