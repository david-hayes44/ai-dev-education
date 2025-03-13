import Link from "next/link"
import { ArrowRight, Copy, Download, Share, Sparkles, ThumbsUp, Bookmark } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export default function BestPracticesRulePage() {
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
          <Link href="/resources/knowledge-base/cursor-rules" className="hover:text-foreground">
            Cursor Rules
          </Link>
          <span className="mx-2 text-muted-foreground">/</span>
          <span className="text-foreground">best-practices</span>
        </nav>
        
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <h1 className="text-3xl font-extrabold md:text-4xl">
                best-practices
              </h1>
              <Badge variant="outline" className="capitalize ml-2 bg-primary/10 text-primary border-primary/20">
                General
              </Badge>
            </div>
            <p className="text-xl text-muted-foreground">
              Use this for best practices when you're creating new features
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Copy className="h-4 w-4" />
              <span>Copy Rule</span>
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              <span>Download</span>
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Share className="h-4 w-4" />
              <span>Share</span>
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Bookmark className="h-4 w-4" />
              <span>Save</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main content card */}
      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card className="p-6">
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <h2>When implementing new features or making changes to the codebase, follow these principles:</h2>
              
              <h3>1. Write Clean, Maintainable Code</h3>
              <ul>
                <li>Use meaningful variable and function names</li>
                <li>Keep functions small and focused on a single task</li>
                <li>Add comments for complex logic, but prefer self-documenting code</li>
                <li>Follow the DRY (Don't Repeat Yourself) principle</li>
              </ul>
              
              <h3>2. Ensure Performance</h3>
              <ul>
                <li>Consider time and space complexity for algorithms</li>
                <li>Avoid unnecessary re-renders in UI components</li>
                <li>Use appropriate data structures for operations</li>
                <li>Implement lazy loading and code splitting where beneficial</li>
              </ul>
              
              <h3>3. Maintain Security</h3>
              <ul>
                <li>Validate all user inputs</li>
                <li>Avoid storing sensitive data in client-side code</li>
                <li>Use proper authentication and authorization checks</li>
                <li>Follow the principle of least privilege</li>
              </ul>
              
              <h3>4. Write Tests</h3>
              <ul>
                <li>Create unit tests for critical functionality</li>
                <li>Include integration tests for component interactions</li>
                <li>Test edge cases and error handling</li>
              </ul>
              
              <h3>5. Follow the Existing Style</h3>
              <ul>
                <li>Maintain consistency with the existing codebase</li>
                <li>Adhere to established patterns and conventions</li>
                <li>Use the same formatting and style guidelines</li>
              </ul>
            </div>
          </Card>
          
          {/* Implementation examples */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-6">Implementation Examples</h2>
            <Card>
              <CardHeader>
                <CardTitle>Example 1: Using the Rule in a Prompt</CardTitle>
                <CardDescription>How to reference this rule in your AI prompts</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-md text-sm overflow-auto whitespace-pre-wrap">
{`"I need to implement a user authentication feature. Please follow our best-practices rule, with special attention to security aspects."`}
                </pre>
              </CardContent>
            </Card>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Example 2: Code Example Following This Rule</CardTitle>
                <CardDescription>A code example that follows these best practices</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-md text-sm overflow-auto">
{`// User authentication service following best practices

// Clear, focused function with meaningful name
async function authenticateUser(email: string, password: string): Promise<AuthResult> {
  try {
    // Input validation
    if (!email || !password) {
      throw new InvalidInputError('Email and password are required');
    }
    
    // Email format validation
    if (!isValidEmail(email)) {
      throw new InvalidInputError('Invalid email format');
    }
    
    // Password strength check
    if (!meetsPasswordRequirements(password)) {
      throw new WeakPasswordError('Password does not meet security requirements');
    }
    
    // Rate limiting check
    await checkRateLimiting(email);
    
    // Secure password comparison with timing attack protection
    const user = await userRepository.findByEmail(email);
    if (!user || !await comparePasswords(password, user.passwordHash)) {
      // Don't reveal which one was incorrect for security
      throw new AuthenticationError('Invalid credentials');
    }
    
    // Generate JWT with appropriate expiration
    const token = generateAuthToken(user, '1h');
    
    // Log successful login (but not the credentials)
    logger.info(\`User \${user.id} successfully authenticated\`);
    
    return {
      success: true,
      token,
      user: sanitizeUserData(user) // Remove sensitive data before returning
    };
  } catch (error) {
    // Structured error handling
    logger.error('Authentication error', { 
      userId: email, 
      errorType: error.constructor.name,
      message: error.message 
    });
    
    throw error;
  }
}`}
                </pre>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Sidebar */}
        <div>
          {/* Usage stats */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Usage Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Projects using this rule</span>
                    <span className="font-medium">124</span>
                  </div>
                  <div className="mt-1 h-2 w-full rounded-full bg-muted">
                    <div className="h-full w-3/4 rounded-full bg-primary"></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">User rating</span>
                    <span className="font-medium">4.8/5</span>
                  </div>
                  <div className="mt-1 h-2 w-full rounded-full bg-muted">
                    <div className="h-full w-[96%] rounded-full bg-primary"></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Used with other rules</span>
                    <span className="font-medium">78%</span>
                  </div>
                  <div className="mt-1 h-2 w-full rounded-full bg-muted">
                    <div className="h-full w-[78%] rounded-full bg-primary"></div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t flex items-center justify-center">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ThumbsUp className="h-4 w-4" />
                  <span>Rate this rule</span>
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Frequently used with */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Frequently Used With</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li>
                  <Link 
                    href="/resources/knowledge-base/cursor-rules/error-handling"
                    className="flex items-center gap-2 rounded-md p-2 hover:bg-accent/10 transition-colors"
                  >
                    <Sparkles className="h-4 w-4 text-secondary" />
                    <span>error-handling</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/resources/knowledge-base/cursor-rules/style-guide"
                    className="flex items-center gap-2 rounded-md p-2 hover:bg-accent/10 transition-colors"
                  >
                    <Sparkles className="h-4 w-4 text-secondary" />
                    <span>style-guide</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/resources/knowledge-base/cursor-rules/project-docs-rules"
                    className="flex items-center gap-2 rounded-md p-2 hover:bg-accent/10 transition-colors"
                  >
                    <Sparkles className="h-4 w-4 text-secondary" />
                    <span>project-docs-rules</span>
                  </Link>
                </li>
              </ul>
            </CardContent>
          </Card>
          
          {/* How to Use */}
          <Card>
            <CardHeader>
              <CardTitle>How to Use This Rule</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger className="text-sm">In Your Project</AccordionTrigger>
                  <AccordionContent>
                    <ol className="text-sm space-y-2 text-muted-foreground list-decimal pl-5">
                      <li>Add this rule to your <code className="bg-muted px-1 py-0.5 rounded text-xs">.cursor/rules.json</code> file</li>
                      <li>Reference it in your AI prompts by name</li>
                      <li>Share with your team members to maintain consistency</li>
                    </ol>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-2">
                  <AccordionTrigger className="text-sm">In Your Prompts</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground mb-2">
                      Simply mention the rule by name in your prompts to Claude:
                    </p>
                    <pre className="bg-muted p-2 rounded-md text-xs">
                      "Follow our best-practices rule for this implementation"
                    </pre>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-3">
                  <AccordionTrigger className="text-sm">Customizing</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground">
                      You can extend or modify this rule to better fit your project's needs. 
                      Edit the rule in your local rules.json file to add project-specific 
                      guidelines or adjust existing ones.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              
              <div className="mt-4 pt-4 border-t">
                <Button asChild className="w-full">
                  <Link href="/resources/knowledge-base/cursor-rules/getting-started">
                    Implementation Guide <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Related resources */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Related Resources</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Code Quality Guide</CardTitle>
              <CardDescription>Comprehensive guide to maintaining code quality</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                An in-depth look at code quality principles and how to apply them in your projects.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <Link href="/resources/guides/code-quality">
                  Read Guide
                </Link>
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Security Best Practices</CardTitle>
              <CardDescription>Essential security practices for AI-assisted development</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Learn how to ensure your AI-generated code follows security best practices.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <Link href="/resources/guides/security">
                  Read Guide
                </Link>
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Testing Framework</CardTitle>
              <CardDescription>Effective testing strategies for AI-assisted code</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                A framework for testing code generated with AI assistance to ensure quality and reliability.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <Link href="/resources/guides/testing">
                  Read Guide
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>
    </div>
  )
} 