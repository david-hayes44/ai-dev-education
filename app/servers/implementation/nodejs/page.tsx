"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Code,Check,AlertTriangle } from "lucide-react"

export default function NodejsImplementationPage() {
  return (
    <>
      <div className="container mx-auto px-6 sm:px-8 py-12">
          <div className="mb-8">
            <nav className="mb-4 flex items-center text-sm text-muted-foreground">
              <Link href="/" className="hover:text-foreground">
                Home
              </Link>
              <span className="mx-2 text-muted-foreground">/</span>
              <Link href="/building-servers" className="hover:text-foreground">
                Building MCP Servers
              </Link>
              <span className="mx-2 text-muted-foreground">/</span>
              <Link href="/servers/implementation" className="hover:text-foreground">
                Implementation
              </Link>
              <span className="mx-2 text-muted-foreground">/</span>
              <span className="text-foreground">Node.js</span>
            </nav>
            <h1 className="text-4xl font-bold mb-4">Building MCP Servers with Node.js</h1>
            <p className="text-xl text-muted-foreground">
              A comprehensive guide to implementing robust MCP servers using Node.js and the official MCP SDK.
            </p>
          </div>

          <div className="prose dark:prose-invert max-w-none">
            <h2 className="text-3xl font-bold mb-6">Getting Started</h2>
            <p className="mb-4">
              Node.js is an excellent choice for building MCP servers due to its event-driven architecture, 
              asynchronous capabilities, and extensive package ecosystem. This guide will walk you through 
              creating a full-featured MCP server using Node.js.
            </p>

            <div className="bg-muted p-6 rounded-lg my-8">
              <h3 className="text-xl font-semibold mb-4">Prerequisites</h3>
              <ul className="list-disc ml-6 space-y-2">
                <li>Node.js v16 or higher</li>
                <li>npm or yarn package manager</li>
                <li>Basic knowledge of JavaScript and async programming</li>
                <li>Understanding of the MCP protocol basics</li>
              </ul>
            </div>

            <h2 className="text-3xl font-bold mt-12 mb-6">Step 1: Project Setup</h2>
            <p className="mb-4">
              Let's start by setting up a new Node.js project and installing the required dependencies.
            </p>

            <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
              <code>{`# Create a new directory for your project
mkdir mcp-nodejs-server
cd mcp-nodejs-server

# Initialize a new Node.js project
npm init -y

# Install the MCP SDK and other dependencies
npm install @modelcontextprotocol/sdk dotenv`}</code>
            </pre>

            <h2 className="text-3xl font-bold mt-12 mb-6">Step 2: Create the Server Configuration</h2>
            <p className="mb-4">
              Next, create a basic configuration file to store your server settings. Create a new file called <code>.env</code> in your project root:
            </p>

            <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
              <code>{`# .env
SERVER_NAME=nodejs-mcp-server
SERVER_VERSION=1.0.0
PORT=3000
LOG_LEVEL=info`}</code>
            </pre>

            <p className="mb-4">
              Now, let's create a configuration module to load these settings. Create a new file called <code>config.js</code>:
            </p>

            <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
              <code>{`// config.js
require('dotenv').config();

module.exports = {
  server: {
    name: process.env.SERVER_NAME || 'nodejs-mcp-server',
    version: process.env.SERVER_VERSION || '1.0.0',
    port: parseInt(process.env.PORT, 10) || 3000,
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  }
};`}</code>
            </pre>

            <h2 className="text-3xl font-bold mt-12 mb-6">Step 3: Create the Core Server</h2>
            <p className="mb-4">
              Now, let's implement the core MCP server. Create a file called <code>server.js</code> in your project root:
            </p>

            <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
              <code>{`// server.js
const { } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { 
  CallToolRequestSchema, 
  ListToolsRequestSchema 
} = require('@modelcontextprotocol/sdk/types.js');
const config = require('./config');

// Create a logger
const log = (level, message, data) => {
  const logLevels = { error: 0, warn: 1, info: 2, debug: 3 };
  if (logLevels[level] <= logLevels[config.logging.level]) {
    console[level](\`[\${level.toUpperCase()}] \${message}\`, data || '');
  }
};

// Create a new MCP server
const server = new Server(
  {
    name: config.server.name,
    version: config.server.version
  },
  {
    capabilities: {
      tools: {}
    }
  }
);

// Start the server with stdio transport
function startServer() {
  log('info', \`Starting \${config.server.name} v\${config.server.version}\`);
  
  // Handle errors
  server.onerror = (error) => log('error', 'MCP Error:', error);
  
  // Start listening
  const transport = new StdioServerTransport();
  server.listen(transport);
  
  log('info', 'MCP Server started and listening...');
}

module.exports = { server, startlog };`}</code>
            </pre>

            <h2 className="text-3xl font-bold mt-12 mb-6">Step 4: Implement Tool Handlers</h2>
            <p className="mb-4">
              Now, let's define some tools for our MCP server. Create a new directory called <code>tools</code> and add a file called <code>weather.js</code>:
            </p>

            <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
              <code>{`// tools/weather.js
module.exports = {
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
  },
  handler: async (parameters) => {
    const { location } = parameters;
    
    // In a real implementation, you would call a weather API here
    // For demonstration, we're returning mock data
    return {
      result: {
        temperature: 72,
        condition: 'Sunny',
        location: location,
        timestamp: new Date().toISOString()
      }
    };
  }
};`}</code>
            </pre>

            <p className="mb-4">
              Create another tool file called <code>calculator.js</code>:
            </p>

            <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
              <code>{`// tools/calculator.js
module.exports = {
  name: 'calculate',
  description: 'Perform a calculation',
  inputSchema: {
    type: 'object',
    properties: {
      expression: {
        type: 'string',
        description: 'Math expression to evaluate (e.g., "2 + 2")'
      }
    },
    required: ['expression']
  },
  handler: async (parameters) => {
    const { expression } = parameters;
    
    try {
      // CAUTION: This is for demonstration only
      // In a production environment, you should use a safer evaluation method
      // to prevent code injection
      const result = eval(expression);
      
      return {
        result: {
          expression,
          result
        }
      };
    } catch (error) {
      throw new Error(\`Invalid expression: \${error.message}\`);
    }
  }
};`}</code>
            </pre>

            <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 p-4 rounded-lg my-6">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-800 dark:text-amber-300">Security Warning</h4>
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    The calculator example uses <code>eval()</code> which can be dangerous in production.
                    Always use safe evaluation libraries like <code>mathjs</code> to prevent code injection vulnerabilities.
                  </p>
                </div>
              </div>
            </div>

            <p className="mb-4">
              Now, create an index file to register all tools. Create <code>tools/index.js</code>:
            </p>

            <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
              <code>{`// tools/index.js
const weatherTool = require('./weather');
const calculatorTool = require('./calculator');

const tools = [
  weatherTool,
  calculatorTool,
];

function registerTools(server, log) {
  log('info', \`Registering \${tools.length} tools...\`);
  
  // Register the list of tools
  server.setRequestHandler(
    require('@modelcontextprotocol/sdk/types.js').ListToolsRequestSchema, 
    async () => ({
      tools: tools.map(tool => ({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema
      }))
    })
  );
  
  // Register the tool handler
  server.setRequestHandler(
    require('@modelcontextprotocol/sdk/types.js').CallToolRequestSchema, 
    async (request) => {
      const tool = tools.find(t => t.name === request.name);
      
      if (!tool) {
        throw new Error(\`Unknown tool: \${request.name}\`);
      }
      
      log('info', \`Calling tool: \${tool.name}\`, request.parameters);
      return await tool.handler(request.parameters);
    }
  );
  
  log('info', 'All tools registered successfully');
}

module.exports = { registerTools, tools };`}</code>
            </pre>

            <h2 className="text-3xl font-bold mt-12 mb-6">Step 5: Implement Context Management</h2>
            <p className="mb-4">
              Let's create a simple context management system. Create a directory called <code>context</code> and add a file called <code>index.js</code>:
            </p>

            <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
              <code>{`// context/index.js
// Simple in-memory context store
class ContextManager {
  constructor() {
    this.contexts = new Map();
    this.maxContextSize = 10000; // Limit context size to prevent memory issues
  }
  
  // Store context
  setContext(contextId, data) {
    // If context is too large, truncate it
    const dataString = JSON.stringify(data);
    if (dataString.length > this.maxContextSize) {
      // Implement your context compression strategy here
      console.warn(\`Context size exceeds limit (\${dataString.length} > \${this.maxContextSize}). Truncating.\`);
    }
    
    this.contexts.set(contextId, data);
    return true;
  }
  
  // Retrieve context
  getContext(contextId) {
    return this.contexts.get(contextId) || null;
  }
  
  // Delete context
  deleteContext(contextId) {
    return this.contexts.delete(contextId);
  }
  
  // List all context IDs
  listContexts() {
    return Array.from(this.contexts.keys());
  }
}

module.exports = new ContextManager();`}</code>
            </pre>

            <h2 className="text-3xl font-bold mt-12 mb-6">Step 6: Create the Main Application</h2>
            <p className="mb-4">
              Finally, let's tie everything together in an <code>index.js</code> file:
            </p>

            <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
              <code>{`// index.js
const { server, startlog } = require('./server');
const tools = require('./tools');
const contextManager = require('./context');

// Register all tools
tools.registerTools(server, log);

// Add context management tools
server.setRequestHandler(
  { method: 'get_context' }, 
  async (request) => {
    const { contextId } = request;
    
    if (!contextId) {
      throw new Error('Context ID is required');
    }
    
    const context = contextManager.getContext(contextId);
    
    return {
      context: context || {}
    };
  }
);

server.setRequestHandler(
  { method: 'set_context' }, 
  async (request) => {
    const { contextId, data } = request;
    
    if (!contextId) {
      throw new Error('Context ID is required');
    }
    
    const success = contextManager.setContext(contextId, data);
    
    return {
      success
    };
  }
);

// Start the server
startServer();`}</code>
            </pre>

            <h2 className="text-3xl font-bold mt-12 mb-6">Step 7: Run Your MCP Server</h2>
            <p className="mb-4">
              Now that you've implemented your MCP server, it's time to run it. You can start the server with:
            </p>

            <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
              <code>{`node index.js`}</code>
            </pre>

            <p className="mb-4">
              Your MCP server is now running and ready to handle requests!
            </p>

            <h2 className="text-3xl font-bold mt-12 mb-6">Testing Your MCP Server</h2>
            <p className="mb-4">
              You can test your MCP server using the MCP CLI tool or by connecting it to a compatible client application.
            </p>

            <div className="bg-primary/10 p-6 rounded-lg my-8 border border-primary/20">
              <h3 className="text-xl font-semibold mb-4 text-primary">Advanced Implementation Topics</h3>
              <p className="mb-4">
                This guide covered a basic implementation. For production use, consider these enhancements:
              </p>
              <ul className="list-disc ml-6 space-y-2">
                <li>Implement a persistent context store using Redis or a database</li>
                <li>Add authentication and authorization</li>
                <li>Implement rate limiting and security measures</li>
                <li>Add monitoring and logging for production environments</li>
                <li>Create a CI/CD pipeline for deployments</li>
              </ul>
            </div>

            <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 p-4 rounded-lg my-6">
              <div className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-800 dark:text-green-300">Next Steps</h4>
                  <p className="text-sm text-green-700 dark:text-green-400">
                    Try extending this implementation with more tools, a different transport layer (like HTTP or WebSockets),
                    or by integrating with AI services to create a truly powerful MCP server.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center mt-12 pt-6 border-t">
              <Link href="/servers/implementation">
                <Button variant="outline">
                  <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
                  Back to Implementations
                </Button>
              </Link>
              <Link href="/playground">
                <Button>
                  Try in Playground <Code className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </>
  )
} 