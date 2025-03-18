import { NextRequest, NextResponse } from 'next/server';
import { sendChatCompletion, ChatMessage, ChatCompletionRequest, enrichMessagesWithContext, createEnhancedConceptSchema } from '@/lib/openrouter';
import OpenAI from 'openai';
import { ContentChunk } from '@/lib/content-indexing-service';

// List of AI-related topics we can provide structured explanations for
const AI_TOPICS = [
  "deep learning", "machine learning", "neural networks", "natural language processing", 
  "computer vision", "reinforcement learning", "generative ai", "transformer models",
  "llm", "large language models", "model context protocol", "mcp", "attention mechanism",
  "fine-tuning", "prompt engineering", "rag", "retrieval augmented generation", "vector database",
  "embedding", "tokens", "tokenization", "cuda", "gpu acceleration", "quantization", "onnx",
  "agentic ai", "multimodal", "diffusion models", "gan", "stable diffusion", "openai",
  "anthropic", "claude", "gpt", "cursor", "langchain", "semantic kernel"
];

// Server-side environment variables
const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
const model = 'anthropic/claude-3-opus:1:0';

// Define types
interface ChatRequest {
  message: string;
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
  context?: {
    relevantContent?: ContentChunk[];
    currentPage?: string;
    pageTitle?: string;
    pageDescription?: string;
  };
}

// Initialize OpenAI client for OpenRouter
const openai = new OpenAI({
  apiKey: apiKey || '',
  baseURL: 'https://openrouter.ai/api/v1',
});

// Function to detect if a query is asking for a concept explanation
function isConceptExplanationQuery(query: string): { isConceptExplanation: boolean, topic?: string } {
  const lowerQuery = query.toLowerCase();
  
  // Check if the query is asking for an explanation
  const explanationPatterns = [
    /what is/i, /explain/i, /how does/i, /define/i, /meaning of/i,
    /concept of/i, /tell me about/i, /what are/i, /describe/i
  ];
  
  const isAskingForExplanation = explanationPatterns.some(pattern => pattern.test(lowerQuery));
  if (!isAskingForExplanation) return { isConceptExplanation: false };
  
  // Check if the query contains an AI-related topic
  for (const topic of AI_TOPICS) {
    if (lowerQuery.includes(topic)) {
      return { isConceptExplanation: true, topic };
    }
  }
  
  return { isConceptExplanation: false };
}

// Function to detect the knowledge level of the user based on their query
function detectKnowledgeLevel(query: string): "beginner" | "intermediate" | "advanced" {
  const lowerQuery = query.toLowerCase();
  
  // Advanced patterns
  const advancedPatterns = [
    /in depth/i, /advanced/i, /complex/i, /technical details/i, /implementation/i,
    /architecture/i, /under the hood/i, /internals/i, /mathematics behind/i
  ];
  
  // Intermediate patterns
  const intermediatePatterns = [
    /how does it work/i, /mechanism/i, /process/i, /explain the concept/i,
    /principle/i, /fundamentals/i, /overview/i, /compared to/i
  ];
  
  if (advancedPatterns.some(pattern => pattern.test(lowerQuery))) {
    return "advanced";
  } else if (intermediatePatterns.some(pattern => pattern.test(lowerQuery))) {
    return "intermediate";
  } else {
    return "beginner";
  }
}

// Function to check if code examples are requested
function isCodeExampleRequested(query: string): boolean {
  const lowerQuery = query.toLowerCase();
  
  const codePatterns = [
    /code example/i, /example code/i, /sample code/i, /implementation/i,
    /how to implement/i, /how to code/i, /code sample/i, /programming/i,
    /with code/i, /show code/i, /code snippet/i, /how would you code/i
  ];
  
  return codePatterns.some(pattern => pattern.test(lowerQuery));
}

// Function to check if navigation assistance is requested
function isNavigationRequest(query: string): boolean {
  const lowerQuery = query.toLowerCase();
  
  const navigationPatterns = [
    /where can i find/i, /show me/i, /navigate to/i, /take me to/i,
    /where is/i, /how do i get to/i, /link to/i, /find/i,
    /section about/i, /page on/i, /documentation for/i
  ];
  
  // Only return true for explicit navigation requests with these patterns
  // Simply mentioning a topic like "MCP servers" shouldn't trigger navigation
  return navigationPatterns.some(pattern => pattern.test(lowerQuery)) &&
    !lowerQuery.includes("tell me about") &&
    !lowerQuery.includes("explain") &&
    !lowerQuery.includes("what is") &&
    !lowerQuery.includes("how does");
}

// Format relevant content for context
function formatContentContext(content: ContentChunk[]): string {
  if (!content || content.length === 0) {
    return "";
  }

  return content
    .map((chunk, index) => {
      return `CONTENT ${index + 1}: ${chunk.title || "Untitled"}
SOURCE: ${chunk.path || "Unknown"}
---
${chunk.content}
---`;
    })
    .join("\n\n");
}

// Generate context message
function generateContextMessage(context?: ChatRequest['context']): string {
  let contextMessage = "";

  // Add page context if available
  if (context?.currentPage) {
    contextMessage += `\nCURRENT PAGE: ${context.currentPage}\n`;
    
    if (context.pageTitle) {
      contextMessage += `PAGE TITLE: ${context.pageTitle}\n`;
    }
    
    if (context.pageDescription) {
      contextMessage += `PAGE DESCRIPTION: ${context.pageDescription}\n`;
    }
    
    contextMessage += "\n";
  }

  // Add relevant content if available
  if (context?.relevantContent && context.relevantContent.length > 0) {
    contextMessage += `\nRELEVANT CONTENT:\n${formatContentContext(context.relevantContent)}\n`;
  }

  return contextMessage;
}

// Get system prompt for initializing the chat
function getSystemPrompt(): string {
  return `You are AITutor, an educational assistant for the AI Dev Education platform. Your purpose is to help users understand AI development concepts and navigate the platform resources.

When responding:
- Be concise and informative, focusing on providing accurate information
- When referencing platform resources, mention them specifically
- Adapt your responses based on the current page context provided
- Provide context-aware help based on the user's current location in the documentation
- Suggest relevant pages when appropriate based on the user's questions

The platform covers topics including:
- Machine-Cognition Protocol (MCP)
- AI Agent development
- Prompt engineering
- LLM systems
- Multimodal AI
- AI safety and alignment`;
}

export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const requestData = await req.json() as ChatRequest;
    const { message, messages, context } = requestData;

    // Create messages array
    const apiMessages = [
      {
        role: 'system' as const,
        content: getSystemPrompt()
      },
      ...messages
    ];

    // Add context message if available
    const contextMessage = generateContextMessage(context);
    if (contextMessage) {
      apiMessages.push({
        role: 'system' as const,
        content: `Here is the current context for this conversation: ${contextMessage}`
      });
    }

    // Call OpenRouter API (via OpenAI client)
    const response = await openai.chat.completions.create({
      model: model,
      messages: apiMessages,
      temperature: 0.7,
    });

    // Extract assistant message
    const assistantContent = response.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";
    
    return NextResponse.json({
      role: 'assistant',
      content: assistantContent,
      timestamp: Date.now(),
      id: Date.now().toString()
    });
  } catch (error) {
    console.error("Error calling OpenRouter API:", error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
} 