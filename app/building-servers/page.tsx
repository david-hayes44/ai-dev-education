"use client"

import Link from "next/link"
import { Container } from "@/components/ui/container"
import { PageHeader } from "@/components/page-header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ArrowRight, Code, Server, Database} from "lucide-react"
import { LegacyTableOfContents } from "@/components/content"

export default function BuildingServersPage() {
  return (
    <>
      <PageHeader
        title="Building MCP Servers"
        description="Learn how to implement your own MCP servers using different technologies"
      />
      
      <Container className="py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Table of Contents - only visible on larger screens */}
          <div className="hidden lg:block lg:col-span-3">
            <LegacyTableOfContents 
              items={[
                {
                  id: "getting-started",
                  title: "Getting Started",
                  level: 2,
                },
                {
                  id: "server-technologies",
                  title: "Server Technologies",
                  level: 2,
                  children: [
                    {
                      id: "node-express",
                      title: "Node.js & Express",
                      level: 3,
                    },
                    {
                      id: "python-flask",
                      title: "Python & Flask",
                      level: 3,
                    },
                    {
                      id: "go-server",
                      title: "Go Server",
                      level: 3,
                    }
                  ]
                },
                {
                  id: "deployment-options",
                  title: "Deployment Options",
                  level: 2,
                },
                {
                  id: "advanced-features",
                  title: "Advanced Features",
                  level: 2,
                },
                {
                  id: "next-steps",
                  title: "Next Steps",
                  level: 2,
                }
              ]}
            />
          </div>
          
          {/* Main content */}
          <div className="lg:col-span-9">
            <div className="prose prose-lg dark:prose-invert mx-auto">
              <h2 id="getting-started">Getting Started</h2>
              <p>
                Building your own Model Context Protocol (MCP) server allows you to centralize context
                management for AI tools in your development workflow. This guide will walk you through 
                the process of setting up an MCP server using different technologies.
              </p>
              
              <p>
                Before diving into implementation, make sure you understand the following:
              </p>
              
              <ul>
                <li>The fundamental concepts of the Model Context Protocol</li>
                <li>The architecture of an MCP server (see <Link href="/servers/architecture" className="text-primary hover:underline">Server Architecture</Link>)</li>
                <li>Your specific requirements for context storage and management</li>
              </ul>

              <div className="bg-muted p-4 rounded-md mb-6">
                <p className="text-sm font-medium mb-2">Prerequisites</p>
                <ul className="text-sm space-y-1">
                  <li>Basic knowledge of web development and APIs</li>
                  <li>Familiarity with at least one server-side programming language</li>
                  <li>Understanding of database concepts</li>
                  <li>Local development environment set up</li>
                </ul>
              </div>

              <h2 id="server-technologies">Server Technologies</h2>
              <p>
                You can implement an MCP server using various technologies. Below are some popular options
                to consider, each with its own advantages.
              </p>

              <h3 id="node-express">Node.js & Express</h3>
              <p>
                Node.js with Express is a popular choice for building MCP servers due to its simplicity,
                performance, and extensive ecosystem.
              </p>

              <div className="bg-card p-4 rounded-lg border">
                <p className="font-medium">Key advantages:</p>
                <ul className="mt-2">
                  <li>JavaScript throughout your stack</li>
                  <li>Excellent JSON handling (native to JavaScript)</li>
                  <li>Wide range of database connectors</li>
                  <li>Active community and extensive packages</li>
                </ul>
              </div>

              <h3 id="python-flask">Python & Flask</h3>
              <p>
                Python with Flask provides a lightweight but powerful framework for building MCP servers,
                especially if you're already using Python in your workflow.
              </p>

              <div className="bg-card p-4 rounded-lg border">
                <p className="font-medium">Key advantages:</p>
                <ul className="mt-2">
                  <li>Clean, readable syntax</li>
                  <li>Strong data processing capabilities</li>
                  <li>Excellent for AI/ML integration</li>
                  <li>Simple to get started with</li>
                </ul>
              </div>

              <h3 id="go-server">Go Server</h3>
              <p>
                Go excels at building high-performance web servers with minimal resource usage,
                making it an excellent choice for production MCP servers.
              </p>

              <div className="bg-card p-4 rounded-lg border">
                <p className="font-medium">Key advantages:</p>
                <ul className="mt-2">
                  <li>Excellent performance and low resource usage</li>
                  <li>Strong concurrency support</li>
                  <li>Compiled language with static typing</li>
                  <li>Built-in HTTP server capabilities</li>
                </ul>
              </div>

              <h2 id="deployment-options">Deployment Options</h2>
              <p>
                Once you've built your MCP server, you'll need to deploy it. Here are some common
                deployment options to consider:
              </p>

              <ul>
                <li><strong>Self-hosted:</strong> Deploy on your own infrastructure for maximum control</li>
                <li><strong>Cloud providers:</strong> AWS, Google Cloud, or Azure for scalability</li>
                <li><strong>Platform-as-a-Service:</strong> Heroku, Vercel, or Netlify for simplicity</li>
                <li><strong>Containerization:</strong> Docker and Kubernetes for consistent deployment</li>
              </ul>

              <h2 id="advanced-features">Advanced Features</h2>
              <p>
                Once you have a basic MCP server working, consider implementing these advanced features:
              </p>

              <ul>
                <li><strong>Authentication and Authorization:</strong> Secure your server with JWT or OAuth</li>
                <li><strong>Versioning:</strong> Support versioning of context data</li>
                <li><strong>Webhooks:</strong> Notify other services when context changes</li>
                <li><strong>Rate Limiting:</strong> Protect your server from abuse</li>
                <li><strong>Analytics:</strong> Track usage patterns and optimize performance</li>
                <li><strong>Search:</strong> Implement advanced search capabilities for context data</li>
              </ul>

              <h2 id="next-steps">Next Steps</h2>
              <p>
                Ready to start building your MCP server? Check out these resources:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose mt-6">
                <Link 
                  href="/servers/implementation" 
                  className="flex items-center p-4 border rounded-lg hover:border-primary hover:bg-accent transition-colors"
                >
                  <div className="mr-4">
                    <Code className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Implementation Guide</h3>
                    <p className="text-sm text-muted-foreground">Step-by-step instructions for building servers</p>
                  </div>
                  <ArrowRight className="ml-auto h-5 w-5 text-muted-foreground" />
                </Link>
                
                <Link 
                  href="/servers/examples" 
                  className="flex items-center p-4 border rounded-lg hover:border-primary hover:bg-accent transition-colors"
                >
                  <div className="mr-4">
                    <Database className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Server Examples</h3>
                    <p className="text-sm text-muted-foreground">Example implementations in different languages</p>
                  </div>
                  <ArrowRight className="ml-auto h-5 w-5 text-muted-foreground" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </>
  )
} 