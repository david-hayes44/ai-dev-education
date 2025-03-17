import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the template for page.tsx files
const generatePageTemplate = (title, description) => `import { Metadata } from "next"
import { Container } from "@/components/ui/container"
import { PageHeader } from "@/components/page-header"

export const metadata: Metadata = {
  title: "${title}",
  description: "${description}",
}

export default function Page() {
  return (
    <>
      <PageHeader
        title="${title}"
        description="${description}"
      />
      <Container className="py-8 md:py-12">
        <div className="prose prose-lg dark:prose-invert mx-auto">
          <h2>Introduction</h2>
          <p>
            This is a placeholder content for the ${title} page. This section will be populated with
            actual content regarding the topic.
          </p>

          <h2>Key Points</h2>
          <ul>
            <li>First important point about this topic</li>
            <li>Second important point about this topic</li>
            <li>Third important point about this topic</li>
          </ul>

          <h2>Details</h2>
          <p>
            More detailed information about the topic will be presented here, including
            examples, code snippets, and practical implementation guidance.
          </p>

          <h2>Related Resources</h2>
          <ul>
            <li>Link to related resource 1</li>
            <li>Link to related resource 2</li>
            <li>Link to related resource 3</li>
          </ul>
        </div>
      </Container>
    </>
  )
}`;

// Define the pages to create
const pagesToCreate = [
  {
    path: 'app/introduction/benefits/page.tsx',
    title: 'Benefits of AI-Assisted Development',
    description: 'Explore the advantages and benefits of incorporating AI into your development workflow.'
  },
  {
    path: 'app/introduction/getting-started/page.tsx',
    title: 'Getting Started with AI-Assisted Development',
    description: 'Learn how to begin your journey with AI-assisted development tools and techniques.'
  },
  {
    path: 'app/mcp/basics/page.tsx',
    title: 'MCP Basics',
    description: 'Understand the fundamental concepts and principles of the Model Context Protocol.'
  },
  {
    path: 'app/mcp/benefits/page.tsx',
    title: 'Benefits of MCP',
    description: 'Discover the advantages of using the Model Context Protocol in AI-assisted development.'
  },
  {
    path: 'app/mcp/context-management/page.tsx',
    title: 'MCP Context Management',
    description: 'Learn effective techniques for managing context within the Model Context Protocol framework.'
  },
  {
    path: 'app/mcp/implementation/page.tsx',
    title: 'MCP Implementation',
    description: 'Practical guidance for implementing the Model Context Protocol in your projects.'
  },
  {
    path: 'app/best-practices/context-management/page.tsx',
    title: 'Context Management Best Practices',
    description: 'Learn effective strategies for managing context in AI-assisted development.'
  },
  {
    path: 'app/best-practices/code-review/page.tsx',
    title: 'AI-Assisted Code Review',
    description: 'Best practices for reviewing code generated or modified with AI assistance.'
  },
  {
    path: 'app/best-practices/testing/page.tsx',
    title: 'Testing AI-Generated Code',
    description: 'Strategies and techniques for effectively testing code created with AI assistance.'
  },
  {
    path: 'app/best-practices/security/page.tsx',
    title: 'Security Considerations for AI-Assisted Development',
    description: 'Understanding and addressing security concerns in AI-assisted development workflows.'
  },
  {
    path: 'app/best-practices/collaboration/page.tsx',
    title: 'Collaboration in AI-Assisted Development',
    description: 'Best practices for team collaboration when using AI development tools.'
  },
  {
    path: 'app/best-practices/practical-llm-usage/page.tsx',
    title: 'Practical LLM Usage',
    description: 'Practical advice for effectively using Large Language Models in development.'
  },
  {
    path: 'app/best-practices/project-customization/page.tsx',
    title: 'Project Customization for AI',
    description: 'Guidelines for customizing projects to work optimally with AI assistance.'
  },
  {
    path: 'app/best-practices/coding-standards/page.tsx',
    title: 'Coding Standards for AI-Assisted Development',
    description: 'Establishing and maintaining coding standards when working with AI tools.'
  },
  // Server pages
  {
    path: 'app/servers/page.tsx',
    title: 'MCP Servers Overview',
    description: 'An introduction to Model Context Protocol servers and their role in AI-assisted development.'
  },
  {
    path: 'app/servers/architecture/page.tsx',
    title: 'MCP Server Architecture',
    description: 'Understanding the architecture and components of Model Context Protocol servers.'
  },
  {
    path: 'app/servers/implementation/page.tsx',
    title: 'MCP Server Implementation',
    description: 'Guidelines and considerations for implementing Model Context Protocol servers.'
  },
  {
    path: 'app/servers/implementation/nodejs/page.tsx',
    title: 'Node.js MCP Server Implementation',
    description: 'Step-by-step guide to implementing a Model Context Protocol server using Node.js.'
  },
  {
    path: 'app/servers/implementation/python/page.tsx',
    title: 'Python MCP Server Implementation',
    description: 'Step-by-step guide to implementing a Model Context Protocol server using Python.'
  },
  {
    path: 'app/servers/security/page.tsx',
    title: 'MCP Server Security',
    description: 'Best practices for securing Model Context Protocol servers and protecting sensitive data.'
  },
  {
    path: 'app/servers/examples/page.tsx',
    title: 'MCP Server Examples',
    description: 'Real-world examples and code samples for Model Context Protocol servers.'
  },
  // Tools pages
  {
    path: 'app/tools/page.tsx',
    title: 'AI Development Tools',
    description: 'An overview of tools that support AI-assisted development and MCP integration.'
  },
  {
    path: 'app/tools/cursor/page.tsx',
    title: 'Cursor',
    description: 'Learn about Cursor, an AI-powered code editor designed for AI-assisted development.'
  },
  {
    path: 'app/tools/windsurf/page.tsx',
    title: 'Windsurf',
    description: 'Discover Windsurf, a tool for enhancing AI-assisted development workflows.'
  },
  {
    path: 'app/tools/claude/page.tsx',
    title: 'Claude',
    description: 'Explore Claude AI capabilities and how to use them effectively in development.'
  },
  {
    path: 'app/tools/openai/page.tsx',
    title: 'OpenAI',
    description: 'Learn about OpenAI tools and APIs for AI-assisted development.'
  },
  // Learning Paths pages
  {
    path: 'app/learning-paths/page.tsx',
    title: 'Learning Paths',
    description: 'Structured learning journeys for different roles and experience levels.'
  },
  {
    path: 'app/learning-paths/junior-developer/page.tsx',
    title: 'Junior Developer Learning Path',
    description: 'A structured learning journey for developers new to AI-assisted development.'
  },
  {
    path: 'app/learning-paths/experienced-developer/page.tsx',
    title: 'Experienced Developer Learning Path',
    description: 'An advanced learning journey for developers with prior programming experience.'
  },
  {
    path: 'app/learning-paths/technical-leader/page.tsx',
    title: 'Technical Leader Learning Path',
    description: 'Strategic guidance for technical leaders implementing AI-assisted development in their teams.'
  },
  // Resources pages
  {
    path: 'app/resources/page.tsx',
    title: 'Resources',
    description: 'Additional resources and reference materials for AI-assisted development.'
  },
  {
    path: 'app/resources/knowledge-base/page.tsx',
    title: 'Knowledge Base',
    description: 'A comprehensive knowledge base for AI-assisted development concepts and techniques.'
  },
  {
    path: 'app/resources/knowledge-base/cursor-rules/page.tsx',
    title: 'Cursor Rules',
    description: 'Guidelines and best practices for using Cursor effectively in AI-assisted development.'
  },
  {
    path: 'app/resources/glossary/page.tsx',
    title: 'Glossary',
    description: 'Definitions of key terms and concepts in AI-assisted development.'
  },
  {
    path: 'app/resources/external-resources/page.tsx',
    title: 'External Resources',
    description: 'Curated links to external resources for further learning about AI-assisted development.'
  }
];

// Create the pages
pagesToCreate.forEach(page => {
  const content = generatePageTemplate(page.title, page.description);
  const dirPath = path.dirname(page.path);
  
  // Ensure directory exists
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
  
  // Write the file
  fs.writeFileSync(page.path, content);
  console.log(`Created file: ${page.path}`);
});

console.log('Page generation complete!'); 