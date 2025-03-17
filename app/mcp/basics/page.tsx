import { Metadata } from "next"
import { ContentTemplate, CodeBlock, Callout } from "@/components/content"
import { generateMetadata } from "@/lib/content-utils"

export const metadata: Metadata = generateMetadata({
  title: "MCP Basics: Understanding the Model Context Protocol",
  description: "Learn the fundamental concepts of the Model Context Protocol (MCP) and how it standardizes context sharing between AI tools.",
  keywords: ["MCP", "Model Context Protocol", "AI context", "context sharing", "AI tools", "standardization"],
  section: "mcp/basics"
})

export default function MCPBasics() {
  return (
    <ContentTemplate
      title="MCP Basics: Understanding the Model Context Protocol"
      description="Learn the fundamental concepts of the Model Context Protocol (MCP) and how it standardizes context sharing between AI tools."
      metadata={{
        difficulty: "beginner",
        timeToComplete: "10 minutes",
        prerequisites: [
          {
            title: "Introduction to AI-Assisted Development",
            href: "/introduction/concepts"
          }
        ]
      }}
      tableOfContents={[
        {
          id: "what-is-mcp",
          title: "What is MCP?",
          level: 2
        },
        {
          id: "why-mcp-matters",
          title: "Why MCP Matters",
          level: 2
        },
        {
          id: "core-components",
          title: "Core Components of MCP",
          level: 2,
          children: [
            {
              id: "context-files",
              title: "Context Files",
              level: 3
            },
            {
              id: "context-servers",
              title: "Context Servers",
              level: 3
            },
            {
              id: "api-standards",
              title: "API Standards",
              level: 3
            }
          ]
        },
        {
          id: "mcp-workflow",
          title: "Basic MCP Workflow",
          level: 2
        },
        {
          id: "getting-started",
          title: "Getting Started with MCP",
          level: 2
        }
      ]}
      relatedContent={[
        {
          title: "MCP Benefits",
          href: "/mcp/benefits",
          description: "Explore the advantages of using MCP in your development workflow."
        },
        {
          title: "Context Management",
          href: "/mcp/context-management",
          description: "Learn techniques for effectively managing model context with MCP."
        },
        {
          title: "MCP Implementation",
          href: "/mcp/implementation",
          description: "Practical guide to implementing MCP in your projects."
        }
      ]}
    >
      <h2 id="what-is-mcp">What is MCP?</h2>
      <p>
        The Model Context Protocol (MCP) is a standardized protocol for sharing and managing context between AI tools and services. It provides a consistent way for different AI systems to exchange information about the code, documentation, and requirements they're working with.
      </p>
      <p>
        At its core, MCP solves a critical problem in AI-assisted development: context fragmentation. Without MCP, each AI tool maintains its own separate understanding of your project, leading to inconsistent responses and duplicated effort.
      </p>

      <h2 id="why-mcp-matters">Why MCP Matters</h2>
      <p>
        MCP transforms AI-assisted development by creating a unified context ecosystem. Here's why it matters:
      </p>
      <ul>
        <li><strong>Consistency:</strong> All AI tools work with the same context, producing more consistent and reliable outputs.</li>
        <li><strong>Efficiency:</strong> Eliminates the need to repeatedly provide the same context to different tools.</li>
        <li><strong>Collaboration:</strong> Teams can share a common context, ensuring everyone (and every AI) works with the same information.</li>
        <li><strong>Integration:</strong> Makes it easier to connect multiple AI tools in a workflow, as they can all access the same context.</li>
        <li><strong>Context Management:</strong> Provides standardized ways to update, version, and maintain context over time.</li>
      </ul>

      <Callout type="info" title="Real-World Impact">
        In traditional AI-assisted development, switching between tools like Cursor and Claude might require re-explaining your project each time. With MCP, you explain once, and all compatible tools immediately understand your project's context.
      </Callout>

      <h2 id="core-components">Core Components of MCP</h2>
      <p>
        MCP consists of several key components that work together to create a standardized context ecosystem:
      </p>

      <h3 id="context-files">Context Files</h3>
      <p>
        Context files are structured documents that contain information about your project, including:
      </p>
      <ul>
        <li>Code snippets and file contents</li>
        <li>Project requirements and specifications</li>
        <li>Architecture descriptions and diagrams</li>
        <li>Development history and decisions</li>
        <li>Current tasks and objectives</li>
      </ul>
      <p>
        These files typically use a JSON-based format that follows the MCP specification, making them readable by any MCP-compatible tool.
      </p>

      <CodeBlock 
        language="json"
        filename="project-context.json"
        code={`{
  "version": "1.0",
  "project": {
    "name": "TaskManager",
    "description": "A simple task management application",
    "language": "TypeScript",
    "framework": "React"
  },
  "files": [
    {
      "path": "src/components/TaskList.tsx",
      "content": "// Full file content here...",
      "description": "Component that displays a list of tasks"
    }
  ],
  "requirements": [
    "Allow users to create, edit, and delete tasks",
    "Implement task categories and filtering",
    "Provide a responsive design for mobile devices"
  ],
  "currentTask": {
    "description": "Add drag-and-drop functionality to reorder tasks",
    "priority": "high"
  }
}`}
      />

      <h3 id="context-servers">Context Servers</h3>
      <p>
        Context servers are specialized services that store, manage, and provide access to context files. They:
      </p>
      <ul>
        <li>Store context data securely</li>
        <li>Handle version control of context</li>
        <li>Manage access control and authentication</li>
        <li>Provide APIs for updating and retrieving context</li>
        <li>Enable context search and filtering</li>
      </ul>
      <p>
        These servers can be self-hosted for private projects or provided as a service for teams and organizations.
      </p>

      <h3 id="api-standards">API Standards</h3>
      <p>
        MCP defines standard APIs for interacting with context, ensuring all tools can communicate in the same way. These standards cover:
      </p>
      <ul>
        <li>Context retrieval and updates</li>
        <li>Authentication and authorization</li>
        <li>Context search and filtering</li>
        <li>Version management</li>
        <li>Context synchronization</li>
      </ul>

      <CodeBlock 
        language="typescript"
        filename="mcp-api-example.ts"
        code={`// Example of retrieving context using the MCP API
import { MCPClient } from '@mcp/client';

async function getProjectContext() {
  const client = new MCPClient({
    serverUrl: 'https://mcp.example.org',
    apiKey: process.env.MCP_API_KEY
  });
  
  // Get the full project context
  const context = await client.getContext('project-id');
  
  // Or get a specific part of the context
  const taskListComponent = await client.getContextFile({
    project: 'project-id',
    path: 'src/components/TaskList.tsx'
  });
  
  return { context, taskListComponent };
}`}
      />

      <h2 id="mcp-workflow">Basic MCP Workflow</h2>
      <p>
        Here's how MCP typically fits into a development workflow:
      </p>
      <ol>
        <li><strong>Initialize:</strong> Create an initial context file describing your project.</li>
        <li><strong>Share:</strong> Upload the context to an MCP server or store it locally.</li>
        <li><strong>Connect:</strong> Configure your AI tools to use this context via MCP.</li>
        <li><strong>Work:</strong> As you work with AI tools, they automatically use and update the shared context.</li>
        <li><strong>Update:</strong> As your project evolves, the context is updated automatically or manually.</li>
        <li><strong>Collaborate:</strong> Team members access and contribute to the same context, ensuring everyone's on the same page.</li>
      </ol>

      <Callout type="tip" title="Best Practice">
        Start with a minimal context and let it grow organically as you work. Focus on including the most relevant code, requirements, and current tasks rather than trying to capture everything at once.
      </Callout>

      <h2 id="getting-started">Getting Started with MCP</h2>
      <p>
        Ready to try MCP in your workflow? Here are some simple steps to get started:
      </p>
      <ol>
        <li>Choose MCP-compatible tools (like Cursor, Windsurf, or others).</li>
        <li>Create a basic context file with key information about your project.</li>
        <li>Set up a local context server or use a cloud-based service.</li>
        <li>Configure your AI tools to connect to your MCP context.</li>
        <li>Start small and gradually expand your use of shared context.</li>
      </ol>
      <p>
        For more detailed implementation guidance, check out our <a href="/mcp/implementation">MCP Implementation</a> page.
      </p>

      <Callout type="warning" title="Keep Security in Mind">
        Remember that context files may contain sensitive code or information. Always use secure connections when working with remote MCP servers, and review your context before sharing it with third-party services.
      </Callout>
    </ContentTemplate>
  )
}