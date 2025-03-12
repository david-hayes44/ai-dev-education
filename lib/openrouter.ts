/**
 * OpenRouter API client for AI chat functionality
 * 
 * This implementation provides a client for interacting with the OpenRouter API,
 * which serves as a unified interface to various AI models like GPT-4, Claude, etc.
 */

// API configuration
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const API_KEY = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
const DEFAULT_MODEL = 'openai/gpt-3.5-turbo';

// Available models - these can be expanded as OpenRouter adds more
export const AVAILABLE_MODELS = [
  { id: 'openai/gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'OpenAI' },
  { id: 'openai/gpt-4', name: 'GPT-4', provider: 'OpenAI' },
  { id: 'anthropic/claude-3-opus', name: 'Claude 3 Opus', provider: 'Anthropic' },
  { id: 'anthropic/claude-3-sonnet', name: 'Claude 3 Sonnet', provider: 'Anthropic' },
  { id: 'anthropic/claude-3-haiku', name: 'Claude 3 Haiku', provider: 'Anthropic' },
  { id: 'meta-llama/llama-3-70b-instruct', name: 'Llama 3 70B', provider: 'Meta' },
  { id: 'google/gemini-pro', name: 'Gemini Pro', provider: 'Google' },
];

// Basic types for the OpenRouter API
export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatCompletionRequest {
  messages: ChatMessage[];
  model: string;
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  stream?: boolean;
  frequency_penalty?: number;
  presence_penalty?: number;
}

export interface ChatCompletionResponse {
  id: string;
  choices: {
    message: ChatMessage;
    finish_reason: string;
    index: number;
  }[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model: string;
}

/**
 * Send a chat completion request to OpenRouter
 * @param request The chat completion request
 * @returns A Promise that resolves to the chat completion response
 */
export async function sendChatCompletion(
  request: ChatCompletionRequest
): Promise<ChatCompletionResponse> {
  if (!API_KEY) {
    console.error("OpenRouter API key is not available");
    throw new Error("OpenRouter API key is not available");
  }
  
  // Default values for optional parameters
  const finalRequest = {
    model: request.model || DEFAULT_MODEL,
    messages: request.messages,
    temperature: request.temperature ?? 0.7,
    max_tokens: request.max_tokens ?? 1000,
    top_p: request.top_p ?? 1,
    frequency_penalty: request.frequency_penalty ?? 0,
    presence_penalty: request.presence_penalty ?? 0,
    stream: request.stream ?? false,
  };
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'HTTP-Referer': 'https://ai-dev-education-platform.vercel.app', // Replace with your actual domain
        'X-Title': 'AI-Dev Education Platform',
      },
      body: JSON.stringify(finalRequest),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('OpenRouter API error:', errorData);
      throw new Error(`OpenRouter API error: ${response.status} ${errorData.error || 'Unknown error'}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error calling OpenRouter API:', error);
    
    // If we're in development mode, return a fallback response
    if (process.env.NODE_ENV === 'development' && !API_KEY) {
      console.warn('Using fallback response in development mode');
      return {
        id: "dev-fallback-id",
        model: finalRequest.model,
        choices: [
          {
            message: {
              role: "assistant",
              content: "This is a fallback response because the OpenRouter API key is not available. Please set NEXT_PUBLIC_OPENROUTER_API_KEY in your .env.local file."
            },
            finish_reason: "stop",
            index: 0
          }
        ]
      };
    }
    
    throw error;
  }
}

/**
 * Get the available models from OpenRouter
 * @returns An array of available models
 */
export function getAvailableModels() {
  return AVAILABLE_MODELS;
}

/**
 * Get a model by ID
 * @param id The model ID
 * @returns The model object or undefined if not found
 */
export function getModelById(id: string) {
  return AVAILABLE_MODELS.find(model => model.id === id);
} 