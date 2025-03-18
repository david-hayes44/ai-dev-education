import { ChatMessage, sendChatCompletion, processStreamingResponse, ChatCompletionChunk } from './openrouter';
import { ContentChunk } from './content-indexing-service';
import OpenAI from "openai";
import { v4 as uuidv4 } from "uuid";

// Define message types
export type MessageRole = "user" | "assistant" | "system";

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number | Date;
  metadata?: MessageMetadata;
}

export type MessageMetadataType = "streaming" | "error" | "loading" | "thinking" | "suggestion";

export interface MessageMetadata {
  type?: MessageMetadataType;
  [key: string]: any;
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
  
  private loadSessions() {
    if (typeof window !== 'undefined') {
      const savedSessions = localStorage.getItem('chat-sessions');
      if (savedSessions) {
        this.sessions = JSON.parse(savedSessions);
      }
    }
  }
  
  private saveSessions() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('chat-sessions', JSON.stringify(this.sessions));
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
    // Add user message
    const userMessage: Message = {
      id: uuidv4(),
      role: "user",
      content,
      timestamp: Date.now(),
    };
    this.messages.push(userMessage);

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
      return assistantMessage;
    } catch (error) {
      console.error("Error calling chat API:", error);
      throw error;
    }
  }
  
  /**
   * Creates a placeholder message for the assistant's response during streaming
   */
  public createAssistantMessagePlaceholder(userContent: string): Message {
    if (!this.currentSessionId) {
      this.createSession();
    }
    
    const session = this.sessions[this.currentSessionId!];
    
    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userContent,
      timestamp: Date.now()
    };
    
    // Add placeholder assistant message
    const assistantPlaceholder: Message = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      isStreaming: true
    };
    
    session.messages.push(userMessage, assistantPlaceholder);
    session.updatedAt = Date.now();
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
    if (!this.currentSessionId) {
      this.createSession();
    }
    
    const session = this.sessions[this.currentSessionId!];
    
    // Apply context window and documentation injection
    const messagesToSend = this.getApiMessages(content);
    
    // Add or update system message with relevant content
    if (relevantContent.length > 0) {
      // Check if the first message is a system message
      if (messagesToSend.length > 0 && messagesToSend[0].role === 'system') {
        messagesToSend[0].content = constructSystemMessageWithContent(
          messagesToSend[0].content,
          relevantContent
        );
      } else {
        // Add a new system message
        messagesToSend.unshift({
          role: 'system',
          content: constructSystemMessageWithContent(
            'You are an AI assistant for the AI-Dev Education platform. You help users learn about AI-assisted development and Model Context Protocol (MCP). Be concise, accurate, and helpful.',
            relevantContent
          )
        });
      }
    }
    
    try {
      // Use our server-side API route with streaming enabled
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: messagesToSend,
          currentPage: this.currentPage,
          model: session.model || this.selectedModel,
          stream: true
        })
      });
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      if (!response.body) {
        throw new Error('No response stream available');
      }
      
      const assistantMessage = session.messages[session.messages.length - 1];
      let contentBuffer = '';
      let contentUpdateCounter = 0;
      const THROTTLE_UPDATES = 3; // Update UI every 3 chunks to improve performance
      
      // Process the streaming response
      await processStreamingResponse(
        response.body,
        (chunk: ChatCompletionChunk) => {
          if (chunk.choices && chunk.choices.length > 0) {
            const choice = chunk.choices[0];
            if (choice.delta.content) {
              // Append to the buffer
              contentBuffer += choice.delta.content;
              contentUpdateCounter++;
              
              // Only update the UI periodically to avoid excessive renders
              if (contentUpdateCounter >= THROTTLE_UPDATES) {
                // Update the message content
                assistantMessage.content = contentBuffer;
                
                // Check for code blocks which might require syntax highlighting
                if (assistantMessage.content.includes('```') && !assistantMessage.metadata?.containsCode) {
                  assistantMessage.metadata = {
                    ...assistantMessage.metadata,
                    containsCode: true
                  };
                }
                
                // Call the callback with the updated message
                onChunk(assistantMessage);
                
                // Reset the counter
                contentUpdateCounter = 0;
                
                // Save the session periodically for incremental updates
                session.updatedAt = Date.now();
                this.saveSessions();
              }
            }
          }
        },
        () => {
          // On complete, ensure the final content is updated
          if (contentBuffer !== assistantMessage.content) {
            assistantMessage.content = contentBuffer;
            onChunk(assistantMessage);
          }
          
          // Mark as no longer streaming
          assistantMessage.isStreaming = false;
          
          // Update the session with a better title if this was the first user exchange
          if (session.messages.filter(m => m.role === 'user').length === 1) {
            session.title = this.generateTitle(content);
            
            // Also update topic and category if applicable
            const { topic, category } = this.categorizeContent(content);
            if (topic) session.topic = topic;
            if (category) session.category = category;
          }
          
          // Check if the response is JSON and attempt to parse
          if (assistantMessage.content.startsWith('{') && assistantMessage.content.endsWith('}')) {
            try {
              const jsonResponse = JSON.parse(assistantMessage.content);
              
              // Check if this is a concept explanation
              if (jsonResponse.concept && jsonResponse.summary) {
                assistantMessage.metadata = {
                  ...assistantMessage.metadata,
                  type: 'concept_explanation',
                  topic: jsonResponse.concept,
                  knowledgeLevel: jsonResponse.knowledge_level || jsonResponse.explanation?.level || 'beginner'
                };
              }
            } catch (e) {
              // Not valid JSON, continue without parsing
            }
          }
          
          session.updatedAt = Date.now();
          this.saveSessions();
        },
        (error) => {
          // On error
          console.error('Error in streaming response:', error);
          this.updateAssistantMessageWithError(error);
          
          // Also notify the UI
          assistantMessage.isStreaming = false;
          onChunk(assistantMessage);
        }
      );
      
      return assistantMessage;
    } catch (error) {
      console.error('Error sending streaming message:', error);
      this.updateAssistantMessageWithError(error);
      return session.messages[session.messages.length - 1];
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
    return this.currentSessionId ? this.sessions[this.currentSessionId] || null : null;
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
    if (this.sessions[id]) {
      this.sessions[id].category = category;
      this.saveSessions();
      return true;
    }
    return false;
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
}

// Export a singleton instance
export const chatService = typeof window !== 'undefined' 
  ? ChatService.getInstance() 
  : null; 