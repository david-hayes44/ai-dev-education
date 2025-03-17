import { Metadata } from "next"
import { Container } from "@/components/ui/container"
import { PageHeader } from "@/components/page-header"
import { Callout } from "@/components/content"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Context Management Best Practices",
  description: "Learn effective strategies for managing context in AI-assisted development using MCP.",
}

export default function Page() {
  return (
    <>
      <PageHeader
        title="Context Management Best Practices"
        description="Learn effective strategies for managing context in AI-assisted development using MCP."
      />
      <Container className="py-8 md:py-12">
        <div className="prose prose-lg dark:prose-invert mx-auto">
          <h2>Understanding Model Context</h2>
          <p>
            Model context is the information AI tools use to generate relevant and accurate responses. It forms the 
            foundation of AI-assisted development, directly impacting the quality of AI outputs. In MCP (Model Context Protocol), 
            context is standardized to ensure consistency across different tools and environments.
          </p>
          
          <p>
            Effective context management involves keeping information updated, organized, and relevant, while adhering to 
            MCP standards for tool compatibility. Without proper context management, you risk receiving outdated or irrelevant 
            AI outputs, compromising collaboration and project alignment.
          </p>

          <Callout type="info" title="Why Context Matters">
            AI models operate based on the context they receive. The better and more relevant the context,
            the more accurate and helpful the AI's responses will be. Context management is not just about
            providing information—it's about providing the <em>right</em> information at the right time.
          </Callout>

          <h2>Context Management Strategies</h2>
          
          <h3>1. Centralized Context Repository</h3>
          <p>
            Create a central repository for context files that all team members can access and update. 
            This ensures everyone works with the same information base.
          </p>
          <div className="bg-muted p-4 rounded-md">
            <p className="font-mono text-sm">
              <strong>Example:</strong> Store context files in a dedicated <code>context/</code> directory in your project,
              with subdirectories for different components or features.
            </p>
            <pre className="bg-card p-2 rounded">
              {`project/
├── context/
│   ├── auth-service/
│   │   ├── context.json    # Authentication service context
│   │   └── examples.json   # Example usage patterns
│   ├── ui-components/
│   │   └── context.json    # UI components context
│   └── global.json         # Project-wide context`}
            </pre>
          </div>

          <h3>2. Structured Context Format</h3>
          <p>
            Use a consistent format for context data, preferably JSON or YAML, to ensure it's machine-readable
            and easily parsed by MCP-compatible tools.
          </p>
          <div className="bg-muted p-4 rounded-md">
            <p className="font-mono text-sm">
              <strong>Example:</strong> A structured context file for a component
            </p>
            <pre className="bg-card p-2 rounded">
              {`{
  "componentName": "UserProfile",
  "description": "Displays and edits user profile information",
  "dependencies": ["AuthService", "ImageUploader"],
  "props": {
    "userId": { "type": "string", "required": true },
    "editable": { "type": "boolean", "default": false }
  },
  "api": {
    "fetchProfile": "GET /api/users/:id",
    "updateProfile": "PUT /api/users/:id"
  },
  "codeReferences": {
    "implementation": "/src/components/UserProfile.tsx",
    "tests": "/src/components/UserProfile.test.tsx"
  }
}`}
            </pre>
          </div>

          <h3>3. Context Versioning</h3>
          <p>
            Implement versioning for context files to track changes over time and allow reverting to previous
            versions if needed.
          </p>
          <div className="bg-muted p-4 rounded-md">
            <p className="font-mono text-sm">
              <strong>Example:</strong> Include version information in your context files
            </p>
            <pre className="bg-card p-2 rounded">
              {`{
  "version": "1.2.3",
  "lastUpdated": "2023-08-15T14:30:00Z",
  "updatedBy": "jane.doe@example.com",
  "changelog": [
    { "version": "1.2.3", "changes": "Added support for profile images" },
    { "version": "1.2.2", "changes": "Fixed email validation" },
    { "version": "1.2.1", "changes": "Initial context creation" }
  ],
  // ... rest of context data
}`}
            </pre>
          </div>

          <h3>4. Context Scope Management</h3>
          <p>
            Define different scopes of context (global, project, feature, component) and apply them
            appropriately based on the development task.
          </p>
          <div className="bg-muted p-4 rounded-md">
            <p className="font-mono text-sm">
              <strong>Example:</strong> Context hierarchy
            </p>
            <ul className="list-disc pl-5 mb-0">
              <li><strong>Global context:</strong> Tech stack, coding standards, architectural patterns</li>
              <li><strong>Project context:</strong> Project-specific requirements, database schema, API structure</li>
              <li><strong>Feature context:</strong> User authentication flow, payment processing, etc.</li>
              <li><strong>Component context:</strong> Specific UI components, utilities, or services</li>
            </ul>
          </div>

          <h2>MCP Integration for Context Management</h2>
          <p>
            The Model Context Protocol (MCP) standardizes how context is shared between AI tools, enabling
            a more consistent and efficient development experience.
          </p>

          <h3>Key MCP Context Management Practices:</h3>
          <ol>
            <li>
              <strong>Context Standardization:</strong> Format context according to MCP specifications to ensure
              compatibility across tools like Cursor and Windsurf.
            </li>
            <li>
              <strong>Context Sharing:</strong> Implement MCP endpoints for sharing context between tools and team members,
              ensuring everyone has access to the same information.
            </li>
            <li>
              <strong>Context Updates:</strong> Establish protocols for updating context through MCP, including validation
              and notification mechanisms.
            </li>
            <li>
              <strong>Context Retrieval:</strong> Implement efficient methods for retrieving relevant context based on
              the current development task.
            </li>
          </ol>

          <h2>Practical Example: Feature Development with MCP Context</h2>
          <p>
            When developing a new feature, create a context file including the problem statement, relevant code, and guidelines.
            Update it as the feature evolves to ensure AI tools provide accurate suggestions.
          </p>

          <div className="bg-muted p-4 rounded-md">
            <p className="font-mono text-sm mb-2">
              <strong>Scenario:</strong> Adding a user authentication feature
            </p>
            <p className="mb-2"><strong>Step 1:</strong> Create initial context file</p>
            <pre className="bg-card p-2 rounded mb-4">
              {`// context/auth-feature/context.json
{
  "feature": "User Authentication",
  "description": "Implement secure user login and registration",
  "requirements": [
    "Email and password authentication",
    "Social login (Google, GitHub)",
    "Password reset functionality",
    "Account verification via email"
  ],
  "codebase": {
    "service": "/src/services/auth-service.ts",
    "components": [
      "/src/components/LoginForm.tsx",
      "/src/components/RegisterForm.tsx"
    ],
    "api": "/src/pages/api/auth/[...nextauth].ts"
  },
  "dependencies": {
    "next-auth": "^4.22.1",
    "bcrypt": "^5.1.0"
  }
}`}
            </pre>
            <p className="mb-2"><strong>Step 2:</strong> Update context as implementation progresses</p>
            <pre className="bg-card p-2 rounded mb-4">
              {`// Updated with implementation details
{
  // ... previous context ...
  "implementation": {
    "authFlow": "Using NextAuth.js for authentication flow",
    "dataModel": "User model includes email, password (hashed), name, profile",
    "securityMeasures": [
      "CSRF protection via Next.js API routes",
      "Rate limiting on login attempts",
      "Password strength requirements"
    ]
  },
  "testing": {
    "unit": "/src/services/__tests__/auth-service.test.ts",
    "integration": "/src/pages/api/__tests__/auth.test.ts",
    "e2e": "/cypress/e2e/auth.spec.ts"
  }
}`}
            </pre>
            <p className="mb-2"><strong>Step 3:</strong> Share context via MCP</p>
            <pre className="bg-card p-2 rounded">
              {`// Example code to share context via MCP
import { MCPClient } from '@mcp/client';

const mcpClient = new MCPClient({
  projectId: 'my-project',
  endpoint: 'https://mcp.example.com'
});

// Update context for the auth feature
await mcpClient.updateContext({
  scope: 'feature',
  id: 'user-authentication',
  content: contextJson,
  version: '1.0.1'
});`}
            </pre>
          </div>

          <h2>Common Context Management Pitfalls</h2>
          <ul>
            <li><strong>Context Overload:</strong> Providing too much information, which can confuse AI models</li>
            <li><strong>Outdated Context:</strong> Failing to update context as the project evolves</li>
            <li><strong>Inconsistent Formatting:</strong> Using different formats across context files</li>
            <li><strong>Missing Critical Information:</strong> Omitting key details needed for accurate AI assistance</li>
            <li><strong>Poor Organization:</strong> Failing to structure context in a logical, accessible way</li>
          </ul>

          <h2>Related Resources</h2>
          <ul>
            <li>
              <Link href="/mcp/context-management" className="text-primary hover:underline">
                MCP Context Management Guide
              </Link>
            </li>
            <li>
              <Link href="/best-practices/practical-llm-usage" className="text-primary hover:underline">
                Practical LLM Usage
              </Link>
            </li>
            <li>
              <Link href="/tools/cursor/project-rules" className="text-primary hover:underline">
                Cursor Project Rules for Context
              </Link>
            </li>
          </ul>
        </div>
      </Container>
    </>
  )
}