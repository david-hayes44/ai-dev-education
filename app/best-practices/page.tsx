"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { FloatingChat } from "@/components/chat/floating-chat"

export default function BestPracticesPage() {
  return (
    <>
      <MainLayout>
        <div className="container py-12">
          <h1 className="text-4xl font-bold mb-6">Best Practices</h1>
          <div className="prose dark:prose-invert max-w-none">
            <p className="lead">
              Discover best practices for AI-assisted development and effective use of the Model Context Protocol (MCP).
            </p>
            
            <h2>Effective Prompting</h2>
            <p>
              The quality of AI assistance depends significantly on how you communicate with the model. This section covers techniques for writing clear, specific prompts that yield better results.
            </p>
            
            <h2>Code Review</h2>
            <p>
              When using AI-generated code, thorough review is essential:
            </p>
            <ul>
              <li>Verify logic and correctness</li>
              <li>Check for security vulnerabilities</li>
              <li>Ensure adherence to project standards</li>
              <li>Look for edge cases the AI might have missed</li>
            </ul>
            
            <h2>Iterative Development</h2>
            <p>
              AI-assisted development works best as an iterative process:
            </p>
            <ol>
              <li>Start with a clear problem statement</li>
              <li>Get initial AI suggestions</li>
              <li>Review and refine</li>
              <li>Provide feedback to the AI</li>
              <li>Repeat until satisfied</li>
            </ol>
            
            <h2>Context Management</h2>
            <p>
              Managing context effectively improves AI performance:
            </p>
            <ul>
              <li>Provide relevant background information</li>
              <li>Reference specific code or documentation</li>
              <li>Maintain conversation coherence</li>
              <li>Clear context when switching topics</li>
            </ul>
            
            <h2>Ethical Considerations</h2>
            <p>
              Using AI in development raises important ethical considerations:
            </p>
            <ul>
              <li>Proper attribution of AI-generated code</li>
              <li>Transparency with team members and clients</li>
              <li>Data privacy and security</li>
              <li>Avoiding over-reliance on AI</li>
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