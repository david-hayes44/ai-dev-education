import { ChatMessage, sendChatCompletion } from './openrouter';

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  metadata?: MessageMetadata;
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
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: apiMessages,
          model: this.selectedModel, // Use the selected model
          temperature: 0.7,
          max_tokens: 1500,
          currentPage: this.currentPage // Pass the current page for context awareness
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      
      // Extract response metadata if any
      const metadata: MessageMetadata = {};
      if (data.metadata) {
        metadata.type = data.metadata.type;
        metadata.topic = data.metadata.topic;
      }
      
      // Determine if the content contains code
      const content = data.choices[0].message.content;
      metadata.containsCode = content.includes('```');
      
      // Create assistant message from response
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: content,
        timestamp: Date.now(),
        metadata
      };
      
      // Add to session
      session.messages.push(assistantMessage);
      
      // Update session title if it's a new chat (only has 3 messages including the system message)
      if (session.messages.length === 3 && session.title === 'New Chat') {
        // Generate a title based on the first user message
        session.title = this.generateTitle(userMessage.content);
        
        // Set topic and category if not already set
        if (!session.topic || !session.category) {
          const { topic, category } = this.categorizeContent(userMessage.content);
          session.topic = topic;
          session.category = category;
        }
      }
      
      session.updatedAt = Date.now();
      this.saveSessions();
      
      return assistantMessage;
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Add error message
      const errorMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your request. Please try again later.',
        timestamp: Date.now()
      };
      
      session.messages.push(errorMessage);
      session.updatedAt = Date.now();
      this.saveSessions();
      
      return errorMessage;
    }
  }
  
  private generateTitle(content: string): string {
    // Simple title generation - use the first 30 chars of content
    return content.length > 30 
      ? `${content.substring(0, 30)}...` 
      : content;
  }
  
  public getSessions(): ChatSession[] {
    return Object.values(this.sessions).sort((a, b) => b.updatedAt - a.updatedAt);
  }
  
  public getSessionsByCategory(): Record<string, ChatSession[]> {
    const categories: Record<string, ChatSession[]> = {
      "Model Context Protocol": [],
      "AI Development": [],
      "Tools": [],
      "MCP Servers": [],
      "General": []
    };
    
    // Sort sessions into categories
    for (const session of this.getSessions()) {
      if (session.category && categories[session.category]) {
        categories[session.category].push(session);
      } else {
        categories["General"].push(session);
      }
    }
    
    // Remove empty categories
    Object.keys(categories).forEach(key => {
      if (categories[key].length === 0) {
        delete categories[key];
      }
    });
    
    return categories;
  }
  
  public getSession(id: string): ChatSession | null {
    return this.sessions[id] || null;
  }
  
  public getCurrentSession(): ChatSession | null {
    return this.currentSessionId ? this.sessions[this.currentSessionId] : null;
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
      if (this.currentSessionId === id) {
        const sessions = this.getSessions();
        this.currentSessionId = sessions.length > 0 ? sessions[0].id : null;
      }
      this.saveSessions();
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