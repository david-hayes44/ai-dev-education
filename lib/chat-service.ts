import { ChatMessage, sendChatCompletion, processStreamingResponse, ChatCompletionChunk } from './openrouter';

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  metadata?: MessageMetadata;
  isStreaming?: boolean; // Flag to indicate if this message is currently streaming
}

export interface MessageMetadata {
  type?: "concept_explanation" | "code_example" | "general";
  topic?: string;
  knowledgeLevel?: "beginner" | "intermediate" | "advanced";
  containsCode?: boolean;
  model?: string; // Add model information to message metadata
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

// A class to manage chat state and history
export class ChatService {
  private static instance: ChatService;
  private currentSessionId: string | null = null;
  private sessions: Record<string, ChatSession> = {};
  private currentPage: string = ""; // Track the current page the user is viewing
  private selectedModel: string = 'google/gemini-2.0-flash-thinking-exp:free'; // Default model
  
  private constructor() {
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
  
  public async sendMessage(content: string): Promise<Message> {
    if (!this.currentSessionId) {
      this.createSession();
    }
    
    const session = this.sessions[this.currentSessionId!];
    
    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: Date.now()
    };
    
    session.messages.push(userMessage);
    session.updatedAt = Date.now();
    this.saveSessions();
    
    // Format messages for OpenRouter API
    const apiMessages = session.messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
    
    // Call OpenRouter API
    try {
      // Use our server-side API route instead of calling OpenRouter directly
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: apiMessages,
          currentPage: this.currentPage,
          model: session.model || this.selectedModel
        })
      });
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      
      // Check if we have an assistant response
      if (data.choices && data.choices.length > 0) {
        const choice = data.choices[0];
        
        // Create the assistant message
        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: choice.message.content,
          timestamp: Date.now(),
          metadata: data.metadata
        };
        
        // Check for JSON response and try to parse it
        if (assistantMessage.content.startsWith('{') && assistantMessage.content.endsWith('}')) {
          try {
            const jsonResponse = JSON.parse(assistantMessage.content);
            
            // Check if this is a concept explanation
            if (jsonResponse.concept && jsonResponse.summary) {
              assistantMessage.metadata = {
                ...assistantMessage.metadata,
                type: 'concept_explanation',
                topic: jsonResponse.concept,
                knowledgeLevel: jsonResponse.knowledge_level || 'beginner'
              };
            }
          } catch (e) {
            // Not valid JSON, continue without parsing
          }
        }
        
        // Check for code blocks which might require syntax highlighting
        if (assistantMessage.content.includes('```')) {
          assistantMessage.metadata = {
            ...assistantMessage.metadata,
            containsCode: true
          };
        }
        
        session.messages.push(assistantMessage);
        
        // Update the session with a better title if this is the first user message
        if (session.messages.filter(m => m.role === 'user').length === 1) {
          session.title = this.generateTitle(content);
          
          // Also update topic and category if applicable
          const { topic, category } = this.categorizeContent(content);
          if (topic) session.topic = topic;
          if (category) session.category = category;
        }
        
        session.updatedAt = Date.now();
        this.saveSessions();
        
        return assistantMessage;
      } else {
        throw new Error('No response from API');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Create error message
      const errorMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: `I'm sorry, I encountered an error while processing your request. ${error instanceof Error ? error.message : 'Please try again later.'}`,
        timestamp: Date.now(),
        metadata: {
          type: 'general'
        }
      };
      
      session.messages.push(errorMessage);
      session.updatedAt = Date.now();
      this.saveSessions();
      
      return errorMessage;
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
   * Sends a message with streaming response
   */
  public async sendStreamingMessage(content: string, onChunk: (message: Message) => void): Promise<Message> {
    if (!this.currentSessionId) {
      this.createSession();
    }
    
    const session = this.sessions[this.currentSessionId!];
    
    // Format messages for OpenRouter API (excluding the last assistant placeholder)
    const messagesToSend = session.messages
      .filter((msg, index) => index < session.messages.length - 1 || msg.role !== 'assistant')
      .map(msg => ({
        role: msg.role,
        content: msg.content
      }));
    
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
      
      // Process the streaming response
      await processStreamingResponse(
        response.body,
        (chunk: ChatCompletionChunk) => {
          if (chunk.choices && chunk.choices.length > 0) {
            const choice = chunk.choices[0];
            if (choice.delta.content) {
              // Append to the current content
              assistantMessage.content += choice.delta.content;
              
              // Check for code blocks which might require syntax highlighting
              if (assistantMessage.content.includes('```') && !assistantMessage.metadata?.containsCode) {
                assistantMessage.metadata = {
                  ...assistantMessage.metadata,
                  containsCode: true
                };
              }
              
              // Save the session periodically for incremental updates
              session.updatedAt = Date.now();
              this.saveSessions();
              
              // Call the callback with the updated message
              onChunk(assistantMessage);
            }
          }
        },
        () => {
          // On complete
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
}

// Export a singleton instance
export const chatService = typeof window !== 'undefined' 
  ? ChatService.getInstance() 
  : null; 