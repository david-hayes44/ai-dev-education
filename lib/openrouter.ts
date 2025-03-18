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
  retry_options?: RetryOptions
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

// New interface for retry options
export interface RetryOptions {
  max_retries: number;
  initial_delay: number; // in milliseconds
  max_delay: number; // in milliseconds
  backoff_factor: number; // exponential backoff multiplier
}

// Default retry options
const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  max_retries: 3,
  initial_delay: 1000, // 1 second
  max_delay: 10000, // 10 seconds
  backoff_factor: 2
};

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
  
  const retry_options = request.retry_options || DEFAULT_RETRY_OPTIONS;
  let retries = 0;
  let delay = retry_options.initial_delay;
  
  while (true) {
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

      // Handle rate limiting specifically
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        const retryDelay = retryAfter ? parseInt(retryAfter) * 1000 : delay;
        
        if (retries < retry_options.max_retries) {
          console.warn(`Rate limited by OpenRouter API. Retrying after ${retryDelay}ms. Retry ${retries + 1}/${retry_options.max_retries}`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          retries++;
          delay = Math.min(delay * retry_options.backoff_factor, retry_options.max_delay);
          continue;
        }
      }

      if (!response.ok) {
        const errorText = await response.text();
        let errorJson;
        try {
          errorJson = JSON.parse(errorText);
        } catch (e) {
          // If not JSON, use the text as is
          errorJson = { error: errorText };
        }
        
        // Check if we should retry based on the error
        const shouldRetry = response.status >= 500 || response.status === 429;
        if (shouldRetry && retries < retry_options.max_retries) {
          console.warn(`OpenRouter API request failed with status ${response.status}. Retrying after ${delay}ms. Retry ${retries + 1}/${retry_options.max_retries}`);
          await new Promise(resolve => setTimeout(resolve, delay));
          retries++;
          delay = Math.min(delay * retry_options.backoff_factor, retry_options.max_delay);
          continue;
        }
        
        throw new Error(`API request failed with status ${response.status}: ${JSON.stringify(errorJson)}`);
      }

      if (request.stream) {
        if (!response.body) {
          throw new Error('No response stream available');
        }
        return response.body as ReadableStream;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      // For network errors, we might want to retry
      const isNetworkError = error instanceof TypeError && error.message.includes('fetch');
      
      if (isNetworkError && retries < retry_options.max_retries) {
        console.warn(`Network error when calling OpenRouter: ${error}. Retrying after ${delay}ms. Retry ${retries + 1}/${retry_options.max_retries}`);
        await new Promise(resolve => setTimeout(resolve, delay));
        retries++;
        delay = Math.min(delay * retry_options.backoff_factor, retry_options.max_delay);
        continue;
      }
      
      console.error('Error calling OpenRouter:', error);
      
      // Return a more detailed fallback response
      return createFallbackResponse(error);
    }
  }
}

/**
 * Process a streaming response from OpenRouter API with improved error handling
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
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let isFirstChunk = true;
  let lastActivityTime = Date.now();
  const TIMEOUT_DURATION = 30000; // 30 seconds timeout
  
  try {
    // Set up a timeout monitor
    const timeoutId = setInterval(() => {
      const inactiveTime = Date.now() - lastActivityTime;
      if (inactiveTime > TIMEOUT_DURATION) {
        clearInterval(timeoutId);
        reader.cancel('Stream timeout due to inactivity').catch(console.error);
        if (onError) onError(new Error('Stream timeout: No data received for 30 seconds'));
      }
    }, 5000); // Check every 5 seconds
    
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        clearInterval(timeoutId);
        break;
      }
      
      // Update activity timestamp
      lastActivityTime = Date.now();
      
      // Decode the chunk
      const textChunk = decoder.decode(value, { stream: true });
      buffer += textChunk;
      
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
            
            // Special handling for first chunk to validate the response format
            if (isFirstChunk) {
              isFirstChunk = false;
              // Check if the first chunk indicates an error
              if (chunk.choices?.[0]?.delta?.content?.includes('error') || 
                  chunk.choices?.[0]?.delta?.content?.includes('I apologize')) {
                console.warn('First chunk indicates a potential error response:', chunk);
              }
            }
            
            onChunk(chunk);
          } catch (e) {
            console.error('Error parsing SSE chunk:', e, 'Raw data:', line);
            if (onError) onError(new Error(`Failed to parse streaming response: ${e}`));
          }
        } else if (line.includes('error') || line.includes('Error')) {
          // Handle error messages that might come in a non-standard format
          console.error('Stream contained error message:', line);
          if (onError) onError(new Error(`Stream error: ${line}`));
        }
      }
      
      // Keep the last incomplete event in the buffer
      buffer = lines[lines.length - 1];
    }
    
    // Decode any remaining content
    const remaining = decoder.decode();
    if (remaining && remaining.trim()) {
      const remainingLines = remaining.trim().split('\n\n');
      
      for (const line of remainingLines) {
        if (line.trim().startsWith('data: ')) {
          const data = line.trim().substring(6);
          if (data && data !== '[DONE]') {
            try {
              const chunk = JSON.parse(data);
              onChunk(chunk);
            } catch (e) {
              console.error('Error parsing final SSE chunk:', e);
            }
          }
        }
      }
    }
    
    if (onComplete) onComplete();
  } catch (error) {
    console.error('Error processing streaming response:', error);
    if (onError) onError(error as Error);
  } finally {
    // Ensure reader is released even if there was an error
    try {
      await reader.cancel();
    } catch (e) {
      console.error('Error cancelling reader:', e);
    }
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
  
  let userFriendlyMessage = "I'm sorry, I encountered an error while processing your request.";
  
  if (errorMessage.includes('API key')) {
    userFriendlyMessage += " The API connection is not configured correctly.";
  } else if (errorMessage.includes('429') || errorMessage.includes('rate limit')) {
    userFriendlyMessage += " The service is currently experiencing high demand. Please try again in a few moments.";
  } else if (errorMessage.includes('timeout') || errorMessage.includes('network')) {
    userFriendlyMessage += " There seems to be a network connectivity issue. Please check your connection and try again.";
  } else if (errorMessage.includes('500')) {
    userFriendlyMessage += " The AI service is currently experiencing technical difficulties. Please try again later.";
  } else {
    userFriendlyMessage += " Please try again later.";
  }
  
  return {
    id: "error-fallback",
    choices: [
      {
        message: {
          role: "assistant",
          content: userFriendlyMessage
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