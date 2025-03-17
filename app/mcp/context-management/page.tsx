import { Metadata } from "next"
import { ContentTemplate, CodeBlock, Callout } from "@/components/content"
import { generateMetadata } from "@/lib/content-utils"

export const metadata: Metadata = generateMetadata({
  title: "MCP Context Management",
  description: "Learn effective techniques for managing AI model context using the Model Context Protocol (MCP) to improve AI outputs and efficiency.",
  keywords: ["MCP", "context management", "model context", "AI context", "context optimization", "context sharing"],
  section: "mcp/context-management"
})

export default function MCPContextManagement() {
  return (
    <ContentTemplate
      title="MCP Context Management: Optimizing AI Context with the Model Context Protocol"
      description="Learn effective techniques for managing AI model context using the Model Context Protocol (MCP) to improve AI outputs and efficiency."
      metadata={{
        difficulty: "intermediate",
        timeToComplete: "15 minutes",
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
          id: "understanding-context",
          title: "Understanding Context in AI",
          level: 2
        },
        {
          id: "context-structure",
          title: "Structuring Context Effectively",
          level: 2,
          children: [
            {
              id: "project-context",
              title: "Project Context",
              level: 3
            },
            {
              id: "code-context",
              title: "Code Context",
              level: 3
            },
            {
              id: "task-context",
              title: "Task Context",
              level: 3
            }
          ]
        },
        {
          id: "context-lifecycle",
          title: "Context Lifecycle Management",
          level: 2
        },
        {
          id: "context-optimization",
          title: "Context Optimization Techniques",
          level: 2
        },
        {
          id: "collaborative-context",
          title: "Collaborative Context Management",
          level: 2
        },
        {
          id: "integration-patterns",
          title: "Context Integration Patterns",
          level: 2
        },
        {
          id: "practical-examples",
          title: "Practical Examples",
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
          description: "Explore the advantages of using MCP in your development workflow."
        },
        {
          title: "MCP Implementation",
          href: "/mcp/implementation",
          description: "Practical guide to implementing MCP in your projects."
        }
      ]}
    >
      <h2 id="understanding-context">Understanding Context in AI</h2>
      <p>
        Context is the information that AI models use to generate relevant and accurate responses. It shapes the AI's understanding of your project, your requirements, and the specific tasks you want it to perform. Without proper context, even the most powerful AI models can produce irrelevant or incorrect results.
      </p>
      <p>
        Model Context Protocol (MCP) provides a standardized framework for managing this context. However, to leverage MCP effectively, you need to understand what makes good context and how to manage it throughout your development process.
      </p>

      <h3>The Three Dimensions of Context</h3>
      <ul>
        <li><strong>Breadth:</strong> How much of your project the context covers (e.g., multiple files vs. a single function)</li>
        <li><strong>Depth:</strong> How detailed the context is (e.g., implementation details vs. high-level descriptions)</li>
        <li><strong>Recency:</strong> How up-to-date the context is with your current project state</li>
      </ul>

      <Callout type="info" title="Context Quality Matters">
        Better context leads to better AI outputs. High-quality context is relevant, concise, well-structured, and up-to-date. It provides the AI with exactly what it needs to understand your project and requirements, without overwhelming it with irrelevant information.
      </Callout>

      <h2 id="context-structure">Structuring Context Effectively</h2>
      <p>
        MCP allows you to structure your context in a standardized way. A well-structured context helps the AI understand your project more clearly and generate more relevant outputs. Here's how to structure your context effectively:
      </p>

      <h3 id="project-context">Project Context</h3>
      <p>
        Project context provides an overview of your project, including its architecture, technologies, conventions, and goals. This gives the AI a high-level understanding of your project landscape.
      </p>

      <CodeBlock 
        language="json"
        filename="project-context.json"
        code={`{
  "project": {
    "name": "E-Commerce Platform",
    "description": "A modern e-commerce platform with product management, shopping cart, and checkout features.",
    "architecture": {
      "frontend": {
        "framework": "React",
        "stateManagement": "Redux",
        "styling": "Tailwind CSS"
      },
      "backend": {
        "language": "TypeScript",
        "framework": "Express.js",
        "database": "MongoDB"
      }
    },
    "conventions": {
      "naming": {
        "components": "PascalCase",
        "functions": "camelCase",
        "constants": "UPPER_SNAKE_CASE"
      },
      "structure": {
        "components": "Feature-based organization",
        "apis": "REST conventions"
      }
    },
    "goals": [
      "Ensure responsive UI across devices",
      "Optimize performance",
      "Ensure accessibility compliance"
    ]
  }
}`}
      />

      <h3 id="code-context">Code Context</h3>
      <p>
        Code context includes relevant code snippets, file structures, dependencies, and interfaces. This helps the AI understand the specific code it's working with.
      </p>

      <CodeBlock 
        language="json"
        filename="code-context.json"
        code={`{
  "files": [
    {
      "path": "src/components/ProductList.tsx",
      "content": "// Full content of the file...",
      "purpose": "Displays a grid of product cards with filtering and sorting options."
    },
    {
      "path": "src/hooks/useProducts.ts",
      "content": "// Full content of the file...",
      "purpose": "Custom hook for fetching and managing product data."
    },
    {
      "path": "src/types/Product.ts",
      "content": "export interface Product { id: string; name: string; price: number; /* ... */ }",
      "purpose": "TypeScript interface defining the product data structure."
    }
  ],
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-query": "^3.39.0",
    "tailwindcss": "^3.3.0"
  },
  "directory_structure": {
    "src": {
      "components": ["ProductList.tsx", "ProductCard.tsx", "FilterPanel.tsx"],
      "hooks": ["useProducts.ts", "useFilters.ts"],
      "pages": ["Home.tsx", "ProductDetail.tsx", "Cart.tsx"],
      "utils": ["api.ts", "formatters.ts"]
    }
  }
}`}
      />

      <h3 id="task-context">Task Context</h3>
      <p>
        Task context describes the specific task you want the AI to perform, including requirements, constraints, and any relevant history. This helps the AI understand what you're trying to achieve.
      </p>

      <CodeBlock 
        language="json"
        filename="task-context.json"
        code={`{
  "task": {
    "description": "Implement a product search feature with filtering and sorting",
    "requirements": [
      "Allow users to search products by name or description",
      "Support filtering by category, price range, and availability",
      "Include sorting options: price (low to high), price (high to low), newest first"
    ],
    "constraints": [
      "Must be accessible and keyboard navigable",
      "Should work on mobile devices",
      "Should not require a page reload"
    ],
    "previous_attempts": [
      {
        "approach": "Used React Context for state management",
        "outcome": "Performance issues with large product lists",
        "lessons": "Need more efficient state management for complex filtering"
      }
    ]
  }
}`}
      />

      <Callout type="tip" title="Context Composition">
        Mix and match different types of context based on your current needs. For a new feature, combine project context (for high-level understanding), code context (for related components), and task context (for the specific feature requirements).
      </Callout>

      <h2 id="context-lifecycle">Context Lifecycle Management</h2>
      <p>
        Context isn't static—it evolves as your project progresses. Managing the context lifecycle is crucial for keeping your AI interactions relevant and efficient.
      </p>

      <h3>Context Lifecycle Stages</h3>
      <ol>
        <li>
          <strong>Initialization:</strong> Creating the initial context based on project setup and requirements.
          <ul>
            <li>Start with essential information about your project structure and architecture</li>
            <li>Include key conventions and patterns used in your codebase</li>
          </ul>
        </li>
        <li>
          <strong>Enrichment:</strong> Expanding the context as you work on specific features or components.
          <ul>
            <li>Add relevant code snippets and files for the current task</li>
            <li>Include specific requirements and constraints</li>
          </ul>
        </li>
        <li>
          <strong>Update:</strong> Keeping the context current as your code changes.
          <ul>
            <li>Update code snippets when files change</li>
            <li>Refresh project info when architecture or conventions evolve</li>
          </ul>
        </li>
        <li>
          <strong>Pruning:</strong> Removing outdated or irrelevant context to maintain efficiency.
          <ul>
            <li>Remove information about completed tasks</li>
            <li>Archive outdated code snippets</li>
          </ul>
        </li>
        <li>
          <strong>Archiving:</strong> Preserving context for future reference or reuse.
          <ul>
            <li>Store successful context configurations for similar future tasks</li>
            <li>Maintain historical context for documentation purposes</li>
          </ul>
        </li>
      </ol>

      <h3>Context Version Control</h3>
      <p>
        Just like code, context benefits from version control. MCP supports versioning your context:
      </p>
      <ul>
        <li>Track changes to your context over time</li>
        <li>Roll back to previous context states if needed</li>
        <li>Branch context for different features or experiments</li>
        <li>Merge context from different team members or tasks</li>
      </ul>

      <CodeBlock 
        language="typescript"
        filename="context-version-example.ts"
        code={`import { MCPClient } from '@mcp/client';

async function updateAndVersionContext() {
  const client = new MCPClient({ /* config */ });
  
  // Get the current context
  const currentContext = await client.getContext('project-123');
  
  // Create a new version with updates
  const newVersion = {
    ...currentContext,
    files: [
      ...currentContext.files,
      {
        path: 'src/components/SearchBar.tsx',
        content: '// New search bar component code...',
        purpose: 'Component for searching products'
      }
    ],
    // Update the task section
    task: {
      description: 'Implement product search with autocomplete',
      // ...more task details
    }
  };
  
  // Save as a new version
  await client.updateContext('project-123', newVersion, {
    createVersion: true,
    versionName: 'search-feature-v1'
  });
}`}
      />

      <h2 id="context-optimization">Context Optimization Techniques</h2>
      <p>
        Optimizing your context improves AI performance and reduces costs. Here are key techniques for context optimization:
      </p>

      <h3>Context Size Management</h3>
      <ul>
        <li><strong>Relevance Filtering:</strong> Include only information relevant to the current task.</li>
        <li><strong>Summarization:</strong> Summarize large files or complex concepts rather than including everything.</li>
        <li><strong>Content Extraction:</strong> Extract only the most important parts of large files (e.g., interfaces, function signatures).</li>
        <li><strong>Layered Context:</strong> Maintain different levels of context (detailed for current task, summarized for related areas).</li>
      </ul>

      <h3>Context Freshness</h3>
      <ul>
        <li><strong>Active Synchronization:</strong> Automatically sync context with your codebase as files change.</li>
        <li><strong>Selective Updates:</strong> Prioritize updating the most critical or frequently changing parts of your context.</li>
        <li><strong>Change Detection:</strong> Track which files have changed since the last context update.</li>
      </ul>

      <h3>Context Prioritization</h3>
      <ul>
        <li><strong>Recency Weighting:</strong> Give more weight to recently modified or accessed files.</li>
        <li><strong>Relevance Scoring:</strong> Score context elements based on their relevance to the current task.</li>
        <li><strong>Task-Based Filtering:</strong> Filter context based on the specific task requirements.</li>
      </ul>

      <CodeBlock 
        language="typescript"
        filename="context-optimization.ts"
        code={`import { MCPClient } from '@mcp/client';

async function optimizeContext(taskDescription: string) {
  const client = new MCPClient({ /* config */ });
  
  // Get the current full context
  const fullContext = await client.getContext('project-123');
  
  // Analyze the task to identify relevant context
  const relevantPaths = await client.analyzeTaskRelevance(
    taskDescription,
    fullContext.files.map(f => f.path)
  );
  
  // Create an optimized context with only relevant files
  const optimizedContext = {
    ...fullContext,
    files: fullContext.files.filter(file => 
      relevantPaths.includes(file.path)
    ),
    // Update task information
    task: {
      description: taskDescription,
      // ...other task details
    }
  };
  
  // Use the optimized context
  return client.createContextSession('project-123', optimizedContext);
}`}
      />

      <Callout type="warning" title="Context Optimization Trade-offs">
        Optimization involves trade-offs. Too little context can lead to AI missing important information, while too much context can overwhelm the model or exceed token limits. Regularly review and adjust your optimization strategy based on the quality of AI outputs.
      </Callout>

      <h2 id="collaborative-context">Collaborative Context Management</h2>
      <p>
        One of MCP's key benefits is enabling collaborative context management across teams. Here's how to leverage MCP for team collaboration:
      </p>

      <h3>Shared Context Repositories</h3>
      <ul>
        <li>Create team-level context repositories that everyone can access</li>
        <li>Establish conventions for context organization and naming</li>
        <li>Set up access controls and permissions for context management</li>
      </ul>

      <h3>Context Contribution Workflows</h3>
      <ul>
        <li>Define clear processes for updating shared context</li>
        <li>Implement review processes for context changes (similar to code reviews)</li>
        <li>Track contributions and changes to the context</li>
      </ul>

      <h3>Context Synchronization</h3>
      <ul>
        <li>Establish mechanisms for synchronizing context across team members</li>
        <li>Resolve conflicts when multiple team members update the same context</li>
        <li>Create update notifications for significant context changes</li>
      </ul>

      <CodeBlock 
        language="typescript"
        filename="collaborative-context.ts"
        code={`import { MCPClient } from '@mcp/client';

async function teamContextWorkflow() {
  const client = new MCPClient({ /* config */ });
  
  // Create a feature branch of the context
  const mainContext = await client.getContext('team-project');
  const featureBranch = await client.createContextBranch('team-project', {
    branchName: 'feature/user-authentication',
    baseVersion: 'main'
  });
  
  // Make changes to the feature branch
  await client.updateContext(featureBranch.id, {
    // Add new files and task info relevant to authentication
    files: [
      ...mainContext.files,
      {
        path: 'src/components/LoginForm.tsx',
        content: '// Login form component...',
        purpose: 'User authentication form'
      }
    ],
    task: {
      description: 'Implement user authentication flow',
      // ...more task details
    }
  });
  
  // When feature is complete, create a merge request
  await client.createContextMergeRequest({
    sourceBranch: 'feature/user-authentication',
    targetBranch: 'main',
    title: 'Add authentication context',
    description: 'Includes context for login, registration, and auth flow'
  });
  
  // Team lead reviews and approves the merge
  await client.mergeContextBranch('feature/user-authentication', 'main');
}`}
      />

      <h2 id="integration-patterns">Context Integration Patterns</h2>
      <p>
        MCP can be integrated into your development workflow in various ways. Here are common integration patterns:
      </p>

      <h3>IDE Integration</h3>
      <ul>
        <li>Automatic context updates as you code</li>
        <li>Context-aware AI assistance within your IDE</li>
        <li>Quick context switching based on the current file or task</li>
      </ul>

      <h3>CI/CD Pipeline Integration</h3>
      <ul>
        <li>Automatic context updates when code is committed or merged</li>
        <li>Context validation as part of the CI process</li>
        <li>Context deployment alongside code deployments</li>
      </ul>

      <h3>Project Management Integration</h3>
      <ul>
        <li>Link context to specific tasks or user stories</li>
        <li>Generate task-specific context from requirements</li>
        <li>Track context usage and effectiveness across projects</li>
      </ul>

      <CodeBlock 
        language="yaml"
        filename="mcp-cicd.yaml"
        code={`# Example GitHub Action for context updates
name: Update MCP Context

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  update-context:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0  # Get full history for change detection
          
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm install
          
      - name: Install MCP tools
        run: npm install -g @mcp/cli
          
      - name: Detect changed files
        id: changes
        run: |
          CHANGED_FILES=$(git diff --name-only \${{ github.event.before }} \${{ github.sha }})
          echo "::set-output name=files::$CHANGED_FILES"
          
      - name: Update MCP Context
        env:
          MCP_API_KEY: \${{ secrets.MCP_API_KEY }}
        run: |
          mcp-cli context update \\
            --project-id=\${{ secrets.MCP_PROJECT_ID }} \\
            --files="\${{ steps.changes.outputs.files }}" \\
            --commit-message="\${{ github.event.head_commit.message }}" \\
            --branch="\${{ github.ref_name }}"`}
      />

      <h2 id="practical-examples">Practical Examples</h2>
      <p>
        Let's look at some practical examples of context management for common development scenarios:
      </p>

      <h3>Example 1: Bug Fix Context</h3>
      <CodeBlock 
        language="json"
        filename="bug-fix-context.json"
        code={`{
  "task": {
    "description": "Fix checkout button not working on mobile devices",
    "issue_id": "ECOM-423",
    "type": "bug",
    "priority": "high"
  },
  "bug_info": {
    "reproduction_steps": [
      "Go to product page on mobile device",
      "Add item to cart",
      "Go to checkout",
      "Click 'Complete Purchase' button",
      "Button appears to click but no action happens"
    ],
    "affected_versions": ["2.3.0", "2.3.1"],
    "browsers": ["Safari on iOS", "Chrome on Android"],
    "screenshots": ["bug-checkout-ios.png", "bug-checkout-android.png"]
  },
  "files": [
    {
      "path": "src/components/checkout/CheckoutButton.tsx",
      "content": "// Full component code...",
      "highlights": [
        {
          "lines": "45-68",
          "note": "Button click handler implementation"
        }
      ]
    },
    {
      "path": "src/hooks/useCheckout.ts",
      "content": "// Hook implementation...",
      "highlights": [
        {
          "lines": "23-37",
          "note": "API call for checkout process"
        }
      ]
    }
  ],
  "diagnostic_info": {
    "error_logs": [
      "TypeError: Cannot read property 'submit' of undefined at CheckoutButton.handleClick",
      "Console reports event.preventDefault is not a function on touch events"
    ],
    "browser_compatibility": {
      "note": "Touch events are handled differently across browsers"
    }
  }
}`}
      />

      <h3>Example 2: Feature Development Context</h3>
      <CodeBlock 
        language="json"
        filename="feature-context.json"
        code={`{
  "task": {
    "description": "Implement user favorites feature",
    "type": "feature",
    "user_story": "As a user, I want to save products to my favorites list so I can easily find them later"
  },
  "requirements": {
    "functional": [
      "Users can add/remove products to favorites",
      "Favorites persist between sessions",
      "Favorites are accessible from user profile",
      "Users can filter and sort their favorites"
    ],
    "non_functional": [
      "Adding to favorites should be near-instant (<100ms)",
      "Should work offline with synchronization when online",
      "Must be accessible via keyboard and screen readers"
    ]
  },
  "design": {
    "mockups": ["favorites-list.fig", "add-to-favorites.fig"],
    "ux_flow": "User clicks heart icon → Animation shows item added → Toast notification confirms"
  },
  "related_components": [
    {
      "path": "src/components/product/ProductCard.tsx",
      "content": "// Component code...",
      "purpose": "Need to add favorites button to product cards"
    },
    {
      "path": "src/context/UserContext.tsx",
      "content": "// Context code...",
      "purpose": "Need to extend user state to include favorites"
    }
  ],
  "api_design": {
    "endpoints": [
      {
        "method": "POST",
        "path": "/api/users/{userId}/favorites",
        "body": { "productId": "string" },
        "response": { "success": "boolean", "favoriteId": "string" }
      },
      {
        "method": "GET",
        "path": "/api/users/{userId}/favorites",
        "response": { "favorites": "array of favorite products" }
      },
      {
        "method": "DELETE",
        "path": "/api/users/{userId}/favorites/{favoriteId}",
        "response": { "success": "boolean" }
      }
    ]
  }
}`}
      />

      <h3>Example 3: Code Review Context</h3>
      <CodeBlock 
        language="json"
        filename="code-review-context.json"
        code={`{
  "task": {
    "description": "Review pull request for shopping cart implementation",
    "pull_request": "PR-127",
    "author": "jane.dev"
  },
  "review_scope": {
    "files_changed": [
      "src/components/cart/CartItem.tsx",
      "src/components/cart/CartSummary.tsx",
      "src/hooks/useCart.ts",
      "src/context/CartContext.tsx",
      "src/utils/cartCalculations.ts"
    ],
    "lines_added": 427,
    "lines_removed": 56
  },
  "review_goals": [
    "Verify implementation matches requirements",
    "Check for performance issues",
    "Ensure code follows project conventions",
    "Look for security vulnerabilities in cart processing"
  ],
  "project_standards": {
    "test_coverage": "minimum 80% coverage required",
    "accessibility": "WCAG 2.1 AA compliance required",
    "performance": "Cart updates must complete under 200ms"
  },
  "related_issues": [
    {
      "id": "ECOM-256",
      "title": "Implement shopping cart with quantity adjustments",
      "acceptance_criteria": [
        "Users can add/remove items",
        "Users can adjust quantities",
        "Cart totals update immediately",
        "Cart persists between sessions"
      ]
    }
  ],
  "diff_context": {
    "src/hooks/useCart.ts": {
      "content": "// Complete file with diff highlights...",
      "highlights": [
        {
          "lines": "45-67",
          "change_type": "added",
          "note": "Implementation of quantity adjustment"
        }
      ]
    }
    // Additional files with diff context...
  }
}`}
      />

      <Callout type="tip" title="Context Templates">
        Create context templates for common development tasks like bug fixes, feature development, and code reviews. These templates can standardize your context structure and ensure you include all relevant information for each type of task.
      </Callout>

      <p>
        Effective context management is a skill that develops over time. Start with these principles and techniques, then adapt and refine your approach based on your team's needs and the specific requirements of your projects. With MCP, you can create a structured, consistent approach to context that enhances AI assistance throughout your development workflow.
      </p>
    </ContentTemplate>
  )
}