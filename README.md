[![CodeGuide](/codeguide-backdrop.svg)](https://codeguide.dev)

# AI-Dev Education Platform

A modern, interactive learning environment built with Next.js that aims to educate developers on AI-assisted development and the Model Context Protocol (MCP).

## Features

- **Educational Content**: Structured learning paths on AI-assisted development and MCP
- **Interactive Chat**: AI assistant to help answer questions about AI-Dev and MCP concepts
- **Modern UI**: Responsive design with dark/light mode support
- **Supabase Integration**: Database, authentication, and storage
- **Browser Automation**: Integration with Puppeteer MCP server for browser control

## Tech Stack

- **Frontend**: Next.js 14+ with App Router, React, TypeScript
- **Styling**: Tailwind CSS with custom theming
- **Backend**: Supabase (PostgreSQL)
- **AI Integration**: OpenRouter API (planned)
- **Content Rendering**: react-markdown for formatted content
- **Browser Automation**: Puppeteer MCP server

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/ai-dev-education-platform.git
   cd ai-dev-education-platform
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file based on `.env.example`:
   ```bash
   cp .env.example .env.local
   ```

4. Update the environment variables in `.env.local` with your Supabase and OpenRouter credentials.

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

- `app/`: Next.js App Router pages and layouts
- `components/`: Reusable React components
  - `chat/`: Chat-related components
  - `layout/`: Layout components (header, footer, etc.)
  - `ui/`: UI components (buttons, inputs, etc.)
- `hooks/`: Custom React hooks
- `lib/`: Utility functions and API clients
- `mcp-servers/`: MCP server configurations
  - `configs/`: Configuration files for MCP servers
- `public/`: Static assets
- `styles/`: Global styles

## Educational Content

The platform covers the following topics:

- **AI-Dev Concepts**: Introduction to AI-assisted development
- **MCP Guides**: Understanding the Model Context Protocol
- **Integration**: Integrating AI tools into development workflows
- **Building MCP Servers**: Creating servers that implement MCP
- **Best Practices**: Guidelines for effective AI-assisted development

## Future Enhancements

- Full OpenRouter API integration for dynamic chat responses
- User authentication and personalized learning paths
- Advanced state management for persistent chat history
- Interactive code playgrounds for hands-on learning

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Documentation Setup

To implement the generated documentation from CodeGuide:

1. Create a `documentation` folder in the root directory:

   ```bash
   mkdir documentation
   ```

2. Place all generated markdown files from CodeGuide in this directory:

   ```bash
   # Example structure
   documentation/
   ├── project_requirements_document.md
   ├── app_flow_document.md
   ├── frontend_guideline_document.md
   └── backend_structure_document.md
   ```

3. These documentation files will be automatically tracked by git and can be used as a reference for your project's features and implementation details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## MCP Servers

The platform includes integration with Model Context Protocol (MCP) servers:

### Puppeteer MCP Server

For browser automation capabilities, the platform integrates with the Puppeteer MCP server.

To run the Puppeteer MCP server:

```bash
npm run mcp:puppeteer
```

This will start the Puppeteer MCP server on port 5004 (configurable in `mcp-servers/configs/puppeteer-config.json`).

Alternatively, you can install and run the Puppeteer MCP server directly:

```bash
# Using npx (recommended)
npx -y @modelcontextprotocol/server-puppeteer

# Or install globally
npm install -g @modelcontextprotocol/server-puppeteer
```

### Simple Puppeteer Server

We've also implemented a simplified Express-based Puppeteer server that provides the same core functionality with improved debugging capabilities. To use this server:

```bash
node simple-puppeteer-server.js
```

This will start the Simple Puppeteer server on port 5004 with a visible browser instance. The server provides:

- Basic browser automation (navigation, clicking, typing, screenshots)
- Custom JavaScript execution for advanced operations
- DOM structure analysis
- CSS style inspection
- Improved error handling

For detailed documentation on the Simple Puppeteer server, see [documentation/puppeteer_integration_guide.md](documentation/puppeteer_integration_guide.md).

#### Docker Setup

You can also run the Puppeteer MCP server using Docker:
```bash
docker build -t mcp/puppeteer -f https://raw.githubusercontent.com/modelcontextprotocol/servers/main/src/puppeteer/Dockerfile .
```

2. Run the Docker container:
```bash
docker run -i --rm --init -e DOCKER_CONTAINER=true -p 5004:5004 mcp/puppeteer
```

Or use the provided docker-compose.yml file:
```bash
docker-compose up puppeteer-mcp
```

Available browser automation features:
- Navigate to URLs
- Click elements
- Type text
- Extract content
- Take screenshots
- Evaluate JavaScript code
- Analyze DOM structure
- Inspect CSS styles

Visit the Browser Automation page at `/browser-automation` to try out these features.

# AI-Dev Education - Enhanced Chat Assistant

## Overview

The AI-Dev Education platform has been enhanced with a more sophisticated chat assistant that provides contextual help, navigation assistance, and an improved user experience. This README documents the key improvements made to the chat system.

## Key Features

### 1. Enhanced Navigation System

The navigation system now allows users to navigate to specific content using natural language:

- **Natural Language Navigation**
  - Users can ask navigation questions in plain language (e.g., "Take me to the MCP architecture section")
  - The system detects navigation intents and distinguishes them from information requests
  - Direct routing to the most relevant page and section based on user queries
  - Auto-switching between chat and navigation interfaces based on detected intent

- **Section-Level Navigation**
  - Deep linking to specific sections within documentation pages
  - Topic-to-section mapping for precise navigation
  - Visual cues to highlight the navigated section

### 2. Contextual Chat Suggestions

The chat assistant now provides contextual suggestions based on the conversation:

- **Resource Recommendations**
  - Clickable page resource suggestions within chat responses
  - Tailored resource links based on conversation context
  - Inline previews of suggested resources

- **Follow-up Question Prompts**
  - Smart suggestion chips for related questions
  - "Learn more" options that expand on current topics
  - Context-aware follow-up questions based on user expertise level
  - Single-click to expand on complex topics

### 3. Unified Experience Improvements

The chat and navigation interfaces are now more integrated:

- **Tab Synchronization**
  - Automatic switching between chat/navigation tabs based on detected intent
  - Smooth transitions with context preservation between modes
  - Shared context between navigation and Q&A functions
  - Visual cues when switching between modes

- **Developer-Centric Experience**
  - Enhanced recognition for technical terminology
  - Improved code snippet support
  - Better handling of programming concepts and frameworks

## Technical Implementation

The enhancements were implemented through the following components:

- **Navigation Context**: Enhanced with sophisticated intent detection and section mapping
- **Chat Service**: Extended with methods for recommendations and follow-up questions
- **API Routes**: Improved to detect intents and provide contextual responses
- **UI Components**: Updated for a more integrated chat and navigation experience

## Usage

The chat assistant can be accessed through the floating chat button in the bottom right corner of the screen. Users can:

1. Type questions in natural language to get information
2. Ask navigation questions to be directed to relevant content
3. Click on suggested resources to explore related topics
4. Use follow-up question prompts to continue the conversation

## Future Improvements

Planned future enhancements include:

- Personalized recommendations based on user history
- Enhanced code snippet handling and syntax highlighting
- More sophisticated navigation intent detection
- Improved integration with custom user content

## Contributing

Contributions to the AI-Dev Education platform are welcome. Please see the CONTRIBUTING.md file for guidelines.
