# Content Template Guide

This document provides guidelines for creating content using the standardized content template for the AI Dev Education platform.

## Overview

The content template provides a consistent structure for all educational pages, including:

- Standardized metadata and SEO information
- Difficulty level indicators
- Table of contents with navigation
- Related content links
- Specialized content components like code blocks and callouts

## Getting Started

### Basic Page Structure

Here's a basic example of how to use the content template:

```tsx
import { Metadata } from "next"
import { ContentTemplate, CodeBlock, Callout } from "@/components/content"
import { generateMetadata } from "@/lib/content-utils"

export const metadata: Metadata = generateMetadata({
  title: "Your Page Title",
  description: "A brief description of the page content",
  keywords: ["relevant", "keywords", "here"],
  section: "section-name/page-name" // corresponds to the URL path
})

export default function YourPageName() {
  return (
    <ContentTemplate
      title="Your Page Title"
      description="A brief description of the page content"
      metadata={{
        difficulty: "beginner", // or "intermediate" or "advanced"
        timeToComplete: "15 minutes",
        prerequisites: [
          {
            title: "Prerequisite Page Title",
            href: "/prerequisite-page-path"
          }
        ]
      }}
      tableOfContents={[
        {
          id: "section-id",
          title: "Section Title",
          level: 2
        }
        // Add more sections as needed
      ]}
      relatedContent={[
        {
          title: "Related Page Title",
          href: "/related-page-path",
          description: "Brief description of the related content" 
        }
        // Add more related content as needed
      ]}
    >
      {/* Your content goes here */}
      <h2 id="section-id">Section Title</h2>
      <p>Your content...</p>
    </ContentTemplate>
  )
}
```

## Content Components

### Headings

Always include `id` attributes on your headings to enable table of contents navigation:

```tsx
<h2 id="unique-id">Heading Text</h2>
<h3 id="another-unique-id">Subheading Text</h3>
```

### Code Blocks

Use the `CodeBlock` component for displaying code examples:

```tsx
<CodeBlock 
  language="typescript" // or javascript, python, etc.
  filename="example.ts" // optional
  code={`// Your code here
function example() {
  return "Hello, world!";
}`}
/>
```

### Callouts

Use the `Callout` component for highlighting important information:

```tsx
<Callout type="info" title="Optional Title">
  This is important information that you want to highlight.
</Callout>
```

Available callout types:
- `info` - General information (blue)
- `warning` - Warnings or cautions (yellow)
- `tip` - Tips and best practices (purple)
- `success` - Successful actions or positive outcomes (green)

## Metadata Guidelines

### Difficulty Levels

- `beginner` - No prior knowledge required
- `intermediate` - Requires basic understanding of concepts
- `advanced` - Requires in-depth knowledge of the subject

### Time to Complete

Provide an estimate of how long it will take to read and understand the content:
- For short articles: "5 minutes"
- For medium articles: "10-15 minutes"
- For in-depth tutorials: "30 minutes" or "1 hour"

### Keywords

Include relevant keywords for SEO, focusing on:
- Primary concepts covered in the content
- Technologies or tools discussed
- Related methodologies or practices

## Table of Contents

The `tableOfContents` prop should mirror the actual heading structure in your content:

```tsx
tableOfContents={[
  {
    id: "introduction",
    title: "Introduction",
    level: 2
  },
  {
    id: "main-concepts",
    title: "Main Concepts",
    level: 2,
    children: [
      {
        id: "concept-one",
        title: "Concept One",
        level: 3
      },
      {
        id: "concept-two",
        title: "Concept Two",
        level: 3
      }
    ]
  }
]}
```

## Related Content

Always include 2-4 related content links to guide users to relevant information:

```tsx
relatedContent={[
  {
    title: "Next Steps in Learning",
    href: "/next-steps",
    description: "Continue your learning journey with these advanced topics."
  },
  {
    title: "Practical Examples",
    href: "/examples",
    description: "See these concepts in action with practical code examples."
  }
]}
```

## Content Writing Guidelines

### Voice and Tone
- Use a friendly, conversational tone
- Write in second person (using "you")
- Be concise but thorough
- Explain concepts clearly with examples

### Structure
- Start with a clear introduction
- Break complex topics into manageable sections
- Use bullet points and lists for clarity
- Provide practical examples to illustrate concepts
- End with a conclusion or next steps

### Code Examples
- Keep examples concise and focused
- Use realistic variable and function names
- Include comments to explain important concepts
- Show both basic and advanced usage when appropriate

## Utility Functions

The `content-utils.ts` file provides helpful utilities:

- `generateMetadata` - Creates consistent metadata for SEO
- `extractTableOfContents` - Extracts TOC from HTML content
- `createSlug` - Creates URL-friendly slugs from titles
- `formatDate` - Formats dates consistently
- `calculateReadingTime` - Estimates reading time based on content length

## Example Templates

For inspiration, refer to these existing pages:
- Introduction concepts: `/app/introduction/concepts/page.tsx`
- MCP basics: `/app/mcp/basics/page.tsx`
- Best practices: `/app/best-practices/page.tsx`

## Questions and Support

If you have questions about using the content template, contact the development team at dev@ai-dev-education.com. 