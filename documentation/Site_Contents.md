# AI Dev Education - Site Contents

## Overview

This document outlines the content structure for the AI Dev Education website, serving as the definitive guide for site organization. The site is built using Next.js 14 with the App Router architecture and follows a progressive learning model while maintaining reference materials.

## Site Architecture

```
app/
├── layout.tsx         # Main layout with navigation, footer, and chat component
├── page.tsx           # Homepage ("The AI Dev Odyssey" landing page)
├── introduction/      # Introduction to AI-Assisted Development
├── mcp/               # Understanding MCP
├── best-practices/    # Best Practices for AI-Development
├── servers/           # Building MCP Servers
├── tools/             # AI Development Tools
├── learning-paths/    # Structured Learning Paths
├── resources/         # Additional Resources & Knowledge Base
└── contact/           # Contact page with screenshot upload feature
```

## Core Sections

### 1. Homepage (`app/page.tsx`)

**Title**: "The AI Dev Odyssey: Your Journey into AI-Assisted Development"

**Purpose**: Engaging landing page that introduces the site and guides users to appropriate sections

**Key Components**:
- Hero section with compelling headline and mission statement
- Overview of site's purpose and content
- Role-based navigation guidance (Junior Dev, Experienced Dev, Tech Leader)
- Interactive Learning Timeline feature for tracking progress
- Quick links to learning paths and popular content

### 2. Introduction (`app/introduction/`)

**Purpose**: Provide foundational knowledge for newcomers to AI-assisted development

**Structure**:
```
introduction/
├── page.tsx           # Introduction overview
├── concepts/          # Core concepts of AI-assisted development
├── benefits/          # Benefits and use cases
└── getting-started/   # First steps for beginners
```

**Key Content**:
- What is AI-assisted development
- How AI tools transform traditional development
- Benefits and potential challenges
- Distinguishing between AI assistance and replacement
- Getting started guide with practical first steps

### 3. Understanding MCP (`app/mcp/`)

**Purpose**: Explain the Model Context Protocol and its importance in AI-assisted development

**Structure**:
```
mcp/
├── page.tsx           # MCP overview
├── basics/            # MCP fundamentals
├── benefits/          # Why use MCP
├── context-management/# Managing context effectively
└── implementation/    # Getting started with MCP
```

**Key Content**:
- Definition and purpose of Model Context Protocol
- How MCP standardizes context sharing between tools
- Benefits of using MCP for context management
- Practical examples of MCP in action
- Basic implementation guidance
- Context optimization techniques

### 4. Best Practices (`app/best-practices/`)

**Purpose**: Provide actionable guidance for effective, secure AI-assisted development

**Structure**:
```
best-practices/
├── page.tsx                   # Overview of best practices
├── context-management/        # Understanding and managing model context
├── code-review/               # Reviewing AI-generated code
├── testing/                   # Testing strategies
├── security/                  # Privacy and security considerations
├── collaboration/             # Collaboration workflows
├── practical-llm-usage/       # Simon Willison's insights on using LLMs effectively
├── project-customization/     # Customizing project rules for AI
└── coding-standards/          # Standards for AI-assisted projects
```

**Key Content**:
- Context management best practices with examples
- Code review procedures with before/after examples
- Testing strategies specific to AI-generated code
- Privacy and security guidelines for AI tools
- Team collaboration workflows with MCP
- Simon Willison's practical advice for working with LLMs:
  - Understanding hallucinations
  - Exploratory vs. production coding
  - Giving effective instructions
  - Iterating and refining outputs
- Guidelines for customizing project rules
- Coding standards for AI-assisted projects

### 5. Building MCP Servers (`app/servers/`)

**Purpose**: Provide technical guidance for implementing MCP servers

**Structure**:
```
servers/
├── page.tsx                # Overview of MCP servers
├── architecture/           # Architecture components
├── implementation/         # Implementation considerations
├── security/               # Security best practices
└── examples/               # Code examples & tutorials
```

**Key Content**:
- Server architecture components:
  - Data storage solutions
  - API endpoint design
  - Authentication and authorization
  - Caching mechanisms
  - Security measures
- Implementation considerations:
  - Technology stack selection
  - Scalability planning
  - Data format standardization
  - Versioning strategies
- Security best practices for MCP servers
- Detailed code examples for core functionalities:
  - Context updates
  - Context retrieval
  - Context deletion
  - Context search
- Step-by-step tutorial for building a basic MCP server

### 6. AI Development Tools (`app/tools/`)

**Purpose**: Detail specific AI tools with practical usage guidance and MCP integration

**Structure**:
```
tools/
├── page.tsx          # Tools overview and comparison
├── cursor/           # Cursor details and usage
├── windsurf/         # Windsurf details and usage
├── claude/           # Claude AI capabilities and usage
└── openai/           # OpenAI Agent SDK usage and integration
```

**Key Content**:
- Comparative tool overview
- For each tool:
  - Technical capabilities and feature set
  - Advanced usage techniques
  - MCP integration points
  - Code examples showing practical usage
  - Configuration best practices
  - Comparison with similar tools
  - Real-world use cases

### 7. Learning Paths (`app/learning-paths/`)

**Purpose**: Provide structured learning journeys for different user personas

**Structure**:
```
learning-paths/
├── page.tsx               # Learning paths overview
├── junior-developer/      # Junior developer path
├── experienced-developer/ # Experienced developer path
└── technical-leader/      # Technical leader path
```

**Key Content**:
- Overview of available learning paths
- For each path:
  - Module-by-module breakdown
  - Learning objectives for each module
  - Recommended sequence and timeline
  - Links to relevant content sections
  - Progress tracking integration
  - Knowledge check quizzes

**Junior Developer Path Modules**:
1. Introduction to AI-Assisted Development
2. Understanding Model Context
3. Getting Started with MCP
4. Using AI Tools for Code Completion
5. Reviewing AI-Generated Code
6. Collaboration with AI Tools
7. Ethical Considerations

**Experienced Developer Path Modules**:
1. Advanced AI Tool Usage
2. Optimizing Model Context
3. Integrating AI with Existing Workflows
4. Testing Strategies for AI-Generated Code
5. Security and Privacy Best Practices
6. Building Custom AI Assistants
7. Troubleshooting and Debugging

**Technical Leader Path Modules**:
1. Strategic Planning for AI Integration
2. Choosing the Right Tools and Platforms
3. Team Training and Support
4. Policy and Governance
5. Performance Measurement
6. Scalability and Future Planning
7. Case Studies and Best Practices

### 8. Resources (`app/resources/`)

**Purpose**: Provide a comprehensive knowledge base and reference materials

**Structure**:
```
resources/
├── page.tsx                # Resources overview
├── knowledge-base/         # Cursor Rules for AI-Assisted Development
├── glossary/               # Terminology glossary
└── external-resources/     # Links to helpful external content
```

**Key Content**:
- Cursor Rules for AI-Assisted Development:
  - Model Context Management
  - Development Workflows
  - Code Quality & Testing
  - Security & Privacy
  - Project Architecture
  - Collaboration & Team Practices
  - AI Tools & Integration
  - Learning & Skill Development
- Comprehensive glossary of AI development terminology
- Curated external resources organized by topic

### 9. Contact (`app/contact/`)

**Purpose**: Provide ways for users to get help and offer feedback

**Structure**:
```
contact/
├── page.tsx          # Contact form and information
└── help/             # Help with screenshot uploads
```

**Key Content**:
- General contact form for feedback and questions
- Screenshot upload feature for technical assistance
- Privacy notice regarding handling of user data
- FAQ for common questions

## Interactive Features

### Chat Assistant
- Floating chat button accessible from any page
- AI-powered assistance for navigating the site and answering questions
- Screenshot upload capability for technical help
- Integration with MCP for context-aware responses

### Interactive Learning Timeline
- Visual representation of learning progress
- Customized based on selected learning path
- Gamified elements with achievements and badges
- Accessible from homepage and persistent across the site

### Code Playground
- Interactive environment for trying code examples
- Support for multiple languages
- Integration with AI tools for assistance
- Save and share functionality

## Design Guidelines

### Visual Identity
- Consistent use of the orangey-blue-purple color scheme
- Clean, modern interface with ample whitespace
- Code blocks with syntax highlighting
- Clear visual hierarchy for content organization

### Accessibility
- High contrast mode option
- Keyboard navigation support
- Screen reader compatibility
- Responsive design for all devices

## Implementation Priorities

### Phase 1: Foundation
1. Homepage with "The AI Dev Odyssey" concept
2. Introduction section
3. Understanding MCP section
4. Basic navigation and layout

### Phase 2: Core Content
1. Best Practices section
2. Building MCP Servers section
3. AI Tools section
4. Learning Paths framework

### Phase 3: Advanced Features
1. Resources section with Knowledge Base
2. Contact section with screenshot upload
3. Interactive Learning Timeline
4. Chat Assistant integration

## Technical Notes

### Content Management
- MDX for content with interactive elements
- Frontmatter for metadata and classification
- Component library for consistent UI elements

### Performance Considerations
- Static generation for documentation pages
- Image optimization
- Code splitting
- Efficient loading of interactive elements

## Conclusion

This document serves as the definitive guide for the AI Dev Education website structure. All development should align with this organization while allowing for iterative improvements based on user feedback and evolving content needs. 

---

## Cursor Rules Knowledge Base Structure

The Cursor Rules for AI-Assisted Development document will be implemented as a dedicated, interactive knowledge base section within the resources area of the site. This implementation prioritizes developer experience with quick access to relevant rules, practical examples, and filtering capabilities.

### Location

```
app/
└── resources/
    ├── page.tsx                # Resources overview 
    ├── knowledge-base/
    │   ├── page.tsx            # Knowledge base landing page
    │   └── cursor-rules/       # Cursor Rules section
    │       ├── page.tsx        # Main rules page with interactive features
    │       ├── [category]/     # Dynamic category routes
    │       │   └── page.tsx    # Category-specific pages
    │       └── [rule]/         # Dynamic rule routes
    │           └── page.tsx    # Individual rule detail pages
    ├── glossary/
    └── external-resources/
```

### Structure & Features

**Main Cursor Rules Page** (`resources/knowledge-base/cursor-rules/page.tsx`)

Purpose: Serve as an interactive portal to the Cursor Rules knowledge base with filtering and search capabilities.

Components:
1. **Introduction Section**
   - Brief overview of the purpose and value of Cursor Rules
   - How to use the knowledge base effectively

2. **Interactive Rule Explorer**
   - Dynamic filtering by:
     - Category (Model Context, Development Workflows, etc.)
     - Complexity level (Basic, Intermediate, Advanced)
     - Technology (MCP, Testing frameworks, etc.)
     - Application area (Frontend, Backend, Full-stack)
   - Full-text search functionality
   - Rule count indicators by category

3. **Category Navigation Cards**
   - Visual cards for each major category
   - Short description of category contents
   - Indication of rule count per category
   - Links to category pages

4. **Quick Reference Section**
   - Most frequently accessed rules
   - Recently updated rules
   - Rules by complexity level (easy starting points)

**Category Pages** (`resources/knowledge-base/cursor-rules/[category]/page.tsx`)

Purpose: Present rules within a specific category with greater context and related information.

Components:
1. **Category Overview**
   - Category description and importance
   - Key concepts within this category
   - Relationship to other categories

2. **Rule List**
   - Interactive, filterable list of all rules in the category
   - Rule cards with:
     - Rule name and description
     - Complexity indicator
     - Technologies involved
     - Expandable preview

3. **Practical Examples**
   - Key code examples relevant to the category
   - Before/after scenarios showing rule application
   - Real-world use cases

4. **Related Categories**
   - Links to related categories
   - Explanation of relationships between categories

**Individual Rule Pages** (`resources/knowledge-base/cursor-rules/[rule]/page.tsx`)

Purpose: Provide detailed information about a specific rule with practical implementation guidance.

Components:
1. **Rule Header**
   - Rule name and primary description
   - Metadata badge cluster (complexity, technology, application area)
   - Quick copy button for rule reference

2. **Implementation Details**
   - Step-by-step implementation instructions
   - Code examples with syntax highlighting
   - Interactive code snippets where applicable
   - Common pitfalls and how to avoid them

3. **Context & Applicability**
   - When to apply this rule
   - When not to apply this rule
   - Variations for different scenarios

4. **Related Rules**
   - Links to related rules
   - Explanation of relationships between rules
   - Potential conflicts with other rules

5. **Resources**
   - External documentation links
   - Tools that support this rule
   - Further reading suggestions

### Interactive Features

1. **Rule Filter System**
   - Multi-faceted filtering based on metadata
   - Save filter preferences
   - Share filtered views

2. **Code Example Interaction**
   - Copy button for code snippets
   - Syntax highlighting by language
   - Toggle between different implementation examples
   - Before/after comparison views

3. **Complexity Guide**
   - Visual indicators for rule complexity
   - Tooltips explaining complexity assessments
   - Suggested learning paths based on current skill level

4. **Bookmark System**
   - Save frequently used rules
   - Create custom rule collections
   - Export rule collections as PDFs or markdown

5. **Search Functionality**
   - Full-text search across all rules
   - Search history
   - Contextual search suggestions
   - Results filtered by relevance

### Mobile Experience

The knowledge base will be fully responsive with special consideration for developer workflows on smaller screens:

1. **Compact Navigation**
   - Collapsible category menu
   - Bottom navigation bar for essential functions
   - Swipe gestures for rule navigation

2. **Code Display**
   - Horizontal scrolling for code blocks
   - Font size adjustments
   - Syntax highlighting preserved
   - Copy functionality prominently available

3. **Filtering Optimizations**
   - Modal filter menu
   - Quick filter chips for common filters
   - Save filter preferences across sessions

### Integration with Learning Paths

The Cursor Rules knowledge base will integrate with the site's learning paths:

1. **Path References**
   - Learning paths will reference specific rules at appropriate points
   - Rules will indicate which learning path modules reference them

2. **Progress Tracking**
   - Mark rules as read/understood
   - Track progress through rule categories
   - Receive suggestions for next rules to review

3. **Skill Level Adaptation**
   - Content presentation adapts to the user's identified skill level
   - Additional context provided for beginners
   - More advanced connections shown for experienced users

### Implementation Priorities

1. **Phase 1: Core Structure**
   - Main knowledge base page with category navigation
   - Basic category pages with rule listings
   - Simple rule detail pages with core content

2. **Phase 2: Enhanced Interaction**
   - Filtering and search functionality
   - Code example interaction features
   - Mobile optimizations

3. **Phase 3: Advanced Features**
   - Bookmarking and custom collections
   - Learning path integration
   - Adaptive content based on skill level 