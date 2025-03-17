import { Metadata } from "next"
import { ContentTemplate, CodeBlock, Callout } from "@/components/content"
import { generateMetadata } from "@/lib/content-utils"

export const metadata: Metadata = generateMetadata({
  title: "Windsurf: Code Assistant with MCP Integration",
  description: "Learn about Windsurf, a powerful code assistant with MCP integration for context-aware development workflows.",
  keywords: ["Windsurf", "code assistant", "MCP integration", "AI coding", "IDE extensions", "context-aware coding"],
  section: "tools/windsurf"
})

export default function WindsurfTool() {
  return (
    <ContentTemplate
      title="Windsurf: Code Assistant with MCP Integration"
      description="Learn about Windsurf, a powerful code assistant with MCP integration for context-aware development workflows."
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
              id: "code-assistance",
              title: "Code Completion and Generation",
              level: 3
            },
            {
              id: "code-explanation",
              title: "Code Explanation and Documentation",
              level: 3
            },
            {
              id: "error-handling",
              title: "Error Detection and Resolution",
              level: 3
            },
            {
              id: "ide-integration",
              title: "IDE Integration",
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
              id: "context-management",
              title: "Context Management",
              level: 3
            },
            {
              id: "mcp-configuration",
              title: "MCP Configuration in Windsurf",
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
              id: "command-line",
              title: "Command-Line Interface",
              level: 3
            },
            {
              id: "customization",
              title: "Customization Options",
              level: 3
            },
            {
              id: "api-access",
              title: "API Integration",
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
          title: "Getting Started with Windsurf",
          level: 2
        }
      ]}
      relatedContent={[
        {
          title: "Cursor Tool Guide",
          href: "/tools/cursor",
          description: "Learn about Cursor, another powerful AI-powered code editor with MCP integration."
        },
        {
          title: "MCP Implementation",
          href: "/mcp/implementation",
          description: "Practical guide to implementing MCP in your development workflow."
        },
        {
          title: "Practical LLM Usage",
          href: "/best-practices/practical-llm-usage",
          description: "Best practices for effectively using Large Language Models in development."
        },
        {
          title: "Code Review Best Practices",
          href: "/best-practices/code-review",
          description: "Guidelines for reviewing AI-generated code in your projects."
        }
      ]}
    >
      <h2 id="introduction">Introduction</h2>
      <p>
        Windsurf is a versatile code assistant designed to enhance your development workflow through AI-powered 
        features and MCP integration. Unlike traditional coding assistants, Windsurf focuses on providing 
        context-aware suggestions by leveraging the Model Context Protocol to maintain a comprehensive understanding 
        of your project.
      </p>
      <p>
        With its flexible approach to integration, Windsurf can be used through various IDEs, as a command-line tool, 
        or via its API, making it adaptable to diverse development environments and team workflows. Its deep integration 
        with MCP enables seamless context sharing between different tools and team members.
      </p>

      <Callout type="info" title="Windsurf Origin">
        Windsurf emerged from the growing need for AI tools that could maintain context across different 
        environments and development stages. It was designed from the ground up with MCP integration as a core feature, 
        rather than as an afterthought.
      </Callout>

      <h2 id="technical-capabilities">Technical Capabilities</h2>
      <p>
        Windsurf offers a comprehensive set of features designed to streamline development and enhance code quality:
      </p>

      <h3 id="code-assistance">Code Completion and Generation</h3>
      <p>
        Windsurf provides intelligent code assistance that understands the broader context of your project:
      </p>
      <ul>
        <li><strong>Contextual completions</strong>: Suggestions based on your entire codebase, not just the current file</li>
        <li><strong>Full-function generation</strong>: Generate complete functions based on natural language descriptions</li>
        <li><strong>Targeted code snippets</strong>: Request specific implementations for common patterns and algorithms</li>
        <li><strong>Multi-file awareness</strong>: Code suggestions that take into account dependencies and imports across files</li>
      </ul>

      <p>
        Example of generating a function with Windsurf:
      </p>

      <CodeBlock 
        language="python"
        code={`# Ask Windsurf to create a function that calculates Fibonacci numbers
# Prompt: "Create a recursive and memoized function to calculate Fibonacci numbers"

def fibonacci(n, memo=None):
    """
    Calculate the nth Fibonacci number using memoization.
    
    Args:
        n: The position in the Fibonacci sequence
        memo: Dictionary for memoization, default is None
        
    Returns:
        The nth Fibonacci number
    """
    if memo is None:
        memo = {}
        
    if n in memo:
        return memo[n]
        
    if n <= 0:
        return 0
    elif n == 1:
        return 1
    
    memo[n] = fibonacci(n-1, memo) + fibonacci(n-2, memo)
    return memo[n]`}
      />

      <h3 id="code-explanation">Code Explanation and Documentation</h3>
      <p>
        Windsurf helps you understand and document your code:
      </p>
      <ul>
        <li><strong>Code explanation</strong>: Get natural language explanations of complex code blocks</li>
        <li><strong>Automatic documentation</strong>: Generate docstrings and comments for functions and classes</li>
        <li><strong>API understanding</strong>: Explain libraries and frameworks with relevant examples</li>
        <li><strong>Learning assistance</strong>: Learn new languages or frameworks through interactive explanations</li>
      </ul>

      <CodeBlock 
        language="javascript"
        code={`// Example: Ask Windsurf to explain this code
const debounce = (func, wait, immediate) => {
  let timeout;
  return function() {
    const context = this, args = arguments;
    const later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
};

// Windsurf explanation:
// This function creates a debounced version of the input function 'func'.
// Debouncing means the function will only execute after a specified delay ('wait')
// has passed without the function being called again.
// 
// When called with 'immediate' set to true, it will trigger on the leading edge
// instead of the trailing edge of the wait interval.
// 
// Common use cases: Search input handlers, window resize handlers, etc.`}
      />

      <h3 id="error-handling">Error Detection and Resolution</h3>
      <p>
        Windsurf helps identify and fix code issues:
      </p>
      <ul>
        <li><strong>Error identification</strong>: Detect potential bugs and issues before runtime</li>
        <li><strong>Fix suggestions</strong>: Get contextual suggestions for fixing detected errors</li>
        <li><strong>Performance improvement</strong>: Identify and address performance bottlenecks</li>
        <li><strong>Security analysis</strong>: Highlight potential security vulnerabilities with remediation suggestions</li>
      </ul>

      <h3 id="ide-integration">IDE Integration</h3>
      <p>
        Windsurf integrates with popular development environments:
      </p>
      <ul>
        <li><strong>VS Code extension</strong>: Seamless integration with Visual Studio Code</li>
        <li><strong>JetBrains plugins</strong>: Support for IntelliJ IDEA, PyCharm, WebStorm, and other JetBrains IDEs</li>
        <li><strong>Vim/Neovim plugin</strong>: Integration for terminal-based editors</li>
        <li><strong>Browser-based editors</strong>: Support for environments like Jupyter notebooks and cloud IDEs</li>
      </ul>

      <h2 id="mcp-integration">MCP Integration</h2>
      <p>
        Windsurf's integration with the Model Context Protocol is one of its defining features, enabling a more cohesive 
        and context-aware development experience.
      </p>

      <h3 id="context-management">Context Management</h3>
      <p>
        Windsurf leverages MCP for sophisticated context handling:
      </p>
      <ul>
        <li><strong>Project-wide context</strong>: Maintains awareness of your entire project structure</li>
        <li><strong>Cross-tool sharing</strong>: Share context with other MCP-compatible tools like Cursor</li>
        <li><strong>Context persistence</strong>: Maintain context between sessions and across different machines</li>
        <li><strong>Team context sharing</strong>: Collaborate with team members using shared context</li>
      </ul>

      <Callout type="success" title="Seamless Transitions">
        One of Windsurf's key advantages is the ability to switch between different environments while 
        maintaining context. Start coding in your IDE, continue with the command-line interface when SSHing 
        into a server, and return to your IDE without losing the AI's understanding of what you're working on.
      </Callout>

      <h3 id="mcp-configuration">MCP Configuration in Windsurf</h3>
      <p>
        Setting up MCP in Windsurf involves a few simple configuration steps:
      </p>

      <CodeBlock 
        language="json"
        filename="windsurf-config.json"
        code={`{
  "mcp": {
    "enabled": true,
    "server": "https://mcp-server.example.com",
    "authToken": "${process.env.MCP_AUTH_TOKEN}",
    "projectId": "my-awesome-project",
    "syncOptions": {
      "autoSync": true,
      "syncInterval": 120,
      "pushOnSave": true,
      "pullOnOpen": true
    }
  }
}`}
      />

      <p>
        This configuration can be applied globally or per-project, giving you fine-grained control over how context is managed.
      </p>

      <h2 id="advanced-usage">Advanced Usage</h2>
      <p>
        Beyond basic features, Windsurf offers several advanced capabilities for power users:
      </p>

      <h3 id="command-line">Command-Line Interface</h3>
      <p>
        Windsurf's CLI provides powerful functionality from the terminal:
      </p>

      <CodeBlock 
        language="bash"
        code={`# Generate a React component from the command line
windsurf generate --type="react-component" --name="UserProfile" --props="user:UserType" --output="./src/components"

# Explain a complex piece of code
windsurf explain --file="./src/utils/data-processing.js" --lines=45-78

# Analyze code for potential issues
windsurf analyze --path="./src" --fix --ignore="node_modules,dist"

# Connect to MCP server
windsurf mcp connect --server="https://mcp-server.example.com" --token="$MCP_TOKEN"`}
      />

      <p>
        The CLI is particularly useful for batch operations, CI/CD integration, and working in environments where a GUI isn't available.
      </p>

      <h3 id="customization">Customization Options</h3>
      <p>
        Windsurf can be tailored to your specific needs:
      </p>
      <ul>
        <li><strong>Custom templates</strong>: Define templates for code generation based on your project's patterns</li>
        <li><strong>Language-specific settings</strong>: Configure behavior differently based on programming language</li>
        <li><strong>Team standards</strong>: Enforce coding standards and best practices through configuration</li>
        <li><strong>Context rules</strong>: Control what information is included in the MCP context</li>
      </ul>

      <CodeBlock 
        language="yaml"
        filename="windsurf.yaml"
        code={`# Custom Windsurf configuration
language_settings:
  python:
    formatter: black
    docstring_style: google
    linter: pylint
  javascript:
    formatter: prettier
    docstring_style: jsdoc
    linter: eslint

templates:
  react_component:
    path: ./templates/react-component.tsx
    variables:
      - name
      - props
      - styles

context_rules:
  include:
    - "src/**/*.{js,ts,tsx}"
    - "docs/**/*.md"
  exclude:
    - "**/node_modules/**"
    - "**/tests/**"
    - "**/*.test.{js,ts}"`}
      />

      <h3 id="api-access">API Integration</h3>
      <p>
        Windsurf provides an API for programmatic access to its features:
      </p>

      <CodeBlock 
        language="javascript"
        filename="windsurf-api-example.js"
        code={`const { Windsurf } = require('@windsurf/api');

// Initialize the client
const windsurf = new Windsurf({
  apiKey: process.env.WINDSURF_API_KEY,
  mcpEnabled: true,
  mcpServer: 'https://mcp-server.example.com'
});

// Generate code
async function generateModelClass(name, fields) {
  const result = await windsurf.generateCode({
    template: 'model-class',
    language: 'typescript',
    parameters: {
      name,
      fields
    }
  });
  
  return result.code;
}

// Use in your workflow
generateModelClass('User', [
  { name: 'id', type: 'string' },
  { name: 'username', type: 'string' },
  { name: 'email', type: 'string' },
  { name: 'createdAt', type: 'Date' }
]).then(code => {
  console.log(code);
  // Do something with the generated code
});`}
      />

      <p>
        The API enables integration with custom tools, build systems, and automated workflows.
      </p>

      <h2 id="comparison">Comparison with Similar Tools</h2>
      <p>
        How does Windsurf compare to other AI-assisted development tools?
      </p>

      <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
        <thead>
          <tr>
            <th className="px-3 py-3.5 text-left text-sm font-semibold">Feature</th>
            <th className="px-3 py-3.5 text-left text-sm font-semibold">Windsurf</th>
            <th className="px-3 py-3.5 text-left text-sm font-semibold">Cursor</th>
            <th className="px-3 py-3.5 text-left text-sm font-semibold">GitHub Copilot</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
          <tr>
            <td className="px-3 py-4 text-sm">MCP Integration</td>
            <td className="px-3 py-4 text-sm">✅ Native support</td>
            <td className="px-3 py-4 text-sm">✅ Full support</td>
            <td className="px-3 py-4 text-sm">❌ No support</td>
          </tr>
          <tr>
            <td className="px-3 py-4 text-sm">Command-Line Interface</td>
            <td className="px-3 py-4 text-sm">✅ Comprehensive</td>
            <td className="px-3 py-4 text-sm">✅ Basic</td>
            <td className="px-3 py-4 text-sm">❌ Not available</td>
          </tr>
          <tr>
            <td className="px-3 py-4 text-sm">IDE Support</td>
            <td className="px-3 py-4 text-sm">✅ Multiple IDEs</td>
            <td className="px-3 py-4 text-sm">✅ Standalone + VS Code</td>
            <td className="px-3 py-4 text-sm">✅ Multiple IDEs</td>
          </tr>
          <tr>
            <td className="px-3 py-4 text-sm">API Access</td>
            <td className="px-3 py-4 text-sm">✅ Full API</td>
            <td className="px-3 py-4 text-sm">✅ Available</td>
            <td className="px-3 py-4 text-sm">❌ Limited</td>
          </tr>
          <tr>
            <td className="px-3 py-4 text-sm">Customization</td>
            <td className="px-3 py-4 text-sm">✅ Extensive</td>
            <td className="px-3 py-4 text-sm">✅ Good</td>
            <td className="px-3 py-4 text-sm">✅ Limited</td>
          </tr>
          <tr>
            <td className="px-3 py-4 text-sm">Team Collaboration</td>
            <td className="px-3 py-4 text-sm">✅ Strong</td>
            <td className="px-3 py-4 text-sm">✅ Good</td>
            <td className="px-3 py-4 text-sm">❌ Limited</td>
          </tr>
          <tr>
            <td className="px-3 py-4 text-sm">Standalone Editor</td>
            <td className="px-3 py-4 text-sm">❌ No</td>
            <td className="px-3 py-4 text-sm">✅ Yes</td>
            <td className="px-3 py-4 text-sm">❌ No</td>
          </tr>
        </tbody>
      </table>

      <p>
        Windsurf particularly excels in its command-line capabilities, extensive customization options, and native MCP support,
        making it ideal for teams that work across different environments and tools.
      </p>

      <h2 id="getting-started">Getting Started with Windsurf</h2>
      <p>
        Ready to try Windsurf? Here's how to get started:
      </p>
      <ol>
        <li>Visit the <a href="https://example.com/windsurf" target="_blank" rel="noopener noreferrer">Windsurf website</a> to download the tool</li>
        <li>Install the core package: <code>npm install -g @windsurf/cli</code> or <code>pip install windsurf</code></li>
        <li>Add the extension for your preferred IDE:
          <ul>
            <li>VS Code: Install from the marketplace or <code>code --install-extension windsurf.vscode</code></li>
            <li>JetBrains: Install from the marketplace</li>
            <li>Vim/Neovim: Follow the plugin installation instructions</li>
          </ul>
        </li>
        <li>Initialize Windsurf in your project: <code>windsurf init</code></li>
        <li>Configure MCP integration if desired</li>
        <li>Start using Windsurf in your development workflow</li>
      </ol>

      <Callout type="tip" title="Quick Start">
        For a hands-on introduction, try Windsurf's interactive tutorial by running
        <code>windsurf tutorial</code> after installation. It guides you through the main features
        in about 15 minutes.
      </Callout>

      <p>
        Windsurf's flexibility makes it suitable for a wide range of development workflows, from solo
        developers to large teams. Its MCP integration ensures that context is maintained across different
        tools and environments, making AI-assisted development more consistent and productive.
      </p>
    </ContentTemplate>
  )
}