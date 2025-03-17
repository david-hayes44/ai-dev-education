import { Metadata } from "next"
import { Container } from "@/components/ui/container"
import { PageHeader } from "@/components/page-header"
import { Callout } from "@/components/content"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Project Customization for AI Integration",
  description: "Comprehensive guidelines for setting up and customizing your projects to work optimally with AI-assisted development tools and MCP.",
}

export default function Page() {
  return (
    <>
      <PageHeader
        title="Project Customization for AI Integration"
        description="Comprehensive guidelines for setting up and customizing your projects to work optimally with AI-assisted development tools and MCP."
      />
      <Container className="py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Table of Contents - only visible on larger screens */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="p-4 border rounded-lg sticky top-20">
              <p className="font-medium mb-3">On this page</p>
              <ul className="space-y-1 text-sm">
                <li>
                  <a 
                    href="#why-project-setup" 
                    className="text-muted-foreground hover:text-primary transition-colors block py-1"
                  >
                    Why Project Setup Matters
                  </a>
                </li>
                <li>
                  <a 
                    href="#project-structure" 
                    className="text-muted-foreground hover:text-primary transition-colors block py-1"
                  >
                    Project Structure for AI Tools
                  </a>
                </li>
                <li>
                  <a 
                    href="#configuration-files" 
                    className="text-muted-foreground hover:text-primary transition-colors block py-1"
                  >
                    Configuration Files and Dotfiles
                  </a>
                </li>
                <li>
                  <a 
                    href="#documentation" 
                    className="text-muted-foreground hover:text-primary transition-colors block py-1"
                  >
                    Documentation for AI Context
                  </a>
                </li>
                <li>
                  <a 
                    href="#dependency-management" 
                    className="text-muted-foreground hover:text-primary transition-colors block py-1"
                  >
                    Dependency Management
                  </a>
                </li>
                <li>
                  <a 
                    href="#git-integration" 
                    className="text-muted-foreground hover:text-primary transition-colors block py-1"
                  >
                    Git Integration for AI Tools
                  </a>
                </li>
                <li>
                  <a 
                    href="#mcp-integration" 
                    className="text-muted-foreground hover:text-primary transition-colors block py-1"
                  >
                    MCP Integration
                  </a>
                </li>
                <li>
                  <a 
                    href="#ci-cd" 
                    className="text-muted-foreground hover:text-primary transition-colors block py-1"
                  >
                    CI/CD Pipeline Integration
                  </a>
                </li>
                <li>
                  <a 
                    href="#case-studies" 
                    className="text-muted-foreground hover:text-primary transition-colors block py-1"
                  >
                    Case Studies
                  </a>
                </li>
                <li>
                  <a 
                    href="#related-resources" 
                    className="text-muted-foreground hover:text-primary transition-colors block py-1"
                  >
                    Related Resources
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Main content */}
          <div className="lg:col-span-9">
            <div className="prose prose-lg dark:prose-invert mx-auto">
              <h2 id="why-project-setup">Why Project Setup Matters for AI-Assisted Development</h2>
              <p>
                The effectiveness of AI development tools depends significantly on how your project is structured and configured.
                Thoughtful project organization, well-selected tech stacks, and proper configurations enable AI tools to 
                provide more accurate, context-aware assistance, which directly impacts development speed and code quality.
              </p>
              
              <p>
                This guide provides detailed best practices for customizing your projects to work optimally with AI tools,
                with a focus on Model Context Protocol (MCP) integration to create a cohesive development environment.
              </p>

              <Callout type="info" title="Key Benefits of AI-Optimized Project Setup">
                <ul className="mt-2 mb-0">
                  <li>More accurate code suggestions from AI tools</li>
                  <li>Streamlined context sharing between different tools</li>
                  <li>Faster onboarding for team members</li>
                  <li>Improved collaboration through consistent contexts</li>
                  <li>Higher code quality and maintainability</li>
                </ul>
              </Callout>

              <h2 id="project-structure">Project Structure for AI Tools</h2>
              <p>
                Organizing your project directory and files in a way that supports AI tool integration helps maintain
                clarity and provides AI assistants with navigable context. Here are key recommendations:
              </p>

              <h3 id="create-ai-specific-directories">1. Create AI-Specific Directories</h3>
              <p>
                Designate specific directories for AI-related files to streamline AI tool integration and review processes.
              </p>
              <div className="bg-muted p-4 rounded-md">
                <p className="font-mono text-sm">
                  <strong>Example Project Structure:</strong>
                </p>
                <pre className="bg-card p-2 rounded">
                  {`project/
├── src/               # Main source code
├── tests/             # Test files
├── docs/              # Documentation
├── ai/                # AI-specific directory
│   ├── context/       # MCP context files
│   │   ├── global/    # Project-wide context
│   │   └── features/  # Feature-specific context
│   ├── prompts/       # Reusable prompts for AI tools
│   ├── rules/         # AI tool rules (e.g., Cursor rules)
│   └── generated/     # AI-generated code (for review)
└── .mcp/              # MCP configuration`}
                </pre>
              </div>

              <h3>2. Keep a Clean File Structure</h3>
              <p>
                Organize your codebase with consistent patterns and clear naming conventions to help AI tools understand
                your code's structure and purpose.
              </p>
              <ul>
                <li>Use descriptive file and directory names that reflect their functionality</li>
                <li>Group related files together using feature-based organization</li>
                <li>Maintain consistent naming conventions (e.g., camelCase or kebab-case)</li>
                <li>Keep files focused on single responsibilities (avoid large multi-purpose files)</li>
              </ul>

              <h3>3. Document Component Relationships</h3>
              <p>
                Create relationship maps or dependency documentation to help AI tools understand how different parts of
                your codebase interact.
              </p>
              <div className="bg-muted p-4 rounded-md">
                <p className="font-mono text-sm">
                  <strong>Example:</strong> Include a <code>STRUCTURE.md</code> file at root level
                </p>
                <pre className="bg-card p-2 rounded">
                  {`# Project Structure
                  
## Core Components
- \`AuthService\` - Handles user authentication
  - Used by: UserProfile, LoginPage, RegisterPage
  - Depends on: ApiClient, UserStore
  
- \`ApiClient\` - Manages API requests
  - Used by: All services
  - Depends on: ConfigService
  
## Data Flow
1. User actions trigger component methods
2. Components call services
3. Services use ApiClient for data operations
4. Results flow back through the chain`}
                </pre>
              </div>

              <h2>Tech Stack Selection for AI Integration</h2>
              <p>
                Not all tech stacks are equally suited for AI-assisted development. Choose technologies that are well-documented,
                widely adopted, and supported by AI tools like Cursor and Windsurf.
              </p>

              <h3>1. Framework and Library Considerations</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                  <thead>
                    <tr>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold">Consideration</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold">Why It Matters</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold">Examples</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                    <tr>
                      <td className="px-3 py-4 text-sm">Documentation Quality</td>
                      <td className="px-3 py-4 text-sm">Well-documented libraries enable more accurate AI suggestions</td>
                      <td className="px-3 py-4 text-sm">React, Vue.js, Next.js, Express</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-4 text-sm">Type Safety</td>
                      <td className="px-3 py-4 text-sm">Typed languages help AI understand data structures and APIs</td>
                      <td className="px-3 py-4 text-sm">TypeScript, Kotlin, Rust</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-4 text-sm">Popularity</td>
                      <td className="px-3 py-4 text-sm">Popular frameworks have more examples in AI training data</td>
                      <td className="px-3 py-4 text-sm">Angular, Django, Laravel</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-4 text-sm">Convention over Configuration</td>
                      <td className="px-3 py-4 text-sm">Clear conventions make it easier for AI to predict patterns</td>
                      <td className="px-3 py-4 text-sm">Ruby on Rails, Spring Boot</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3>2. Recommended Tech Stacks</h3>
              <p>
                These stacks have proven to work particularly well with AI-assisted development:
              </p>
              <ul>
                <li>
                  <strong>Frontend:</strong> Next.js (App Router) + TypeScript + Tailwind CSS
                  <ul>
                    <li>Strong type safety helps AI understand component props and data flow</li>
                    <li>App Router's file-based routing is easy for AI to comprehend</li>
                    <li>Tailwind's utility classes have predictable patterns</li>
                  </ul>
                </li>
                <li>
                  <strong>Backend:</strong> Node.js + Express/NestJS + TypeScript
                  <ul>
                    <li>Type definitions help AI understand API contracts</li>
                    <li>Clear module structure in NestJS simplifies context understanding</li>
                    <li>Strong ecosystem with excellent documentation</li>
                  </ul>
                </li>
                <li>
                  <strong>Full-stack:</strong> T3 Stack (Next.js + tRPC + Prisma + TypeScript)
                  <ul>
                    <li>End-to-end type safety creates predictable data flow</li>
                    <li>Prisma schema provides clear data models for AI context</li>
                    <li>tRPC eliminates redundant API layer code</li>
                  </ul>
                </li>
              </ul>

              <Callout type="warning" title="Legacy Tech Stacks">
                Older technologies without strong typing or modern documentation may still work with
                AI tools, but often require more manual context setting. Consider creating additional
                context files to help AI understand these codebases.
              </Callout>

              <h2>MCP Implementation in Your Project</h2>
              <p>
                Implementing the Model Context Protocol (MCP) within your project ensures consistent context sharing
                between different AI tools and team members.
              </p>

              <h3>1. Basic MCP Setup</h3>
              <ol>
                <li>
                  <strong>Create MCP Configuration:</strong> Set up a basic MCP configuration in your project root.
                  <div className="bg-muted p-4 rounded-md my-2">
                    <p className="font-mono text-sm mb-1">
                      <strong>Example:</strong> <code>.mcp/config.json</code>
                    </p>
                    <pre className="bg-card p-2 rounded">
                      {`{
  "version": "1.0",
  "projectId": "my-awesome-project",
  "contextPaths": [
    "./ai/context/global",
    "./ai/context/features"
  ],
  "tools": {
    "cursor": {
      "enabled": true,
      "configPath": "./ai/rules/cursor-rules.json"
    },
    "windsurf": {
      "enabled": true,
      "configPath": "./ai/rules/windsurf-config.json"
    }
  }
}`}
                    </pre>
                  </div>
                </li>
                <li>
                  <strong>Define Core Context Files:</strong> Create essential context files for your project.
                  <div className="bg-muted p-4 rounded-md my-2">
                    <p className="font-mono text-sm mb-1">
                      <strong>Example:</strong> <code>ai/context/global/project.json</code>
                    </p>
                    <pre className="bg-card p-2 rounded">
                      {`{
  "name": "My Awesome Project",
  "description": "A web application for managing customer relationships",
  "technologies": {
    "frontend": ["React", "TypeScript", "Tailwind CSS"],
    "backend": ["Node.js", "Express", "MongoDB"],
    "deployment": ["Docker", "AWS"],
    "testing": ["Jest", "React Testing Library"]
  },
  "architecture": {
    "frontend": "Component-based with React Context for state",
    "backend": "RESTful API with MVC structure",
    "database": "Document-based NoSQL"
  },
  "conventions": {
    "naming": {
      "components": "PascalCase",
      "functions": "camelCase",
      "files": "kebab-case"
    },
    "structure": "Feature-based organization"
  }
}`}
                    </pre>
                  </div>
                </li>
              </ol>

              <h3>2. Advanced MCP Implementation</h3>
              <p>
                For larger projects, consider these advanced MCP implementation strategies:
              </p>
              <ul>
                <li>
                  <strong>Context Synchronization:</strong> Set up automated processes to keep context files updated,
                  such as pre-commit hooks or CI/CD pipelines.
                  <div className="bg-muted p-4 rounded-md my-2">
                    <p className="font-mono text-sm mb-1">
                      <strong>Example:</strong> Git pre-commit hook
                    </p>
                    <pre className="bg-card p-2 rounded">
                      {`#!/bin/sh
# .git/hooks/pre-commit
# Update MCP context files based on current codebase

node scripts/update-mcp-context.js

# Add updated context files to commit
git add .mcp/
git add ai/context/`}
                    </pre>
                  </div>
                </li>
                <li>
                  <strong>MCP Server Integration:</strong> Connect to a shared MCP server for team-wide context sharing.
                  <div className="bg-muted p-4 rounded-md my-2">
                    <p className="font-mono text-sm mb-1">
                      <strong>Example:</strong> Server configuration in <code>.mcp/config.json</code>
                    </p>
                    <pre className="bg-card p-2 rounded">
                      {`{
  "version": "1.0",
  "projectId": "my-awesome-project",
  "server": {
    "url": "https://mcp.example.com/api",
    "auth": {
      "type": "token",
      "tokenEnvVar": "MCP_API_TOKEN"
    },
    "syncInterval": 3600 // seconds
  },
  // ... rest of config
}`}
                    </pre>
                  </div>
                </li>
                <li>
                  <strong>Context Validation:</strong> Implement schemas and validation for your context files to ensure consistency.
                  <div className="bg-muted p-4 rounded-md my-2">
                    <p className="font-mono text-sm mb-1">
                      <strong>Example:</strong> JSON Schema for feature context
                    </p>
                    <pre className="bg-card p-2 rounded">
                      {`// ai/context/schemas/feature-schema.json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["name", "description", "components", "apis"],
  "properties": {
    "name": { "type": "string" },
    "description": { "type": "string" },
    "components": {
      "type": "array",
      "items": { 
        "type": "object",
        "required": ["name", "path", "description"],
        "properties": {
          "name": { "type": "string" },
          "path": { "type": "string" },
          "description": { "type": "string" }
        }
      }
    },
    "apis": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["endpoint", "method", "description"],
        "properties": {
          "endpoint": { "type": "string" },
          "method": { "type": "string", "enum": ["GET", "POST", "PUT", "DELETE"] },
          "description": { "type": "string" }
        }
      }
    }
  }
}`}
                    </pre>
                  </div>
                </li>
              </ul>

              <h2>AI Tool Configuration</h2>
              <p>
                Configure AI tools like Cursor and Windsurf to work optimally with your project structure and MCP implementation.
              </p>

              <h3>1. Cursor Configuration</h3>
              <p>
                Create Cursor rule files to guide the AI in understanding your project and generating appropriate code.
              </p>
              <div className="bg-muted p-4 rounded-md">
                <p className="font-mono text-sm mb-1">
                  <strong>Example:</strong> <code>ai/rules/cursor-rules.json</code>
                </p>
                <pre className="bg-card p-2 rounded">
                  {`{
  "name": "My Project Rules",
  "description": "Custom rules for AI-assisted development in this project",
  "rules": [
    {
      "name": "component-structure",
      "description": "Standard structure for React components",
      "pattern": "# React Component Structure\\n\\nComponents should follow this structure:\\n\\n1. Import statements\\n2. Type definitions\\n3. Component function\\n4. Helper functions\\n5. Export statement"
    },
    {
      "name": "api-client",
      "description": "Using the API client",
      "pattern": "# API Client Usage\\n\\nAlways use the centralized API client for requests:\\n\\n\`\`\`typescript\\nimport { apiClient } from '@/lib/api-client';\\n\\n// Example usage\\nconst data = await apiClient.get('/endpoint');\n\`\`\`"
    },
    {
      "name": "state-management",
      "description": "State management patterns",
      "pattern": "# State Management\\n\\nUse React Context for global state. Use local state for component-specific state. Avoid prop drilling more than 2 levels deep."
    }
  ],
  "filePatterns": [
    {
      "glob": "src/components/**/*.tsx",
      "rules": ["component-structure", "state-management"]
    },
    {
      "glob": "src/services/**/*.ts",
      "rules": ["api-client"]
    }
  ]
}`}
                </pre>
              </div>

              <h3>2. Windsurf Configuration</h3>
              <p>
                Configure Windsurf to work with your project structure and MCP implementation.
              </p>
              <div className="bg-muted p-4 rounded-md">
                <p className="font-mono text-sm mb-1">
                  <strong>Example:</strong> <code>ai/rules/windsurf-config.json</code>
                </p>
                <pre className="bg-card p-2 rounded">
                  {`{
  "projectName": "My Awesome Project",
  "mcpEnabled": true,
  "mcpConfig": "./.mcp/config.json",
  "contextSettings": {
    "includePaths": [
      "src/**/*",
      "api/**/*"
    ],
    "excludePaths": [
      "**/*.test.*",
      "node_modules/**/*",
      "dist/**/*",
      ".git/**/*"
    ]
  },
  "codeGeneration": {
    "conventions": {
      "reactComponent": {
        "style": "functional",
        "propsInterface": true,
        "defaultExport": true
      },
      "apiEndpoint": {
        "useCentralClient": true,
        "includeValidation": true
      }
    }
  }
}`}
                </pre>
              </div>

              <h3>3. IDE Integration</h3>
              <p>
                Configure your IDE to work optimally with AI tools by setting up appropriate extensions and settings.
              </p>
              <ul>
                <li>
                  <strong>VS Code:</strong>
                  <ul>
                    <li>Install the Cursor AI extension</li>
                    <li>Configure <code>.vscode/settings.json</code> for consistent formatting and linting</li>
                    <li>Set up workspace recommendations for team members</li>
                  </ul>
                </li>
                <li>
                  <strong>JetBrains IDEs:</strong>
                  <ul>
                    <li>Install the Windsurf plugin</li>
                    <li>Configure shared code style settings</li>
                    <li>Enable automatic synchronization with MCP</li>
                  </ul>
                </li>
              </ul>

              <h2>Version Control and AI Contributions</h2>
              <p>
                Establish clear practices for managing AI-generated code and MCP context files in your version control system.
              </p>

              <h3>1. Version Control for AI-Generated Code</h3>
              <ul>
                <li>
                  <strong>Separate Branches for AI Exploration:</strong> Use dedicated branches for AI experimentation
                  and exploration, merging validated code back to main branches.
                  <div className="bg-muted p-4 rounded-md my-2">
                    <p className="font-mono text-sm mb-1">
                      <strong>Example:</strong> Branch naming convention
                    </p>
                    <pre className="bg-card p-2 rounded">
                      {`feature/user-auth             # Main feature branch
feature/user-auth-ai         # AI-assisted experiments
feature/user-auth-ai-review  # Reviewed AI code ready for merge`}
                    </pre>
                  </div>
                </li>
                <li>
                  <strong>Clear Commit Messages:</strong> Use descriptive commit messages that indicate AI involvement.
                  <div className="bg-muted p-4 rounded-md my-2">
                    <p className="font-mono text-sm mb-1">
                      <strong>Example:</strong> Commit message format
                    </p>
                    <pre className="bg-card p-2 rounded">
                      {`feat(auth): Add password reset functionality [AI-assisted]
- Generated initial flow with AI
- Manually reviewed and fixed edge cases
- Added unit tests`}
                    </pre>
                  </div>
                </li>
                <li>
                  <strong>Code Review Workflows:</strong> Establish specific workflows for reviewing AI-generated code.
                  <div className="bg-muted p-4 rounded-md my-2">
                    <p className="font-mono text-sm mb-1">
                      <strong>Example:</strong> Pull request template
                    </p>
                    <pre className="bg-card p-2 rounded">
                      {`## AI-Assisted Changes

### Description
Brief description of the changes made with AI assistance.

### AI Generation Process
- [ ] Initial code generated with AI
- [ ] Iteratively refined with AI
- [ ] AI used only for specific components

### Manual Review Checklist
- [ ] Code functionality manually verified
- [ ] Edge cases tested
- [ ] Performance considerations reviewed
- [ ] Security implications addressed
- [ ] Coding standards maintained`}
                    </pre>
                  </div>
                </li>
              </ul>

              <h3>2. Managing Context Files in Version Control</h3>
              <p>
                Determine how to handle MCP context files in your version control system.
              </p>
              <ul>
                <li>
                  <strong>Include Essential Context:</strong> Version control core context files that define project structure and conventions.
                </li>
                <li>
                  <strong>Exclude Generated or Temporary Context:</strong> Consider adding automatically generated or temporary context files to <code>.gitignore</code>.
                  <div className="bg-muted p-4 rounded-md my-2">
                    <p className="font-mono text-sm mb-1">
                      <strong>Example:</strong> <code>.gitignore</code> entries
                    </p>
                    <pre className="bg-card p-2 rounded">
                      {`# Standard ignores
node_modules/
dist/
.env

# MCP and AI-specific ignores
.mcp/cache/
ai/generated/
ai/context/temp/
ai/context/**/*.auto.json`}
                    </pre>
                  </div>
                </li>
                <li>
                  <strong>Document Context Management:</strong> Include clear guidelines for context file management in your project documentation.
                </li>
              </ul>

              <h2>Implementation Checklist</h2>
              <p>
                Use this checklist to ensure you've covered all essential aspects of project customization for AI integration:
              </p>
              <div className="not-prose">
                <div className="bg-card rounded-md border p-4">
                  <h4 className="font-medium mb-2">Project Customization Checklist</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <input type="checkbox" className="mt-1 mr-2" />
                      <span>Created AI-specific directories for context, prompts, and rules</span>
                    </li>
                    <li className="flex items-start">
                      <input type="checkbox" className="mt-1 mr-2" />
                      <span>Organized codebase with consistent patterns and naming conventions</span>
                    </li>
                    <li className="flex items-start">
                      <input type="checkbox" className="mt-1 mr-2" />
                      <span>Selected tech stack with good AI tool compatibility</span>
                    </li>
                    <li className="flex items-start">
                      <input type="checkbox" className="mt-1 mr-2" />
                      <span>Implemented basic MCP configuration</span>
                    </li>
                    <li className="flex items-start">
                      <input type="checkbox" className="mt-1 mr-2" />
                      <span>Created core context files for project structure and conventions</span>
                    </li>
                    <li className="flex items-start">
                      <input type="checkbox" className="mt-1 mr-2" />
                      <span>Configured AI tools (Cursor, Windsurf) for the project</span>
                    </li>
                    <li className="flex items-start">
                      <input type="checkbox" className="mt-1 mr-2" />
                      <span>Set up IDE integration with appropriate extensions and settings</span>
                    </li>
                    <li className="flex items-start">
                      <input type="checkbox" className="mt-1 mr-2" />
                      <span>Established version control practices for AI-generated code</span>
                    </li>
                    <li className="flex items-start">
                      <input type="checkbox" className="mt-1 mr-2" />
                      <span>Created guidelines for managing context files in version control</span>
                    </li>
                    <li className="flex items-start">
                      <input type="checkbox" className="mt-1 mr-2" />
                      <span>Documented project customization for team members</span>
                    </li>
                  </ul>
                </div>
              </div>

              <h2>Related Resources</h2>
              <ul>
                <li>
                  <Link href="/mcp/implementation" className="text-primary hover:underline">
                    MCP Implementation Guide
                  </Link>
                </li>
                <li>
                  <Link href="/tools/cursor/project-rules" className="text-primary hover:underline">
                    Cursor Project Rules
                  </Link>
                </li>
                <li>
                  <Link href="/best-practices/context-management" className="text-primary hover:underline">
                    Context Management Best Practices
                  </Link>
                </li>
                <li>
                  <Link href="/best-practices/collaboration" className="text-primary hover:underline">
                    Collaboration Workflows for AI-Assisted Development
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </Container>
    </>
  )
}