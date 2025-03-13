/**
 * OpenRouter API client for AI chat functionality
 * 
 * This file implements the integration with OpenRouter API for AI chat completions.
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
 * Send a chat completion request to OpenRouter API
 * 
 * @param request The chat completion request parameters
 * @returns A promise with the chat completion response
 */
export async function sendChatCompletion(
  request: ChatCompletionRequest
): Promise<ChatCompletionResponse> {
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
        'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'https://ai-dev-education.com',
        'X-Title': 'AI-Dev Education Platform',
      },
      body: JSON.stringify({
        model: request.model || 'openai/gpt-3.5-turbo', // Default model
        messages: request.messages,
        temperature: request.temperature || 0.7,
        max_tokens: request.max_tokens || 1000,
        stream: request.stream || false,
        response_format: request.response_format
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    if (request.stream) {
      return response as unknown as ChatCompletionResponse; // Return the stream response for handling elsewhere
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error calling OpenRouter:', error);
    
    // If API call fails, return a fallback response
    return {
      id: "error-fallback",
      choices: [
        {
          message: {
            role: "assistant",
            content: "I'm sorry, I encountered an error while processing your request. Please try again later."
          },
          finish_reason: "error",
          index: 0
        }
      ]
    };
  }
} 