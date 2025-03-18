import { Metadata } from "next"
import { ContentTemplate, CodeBlock, Callout, SimpleTOC } from "@/components/content"
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
        timeToComplete: "15 minutes",
        prerequisites: [
          {
            title: "Introduction to AI-Assisted Development",
            href: "/introduction/concepts"
          }
        ]
      }}
      relatedContent={[
        {
          title: "MCP Context Management",
          href: "/mcp/context-management",
          description: "Learn how to effectively manage context in MCP implementations"
        },
        {
          title: "MCP Implementation Guide",
          href: "/mcp/implementation",
          description: "Get started implementing MCP in your own tools"
        },
        {
          title: "Building MCP Servers",
          href: "/building-servers",
          description: "Understand how to build and deploy MCP servers"
        }
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Table of Contents - sticky on left side */}
        <div className="hidden lg:block lg:col-span-3">
          <div className="sticky top-6">
            <SimpleTOC />
          </div>
        </div>
        
        {/* Main content */}
        <div className="lg:col-span-9">
          <div className="prose prose-lg dark:prose-invert">
            <h2 id="what-is-mcp">What is MCP?</h2>
            <p>
              The Model Context Protocol (MCP) is a standardized communication protocol designed to facilitate
              the sharing of context data between AI-powered development tools. It enables tools to exchange
              information about code, user workflows, and development environments in a consistent and
              interoperable way.
            </p>
            
            <p>
              MCP addresses a critical challenge in AI-assisted development: the fragmentation of context
              across different tools. When developers switch between tools, valuable context is often lost,
              forcing users to re-establish it with each new tool.
            </p>
            
            <Callout type="info" title="Definition">
              <p>
                MCP defines both a data format for representing development context and a set of APIs for
                exchanging this context between tools. This standardization allows developers to maintain
                a continuous and coherent workflow across multiple AI-powered tools.
              </p>
            </Callout>
            
            <h2 id="why-mcp-matters">Why MCP Matters</h2>
            <p>
              MCP provides several key benefits that improve the AI-assisted development experience:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 mb-8">
              <div className="bg-card rounded-lg border p-6">
                <h3 className="text-xl font-medium mb-2">Seamless Tool Integration</h3>
                <p className="text-muted-foreground">
                  MCP eliminates the context boundary between different tools, allowing developers to
                  switch between tools without losing valuable context information. This creates a more
                  fluid and productive workflow.
                </p>
              </div>
              
              <div className="bg-card rounded-lg border p-6">
                <h3 className="text-xl font-medium mb-2">Enhanced AI Capabilities</h3>
                <p className="text-muted-foreground">
                  By providing AI models with richer and more consistent context, MCP enables more accurate
                  and relevant responses, code recommendations, and assistance across all compatible tools.
                </p>
              </div>
              
              <div className="bg-card rounded-lg border p-6">
                <h3 className="text-xl font-medium mb-2">Ecosystem Innovation</h3>
                <p className="text-muted-foreground">
                  MCP creates a foundation for an interoperable ecosystem of AI development tools,
                  encouraging innovation and specialization without fragmenting the user experience.
                </p>
              </div>
              
              <div className="bg-card rounded-lg border p-6">
                <h3 className="text-xl font-medium mb-2">Developer Productivity</h3>
                <p className="text-muted-foreground">
                  By maintaining context across tools, developers spend less time re-explaining their
                  needs or requirements to different AI assistants, resulting in significant time savings.
                </p>
              </div>
            </div>
            
            <h3 id="real-world-example">A Real-World Example</h3>
            <p>
              Consider this common development scenario:
            </p>
            
            <div className="bg-muted p-6 rounded-lg mb-8">
              <p><strong>Without MCP:</strong> A developer uses an AI code assistant to generate a React component. 
              Later, they switch to a different tool to debug the component. The second tool has no awareness of 
              the component's purpose, dependencies, or implementation details, forcing the developer to 
              re-explain everything.</p>
              
              <div className="h-px bg-border my-4"></div>
              
              <p><strong>With MCP:</strong> The developer generates the React component with one AI tool. When they 
              switch to the debugging tool, it automatically receives the component's context through MCP, 
              including its purpose, related files, and implementation details. The debugging tool can immediately 
              provide relevant assistance without requiring additional explanation.</p>
            </div>
            
            <h2 id="core-components">Core Components of MCP</h2>
            <p>
              MCP consists of several key components that work together to enable context sharing:
            </p>
            
            <h3 id="context-data-model">Context Data Model</h3>
            <p>
              The foundation of MCP is its standardized data model for representing development context.
              This model defines how information about code, files, dependencies, user intentions, and
              other relevant data is structured and formatted.
            </p>
            
            <p>
              The MCP context data model typically includes:
            </p>
            
            <ul>
              <li><strong>Workspace Information:</strong> Repository details, project structure, etc.</li>
              <li><strong>File Contents:</strong> The actual content of relevant code files</li>
              <li><strong>Cursor Position:</strong> Where the user is currently working</li>
              <li><strong>Selection:</strong> Text currently selected by the user</li>
              <li><strong>Dependencies:</strong> Project dependencies and imports</li>
              <li><strong>User Intent:</strong> Current tasks or objectives</li>
              <li><strong>History:</strong> Previous interactions or commands</li>
            </ul>
            
            <h4>Example Context Data</h4>
            <CodeBlock
              language="json"
              code={`{
  "workspace": {
    "name": "my-react-app",
    "root": "/home/user/projects/my-react-app",
    "git": {
      "remote": "https://github.com/user/my-react-app",
      "branch": "feature/new-component"
    }
  },
  "files": [
    {
      "path": "src/components/Button.tsx",
      "content": "import React from 'react';\n\nexport interface ButtonProps {\n  label: string;\n  onClick?: () => void;\n  variant?: 'primary' | 'secondary';\n}\n\nexport const Button: React.FC<ButtonProps> = ({\n  label,\n  onClick,\n  variant = 'primary'\n}) => {\n  return (\n    <button\n      className={\\\"btn btn-\\\" + variant}\n      onClick={onClick}\n    >\n      {label}\n    </button>\n  );\n};\n",
      "language": "typescript",
      "cursor": {
        "line": 15,
        "character": 23
      }
    },
    {
      "path": "src/App.tsx",
      "content": "import React from 'react';\nimport { Button } from './components/Button';\n\nfunction App() {\n  return (\n    <div className=\"App\">\n      <Button label=\"Click me\" variant=\"primary\" />\n    </div>\n  );\n}\n\nexport default App;\n",
      "language": "typescript"
    }
  ],
  "intent": {
    "task": "Add hover state styles to the Button component",
    "context": "Implementing hover effects for better user experience"
  }
}`}
            />
            
            <h3 id="context-files">Context Files</h3>
            <p>
              MCP defines a standardized file format for storing and transferring context data. These
              context files can be exported from one tool and imported into another, enabling context
              sharing even between tools that don't directly communicate.
            </p>
            
            <p>
              Context files typically use JSON format and follow the MCP context data model structure.
              They include metadata about their creation, the tool that generated them, and the specific
              context they contain.
            </p>
            
            <CodeBlock
              language="json"
              code={`{
  "mcp_version": "1.0",
  "created_at": "2023-09-15T14:30:00Z",
  "created_by": {
    "tool": "CursorIDE",
    "version": "0.9.1"
  },
  "context": {
    // Context data as shown in the previous example
  }
}`}
            />
            
            <h3 id="context-servers">Context Servers</h3>
            <p>
              MCP Context Servers provide a central repository for storing and managing context data.
              These servers implement the MCP API and enable real-time context sharing between tools.
              They can be:
            </p>
            
            <ul>
              <li><strong>Local:</strong> Running on the developer's machine for personal use</li>
              <li><strong>Team-based:</strong> Shared within a development team</li>
              <li><strong>Organization-wide:</strong> Deployed across an entire organization</li>
            </ul>
            
            <p>
              Context servers handle authentication, authorization, data validation, and versioning
              of context data. They ensure that context is securely stored and only accessible to
              authorized tools and users.
            </p>
            
            <Callout type="tip" title="Deployment Flexibility">
              MCP servers can be deployed in various ways depending on your needs:
              <ul className="mt-2">
                <li>As standalone services</li>
                <li>Embedded within existing tools</li>
                <li>As cloud-based services</li>
                <li>Using serverless architectures</li>
              </ul>
            </Callout>
            
            <h3 id="api-specification">API Specification</h3>
            <p>
              The MCP API specification defines how tools interact with context data. It includes
              endpoints for:
            </p>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium">Operation</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Endpoint</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="px-4 py-3 text-sm">Get Context</td>
                    <td className="px-4 py-3 text-sm font-mono">/api/context/:id</td>
                    <td className="px-4 py-3 text-sm">Retrieve specific context by ID</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm">Create/Update Context</td>
                    <td className="px-4 py-3 text-sm font-mono">/api/context</td>
                    <td className="px-4 py-3 text-sm">Create or update context data</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm">List Context</td>
                    <td className="px-4 py-3 text-sm font-mono">/api/context/list</td>
                    <td className="px-4 py-3 text-sm">List available context resources</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm">Delete Context</td>
                    <td className="px-4 py-3 text-sm font-mono">/api/context/:id</td>
                    <td className="px-4 py-3 text-sm">Delete specific context</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm">Search Context</td>
                    <td className="px-4 py-3 text-sm font-mono">/api/context/search</td>
                    <td className="px-4 py-3 text-sm">Search for context data</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <h3 id="tool-integration">Tool Integration</h3>
            <p>
              For MCP to work effectively, tools need to integrate with the protocol. This integration
              typically involves:
            </p>
            
            <ol>
              <li><strong>Data Collection:</strong> Gathering relevant context from the tool's environment</li>
              <li><strong>Data Formatting:</strong> Structuring this context according to the MCP data model</li>
              <li><strong>Context Sharing:</strong> Sending context to and receiving context from MCP servers or files</li>
              <li><strong>Context Utilization:</strong> Applying the received context to enhance the tool's functionality</li>
            </ol>
            
            <h2 id="implementing-mcp">Implementing MCP</h2>
            <p>
              Implementing MCP in your own tools or workflows involves several key steps:
            </p>
            
            <h3 id="implementation-steps">Key Implementation Steps</h3>
            <ol>
              <li>
                <strong>Understand the MCP specification</strong>
                <p className="text-muted-foreground text-sm mt-1">
                  Familiarize yourself with the MCP data model, API specification, and context file format
                </p>
              </li>
              <li>
                <strong>Choose an implementation approach</strong>
                <p className="text-muted-foreground text-sm mt-1">
                  Decide whether to use existing MCP libraries, implement the protocol from scratch, or use a hybrid approach
                </p>
              </li>
              <li>
                <strong>Implement context collection</strong>
                <p className="text-muted-foreground text-sm mt-1">
                  Add code to your tool that collects relevant context data from the environment
                </p>
              </li>
              <li>
                <strong>Implement context formatting</strong>
                <p className="text-muted-foreground text-sm mt-1">
                  Format the collected context according to the MCP data model
                </p>
              </li>
              <li>
                <strong>Implement context sharing</strong>
                <p className="text-muted-foreground text-sm mt-1">
                  Add functionality to export context to files or share it via MCP servers
                </p>
              </li>
              <li>
                <strong>Implement context utilization</strong>
                <p className="text-muted-foreground text-sm mt-1">
                  Enhance your tool's functionality by utilizing imported or received context
                </p>
              </li>
            </ol>
            
            <h3 id="implementation-example">Simple Implementation Example</h3>
            <p>
              Here's a simplified example of implementing MCP context collection and formatting in a JavaScript/TypeScript application:
            </p>
            
            <CodeBlock
              language="typescript"
              code={`// context-collector.ts
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

/**
 * Collects and formats context according to MCP specification
 */
export class MCPContextCollector {
  private workspacePath: string;
  
  constructor(workspacePath: string) {
    this.workspacePath = workspacePath;
  }
  
  /**
   * Collects context from the current workspace
   */
  async collectContext(cursorFilePath?: string, cursorPosition?: { line: number, character: number }) {
    // Get workspace information
    const workspaceInfo = this.getWorkspaceInfo();
    
    // Get relevant files
    const relevantFiles = await this.getRelevantFiles(cursorFilePath);
    
    // Format as MCP context
    const context = {
      mcp_version: "1.0",
      created_at: new Date().toISOString(),
      created_by: {
        tool: "Example Tool",
        version: "1.0.0"
      },
      context: {
        workspace: workspaceInfo,
        files: relevantFiles,
        cursor: cursorFilePath && cursorPosition ? {
          path: cursorFilePath,
          position: cursorPosition
        } : undefined
      }
    };
    
    return context;
  }
  
  /**
   * Gets information about the workspace
   */
  private getWorkspaceInfo() {
    const name = path.basename(this.workspacePath);
    
    // Get git information if available
    let git;
    try {
      const remote = execSync('git remote get-url origin', { cwd: this.workspacePath }).toString().trim();
      const branch = execSync('git branch --show-current', { cwd: this.workspacePath }).toString().trim();
      git = { remote, branch };
    } catch (error) {
      // Repository might not be a git repository
      git = undefined;
    }
    
    return {
      name,
      root: this.workspacePath,
      git
    };
  }
  
  /**
   * Gets relevant files from the workspace
   */
  private async getRelevantFiles(cursorFilePath?: string) {
    const files = [];
    
    // Add the current file if specified
    if (cursorFilePath) {
      const absPath = path.resolve(this.workspacePath, cursorFilePath);
      if (fs.existsSync(absPath)) {
        const content = fs.readFileSync(absPath, 'utf-8');
        const relPath = path.relative(this.workspacePath, absPath);
        files.push({
          path: relPath,
          content,
          language: this.getLanguageFromPath(relPath)
        });
      }
    }
    
    // Add other relevant files (simplified example)
    // In a real implementation, you would add logic to determine which other files are relevant
    
    return files;
  }
  
  /**
   * Determines language based on file extension
   */
  private getLanguageFromPath(filePath: string) {
    const ext = path.extname(filePath).toLowerCase();
    const langMap: {[key: string]: string} = {
      '.js': 'javascript',
      '.ts': 'typescript',
      '.jsx': 'javascriptreact',
      '.tsx': 'typescriptreact',
      '.py': 'python',
      '.java': 'java',
      '.html': 'html',
      '.css': 'css',
      '.json': 'json'
    };
    
    return langMap[ext] || 'plaintext';
  }
}

// Example usage
async function main() {
  const collector = new MCPContextCollector('/path/to/workspace');
  const context = await collector.collectContext(
    'src/components/Button.tsx',
    { line: 10, character: 5 }
  );
  
  // Save context to file
  fs.writeFileSync('context.mcp.json', JSON.stringify(context, null, 2));
  
  // Or send to MCP server
  // await fetch('http://localhost:3000/api/context', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(context)
  // });
}

main().catch(console.error);`}
            />
            
            <h2 id="best-practices">Best Practices</h2>
            <p>
              When working with MCP, consider these best practices:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 mb-8">
              <div className="bg-card rounded-lg border p-6">
                <h3 className="text-xl font-medium mb-2">Focus on Relevant Context</h3>
                <p className="text-muted-foreground">
                  Include only context that's relevant to the current task. Too much context can be
                  as problematic as too little, leading to performance issues and reduced effectiveness.
                </p>
              </div>
              
              <div className="bg-card rounded-lg border p-6">
                <h3 className="text-xl font-medium mb-2">Prioritize Security</h3>
                <p className="text-muted-foreground">
                  Ensure that sensitive information is properly protected. Use encryption, secure
                  authentication, and proper access controls when sharing context.
                </p>
              </div>
              
              <div className="bg-card rounded-lg border p-6">
                <h3 className="text-xl font-medium mb-2">Implement Graceful Degradation</h3>
                <p className="text-muted-foreground">
                  Design your MCP integration to work well even when context is incomplete or unavailable.
                  Tools should remain functional even if context sharing fails.
                </p>
              </div>
              
              <div className="bg-card rounded-lg border p-6">
                <h3 className="text-xl font-medium mb-2">Use Versioning</h3>
                <p className="text-muted-foreground">
                  Include version information in your context data to ensure compatibility between
                  different tools and MCP implementations. This facilitates smoother upgrades and changes.
                </p>
              </div>
            </div>
            
            <h2 id="conclusion">Conclusion</h2>
            <p>
              The Model Context Protocol represents a significant step forward in AI-assisted development.
              By standardizing context sharing between tools, MCP enables a more cohesive, efficient, and
              powerful development experience.
            </p>
            
            <p>
              As you explore MCP further, consider how you might integrate it into your own tools and
              workflows to enhance your AI-assisted development experience.
            </p>
            
            <Callout type="info" title="Next Steps">
              <p>
                Continue your MCP journey by exploring the <a href="/mcp/implementation" className="text-primary hover:underline">Implementation Guide</a> to
                learn more about implementing MCP in your own tools, or check out <a href="/mcp/context-management" className="text-primary hover:underline">Context Management</a>
                to learn best practices for managing MCP context.
              </p>
            </Callout>
          </div>
        </div>
      </div>
    </ContentTemplate>
  )
}