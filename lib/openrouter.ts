/**
 * OpenRouter API client for AI chat functionality
 * 
 * This file implements the integration with OpenRouter API for AI chat completions.
 * It supports both regular and streaming completions with improved error handling.
 */

// Check if the OpenRouter API key is available
const hasApiKey = !!process.env.NEXT_PUBLIC_OPENROUTER_API_KEY

// Basic types for the OpenRouter API
export interface ChatMessage {
  role: "user" | "assistant" | "system"
  content: string
}

export interface ChatCompletionRequest {
  messages: ChatMessage[]
  model: string
  max_tokens?: number
  temperature?: number
  top_p?: number
  stream?: boolean
  response_format?: ResponseFormat
  safe_mode?: "none" | "standard" | "high"
}

export interface ResponseFormat {
  type: "text" | "json_schema"
  json_schema?: Record<string, unknown>
}

export interface ConceptExplanationSchema {
  name: string
  strict: boolean
  schema: {
    type: "object"
    properties: {
      concept: { type: "string", description: string }
      summary: { type: "string", description: string }
      details: { type: "string", description: string }
      code_example?: { type: "string", description: string }
      related_concepts?: { 
        type: "array"
        items: { type: "string" }
        description: string
      }
      knowledge_level?: { type: "string", description: string, enum: string[] }
    }
    required: string[]
  }
}

export interface ChatCompletionResponse {
  id: string
  choices: {
    message: ChatMessage
    finish_reason: string
    index: number
  }[]
}

// For handling streaming responses
export interface ChatCompletionChunk {
  id: string
  choices: {
    delta: {
      content?: string
      role?: string
    }
    finish_reason: string | null
    index: number
  }[]
}

/**
 * Creates a concept explanation schema for structured outputs
 * 
 * @param includeCode Whether to require code examples
 * @param includeKnowledgeLevel Whether to include knowledge level adaptation
 * @returns A schema for concept explanations
 */
export function createConceptExplanationSchema(
  includeCode: boolean = false,
  includeKnowledgeLevel: boolean = false
): ConceptExplanationSchema {
  const required = ["concept", "summary", "details"];
  if (includeCode) required.push("code_example");
  if (includeKnowledgeLevel) required.push("knowledge_level");
  
  return {
    name: "concept_explanation",
    strict: true,
    schema: {
      type: "object",
      properties: {
        concept: { 
          type: "string", 
          description: "Name of the concept being explained" 
        },
        summary: { 
          type: "string", 
          description: "Brief 1-2 sentence summary of the concept" 
        },
        details: { 
          type: "string", 
          description: "Detailed explanation with markdown formatting" 
        },
        code_example: { 
          type: "string", 
          description: "Example code with markdown code block formatting if applicable" 
        },
        related_concepts: { 
          type: "array", 
          items: { type: "string" },
          description: "Related concepts to explore next" 
        },
        knowledge_level: {
          type: "string",
          description: "The knowledge level this explanation is targeted for",
          enum: ["beginner", "intermediate", "advanced"]
        }
      },
      required
    }
  };
}

/**
 * Creates a more detailed, hierarchical concept explanation schema
 * with support for different knowledge levels and related resources
 */
export function createEnhancedConceptSchema(): Record<string, unknown> {
  return {
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
}

/**
 * Send a chat completion request to OpenRouter API
 * 
 * @param request The chat completion request parameters
 * @returns A promise with the chat completion response or a readable stream for streaming responses
 */
export async function sendChatCompletion(
  request: ChatCompletionRequest
): Promise<ChatCompletionResponse | ReadableStream> {
  if (!hasApiKey) {
    console.error("OpenRouter API key is not available")
    throw new Error("OpenRouter API key is not available")
  }
  
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY}`,
        'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_BASE_URL || 'https://ai-dev-education.com'),
        'X-Title': 'AI-Dev Education Platform',
      },
      body: JSON.stringify({
        model: request.model || 'openai/gpt-3.5-turbo', // Default model
        messages: request.messages,
        temperature: request.temperature || 0.7,
        max_tokens: request.max_tokens || 1000,
        stream: request.stream || false,
        response_format: request.response_format,
        safe_mode: request.safe_mode || 'standard'
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorJson;
      try {
        errorJson = JSON.parse(errorText);
      } catch (e) {
        // If not JSON, use the text as is
        errorJson = { error: errorText };
      }
      throw new Error(`API request failed with status ${response.status}: ${JSON.stringify(errorJson)}`);
    }

    if (request.stream) {
      return response.body as ReadableStream;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error calling OpenRouter:', error);
    
    // Return a more detailed fallback response
    return createFallbackResponse(error);
  }
}

/**
 * Process a streaming response from OpenRouter API
 * 
 * @param stream The streaming response from OpenRouter API
 * @param onChunk Callback function for each chunk of data
 * @param onComplete Callback function when streaming is complete
 * @param onError Callback function for errors
 */
export async function processStreamingResponse(
  stream: ReadableStream,
  onChunk: (chunk: ChatCompletionChunk) => void,
  onComplete?: () => void,
  onError?: (error: Error) => void
): Promise<void> {
  try {
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        break;
      }
      
      // Decode the chunk
      buffer += decoder.decode(value, { stream: true });
      
      // Split the buffer on double newlines which separate SSE events
      const lines = buffer.split('\n\n');
      
      // Process all complete events
      for (let i = 0; i < lines.length - 1; i++) {
        const line = lines[i].trim();
        
        if (line.startsWith('data: ')) {
          const data = line.substring(6);
          
          // Skip [DONE] event
          if (data === '[DONE]') continue;
          
          try {
            const chunk: ChatCompletionChunk = JSON.parse(data);
            onChunk(chunk);
          } catch (e) {
            console.error('Error parsing SSE chunk:', e);
          }
        }
      }
      
      // Keep the last incomplete event in the buffer
      buffer = lines[lines.length - 1];
    }
    
    // Decode any remaining content
    const remaining = decoder.decode();
    if (remaining && remaining.trim().startsWith('data: ')) {
      const data = remaining.trim().substring(6);
      if (data && data !== '[DONE]') {
        try {
          const chunk = JSON.parse(data);
          onChunk(chunk);
        } catch (e) {
          console.error('Error parsing final SSE chunk:', e);
        }
      }
    }
    
    if (onComplete) onComplete();
  } catch (error) {
    console.error('Error processing streaming response:', error);
    if (onError) onError(error as Error);
  }
}

/**
 * Creates a fallback response when the API call fails
 * 
 * @param error The error object
 * @returns A fallback chat completion response
 */
function createFallbackResponse(error: unknown): ChatCompletionResponse {
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  return {
    id: "error-fallback",
    choices: [
      {
        message: {
          role: "assistant",
          content: `I'm sorry, I encountered an error while processing your request. ${errorMessage.includes('API key') ? 'The API connection is not configured correctly.' : 'Please try again later.'}`
        },
        finish_reason: "error",
        index: 0
      }
    ]
  };
}

/**
 * Enriches messages with context about the current page
 * 
 * @param messages The original chat messages
 * @param currentPage The current page the user is viewing
 * @returns Enriched messages with context
 */
export function enrichMessagesWithContext(
  messages: ChatMessage[],
  currentPage?: string
): ChatMessage[] {
  if (!currentPage) return messages;
  
  const systemContext: ChatMessage = {
    role: "system",
    content: `The user is currently on the ${currentPage} page of the AI-Dev Education platform. Consider this context in your response if relevant.`
  };
  
  // Create a new array with the system context at the beginning
  return [systemContext, ...messages];
} 