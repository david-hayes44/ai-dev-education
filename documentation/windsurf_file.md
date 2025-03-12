---

# .windsurfrules

## Project Overview
- **Type:** windsurf_file
- **Description:** The AI-Dev Education Platform is a modern, interactive learning environment built with Next.js 14+ using the App Router. It is designed to educate senior developers on AI-assisted development and the Model Context Protocol (MCP) with a clean, modular structure combining static educational content and a dynamic AI chat assistant.
- **Primary Goal:** "The project is being built to bridge the gap between traditional development education and modern AI-assisted techniques. Key success criteria include a clean, modular architecture, an engaging and accessible user interface, and the readiness for future dynamic integrations, such as a fully functional API-driven chat experience using OpenRouter." 

## Project Structure
### Framework-Specific Routing
- **Directory Rules:**
  - Next.js 14 (App Router): Enforce use of the `app/` directory with nested route folders following the `app/[route]/page.tsx` conventions.
  - Example 1: "Next.js 14 (App Router)" → `app/[route]/page.tsx` conventions
  - Example 2: "Next.js (Pages Router)" → `pages/[route].tsx` pattern (not applicable here)
  - Example 3: "React Router 6" → `src/routes/` with `createBrowserRouter` (not applicable here)

### Core Directories
- **Versioned Structure:**
  - app/api: Next.js 14 API routes with Route Handlers, for endpoints such as chat interactions.
  - app/(educational): Contains structured educational pages (e.g., ai-dev-work, building-mcp-servers) organized as nested routes.

### Key Files
- **Stack-Versioned Patterns:**
  - app/layout.tsx: Next.js 14 root layout managing global styling, theming, and navigation.
  - app/chat/FloatingChat.tsx: Houses the stack-specific implementation of the floating chat widget composed of ChatContainer, ChatInput, and ChatMessage components.

## Tech Stack Rules
- **Version Enforcement:**
  - next@14: App Router is required; usage of `pages/` directory patterns is prohibited.

## PRD Compliance
- **Non-Negotiable:**
  - "The project is being built to bridge the gap between traditional development education and modern AI-assisted techniques. Key success criteria include a clean, modular architecture, an engaging and accessible user interface, and the readiness for future dynamic integrations, such as a fully functional API-driven chat experience using OpenRouter." 

## App Flow Integration
- **Stack-Aligned Flow:**
  - Example: "Next.js 14 Chat Interaction Flow → `app/chat/FloatingChat.tsx` implements a toggleable chat interface using static placeholder data with a clear separation of UI components, ready to integrate server actions and persistent chat history."

---

### Input Context (Priority Order):
1. techStackDoc (Next.js 14, Tailwind CSS, TypeScript, OpenRouter API integration, react-markdown, lucide-react)
2. prd (Version-dependent requirements for a modular educational platform with AI chat assistant)
3. appFlow (Route-to-component mapping for landing, educational pages, and toggleable chat widget)
4. answers (Selected tools and guidance on UI/UX, error handling, and performance criteria)

### Rules:
- Derive folder/file patterns **directly** from techStackDoc versions.
- If Next.js 14 App Router: Enforce `app/` directory with nested route folders.
- If Pages Router: Use `pages/*.tsx` flat structure.
- Mirror this logic for React Router, SvelteKit, etc.
- Never mix version patterns (e.g., no `pages/` in App Router projects).
