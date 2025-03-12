"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { FloatingChat } from "@/components/chat/floating-chat"

export default function BuildingServersPage() {
  return (
    <>
      <MainLayout>
        <div className="container py-12">
          <h1 className="text-4xl font-bold mb-6">Building MCP Servers</h1>
          <div className="prose dark:prose-invert max-w-none">
            <p className="lead">
              Learn how to build servers that implement the Model Context Protocol (MCP) to create powerful AI-assisted development tools.
            </p>
            
            <h2>MCP Server Architecture</h2>
            <p>
              An MCP server acts as an intermediary between the user and AI models, managing context, handling requests, and formatting responses. This section covers the core components of an MCP server architecture.
            </p>
            
            <h2>Context Management</h2>
            <p>
              Effective context management is crucial for MCP servers. This includes:
            </p>
            <ul>
              <li>Storing and retrieving conversation history</li>
              <li>Managing context windows for large language models</li>
              <li>Implementing context compression techniques</li>
              <li>Handling context prioritization</li>
            </ul>
            
            <h2>Request Processing</h2>
            <p>
              MCP servers need to process requests efficiently:
            </p>
            <ol>
              <li>Parsing user inputs</li>
              <li>Extracting intent and parameters</li>
              <li>Augmenting requests with relevant context</li>
              <li>Routing to appropriate model endpoints</li>
            </ol>
            
            <h2>Response Formatting</h2>
            <p>
              Properly formatted responses improve the user experience:
            </p>
            <ul>
              <li>Structuring responses for clarity</li>
              <li>Implementing markdown or rich text formatting</li>
              <li>Handling code blocks and syntax highlighting</li>
              <li>Supporting interactive elements</li>
            </ul>
            
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