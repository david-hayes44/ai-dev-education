[![CodeGuide](/codeguide-backdrop.svg)](https://codeguide.dev)

# AI-Dev Education Platform

A modern, interactive learning environment built with Next.js that aims to educate developers on AI-assisted development and the Model Context Protocol (MCP).

## Features

- **Educational Content**: Structured learning paths on AI-assisted development and MCP
- **Interactive Chat**: AI assistant to help answer questions about AI-Dev and MCP concepts
- **Modern UI**: Responsive design with dark/light mode support
- **Firebase Integration**: Ready for future dynamic content and chat persistence
- **Browser Automation**: Integration with Puppeteer MCP server for browser control

## Tech Stack

- **Frontend**: Next.js 14+ with App Router, React, TypeScript
- **Styling**: Tailwind CSS with custom theming
- **Backend**: Firebase (Firestore)
- **AI Integration**: OpenRouter API (planned)
- **Content Rendering**: react-markdown for formatted content
- **Browser Automation**: Puppeteer MCP server

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Firebase account (for future integration)

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

4. Update the environment variables in `.env.local` with your Firebase and OpenRouter credentials.

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

Available browser automation features:
- Navigate to URLs
- Click elements
- Type text
- Extract content
- Take screenshots
- Evaluate JavaScript code

Visit the Browser Automation page at `/browser-automation` to try out these features.
