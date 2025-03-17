import { Metadata } from "next"
import { ContentTemplate, CodeBlock, Callout } from "@/components/content"
import { generateMetadata } from "@/lib/content-utils"

export const metadata: Metadata = generateMetadata({
  title: "Cursor: AI-Powered Code Editor",
  description: "Learn about Cursor, an AI-powered code editor with MCP integration designed for efficient, context-aware development.",
  keywords: ["Cursor", "AI code editor", "MCP integration", "code completion", "code generation", "AI programming"],
  section: "tools/cursor"
})

export default function CursorTool() {
  return (
    <ContentTemplate
      title="Cursor: AI-Powered Code Editor"
      description="Learn about Cursor, an AI-powered code editor with MCP integration designed for efficient, context-aware development."
      metadata={{
        difficulty: "beginner",
        timeToComplete: "15 minutes",
        prerequisites: [
          {
            title: "MCP Basics",
            href: "/mcp/basics"
          }
        ]
      }}
      tableOfContents={[
        {
          id: "introduction",
          title: "Introduction",
          level: 2
        },
        {
          id: "technical-capabilities",
          title: "Technical Capabilities",
          level: 2,
          children: [
            {
              id: "code-completion",
              title: "Code Completion and Generation",
              level: 3
            },
            {
              id: "error-detection",
              title: "Error Detection and Debugging",
              level: 3
            },
            {
              id: "refactoring",
              title: "Refactoring Assistance",
              level: 3
            },
            {
              id: "context-aware",
              title: "Context-Aware Development",
              level: 3
            }
          ]
        },
        {
          id: "mcp-integration",
          title: "MCP Integration",
          level: 2,
          children: [
            {
              id: "context-sharing",
              title: "Context Sharing Capabilities",
              level: 3
            },
            {
              id: "configuration",
              title: "MCP Configuration in Cursor",
              level: 3
            }
          ]
        },
        {
          id: "advanced-usage",
          title: "Advanced Usage",
          level: 2,
          children: [
            {
              id: "api-integration",
              title: "API Integration",
              level: 3
            },
            {
              id: "prompt-engineering",
              title: "Prompt Engineering",
              level: 3
            },
            {
              id: "custom-scripts",
              title: "Custom Scripts and Extensions",
              level: 3
            }
          ]
        },
        {
          id: "comparison",
          title: "Comparison with Similar Tools",
          level: 2
        },
        {
          id: "getting-started",
          title: "Getting Started with Cursor",
          level: 2
        }
      ]}
      relatedContent={[
        {
          title: "Cursor Setup Guide",
          href: "/tools/cursor/setup",
          description: "Detailed instructions for installing and configuring Cursor."
        },
        {
          title: "Cursor Core Features",
          href: "/tools/cursor/core-features",
          description: "Deep dive into the key features of Cursor for AI-assisted development."
        },
        {
          title: "Cursor Project Rules",
          href: "/tools/cursor/project-rules",
          description: "Learn how to customize Cursor Rules for your projects."
        },
        {
          title: "MCP Implementation",
          href: "/mcp/implementation",
          description: "Practical guide to implementing MCP in your development workflow."
        }
      ]}
    >
      <h2 id="introduction">Introduction</h2>
      <p>
        Cursor is an advanced, AI-powered code editor specifically designed for modern, AI-assisted development workflows. 
        Built on VS Code's foundation, Cursor extends traditional code editing with powerful AI capabilities that 
        help developers write, understand, and refactor code more efficiently.
      </p>
      <p>
        What sets Cursor apart is its comprehensive integration with the Model Context Protocol (MCP), allowing 
        for context-aware coding assistance across your entire project. This enables the AI to provide more relevant
        suggestions based on a deeper understanding of your codebase, dependencies, and development goals.
      </p>

      <Callout type="info" title="Cursor's Evolution">
        Cursor began as a specialized fork of VS Code focused on AI integration, and has rapidly evolved to 
        become a leading platform for AI-assisted development. Its design philosophy centers on 
        augmenting developer capabilities rather than replacing human judgment.
      </Callout>

      <h2 id="technical-capabilities">Technical Capabilities</h2>
      <p>
        Cursor offers a comprehensive suite of AI-powered features designed to enhance the development process:
      </p>

      <h3 id="code-completion">Code Completion and Generation</h3>
      <p>
        Cursor provides intelligent code completion that goes beyond traditional autocomplete:
      </p>
      <ul>
        <li><strong>Context-aware completions</strong>: Suggestions based on your current project context, not just the current file</li>
        <li><strong>Full function generation</strong>: Ability to generate entire functions based on descriptions or signatures</li>
        <li><strong>Documentation generation</strong>: Automatically create documentation comments for your code</li>
        <li><strong>Test generation</strong>: Create unit tests for existing functions</li>
      </ul>

      <p>
        Example of generating a function with Cursor:
      </p>

      <CodeBlock 
        language="javascript"
        code={`// Using Cursor to generate a function
// Prompt: "Create a function that validates URLs"

function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (err) {
    return false;
  }
}`}
      />

      <h3 id="error-detection">Error Detection and Debugging</h3>
      <p>
        Cursor enhances debugging workflows with AI assistance:
      </p>
      <ul>
        <li><strong>Error explanation</strong>: Plain-English explanations of error messages</li>
        <li><strong>Fix suggestions</strong>: Contextual suggestions for resolving errors</li>
        <li><strong>Runtime error analysis</strong>: Help with debugging complex runtime issues</li>
        <li><strong>Code inspection</strong>: Analyze code for potential bugs before execution</li>
      </ul>

      <h3 id="refactoring">Refactoring Assistance</h3>
      <p>
        Cursor provides powerful tools for code refactoring:
      </p>
      <ul>
        <li><strong>Intelligent restructuring</strong>: Reorganize code for better readability and maintainability</li>
        <li><strong>Modernization suggestions</strong>: Update code to use newer language features</li>
        <li><strong>Performance optimization</strong>: Identify and fix performance bottlenecks</li>
        <li><strong>Architecture improvements</strong>: Suggestions for better architectural patterns</li>
      </ul>

      <h3 id="context-aware">Context-Aware Development</h3>
      <p>
        Cursor understands the broader context of your project:
      </p>
      <ul>
        <li><strong>Project-wide awareness</strong>: AI features consider dependencies and related files</li>
        <li><strong>Framework understanding</strong>: Recognizes patterns and conventions in popular frameworks</li>
        <li><strong>Config file assistance</strong>: Help with configuration files for various tools and environments</li>
        <li><strong>Semantic search</strong>: Find functionality across your codebase based on natural language queries</li>
      </ul>

      <h2 id="mcp-integration">MCP Integration</h2>
      <p>
        One of Cursor's key advantages is its deep integration with the Model Context Protocol (MCP), 
        which enables more accurate, context-aware AI assistance.
      </p>

      <h3 id="context-sharing">Context Sharing Capabilities</h3>
      <p>
        Cursor can both consume and contribute to shared context through MCP:
      </p>
      <ul>
        <li><strong>Reading context</strong>: Cursor can access project context from MCP servers to enhance its suggestions</li>
        <li><strong>Writing context</strong>: As you work, Cursor can update shared context with new information</li>
        <li><strong>Context synchronization</strong>: Ensures AI features work with the latest project state</li>
        <li><strong>Multi-tool workflow</strong>: Seamlessly transition between Cursor and other MCP-compatible tools</li>
      </ul>

      <Callout type="success" title="Context Continuity">
        With MCP integration, the context you build in Cursor follows you to other tools. For example, 
        if you switch from Cursor to an MCP-compatible command-line tool, the AI will maintain awareness 
        of what you were working on in the editor.
      </Callout>

      <h3 id="configuration">MCP Configuration in Cursor</h3>
      <p>
        Setting up MCP in Cursor is straightforward:
      </p>

      <CodeBlock 
        language="json"
        filename="cursor-settings.json"
        code={`{
  "mcp.enabled": true,
  "mcp.serverUrl": "https://your-mcp-server.example.com",
  "mcp.authToken": "${process.env.MCP_AUTH_TOKEN}",
  "mcp.contextSync": {
    "automatic": true,
    "syncOnSave": true,
    "syncInterval": 300
  }
}`}
      />

      <p>
        These settings can be configured through Cursor's Settings UI or by directly editing the settings file.
      </p>

      <h2 id="advanced-usage">Advanced Usage</h2>
      <p>
        Beyond the basic features, Cursor offers several advanced capabilities for power users:
      </p>

      <h3 id="api-integration">API Integration</h3>
      <p>
        Cursor provides an API for programmatic interaction with its AI capabilities:
      </p>

      <CodeBlock 
        language="javascript"
        filename="cursor-api-example.js"
        code={`// Example of using Cursor's API to generate code
const { cursor } = require('@cursor/api');

async function generateFunction(description) {
  const result = await cursor.generateCode({
    prompt: description,
    language: 'javascript',
    maxTokens: 500
  });
  
  return result.code;
}

// Use the function
generateFunction("Create a function that sorts an array of objects by a specific property")
  .then(code => console.log(code));`}
      />

      <p>
        This API allows for integration with external tools, custom scripts, or automation workflows.
      </p>

      <h3 id="prompt-engineering">Prompt Engineering</h3>
      <p>
        You can fine-tune how Cursor's AI responds by crafting effective prompts:
      </p>
      <ul>
        <li><strong>Be specific</strong>: Include details about language, frameworks, and coding style</li>
        <li><strong>Provide context</strong>: Mention relevant information from your project</li>
        <li><strong>Use examples</strong>: Show examples of the output you want</li>
        <li><strong>Iterative refinement</strong>: Start with a basic prompt and refine based on results</li>
      </ul>

      <p>Example prompt progression:</p>

      <CodeBlock 
        language="text"
        code={`// Initial prompt
Write a React component that displays a list of items

// Improved prompt
Create a React functional component named 'ItemList' that takes an array of items 
as props and displays them in an ordered list. Each item should have 'id' and 'name' 
properties. Include proper TypeScript types and follow React best practices.`}
      />

      <h3 id="custom-scripts">Custom Scripts and Extensions</h3>
      <p>
        Cursor supports customization through scripts and extensions:
      </p>
      <ul>
        <li><strong>Custom commands</strong>: Create commands that leverage Cursor's AI capabilities</li>
        <li><strong>Workflow automation</strong>: Automate repetitive tasks with AI assistance</li>
        <li><strong>VS Code extensions</strong>: Most VS Code extensions work with Cursor</li>
        <li><strong>Custom snippets</strong>: Create AI-enhanced code snippets for common patterns</li>
      </ul>

      <h2 id="comparison">Comparison with Similar Tools</h2>
      <p>
        How does Cursor compare to other AI-assisted development tools?
      </p>

      <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
        <thead>
          <tr>
            <th className="px-3 py-3.5 text-left text-sm font-semibold">Feature</th>
            <th className="px-3 py-3.5 text-left text-sm font-semibold">Cursor</th>
            <th className="px-3 py-3.5 text-left text-sm font-semibold">GitHub Copilot</th>
            <th className="px-3 py-3.5 text-left text-sm font-semibold">Tabnine</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
          <tr>
            <td className="px-3 py-4 text-sm">MCP Integration</td>
            <td className="px-3 py-4 text-sm">✅ Full support</td>
            <td className="px-3 py-4 text-sm">❌ No support</td>
            <td className="px-3 py-4 text-sm">❌ No support</td>
          </tr>
          <tr>
            <td className="px-3 py-4 text-sm">Context Awareness</td>
            <td className="px-3 py-4 text-sm">✅ Project-wide</td>
            <td className="px-3 py-4 text-sm">✅ Limited</td>
            <td className="px-3 py-4 text-sm">✅ File-based</td>
          </tr>
          <tr>
            <td className="px-3 py-4 text-sm">Code Generation</td>
            <td className="px-3 py-4 text-sm">✅ Advanced</td>
            <td className="px-3 py-4 text-sm">✅ Advanced</td>
            <td className="px-3 py-4 text-sm">✅ Basic</td>
          </tr>
          <tr>
            <td className="px-3 py-4 text-sm">Error Detection</td>
            <td className="px-3 py-4 text-sm">✅ Strong</td>
            <td className="px-3 py-4 text-sm">✅ Limited</td>
            <td className="px-3 py-4 text-sm">❌ Minimal</td>
          </tr>
          <tr>
            <td className="px-3 py-4 text-sm">Refactoring</td>
            <td className="px-3 py-4 text-sm">✅ Comprehensive</td>
            <td className="px-3 py-4 text-sm">❌ Limited</td>
            <td className="px-3 py-4 text-sm">❌ Minimal</td>
          </tr>
          <tr>
            <td className="px-3 py-4 text-sm">API Access</td>
            <td className="px-3 py-4 text-sm">✅ Available</td>
            <td className="px-3 py-4 text-sm">❌ Not available</td>
            <td className="px-3 py-4 text-sm">✅ Limited</td>
          </tr>
          <tr>
            <td className="px-3 py-4 text-sm">Open Source Models</td>
            <td className="px-3 py-4 text-sm">✅ Supports multiple</td>
            <td className="px-3 py-4 text-sm">❌ Proprietary only</td>
            <td className="px-3 py-4 text-sm">✅ Limited support</td>
          </tr>
        </tbody>
      </table>

      <p>
        Cursor stands out particularly for its MCP integration, refactoring capabilities, and flexible model options.
      </p>

      <h2 id="getting-started">Getting Started with Cursor</h2>
      <p>
        Ready to try Cursor? Here's how to get started:
      </p>
      <ol>
        <li>Visit the <a href="https://cursor.sh" target="_blank" rel="noopener noreferrer">Cursor website</a> and download the appropriate version for your operating system</li>
        <li>Install and launch Cursor</li>
        <li>Open your project or create a new one</li>
        <li>Configure Cursor settings, including API keys if using custom models</li>
        <li>Set up MCP integration if you're using an MCP server</li>
        <li>Explore the AI features through the command palette (Cmd/Ctrl+Shift+P)</li>
      </ol>

      <p>
        For more detailed setup instructions, see our <a href="/tools/cursor/setup">Cursor Setup Guide</a>.
      </p>

      <Callout type="tip" title="Pro Tip">
        Start with smaller, focused tasks when first using Cursor. This helps you build an understanding 
        of how the AI responds to different types of requests and how to effectively communicate with it.
      </Callout>

      <p>
        Cursor represents a new generation of development tools that leverage AI to enhance, rather than replace, 
        the developer's expertise. With its powerful features and MCP integration, it offers a glimpse into the 
        future of collaborative human-AI software development.
      </p>
    </ContentTemplate>
  )
}