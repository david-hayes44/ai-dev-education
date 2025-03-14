import { NextRequest, NextResponse } from 'next/server';
import { sendChatCompletion, ChatMessage, ChatCompletionRequest, enrichMessagesWithContext, createEnhancedConceptSchema } from '@/lib/openrouter';

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

export async function POST(req: NextRequest) {
  try {
    const { messages, currentPage, model, stream = false } = await req.json();
    
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid request format' }, { status: 400 });
    }
    
    // Get the user's query (last message)
    const userQuery = messages.findLast((m: ChatMessage) => m.role === 'user')?.content || '';
    
    // Enhance messages with context based on current page if available
    const enhancedMessages: ChatMessage[] = enrichMessagesWithContext(messages, currentPage);
    
    // Check if this is a concept explanation query
    const { isConceptExplanation, topic } = isConceptExplanationQuery(userQuery);
    const isNavigation = isNavigationRequest(userQuery);
    
    let request: ChatCompletionRequest;
    
    if (isConceptExplanation && topic) {
      const knowledgeLevel = detectKnowledgeLevel(userQuery);
      const includeCode = isCodeExampleRequested(userQuery);
      
      // Add system message to guide the structured response
      enhancedMessages.unshift({
        role: 'system',
        content: `You are an AI tutor for the AI-Dev Education platform. The user is asking about the concept of ${topic}. 
Provide a comprehensive explanation at the ${knowledgeLevel} level. ${includeCode ? 'Include relevant code examples.' : ''} 
Your response should be informative, accurate, and tailored to the user's knowledge level.`
      });
      
      // Set up the request with JSON schema for structured output
      request = {
        messages: enhancedMessages,
        model: model || 'google/gemini-2.0-flash-thinking-exp:free',
        temperature: 0.7,
        max_tokens: 2000,
        stream,
        safe_mode: 'standard',
        response_format: {
          type: "json_schema",
          json_schema: createEnhancedConceptSchema()
        }
      };
    } else if (isNavigation) {
      // Add system message to guide navigation assistance
      enhancedMessages.unshift({
        role: 'system',
        content: `You are a navigation assistant for the AI-Dev Education platform. 
The user is looking for help finding information or navigating to a specific section. 
Provide clear directions to relevant content, including links when possible.
Do NOT redirect the user automatically. Instead, provide helpful information about where they can find content.
Your goal is to help them find what they're looking for efficiently.`
      });
      
      request = {
        messages: enhancedMessages,
        model: model || 'google/gemini-2.0-flash-thinking-exp:free',
        temperature: 0.7,
        max_tokens: 1500,
        stream,
        safe_mode: 'standard'
      };
    } else {
      // Regular chat request
      enhancedMessages.unshift({
        role: 'system',
        content: `You are an AI tutor for the AI-Dev Education platform. You help users learn about AI-assisted development and Model Context Protocol (MCP). 
Be accurate, helpful, and adapt your explanations to the user's level of understanding. 
When appropriate, suggest relevant sections of the platform where the user can learn more.`
      });
      
      request = {
        messages: enhancedMessages,
        model: model || 'google/gemini-2.0-flash-thinking-exp:free',
        temperature: 0.7,
        max_tokens: 1500,
        stream,
        safe_mode: 'standard'
      };
    }
    
    // Handle streaming responses
    if (stream) {
      const streamResponse = await sendChatCompletion(request);
      
      if (!(streamResponse instanceof ReadableStream)) {
        return NextResponse.json({ error: 'Failed to get streaming response' }, { status: 500 });
      }
      
      return new NextResponse(streamResponse, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        }
      });
    }
    
    // Handle regular responses
    const response = await sendChatCompletion(request);
    
    if (response instanceof ReadableStream) {
      return NextResponse.json({ error: 'Unexpected streaming response' }, { status: 500 });
    }
    
    // Add metadata to the response
    if (isConceptExplanation && topic) {
      // Create a new object with the metadata
      const enhancedResponse = {
        ...response,
        metadata: {
          type: "concept_explanation",
          topic,
          knowledgeLevel: detectKnowledgeLevel(userQuery)
        }
      };
      
      return NextResponse.json(enhancedResponse);
    }
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({ error: 'An error occurred processing your request' }, { status: 500 });
  }
} 