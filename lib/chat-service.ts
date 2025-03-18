import { ChatMessage, sendChatCompletion, processStreamingResponse, ChatCompletionChunk } from './openrouter';
import { ContentChunk } from './content-indexing-service';
import OpenAI from "openai";
import { v4 as uuidv4 } from "uuid";

// Define message types
export type MessageRole = "user" | "assistant" | "system";

export interface FileAttachment {
  id: string;
  name: string;
  url: string;
  path: string;
  type: string;
  size: number;
  thumbnailUrl?: string;
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number | Date;
  metadata?: MessageMetadata;
  isStreaming?: boolean;
  attachments?: FileAttachment[];
}

export type MessageMetadataType = "streaming" | "error" | "loading" | "thinking" | "suggestion" | "concept_explanation";

export interface MessageMetadata {
  type?: MessageMetadataType;
  [key: string]: MessageMetadataType | string | number | boolean | undefined;
}

// Context information for the chat
export interface ChatContext {
  relevantContent?: ContentChunk[];
  currentPage?: string;
  pageTitle?: string;
  pageDescription?: string;
}

// Configuration for the OpenRouter API
interface OpenRouterConfig {
  apiKey: string;
  baseURL: string;
  model: string;
}

// Available AI models
export interface AIModel {
  id: string;
  name: string;
  provider: string;
  description: string;
}

export const AVAILABLE_MODELS: AIModel[] = [
  {
    id: 'anthropic/claude-3.7-sonnet:beta',
    name: 'Claude 3.7 Sonnet',
    provider: 'Anthropic',
    description: 'Anthropic\'s advanced model optimized for thoughtful, nuanced responses and complex reasoning.'
  },
  {
    id: 'google/gemini-2.0-flash-thinking-exp:free',
    name: 'Gemini 2.0 Flash Thinking',
    provider: 'Google',
    description: 'Google\'s fast, efficient model with experimental thinking capabilities. Great for exploration and rapid responses.'
  },
  {
    id: 'google/gemma-3-27b-it:free',
    name: 'Gemma 3 27B',
    provider: 'Google',
    description: 'Google\'s open model based on Gemini technology, providing powerful capabilities with 27B parameters.'
  },
  {
    id: 'deepseek/deepseek-r1:free',
    name: 'DeepSeek R1',
    provider: 'DeepSeek',
    description: 'DeepSeek\'s cutting-edge research model with strong capabilities in reasoning and problem-solving.'
  }
];

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  topic?: string; // Main topic for this chat session
  category?: string; // Category for grouping similar chat sessions
  model?: string; // Which model is being used for this session
}

// Constants for token management
const MAX_CONTEXT_TOKENS = 4000; // Conservative maximum tokens for context
const APPROX_TOKENS_PER_CHAR = 0.33; // Very rough approximation of tokens per character
const MAX_MESSAGES_PER_CHUNK = 20; // Maximum messages to display in a single chunk

// Add documentation context snippets for injecting relevant content
interface DocumentationSnippet {
  topic: string;
  keywords: string[];
  content: string;
}

// Sample documentation snippets (should be expanded in a real implementation)
const DOCUMENTATION_SNIPPETS: DocumentationSnippet[] = [
  {
    topic: "MCP Overview",
    keywords: ["mcp", "model context protocol", "context protocol"],
    content: "The Model Context Protocol (MCP) is a standardized approach for managing context in AI-assisted development workflows. It defines how context is stored, shared, and synchronized across different tools and environments."
  },
  {
    topic: "MCP Servers",
    keywords: ["mcp server", "server", "context server", "architecture"],
    content: "MCP servers act as a central repository for context data. They provide APIs for storing and retrieving context, authentication, and synchronization between different development environments."
  },
  {
    topic: "Context Management",
    keywords: ["context", "context window", "token limit", "context management"],
    content: "Context management in MCP involves strategies for collecting, prioritizing, and windowing information to stay within token limits while providing the most relevant information to LLMs."
  }
];

/**
 * Construct a system message with relevant content
 */
function constructSystemMessageWithContent(
  baseContent: string,
  relevantContent: ContentChunk[]
): string {
  if (!relevantContent.length) {
    return baseContent;
  }
  
  // Format relevant content sections
  const contentSections = relevantContent.map(chunk => {
    return `
Source: ${chunk.source}
Title: ${chunk.title}
Content: ${chunk.content.substring(0, 500)}${chunk.content.length > 500 ? '...' : ''}
URL: ${chunk.path}
`;
  }).join('\n---\n');
  
  // Append relevant content to base system message
  return `${baseContent}

Relevant site content:
${contentSections}

Use the above relevant site content to provide accurate and helpful responses when applicable.`;
}

export class ChatService {
  private static instance: ChatService;
  private currentSessionId: string | null = null;
  private sessions: Record<string, ChatSession> = {};
  private currentPage: string = ""; // Track the current page the user is viewing
  private selectedModel: string = 'google/gemini-2.0-flash-thinking-exp:free'; // Default model
  private messages: Message[] = [];
  private openai: OpenAI;
  private config: OpenRouterConfig;
  
  // Add chunking properties
  private messageChunks: Message[][] = [];
  private currentChunkIndex: number = 0;
  
  // Add property for debounced saving
  private saveTimeoutId: NodeJS.Timeout | null = null;
  
  private constructor() {
    // Initialize with OpenRouter configuration
    this.config = {
      apiKey: process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || "",
      baseURL: "https://openrouter.ai/api/v1",
      model: "anthropic/claude-3-opus:1:0",
    };

    // Initialize OpenAI client for use with OpenRouter
    this.openai = new OpenAI({
      apiKey: this.config.apiKey,
      baseURL: this.config.baseURL,
      dangerouslyAllowBrowser: true
    });

    // Add initial system message
    this.messages.push({
      id: uuidv4(),
      role: "system",
      content: this.getSystemPrompt(),
      timestamp: Date.now(),
    });
    
    // Load sessions from localStorage if needed
    this.loadSessions();
    this.loadSelectedModel();
  }
  
  public static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }
  
  // Method to chunk messages for better performance
  private chunkMessages(messages: Message[]): Message[][] {
    // If we have fewer messages than the chunk size, just return a single chunk
    if (messages.length <= MAX_MESSAGES_PER_CHUNK) {
      return [messages];
    }
    
    // Create chunks of messages
    const chunks: Message[][] = [];
    for (let i = 0; i < messages.length; i += MAX_MESSAGES_PER_CHUNK) {
      chunks.push(messages.slice(i, i + MAX_MESSAGES_PER_CHUNK));
    }
    
    return chunks;
  }
  
  // Get current chunk of messages
  public getCurrentChunk(): Message[] {
    if (this.messageChunks.length === 0) {
      return [];
    }
    
    return this.messageChunks[this.currentChunkIndex];
  }
  
  // Get all messages (useful for API calls)
  public getAllMessages(): Message[] {
    // If we have a current session, use its messages
    if (this.currentSessionId && this.sessions[this.currentSessionId]) {
      return this.sessions[this.currentSessionId].messages;
    }
    
    // Otherwise, use the chunked messages if available
    if (this.messageChunks.length > 0) {
      return this.messageChunks.flat();
    }
    
    // Fallback to legacy this.messages array
    console.warn('Using fallback messages array - this should be rare');
    return this.messages;
  }
  
  // Navigate to next chunk
  public nextChunk(): boolean {
    if (this.currentChunkIndex < this.messageChunks.length - 1) {
      this.currentChunkIndex++;
      return true;
    }
    return false;
  }
  
  // Navigate to previous chunk
  public previousChunk(): boolean {
    if (this.currentChunkIndex > 0) {
      this.currentChunkIndex--;
      return true;
    }
    return false;
  }
  
  // Get total number of chunks
  public getTotalChunks(): number {
    return this.messageChunks.length;
  }
  
  // Get current chunk index
  public getCurrentChunkIndex(): number {
    return this.currentChunkIndex;
  }
  
  private loadSessions() {
    if (typeof window === 'undefined') return;
    
    try {
      const sessionsJson = localStorage.getItem('chatSessions');
      
      if (sessionsJson) {
        this.sessions = JSON.parse(sessionsJson);
        
        // For backwards compatibility, update any sessions that don't have the model field
        Object.values(this.sessions).forEach(session => {
          if (!session.model) {
            session.model = this.selectedModel;
          }
          
          // Ensure all sessions have proper timestamps
          if (!session.createdAt) {
            session.createdAt = Date.now();
          }
          
          if (!session.updatedAt) {
            session.updatedAt = Date.now();
          }
        });
        
        // Set current session
        const currentId = localStorage.getItem('currentSessionId');
        if (currentId && this.sessions[currentId]) {
          this.currentSessionId = currentId;
          
          // Apply chunking to the current session messages
          this.messageChunks = this.chunkMessages(this.sessions[currentId].messages);
          this.currentChunkIndex = this.messageChunks.length - 1; // Start at the most recent chunk
        }
      }
      
      // Handle the case where we have sessions but no current session
      if (Object.keys(this.sessions).length > 0 && !this.currentSessionId) {
        // Get the most recently updated session
        const sortedSessions = Object.entries(this.sessions)
          .sort(([, a], [, b]) => b.updatedAt - a.updatedAt);
        
        if (sortedSessions.length > 0) {
          this.currentSessionId = sortedSessions[0][0];
          this.messageChunks = this.chunkMessages(this.sessions[this.currentSessionId].messages);
          this.currentChunkIndex = this.messageChunks.length - 1;
          
          // Also save this to localStorage
          localStorage.setItem('currentSessionId', this.currentSessionId);
        }
      }
    } catch (e) {
      console.error('Error loading chat sessions:', e);
      // If there was an error, clear the localStorage and start fresh
      localStorage.removeItem('chatSessions');
      localStorage.removeItem('currentSessionId');
      this.sessions = {};
      this.currentSessionId = null;
      this.messageChunks = [[]];
      this.currentChunkIndex = 0;
    }
  }
  
  private saveSessions() {
    if (typeof window === 'undefined') return;
    
    try {
      // Ensure the current session is properly updated if we have one
      if (this.currentSessionId && this.sessions[this.currentSessionId]) {
        const session = this.sessions[this.currentSessionId];
        
        // Make sure the messages are up-to-date from the chunks if needed
        if (this.messageChunks.length > 0) {
          session.messages = this.getAllMessages();
        }
        
        // Update the timestamp
        session.updatedAt = Date.now();
      }
      
      // Add debouncing to avoid too frequent saves
      if (this.saveTimeoutId !== null) {
        clearTimeout(this.saveTimeoutId);
      }
      
      this.saveTimeoutId = setTimeout(() => {
        localStorage.setItem('chatSessions', JSON.stringify(this.sessions));
        if (this.currentSessionId) {
          localStorage.setItem('currentSessionId', this.currentSessionId);
        }
        console.log('Sessions saved to localStorage');
      }, 300); // Debounce by 300ms
    } catch (e) {
      console.error('Error saving chat sessions:', e);
    }
  }
  
  private loadSelectedModel() {
    if (typeof window !== 'undefined') {
      const savedModel = localStorage.getItem('selected-model');
      if (savedModel) {
        // Verify it's a valid model before setting
        const isValidModel = AVAILABLE_MODELS.some(model => model.id === savedModel);
        if (isValidModel) {
          this.selectedModel = savedModel;
        }
      }
    }
  }
  
  private saveSelectedModel() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('selected-model', this.selectedModel);
    }
  }
  
  public setCurrentPage(page: string) {
    this.currentPage = page;
  }
  
  public getCurrentPage(): string {
    return this.currentPage;
  }
  
  public setModel(modelId: string): boolean {
    // Verify it's a valid model
    const isValidModel = AVAILABLE_MODELS.some(model => model.id === modelId);
    if (!isValidModel) return false;
    
    this.selectedModel = modelId;
    this.saveSelectedModel();
    
    // Update the current session model if one exists
    if (this.currentSessionId && this.sessions[this.currentSessionId]) {
      this.sessions[this.currentSessionId].model = modelId;
      this.saveSessions();
    }
    
    return true;
  }
  
  public getSelectedModel(): string {
    return this.selectedModel;
  }
  
  public getAvailableModels(): AIModel[] {
    return AVAILABLE_MODELS;
  }
  
  public createSession(initialTopic?: string): string {
    const id = Date.now().toString();
    this.sessions[id] = {
      id,
      title: initialTopic ? `${initialTopic} Chat` : 'New Chat',
      topic: initialTopic || undefined,
      model: this.selectedModel, // Set the current model for the session
      messages: [
        {
          id: 'system-1',
          role: 'system',
          content: 'You are an AI assistant for the AI-Dev Education platform. You help users learn about AI-assisted development and Model Context Protocol (MCP). Be concise, accurate, and helpful.',
          timestamp: Date.now()
        },
        {
          id: 'assistant-1',
          role: 'assistant',
          content: '👋 Hello! I\'m your AI assistant for AI-Dev Education. How can I help you learn about AI-assisted development and MCP today?',
          timestamp: Date.now()
        }
      ],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    this.currentSessionId = id;
    this.saveSessions();
    return id;
  }
  
  // Create a function to determine the topic category from content
  private categorizeContent(content: string): { topic?: string, category?: string } {
    const lowerContent = content.toLowerCase();
    
    // Check for MCP related topics
    if (lowerContent.includes('mcp') || 
        lowerContent.includes('model context protocol') ||
        lowerContent.includes('context protocol')) {
      return { topic: 'MCP', category: 'Model Context Protocol' };
    }
    
    // Check for AI development topics
    if (lowerContent.includes('ai-assisted') || 
        lowerContent.includes('ai assisted') ||
        lowerContent.includes('ai development') ||
        lowerContent.includes('prompt engineering')) {
      return { topic: 'AI-Dev', category: 'AI Development' };
    }
    
    // Check for Cursor related topics
    if (lowerContent.includes('cursor') || 
        lowerContent.includes('ide') ||
        lowerContent.includes('editor')) {
      return { topic: 'Cursor', category: 'Tools' };
    }
    
    // Check for MCP servers
    if (lowerContent.includes('server') || 
        lowerContent.includes('api') ||
        lowerContent.includes('backend')) {
      return { topic: 'Servers', category: 'MCP Servers' };
    }
    
    // Default case
    return { topic: undefined, category: undefined };
  }
  
  /**
   * Estimate the number of tokens in a string
   * This is a very rough approximation
   */
  private estimateTokens(text: string): number {
    return Math.ceil(text.length * APPROX_TOKENS_PER_CHAR);
  }
  
  /**
   * Apply context windowing to stay within token limits
   */
  private applyContextWindowing(messages: Message[]): Message[] {
    if (!messages.length) return [];
    
    // Always keep the system message and latest messages
    const systemMessages = messages.filter(m => m.role === 'system');
    const userMessages = messages.filter(m => m.role !== 'system');
    
    // If we don't have many messages, return everything
    if (userMessages.length <= 4) return messages;
    
    // Calculate tokens for system messages
    let totalTokens = systemMessages.reduce((sum, msg) => sum + this.estimateTokens(msg.content), 0);
    
    // Always include the most recent message pair (user + assistant)
    const recentMessages: Message[] = [];
    
    // We'll work backwards from the end to ensure most recent messages are kept
    for (let i = userMessages.length - 1; i >= 0; i--) {
      const currentMessage = userMessages[i];
      const estimatedTokens = this.estimateTokens(currentMessage.content);
      
      // If adding this message would exceed our limit, stop
      if (totalTokens + estimatedTokens > MAX_CONTEXT_TOKENS) {
        // Mark the last included message as truncated for UI purposes
        if (recentMessages.length > 0) {
          const firstIncludedMsg = recentMessages[recentMessages.length - 1];
          firstIncludedMsg.metadata = {
            ...firstIncludedMsg.metadata,
            truncated: true
          };
        }
        break;
      }
      
      // Otherwise, add the message and update token count
      recentMessages.push(currentMessage);
      totalTokens += estimatedTokens;
    }
    
    // Reverse the recent messages to restore chronological order
    return [...systemMessages, ...recentMessages.reverse()];
  }
  
  /**
   * Find relevant documentation snippets based on the conversation
   */
  private findRelevantDocumentation(content: string): string[] {
    const relevantSnippets: string[] = [];
    const lowerContent = content.toLowerCase();
    
    for (const snippet of DOCUMENTATION_SNIPPETS) {
      // Check if any keywords match the content
      if (snippet.keywords.some(keyword => lowerContent.includes(keyword.toLowerCase()))) {
        relevantSnippets.push(`${snippet.topic}: ${snippet.content}`);
      }
    }
    
    return relevantSnippets;
  }
  
  /**
   * Inject relevant documentation into system messages
   */
  private injectDocumentationContext(messages: Message[], userContent: string): Message[] {
    const relevantDocs = this.findRelevantDocumentation(userContent);
    
    if (relevantDocs.length === 0) return messages;
    
    // Create a copy of the messages
    const enhancedMessages = [...messages];
    
    // Create or update the system message with documentation context
    const systemMessageIndex = enhancedMessages.findIndex(m => m.role === 'system');
    
    if (systemMessageIndex !== -1) {
      // Update existing system message
      enhancedMessages[systemMessageIndex] = {
        ...enhancedMessages[systemMessageIndex],
        content: `${enhancedMessages[systemMessageIndex].content}\n\nRelevant documentation: ${relevantDocs.join(' ')}`
      };
    } else {
      // Create a new system message
      enhancedMessages.unshift({
        id: `system-${Date.now()}`,
        role: 'system',
        content: `You are an AI assistant for the AI-Dev Education platform. Help users learn about AI-assisted development and Model Context Protocol (MCP). Be concise, accurate, and helpful.\n\nRelevant documentation: ${relevantDocs.join(' ')}`,
        timestamp: Date.now()
      });
    }
    
    return enhancedMessages;
  }
  
  /**
   * Get formatted messages for the API, applying context management
   */
  private getApiMessages(userContent?: string): ChatMessage[] {
    if (!this.currentSessionId) return [];
    
    const session = this.sessions[this.currentSessionId];
    
    // Get messages to send (excluding any that are currently streaming)
    let messagesToSend = session.messages
      .filter(msg => !msg.isStreaming)
      .map(msg => ({
        role: msg.role,
        content: msg.content
      }));
    
    // Apply context windowing to stay within token limits
    const windowedMessages = this.applyContextWindowing(session.messages);
    
    // Convert windowed messages to API format
    messagesToSend = windowedMessages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
    
    // Inject documentation context if we have user content
    if (userContent) {
      // Find relevant documentation
      const enhancedMessages = this.injectDocumentationContext(windowedMessages, userContent);
      
      // Convert to API format
      messagesToSend = enhancedMessages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
    }
    
    return messagesToSend;
  }
  
  // Send a message and get a response
  async sendMessage(content: string, context?: ChatContext): Promise<Message> {
    if (!this.currentSessionId) {
      this.createSession();
    }
    
    if (!this.currentSessionId) {
      throw new Error("Failed to create session");
    }
    
    const session = this.sessions[this.currentSessionId];

    // Create the user message
    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content,
      timestamp: Date.now()
    };
    
    // Add user message to the conversation
    session.messages.push(userMessage);
    session.updatedAt = Date.now();
    
    try {
      // Call our server-side API route instead of OpenRouter directly
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          messages: this.messages.map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
          context: context
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }

      // Parse the response
      const responseData = await response.json();
      
      // Create assistant message
      const assistantMessage: Message = {
        id: responseData.id || uuidv4(),
        role: "assistant",
        content: responseData.content,
        timestamp: Date.now(),
      };
      
      this.messages.push(assistantMessage);
      
      // After adding the new messages, rechunk
      this.messageChunks = this.chunkMessages(this.sessions[this.currentSessionId].messages);
      this.currentChunkIndex = this.messageChunks.length - 1; // Navigate to the last chunk
      
      return assistantMessage;
    } catch (error) {
      console.error("Error calling chat API:", error);
      throw error;
    }
  }
  
  /**
   * Creates a placeholder message for the assistant's response during streaming
   */
  public createAssistantMessagePlaceholder(userContent: string, attachments?: FileAttachment[]): Message {
    if (!this.currentSessionId) {
      this.createSession();
    }
    
    if (!this.currentSessionId) {
      throw new Error("Failed to create session");
    }
    
    const session = this.sessions[this.currentSessionId];
    
    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userContent,
      timestamp: Date.now(),
      attachments
    };
    
    // Add placeholder assistant message
    const assistantPlaceholder: Message = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      isStreaming: true,
      metadata: { type: "loading" } // Explicitly set the loading metadata
    };
    
    session.messages.push(userMessage, assistantPlaceholder);
    session.updatedAt = Date.now();
    
    // Update message chunks based on session messages
    this.messageChunks = this.chunkMessages(session.messages);
    this.currentChunkIndex = this.messageChunks.length - 1; // Navigate to the last chunk
    
    this.saveSessions();
    
    return assistantPlaceholder;
  }
  
  /**
   * Updates the assistant message with an error when streaming fails
   */
  public updateAssistantMessageWithError(error: unknown): void {
    if (!this.currentSessionId) return;
    
    const session = this.sessions[this.currentSessionId];
    const lastMessage = session.messages[session.messages.length - 1];
    
    if (lastMessage && lastMessage.role === 'assistant') {
      lastMessage.content = `I'm sorry, I encountered an error while generating a response. ${error instanceof Error ? error.message : 'Please try again later.'}`;
      lastMessage.isStreaming = false;
      lastMessage.metadata = { type: "error" }; // Explicitly mark as error type
      
      // Update message chunks based on session messages
      this.messageChunks = this.chunkMessages(session.messages);
      this.currentChunkIndex = this.messageChunks.length - 1;
      
      session.updatedAt = Date.now();
      this.saveSessions();
    }
  }
  
  /**
   * Sends a streaming message with enhanced context management
   */
  public async sendStreamingMessage(
    content: string, 
    relevantContent: ContentChunk[] = [],
    onChunk: (message: Message) => void
  ): Promise<Message> {
    try {
      // Check if chatService is initialized
      if (!this) {
        console.error("Chat service not initialized properly");
        throw new Error("Chat service not initialized");
      }

      // Get the latest placeholder message (which should be the one we just created)
      const session = this.sessions[this.currentSessionId!];
      const messages = session.messages;
      const placeholderMessageIndex = messages.findIndex(
        m => m.role === "assistant" && m.metadata?.type === "loading"
      );
      
      if (placeholderMessageIndex === -1) {
        throw new Error("No placeholder message found");
      }
      
      const placeholderMessage = messages[placeholderMessageIndex];
      const userMessageIndex = placeholderMessageIndex - 1;
      
      if (userMessageIndex < 0 || messages[userMessageIndex].role !== "user") {
        throw new Error("No user message found before placeholder");
      }
      
      const userMessage = messages[userMessageIndex];
      
      // Detailed logging for file attachment information if present
      if (userMessage.attachments && userMessage.attachments.length > 0) {
        console.log(`Starting streaming message with ${userMessage.attachments.length} file attachments:`);
        userMessage.attachments.forEach((attachment, index) => {
          const fileSize = Math.round(attachment.size/1024);
          const urlPreview = attachment.url ? attachment.url.substring(0, 50) + (attachment.url.length > 50 ? '...' : '') : 'No URL';
          console.log(`File ${index+1}: ${attachment.name} (${attachment.type}), Size: ${fileSize}KB, URL: ${urlPreview}`);
          
          // URL validation - check if URL is accessible or properly formatted
          if (attachment.url) {
            if (attachment.url.startsWith('data:')) {
              console.log(`File ${index+1} using data URL (${Math.round(attachment.url.length/1024)}KB in size)`);
            } else if (attachment.url.startsWith('http')) {
              // Check if URL is accessible for HTTP URLs
              fetch(attachment.url, { method: 'HEAD' })
                .then(response => {
                  console.log(`File ${index+1} URL check: ${response.ok ? 'Accessible' : 'Not accessible'} (${response.status})`);
                })
                .catch(err => {
                  console.error(`File ${index+1} URL check failed:`, err);
                });
            } else {
              console.warn(`File ${index+1} has unusual URL format: ${attachment.url.substring(0, 20)}...`);
            }
          } else {
            console.error(`File ${index+1} is missing URL`);
          }
        });
      }
      
      // Create API-compatible messages with system prompt and context
      const apiMessages = this.getApiMessagesWithAttachments(
        content, 
        userMessage.attachments
      );
      
      // Create an enhanced system message with content context
      if (relevantContent.length > 0) {
        const contextMessage = this.generateContextMessage({ relevantContent });
        
        // Find the system message
        const systemMessageIndex = apiMessages.findIndex(m => m.role === "system");
        if (systemMessageIndex !== -1) {
          // Add context to the existing system message
          apiMessages[systemMessageIndex].content += "\n\n" + contextMessage;
        }
      }
      
      // Create a response string to accumulate the streamed response
      let responseContent = "";
      const streamingMessage = { ...placeholderMessage };
      
      try {
        // API Key validation
        if (!process.env.NEXT_PUBLIC_OPENROUTER_API_KEY) {
          throw new Error("OpenRouter API key is missing or invalid");
        }
        
        // Model validation
        console.log(`Selected model for streaming: ${this.selectedModel}`);
        
        // Add model validation logic
        const validModels = AVAILABLE_MODELS.map(m => m.id);
        if (!validModels.includes(this.selectedModel)) {
          console.warn(`Selected model ${this.selectedModel} not in valid models list. Using default model instead.`);
          this.selectedModel = AVAILABLE_MODELS[0].id; // Use the first available model as fallback
        }
        
        // Stream the response
        console.log(`Sending API request to OpenRouter with ${apiMessages.length} messages.`);
        if (userMessage.attachments?.length) {
          console.log(`Request includes ${userMessage.attachments.length} file attachments.`);
        }
        
        const response = await sendChatCompletion({
          messages: apiMessages,
          model: this.selectedModel,
          stream: true,
          temperature: 0.7,
          max_tokens: 4000,
          safe_mode: 'none', // Disable content filtering since we're dealing with file content
        }) as ReadableStream;
        
        console.log('Successfully received OpenRouter stream response');
        
        await processStreamingResponse(
          response,
          (chunk: ChatCompletionChunk) => {
            // Extract content from the chunk
            const content = chunk.choices[0]?.delta?.content || "";
            
            // Check for error or file access indicators in the content
            if (content.toLowerCase().includes('error') || 
                (userMessage.attachments?.length && 
                (content.toLowerCase().includes('cannot access') || 
                 content.toLowerCase().includes('unable to access') ||
                 content.toLowerCase().includes('could not access') ||
                 content.toLowerCase().includes('unable to view')))) {
              console.warn('Detected potential file access issue in response:', content);
            }
            
            // Append to accumulated response
            responseContent += content;
            
            // Update the streaming message
            streamingMessage.content = responseContent;
            streamingMessage.isStreaming = true;
            
            // Replace the message in the current session's messages array
            session.messages[placeholderMessageIndex] = streamingMessage;
            
            // Call the provided callback
            onChunk(streamingMessage);
          },
          () => {
            // When streaming is complete, remove the loading metadata and streaming flag
            
            // Check if we have an empty response
            if (!responseContent.trim()) {
              console.error("Empty response received from OpenRouter API");
              responseContent = "I'm sorry, I couldn't process your request. This might be due to an issue accessing your attached file or a temporary problem with the AI service.";
              
              // Add more context if there are file attachments
              if (userMessage.attachments?.length) {
                responseContent += " When working with files, please ensure they are in a supported format (text, images, PDFs) and not too large.";
              }
              
              streamingMessage.metadata = { type: "error" };
            } else {
              streamingMessage.metadata = undefined;
            }
            
            streamingMessage.isStreaming = false;
            streamingMessage.content = responseContent;
            session.messages[placeholderMessageIndex] = streamingMessage;
            
            // Rechunk messages if needed
            this.messageChunks = this.chunkMessages(session.messages);
            this.currentChunkIndex = this.messageChunks.length - 1; // Navigate to latest chunk
            
            // Save sessions
            this.saveSessions();
            
            // Call the callback one final time
            onChunk(streamingMessage);
            
            console.log("Streaming message completed successfully");
          },
          (error) => {
            console.error("Error during streaming response:", error);
            
            // Format error message for display
            let errorMessage = "I'm sorry, I encountered an error while generating a response.";
            
            if (error instanceof Error) {
              errorMessage += ` Error details: ${error.message}`;
              console.error('Error object:', error);
              
              // Add specific error handling for file-related issues
              if (userMessage.attachments?.length) {
                if (error.message.toLowerCase().includes('token') || 
                    error.message.toLowerCase().includes('limit')) {
                  errorMessage = "I couldn't process your file due to token limits. The file may be too large. Try uploading a smaller portion or summarizing its content.";
                } else if (error.message.toLowerCase().includes('url') || 
                          error.message.toLowerCase().includes('access') ||
                          error.message.toLowerCase().includes('file')) {
                  errorMessage = "I couldn't access the file you uploaded. The URL might be invalid, expired, or the file format isn't supported.";
                }
              }
            } else if (typeof error === 'string') {
              errorMessage += ` Error details: ${error}`;
            }
            
            // Update the streaming message with the error
            streamingMessage.content = errorMessage;
            streamingMessage.metadata = { type: "error" };
            streamingMessage.isStreaming = false;
            session.messages[placeholderMessageIndex] = streamingMessage;
            
            // Rechunk messages
            this.messageChunks = this.chunkMessages(session.messages);
            this.currentChunkIndex = this.messageChunks.length - 1;
            
            // Save sessions
            this.saveSessions();
            
            // Call the callback with the error message
            onChunk(streamingMessage);
          }
        );
      } catch (streamError) {
        console.error("Streaming API call failed:", streamError);
        
        // Create a fallback error message
        let errorContent = `I'm sorry, I encountered an error while processing your request.`;
        
        if (streamError instanceof Error) {
          console.error('Stream error object:', streamError);
          
          // Add specific error handling for file-related issues
          if (userMessage.attachments?.length) {
            if (streamError.message.toLowerCase().includes('token') || 
                streamError.message.toLowerCase().includes('limit')) {
              errorContent = "I couldn't process your file due to its size. The file may be too large for my current capabilities. Try uploading a smaller portion or summarizing its content.";
            } else if (streamError.message.toLowerCase().includes('url') || 
                      streamError.message.toLowerCase().includes('access') ||
                      streamError.message.toLowerCase().includes('file')) {
              errorContent = "I couldn't access the file you uploaded. The URL might be invalid, expired, or the file format isn't supported.";
            } else {
              errorContent += ` Error details: ${streamError.message}`;
            }
          } else {
            errorContent += ` Error details: ${streamError.message}`;
          }
        } else {
          errorContent += ' Please try again later.';
        }
        
        streamingMessage.content = errorContent;
        streamingMessage.metadata = { type: "error" };
        streamingMessage.isStreaming = false;
        
        // Update the message in the session
        session.messages[placeholderMessageIndex] = streamingMessage;
        
        // Rechunk and save
        this.messageChunks = this.chunkMessages(session.messages);
        this.currentChunkIndex = this.messageChunks.length - 1;
        this.saveSessions();
        
        // Call the callback
        onChunk(streamingMessage);
      }
      
      return session.messages[placeholderMessageIndex];
    } catch (error) {
      console.error("Error in sendStreamingMessage:", error);
      throw error;
    }
  }
  
  private generateTitle(content: string): string {
    // Generate a title from the first user message
    return content.length > 30 ? content.substring(0, 30) + '...' : content;
  }
  
  public getSessions(): ChatSession[] {
    return Object.values(this.sessions).sort((a, b) => b.updatedAt - a.updatedAt);
  }
  
  public getSessionsByCategory(): Record<string, ChatSession[]> {
    const categories: Record<string, ChatSession[]> = {};
    
    // Get all sessions
    const allSessions = this.getSessions();
    
    // First, add categorized sessions
    allSessions.forEach(session => {
      if (session.category) {
        if (!categories[session.category]) {
          categories[session.category] = [];
        }
        categories[session.category].push(session);
      }
    });
    
    // Then add uncategorized sessions to "General"
    const uncategorized = allSessions.filter(session => !session.category);
    if (uncategorized.length > 0) {
      categories['General'] = uncategorized;
    }
    
    return categories;
  }
  
  public getSession(id: string): ChatSession | null {
    return this.sessions[id] || null;
  }
  
  public getCurrentSession(): ChatSession | null {
    if (!this.currentSessionId) return null;
    
    const session = { ...this.sessions[this.currentSessionId] };
    
    // If we're using chunking, only return the current chunk of messages
    if (this.messageChunks.length > 0) {
      session.messages = this.getCurrentChunk();
    }
    
    return session;
  }
  
  public setCurrentSession(id: string): boolean {
    if (this.sessions[id]) {
      this.currentSessionId = id;
      return true;
    }
    return false;
  }
  
  public deleteSession(id: string): boolean {
    if (this.sessions[id]) {
      delete this.sessions[id];
      this.saveSessions();
      
      // If the deleted session was the current one, set a new current session
      if (this.currentSessionId === id) {
        const sessions = this.getSessions();
        this.currentSessionId = sessions.length > 0 ? sessions[0].id : null;
        
        if (!this.currentSessionId) {
          this.createSession(); // Create a new session if none exists
        }
      }
      
      return true;
    }
    return false;
  }
  
  public renameSession(id: string, title: string): boolean {
    if (this.sessions[id]) {
      this.sessions[id].title = title;
      this.saveSessions();
      return true;
    }
    return false;
  }
  
  public setCategoryForSession(id: string, category: string): boolean {
    const session = this.getSession(id);
    if (session) {
      session.category = category;
      this.saveSessions();
      return true;
    }
    return false;
  }
  
  /**
   * Reset the current chat session by clearing messages
   */
  public resetChat(): void {
    if (!this.currentSessionId) return;
    
    const session = this.sessions[this.currentSessionId];
    if (session) {
      session.messages = [];
      session.updatedAt = Date.now();
      
      // Reset chunks
      this.messageChunks = [[]];
      this.currentChunkIndex = 0;
      
      this.saveSessions();
    }
  }
  
  // Get the system prompt for setting up the assistant
  private getSystemPrompt(): string {
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

  // Process and format content for chat context
  private formatContentContext(content: ContentChunk[]): string {
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

  // Generate a context message based on provided context info
  private generateContextMessage(context?: ChatContext): string {
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
      contextMessage += `\nRELEVANT CONTENT:\n${this.formatContentContext(context.relevantContent)}\n`;
    }

    return contextMessage;
  }

  /**
   * Get file content summary to include in context
   */
  private getFileContentSummary(attachments?: FileAttachment[]): string {
    if (!attachments || attachments.length === 0) {
      return '';
    }
    
    // Log for debugging
    console.log(`Preparing content summary for ${attachments.length} attachments`);
    
    const fileDetails = attachments.map(file => {
      // Get file extension from name or detect from type
      const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
      const isImage = file.type.startsWith('image/');
      const isText = file.type.includes('text') || ['txt', 'md', 'json', 'csv', 'html', 'css', 'js', 'jsx', 'ts', 'tsx'].includes(fileExt);
      const isDocument = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(fileExt);
      const isCode = ['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'c', 'cpp', 'cs', 'go', 'rb', 'php', 'swift', 'kt'].includes(fileExt);
      
      let fileDescription = `File: ${file.name} (${Math.round(file.size/1024)} KB, ${file.type})`;
      
      // Add specific file type context and instructions based on file type
      if (isImage) {
        fileDescription += "\nThis is an image file. Please analyze the visual content and provide observations.";
        fileDescription += "\nInstructions: Describe what you see in the image, including any text, objects, people, or scenes.";
        fileDescription += "\nIf you cannot access the image, please inform the user that you're unable to view the image.";
      } else if (isCode) {
        fileDescription += "\nThis is a code file. Please analyze the code and provide insights.";
        fileDescription += "\nInstructions: Explain what the code does, identify any potential issues, and suggest improvements if appropriate.";
        fileDescription += `\nThis appears to be ${this.getLanguageFromExtension(fileExt)} code.`;
      } else if (isDocument) {
        fileDescription += "\nThis is a document file. Please try to extract and analyze the text content.";
        fileDescription += "\nInstructions: Summarize the key points from the document, focusing on the main topics and important details.";
        fileDescription += "\nIf you cannot access the document content, please inform the user.";
      } else if (isText) {
        fileDescription += "\nThis is a text file. Please analyze the content and provide insights.";
        fileDescription += "\nInstructions: Read the text and provide analysis, answering any questions the user has about its content.";
      } else {
        fileDescription += "\nPlease analyze this file to the best of your ability.";
        fileDescription += "\nIf you cannot access or process this file type, please inform the user.";
      }
      
      // Add format-specific instructions for better AI processing
      if (fileExt === 'json') {
        fileDescription += "\nThis is a JSON file. Please parse the structure and explain the key properties and values.";
      } else if (fileExt === 'csv') {
        fileDescription += "\nThis is a CSV file. Please analyze the data structure, identify columns, and provide a summary of the content.";
      } else if (fileExt === 'md') {
        fileDescription += "\nThis is a Markdown file. Please interpret the formatted content and provide an overview.";
      }
      
      // Format the URL as plaintext rather than with special formatting
      // This increases compatibility with different models
      if (file.url) {
        // Remove complicated file paths or URL encoding that might confuse models
        const cleanUrl = file.url
          .replace(/^data:(.+);base64,/, 'data-url-content-type-') // Simplify data URLs
          .replace(/[?&]token=[^&]+/, ''); // Remove auth tokens
        
        // Add the URL in a clearly labeled format that models can easily recognize
        fileDescription += `\n\nFile URL: ${cleanUrl}`;
        
        // Add a fallback text description for data URLs
        if (file.url.startsWith('data:')) {
          fileDescription += "\n(This is a data URL containing the file's contents directly embedded in the URL)";
        }
      } else {
        fileDescription += "\n\nNOTE: No URL provided for this file.";
      }
      
      return fileDescription;
    }).join('\n\n---\n\n');
    
    let instructions = `
I've attached the following file(s) to analyze and discuss:

${fileDetails}

`;

    // Add specific instructions based on number of files
    if (attachments.length > 1) {
      instructions += `
Please analyze each of the ${attachments.length} files provided and respond to my query.
If you cannot access any of the files, please let me know which ones you can and cannot access.
`;
    } else {
      instructions += `
Please analyze the file and respond to my query.
If you cannot access or process the file, please let me know.
`;
    }

    return instructions;
  }
  
  /**
   * Helper function to get programming language name from file extension
   */
  private getLanguageFromExtension(ext: string): string {
    const languageMap: Record<string, string> = {
      'js': 'JavaScript',
      'jsx': 'React JavaScript',
      'ts': 'TypeScript',
      'tsx': 'React TypeScript',
      'py': 'Python',
      'java': 'Java',
      'c': 'C',
      'cpp': 'C++',
      'cs': 'C#',
      'go': 'Go',
      'rb': 'Ruby',
      'php': 'PHP',
      'swift': 'Swift',
      'kt': 'Kotlin',
      'rs': 'Rust',
      'dart': 'Dart',
      'sh': 'Shell',
      'sql': 'SQL',
      'html': 'HTML',
      'css': 'CSS',
      'scss': 'SCSS',
      'json': 'JSON',
      'md': 'Markdown',
      'yml': 'YAML',
      'yaml': 'YAML',
      'xml': 'XML'
    };
    
    return languageMap[ext] || 'unknown';
  }
  
  /**
   * Get API messages with file attachments
   */
  private getApiMessagesWithAttachments(userContent?: string, attachments?: FileAttachment[]): ChatMessage[] {
    // Get base messages
    const messages = this.getApiMessages(userContent);
    
    // Add file context if attachments are present
    if (attachments && attachments.length > 0) {
      console.log(`Processing ${attachments.length} attachments for API messages`);
      
      // Find the user message index (should be the last one)
      const userMessageIndex = messages.findIndex(m => m.role === "user");
      
      if (userMessageIndex !== -1) {
        // Get the file context summary
        const fileContext = this.getFileContentSummary(attachments);
        
        // Update the user message with file context
        const userMessage = messages[userMessageIndex];
        
        // Combine the file context with the user content
        const userQuery = userContent?.trim() || "Please analyze this file";
        userMessage.content = `${fileContext}\n\nQuery: ${userQuery}`;
        
        // Replace the user message
        messages[userMessageIndex] = userMessage;
        
        // Add specific file handling instructions to the system prompt
        const systemPromptIndex = messages.findIndex(m => m.role === "system");
        if (systemPromptIndex !== -1) {
          messages[systemPromptIndex].content += `\n\nThe user has attached one or more files. Please analyze the files based on the provided URLs and respond to their query. If you cannot access a file, acknowledge this and provide the best assistance possible based on the information you have.`;
        }
      }
    }
    
    return messages;
  }
}

// Export a singleton instance
export const chatService = typeof window !== 'undefined' 
  ? ChatService.getInstance() 
  : null; 