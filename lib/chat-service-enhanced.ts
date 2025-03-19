import { ChatMessage, sendChatCompletion, processStreamingResponse, ChatCompletionChunk } from './openrouter';
import { ContentChunk } from './content-indexing-service';
import OpenAI from "openai";
import { v4 as uuidv4 } from "uuid";
import { NavigationSuggestion } from '@/components/chat/navigation-suggestion';
import { chatStorage } from './chat-storage';
import { EventEmitter } from 'events';

// Import existing types from current chat service
import { 
  MessageRole, 
  FileAttachment, 
  Message, 
  MessageMetadataType, 
  MessageMetadata, 
  ChatContext,
  AIModel,
  AVAILABLE_MODELS,
  ChatSession
} from './chat-service';

// Constants for token management
const MAX_CONTEXT_TOKENS = 4000; // Conservative maximum tokens for context
const APPROX_TOKENS_PER_CHAR = 0.33; // Very rough approximation of tokens per character
const MAX_MESSAGES_PER_CHUNK = 20; // Maximum messages to display in a single chunk
const CHUNK_OVERLAP = 2; // Number of messages to overlap between chunks for context continuity

// Interface for initialization options
export interface EnhancedChatServiceOptions {
  apiKey?: string;
  initialMessages?: Message[];
  id?: string;
}

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

/**
 * Enhanced ChatService that integrates with Supabase for persistence
 */
export class EnhancedChatService extends EventEmitter {
  private static instance: EnhancedChatService;
  private currentSessionId: string | null = null;
  private sessions: Record<string, ChatSession> = {};
  private currentPage: string = ""; // Track the current page the user is viewing
  private selectedModel: string = 'google/gemini-2.0-flash-thinking-exp:free'; // Default model
  private messages: Message[] = [];
  private openai: OpenAI;
  private config: { apiKey: string; baseURL: string; model: string };
  
  // Add chunking properties
  private messageChunks: Message[][] = [];
  private currentChunkIndex: number = 0;
  
  // Add property for debounced saving
  private saveTimeoutId: NodeJS.Timeout | null = null;
  private isSyncing: boolean = false;
  private initialized: boolean = false;
  
  /**
   * Constructor for EnhancedChatService
   * @param options Optional configuration options
   */
  constructor(options?: EnhancedChatServiceOptions) {
    super();
    
    // Initialize with OpenRouter configuration
    this.config = {
      apiKey: options?.apiKey || process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || "",
      baseURL: "https://openrouter.ai/api/v1",
      model: "anthropic/claude-3-opus:1:0",
    };

    // Initialize OpenAI client for use with OpenRouter
    this.openai = new OpenAI({
      apiKey: this.config.apiKey,
      baseURL: this.config.baseURL,
      dangerouslyAllowBrowser: true
    });

    // If an ID is provided, set it as the current session ID
    if (options?.id) {
      this.currentSessionId = options.id;
    }

    // If initial messages are provided, use them
    if (options?.initialMessages && options.initialMessages.length > 0) {
      this.messages = [...options.initialMessages];
    } else {
      // Add initial system message
      this.messages.push({
        id: uuidv4(),
        role: "system",
        content: this.getSystemPrompt(),
        timestamp: Date.now(),
      });
    }
  }
  
  /**
   * Initialize the service by loading sessions
   */
  public async init(): Promise<void> {
    if (this.initialized) return;
    
    // Load sessions from localStorage first (for faster startup)
    this.loadSessionsFromLocalStorage();
    
    // Then load from database (for up-to-date data)
    await this.loadSessionsFromDatabase();
    
    this.initialized = true;
    this.emit('initialized');
    
    return Promise.resolve();
  }
  
  /**
   * Get singleton instance (for backward compatibility)
   */
  public static getInstance(): EnhancedChatService {
    if (!EnhancedChatService.instance) {
      EnhancedChatService.instance = new EnhancedChatService();
    }
    return EnhancedChatService.instance;
  }
  
  /**
   * Load sessions from localStorage for faster startup
   */
  private loadSessionsFromLocalStorage(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const sessionsData = localStorage.getItem('chat_sessions');
      if (sessionsData) {
        this.sessions = JSON.parse(sessionsData);
      }
      
      const currentSessionId = localStorage.getItem('current_session_id');
      if (currentSessionId && this.sessions[currentSessionId]) {
        this.currentSessionId = currentSessionId;
        this.messages = this.sessions[currentSessionId].messages;
      }
      
      const selectedModel = localStorage.getItem('selected_model');
      if (selectedModel) {
        this.selectedModel = selectedModel;
      }
      
      if (this.messages.length > 0) {
        this.messageChunks = this.chunkMessages(this.messages);
        this.currentChunkIndex = this.messageChunks.length - 1;
      }
    } catch (error) {
      console.error('Error loading sessions from localStorage:', error);
    }
  }
  
  /**
   * Load sessions from database for up-to-date data
   */
  private async loadSessionsFromDatabase(): Promise<void> {
    try {
      // Check if we can connect to the database
      const allSessions = await chatStorage.getAllSessions();
      
      if (allSessions.length > 0) {
        // Convert to our internal format and update the local cache
        const sessionsMap: Record<string, ChatSession> = {};
        
        for (const session of allSessions) {
          sessionsMap[session.id] = session;
        }
        
        // Merge with any local-only sessions we might have
        this.sessions = { ...this.sessions, ...sessionsMap };
        
        // Save the merged sessions back to localStorage
        this.saveSessionsToLocalStorage();
        
        // If we don't have a current session, use the most recent one
        if (!this.currentSessionId || !this.sessions[this.currentSessionId]) {
          const mostRecentSession = allSessions.sort((a, b) => b.updatedAt - a.updatedAt)[0];
          
          if (mostRecentSession) {
            this.currentSessionId = mostRecentSession.id;
            this.messages = mostRecentSession.messages;
            this.messageChunks = this.chunkMessages(this.messages);
            this.currentChunkIndex = this.messageChunks.length - 1;
          }
        }
      }
    } catch (error) {
      console.error('Error loading sessions from database:', error);
    }
  }
  
  /**
   * Save sessions to localStorage for persistence
   */
  private saveSessionsToLocalStorage(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem('chat_sessions', JSON.stringify(this.sessions));
      
      if (this.currentSessionId) {
        localStorage.setItem('current_session_id', this.currentSessionId);
      }
      
      localStorage.setItem('selected_model', this.selectedModel);
    } catch (error) {
      console.error('Error saving sessions to localStorage:', error);
    }
  }
  
  /**
   * Save current session to database
   */
  private async saveToDatabaseDebounced(): Promise<void> {
    if (this.saveTimeoutId) {
      clearTimeout(this.saveTimeoutId);
    }
    
    this.saveTimeoutId = setTimeout(async () => {
      await this.saveCurrentSessionToDatabase();
    }, 2000); // Debounce for 2 seconds
  }
  
  /**
   * Save current session to database
   */
  private async saveCurrentSessionToDatabase(): Promise<void> {
    if (!this.currentSessionId || this.isSyncing) return;
    
    try {
      this.isSyncing = true;
      const currentSession = this.sessions[this.currentSessionId];
      
      if (!currentSession) return;
      
      // Check if the session exists in the database
      const existingSession = await chatStorage.getSession(currentSession.id);
      
      if (existingSession) {
        // Update the existing session
        await chatStorage.updateSession(currentSession.id, {
          title: currentSession.title,
          topic: currentSession.topic,
          category: currentSession.category,
          model: currentSession.model
        });
        
        // Get the existing messages to avoid duplicates
        const existingMessages = await chatStorage.getMessages(currentSession.id);
        const existingMessageIds = new Set(existingMessages.map(msg => msg.id));
        
        // Add new messages
        for (const message of currentSession.messages) {
          if (!existingMessageIds.has(message.id)) {
            await chatStorage.addMessage(currentSession.id, message);
          }
        }
      } else {
        // Create a new session
        const sessionId = await chatStorage.createSession({
          title: currentSession.title,
          topic: currentSession.topic,
          category: currentSession.category,
          model: currentSession.model,
          messages: []
        });
        
        if (sessionId) {
          // Add all messages to the new session
          for (const message of currentSession.messages) {
            await chatStorage.addMessage(sessionId, message);
          }
        }
      }
    } catch (error) {
      console.error('Error saving session to database:', error);
    } finally {
      this.isSyncing = false;
    }
  }
  
  // Method to chunk messages for better performance
  private chunkMessages(messages: Message[]): Message[][] {
    // If we have fewer messages than the chunk size, just return a single chunk
    if (messages.length <= MAX_MESSAGES_PER_CHUNK) {
      return [messages];
    }
    
    // Create chunks of messages with overlap for context continuity
    const chunks: Message[][] = [];
    
    // Handle system messages separately - keep them in every chunk for context
    const systemMessages = messages.filter(m => m.role === "system");
    const nonSystemMessages = messages.filter(m => m.role !== "system");
    
    // Group messages by conversation turns (user->assistant pairs)
    const conversationTurns: Message[][] = [];
    let currentTurn: Message[] = [];
    
    for (let i = 0; i < nonSystemMessages.length; i++) {
      const message = nonSystemMessages[i];
      currentTurn.push(message);
      
      // If this is an assistant message (end of a turn) or the last message
      if (message.role === "assistant" || i === nonSystemMessages.length - 1) {
        if (currentTurn.length > 0) {
          conversationTurns.push([...currentTurn]);
          currentTurn = [];
        }
      }
    }
    
    // Create chunks based on conversation turns
    // Always keep some overlap between chunks for context continuity
    const maxTurnsPerChunk = Math.max(1, Math.floor((MAX_MESSAGES_PER_CHUNK - systemMessages.length) / 2));
    
    for (let i = 0; i < conversationTurns.length; i += maxTurnsPerChunk) {
      // Calculate overlap
      const startIdx = Math.max(0, i - (i === 0 ? 0 : CHUNK_OVERLAP));
      const endIdx = Math.min(conversationTurns.length, i + maxTurnsPerChunk + CHUNK_OVERLAP);
      
      // Collect messages for this chunk
      let chunkMessages: Message[] = [...systemMessages];
      
      for (let j = startIdx; j < endIdx; j++) {
        chunkMessages = [...chunkMessages, ...conversationTurns[j]];
      }
      
      chunks.push(chunkMessages);
    }
    
    return chunks;
  }
  
  /**
   * Gets the default system prompt for the chat
   */
  private getSystemPrompt(): string {
    return `You are an AI assistant for the AI Development Education website, focused on helping developers understand AI-assisted development and the Model Context Protocol (MCP).

Your primary functions are:
1. Answering questions about AI-assisted development, LLMs, and MCP
2. Providing specific information from the website content when referenced in the user's query
3. Helping users navigate to the most relevant parts of the site based on their interests

When responding:
- Be concise but informative
- Provide specific, practical guidance when possible
- Cite sources from the provided content when applicable
- Suggest specific website sections when relevant to the user's question`;
  }
  
  /**
   * Creates a new chat session
   */
  public createSession(initialTopic?: string): void {
    const id = uuidv4();
    const now = Date.now();
    
    const newSession: ChatSession = {
      id,
      title: initialTopic || "New Chat",
      messages: [
        {
          id: uuidv4(),
          role: "system",
          content: this.getSystemPrompt(),
          timestamp: now,
        },
      ],
      createdAt: now,
      updatedAt: now,
      topic: initialTopic,
    };
    
    this.sessions[id] = newSession;
    this.currentSessionId = id;
    this.messages = newSession.messages;
    this.messageChunks = [this.messages];
    this.currentChunkIndex = 0;
    
    // Save the new session to localStorage
    this.saveSessionsToLocalStorage();
    
    // Also save to database
    this.saveToDatabaseDebounced();
  }
  
  /**
   * Gets the current chat session
   */
  public getCurrentSession(): ChatSession | null {
    if (!this.currentSessionId) return null;
    return this.sessions[this.currentSessionId] || null;
  }
  
  /**
   * Gets all chat sessions
   */
  public getSessions(): ChatSession[] {
    return Object.values(this.sessions).sort((a, b) => b.updatedAt - a.updatedAt);
  }
  
  /**
   * Gets chat sessions grouped by category
   */
  public getSessionsByCategory(): Record<string, ChatSession[]> {
    const result: Record<string, ChatSession[]> = {};
    
    // Add uncategorized group
    result["Uncategorized"] = [];
    
    // Group sessions by category
    for (const session of Object.values(this.sessions)) {
      const category = session.category || "Uncategorized";
      
      if (!result[category]) {
        result[category] = [];
      }
      
      result[category].push(session);
    }
    
    // Sort sessions within each category by updatedAt
    for (const category in result) {
      result[category].sort((a, b) => b.updatedAt - a.updatedAt);
    }
    
    return result;
  }
  
  /**
   * Switches to a different chat session
   */
  public async switchSession(sessionId: string): Promise<void> {
    // Ensure we save the current session first
    if (this.currentSessionId && this.sessions[this.currentSessionId]) {
      await this.saveCurrentSessionToDatabase();
    }
    
    if (this.sessions[sessionId]) {
      this.currentSessionId = sessionId;
      this.messages = this.sessions[sessionId].messages;
      this.messageChunks = this.chunkMessages(this.messages);
      this.currentChunkIndex = this.messageChunks.length - 1;
      
      // Save the current session ID to localStorage
      localStorage.setItem('current_session_id', sessionId);
      
      // If the session doesn't have many messages, try loading more from the database
      if (this.messages.length < 5) {
        try {
          const dbSession = await chatStorage.getSession(sessionId);
          
          if (dbSession && dbSession.messages.length > this.messages.length) {
            this.sessions[sessionId] = dbSession;
            this.messages = dbSession.messages;
            this.messageChunks = this.chunkMessages(this.messages);
            this.currentChunkIndex = this.messageChunks.length - 1;
            
            // Also update localStorage
            this.saveSessionsToLocalStorage();
          }
        } catch (error) {
          console.error('Error loading session from database:', error);
        }
      }
    }
  }
  
  /**
   * Deletes a chat session
   */
  public async deleteSession(sessionId: string): Promise<void> {
    if (this.sessions[sessionId]) {
      // Delete from database first
      try {
        await chatStorage.deleteSession(sessionId);
      } catch (error) {
        console.error('Error deleting session from database:', error);
      }
      
      // Delete from local cache
      delete this.sessions[sessionId];
      
      // If we deleted the current session, switch to another one
      if (this.currentSessionId === sessionId) {
        const sessions = this.getSessions();
        
        if (sessions.length > 0) {
          this.switchSession(sessions[0].id);
        } else {
          this.createSession();
        }
      }
      
      // Update localStorage
      this.saveSessionsToLocalStorage();
    }
  }
  
  /**
   * Renames a chat session
   */
  public async renameSession(sessionId: string, title: string): Promise<void> {
    if (this.sessions[sessionId]) {
      this.sessions[sessionId].title = title;
      this.sessions[sessionId].updatedAt = Date.now();
      
      // Update localStorage
      this.saveSessionsToLocalStorage();
      
      // Update database
      try {
        await chatStorage.updateSession(sessionId, { title });
      } catch (error) {
        console.error('Error updating session in database:', error);
      }
    }
  }
  
  /**
   * Sets the category for a chat session
   */
  public async setCategoryForSession(sessionId: string, category: string): Promise<void> {
    if (this.sessions[sessionId]) {
      this.sessions[sessionId].category = category;
      this.sessions[sessionId].updatedAt = Date.now();
      
      // Update localStorage
      this.saveSessionsToLocalStorage();
      
      // Update database
      try {
        await chatStorage.updateSession(sessionId, { category });
      } catch (error) {
        console.error('Error updating session in database:', error);
      }
    }
  }
  
  /**
   * Sets the current page being viewed
   */
  public setCurrentPage(page: string): void {
    this.currentPage = page;
  }
  
  /**
   * Gets the currently selected model
   */
  public getSelectedModel(): string {
    return this.selectedModel;
  }
  
  /**
   * Sets the model to use for chat
   */
  public setModel(modelId: string): void {
    this.selectedModel = modelId;
    
    // Save the selected model to localStorage
    localStorage.setItem('selected_model', modelId);
    
    // If we have a current session, update its model
    if (this.currentSessionId && this.sessions[this.currentSessionId]) {
      this.sessions[this.currentSessionId].model = modelId;
      this.sessions[this.currentSessionId].updatedAt = Date.now();
      
      // Update localStorage
      this.saveSessionsToLocalStorage();
      
      // Update database
      this.saveToDatabaseDebounced();
    }
  }
  
  /**
   * Gets the current chunk of messages
   */
  public getCurrentChunk(): Message[] {
    if (this.messageChunks.length === 0) {
      return [];
    }
    
    return this.messageChunks[this.currentChunkIndex];
  }
  
  /**
   * Gets the total number of chunks
   */
  public getTotalChunks(): number {
    return this.messageChunks.length;
  }
  
  /**
   * Gets the current chunk index
   */
  public getCurrentChunkIndex(): number {
    return this.currentChunkIndex;
  }
  
  /**
   * Navigates to the next chunk of messages
   */
  public navigateToNextChunk(): boolean {
    if (this.currentChunkIndex < this.messageChunks.length - 1) {
      this.currentChunkIndex++;
      return true;
    }
    return false;
  }
  
  /**
   * Navigates to the previous chunk of messages
   */
  public navigateToPreviousChunk(): boolean {
    if (this.currentChunkIndex > 0) {
      this.currentChunkIndex--;
      return true;
    }
    return false;
  }
  
  /**
   * Sends a message and gets a response from the API
   */
  public async sendMessage(
    content: string,
    context?: ChatContext
  ): Promise<Message> {
    if (!this.currentSessionId) {
      this.createSession();
    }
    
    const userMessage: Message = {
      id: uuidv4(),
      role: "user",
      content,
      timestamp: Date.now(),
    };
    
    // Update the session
    const session = this.sessions[this.currentSessionId!];
    session.messages.push(userMessage);
    session.updatedAt = Date.now();
    
    // Update the message list and chunks
    this.messages = session.messages;
    this.messageChunks = this.chunkMessages(this.messages);
    this.currentChunkIndex = this.messageChunks.length - 1;
    
    // Save the updated session to localStorage
    this.saveSessionsToLocalStorage();
    
    // Emit the message event
    this.emit('message', userMessage, session);
    
    try {
      // Prepare messages for the API
      const messages: ChatMessage[] = [];
      
      // Start with system message that might include relevant content
      const systemContent = context?.relevantContent 
        ? constructSystemMessageWithContent(this.getSystemPrompt(), context.relevantContent)
        : this.getSystemPrompt();
      
      messages.push({ role: "system", content: systemContent });
      
      // Add current page context if available
      if (context?.currentPage) {
        let contextMessage = `The user is currently viewing the ${context.currentPage} page.`;
        
        if (context.pageTitle) {
          contextMessage += ` Page title: "${context.pageTitle}".`;
        }
        
        if (context.pageDescription) {
          contextMessage += ` Page description: "${context.pageDescription}".`;
        }
        
        messages.push({ role: "system", content: contextMessage });
      }
      
      // Add recent messages for context (limit to last 10 to avoid token limits)
      const recentMessages = this.messages
        .filter(msg => msg.role !== "system")
        .slice(-10);
      
      for (const msg of recentMessages) {
        messages.push({
          role: msg.role,
          content: msg.content,
        });
      }
      
      // Make the API request
      const response = await sendChatCompletion({
        messages,
        model: this.selectedModel,
        temperature: 0.7,
        max_tokens: 2000,
      });
      
      if (!response || !('choices' in response) || response.choices.length === 0) {
        throw new Error("Invalid response from API");
      }
      
      // Create the assistant message
      const assistantMessage: Message = {
        id: uuidv4(),
        role: "assistant",
        content: response.choices[0].message.content,
        timestamp: Date.now(),
      };
      
      // Update the session
      session.messages.push(assistantMessage);
      session.updatedAt = Date.now();
      
      // Update title if this is a new session with default title
      if (session.title === "New Chat" && session.messages.length === 3) {
        // Generate a title based on the user's first message
        const title = this.generateSessionTitle(userMessage.content);
        session.title = title;
      }
      
      // Update the message list and chunks
      this.messages = session.messages;
      this.messageChunks = this.chunkMessages(this.messages);
      this.currentChunkIndex = this.messageChunks.length - 1;
      
      // Save the updated session to localStorage
      this.saveSessionsToLocalStorage();
      
      // Save to database
      this.saveToDatabaseDebounced();
      
      // Emit the message event for the assistant response
      this.emit('message', assistantMessage, session);
      
      return assistantMessage;
    } catch (error) {
      console.error("Error sending message:", error);
      
      // Create an error message
      const errorMessage: Message = {
        id: uuidv4(),
        role: "assistant",
        content: "I'm sorry, I encountered an error while processing your request. Please try again later.",
        timestamp: Date.now(),
        metadata: {
          type: "error",
        },
      };
      
      // Update the session
      session.messages.push(errorMessage);
      session.updatedAt = Date.now();
      
      // Update the message list and chunks
      this.messages = session.messages;
      this.messageChunks = this.chunkMessages(this.messages);
      this.currentChunkIndex = this.messageChunks.length - 1;
      
      // Save the updated session to localStorage
      this.saveSessionsToLocalStorage();
      
      return errorMessage;
    }
  }
  
  /**
   * Exports the current session to a file
   */
  public async exportSession(format: 'json' | 'text'): Promise<Blob | null> {
    if (!this.currentSessionId) return null;
    
    const { conversationIO } = await import('./conversation-io');
    return conversationIO.getConversationBlob(this.currentSessionId, format);
  }
  
  /**
   * Imports a session from a file
   */
  public async importSession(file: File): Promise<string | null> {
    const { conversationIO } = await import('./conversation-io');
    
    const exportData = await conversationIO.parseImportFile(file);
    if (!exportData) return null;
    
    const sessionId = await conversationIO.importConversation(exportData);
    if (!sessionId) return null;
    
    // Refresh our local cache to include the imported session
    await this.loadSessionsFromDatabase();
    
    return sessionId;
  }
  
  /**
   * Generates a title for a session based on the user's message
   */
  private generateSessionTitle(message: string): string {
    // Simplified approach: use the first 30 chars of user message as title
    if (message.length <= 30) {
      return message;
    }
    
    // Find the end of a word near 30 chars
    const endPos = message.indexOf(' ', 25);
    if (endPos === -1 || endPos > 35) {
      // No space found, or space is too far away
      return message.substring(0, 30) + '...';
    }
    
    return message.substring(0, endPos) + '...';
  }
} 