"use client"

import Link from "next/link"
import { MainLayout } from "@/components/layout/main-layout"
import { FloatingChat } from "@/components/chat/floating-chat"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ArrowRight, Code, Server, Database, Shield, Cloud } from "lucide-react"

export default function BuildingServersPage() {
  return (
    <>
      <MainLayout>
        <div className="container py-12">
          <div className="mb-8">
            <nav className="mb-4 flex items-center text-sm text-muted-foreground">
              <Link href="/" className="hover:text-foreground">
                Home
              </Link>
              <span className="mx-2 text-muted-foreground">/</span>
              <span className="text-foreground">Building MCP Servers</span>
            </nav>
            <h1 className="text-4xl font-bold mb-4">Building MCP Servers</h1>
            <p className="text-xl text-muted-foreground">
              Learn how to build servers that implement the Model Context Protocol (MCP) to create powerful AI-assisted development tools.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-12">
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Server className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Architecture</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Understand the core components and design patterns for building robust MCP servers.
              </p>
              <Link href="/servers/architecture">
                <Button variant="outline" className="w-full">
                  Learn Architecture <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Code className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Implementation</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Step-by-step guides for implementing MCP servers with different technologies.
              </p>
              <Link href="/servers/implementation">
                <Button variant="outline" className="w-full">
                  View Implementations <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Database className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Context Management</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Learn techniques for efficient context handling, storage, and retrieval in MCP servers.
              </p>
              <Link href="/servers/context-management">
                <Button variant="outline" className="w-full">
                  Explore Context <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="prose dark:prose-invert max-w-none">
            <h2 className="text-3xl font-bold mb-6">MCP Server Architecture</h2>
            <p className="lead mb-6">
              An MCP server acts as an intermediary between the user and AI models, managing context, handling requests, and formatting responses. Understanding the architecture is crucial for building effective implementations.
            </p>
            
            <div className="bg-muted p-6 rounded-lg my-8">
              <h3 className="text-xl font-semibold mb-4">Core Components of an MCP Server</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-medium mb-2">1. Transport Layer</h4>
                  <p className="text-sm text-muted-foreground">
                    Handles communication between the client and server, typically using stdio, HTTP, or WebSockets.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">2. Request Handler</h4>
                  <p className="text-sm text-muted-foreground">
                    Processes incoming requests, validates parameters, and routes to appropriate services.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">3. Context Manager</h4>
                  <p className="text-sm text-muted-foreground">
                    Stores and retrieves conversation history and relevant context for AI models.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">4. Tool Registry</h4>
                  <p className="text-sm text-muted-foreground">
                    Manages available tools and their capabilities that can be used by the AI.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">5. Model Interface</h4>
                  <p className="text-sm text-muted-foreground">
                    Communicates with AI models (like OpenAI, Claude) and handles their responses.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">6. Response Formatter</h4>
                  <p className="text-sm text-muted-foreground">
                    Structures and formats responses for the client application.
                  </p>
                </div>
              </div>
            </div>
            
            <h3 className="text-2xl font-bold mb-4">Basic MCP Server Implementation</h3>
            <p>
              Here's a simplified example of an MCP server using the official SDK:
            </p>
            
            <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
              <code>{`import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
  CallToolRequestSchema, 
  ListToolsRequestSchema 
} from '@modelcontextprotocol/sdk/types.js';

// Create a new MCP server
const server = new Server(
  {
    name: 'example-mcp-server',
    version: '1.0.0'
  },
  {
    capabilities: {
      tools: {}
    }
  }
);

// Set up tool handlers
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'get_weather',
      description: 'Get the current weather for a location',
      inputSchema: {
        type: 'object',
        properties: {
          location: {
            type: 'string',
            description: 'City name or coordinates'
          }
        },
        required: ['location']
      }
    }
  ]
}));

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.name === 'get_weather') {
    const { location } = request.parameters;
    
    // In a real implementation, you would call a weather API here
    return {
      result: {
        temperature: 72,
        condition: 'Sunny',
        location: location
      }
    };
  }
  
  throw new Error(\`Unknown tool: \${request.name}\`);
});

// Handle errors
server.onerror = (error) => console.error('[MCP Error]', error);

// Start the server with stdio transport
const transport = new StdioServerTransport();
server.listen(transport);

console.log('MCP Server started and listening...');`}</code>
            </pre>
            
            <h2 className="text-3xl font-bold mt-12 mb-6">Implementation Approaches</h2>
            
            <Tabs defaultValue="nodejs" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="nodejs">Node.js</TabsTrigger>
                <TabsTrigger value="python">Python</TabsTrigger>
                <TabsTrigger value="firebase">Firebase</TabsTrigger>
              </TabsList>
              <TabsContent value="nodejs" className="p-4 border rounded-md mt-2">
                <h3 className="text-xl font-semibold mb-4">Node.js Implementation</h3>
                <p className="mb-4">
                  Node.js is an excellent choice for building MCP servers due to its event-driven architecture and extensive package ecosystem.
                </p>
                <h4 className="font-medium mb-2">Key Benefits:</h4>
                <ul className="list-disc pl-6 mb-4">
                  <li>Official MCP SDK available</li>
                  <li>Excellent async/await support</li>
                  <li>Rich ecosystem for API integrations</li>
                  <li>Easy deployment options (Vercel, Netlify, etc.)</li>
                </ul>
                <Link href="/servers/implementation/nodejs">
                  <Button>
                    View Node.js Guide <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </TabsContent>
              <TabsContent value="python" className="p-4 border rounded-md mt-2">
                <h3 className="text-xl font-semibold mb-4">Python Implementation</h3>
                <p className="mb-4">
                  Python is ideal for MCP servers that need to leverage data science libraries or complex AI processing.
                </p>
                <h4 className="font-medium mb-2">Key Benefits:</h4>
                <ul className="list-disc pl-6 mb-4">
                  <li>Excellent for data processing and ML tasks</li>
                  <li>Simple syntax for rapid development</li>
                  <li>Rich ecosystem of AI and NLP libraries</li>
                  <li>Strong community support</li>
                </ul>
                <Link href="/servers/implementation/python">
                  <Button>
                    View Python Guide <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </TabsContent>
              <TabsContent value="firebase" className="p-4 border rounded-md mt-2">
                <h3 className="text-xl font-semibold mb-4">Firebase Implementation</h3>
                <p className="mb-4">
                  Firebase provides a serverless approach to building MCP servers with built-in authentication and database capabilities.
                </p>
                <h4 className="font-medium mb-2">Key Benefits:</h4>
                <ul className="list-disc pl-6 mb-4">
                  <li>Serverless architecture</li>
                  <li>Built-in authentication</li>
                  <li>Real-time database capabilities</li>
                  <li>Scalable cloud functions</li>
                </ul>
                <Link href="/servers/implementation/firebase">
                  <Button>
                    View Firebase Guide <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </TabsContent>
            </Tabs>
            
            <h2 className="text-3xl font-bold mt-12 mb-6">Getting Started</h2>
            <p className="mb-6">
              Ready to build your own MCP server? Follow these steps to get started:
            </p>
            
            <ol className="list-decimal pl-6 mb-8 space-y-4">
              <li>
                <strong>Install the MCP SDK:</strong> Begin by installing the official Model Context Protocol SDK for your preferred language.
              </li>
              <li>
                <strong>Choose a transport layer:</strong> Decide how your server will communicate (stdio, HTTP, WebSockets).
              </li>
              <li>
                <strong>Define your tools:</strong> Determine what capabilities your MCP server will provide.
              </li>
              <li>
                <strong>Implement context management:</strong> Set up storage for conversation history and context.
              </li>
              <li>
                <strong>Add error handling:</strong> Implement robust error handling for a production-ready server.
              </li>
            </ol>
            
            <div className="bg-primary/10 p-6 rounded-lg my-8 border border-primary/20">
              <h3 className="text-xl font-semibold mb-4 text-primary">Try It Yourself</h3>
              <p className="mb-4">
                The best way to learn is by doing. Use our interactive code playground to experiment with MCP server implementations.
              </p>
              <Link href="/playground">
                <Button>
                  Open Code Playground <Code className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </MainLayout>
      <FloatingChat />
    </>
  )
} 