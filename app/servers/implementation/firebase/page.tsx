"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Code,Check,AlertTriangle } from "lucide-react"

export default function FirebaseImplementationPage() {
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
              <span className="text-foreground">Firebase</span>
            </nav>
            <h1 className="text-4xl font-bold mb-4">Building MCP Servers with Firebase</h1>
            <p className="text-xl text-muted-foreground">
              A comprehensive guide to leveraging Firebase for building scalable, serverless MCP implementations with minimal infrastructure management.
            </p>
          </div>

          <div className="prose dark:prose-invert max-w-none">
            <h2 className="text-3xl font-bold mb-6">Getting Started</h2>
            <p className="mb-4">
              Firebase offers a compelling platform for building MCP servers, especially when you want to minimize infrastructure 
              management and leverage serverless architecture. This guide will walk you through creating a complete MCP server 
              implementation using Firebase Cloud Functions and Firestore.
            </p>

            <div className="bg-muted p-6 rounded-lg my-8">
              <h3 className="text-xl font-semibold mb-4">Prerequisites</h3>
              <ul className="list-disc ml-6 space-y-2">
                <li>Node.js 14 or higher</li>
                <li>npm or yarn package manager</li>
                <li>Firebase account (free tier is sufficient to start)</li>
                <li>Firebase CLI installed (<code>npm install -g firebase-tools</code>)</li>
                <li>Basic knowledge of JavaScript/TypeScript and Firebase</li>
                <li>Understanding of the MCP protocol basics</li>
              </ul>
            </div>

            <h2 className="text-3xl font-bold mt-12 mb-6">Step 1: Project Setup</h2>
            <p className="mb-4">
              Let's begin by setting up a new Firebase project and initializing the necessary components.
            </p>

            <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
              <code>{`# Create a new directory for your project
mkdir firebase-mcp-server
cd firebase-mcp-server

# Login to Firebase
firebase login

# Initialize a Firebase project
firebase init

# Select the following options:
# - Firestore: Configure security rules and indexes
# - Functions: Configure a Cloud Functions directory
# - Choose an existing Firebase project or create a new one
# - Use TypeScript for Cloud Functions
# - Enable ESLint
# - Install dependencies with npm or yarn`}</code>
            </pre>

            <p className="mb-4">
              After initialization, you'll have a project structure with several important folders:
            </p>

            <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
              <code>{`firebase-mcp-server/
├── firebase.json           # Firebase project configuration
├── firestore.rules         # Security rules for Firestore
├── firestore.indexes.json  # Indexes for Firestore
└── functions/              # Cloud Functions directory
    ├── package.json        # Dependencies and scripts
    ├── tsconfig.json       # TypeScript configuration
    ├── src/                # Source code directory
    └── lib/                # Compiled JavaScript output`}</code>
            </pre>

            <h2 className="text-3xl font-bold mt-12 mb-6">Step 2: Install Dependencies</h2>
            <p className="mb-4">
              Navigate to the functions directory and install the necessary dependencies:
            </p>

            <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
              <code>{`cd functions
npm install cors express helmet`}</code>
            </pre>

            <h2 className="text-3xl font-bold mt-12 mb-6">Step 3: Define MCP Protocol Types</h2>
            <p className="mb-4">
              Let's create the core types for the MCP protocol. Create a file at <code>functions/src/types.ts</code>:
            </p>

            <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
              <code>{`// functions/src/types.ts
export enum RequestMethod {
  LIST_TOOLS = "list_tools",
  CALL_TOOL = "call_tool",
  GET_CONTEXT = "get_context",
  SET_CONTEXT = "set_context"
}

export enum ErrorCode {
  INVALID_REQUEST = "invalid_request",
  TOOL_NOT_FOUND = "tool_not_found",
  TOOL_EXECUTION_ERROR = "tool_execution_error",
  CONTEXT_ERROR = "context_error",
  INTERNAL_ERROR = "internal_error",
  AUTHENTICATION_ERROR = "authentication_error",
  AUTHORIZATION_ERROR = "authorization_error"
}

export interface MCPErrorResponse {
  error: {
    code: ErrorCode;
    message: string;
  };
}

export interface ToolSchema {
  name: string;
  description: string;
  input_schema: Record<string, any>;
}

export interface ListToolsRequest {
  method: RequestMethod.LIST_TOOLS;
}

export interface ListToolsResponse {
  tools: ToolSchema[];
}

export interface CallToolRequest {
  method: RequestMethod.CALL_TOOL;
  name: string;
  parameters: Record<string, any>;
}

export interface CallToolResponse {
  result: Record<string, any>;
}

export interface GetContextRequest {
  method: RequestMethod.GET_CONTEXT;
  context_id: string;
}

export interface GetContextResponse {
  context: Record<string, any>;
}

export interface SetContextRequest {
  method: RequestMethod.SET_CONTEXT;
  context_id: string;
  data: Record<string, any>;
}

export interface SetContextResponse {
  success: boolean;
}

export type MCPRequest = 
  | ListToolsRequest 
  | CallToolRequest 
  | GetContextRequest 
  | SetContextRequest;

export type MCPResponse = 
  | ListToolsResponse 
  | CallToolResponse 
  | GetContextResponse 
  | SetContextResponse 
  | MCPErrorResponse;

export interface Tool {
  name: string;
  description: string;
  input_schema: Record<string, any>;
  handler: (parameters: Record<string, any>) => Promise<Record<string, any>>;
}`}</code>
            </pre>

            <h2 className="text-3xl font-bold mt-12 mb-6">Step 4: Implement Tool Registry</h2>
            <p className="mb-4">
              Let's create a system for registering and managing tools. Create a file at <code>functions/src/tools/registry.ts</code>:
            </p>

            <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
              <code>{`// functions/src/tools/registry.ts
import { Tool, ErrorCode } from '../types';

export class ToolRegistry {
  private tools: Map<string, Tool> = new Map();

  constructor() {}

  /**
   * Register a new tool
   */
  registerTool(tool: Tool): void {
    console.log(\`Registering tool: \${tool.name}\`);
    this.tools.set(tool.name, tool);
  }

  /**
   * Get a tool by name
   */
  getTool(name: string): Tool | undefined {
    return this.tools.get(name);
  }

  /**
   * List all registered tools
   */
  listTools(): Array<Omit<Tool, 'handler'>> {
    return Array.from(this.tools.values()).map(({ name, description, input_schema }) => ({
      name,
      description,
      input_schema
    }));
  }

  /**
   * Call a tool by name with the given parameters
   */
  async callTool(name: string, parameters: Record<string, any>): Promise<Record<string, any>> {
    const tool = this.getTool(name);
    
    if (!tool) {
      throw {
        code: ErrorCode.TOOL_NOT_FOUND,
        message: \`Tool not found: \${name}\`
      };
    }
    
    console.log(\`Calling tool: \${name} with parameters: \${JSON.stringify(parameters)}\`);
    
    try {
      const result = await tool.handler(parameters);
      return { result };
    } catch (error) {
      console.error(\`Error executing tool \${name}:\`, error);
      throw {
        code: ErrorCode.TOOL_EXECUTION_ERROR,
        message: \`Error executing tool \${name}: \${error instanceof Error ? error.message : String(error)}\`
      };
    }
  }
}`}</code>
            </pre>

            <h2 className="text-3xl font-bold mt-12 mb-6">Step 5: Implement Sample Tools</h2>
            <p className="mb-4">
              Let's create some sample tools to demonstrate the functionality. First, create a file at <code>functions/src/tools/weather.ts</code>:
            </p>

            <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
              <code>{`// functions/src/tools/weather.ts
import { Tool } from '../types';

/**
 * Get weather for a specified location
 * In a real implementation, this would call a weather API
 */
export const weatherTool: Tool = {
  name: 'get_weather',
  description: 'Get the current weather for a location',
  input_schema: {
    type: 'object',
    properties: {
      location: {
        type: 'string',
        description: 'City name or coordinates'
      }
    },
    required: ['location']
  },
  handler: async (parameters: { location: string }) => {
    const { location } = parameters;
    
    if (!location) {
      throw new Error('Location is required');
    }
    
    // In a real implementation, you would call a weather API
    // For demonstration, we're returning mock data
    return {
      temperature: 72,
      condition: 'Sunny',
      location,
      timestamp: new Date().toISOString()
    };
  }
};`}</code>
            </pre>

            <p className="mb-4">
              Next, let's create a calculator tool at <code>functions/src/tools/calculator.ts</code>:
            </p>

            <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
              <code>{`// functions/src/tools/calculator.ts
import { Tool } from '../types';

/**
 * Safely evaluate a mathematical expression
 */
function safeEval(expr: string): number {
  // First, we validate that the expression only contains safe characters
  if (!/^[0-9+\\-*/(). ]*$/.test(expr)) {
    throw new Error('Expression contains invalid characters');
  }

  // Replace all occurrences of mathematic operations with safe counterparts
  const sanitizedExpr = expr
    // Remove whitespace
    .replace(/\\s+/g, '')
    // Replace operations with JavaScript's arithmetic operators
    .replace(/\\+/g, '+')
    .replace(/\\-/g, '-')
    .replace(/\\*/g, '*')
    .replace(/\\//g, '/');

  // Use Function constructor instead of eval for slightly better isolation
  try {
    // Create a new function that returns the result of the expression
    const result = new Function(\`"use strict"; return (\${sanitizedExpr});\`)();
    
    // Check if the result is a number
    if (typeof result !== 'number' || isNaN(result)) {
      throw new Error('Expression did not evaluate to a valid number');
    }
    
    return result;
  } catch (error) {
    throw new Error(\`Error evaluating expression: \${error instanceof Error ? error.message : String(error)}\`);
  }
}

/**
 * Calculate tool for evaluating mathematical expressions
 */
export const calculatorTool: Tool = {
  name: 'calculate',
  description: 'Perform a mathematical calculation',
  input_schema: {
    type: 'object',
    properties: {
      expression: {
        type: 'string',
        description: 'Math expression to evaluate (e.g., "2 + 2")'
      }
    },
    required: ['expression']
  },
  handler: async (parameters: { expression: string }) => {
    const { expression } = parameters;
    
    if (!expression) {
      throw new Error('Expression is required');
    }
    
    try {
      const result = safeEval(expression);
      return {
        expression,
        result
      };
    } catch (error) {
      throw new Error(\`Error calculating result: \${error instanceof Error ? error.message : String(error)}\`);
    }
  }
};`}</code>
            </pre>

            <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 p-4 rounded-lg my-6">
              <div className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-800 dark:text-green-300">Security Note</h4>
                  <p className="text-sm text-green-700 dark:text-green-400">
                    We've implemented a secure expression evaluator with strict input validation to prevent 
                    code injection attacks. In a production environment, you might want to use a dedicated 
                    math expression parser library for even better security.
                  </p>
                </div>
              </div>
            </div>

            <h2 className="text-3xl font-bold mt-12 mb-6">Step 6: Implement Context Management with Firestore</h2>
            <p className="mb-4">
              Let's leverage Firestore to create a scalable context management system. Create a file at <code>functions/src/context/manager.ts</code>:
            </p>

            <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
              <code>{`// functions/src/context/manager.ts
import * as admin from 'firebase-admin';
import { ErrorCode } from '../types';

export class ContextManager {
  private db: FirebaseFirestore.Firestore;
  private contextCollection: string;
  private maxContextSize: number;

  constructor(
    db: FirebaseFirestore.Firestore,
    contextCollection = 'contexts',
    maxContextSize = 100000
  ) {
    this.db = db;
    this.contextCollection = contextCollection;
    this.maxContextSize = maxContextSize;
  }

  /**
   * Set context data for a given context ID
   */
  async setContext(contextId: string, data: Record<string, any>): Promise<boolean> {
    try {
      // Check context size
      const dataSize = JSON.stringify(data).length;
      
      if (dataSize > this.maxContextSize) {
        console.warn(
          \`Context size exceeds limit (\${dataSize} > \${this.maxContextSize}). \` +
          \`Consider implementing context compression or increasing the limit.\`
        );
        // You could implement context truncation here if needed
      }
      
      // Set data with merge to avoid overwriting fields not included in data
      await this.db.collection(this.contextCollection).doc(contextId).set({
        data,
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      
      return true;
    } catch (error) {
      console.error('Error setting context:', error);
      throw {
        code: ErrorCode.CONTEXT_ERROR,
        message: \`Error setting context: \${error instanceof Error ? error.message : String(error)}\`
      };
    }
  }

  /**
   * Get context data for a given context ID
   */
  async getContext(contextId: string): Promise<Record<string, any> | null> {
    try {
      const doc = await this.db.collection(this.contextCollection).doc(contextId).get();
      
      if (!doc.exists) {
        return null;
      }
      
      const data = doc.data();
      return data?.data || null;
    } catch (error) {
      console.error('Error getting context:', error);
      throw {
        code: ErrorCode.CONTEXT_ERROR,
        message: \`Error getting context: \${error instanceof Error ? error.message : String(error)}\`
      };
    }
  }

  /**
   * Delete context for a given context ID
   */
  async deleteContext(contextId: string): Promise<boolean> {
    try {
      await this.db.collection(this.contextCollection).doc(contextId).delete();
      return true;
    } catch (error) {
      console.error('Error deleting context:', error);
      throw {
        code: ErrorCode.CONTEXT_ERROR,
        message: \`Error deleting context: \${error instanceof Error ? error.message : String(error)}\`
      };
    }
  }
}`}</code>
            </pre>

            <h2 className="text-3xl font-bold mt-12 mb-6">Step 7: Create the MCP Server Handler</h2>
            <p className="mb-4">
              Now, let's implement the core MCP server handler. Create a file at <code>functions/src/server.ts</code>:
            </p>

            <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
              <code>{`// functions/src/server.ts
import { 
  RequestMethod, 
  MCPRequest, 
  MCPResponse, 
  ErrorCode 
} from './types';
import { ToolRegistry } from './tools/registry';
import { ContextManager } from './context/manager';

export class MCPServer {
  private toolRegistry: ToolRegistry;
  private contextManager: ContextManager;
  private name: string;
  private version: string;

  constructor(
    toolRegistry: ToolRegistry,
    contextManager: ContextManager,
    name = 'firebase-mcp-server',
    version = '1.0.0'
  ) {
    this.toolRegistry = toolRegistry;
    this.contextManager = contextManager;
    this.name = name;
    this.version = version;
  }

  /**
   * Handle an MCP request
   */
  async handleRequest(request: any): Promise<MCPResponse> {
    try {
      if (!request || typeof request !== 'object') {
        throw {
          code: ErrorCode.INVALID_REQUEST,
          message: 'Request must be a JSON object'
        };
      }

      const method = request.method;
      if (!method) {
        throw {
          code: ErrorCode.INVALID_REQUEST,
          message: "Request missing 'method' field"
        };
      }

      switch (method) {
        case RequestMethod.LIST_TOOLS:
          return this.handleListTools();

        case RequestMethod.CALL_TOOL:
          return this.handleCallTool(request);

        case RequestMethod.GET_CONTEXT:
          return this.handleGetContext(request);

        case RequestMethod.SET_CONTEXT:
          return this.handleSetContext(request);

        default:
          throw {
            code: ErrorCode.INVALID_REQUEST,
            message: \`Unknown method: \${method}\`
          };
      }
    } catch (error) {
      // Handle expected errors with code and message
      if (error && typeof error === 'object' && 'code' in error && 'message' in error) {
        return {
          error: {
            code: error.code as ErrorCode,
            message: error.message as string
          }
        };
      }
      
      // Handle unexpected errors
      console.error('Unexpected error handling request:', error);
      return {
        error: {
          code: ErrorCode.INTERNAL_ERROR,
          message: \`Internal server error: \${error instanceof Error ? error.message : String(error)}\`
        }
      };
    }
  }

  /**
   * Handle a list_tools request
   */
  private async handleListTools(): Promise<MCPResponse> {
    return {
      tools: this.toolRegistry.listTools()
    };
  }

  /**
   * Handle a call_tool request
   */
  private async handleCallTool(request: any): Promise<MCPResponse> {
    const name = request.name;
    const parameters = request.parameters || {};

    if (!name) {
      throw {
        code: ErrorCode.INVALID_REQUEST,
        message: "Call tool request missing 'name' field"
      };
    }

    return this.toolRegistry.callTool(name, parameters);
  }

  /**
   * Handle a get_context request
   */
  private async handleGetContext(request: any): Promise<MCPResponse> {
    const contextId = request.context_id;

    if (!contextId) {
      throw {
        code: ErrorCode.INVALID_REQUEST,
        message: "Get context request missing 'context_id' field"
      };
    }

    const context = await this.contextManager.getContext(contextId);
    return { context: context || {} };
  }

  /**
   * Handle a set_context request
   */
  private async handleSetContext(request: any): Promise<MCPResponse> {
    const contextId = request.context_id;
    const data = request.data;

    if (!contextId) {
      throw {
        code: ErrorCode.INVALID_REQUEST,
        message: "Set context request missing 'context_id' field"
      };
    }

    if (!data || typeof data !== 'object') {
      throw {
        code: ErrorCode.INVALID_REQUEST,
        message: "Set context request 'data' must be a JSON object"
      };
    }

    const success = await this.contextManager.setContext(contextId, data);
    return { success };
  }
}`}</code>
            </pre>

            <h2 className="text-3xl font-bold mt-12 mb-6">Step 8: Set Up Firebase Cloud Function</h2>
            <p className="mb-4">
              Now, let's implement the Firebase Cloud Function that will serve as the entry point for our MCP server. 
              Update <code>functions/src/index.ts</code>:
            </p>

            <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
              <code>{`// functions/src/index.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express';
import * as cors from 'cors';
import * as helmet from 'helmet';

import { ToolRegistry } from './tools/registry';
import { ContextManager } from './context/manager';
import { MCPServer } from './server';
import { weatherTool } from './tools/weather';
import { calculatorTool } from './tools/calculator';

// Initialize Firebase Admin SDK
admin.initializeApp();

// Create express app
const app = express();

// Apply middleware
app.use(cors({ origin: true }));
app.use(helmet());
app.use(express.json());

// Initialize MCP components
const toolRegistry = new ToolRegistry();
const contextManager = new ContextManager(admin.firestore());
const mcpServer = new MCPServer(toolRegistry, contextManager);

// Register tools
toolRegistry.registerTool(weatherTool);
toolRegistry.registerTool(calculatorTool);

// Define the MCP endpoint
app.post('/api/mcp', async (req, res) => {
  try {
    const response = await mcpServer.handleRequest(req.body);
    res.json(response);
  } catch (error) {
    console.error('Error handling request:', error);
    res.status(500).json({
      error: {
        code: 'internal_error',
        message: 'An unexpected error occurred'
      }
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    timestamp: new Date().toISOString() 
  });
});

// Expose the Express app as a Firebase Cloud Function
export const mcp = functions.https.onRequest(app);

// Optional: WebSocket support for real-time communication
// This requires additional setup with Firebase Hosting and Cloud Functions
// See: https://firebase.google.com/docs/functions/callable
/*
export const mcpCallable = functions.https.onCall(async (data, context) => {
  // Optional: Implement authentication and authorization
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'You must be logged in to use this feature'
    );
  }
  
  return mcpServer.handleRequest(data);
});
*/`}</code>
            </pre>

            <h2 className="text-3xl font-bold mt-12 mb-6">Step 9: Set Up Firestore Security Rules</h2>
            <p className="mb-4">
              Let's update our Firestore security rules to protect the context data. Update <code>firestore.rules</code>:
            </p>

            <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
              <code>{`// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Contexts collection - requires authentication in production
    match /contexts/{contextId} {
      // For development, allow read/write
      // For production, you would restrict access based on authentication and authorization
      allow read, write: if true;
      
      // Example production rule:
      // allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // Default deny
    match /{document=**} {
      allow read, write: if false;
    }
  }
}`}</code>
            </pre>

            <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 p-4 rounded-lg my-6">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-800 dark:text-amber-300">Security Warning</h4>
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    The security rules above are permissive for development purposes. In a production environment, 
                    you should implement proper authentication and authorization, and restrict access to context 
                    data based on user identity.
                  </p>
                </div>
              </div>
            </div>

            <h2 className="text-3xl font-bold mt-12 mb-6">Step 10: Deploy and Test Your MCP Server</h2>
            <p className="mb-4">
              Now, let's deploy our MCP server to Firebase:
            </p>

            <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
              <code>{`# Deploy to Firebase
firebase deploy --only functions,firestore`}</code>
            </pre>

            <p className="mb-4">
              Once deployed, you can test your MCP server using curl or any HTTP client:
            </p>

            <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
              <code>{`# List available tools
curl -X POST https://your-project-id.web.app/api/mcp \\
  -H "Content-Type: application/json" \\
  -d '{"method": "list_tools"}'

# Call the weather tool
curl -X POST https://your-project-id.web.app/api/mcp \\
  -H "Content-Type: application/json" \\
  -d '{"method": "call_tool", "name": "get_weather", "parameters": {"location": "New York"}}'

# Call the calculator tool
curl -X POST https://your-project-id.web.app/api/mcp \\
  -H "Content-Type: application/json" \\
  -d '{"method": "call_tool", "name": "calculate", "parameters": {"expression": "2 + 2 * 3"}}'

# Set context
curl -X POST https://your-project-id.web.app/api/mcp \\
  -H "Content-Type: application/json" \\
  -d '{"method": "set_context", "context_id": "user123", "data": {"preferences": {"theme": "dark"}}}'

# Get context
curl -X POST https://your-project-id.web.app/api/mcp \\
  -H "Content-Type: application/json" \\
  -d '{"method": "get_context", "context_id": "user123"}'`}</code>
            </pre>

            <h2 className="text-3xl font-bold mt-12 mb-6">Additional Firebase Features for MCP Servers</h2>
            <p className="mb-4">
              Firebase offers several additional features that can enhance your MCP server:
            </p>

            <div className="bg-muted p-6 rounded-lg my-8">
              <h3 className="text-xl font-semibold mb-4">Firebase Enhancements</h3>
              <ol className="list-decimal pl-6 space-y-4">
                <li>
                  <strong>Authentication</strong>
                  <p className="text-sm text-muted-foreground mt-1">
                    Implement Firebase Authentication to secure your MCP server and identify users.
                  </p>
                </li>
                <li>
                  <strong>Realtime Database</strong>
                  <p className="text-sm text-muted-foreground mt-1">
                    Use Firebase Realtime Database for low-latency context updates and streaming responses.
                  </p>
                </li>
                <li>
                  <strong>Firebase Hosting</strong>
                  <p className="text-sm text-muted-foreground mt-1">
                    Host your MCP server frontend and API on Firebase Hosting with automatic SSL.
                  </p>
                </li>
                <li>
                  <strong>Cloud Storage</strong>
                  <p className="text-sm text-muted-foreground mt-1">
                    Store and retrieve files and large context data using Firebase Cloud Storage.
                  </p>
                </li>
                <li>
                  <strong>Cloud Messaging</strong>
                  <p className="text-sm text-muted-foreground mt-1">
                    Implement push notifications for asynchronous tool results and updates.
                  </p>
                </li>
              </ol>
            </div>

            <div className="bg-primary/10 p-6 rounded-lg my-8 border border-primary/20">
              <h3 className="text-xl font-semibold mb-4 text-primary">Scaling Considerations</h3>
              <p className="mb-4">
                Firebase offers automatic scaling for most services, but there are some important considerations:
              </p>
              <ul className="list-disc ml-6 space-y-2">
                <li>Cloud Functions have execution time limits (9 minutes for paid plans)</li>
                <li>Configure appropriate timeouts for long-running tools</li>
                <li>Implement caching for frequently accessed data</li>
                <li>Monitor your Firebase usage to avoid unexpected costs</li>
                <li>Consider Firebase Extensions for pre-built functionality</li>
                <li>Use Firebase Emulator Suite for local development and testing</li>
              </ul>
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