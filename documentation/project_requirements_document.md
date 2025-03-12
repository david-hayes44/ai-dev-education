# AI-Dev Education Platform - Project Requirements Document

## 1. Project Overview

The AI-Dev Education Platform is a modern, interactive learning environment built with Next.js that aims to educate developers on AI-assisted development and the Model Context Protocol (MCP). This platform combines structured educational content with an AI-driven chat assistant that demonstrates MCP principles. By offering both static content pages with embedded code examples and a dynamic chat interface, the platform guides senior developers who are new to using AI in development toward a better grasp of AI integration techniques, ensuring that they can confidently adopt advanced methods in their technical work.

The project is being built to bridge the gap between traditional development education and modern AI-assisted techniques. Key success criteria include a clean, modular architecture, an engaging and accessible user interface, and the readiness for future dynamic integrations, such as a fully functional API-driven chat experience using OpenRouter. Ultimately, the platform should serve both as an educational tool and a springboard for evolving the chat functionalities in subsequent versions.

## 2. In-Scope vs. Out-of-Scope

**In-Scope:**

*   Development of a landing page with clear navigation for educational content.
*   Creation of static educational content pages (e.g., AI-Dev content and MCP guides) with interactive code examples.
*   Implementation of a floating AI chat widget with modular components (Chat Container, Chat Input, Chat Message, Floating Chat) using placeholder static data.
*   Integration of fundamental design elements using Tailwind CSS, including dark and light theme support following the provided color schemes.
*   Basic setup for OpenRouter API integration via a dedicated library file, even though it is not actively connected yet.
*   Minimal state management for toggling the chat widget and handling dummy chat interactions.
*   Deployment configurations that ensure compatibility with platforms like Vercel.

**Out-of-Scope:**

*   Full API integration with OpenRouter, including real-time data and error handling for API key issues.
*   Advanced state management for persistent chat history storage beyond localStorage (to be developed in future iterations).
*   User authentication or role-based access as the platform is currently open and does not manage user accounts.
*   Integration of any further services like analytics, payment gateways, or CMS systems for dynamic content management.
*   Enhanced real-time features in the chat interface such as notifications or live updates; these will be considered for future releases.

## 3. User Flow

When a user lands on the platform, they are greeted by a responsive and inviting landing page that sets the tone with a modern design, clear messaging, and navigational menus that highlight the educational purpose. The user can immediately connect with the platform’s focus by either exploring the educational resources or activating the AI chat assistant via a clearly marked floating widget. The navigation is intuitive, with easy access to educational content pages that include hands-on guides and interactive examples, easing the exploration of complex AI concepts.

Once a user engages with the platform, they can seamlessly move from reviewing static, structured content to interacting with the chat assistant. By clicking the floating chat button, a chat window pops up where the user sees a pre-rendered conversation with placeholder messages formatted for clarity. Although the chat currently relies on minimal local state management and dummy data, the structure allows the user to ask questions and view AI-generated responses in a format that is easy to understand and designed for future dynamic enhancements. This flow ensures a smooth transition between learning and interactive engagement, keeping the experience user-friendly and focused on continuous learning.

## 4. Core Features

*   **Educational Content Pages:**

    *   Structured learning paths on AI-assisted development and MCP.
    *   Static pages with embedded code examples using tools like react-markdown.
    *   Detailed documentation and guides on method implementations like "Building MCP Servers."

*   **AI Chat Assistant:**

    *   Modular components including ChatContainer, ChatInput, and ChatMessage.
    *   Floating chat widget for site-wide accessibility.
    *   Placeholder messages styled with markdown and differentiated icons for user and AI messages.
    *   Basic local storage management for chat history, with future plans for backend persistence.

*   **UI/UX Design:**

    *   Responsive, modern design with a charcoal gray background complemented by blue, purple, and orange accents.
    *   Support for both dark and light modes with theming consistency.
    *   Accessible design adhering to WCAG standards using semantic HTML and appropriate ARIA attributes.

*   **Component Architecture:**

    *   Clean separation of concerns with dedicated directories for components, pages, and utility functions.
    *   Minimal state management to ensure simplicity and easy future integration with real-time updates.

## 5. Tech Stack & Tools

*   **Frontend:**

    *   Next.js 14+ using the App Router for modern routing and SSR capabilities.
    *   Tailwind CSS for styling, custom theming, and responsiveness.
    *   React with TypeScript for robust type safety across components.
    *   react-markdown for rendering code snippets and formatted text.
    *   lucide-react for iconography.

*   **Backend / API Integration:**

    *   A preparatory setup for the OpenRouter API built into a library file (openrouter.ts) using TypeScript, ready for future expansion.
    *   Minimal API endpoints defined in the project structure for future integrations.

*   **Development Tools/Plugins:**

    *   Cursor: An advanced IDE providing real-time coding suggestions and AI-powered coding assistance.
    *   Windsurf: A modern IDE supporting AI coding capabilities for enhanced developer experience.

## 6. Non-Functional Requirements

*   **Performance:**

    *   Efficient rendering with Next.js features such as automatic code splitting and SSR to keep load times minimal.
    *   Optimized static content delivery to ensure a smooth user experience.

*   **Security:**

    *   Use of TypeScript for robust type checking and safer code.
    *   Environment variable checks for API key usage to prevent unauthorized access.
    *   Adherence to standard web security practices.

*   **Usability & Accessibility:**

    *   Compliance with WCAG standards via semantic HTML and ARIA attributes.
    *   Consistent theming and responsive design across devices to ensure usability.
    *   Clear error messaging for future stages when integrating external APIs.

*   **Maintainability:**

    *   Modular code structure with separated components for ease of updates and scalability.
    *   Clear file organization, using dedicated directories for components, pages, and utilities.

## 7. Constraints & Assumptions

*   **Constraints:**

    *   The OpenRouter API is set as a future integration and is not active in the current version.
    *   Chat functionality relies on static placeholders and basic local state; persistent storage is planned later.
    *   The educational content pages are static, with no built-in dynamic content management system.
    *   The project currently supports only English language content.

*   **Assumptions:**

    *   Senior developers and engineers will be the primary users who are new to AI integration in development.
    *   The provided color schemes and branding guidelines (charcoal, blue, purple, orange) are to be strictly followed.
    *   The initial phase does not require multi-language support, advanced error handling, or enhanced real-time features.
    *   The environment setup, including available API keys and deployment configurations (e.g., for Vercel), is assumed to be correctly managed outside the codebase.

## 8. Known Issues & Potential Pitfalls

*   **API Dependency:**

    *   The current setup for OpenRouter integration may face issues when the API key is missing or invalid. A basic error check is in place, but robust handling will be needed in future releases.

*   **Static Data Limitations:**

    *   Relying on dummy messages and static local state may not translate seamlessly to real-time interactions once a dynamic API is integrated.
    *   There is potential for state management complications when transitioning from static storage (localStorage) to backend-managed persistent chat history.

*   **Scalability Concerns:**

    *   While the design is modular for future scalability, integrating comprehensive state management and real-time features could introduce performance challenges if not carefully planned.
    *   Additional features such as real-time notifications or more interactive UI components may require significant refactoring.

*   **User Experience Consistency:**

    *   Ensuring consistent UI/UX across various devices and handling theme toggling (dark/light) might be challenging as more interactive elements are integrated.
    *   The risk of ambiguity in error messages or placeholder content arising from the transition to a live, API-driven experience.

To mitigate these issues, careful documentation, rigorous testing, and incremental rollouts of new features are recommended. The team should consider using feature flags and in-depth monitoring when advancing beyond the current proof-of-concept stage.

This PRD provides a clear and comprehensive outline for the AI-Dev Education Platform, ensuring that all aspects—from the core educational content to the modular chat assistant—are defined and understood, setting a solid foundation for further technical specifications and development efforts.
