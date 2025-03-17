import { Metadata } from "next"
import { ContentTemplate, CodeBlock, Callout } from "@/components/content"
import { generateMetadata } from "@/lib/content-utils"

export const metadata: Metadata = generateMetadata({
  title: "MCP Implementation: Getting Started with the Model Context Protocol",
  description: "A practical guide to implementing the Model Context Protocol (MCP) in your development projects with step-by-step instructions and examples.",
  keywords: ["MCP implementation", "Model Context Protocol setup", "integrate MCP", "AI context management", "MCP client", "MCP server setup"],
  section: "mcp/implementation"
})

export default function MCPImplementation() {
  return (
    <ContentTemplate
      title="MCP Implementation: Getting Started with the Model Context Protocol"
      description="A practical guide to implementing the Model Context Protocol (MCP) in your development projects with step-by-step instructions and examples."
      metadata={{
        difficulty: "intermediate",
        timeToComplete: "20 minutes",
        prerequisites: [
          {
            title: "MCP Basics",
            href: "/mcp/basics"
          },
          {
            title: "MCP Benefits",
            href: "/mcp/benefits"
          }
        ]
      }}
      tableOfContents={[
        {
          id: "prerequisites",
          title: "Prerequisites",
          level: 2
        },
        {
          id: "setup-options",
          title: "Implementation Options",
          level: 2,
          children: [
            {
              id: "hosted-service",
              title: "Using a Hosted MCP Service",
              level: 3
            },
            {
              id: "custom-server",
              title: "Building a Custom MCP Server",
              level: 3
            }
          ]
        },
        {
          id: "client-integration",
          title: "Client Integration",
          level: 2,
          children: [
            {
              id: "mcp-client-library",
              title: "MCP Client Library",
              level: 3
            },
            {
              id: "tool-integration",
              title: "AI Tool Integration",
              level: 3
            }
          ]
        },
        {
          id: "context-management",
          title: "Practical Context Management",
          level: 2
        },
        {
          id: "security-considerations",
          title: "Security Considerations",
          level: 2
        },
        {
          id: "common-challenges",
          title: "Common Challenges & Solutions",
          level: 2
        }
      ]}
      relatedContent={[
        {
          title: "MCP Basics",
          href: "/mcp/basics",
          description: "Learn the fundamental concepts of the Model Context Protocol."
        },
        {
          title: "MCP Benefits",
          href: "/mcp/benefits",
          description: "Discover the advantages of integrating MCP into your workflow."
        },
        {
          title: "Context Management",
          href: "/mcp/context-management",
          description: "Advanced techniques for effectively managing model context with MCP."
        },
        {
          title: "Building MCP Servers",
          href: "/servers",
          description: "Detailed guide to building your own custom MCP server."
        }
      ]}
    >
      <p>
        Implementing the Model Context Protocol (MCP) in your development workflow enables consistent, 
        efficient context sharing across AI tools. This guide provides practical steps to get 
        started with MCP implementation, whether you're using a hosted service or building your own solution.
      </p>

      <h2 id="prerequisites">Prerequisites</h2>
      <p>
        Before implementing MCP in your project, ensure you have:
      </p>
      
      <ul>
        <li>A clear understanding of your AI-assisted development needs</li>
        <li>Identified the AI tools you want to integrate with MCP</li>
        <li>Basic knowledge of API integration and authentication</li>
        <li>Development environment with Node.js (v14+) for client libraries</li>
      </ul>

      <Callout type="tip">
        If you're new to MCP, we recommend reviewing the <a href="/mcp/basics">MCP Basics</a> page 
        before proceeding with implementation.
      </Callout>

      <h2 id="setup-options">Implementation Options</h2>
      <p>
        There are two primary approaches to implementing MCP: using a hosted service or building a custom server.
        Each has its advantages depending on your specific needs.
      </p>

      <h3 id="hosted-service">Using a Hosted MCP Service</h3>
      <p>
        The simplest way to get started with MCP is to use a hosted service that handles the 
        infrastructure and maintenance for you.
      </p>

      <h4>Popular Hosted MCP Services</h4>
      <ul>
        <li><strong>MCPHub</strong>: Offers free and paid tiers with various storage limits</li>
        <li><strong>ContextCloud</strong>: Enterprise-focused solution with advanced security features</li>
        <li><strong>DevContext</strong>: Developer-friendly option with generous free tier</li>
      </ul>

      <h4>Setup Steps</h4>
      <ol>
        <li>Create an account with your chosen MCP service provider</li>
        <li>Generate an API key from your account dashboard</li>
        <li>Install the appropriate client library (covered in the Client Integration section)</li>
        <li>Configure your client with the service URL and API key</li>
      </ol>

      <CodeBlock 
        language="bash"
        filename="terminal"
        code={`# Install the MCP client library
npm install @mcp/client

# Example configuration in your project
export MCP_API_KEY=your_api_key_here
export MCP_SERVICE_URL=https://api.mcphub.com/v1`}
      />

      <h3 id="custom-server">Building a Custom MCP Server</h3>
      <p>
        For teams with specific requirements or privacy concerns, building a custom MCP server 
        provides maximum control and flexibility.
      </p>

      <h4>When to Choose a Custom Server</h4>
      <ul>
        <li>You need to host sensitive context data on-premises</li>
        <li>You have specific integration requirements not supported by hosted options</li>
        <li>You want to customize context handling beyond standard MCP implementations</li>
        <li>Your organization has strict data sovereignty requirements</li>
      </ul>

      <p>
        Building a custom MCP server involves setting up the necessary infrastructure, implementing 
        the MCP specification, and ensuring proper security measures. For a detailed guide, 
        see our <a href="/servers">Building MCP Servers</a> section.
      </p>

      <Callout type="info">
        A basic MCP server needs to support context storage, retrieval, updates, and proper authentication. 
        You can start with a simplified implementation and add advanced features as needed.
      </Callout>

      <h2 id="client-integration">Client Integration</h2>
      <p>
        Once you've chosen your MCP implementation approach, you'll need to integrate it with your 
        development environment and AI tools.
      </p>

      <h3 id="mcp-client-library">MCP Client Library</h3>
      <p>
        The MCP client library provides a standard interface for interacting with any MCP-compliant server.
      </p>

      <h4>Installation and Setup</h4>

      <CodeBlock 
        language="javascript"
        filename="mcp-setup.js"
        code={`// Install the MCP client library
// npm install @mcp/client

// Import and initialize the client
const { MCPClient } = require('@mcp/client');

// Initialize with your MCP server details
const mcpClient = new MCPClient({
  serverUrl: process.env.MCP_SERVICE_URL || 'http://localhost:3000/api/mcp',
  apiKey: process.env.MCP_API_KEY,
  projectId: 'my-awesome-project' // Optional identifier for your project
});

// Test the connection
async function testConnection() {
  try {
    await mcpClient.ping();
    console.log('Successfully connected to MCP server!');
  } catch (error) {
    console.error('Failed to connect to MCP server:', error);
  }
}

testConnection();`}
      />

      <h4>Basic Operations</h4>
      <p>
        The MCP client provides several core methods for managing context:
      </p>

      <CodeBlock 
        language="javascript"
        filename="mcp-operations.js"
        code={`// Create or update context
async function updateProjectContext() {
  await mcpClient.updateContext({
    project: {
      name: 'E-commerce Platform',
      frameworks: ['React', 'Node.js', 'Express'],
      description: 'A modern e-commerce platform with user authentication, product catalog, and payment processing'
    },
    architecture: {
      frontend: 'React with Next.js',
      backend: 'Express API with MongoDB',
      deployment: 'Docker containers on AWS'
    },
    conventions: {
      naming: 'camelCase for variables, PascalCase for components',
      testing: 'Jest with React Testing Library',
      stateManagement: 'Redux with Redux Toolkit'
    }
  });
  console.log('Context updated successfully!');
}

// Retrieve context
async function getContext() {
  const context = await mcpClient.getContext();
  console.log('Current context:', context);
  return context;
}

// Add to existing context (partial update)
async function addToContext() {
  await mcpClient.updateContext({
    recentChanges: {
      date: new Date().toISOString(),
      description: 'Added payment processing module',
      affectedComponents: ['PaymentForm', 'CheckoutPage', 'OrdersAPI']
    }
  }, { merge: true }); // The merge option preserves existing context
  console.log('Context extended successfully!');
}

// Clear context (use with caution)
async function resetContext() {
  await mcpClient.clearContext();
  console.log('Context has been reset');
}`}
      />

      <h3 id="tool-integration">AI Tool Integration</h3>
      <p>
        To benefit from MCP, you'll need to connect it with the AI tools in your workflow.
        Many modern AI development tools offer built-in MCP support.
      </p>

      <h4>Tools with Native MCP Support</h4>
      <ul>
        <li><strong>Cursor</strong>: IDE with AI capabilities and MCP integration</li>
        <li><strong>Windsurf</strong>: Code assistant with MCP context awareness</li>
        <li><strong>CodeCompose</strong>: AI pair programmer with MCP support</li>
      </ul>

      <h4>Integration Examples</h4>

      <CodeBlock 
        language="javascript"
        filename="cursor-integration.js"
        code={`// Example: Integrating Cursor with MCP
const { CursorClient } = require('@cursor/sdk');
const { MCPClient } = require('@mcp/client');

// Initialize MCP client
const mcpClient = new MCPClient({
  serverUrl: process.env.MCP_SERVICE_URL,
  apiKey: process.env.MCP_API_KEY
});

// Initialize Cursor with MCP integration
const cursor = new CursorClient({
  apiKey: process.env.CURSOR_API_KEY,
  mcpClient: mcpClient // Pass the MCP client instance
});

// Now Cursor will use your MCP context for AI operations
async function generateCode(prompt) {
  const result = await cursor.generateCode({
    prompt: prompt,
    // No need to manually provide context - it comes from MCP
  });
  
  return result.code;
}`}
      />

      <h4>Custom Integration</h4>
      <p>
        For AI tools without native MCP support, you can manually retrieve and provide context:
      </p>

      <CodeBlock 
        language="javascript"
        filename="custom-tool-integration.js"
        code={`// Example: Integrating a generic AI tool with MCP
const { GenericAITool } = require('generic-ai-tool');
const { MCPClient } = require('@mcp/client');

// Initialize MCP client
const mcpClient = new MCPClient({
  serverUrl: process.env.MCP_SERVICE_URL,
  apiKey: process.env.MCP_API_KEY
});

// Initialize the AI tool (without native MCP support)
const aiTool = new GenericAITool({
  apiKey: process.env.AI_TOOL_API_KEY
});

// Function to use the AI tool with MCP context
async function generateWithContext(prompt) {
  // Retrieve context from MCP
  const context = await mcpClient.getContext();
  
  // Format context according to the tool's requirements
  const formattedContext = formatContextForTool(context);
  
  // Call the AI tool with the context
  const result = await aiTool.generate({
    prompt: prompt,
    context: formattedContext // Manually provide the context
  });
  
  return result;
}

// Helper function to format context for the specific tool
function formatContextForTool(mcpContext) {
  // Transform MCP context into the format expected by the tool
  // This will vary depending on the tool's API
  return {
    projectInfo: JSON.stringify(mcpContext.project),
    codebase: mcpContext.conventions,
    // Add other transformations as needed
  };
}`}
      />

      <h2 id="context-management">Practical Context Management</h2>
      <p>
        Effective implementation of MCP requires thoughtful management of your context data.
        Here are some practical tips:
      </p>

      <h4>Context Structure Best Practices</h4>
      <ul>
        <li><strong>Organize hierarchically</strong>: Group related information under descriptive keys</li>
        <li><strong>Keep it concise</strong>: Include only information that's relevant for AI tools</li>
        <li><strong>Update regularly</strong>: Ensure context reflects the current state of your project</li>
        <li><strong>Include examples</strong>: Add code samples that demonstrate your conventions</li>
      </ul>

      <h4>Automating Context Updates</h4>
      <p>
        Consider automating context updates to keep your MCP data fresh:
      </p>

      <CodeBlock 
        language="javascript"
        filename="automated-updates.js"
        code={`// Example: Script to update MCP context from project metadata
const fs = require('fs');
const { MCPClient } = require('@mcp/client');

// Initialize MCP client
const mcpClient = new MCPClient({
  serverUrl: process.env.MCP_SERVICE_URL,
  apiKey: process.env.MCP_API_KEY
});

async function updateFromPackageJson() {
  // Read package.json
  const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
  
  // Update context with dependencies and project info
  await mcpClient.updateContext({
    project: {
      name: packageJson.name,
      version: packageJson.version,
      description: packageJson.description
    },
    dependencies: packageJson.dependencies,
    devDependencies: packageJson.devDependencies
  }, { merge: true });
  
  console.log('Updated MCP context from package.json');
}

// Run this script in CI/CD or as a pre-commit hook
updateFromPackageJson().catch(console.error);`}
      />

      <Callout type="tip" title="CI/CD Integration">
        Consider adding MCP context updates to your CI/CD pipeline to automatically keep context in sync with your codebase. This can be especially valuable for maintaining accurate information about dependencies and project structure.
      </Callout>

      <h2 id="security-considerations">Security Considerations</h2>
      <p>
        Implementing MCP securely is crucial, especially when dealing with sensitive project information.
      </p>

      <h4>Key Security Practices</h4>
      <ul>
        <li><strong>API key management</strong>: Store MCP API keys securely using environment variables or a secrets manager</li>
        <li><strong>Access control</strong>: Implement proper user/role-based access to your MCP server</li>
        <li><strong>Data filtering</strong>: Avoid storing sensitive information (API keys, credentials, PII) in context</li>
        <li><strong>Transport security</strong>: Ensure all communications with your MCP server use HTTPS</li>
        <li><strong>Auditing</strong>: Implement logging for context access and modifications</li>
      </ul>

      <CodeBlock 
        language="javascript"
        filename="security-example.js"
        code={`// Example: Filtering sensitive data before updating context
function sanitizeContext(context) {
  const sensitivePatterns = [
    /api[_-]?key/i,
    /password/i,
    /secret/i,
    /token/i,
    /credential/i
  ];
  
  // Deep clone to avoid modifying the original
  const sanitized = JSON.parse(JSON.stringify(context));
  
  // Recursive function to sanitize objects
  function sanitizeObject(obj) {
    if (!obj || typeof obj !== 'object') return;
    
    Object.keys(obj).forEach(key => {
      // Check if key matches sensitive patterns
      if (sensitivePatterns.some(pattern => pattern.test(key))) {
        obj[key] = '**REDACTED**';
      } else if (typeof obj[key] === 'object') {
        sanitizeObject(obj[key]); // Recurse for nested objects
      }
    });
  }
  
  sanitizeObject(sanitized);
  return sanitized;
}

// Usage: Filter context before updating
async function updateSecureContext(context) {
  const safeContext = sanitizeContext(context);
  await mcpClient.updateContext(safeContext);
}`}
      />

      <h2 id="common-challenges">Common Challenges & Solutions</h2>
      <p>
        As you implement MCP, you may encounter these common challenges:
      </p>

      <h4>Context Size Limitations</h4>
      <p>
        <strong>Challenge</strong>: MCP servers and AI tools often have limits on context size.
      </p>
      <p>
        <strong>Solution</strong>: Prioritize what goes into your context. Focus on high-level architecture, 
        conventions, and recent changes rather than including entire codebases.
      </p>

      <h4>Maintaining Context Accuracy</h4>
      <p>
        <strong>Challenge</strong>: As projects evolve, context can become outdated.
      </p>
      <p>
        <strong>Solution</strong>: Implement regular context validation and updates, either manually 
        or through automated scripts tied to your development workflow.
      </p>

      <h4>Tool Compatibility</h4>
      <p>
        <strong>Challenge</strong>: Not all AI tools support MCP natively.
      </p>
      <p>
        <strong>Solution</strong>: For tools without native support, create wrapper functions that 
        retrieve MCP context and format it appropriately for each tool.
      </p>

      <h4>Team Adoption</h4>
      <p>
        <strong>Challenge</strong>: Getting all team members to use MCP consistently.
      </p>
      <p>
        <strong>Solution</strong>: Integrate MCP into existing workflows and tools where possible, 
        and document the benefits and usage patterns clearly for the team.
      </p>

      <Callout type="success" title="Next Steps">
        Now that you understand how to implement MCP, explore the <a href="/mcp/context-management">Context Management</a> page 
        for advanced techniques to optimize your context for AI tools, or dive into <a href="/servers">Building MCP Servers</a> 
        if you're interested in creating a custom solution.
      </Callout>
    </ContentTemplate>
  )
}