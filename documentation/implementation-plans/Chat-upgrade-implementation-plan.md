<think>Let me think through a comprehensive plan for enhancing the OpenRouter API integration to create an effective AI chatbot tutor for the AI-Dev Education platform.

First, I need to consider the key elements of an effective chatbot tutor:
1. Contextual awareness - should understand where in the site the user is and what content is relevant
2. Streaming responses for a more interactive experience
3. Structured outputs for consistent, well-formatted educational responses
4. Comprehensive knowledge about AI dev concepts, especially MCP
5. Navigation assistance to help users find relevant content
6. Personalized guidance based on user's knowledge level
7. Technical assistance for code-related questions

Let me structure this into implementation phases, starting with the OpenRouter API integration enhancements.</think># AI Chatbot Tutor Implementation Plan

## Overview
We'll transform the chatbot into a comprehensive educational assistant that guides users through the AI-Dev Education platform. The bot will function as a personal tutor, providing contextual help, answering questions, explaining concepts, and navigating users to relevant content.

## Phase 1: Core OpenRouter API Integration

### 1.1 Enhance the OpenRouter Client
```typescript
// Enhancements to lib/openrouter.ts
- Add streaming support
- Improve error handling
- Add content safety filters
- Implement retry logic
- Add request/response logging for debugging
```

### 1.2 Implement Chat Context Management
```typescript
// New context management module
- Create a context store to track conversation history
- Add site navigation context (current page/section)
- Implement context windowing to manage token limits
- Create context injection for relevant educational content
```

### 1.3 Streaming Response UI Implementation
```typescript
// Update chat-container and chat-message components
- Add typing indicators during streaming
- Implement incremental message rendering
- Create message markdown parsing on-the-fly
- Support code syntax highlighting in streamed responses
```

## Phase 2: Educational Intelligence

### 2.1 Structured Knowledge Responses
```typescript
// Implement JSON Schema-based structured outputs
- Create schemas for concept explanations
- Build schemas for code examples
- Develop schemas for learning path recommendations
- Implement schemas for technical troubleshooting
```

### 2.2 Site Navigation Assistance
```typescript
// Allow the chatbot to help navigate the site with direct navigation capabilities

// 1. Knowledge Base Construction
- Create a comprehensive site map data model:
  interface SiteMapNode {
    path: string;
    title: string;
    keywords: string[];
    description: string;
    childNodes?: SiteMapNode[];
    relatedTopics?: string[]; // paths to related content
  }
- Extract navigation data from the Sidebar component structure
- Add metadata to enhance search capabilities
- Build fuzzy matching algorithm for topic identification

// 2. Navigation Intent Detection
- Implement intent recognition patterns:
  - "show me information about X"
  - "I want to learn about X"
  - "where can I find X"
  - "take me to X"
- Create topic extraction from user messages
- Build confidence scoring for navigation suggestions

// 3. Navigation UI Components
- Create interactive navigation options:
  function NavigationOption({ url, title, onNavigate }) {
    return (
      <div className="flex flex-col mt-2 mb-4">
        <p className="text-sm text-muted-foreground">{title}</p>
        <div className="flex gap-2 mt-1">
          <Button onClick={() => onNavigate(url)}>
            Go to page
          </Button>
          <Button variant="outline">
            Tell me more
          </Button>
        </div>
      </div>
    );
  }
- Enhance ChatMessage component to render navigation options

// 4. Client-Side Navigation Implementation
- Use Next.js router for direct navigation:
  function useNavigationHandler() {
    const router = useRouter();
    
    return (url: string) => {
      // Close the chat UI if needed
      // Navigate to the requested page
      router.push(url);
    };
  }
- Add transition effects when navigating
- Remember chat context after navigation
```

### 2.3 Contextual Content Awareness
```typescript
// Make the chatbot aware of site content
- Build a content embedding database
- Implement semantic search across documentation
- Create dynamic prompt generation based on current page
- Add example repository awareness
```

## Phase 3: Personal Tutor Experience

### 3.1 User Knowledge Adaptation
```typescript
// Adapt responses to user knowledge level
- Implement knowledge level detection
- Create multiple response formats based on user expertise
- Add progressive disclosure of complex concepts
- Support "explain like I'm 5" and expert-level responses
```

### 3.2 Interactive Educational Elements
```typescript
// Add interactive elements to chat
- Implement guided tutorials through chat
- Create interactive code examples
- Add quizzes and knowledge checks
- Support visual diagrams in explanations
```

### 3.3 Persistent Learning State
```typescript
// Track user progress and preferences
- Implement user session management
- Add learning progress tracking
- Create favorite/saved explanations
- Support resuming tutorials
```

## Implementation Timeline

| Phase | Task | Estimated Time |
|-------|------|----------------|
| 1.1 | Enhance OpenRouter Client | 2 days |
| 1.2 | Implement Chat Context Management | 3 days |
| 1.3 | Streaming Response UI | 2 days |
| 2.1 | Structured Knowledge Responses | 3 days |
| 2.2 | Site Navigation Assistance | 4 days |
| 2.3 | Contextual Content Awareness | 4 days |
| 3.1 | User Knowledge Adaptation | 3 days |
| 3.2 | Interactive Educational Elements | 4 days |
| 3.3 | Persistent Learning State | 3 days |

## Technical Implementation Details

### OpenRouter API Enhancements

```typescript
// Enhanced sendChatCompletion function with streaming
export async function sendChatCompletion(
  request: ChatCompletionRequest
): Promise<ChatCompletionResponse | ReadableStream> {
  // Validate API key availability
  if (!hasApiKey) {
    throw new Error("OpenRouter API key is not available");
  }
  
  // Prepare request with improved error handling
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY}`,
        'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_BASE_URL,
        'X-Title': 'AI-Dev Education Platform',
      },
      body: JSON.stringify({
        model: request.model || 'openai/gpt-4-turbo',
        messages: enrichMessagesWithContext(request.messages),
        temperature: request.temperature || 0.7,
        max_tokens: request.max_tokens || 2000,
        stream: request.stream || false,
        response_format: request.response_format,
        safe_mode: 'standard',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`API request failed: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    if (request.stream) {
      return handleStreamingResponse(response);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error calling OpenRouter:', error);
    return createFallbackResponse(error);
  }
}
```

### Structured Output Implementation

```typescript
// Example of implementing structured concept explanations
export const conceptExplanationSchema = {
  type: "object",
  properties: {
    concept: { 
      type: "string", 
      description: "Name of the AI development concept being explained" 
    },
    summary: { 
      type: "string", 
      description: "Brief 1-2 sentence summary suitable for beginners" 
    },
    explanation: {
      type: "object",
      properties: {
        beginner: { type: "string", description: "Explanation for beginners" },
        intermediate: { type: "string", description: "Explanation for those with some knowledge" },
        advanced: { type: "string", description: "Explanation for experts" }
      },
      required: ["beginner", "intermediate", "advanced"]
    },
    code_example: { 
      type: "string", 
      description: "Relevant code example with markdown formatting" 
    },
    related_concepts: { 
      type: "array", 
      items: { 
        type: "object",
        properties: {
          name: { type: "string" },
          url: { type: "string", description: "Relative URL to this concept in the platform" }
        },
        required: ["name", "url"]
      },
      description: "Related concepts with navigation links" 
    },
    site_sections: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          url: { type: "string" },
          description: { type: "string" }
        },
        required: ["title", "url"]
      },
      description: "Relevant sections of the site to learn more"
    }
  },
  required: ["concept", "summary", "explanation", "related_concepts", "site_sections"]
};
```

### Navigation Implementation Example

```typescript
// Example implementation of the direct navigation handler
export function NavigationHandler({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { setIsOpen } = useChat(); // From chat context to control chat visibility
  
  // Function to extract topic from user message
  const extractTopic = (message: string): string | null => {
    // Simple patterns for navigation intent
    const patterns = [
      /show me (?:information about|details on|) (.*)/i,
      /where can I find (?:information about|details on|) (.*)/i,
      /take me to (?:the|) (.*?) (?:page|section)/i,
      /I want to learn about (.*)/i,
    ];
    
    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    
    return null;
  };
  
  // Function to find relevant page based on extracted topic
  const findRelevantPage = (topic: string): SiteMapNode | null => {
    // 1. Try exact match first
    const exactMatch = siteMap.find(node => 
      node.title.toLowerCase() === topic.toLowerCase() ||
      node.keywords.some(kw => kw.toLowerCase() === topic.toLowerCase())
    );
    
    if (exactMatch) return exactMatch;
    
    // 2. Try fuzzy matching using something like Fuse.js
    // This would be implemented with a proper fuzzy search library
    
    return null;
  };
  
  // The main navigation handler
  const handleNavigation = (message: string) => {
    const topic = extractTopic(message);
    if (!topic) return null;
    
    const relevantPage = findRelevantPage(topic);
    if (!relevantPage) return null;
    
    return {
      topic,
      pageTitle: relevantPage.title,
      url: relevantPage.path,
      description: relevantPage.description,
      navigate: () => {
        // Optional: minimize chat
        setIsOpen(false);
        // Navigate to the page
        router.push(relevantPage.path);
      }
    };
  };
  
  // Provide navigation context to all child components
  return (
    <NavigationContext.Provider value={{ handleNavigation }}>
      {children}
    </NavigationContext.Provider>
  );
}
```

### Context Injection System

```typescript
// Function to enrich messages with relevant context
function enrichMessagesWithContext(messages: ChatMessage[]): ChatMessage[] {
  // Get current page context
  const currentPageContext = getCurrentPageContext();
  
  // Get relevant documentation based on conversation
  const relevantDocs = findRelevantDocumentation(messages);
  
  // Create a system message with context
  const systemContext: ChatMessage = {
    role: "system",
    content: `You are an AI tutor for the AI-Dev Education platform. You help users learn about AI-assisted development and Model Context Protocol (MCP).
    
    Current page: ${currentPageContext.title}
    URL: ${currentPageContext.url}
    
    Relevant documentation:
    ${relevantDocs.map(doc => `- ${doc.title}: ${doc.summary}`).join('\n')}
    
    Your role is to:
    1. Answer questions about AI development concepts
    2. Explain MCP and its applications
    3. Guide users to relevant sections of the site
    4. Provide code examples when helpful
    5. Adapt your explanations to the user's knowledge level
    
    Always provide accurate information and link to relevant sections of the site when appropriate.`
  };
  
  // Insert system message at the beginning
  return [systemContext, ...messages];
}
```

## Testing Strategy

1. **Unit Tests**:
   - Test OpenRouter API client functions
   - Test context management logic
   - Test schema validation for structured outputs
   - Test navigation intent detection accuracy

2. **Integration Tests**:
   - Test chat UI with mock API responses
   - Test streaming implementation
   - Test context injection with site navigation
   - Test direct navigation functionality with router

3. **User Experience Tests**:
   - Test response quality for different question types
   - Test adaptation to different knowledge levels
   - Test navigation assistance accuracy
   - Test user journey through navigation flows

## Next Steps

1. Complete site structure and content build-out (prerequisite for effective navigation)
2. Start with the OpenRouter API client enhancements
3. Implement basic streaming UI
4. Add structured output support with concept explanation schema
5. Build the site map for navigation assistance
6. Implement navigation intent detection
7. Create interactive navigation UI components
8. Integrate with Next.js router for direct navigation

Would you like me to focus on any specific aspect of this plan first, or should we begin implementation with the OpenRouter API enhancements?

