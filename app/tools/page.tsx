import { Metadata } from "next"
import { ContentTemplate, Callout } from "@/components/content"
import { generateMetadata } from "@/lib/content-utils"
import Link from "next/link"

export const metadata: Metadata = generateMetadata({
  title: "AI Development Tools",
  description: "Explore tools that support AI-assisted development and MCP integration to enhance your development workflow.",
  keywords: ["AI tools", "MCP integration", "Cursor", "Windsurf", "code assistants"],
  section: "tools"
})

export default function AIToolsPage() {
  return (
    <ContentTemplate
      title="AI Development Tools"
      description="Explore tools that support AI-assisted development and MCP integration to enhance your development workflow."
      metadata={{
        difficulty: "beginner",
        timeToComplete: "10 minutes"
      }}
      tableOfContents={[
        {
          id: "introduction",
          title: "Introduction",
          level: 2
        },
        {
          id: "tools-comparison",
          title: "Tools Comparison",
          level: 2
        },
        {
          id: "featured-tools",
          title: "Featured Tools",
          level: 2,
          children: [
            {
              id: "cursor",
              title: "Cursor",
              level: 3
            },
            {
              id: "windsurf",
              title: "Windsurf",
              level: 3
            }
          ]
        },
        {
          id: "mcp-compatibility",
          title: "MCP Compatibility",
          level: 2
        },
        {
          id: "getting-started",
          title: "Getting Started",
          level: 2
        }
      ]}
      relatedContent={[
        {
          title: "MCP Implementation",
          href: "/mcp/implementation",
          description: "Learn how to implement MCP in your development workflow to maximize tool effectiveness."
        },
        {
          title: "Practical LLM Usage",
          href: "/best-practices/practical-llm-usage",
          description: "Best practices for effectively using Large Language Models in development."
        },
        {
          title: "Best Practices",
          href: "/best-practices",
          description: "Comprehensive guidelines for effective, secure AI-assisted development."
        }
      ]}
    >
      <h2 id="introduction">Introduction</h2>
      <p>
        AI development tools are revolutionizing how developers write, understand, and maintain code. These tools leverage 
        Large Language Models (LLMs) and other AI technologies to provide intelligent code suggestions, automated 
        documentation, error detection, and more. By integrating these tools into your workflow, you can significantly 
        increase productivity and code quality.
      </p>
      <p>
        This section focuses on tools that support the Model Context Protocol (MCP), which enables context-aware 
        development across different environments and applications. MCP-compatible tools can share context with 
        each other, creating a more cohesive and efficient development experience.
      </p>
      <p>
        We specifically highlight Cursor and Windsurf as our recommended tools for AI-assisted development. These 
        tools offer robust MCP integration and advanced features that make them particularly effective for modern 
        development workflows.
      </p>
      
      <Callout type="info" title="Why MCP Matters">
        The Model Context Protocol creates a standardized way for AI tools to share context about your 
        project. Without MCP, each tool maintains its own understanding of your code, leading to fragmented 
        experiences and repetitive context setting. With MCP, the context you build in one tool can be 
        seamlessly used by others.
      </Callout>

      <h2 id="tools-comparison">Tools Comparison</h2>
      <p>
        The following table compares key features of the AI development tools covered in this section:
      </p>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
          <thead>
            <tr>
              <th className="px-3 py-3.5 text-left text-sm font-semibold">Feature</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold">Cursor</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold">Windsurf</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            <tr>
              <td className="px-3 py-4 text-sm">Primary Use</td>
              <td className="px-3 py-4 text-sm">Code Editor</td>
              <td className="px-3 py-4 text-sm">Code Assistant</td>
            </tr>
            <tr>
              <td className="px-3 py-4 text-sm">MCP Integration</td>
              <td className="px-3 py-4 text-sm">✅ Full</td>
              <td className="px-3 py-4 text-sm">✅ Native</td>
            </tr>
            <tr>
              <td className="px-3 py-4 text-sm">Code Generation</td>
              <td className="px-3 py-4 text-sm">✅ Advanced</td>
              <td className="px-3 py-4 text-sm">✅ Advanced</td>
            </tr>
            <tr>
              <td className="px-3 py-4 text-sm">IDE Integration</td>
              <td className="px-3 py-4 text-sm">✅ Standalone + VS Code</td>
              <td className="px-3 py-4 text-sm">✅ Multiple IDEs</td>
            </tr>
            <tr>
              <td className="px-3 py-4 text-sm">Command Line</td>
              <td className="px-3 py-4 text-sm">✅ Basic</td>
              <td className="px-3 py-4 text-sm">✅ Comprehensive</td>
            </tr>
            <tr>
              <td className="px-3 py-4 text-sm">API Access</td>
              <td className="px-3 py-4 text-sm">✅ Available</td>
              <td className="px-3 py-4 text-sm">✅ Full</td>
            </tr>
            <tr>
              <td className="px-3 py-4 text-sm">Team Collaboration</td>
              <td className="px-3 py-4 text-sm">✅ Good</td>
              <td className="px-3 py-4 text-sm">✅ Strong</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 id="featured-tools">Featured Tools</h2>
      <p>
        Our featured AI development tools represent various approaches to AI-assisted development, each with unique strengths and use cases.
      </p>

      <h3 id="cursor">Cursor</h3>
      <div className="flex items-center space-x-2 mb-2">
        <span className="bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100 px-2 py-1 rounded text-xs font-medium">MCP Native</span>
        <span className="bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100 px-2 py-1 rounded text-xs font-medium">Code Editor</span>
      </div>
      <p>
        Cursor is an AI-powered code editor built on VS Code's foundation, offering comprehensive features for coding assistance, 
        refactoring, error detection, and more. With full MCP integration, it maintains context awareness across your entire project, 
        providing more relevant suggestions based on a deeper understanding of your codebase.
      </p>
      <div className="mt-2 mb-6">
        <Link 
          href="/tools/cursor" 
          className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
        >
          Learn more about Cursor →
        </Link>
      </div>

      <h3 id="windsurf">Windsurf</h3>
      <div className="flex items-center space-x-2 mb-2">
        <span className="bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100 px-2 py-1 rounded text-xs font-medium">MCP Native</span>
        <span className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100 px-2 py-1 rounded text-xs font-medium">Code Assistant</span>
      </div>
      <p>
        Windsurf is a versatile code assistant designed for context-aware development across different environments. 
        It excels in multi-environment workflows with support for various IDEs, command-line usage, and API integration. 
        Its native MCP support ensures seamless context sharing, making it particularly valuable for teams working across 
        different tools and environments.
      </p>
      <div className="mt-2 mb-6">
        <Link 
          href="/tools/windsurf" 
          className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
        >
          Learn more about Windsurf →
        </Link>
      </div>

      <h2 id="mcp-compatibility">MCP Compatibility</h2>
      <p>
        MCP compatibility exists on a spectrum, from native integration to custom implementations:
      </p>
      <ul>
        <li>
          <strong>Native Support</strong>: Tools like Cursor and Windsurf are built with MCP in mind, offering seamless integration 
          without additional configuration.
        </li>
        <li>
          <strong>API Integration</strong>: Services like Claude and the OpenAI Agent SDK can work with MCP through their APIs, 
          with custom code to handle context sharing.
        </li>
        <li>
          <strong>Custom Adapters</strong>: For tools without direct MCP support, adapters can be created to bridge the gap and 
          enable some level of context sharing.
        </li>
      </ul>
      <p>
        When selecting tools for your workflow, consider how important context sharing is for your specific needs.
      </p>

      <Callout type="tip" title="Maximize MCP Benefits">
        For the best experience, combine tools with native MCP support (like Cursor and Windsurf) to create 
        a seamless development environment where context flows naturally between different parts of your workflow.
      </Callout>

      <h2 id="getting-started">Getting Started</h2>
      <p>
        To begin exploring AI development tools with MCP integration:
      </p>
      <ol>
        <li>Start with <Link href="/tools/cursor" className="text-blue-600 dark:text-blue-400 hover:underline">Cursor</Link> or <Link href="/tools/windsurf" className="text-blue-600 dark:text-blue-400 hover:underline">Windsurf</Link> for native MCP support</li>
        <li>Set up an MCP server by following our <Link href="/mcp/implementation" className="text-blue-600 dark:text-blue-400 hover:underline">MCP Implementation</Link> guide</li>
        <li>Configure your tools to use the same MCP server for context sharing</li>
        <li>Gradually incorporate additional tools as needed for specific tasks</li>
        <li>Review our <Link href="/best-practices" className="text-blue-600 dark:text-blue-400 hover:underline">Best Practices</Link> section for guidance on effective AI-assisted development</li>
      </ol>
      <p>
        By starting with MCP-native tools and gradually expanding your toolkit, you can build a powerful, 
        cohesive development environment that leverages AI throughout your workflow.
      </p>
    </ContentTemplate>
  )
}