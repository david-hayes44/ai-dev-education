"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { FloatingChat } from "@/components/chat/floating-chat"

export default function McpPage() {
  return (
    <>
      <MainLayout>
        <div className="container py-12">
          <h1 className="text-4xl font-bold mb-6">MCP Guides</h1>
          <div className="prose dark:prose-invert max-w-none">
            <p className="lead">
              The Model Context Protocol (MCP) is a framework for enhancing communication between humans and AI models. These guides will help you understand and implement MCP in your development workflow.
            </p>
            
            <h2>Understanding MCP</h2>
            <p>
              MCP provides a structured way to communicate with AI models, ensuring that the model has the right context to provide accurate and helpful responses. It defines how information is shared between the human and the AI.
            </p>
            
            <h2>Core MCP Principles</h2>
            <ul>
              <li>Context preservation across interactions</li>
              <li>Structured information exchange</li>
              <li>Explicit intent signaling</li>
              <li>Efficient context management</li>
            </ul>
            
            <h2>MCP Components</h2>
            <p>
              An MCP implementation typically includes:
            </p>
            <ol>
              <li>Context managers that maintain state across interactions</li>
              <li>Protocol handlers that format requests and responses</li>
              <li>Intent classifiers that help the AI understand the human&apos;s goals</li>
              <li>Context augmentation systems that enrich the conversation with relevant information</li>
            </ol>
            
            <h2>Implementing MCP</h2>
            <p>
              To implement MCP in your development workflow:
            </p>
            <ol>
              <li>Define the context structure for your specific use case</li>
              <li>Create handlers for different types of interactions</li>
              <li>Implement context persistence mechanisms</li>
              <li>Design clear intent signaling conventions</li>
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