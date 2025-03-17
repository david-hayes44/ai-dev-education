import { Metadata } from "next"
import { ContentTemplate, CodeBlock, Callout } from "@/components/content/ContentTemplate"
import { generateMetadata } from "@/lib/content-utils"

export const metadata: Metadata = generateMetadata({
  title: "AI-Assisted Development Concepts",
  description: "Learn about the core concepts of AI-assisted development and how they can transform your workflow.",
  keywords: ["LLM", "AI concepts", "context management", "AI-human collaboration"],
  section: "introduction/concepts"
})

export default function ConceptsPage() {
  return (
    <ContentTemplate
      title="AI-Assisted Development Concepts"
      description="Learn about the core concepts of AI-assisted development and how they can transform your workflow."
      metadata={{
        difficulty: "beginner",
        timeToComplete: "15 minutes",
        prerequisites: [
          {
            title: "Introduction to AI-Assisted Development",
            href: "/introduction"
          }
        ]
      }}
      tableOfContents={[
        {
          id: "introduction",
          title: "Introduction to AI-Assisted Development",
          level: 2
        },
        {
          id: "key-concepts",
          title: "Key Concepts",
          level: 2
        },
        {
          id: "types-of-assistance",
          title: "Types of AI Development Assistance",
          level: 2,
          children: [
            {
              id: "code-completion",
              title: "Code Completion and Generation",
              level: 3
            },
            {
              id: "code-explanation",
              title: "Code Explanation and Documentation",
              level: 3
            },
            {
              id: "automated-refactoring",
              title: "Automated Refactoring",
              level: 3
            },
            {
              id: "test-generation",
              title: "Test Generation",
              level: 3
            }
          ]
        },
        {
          id: "evolution",
          title: "The Evolution of AI-Assisted Development",
          level: 2
        }
      ]}
      relatedContent={[
        {
          title: "Benefits of AI-Assisted Development",
          href: "/introduction/benefits",
          description: "Discover how AI tools can enhance your development workflow and productivity."
        },
        {
          title: "Getting Started with AI-Assisted Development",
          href: "/introduction/getting-started",
          description: "Learn the first steps to incorporate AI tools into your development process."
        },
        {
          title: "Understanding the Model Context Protocol",
          href: "/mcp",
          description: "Explore how MCP standardizes context sharing between AI development tools."
        }
      ]}
    >
      <h2 id="introduction">Introduction to AI-Assisted Development</h2>
      <p>
        AI-assisted development represents a paradigm shift in how software is created, 
        leveraging artificial intelligence to enhance developer productivity, creativity, 
        and code quality. Unlike traditional programming where developers write every line 
        of code, AI-assisted development introduces an intelligent collaborator that can 
        understand context, suggest solutions, and automate repetitive tasks.
      </p>

      <Callout type="info" title="What is AI-Assisted Development?">
        AI-assisted development is the practice of using artificial intelligence tools to help
        write, review, test, and maintain code. These tools can range from simple code completion
        to advanced pair-programming assistants that can generate entire functions or modules
        based on natural language descriptions.
      </Callout>

      <h2 id="key-concepts">Key Concepts</h2>
      <ul>
        <li>
          <strong>Large Language Models (LLMs)</strong> - AI systems trained on vast amounts 
          of code and text that can understand and generate programming languages
        </li>
        <li>
          <strong>Context Management</strong> - The process of providing and maintaining the 
          right information for the AI to understand the programming task
        </li>
        <li>
          <strong>Model Context Protocol (MCP)</strong> - A standardized approach for managing and 
          sharing context between different AI development tools
        </li>
        <li>
          <strong>AI-Human Collaboration</strong> - A workflow where AI and developers work 
          together, each contributing their unique strengths
        </li>
      </ul>

      <h2 id="types-of-assistance">Types of AI Development Assistance</h2>
      <p>
        AI can assist development in various ways, from code completion to more advanced 
        forms of collaboration:
      </p>

      <h3 id="code-completion">Code Completion and Generation</h3>
      <p>
        The most common form of AI assistance, where the AI suggests or generates code 
        based on comments, function signatures, or existing code patterns.
      </p>

      <CodeBlock 
        language="typescript"
        filename="example.ts"
        code={`// Generate a function that calculates the Fibonacci sequence
function fibonacci(n: number): number {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// Generate an optimized version with memoization
function fibonacciMemoized(n: number, memo: Record<number, number> = {}): number {
  if (n in memo) return memo[n];
  if (n <= 1) return n;
  
  memo[n] = fibonacciMemoized(n - 1, memo) + fibonacciMemoized(n - 2, memo);
  return memo[n];
}`}
      />

      <Callout type="tip">
        When using code generation, always review the output carefully. While AI assistants can produce working code,
        they may not always generate the most efficient or idiomatic solutions for your specific context.
      </Callout>

      <h3 id="code-explanation">Code Explanation and Documentation</h3>
      <p>
        AI can analyze existing code to explain its functionality, generate comments, 
        or create documentation for complex systems.
      </p>

      <h3 id="automated-refactoring">Automated Refactoring</h3>
      <p>
        AI can suggest improvements to code structure, identify potential bugs, and 
        even implement refactoring changes automatically.
      </p>

      <h3 id="test-generation">Test Generation</h3>
      <p>
        AI can analyze code and generate test cases to ensure proper functionality 
        and edge case handling.
      </p>

      <CodeBlock 
        language="typescript"
        filename="fibonacci.test.ts"
        code={`import { fibonacci } from './fibonacci';

describe('fibonacci function', () => {
  test('should return 0 for input 0', () => {
    expect(fibonacci(0)).toBe(0);
  });

  test('should return 1 for input 1', () => {
    expect(fibonacci(1)).toBe(1);
  });

  test('should return 1 for input 2', () => {
    expect(fibonacci(2)).toBe(1);
  });

  test('should return 5 for input 5', () => {
    expect(fibonacci(5)).toBe(5);
  });

  test('should return 55 for input 10', () => {
    expect(fibonacci(10)).toBe(55);
  });
});`}
      />

      <h2 id="evolution">The Evolution of AI-Assisted Development</h2>
      <p>
        AI assistance in development has evolved rapidly in recent years:
      </p>
      <ul>
        <li>Early systems provided simple autocomplete functionality</li>
        <li>Current systems can understand project-wide context and generate complex solutions</li>
        <li>Emerging systems can actively participate in problem-solving and architectural decisions</li>
      </ul>

      <Callout type="warning" title="Important Consideration">
        While AI tools are becoming increasingly capable, they work best as collaborators rather than replacements
        for human developers. The most effective approach is to leverage AI for what it does best (generating code,
        finding patterns, suggesting solutions) while relying on human expertise for critical thinking, understanding
        business requirements, and making architectural decisions.
      </Callout>
    </ContentTemplate>
  )
} 