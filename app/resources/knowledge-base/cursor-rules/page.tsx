import Link from "next/link"
import { ArrowRight, Filter, Search, Sparkles, Tag, Check, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

// Sample cursor rules data (in a real app, this would be fetched from a database or API)
const cursorRules = [
  {
    id: "best-practices",
    name: "best-practices",
    description: "Use this for best practices when you're creating new features.",
    category: "general",
    content: `When implementing new features or making changes to the codebase, follow these principles:

1. **Write Clean, Maintainable Code**
   - Use meaningful variable and function names
   - Keep functions small and focused on a single task
   - Add comments for complex logic, but prefer self-documenting code
   - Follow the DRY (Don't Repeat Yourself) principle

2. **Ensure Performance**
   - Consider time and space complexity for algorithms
   - Avoid unnecessary re-renders in UI components
   - Use appropriate data structures for operations
   - Implement lazy loading and code splitting where beneficial

3. **Maintain Security**
   - Validate all user inputs
   - Avoid storing sensitive data in client-side code
   - Use proper authentication and authorization checks
   - Follow the principle of least privilege

4. **Write Tests**
   - Create unit tests for critical functionality
   - Include integration tests for component interactions
   - Test edge cases and error handling

5. **Follow the Existing Style**
   - Maintain consistency with the existing codebase
   - Adhere to established patterns and conventions
   - Use the same formatting and style guidelines`
  },
  {
    id: "collab-rule",
    name: "collab-rule",
    description: "How to optimize AI and human development interactions.",
    category: "collaboration",
    content: `## Effective AI Collaboration Principles

1. **Clear Communication**
   - Be explicit about requirements and constraints
   - Provide context for what you're trying to accomplish
   - Break complex requests into smaller, manageable parts
   - Use specific, unambiguous language

2. **Iterative Approach**
   - Start with a high-level outline or skeleton
   - Review and refine in stages
   - Provide feedback on what works and what doesn't
   - Build complexity incrementally

3. **Knowledge Sharing**
   - Explain domain-specific terminology
   - Link to relevant documentation or examples
   - Share project conventions and standards
   - Document decisions and rationale

4. **Quality Control**
   - Verify generated code before committing
   - Run tests on AI-suggested implementations
   - Review for security and performance concerns
   - Ensure adherence to project standards

5. **Learning Loop**
   - Document successful patterns of interaction
   - Note where AI tends to excel or struggle
   - Refine your prompting techniques over time
   - Share effective approaches with team members`
  },
  {
    id: "cursor_project_rules",
    name: "cursor_project_rules",
    description: "Apply these rules when creating the project.",
    category: "project-setup",
    content: `## Project Setup Guidelines

1. **Project Structure**
   - Organize code logically by feature or domain
   - Maintain clear separation of concerns
   - Follow standard conventions for your framework
   - Keep related files together

2. **Dependency Management**
   - Use specific versions for dependencies
   - Include only necessary dependencies
   - Document why dependencies are included
   - Consider security and maintenance status

3. **Configuration**
   - Externalize configuration values
   - Use environment variables for sensitive data
   - Provide reasonable defaults
   - Include configuration documentation

4. **Documentation**
   - Create a comprehensive README
   - Include setup and installation instructions
   - Document architectural decisions
   - Provide usage examples

5. **Development Environment**
   - Set up linting and code formatting
   - Configure testing framework
   - Include CI/CD configuration
   - Ensure reproducible builds`
  },
  {
    id: "project-docs-rules",
    name: "project-docs-rules",
    description: "Project documentation rules.",
    category: "documentation",
    content: `## Documentation Standards

1. **README Requirements**
   - Project name and description
   - Installation instructions
   - Usage examples
   - Development setup
   - Contribution guidelines
   - License information

2. **Code Documentation**
   - Document public APIs and interfaces
   - Explain complex algorithms or logic
   - Include JSDoc/TSDoc comments for functions
   - Keep documentation up-to-date with code changes

3. **Architecture Documentation**
   - High-level architecture diagrams
   - Component relationships
   - Data flow descriptions
   - Technology stack details

4. **User Documentation**
   - Clear, concise user guides
   - Step-by-step instructions
   - Screenshots or diagrams where helpful
   - FAQ for common questions or issues

5. **Maintenance Documentation**
   - Troubleshooting guides
   - Common issues and solutions
   - Deployment procedures
   - Monitoring and logging information`
  },
  {
    id: "style-guide",
    name: "style-guide",
    description: "Follow this style guide for consistent code formatting.",
    category: "coding-standards",
    content: `## Code Style Guidelines

1. **Formatting**
   - Use 2 space indentation
   - Limit line length to 100 characters
   - Use semicolons consistently
   - Follow consistent bracket style

2. **Naming Conventions**
   - Use camelCase for variables and functions
   - Use PascalCase for classes and components
   - Use ALL_CAPS for constants
   - Use descriptive, intention-revealing names

3. **File Organization**
   - One component per file
   - Group related functions together
   - Sort imports in a consistent order
   - Place interfaces and types at the top

4. **Comments**
   - Comment the "why", not the "what"
   - Keep comments current with code changes
   - Use JSDoc/TSDoc for public APIs
   - Remove commented-out code

5. **TypeScript**
   - Prefer interfaces for object types
   - Use explicit return types for functions
   - Avoid the 'any' type when possible
   - Use type guards for runtime type checking`
  },
  {
    id: "error-handling",
    name: "error-handling",
    description: "Guidelines for consistent error handling.",
    category: "coding-standards",
    content: `## Error Handling Best Practices

1. **Error Types**
   - Create custom error classes for specific scenarios
   - Include relevant context in error messages
   - Distinguish between operational and programmer errors
   - Use consistent error formats

2. **Try-Catch Blocks**
   - Only catch errors you can handle
   - Avoid empty catch blocks
   - Re-throw errors with additional context when appropriate
   - Clean up resources in finally blocks

3. **Async Error Handling**
   - Use try/catch with async/await
   - Handle promise rejections explicitly
   - Implement global error handlers for unhandled rejections
   - Design for failure in asynchronous code

4. **Error Logging**
   - Log errors with appropriate severity levels
   - Include contextual information for debugging
   - Sanitize sensitive data before logging
   - Implement structured logging for easier analysis

5. **User-Facing Errors**
   - Present user-friendly error messages
   - Include actionable information when possible
   - Maintain security by not exposing internal details
   - Provide consistent error UI components`
  }
];

// Helper function to get categories
const getCategories = () => {
  const categories = new Set(cursorRules.map(rule => rule.category));
  return Array.from(categories);
};

export default function CursorRulesPage() {
  const categories = getCategories();
  
  return (
    <div className="container mx-auto px-6 sm:px-8 py-10 md:py-12">
      {/* Header with breadcrumb */}
      <div className="mb-8">
        <nav className="mb-4 flex items-center text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <span className="mx-2 text-muted-foreground">/</span>
          <Link href="/resources" className="hover:text-foreground">
            Resources
          </Link>
          <span className="mx-2 text-muted-foreground">/</span>
          <Link href="/resources/knowledge-base" className="hover:text-foreground">
            Knowledge Base
          </Link>
          <span className="mx-2 text-muted-foreground">/</span>
          <span className="text-foreground">Cursor Rules</span>
        </nav>
        <h1 className="mb-2 text-4xl font-extrabold tracking-tight md:text-5xl">
          Cursor Rules
        </h1>
        <p className="text-xl text-muted-foreground">
          Best practices and guidelines for AI-assisted development with Cursor
        </p>
      </div>

      {/* Search and filter section */}
      <div className="mb-8 rounded-lg border bg-card p-6 shadow-sm">
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Find Rules</h2>
          <p className="text-muted-foreground mb-4">
            Search for specific rules or filter by category
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Search rules by name or content..." 
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Filter</span>
            </Button>
            <Button>
              <Search className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Search</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs for categories */}
      <Tabs defaultValue="all" className="mb-8">
        <TabsList className="w-full mb-8 grid" style={{ gridTemplateColumns: `repeat(${categories.length + 1}, minmax(0, 1fr))` }}>
          <TabsTrigger value="all">All Rules</TabsTrigger>
          {categories.map(category => (
            <TabsTrigger key={category} value={category}>
              {category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all">
          <div className="grid gap-6 md:grid-cols-2">
            {cursorRules.map(rule => (
              <Card key={rule.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      <CardTitle>{rule.name}</CardTitle>
                    </div>
                    <Badge variant="outline" className="capitalize bg-primary/10 text-primary border-primary/20">
                      {rule.category.replace('-', ' ')}
                    </Badge>
                  </div>
                  <CardDescription>{rule.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="text-sm text-muted-foreground">
                    {rule.content.split('\n\n')[0]}...
                  </div>
                </CardContent>
                <CardFooter>
                  <Button asChild variant="outline" className="w-full">
                    <Link href={`/resources/knowledge-base/cursor-rules/${rule.id}`}>
                      View Full Rule <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        {categories.map(category => (
          <TabsContent key={category} value={category}>
            <div className="grid gap-6 md:grid-cols-2">
              {cursorRules
                .filter(rule => rule.category === category)
                .map(rule => (
                  <Card key={rule.id} className="flex flex-col">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-primary" />
                          <CardTitle>{rule.name}</CardTitle>
                        </div>
                        <Badge variant="outline" className="capitalize bg-primary/10 text-primary border-primary/20">
                          {rule.category.replace('-', ' ')}
                        </Badge>
                      </div>
                      <CardDescription>{rule.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <div className="text-sm text-muted-foreground">
                        {rule.content.split('\n\n')[0]}...
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button asChild variant="outline" className="w-full">
                        <Link href={`/resources/knowledge-base/cursor-rules/${rule.id}`}>
                          View Full Rule <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
      
      {/* How to Use Cursor Rules */}
      <section className="mb-12">
        <div className="relative overflow-hidden rounded-xl bg-primary/10 p-8 shadow-sm dark:bg-primary/5">
          <div className="absolute -right-10 -top-10 h-40 w-40 rotate-12 rounded-3xl bg-primary/20 blur-3xl"></div>
          <div className="absolute -bottom-10 -left-10 h-40 w-40 -rotate-12 rounded-3xl bg-accent/20 blur-3xl"></div>
          
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-4">How to Use Cursor Rules</h2>
            <p className="text-muted-foreground mb-6">
              Cursor Rules help you establish consistent practices for AI-assisted development. Here's how to integrate them into your workflow:
            </p>
            
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-base font-medium">
                  Adding Rules to Your Project
                </AccordionTrigger>
                <AccordionContent>
                  <ol className="list-decimal pl-5 space-y-2 text-muted-foreground">
                    <li>Create a <code className="bg-muted px-1 py-0.5 rounded text-sm">.cursor</code> folder in your project root</li>
                    <li>Create a new file named <code className="bg-muted px-1 py-0.5 rounded text-sm">rules.json</code> in the .cursor folder</li>
                    <li>Define your rules following the format shown in our examples</li>
                    <li>Reference specific rules or combine them as needed</li>
                  </ol>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-2">
                <AccordionTrigger className="text-base font-medium">
                  Using Rules with AI Assistants
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground mb-2">
                    When working with AI assistants in Cursor, reference rules by name:
                  </p>
                  <div className="bg-muted p-3 rounded-md text-sm mb-2">
                    <p>"Please implement this feature following our <strong>best-practices</strong> rule for code quality."</p>
                  </div>
                  <p className="text-muted-foreground">
                    The AI will automatically recognize and apply the referenced rule's guidelines.
                  </p>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-3">
                <AccordionTrigger className="text-base font-medium">
                  Creating Custom Rules
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground mb-3">
                    Custom rules should follow this format:
                  </p>
                  <pre className="bg-muted p-3 rounded-md text-sm overflow-auto">
{`{
  "rules": {
    "your-rule-name": {
      "description": "Brief description of the rule",
      "content": "Detailed guidelines and best practices..."
    }
  }
}`}
                  </pre>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* Rule Implementation Examples */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Rule Implementation Examples</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                <CardTitle className="text-lg">Basic Rule Reference</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-3 rounded-md text-sm overflow-auto">
{`// Asking the AI to follow a rule
"Let's build a login component 
following our best-practices rule"`}
              </pre>
              <p className="mt-3 text-sm text-muted-foreground">
                Simple reference to a single rule for a specific task
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                <CardTitle className="text-lg">Multiple Rules</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-3 rounded-md text-sm overflow-auto">
{`// Combining multiple rules
"Create an API endpoint following 
our best-practices and 
error-handling rules"`}
              </pre>
              <p className="mt-3 text-sm text-muted-foreground">
                Combining multiple rules for comprehensive guidance
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                <CardTitle className="text-lg">Project Setup</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-3 rounded-md text-sm overflow-auto">
{`// Setting up a new project
"Create a new React project 
following our cursor_project_rules 
and style-guide"`}
              </pre>
              <p className="mt-3 text-sm text-muted-foreground">
                Using rules to ensure consistent project setup
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="rounded-xl gradient-bg p-8 shadow-sm">
        <div className="mx-auto max-w-3xl rounded-xl bg-background p-8 shadow-md">
          <div className="text-center">
            <h2 className="mb-4 text-2xl font-bold md:text-3xl">Ready to Implement Cursor Rules?</h2>
            <p className="mb-6 text-muted-foreground">
              Start using these best practices in your projects today to improve code quality and team collaboration.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg">
                <Link href="/resources/knowledge-base/cursor-rules/getting-started">
                  Implementation Guide
                </Link>
              </Button>
              <Button variant="outline" asChild size="lg">
                <Link href="/resources/knowledge-base/cursor-rules/examples">
                  View Example Projects
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
} 