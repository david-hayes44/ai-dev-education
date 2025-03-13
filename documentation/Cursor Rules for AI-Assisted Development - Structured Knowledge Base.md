# Cursor Rules for AI-Assisted Development \- Structured Knowledge Base

## Table of Contents

1. [Model Context Management](#model-context-management)  
2. [Development Workflows](#development-workflows)  
3. [Code Quality & Testing](#code-quality--testing)  
4. [Security & Privacy](#security--privacy)  
5. [Project Architecture](#project-architecture)  
6. [Collaboration & Team Practices](#collaboration--team-practices)  
7. [AI Tools & Integration](#ai-tools--integration)  
8. [Learning & Skill Development](#learning--skill-development)

---

## Model Context Management

### Understanding Model Context

- **Rule name**: Context Definition and Management  
- **Description**: Define and manage model context as the information AI uses to generate responses, maintaining it according to MCP standards for consistency and relevance.  
- **Implementation**: Create and update context files for new features, ensuring AIs provide accurate suggestions.  
- **Applicable contexts**: All AI-assisted development projects.  
- **Related rules**: MCP Implementation, Shared Context Management  
- **Metadata**:  
  - Technology: MCP, AI models  
  - Complexity: Intermediate  
  - Application area: Full-stack

### Leveraging Context for Better Results

- **Rule name**: Context Enhancement Practices  
- **Description**: Provide sufficient context to improve AI outputs and reduce hallucinations.  
- **Implementation**:  
    
  \# Example of manually providing context  
    
  \# "Here's my current setup:   
    
  import requests  
    
  url \= 'api.example.com'  
    
  \# Write a function to fetch data from it."  
    
  \# Example of using MCP for context  
    
  \# "Use the \`requests\` version in my MCP context (2.25.1) to fetch JSON data."  
    
  import requests  
    
  def fetch\_json(url):  
    
      response \= requests.get(url)  
    
      return response.json()  
    
- **Applicable contexts**: When requesting code generation or assistance from AI tools.  
- **Related rules**: Understanding Model Context, AI Tool Configuration  
- **Metadata**:  
  - Technology: All AI-assisted tools  
  - Complexity: Intermediate  
  - Application area: Full-stack

### Shared Context Management

- **Rule name**: Team Context Synchronization  
- **Description**: Maintain a centralized context management system for team collaboration, ensuring all members benefit from shared knowledge.  
- **Implementation**: Use a shared context file in version control, updated with new features.  
- **Applicable contexts**: Team-based AI-assisted development.  
- **Related rules**: Collaboration Workflows, Version Control for AI Contributions  
- **Metadata**:  
  - Technology: Version control, MCP  
  - Complexity: Intermediate  
  - Application area: Full-stack

### MCP Implementation

- **Rule name**: MCP Integration Standards  
- **Description**: Set up and configure MCP within projects to manage model context effectively.  
- **Implementation**: Create context files, establish API endpoints for context sharing, and adhere to MCP standards.  
- **Applicable contexts**: Projects requiring standardized context management.  
- **Related rules**: Context Definition and Management, API Integration  
- **Metadata**:  
  - Technology: MCP, API development  
  - Complexity: Advanced  
  - Application area: Full-stack

---

## Development Workflows

### Exploratory Coding

- **Rule name**: Prototyping with AI  
- **Description**: Use LLMs for quick experiments when exploring unfamiliar technologies.  
- **Implementation**:  
  1. Request options for approaching a problem  
  2. Ask for specific prototype implementation  
  3. Iterate on the prototype for learning  
- **Applicable contexts**: Learning new languages/libraries, feasibility testing.  
- **Related rules**: Iteration Practices, Reviewing AI-Generated Code  
- **Metadata**:  
  - Technology: All AI coding tools  
  - Complexity: Basic  
  - Application area: Full-stack

### Production Coding

- **Rule name**: Building Reliable AI-Assisted Code  
- **Description**: Use AI tools for production code with precise instructions and thorough testing.  
- **Implementation**:  
    
  \# Example of specific AI request:  
    
  \# "Write a Python function to validate an email address. It should return   
    
  \# True for valid emails (e.g., user@domain.com) and False otherwise,   
    
  \# using regex for standard email rules."  
    
  import re  
    
  def is\_valid\_email(email):  
    
      pattern \= r'^\[a-zA-Z0-9\_.+-\]+@\[a-zA-Z0-9-\]+\\.\[a-zA-Z0-9-.\]+$'  
    
      return bool(re.match(pattern, email))  
    
- **Applicable contexts**: Development of code for production environments.  
- **Related rules**: Testing Strategies, Error Handling Standards  
- **Metadata**:  
  - Technology: All programming languages  
  - Complexity: Intermediate  
  - Application area: Full-stack

### Iteration Practices

- **Rule name**: Refining AI Outputs  
- **Description**: Treat AI outputs as drafts that require refinement through iteration.  
- **Implementation**:  
  1. Fix errors: "This crashes with None input. Add a check for that."  
  2. Improve code: "Make this faster with a generator instead of a list."  
- **Applicable contexts**: All AI-generated code.  
- **Related rules**: Code Review Process, Testing Strategies  
- **Metadata**:  
  - Technology: All AI coding tools  
  - Complexity: Intermediate  
  - Application area: Full-stack

### Task Assignment and Management

- **Rule name**: AI-Task Allocation  
- **Description**: Strategically assign tasks to AI tools with clear objectives and expectations.  
- **Implementation**: Break down complex tasks into manageable steps and use MCP to share task context.  
- **Applicable contexts**: Team-based development with AI assistance.  
- **Related rules**: Communication Protocols, Shared Context Management  
- **Metadata**:  
  - Technology: Project management tools, MCP  
  - Complexity: Intermediate  
  - Application area: Full-stack

---

## Code Quality & Testing

### Reviewing AI-Generated Code

- **Rule name**: AI Code Review Standards  
- **Description**: Thoroughly review AI-generated code for accuracy, efficiency, maintainability, and security.  
- **Implementation**:  
    
  \# AI-generated code:  
    
  def sort\_numbers(numbers):  
    
      return sorted(numbers)  
    
  \# After review and modification:  
    
  def sort\_numbers(numbers, reverse=False):  
    
      if not isinstance(numbers, list):  
    
          raise TypeError("Input must be a list")  
    
      return sorted(numbers, reverse=reverse)  
    
- **Applicable contexts**: All AI-generated code before integration.  
- **Related rules**: Testing Strategies, Error Handling Standards  
- **Metadata**:  
  - Technology: All programming languages  
  - Complexity: Intermediate  
  - Application area: Full-stack

### Testing Strategies

- **Rule name**: Comprehensive Testing Framework  
- **Description**: Implement testing strategies specifically tailored for AI-generated code.  
- **Implementation**: Create unit tests for functions, integration tests for compatibility, and automation for continuous feedback.  
- **Applicable contexts**: All AI-generated code.  
- **Related rules**: Test-Driven Development, Error Handling Standards  
- **Metadata**:  
  - Technology: Testing frameworks  
  - Complexity: Intermediate  
  - Application area: Full-stack

### Test-Driven Development with AI

- **Rule name**: AI-Assisted TDD  
- **Description**: Use Test-Driven Development approach when working with AI tools.  
- **Implementation**: Define features, plan tests, create tests, implement with AI assistance, refactor, and verify.  
- **Applicable contexts**: Projects using TDD methodology.  
- **Related rules**: Testing Strategies, AI-Specific Testing  
- **Metadata**:  
  - Technology: Testing frameworks  
  - Complexity: Advanced  
  - Application area: Full-stack

### AI-Specific Testing Considerations

- **Rule name**: AI-Generated Code Testing Guidelines  
- **Description**: Identify and test for unique aspects of AI-generated code including logical errors and context alignment.  
- **Implementation**: Verify code doesn't contain embedded biases or security vulnerabilities.  
- **Applicable contexts**: All AI-generated code.  
- **Related rules**: Security Best Practices, Testing Strategies  
- **Metadata**:  
  - Technology: Testing frameworks  
  - Complexity: Advanced  
  - Application area: Full-stack

### Performance and Scalability Testing

- **Rule name**: AI Code Performance Verification  
- **Description**: Ensure AI-generated code meets performance and scalability requirements.  
- **Implementation**: Benchmark AI-generated functions, measure page load times, and test interaction smoothness.  
- **Applicable contexts**: Performance-critical applications.  
- **Related rules**: Testing Strategies, Code Review Process  
- **Metadata**:  
  - Technology: Performance testing tools  
  - Complexity: Advanced  
  - Application area: Full-stack

### Documentation and Test Coverage

- **Rule name**: Testing Documentation Standards  
- **Description**: Maintain thorough documentation and high test coverage for AI-generated code.  
- **Implementation**: Document tests for each feature and track coverage metrics.  
- **Applicable contexts**: All AI-assisted projects.  
- **Related rules**: Documentation Practices, Testing Strategies  
- **Metadata**:  
  - Technology: Documentation tools, Coverage tools  
  - Complexity: Intermediate  
  - Application area: Full-stack

---

## Security & Privacy

### Privacy and Security Considerations

- **Rule name**: Data Protection in AI Development  
- **Description**: Implement security practices for AI tools, especially external services, to protect sensitive data.  
- **Implementation**: Use secure connections (HTTPS), minimize data shared, review terms of service, implement access controls.  
- **Applicable contexts**: All AI-assisted development projects.  
- **Related rules**: Secure Coding Standards  
- **Metadata**:  
  - Technology: Security frameworks  
  - Complexity: Advanced  
  - Application area: Full-stack

### Handling LLM Hallucinations

- **Rule name**: Hallucination Management  
- **Description**: Recognize and address hallucinations in AI-generated code through verification procedures.  
- **Implementation**:  
  1. Run the code to detect immediate failures  
  2. Double-check references in documentation  
  3. Maintain comprehensive testing pipelines  
- **Applicable contexts**: All AI-generated code.  
- **Related rules**: Testing Strategies, Code Review Process  
- **Metadata**:  
  - Technology: All AI coding tools  
  - Complexity: Intermediate  
  - Application area: Full-stack

### Secure Coding Standards

- **Rule name**: Security Guidelines for AI-Generated Code  
- **Description**: Ensure AI-generated code follows security best practices to prevent vulnerabilities.  
- **Implementation**: Implement input validation, protect against SQL injection, XSS, and other common vulnerabilities.  
- **Applicable contexts**: All production code.  
- **Related rules**: Code Review Process, Testing Strategies  
- **Metadata**:  
  - Technology: Security frameworks  
  - Complexity: Advanced  
  - Application area: Full-stack

---

## Project Architecture

### Project Structure for AI Tools

- **Rule name**: AI-Optimized Project Organization  
- **Description**: Organize project directory and files to support AI tool integration.  
- **Implementation**: Create dedicated directories for AI-generated code (e.g., `ai_generated/`) to streamline reviews and version control.  
- **Applicable contexts**: Projects using AI assistance significantly.  
- **Related rules**: Version Control for AI Contributions, Tech Stack Selection  
- **Metadata**:  
  - Technology: Project structure tools  
  - Complexity: Basic  
  - Application area: Full-stack

### Tech Stack Selection

- **Rule name**: AI-Compatible Technology Selection  
- **Description**: Choose technologies that support AI integration effectively.  
- **Implementation**: Select frameworks with built-in AI capabilities or well-documented for AI tools.  
- **Applicable contexts**: New projects or technology migrations.  
- **Related rules**: AI Tool Configuration, MCP Implementation  
- **Metadata**:  
  - Technology: Next.js, TypeScript, React  
  - Complexity: Intermediate  
  - Application area: Full-stack

### API Integration

- **Rule name**: API Endpoint Design for Context Management  
- **Description**: Design RESTful endpoints for CRUD operations on context data.  
- **Implementation**:  
    
  \# Example using Flask:  
    
  @app.route('/context', methods=\['POST'\])  
    
  def update\_context():  
    
      user\_id \= request.json\['user\_id'\]  
    
      context\_data \= request.json\['context\_data'\]  
    
      \# Process and store context data  
    
      return jsonify({'message': 'Context updated successfully'})  
    
- **Applicable contexts**: Applications requiring context management.  
- **Related rules**: MCP Implementation, Security Best Practices  
- **Metadata**:  
  - Technology: API frameworks  
  - Complexity: Advanced  
  - Application area: Backend

### Architecture Components

- **Rule name**: MCP Server Architecture  
- **Description**: Implement essential components for an MCP server.  
- **Implementation**: Include data storage (databases), API endpoints, authentication, caching, and security measures.  
- **Applicable contexts**: Projects implementing MCP servers.  
- **Related rules**: MCP Implementation, API Integration  
- **Metadata**:  
  - Technology: Database systems, API frameworks  
  - Complexity: Advanced  
  - Application area: Backend

### Implementation Considerations

- **Rule name**: MCP Server Implementation Guidelines  
- **Description**: Address key considerations when implementing an MCP server.  
- **Implementation**: Consider technology stack choices, scalability, data format standardization, and versioning.  
- **Applicable contexts**: Projects implementing MCP servers.  
- **Related rules**: Architecture Components, Scalability and Performance  
- **Metadata**:  
  - Technology: Python (Flask, Django), Node.js (Express)  
  - Complexity: Advanced  
  - Application area: Backend

---

## Collaboration & Team Practices

### Collaboration Workflows

- **Rule name**: AI-Enhanced Team Collaboration  
- **Description**: Implement effective team workflows for AI tool usage to maintain consistency and efficiency.  
- **Implementation**: Use centralized context management, role-based access, regular updates, and clear communication.  
- **Applicable contexts**: Team-based AI-assisted development.  
- **Related rules**: Shared Context Management, Communication Protocols  
- **Metadata**:  
  - Technology: Collaboration tools, MCP  
  - Complexity: Intermediate  
  - Application area: Full-stack

### Defining Roles and Responsibilities

- **Rule name**: AI Collaboration Role Assignment  
- **Description**: Clearly define team roles when working with AI tools.  
- **Implementation**: Assign specific responsibilities for context management, code review, and maintenance.  
- **Applicable contexts**: Team-based AI-assisted development.  
- **Related rules**: Communication Protocols, Task Assignment  
- **Metadata**:  
  - Technology: Team management tools  
  - Complexity: Intermediate  
  - Application area: Full-stack

### Communication Protocols

- **Rule name**: AI Interaction Guidelines  
- **Description**: Establish protocols for communicating with AI tools and about AI-generated content.  
- **Implementation**: Create guidelines for prompt engineering and feedback loops, including regular team discussions about AI outputs.  
- **Applicable contexts**: Team-based AI-assisted development.  
- **Related rules**: Task Assignment, Defining Roles  
- **Metadata**:  
  - Technology: Communication tools  
  - Complexity: Intermediate  
  - Application area: Full-stack

### Review and Validation Processes

- **Rule name**: AI-Generated Code Review Process  
- **Description**: Implement detailed procedures for reviewing and validating AI-generated code.  
- **Implementation**: Use pair programming with AI, code reviews by humans, and automated testing, leveraging MCP context for review alignment.  
- **Applicable contexts**: All AI-generated code.  
- **Related rules**: Testing Strategies, Reviewing AI-Generated Code  
- **Metadata**:  
  - Technology: Code review tools  
  - Complexity: Advanced  
  - Application area: Full-stack

### Version Control and AI Contributions

- **Rule name**: AI Code Version Management  
- **Description**: Define practices for managing AI-generated code in version control systems.  
- **Implementation**: Use separate branches (e.g., `feature/ai-code`) or tags for AI contributions, with clear review and merge processes.  
- **Applicable contexts**: Projects using version control with AI assistance.  
- **Related rules**: Project Structure, Review Process  
- **Metadata**:  
  - Technology: Git, GitHub  
  - Complexity: Intermediate  
  - Application area: Full-stack

---

## AI Tools & Integration

### AI Tool Configuration

- **Rule name**: Tool-Specific Setup Guidelines  
- **Description**: Configure AI tools like Cursor or Windsurf within projects for optimal performance.  
- **Implementation**: Set up API keys, context files, and custom prompts specific to the project.  
- **Applicable contexts**: Projects using specific AI coding assistants.  
- **Related rules**: MCP Implementation, Project Structure  
- **Metadata**:  
  - Technology: Cursor, Windsurf, VS Code extensions  
  - Complexity: Intermediate  
  - Application area: Development tools

### Cursor Integration

- **Rule name**: Cursor Configuration Best Practices  
- **Description**: Optimize Cursor for code completion, generation, error detection, and refactoring.  
- **Implementation**:  
    
  \# Example of API usage:  
    
  curl \-X POST https://api.cursor.sh/generate \-d '{"prompt": "Generate a sorting function"}'  
    
- **Applicable contexts**: Projects using Cursor.  
- **Related rules**: AI Tool Configuration, Context Enhancement  
- **Metadata**:  
  - Technology: Cursor, VS Code  
  - Complexity: Intermediate  
  - Application area: Development tools

### Windsurf Integration

- **Rule name**: Windsurf Implementation Standards  
- **Description**: Leverage Windsurf capabilities for code completion, generation, explanation, and error detection.  
- **Implementation**:  
    
  // Configuring VS Code extension  
    
  "settings.json": {"windsurf.context": "mcp://project/context"}  
    
- **Applicable contexts**: Projects using Windsurf.  
- **Related rules**: AI Tool Configuration, Context Enhancement  
- **Metadata**:  
  - Technology: Windsurf, VS Code, JetBrains IDEs  
  - Complexity: Intermediate  
  - Application area: Development tools

### Claude Integration

- **Rule name**: Claude API Implementation  
- **Description**: Utilize Claude for text completion, code generation, debugging, and answering programming questions.  
- **Implementation**:  
    
  \# Generate a function:  
    
  curl \-X POST https://api.anthropic.com/v1/complete \-d '{"prompt": "Write a Python function to calculate factorial", "model": "claude-3"}'  
    
- **Applicable contexts**: Projects using Claude.  
- **Related rules**: Context Enhancement, Prompt Engineering  
- **Metadata**:  
  - Technology: Anthropic Claude API  
  - Complexity: Advanced  
  - Application area: Full-stack

### OpenAI Agent SDK Integration

- **Rule name**: Custom AI Assistant Creation  
- **Description**: Build custom AI assistants with specific instructions, tools, and external API integration.  
- **Implementation**:  
    
  \# Create an assistant:  
    
  curl \-X POST https://api.openai.com/v1/assistants \-d '{"name": "Code Helper", "instructions": "Help with coding tasks"}'  
    
- **Applicable contexts**: Projects requiring specialized AI assistants.  
- **Related rules**: Context Enhancement, Prompt Engineering  
- **Metadata**:  
  - Technology: OpenAI API  
  - Complexity: Advanced  
  - Application area: Full-stack

---

## Learning & Skill Development

### Junior Developer Learning Path

- **Rule name**: AI Development Foundations  
- **Description**: Follow a structured learning path for junior developers to develop AI-assisted development skills.  
- **Implementation**: Progress through 7 modules from AI basics to ethics:  
  1. Introduction to AI-Assisted Development  
  2. Understanding Model Context  
  3. Getting Started with MCP  
  4. Using AI Tools for Code Completion  
  5. Reviewing AI-Generated Code  
  6. Collaboration with AI Tools  
  7. Ethical Considerations  
- **Applicable contexts**: Junior developers new to AI-assisted development.  
- **Related rules**: Reviewing AI-Generated Code, Collaboration Workflows  
- **Metadata**:  
  - Technology: All AI development tools  
  - Complexity: Basic to Intermediate  
  - Application area: Full-stack

### Experienced Developer Learning Path

- **Rule name**: Advanced AI Development Skills  
- **Description**: Follow a structured learning path for experienced developers to master advanced AI-assisted development.  
- **Implementation**: Progress through 7 advanced modules:  
  1. Advanced AI Tool Usage  
  2. Optimizing Model Context  
  3. Integrating AI with Existing Workflows  
  4. Testing Strategies for AI-Generated Code  
  5. Security and Privacy Best Practices  
  6. Building Custom AI Assistants  
  7. Troubleshooting and Debugging  
- **Applicable contexts**: Experienced developers looking to advance AI skills.  
- **Related rules**: Testing Strategies, Custom AI Assistant Creation  
- **Metadata**:  
  - Technology: All AI development tools  
  - Complexity: Intermediate to Advanced  
  - Application area: Full-stack

### Technical Leader Learning Path

- **Rule name**: AI Strategy and Governance  
- **Description**: Follow a structured learning path for technical leaders to implement AI strategy and governance.  
- **Implementation**: Progress through 7 leadership-focused modules:  
  1. Strategic Planning for AI Integration  
  2. Choosing the Right Tools and Platforms  
  3. Team Training and Support  
  4. Policy and Governance  
  5. Performance Measurement  
  6. Scalability and Future Planning  
  7. Case Studies and Best Practices  
- **Applicable contexts**: Technical leaders implementing AI strategy.  
- **Related rules**: Communication Protocols, Policy and Governance  
- **Metadata**:  
  - Technology: All AI development tools  
  - Complexity: Advanced  
  - Application area: Leadership

---

## Additional Rules

### Consistency and Readability

- **Rule name**: AI-Compatible Coding Style  
- **Description**: Promote coding standards that benefit both human developers and AI tools.  
- **Implementation**: Use ES6+ syntax, clear naming conventions (camelCase for JavaScript, kebab-case for CSS), and consistent indentation (2 spaces).  
- **Applicable contexts**: All code, especially AI-generated.  
- **Related rules**: Documentation Practices, Naming Conventions  
- **Metadata**:  
  - Technology: All programming languages  
  - Complexity: Basic  
  - Application area: Full-stack

### Documentation Practices

- **Rule name**: AI-Enhanced Documentation  
- **Description**: Implement detailed comments and documentation to help AI tools understand the codebase.  
- **Implementation**: Use JSDoc for JavaScript and block comments for CSS, explaining complex logic to aid AI comprehension.  
- **Applicable contexts**: All code, especially complex logic.  
- **Related rules**: Consistency and Readability, Naming Conventions  
- **Metadata**:  
  - Technology: Documentation tools  
  - Complexity: Intermediate  
  - Application area: Full-stack

### Naming Conventions

- **Rule name**: AI-Friendly Naming Standards  
- **Description**: Establish clear and descriptive naming conventions for variables, functions, and classes.  
- **Implementation**: Use descriptive names like `calculateTotalPrice` instead of vague names like `calc` or `process`.  
- **Applicable contexts**: All code.  
- **Related rules**: Consistency and Readability, Documentation Practices  
- **Metadata**:  
  - Technology: All programming languages  
  - Complexity: Basic  
  - Application area: Full-stack

### Error Handling and Edge Cases

- **Rule name**: Robust Error Management  
- **Description**: Implement comprehensive error handling in AI-generated code.  
- **Implementation**: Use try-catch blocks, implement fallbacks, and test edge cases thoroughly.  
- **Applicable contexts**: All production code.  
- **Related rules**: Testing Strategies, Security Best Practices  
- **Metadata**:  
  - Technology: All programming languages  
  - Complexity: Intermediate  
  - Application area: Full-stack

## Contradictions and Redundancies

1. **Exploratory vs. Production Coding**: The rules for exploratory coding encourage quick experimentation, while production coding emphasizes precision. This isn't necessarily a contradiction but requires clear differentiation in when to apply each approach.  
     
2. **Manual Context vs. MCP**: There are overlapping approaches to providing context—manually in prompts or through MCP. Projects should specify which approach to use for consistency.  
     
3. **Tool-Specific vs. General Guidelines**: Some rules are specific to tools (Cursor, Windsurf) while others are general. Projects should clarify which tool-specific rules apply when multiple AI tools are used together.  
     
4. **Testing Redundancies**: There's some overlap between "Testing Strategies," "AI-Specific Testing," and "Test-Driven Development." These could be consolidated into a clearer testing hierarchy.

