"use client"

import Link from "next/link"
import Image from "next/image"
import { MainLayout } from "@/components/layout/main-layout"
import { FloatingChat } from "@/components/chat/floating-chat"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, FileCode, FolderTree, Shield, Book, Brain, Code, Sparkles } from "lucide-react"

export default function CursorProjectRulesPage() {
  return (
    <>
      <MainLayout>
        <div className="container py-12 max-w-6xl">
          <div className="mb-8">
            <nav className="mb-4 flex items-center text-sm text-muted-foreground">
              <Link href="/" className="hover:text-foreground">Home</Link>
              <span className="mx-2 text-muted-foreground">/</span>
              <Link href="/tools" className="hover:text-foreground">Tools</Link>
              <span className="mx-2 text-muted-foreground">/</span>
              <Link href="/tools/cursor" className="hover:text-foreground">Cursor</Link>
              <span className="mx-2 text-muted-foreground">/</span>
              <span className="text-foreground">Project Rules</span>
            </nav>

            <h1 className="text-4xl font-bold mb-4">Cursor Project Rules & Configuration</h1>
            <p className="text-xl text-muted-foreground">
              Learn how to create and manage project rules to supercharge AI-assisted development with Cursor.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <div className="lg:col-span-2">
              <div className="prose dark:prose-invert max-w-none">
                <h2>Understanding Cursor Project Rules</h2>
                <p>
                  Cursor Project Rules are a powerful way to provide context and guidelines to the AI assistant,
                  helping it better understand your project's structure, coding patterns, and requirements. By
                  defining these rules, you can significantly improve the quality and relevance of AI-generated code.
                </p>

                <h3>Why Use Project Rules?</h3>
                <ul>
                  <li>Provide consistent context to the AI about your project's architecture and patterns</li>
                  <li>Ensure generated code follows your team's standards and practices</li>
                  <li>Reduce the need to repeatedly explain the same project details</li>
                  <li>Enable more precise and relevant AI assistance</li>
                  <li>Create a standardized approach to AI-assisted development across your team</li>
                </ul>

                <h3>Project Rules Structure</h3>
                <p>
                  In Cursor, project rules are stored in the <code>.cursor/rules/</code> directory at the root of your
                  project. Each rule is defined in an <code>.mdc</code> (Markdown with Code) file, which is a special format
                  that combines markdown documentation with code examples.
                </p>

                <div className="not-prose my-6 bg-slate-50 dark:bg-slate-900 rounded-lg p-6">
                  <h4 className="text-xl font-semibold mb-4 flex items-center">
                    <FolderTree className="h-5 w-5 mr-2 text-primary" />
                    Typical Project Rules Structure
                  </h4>
                  <pre className="bg-muted p-4 rounded text-sm overflow-auto">
                    <code>{`project-root/
└── .cursor/
    └── rules/
        ├── best-practices.mdc
        ├── project-structure.mdc
        ├── coding-standards.mdc
        ├── component-guidelines.mdc
        └── api-patterns.mdc`}</code>
                  </pre>
                </div>
              </div>

              <div className="mt-10 mb-10">
                <Tabs defaultValue="create">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="create">Creating Rules</TabsTrigger>
                    <TabsTrigger value="templates">Rule Templates</TabsTrigger>
                    <TabsTrigger value="examples">Real Examples</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="create" className="mt-6">
                    <div className="prose dark:prose-invert max-w-none">
                      <h3>Creating Your First Project Rule</h3>
                      <p>
                        Follow these steps to create and set up your first Cursor project rule:
                      </p>
                      <ol>
                        <li>Create a <code>.cursor</code> directory at the root of your project</li>
                        <li>Within it, create a <code>rules</code> subdirectory</li>
                        <li>Create a new file with the <code>.mdc</code> extension (e.g., <code>best-practices.mdc</code>)</li>
                        <li>Structure your rule with a clear title, description, and guidelines</li>
                        <li>Include specific examples where appropriate</li>
                      </ol>

                      <h4>Rule File Structure</h4>
                      <p>
                        A typical rule file should follow this structure:
                      </p>
                      <pre className="bg-muted p-4 rounded text-sm overflow-auto">
                        <code>{`# Rule Title

## Description
A clear explanation of what this rule covers and why it's important.

## Guidelines
1. First guideline with explanation
2. Second guideline with explanation
3. Third guideline with explanation

## Examples

\`\`\`typescript
// Good example
function goodExample() {
  // Code that follows the guidelines
}

// Bad example
function badExample() {
  // Code that violates the guidelines
}
\`\`\`

## Additional Resources
- Link to relevant documentation
- Link to style guides or patterns
`}</code>
                      </pre>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="templates" className="mt-6">
                    <div className="prose dark:prose-invert max-w-none">
                      <h3>Common Rule Templates</h3>
                      <p>
                        Here are some templates you can use as starting points for your own project rules:
                      </p>

                      <h4>Coding Standards Template</h4>
                      <pre className="bg-muted p-4 rounded text-sm overflow-auto">
                        <code>{`# Coding Standards

## Description
This rule defines our team's coding standards and style conventions. Following these standards ensures consistency across the codebase and improves readability and maintainability.

## Guidelines
1. **Naming Conventions**: Use camelCase for variables and functions, PascalCase for classes and components, and UPPER_SNAKE_CASE for constants.
2. **Indentation**: Use 2 spaces for indentation.
3. **Line Length**: Keep lines under 100 characters.
4. **Comments**: Add comments for complex logic but avoid unnecessary comments for self-explanatory code.
5. **Error Handling**: Always include proper error handling in async functions.

## Examples

\`\`\`typescript
// Good example
const calculateTotalPrice = (items) => {
  const TAX_RATE = 0.08;
  try {
    return items.reduce((total, item) => {
      return total + item.price;
    }, 0) * (1 + TAX_RATE);
  } catch (error) {
    console.error('Error calculating total price:', error);
    return 0;
  }
};

// Bad example
const calc = (i) => {
  return i.reduce((t, i) => { return t + i.price }, 0) * 1.08;
};
\`\`\`
`}</code>
                      </pre>

                      <h4>Project Structure Template</h4>
                      <pre className="bg-muted p-4 rounded text-sm overflow-auto">
                        <code>{`# Project Structure

## Description
This rule outlines our project's directory structure and organization principles. Understanding this structure helps in placing new files in the correct locations and maintaining a clean architecture.

## Directory Structure
- \`/src\`: Source code
  - \`/components\`: React components
    - \`/common\`: Shared components used across features
    - \`/[feature]\`: Feature-specific components
  - \`/hooks\`: Custom React hooks
  - \`/utils\`: Utility functions
  - \`/services\`: External service integrations
  - \`/context\`: React context providers
  - \`/types\`: TypeScript type definitions

## Guidelines
1. Keep components focused on a single responsibility
2. Place shared utilities in the utils directory
3. Group related components in feature directories
4. Create index.ts files for clean exports

## Examples

\`\`\`typescript
// Good organization: /src/components/auth/LoginForm.tsx
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../common/Button';

export const LoginForm = () => {
  // Component implementation
};
\`\`\`
`}</code>
                      </pre>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="examples" className="mt-6">
                    <div className="prose dark:prose-invert max-w-none">
                      <h3>Real-World Project Rule Examples</h3>
                      
                      <h4>Component Pattern Rule</h4>
                      <pre className="bg-muted p-4 rounded text-sm overflow-auto">
                        <code>{`# React Component Patterns

## Description
This rule defines how React components should be structured in our project, emphasizing functional components with hooks.

## Guidelines
1. Use functional components with hooks instead of class components
2. Follow the Single Responsibility Principle
3. Keep components small and focused (under 250 lines)
4. Extract reusable logic into custom hooks
5. Use TypeScript for prop type definitions

## Component Structure
Components should follow this general structure:
1. Imports
2. Type definitions (interfaces/types)
3. Helper functions (if small and only used in this component)
4. The component function
5. Exports

## Examples

\`\`\`tsx
// ProductCard.tsx
import { useState } from 'react';
import { formatCurrency } from '@/utils/formatting';
import { Button } from '@/components/common/Button';
import { useCart } from '@/hooks/useCart';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
}

export const ProductCard = ({ 
  id, 
  name, 
  price, 
  image, 
  description 
}: ProductCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { addToCart } = useCart();
  
  const toggleDescription = () => {
    setIsExpanded(prev => !prev);
  };
  
  return (
    <div className="product-card">
      <img src={image} alt={name} />
      <h3>{name}</h3>
      <p>{formatCurrency(price)}</p>
      
      {isExpanded ? (
        <p>{description}</p>
      ) : (
        <p>{description.substring(0, 100)}...</p>
      )}
      
      <button onClick={toggleDescription}>
        {isExpanded ? 'Show less' : 'Show more'}
      </button>
      
      <Button onClick={() => addToCart(id)}>
        Add to Cart
      </Button>
    </div>
  );
};
\`\`\`
`}</code>
                      </pre>

                      <h4>API Integration Rule</h4>
                      <pre className="bg-muted p-4 rounded text-sm overflow-auto">
                        <code>{`# API Integration Patterns

## Description
This rule outlines how external APIs should be integrated within our application.

## Guidelines
1. Use a service layer to abstract API interactions
2. Implement proper error handling and retry logic
3. Use TypeScript interfaces to define response types
4. Cache responses when appropriate
5. Include loading states in the UI

## Examples

\`\`\`typescript
// userService.ts
import axios from 'axios';

interface User {
  id: string;
  name: string;
  email: string;
}

interface FetchUsersResponse {
  users: User[];
  totalCount: number;
}

export class UserService {
  private baseUrl = process.env.API_URL;
  
  async getUsers(page: number = 1, limit: number = 10): Promise<FetchUsersResponse> {
    try {
      const response = await axios.get(
        \`\${this.baseUrl}/users\`, 
        { params: { page, limit } }
      );
      
      return {
        users: response.data.users,
        totalCount: response.data.total
      };
    } catch (error) {
      console.error('Error fetching users:', error);
      throw new Error('Failed to fetch users. Please try again.');
    }
  }
  
  async getUserById(id: string): Promise<User> {
    try {
      const response = await axios.get(\`\${this.baseUrl}/users/\${id}\`);
      return response.data;
    } catch (error) {
      console.error(\`Error fetching user \${id}:\`, error);
      throw new Error('Failed to fetch user. Please try again.');
    }
  }
}

// Using the service in a component
export const useUsers = (initialPage = 1) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const userService = new UserService();
        const data = await userService.getUsers(initialPage);
        setUsers(data.users);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, [initialPage]);
  
  return { users, loading, error };
};
\`\`\`
`}</code>
                      </pre>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              <div className="prose dark:prose-invert max-w-none">
                <h2>Implementing Project Rules in Your Workflow</h2>
                <p>
                  Once you've created your project rules, it's important to effectively integrate them into your
                  development workflow and ensure they're properly used by Cursor.
                </p>

                <h3>Activating Rules in Cursor</h3>
                <p>
                  Cursor automatically detects and loads rules from the <code>.cursor/rules/</code> directory.
                  When you open your project in Cursor, these rules are made available to the AI assistant.
                </p>

                <div className="bg-muted p-6 rounded-lg my-6">
                  <h4 className="text-lg font-semibold mb-2 flex items-center">
                    <Sparkles className="h-5 w-5 mr-2 text-amber-500" />
                    Pro Tip: Working with Rules
                  </h4>
                  <p className="mt-0">
                    You can explicitly reference rules in your prompts to the AI. For example:
                  </p>
                  <div className="bg-slate-200 dark:bg-slate-800 p-3 mt-2 rounded">
                    "Generate a React component for user profile following our component patterns rule."
                  </div>
                </div>

                <h3>Best Practices for Project Rules</h3>
                <ol>
                  <li>
                    <strong>Keep rules focused and specific</strong> - Each rule should address a specific aspect of development rather than trying to cover everything.
                  </li>
                  <li>
                    <strong>Include examples</strong> - Concrete examples of both good and bad practices help clarify your guidelines.
                  </li>
                  <li>
                    <strong>Update rules as your project evolves</strong> - Rules should be living documents that change as your project and practices mature.
                  </li>
                  <li>
                    <strong>Organize rules logically</strong> - Group related guidelines together and use clear headings.
                  </li>
                  <li>
                    <strong>Share rules with your team</strong> - Ensure everyone understands the rules and how to reference them in AI prompts.
                  </li>
                </ol>
              </div>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <Book className="h-6 w-6 mb-2 text-primary" />
                  <CardTitle>Rule Categories</CardTitle>
                  <CardDescription>Common types of project rules</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="font-medium mb-1">Coding Standards</div>
                    <p className="text-sm text-muted-foreground">
                      Naming conventions, formatting rules, and code organization patterns
                    </p>
                  </div>
                  <div>
                    <div className="font-medium mb-1">Architecture Patterns</div>
                    <p className="text-sm text-muted-foreground">
                      Project structure, component design, and data flow patterns
                    </p>
                  </div>
                  <div>
                    <div className="font-medium mb-1">Documentation Guidelines</div>
                    <p className="text-sm text-muted-foreground">
                      Standards for comments, JSDoc, and README files
                    </p>
                  </div>
                  <div>
                    <div className="font-medium mb-1">Testing Approaches</div>
                    <p className="text-sm text-muted-foreground">
                      Unit testing patterns, testing libraries, and coverage expectations
                    </p>
                  </div>
                  <div>
                    <div className="font-medium mb-1">Performance Considerations</div>
                    <p className="text-sm text-muted-foreground">
                      Guidelines for optimizing and measuring performance
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100 dark:from-blue-950/30 dark:to-indigo-950/30 dark:border-blue-900">
                <CardHeader>
                  <Brain className="h-6 w-6 mb-2 text-primary" />
                  <CardTitle>AI Interaction Tips</CardTitle>
                  <CardDescription>Get better results with Cursor</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start">
                      <span className="bg-blue-500/20 text-blue-700 dark:text-blue-300 p-1 rounded-full mr-2 mt-0.5">1</span>
                      <div>
                        <span className="font-medium">Reference rules explicitly</span>
                        <p className="text-xs text-muted-foreground mt-1">
                          "Generate this component following our React component rule"
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-blue-500/20 text-blue-700 dark:text-blue-300 p-1 rounded-full mr-2 mt-0.5">2</span>
                      <div>
                        <span className="font-medium">Combine rules as needed</span>
                        <p className="text-xs text-muted-foreground mt-1">
                          "Follow both our API pattern and error handling rules"
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-blue-500/20 text-blue-700 dark:text-blue-300 p-1 rounded-full mr-2 mt-0.5">3</span>
                      <div>
                        <span className="font-medium">Override rules when necessary</span>
                        <p className="text-xs text-muted-foreground mt-1">
                          "Follow our component rule but use a class component instead"
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-blue-500/20 text-blue-700 dark:text-blue-300 p-1 rounded-full mr-2 mt-0.5">4</span>
                      <div>
                        <span className="font-medium">Ask about rule application</span>
                        <p className="text-xs text-muted-foreground mt-1">
                          "How would our error handling rule apply in this case?"
                        </p>
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Shield className="h-6 w-6 mb-2 text-primary" />
                  <CardTitle>Implementation Plan Rules</CardTitle>
                  <CardDescription>Supercharge project planning</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4">
                    Create specialized rules for implementation plans to guide AI in generating structured project roadmaps.
                  </p>
                  <div className="bg-muted p-3 rounded text-sm">
                    <pre className="text-xs overflow-auto"><code>{`# Implementation Plan Template

## Structure
1. Project Overview
2. Technology Stack
3. Phase 1: Foundation (2 weeks)
   - Task 1.1
   - Task 1.2
4. Phase 2: Core Features (3 weeks)
   - Task 2.1
   - Task 2.2
5. Phase 3: Refinement (2 weeks)
   - Task 3.1
   - Task 3.2
6. Testing Strategy
7. Deployment Plan
`}</code></pre>
                  </div>
                  <div className="mt-4">
                    <Link href="/tools/cursor/implementation-plans">
                      <Button variant="outline" size="sm" className="w-full">
                        Learn about Implementation Plans
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex justify-between items-center mt-8 pt-8 border-t">
            <Link href="/tools/cursor/workflows">
              <Button variant="outline">
                <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
                Development Workflows
              </Button>
            </Link>
            <Link href="/tools/cursor/advanced-features">
              <Button>
                Advanced Features
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </MainLayout>
      <FloatingChat />
    </>
  )
} 