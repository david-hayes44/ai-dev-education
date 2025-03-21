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
export function createEnhancedConceptSchema(options?: { knowledgeLevel?: string, includeCode?: boolean }): Record<string, unknown> {
  // Set default values based on options
  const includeCode = options?.includeCode ?? true;
  
  // Basic schema structure
  const schema: Record<string, unknown> = {
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
  
  // Add code_example field if includeCode is true
  if (includeCode) {
    (schema.properties as Record<string, unknown>).code_example = { 
      type: "string", 
      description: "Relevant code example with markdown formatting" 
    };
  }
  
  return schema;
}

/**
 * Send a chat completion request to OpenRouter API with enhanced streaming support
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
  
  // Enhanced request validation and logging
  let hasAttachments = false;
  let dataUrls = 0;
  let httpUrls = 0;
  let plainTextAttachments = 0;
  let totalContentLength = 0;
  
  // Analyze message content for debugging
  for (const message of request.messages) {
    if (message.content && typeof message.content === 'string') {
      totalContentLength += message.content.length;
      
      // Check for file attachments
      if (message.content.includes('File URL:') || 
          message.content.includes('ATTACHMENT_URL:') || 
          message.content.includes('data:') ||
          message.content.includes('file://')) {
        hasAttachments = true;
        
        if (message.content.includes('data:')) {
          dataUrls++;
        }
        if (message.content.includes('http')) {
          httpUrls++;
        }
        if (message.content.includes('PLAINTEXT_ATTACHMENT')) {
          plainTextAttachments++;
        }
      }
    }
  }
  
  if (hasAttachments) {
    console.log(`Request contains file references: data_urls=${dataUrls}, http_urls=${httpUrls}, plaintext_attachments=${plainTextAttachments}`);
  }
  
  console.log(`Sending OpenRouter request to model: ${request.model}`);
  if (hasAttachments) {
    console.log("Request includes file attachments");
  }
  
  // Track message count for debugging
  console.log(`OpenRouter request stats: model=${request.model}, message_count=${request.messages.length}, total_content_length=${totalContentLength}`);
  
  // If streaming is requested, handle it differently
  if (request.stream === true) {
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY}`,
          "HTTP-Referer": `${process.env.NEXT_PUBLIC_SITE_URL || ""}`,
        },
        body: JSON.stringify({
          model: request.model,
          messages: request.messages,
          stream: true,
          temperature: request.temperature,
          max_tokens: request.max_tokens,
          top_p: request.top_p,
          response_format: request.response_format,
          safe_mode: request.safe_mode,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error?.message || `HTTP error ${response.status}`;
        console.error("Error from OpenRouter API:", errorMessage);
        throw new Error(`API error: ${errorMessage}`);
      }
      
      return response.body!;
    } catch (error) {
      console.error("Error calling OpenRouter API for streaming:", error);
      throw new Error(`Error calling OpenRouter API for streaming: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  // For non-streaming requests, use the existing implementation with retries
  while (true) {
    try {
      console.log(`Sending OpenRouter request to model: ${request.model}`);
      if (hasAttachments) {
        console.log('Request includes file attachments');
      }
      
      // CRITICAL CHANGE: Implement timeout handling using AbortController
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        console.warn('Aborting OpenRouter request due to timeout (15s)');
      }, 15000); // 15 second hard timeout to prevent server-side timeouts
      
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
        signal: controller.signal, // Add abort signal for timeout
      });
      
      // Clear the timeout if response received
      clearTimeout(timeoutId);

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
        } else {
          throw new Error(`Rate limited by OpenRouter API and exceeded maximum retries (${retry_options.max_retries})`);
        }
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`OpenRouter API request failed: ${response.status} ${response.statusText}`, errorText);
        
        // Enhanced error handling with specific error codes
        if (response.status === 400) {
          // Try to parse the error message
          try {
            const errorJson = JSON.parse(errorText);
            if (errorJson.error && errorJson.error.message) {
              console.error('Parsed error message:', errorJson.error.message);
              
              if (errorJson.error.message.includes('token limit') || 
                  errorJson.error.message.includes('maximum context length')) {
                throw new Error('Your message with attachments exceeds the token limit. Please try with a shorter message or fewer/smaller attachments.');
              }
              
              // Check for file-specific errors
              if (hasAttachments && 
                 (errorJson.error.message.includes('file') || 
                  errorJson.error.message.includes('url') || 
                  errorJson.error.message.includes('attachment'))) {
                throw new Error(`Error processing file: ${errorJson.error.message}`);
              }
              
              throw new Error(errorJson.error.message);
            }
          } catch (e) {
            // If JSON parsing fails, just use the original error text
            if (e instanceof Error) {
              console.error('Error parsing JSON error:', e);
            }
          }
          
          // Generic 400 error
          throw new Error(`Bad request: The API could not process your request. ${hasAttachments ? 'This might be due to issues with your file attachments.' : ''}`);
        }
        
        if (response.status === 401) {
          throw new Error('Authentication error: Invalid or missing API key');
        }
        
        if (response.status === 403) {
          throw new Error('Permission denied: Your API key does not have access to the requested model');
        }
        
        if (response.status === 404) {
          throw new Error(`Model not found: The requested model '${request.model}' is not available`);
        }
        
        if (response.status === 500) {
          throw new Error('Server error: OpenRouter is experiencing issues. Please try again later.');
        }
        
        // Generic error for other status codes
        throw new Error(`OpenRouter API request failed with status ${response.status}`);
      }
      
      if (request.stream) {
        if (!response.body) {
          throw new Error("OpenRouter API returned an empty stream");
        }
        return response.body;
      } else {
        const data = await response.json();
        return data as ChatCompletionResponse;
      }
    } catch (error) {
      // If we've already retried the maximum number of times, throw the error
      if (retries >= retry_options.max_retries) {
        console.error('OpenRouter request failed after maximum retries:', error);
        
        // Add custom messaging for file-related errors
        if (hasAttachments && error instanceof Error) {
          if (error.message.includes('token limit') || error.message.includes('too large')) {
            throw new Error('Your file is too large for the AI to process. Please try with a smaller file or summarize its content.');
          }
          if (error.message.includes('file') || error.message.includes('url') || error.message.includes('attachment')) {
            throw new Error(`File processing error: ${error.message}`);
          }
        }
        
        throw error;
      }
      
      console.warn(`OpenRouter request failed (attempt ${retries + 1}/${retry_options.max_retries}):`, error);
      
      // Only retry for network errors and server errors, not for client errors
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        
        // Don't retry for client errors like invalid API key, bad request, etc.
        if (errorMessage.includes('api key') || 
            errorMessage.includes('authentication') || 
            errorMessage.includes('bad request') ||
            errorMessage.includes('permission denied')) {
          throw error;
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, delay));
      retries++;
      delay = Math.min(delay * retry_options.backoff_factor, retry_options.max_delay);
    }
  }
}

/**
 * Enhanced function to process documents in smaller chunks
 * 
 * @param document The document to process in chunks
 * @param chunkSize The maximum size of each chunk in characters
 * @param chunkOverlap How much overlap between chunks (for context preservation)
 * @returns An array of document chunks
 */
export function chunkDocumentEnhanced(
  text: string, 
  chunkSize: number = 4000, 
  chunkOverlap: number = 200
): string[] {
  if (!text || text.length <= chunkSize) {
    return [text];
  }
  
  const chunks: string[] = [];
  let startPos = 0;
  
  while (startPos < text.length) {
    // Calculate end position with consideration for natural breaks
    let endPos = startPos + chunkSize;
    
    // If we're not at the end of the text
    if (endPos < text.length) {
      // Look for a natural break point (paragraph, sentence, or word boundary)
      // First try to find paragraph breaks
      const paragraphBreak = text.lastIndexOf('\n\n', endPos);
      if (paragraphBreak > startPos && paragraphBreak > endPos - 500) {
        endPos = paragraphBreak;
      } else {
        // Then try sentence breaks
        const sentenceBreak = text.lastIndexOf('. ', endPos);
        if (sentenceBreak > startPos && sentenceBreak > endPos - 200) {
          endPos = sentenceBreak + 1; // Include the period
        } else {
          // Finally, at least break on word boundaries
          const spaceBreak = text.lastIndexOf(' ', endPos);
          if (spaceBreak > startPos) {
            endPos = spaceBreak;
          }
        }
      }
    } else {
      endPos = text.length;
    }
    
    // Extract the chunk
    chunks.push(text.substring(startPos, endPos));
    
    // Calculate next starting position with overlap
    startPos = endPos - chunkOverlap;
    
    // Ensure we're making forward progress
    if (startPos <= 0 || startPos >= endPos) {
      startPos = endPos;
    }
  }
  
  return chunks;
}

/**
 * Process a streaming response with typed chunks
 * 
 * @param stream The ReadableStream from OpenRouter API
 * @param onChunk Callback function to process each chunk
 * @param onComplete Optional callback when stream is complete
 * @param onError Optional callback for error handling
 */
export async function processStreamingResponse(
  stream: ReadableStream,
  onChunk: (chunk: ChatCompletionChunk, text: string, isDone: boolean) => void,
  onComplete?: () => void,
  onError?: (error: Error) => void
): Promise<void> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  
  try {
    while (true) {
      const { value, done } = await reader.read();
      
      if (done) {
        // Process any remaining data in the buffer
        if (buffer.trim()) {
          try {
            const lines = buffer.split('\n').filter(line => line.trim() !== '');
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const jsonStr = line.slice(6).trim();
                if (jsonStr === '[DONE]') continue;
                
                try {
                  const chunk = JSON.parse(jsonStr) as ChatCompletionChunk;
                  const text = chunk.choices[0]?.delta?.content || '';
                  onChunk(chunk, text, true);
                } catch (err) {
                  console.warn('Error parsing final chunk JSON:', err);
                }
              }
            }
          } catch (parseError) {
            console.warn('Error processing final buffer:', parseError);
          }
        }
        
        if (onComplete) onComplete();
        break;
      }
      
      // Decode the chunk and add it to our buffer
      const decodedChunk = decoder.decode(value, { stream: true });
      buffer += decodedChunk;
      
      // Split the buffer on newlines to find complete server-sent events
      const lines = buffer.split('\n');
      
      // Keep the last (potentially incomplete) line in the buffer
      buffer = lines.pop() || '';
      
      // Process all complete lines
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') continue;
          
          try {
            const chunk = JSON.parse(jsonStr) as ChatCompletionChunk;
            const text = chunk.choices[0]?.delta?.content || '';
            onChunk(chunk, text, false);
          } catch (err) {
            console.warn('Error parsing chunk JSON:', err);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error processing stream:', error);
    if (onError) onError(error instanceof Error ? error : new Error(String(error)));
  } finally {
    // Always release the reader
    try {
      await reader.cancel();
    } catch (e) {
      console.warn('Error cancelling reader:', e);
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

/**
 * Send a streaming chat completion request to OpenRouter API
 * 
 * @param request The chat completion request parameters
 * @returns A readable stream for streaming responses
 */
export async function sendStreamingChatCompletion(
  request: ChatCompletionRequest
): Promise<ReadableStream> {
  if (!hasApiKey) {
    console.error("OpenRouter API key is not available")
    throw new Error("OpenRouter API key is not available")
  }
  
  // Create a streaming request with explicit timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
    console.warn('Aborting OpenRouter streaming request due to timeout (10s)');
  }, 10000); // Shorter 10-second timeout for better UX
  
  try {
    console.log(`Starting streaming OpenRouter request to model: ${request.model}`);
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY}`,
        'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_BASE_URL || 'https://ai-dev-education.com'),
        'X-Title': 'AI-Dev Education Platform',
      },
      body: JSON.stringify({
        model: request.model || 'openai/gpt-3.5-turbo',
        messages: request.messages,
        temperature: request.temperature || 0.7,
        max_tokens: request.max_tokens || 1000,
        stream: true,
        response_format: request.response_format,
        safe_mode: request.safe_mode || 'standard'
      }),
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenRouter API streaming request failed: ${response.status} ${response.statusText}`, errorText);
      
      if (response.status === 402) {
        throw new Error('Insufficient credits: Your OpenRouter account needs more credits');
      } else if (response.status === 429) {
        throw new Error('Rate limited: Too many requests in a short time period');
      } else if (response.status === 408) {
        throw new Error('Request timeout: The model took too long to respond');
      } else if (response.status === 502 || response.status === 503) {
        throw new Error('Service unavailable: The AI service is currently experiencing issues');
      }
      
      throw new Error(`OpenRouter API request failed with status ${response.status}`);
    }
    
    if (!response.body) {
      throw new Error("OpenRouter API returned an empty stream");
    }
    
    return response.body;
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('Streaming request failed:', error);
    throw error;
  }
} 