# AI Chatbot Implementation Guide

## Current Status

The project already has a foundation for an AI chatbot with:
- Basic UI components (`chat-container.tsx`, `chat-input.tsx`, `chat-message.tsx`, `floating-chat.tsx`)
- A placeholder OpenRouter integration (`lib/openrouter.ts`)
- Firebase integration for potential backend services

However, the AI functionality is currently using placeholders and needs to be fully implemented.

## Implementation Steps

### 1. Complete the OpenRouter API Integration

The current OpenRouter implementation is a placeholder. First, complete the API integration:

```typescript
// lib/openrouter.ts - Update the sendChatCompletion function

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
        'HTTP-Referer': window.location.origin, // Required for API attribution
        'X-Title': 'AI-Dev Education Platform', // Optional for API attribution
      },
      body: JSON.stringify({
        model: request.model || 'openai/gpt-3.5-turbo', // Default model
        messages: request.messages,
        temperature: request.temperature || 0.7,
        max_tokens: request.max_tokens || 1000,
        stream: request.stream || false,
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    if (request.stream) {
      return response; // Return the stream response for handling elsewhere
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error calling OpenRouter:', error);
    throw error;
  }
}
```

### 2. Create a Chat Service Layer

Create a new service file to manage chat state and API interactions:

```typescript
// lib/chat-service.ts

import { ChatMessage, sendChatCompletion } from './openrouter';

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: number;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

// A class to manage chat state and history
export class ChatService {
  private static instance: ChatService;
  private currentSessionId: string | null = null;
  private sessions: Record<string, ChatSession> = {};
  
  private constructor() {
    // Load sessions from localStorage if needed
    this.loadSessions();
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
  
  public createSession(): string {
    const id = Date.now().toString();
    this.sessions[id] = {
      id,
      title: 'New Chat',
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
      role: msg.role as "user" | "assistant" | "system",
      content: msg.content
    }));
    
    // Call OpenRouter API
    try {
      const response = await sendChatCompletion({
        messages: apiMessages,
        model: 'openai/gpt-4',
        temperature: 0.7,
        max_tokens: 1000
      });
      
      // Create assistant message from response
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.choices[0].message.content,
        timestamp: Date.now()
      };
      
      // Add to session
      session.messages.push(assistantMessage);
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
  
  public getSessions(): ChatSession[] {
    return Object.values(this.sessions).sort((a, b) => b.updatedAt - a.updatedAt);
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
}

// Export a singleton instance
export const chatService = typeof window !== 'undefined' ? ChatService.getInstance() : null;
```

### 3. Create a React Context for Chat State

Create a context to share chat state across components:

```typescript
// contexts/chat-context.tsx

"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ChatService, Message, ChatSession } from '@/lib/chat-service';

interface ChatContextType {
  sessions: ChatSession[];
  currentSession: ChatSession | null;
  isLoading: boolean;
  sendMessage: (content: string) => Promise<void>;
  createSession: () => void;
  switchSession: (id: string) => void;
  deleteSession: (id: string) => void;
  renameSession: (id: string, title: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [chatService, setChatService] = useState<ChatService | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Initialize on client side only
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const service = ChatService.getInstance();
      setChatService(service);
      
      const currentSession = service.getCurrentSession();
      if (!currentSession) {
        service.createSession();
      }
      
      setCurrentSession(service.getCurrentSession());
      setSessions(service.getSessions());
    }
  }, []);
  
  const sendMessage = async (content: string) => {
    if (!chatService) return;
    
    setIsLoading(true);
    try {
      await chatService.sendMessage(content);
      setCurrentSession(chatService.getCurrentSession());
      setSessions(chatService.getSessions());
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const createSession = () => {
    if (!chatService) return;
    
    chatService.createSession();
    setCurrentSession(chatService.getCurrentSession());
    setSessions(chatService.getSessions());
  };
  
  const switchSession = (id: string) => {
    if (!chatService) return;
    
    chatService.setCurrentSession(id);
    setCurrentSession(chatService.getCurrentSession());
  };
  
  const deleteSession = (id: string) => {
    if (!chatService) return;
    
    chatService.deleteSession(id);
    setCurrentSession(chatService.getCurrentSession());
    setSessions(chatService.getSessions());
  };
  
  const renameSession = (id: string, title: string) => {
    if (!chatService) return;
    
    chatService.renameSession(id, title);
    setCurrentSession(chatService.getCurrentSession());
    setSessions(chatService.getSessions());
  };
  
  return (
    <ChatContext.Provider value={{
      sessions,
      currentSession,
      isLoading,
      sendMessage,
      createSession,
      switchSession,
      deleteSession,
      renameSession
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
```

### 4. Update the Chat UI Components

Update the chat container to use the new context:

```typescript
// components/chat/chat-container.tsx

"use client"

import * as React from "react"
import { useChat } from "@/contexts/chat-context"
import { ChatInput } from "@/components/chat/chat-input"
import { ChatMessage } from "@/components/chat/chat-message"

export function ChatContainer() {
  const { currentSession, isLoading, sendMessage } = useChat()
  const chatEndRef = React.useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  React.useEffect(() => {
    scrollToBottom()
  }, [currentSession?.messages])

  const handleSubmit = async (content: string) => {
    await sendMessage(content)
  }

  if (!currentSession) {
    return (
      <div className="flex h-full items-center justify-center">
        <p>Loading chat...</p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col rounded-lg border bg-background shadow-sm">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">{currentSession.title}</h2>
        <p className="text-sm text-muted-foreground">
          Ask questions about AI-Dev and MCP concepts
        </p>
      </div>
      <div className="flex-1 overflow-y-auto p-0">
        <div className="flex flex-col">
          {currentSession.messages.map((message) => (
            <ChatMessage
              key={message.id}
              type={message.role === "user" ? "user" : "assistant"}
              content={message.content}
            />
          ))}
          <div ref={chatEndRef} />
        </div>
      </div>
      <ChatInput onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  )
}
```

### 5. Create a Chat History Component

Create a component to display and manage chat sessions:

```typescript
// components/chat/chat-history.tsx

"use client"

import * as React from "react"
import { useChat } from "@/contexts/chat-context"
import { Button } from "@/components/ui/button"
import { PlusIcon, TrashIcon, PencilIcon } from "lucide-react"
import { formatDistanceToNow } from 'date-fns'

export function ChatHistory() {
  const { sessions, currentSession, createSession, switchSession, deleteSession, renameSession } = useChat()
  const [isEditing, setIsEditing] = React.useState<string | null>(null)
  const [editTitle, setEditTitle] = React.useState("")
  
  const handleCreateSession = () => {
    createSession()
  }
  
  const handleSwitchSession = (id: string) => {
    switchSession(id)
  }
  
  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (window.confirm("Are you sure you want to delete this chat?")) {
      deleteSession(id)
    }
  }
  
  const handleStartRename = (id: string, currentTitle: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setIsEditing(id)
    setEditTitle(currentTitle)
  }
  
  const handleSaveRename = (id: string) => {
    if (editTitle.trim()) {
      renameSession(id, editTitle.trim())
    }
    setIsEditing(null)
  }
  
  return (
    <div className="flex flex-col h-full bg-background border-r">
      <div className="p-4 border-b">
        <Button 
          className="w-full" 
          onClick={handleCreateSession}
        >
          <PlusIcon className="mr-2 h-4 w-4" />
          New Chat
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto py-2">
        {sessions.map((session) => (
          <div 
            key={session.id}
            className={`flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-accent/50 ${
              currentSession?.id === session.id ? 'bg-accent' : ''
            }`}
            onClick={() => handleSwitchSession(session.id)}
          >
            <div className="flex-1 min-w-0">
              {isEditing === session.id ? (
                <input
                  type="text"
                  className="w-full p-1 rounded border"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onBlur={() => handleSaveRename(session.id)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveRename(session.id)}
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <>
                  <p className="text-sm font-medium truncate">{session.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(session.updatedAt, { addSuffix: true })}
                  </p>
                </>
              )}
            </div>
            <div className="flex space-x-1 ml-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={(e) => handleStartRename(session.id, session.title, e)}
              >
                <PencilIcon className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={(e) => handleDeleteSession(session.id, e)}
              >
                <TrashIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

### 6. Create a Chat Page

Create a dedicated page for the chat interface:

```typescript
// app/chat/page.tsx

import { ChatProvider } from "@/contexts/chat-context"
import { ChatContainer } from "@/components/chat/chat-container"
import { ChatHistory } from "@/components/chat/chat-history"

export default function ChatPage() {
  return (
    <ChatProvider>
      <div className="flex h-[calc(100vh-4rem)]">
        <div className="w-80 hidden md:block">
          <ChatHistory />
        </div>
        <div className="flex-1">
          <ChatContainer />
        </div>
      </div>
    </ChatProvider>
  )
}
```

### 7. API Routes for Server-Side Integration (Optional)

If you want to keep API keys secure, create an API route:

```typescript
// app/api/chat/route.ts

import { NextRequest, NextResponse } from 'next/server';

// Rate limiting map
const ipRateLimit = new Map<string, { count: number, timestamp: number }>();
const MAX_REQUESTS = 20; // per IP per minute
const WINDOW_MS = 60 * 1000; // 1 minute

export async function POST(req: NextRequest) {
  // Get client IP for rate limiting
  const ip = req.ip || 'unknown';
  
  // Check rate limit
  const now = Date.now();
  const rateData = ipRateLimit.get(ip) || { count: 0, timestamp: now };
  
  // Reset counter if window has passed
  if (now - rateData.timestamp > WINDOW_MS) {
    rateData.count = 0;
    rateData.timestamp = now;
  }
  
  // Increment counter
  rateData.count += 1;
  ipRateLimit.set(ip, rateData);
  
  // Check if rate limit exceeded
  if (rateData.count > MAX_REQUESTS) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please try again later.' },
      { status: 429 }
    );
  }
  
  try {
    const body = await req.json();
    const { messages, model, temperature, max_tokens } = body;
    
    // Validate request
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid request format. Messages array is required.' },
        { status: 400 }
      );
    }
    
    // Call OpenRouter API
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_BASE_URL || 'https://ai-dev-education.com',
        'X-Title': 'AI-Dev Education Platform',
      },
      body: JSON.stringify({
        model: model || 'openai/gpt-3.5-turbo',
        messages,
        temperature: temperature || 0.7,
        max_tokens: max_tokens || 1000,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: `API request failed: ${errorData.error || response.statusText}` },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Error in chat API route:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
```

Then update your chat service to use this API endpoint:

```typescript
// In lib/chat-service.ts, update the sendMessage method:

// Call our API route instead of OpenRouter directly
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    messages: apiMessages,
    model: 'openai/gpt-4',
    temperature: 0.7,
    max_tokens: 1000
  }),
});

if (!response.ok) {
  throw new Error(`API request failed with status ${response.status}`);
}

const data = await response.json();
```

### 8. Update the Floating Chat Component

Update the floating chat to use the new context:

```typescript
// components/chat/floating-chat.tsx

"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { MessageCircleIcon, XIcon } from "lucide-react"
import { ChatContainer } from "@/components/chat/chat-container"
import { ChatProvider } from "@/contexts/chat-context"

export function FloatingChat() {
  const [isOpen, setIsOpen] = React.useState(false)

  const toggleChat = () => {
    setIsOpen((prev) => !prev)
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <div className="flex flex-col w-80 h-96 md:w-96 md:h-[28rem] rounded-lg shadow-lg overflow-hidden">
          <div className="bg-primary p-2 flex justify-between items-center">
            <h3 className="text-primary-foreground font-semibold">AI Assistant</h3>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-primary-foreground"
              onClick={toggleChat}
            >
              <XIcon className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1">
            <ChatProvider>
              <ChatContainer />
            </ChatProvider>
          </div>
        </div>
      ) : (
        <Button className="rounded-full h-12 w-12 shadow-lg" onClick={toggleChat}>
          <MessageCircleIcon className="h-6 w-6" />
        </Button>
      )}
    </div>
  )
}
```

### 9. Add Firebase Integration (Optional)

If you want to persist chat history in Firebase:

```typescript
// lib/firebase-chat-service.ts

import { db } from './firebase';
import { doc, collection, getDoc, setDoc, updateDoc, deleteDoc, query, where, orderBy, getDocs } from 'firebase/firestore';
import { Message, ChatSession } from './chat-service';

export async function saveChatSession(userId: string, session: ChatSession): Promise<void> {
  await setDoc(doc(db, 'users', userId, 'chatSessions', session.id), session);
}

export async function updateChatSession(userId: string, sessionId: string, data: Partial<ChatSession>): Promise<void> {
  await updateDoc(doc(db, 'users', userId, 'chatSessions', sessionId), data);
}

export async function deleteChatSession(userId: string, sessionId: string): Promise<void> {
  await deleteDoc(doc(db, 'users', userId, 'chatSessions', sessionId));
}

export async function getChatSession(userId: string, sessionId: string): Promise<ChatSession | null> {
  const docRef = doc(db, 'users', userId, 'chatSessions', sessionId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return docSnap.data() as ChatSession;
  }
  
  return null;
}

export async function getChatSessions(userId: string): Promise<ChatSession[]> {
  const q = query(
    collection(db, 'users', userId, 'chatSessions'),
    orderBy('updatedAt', 'desc')
  );
  
  const querySnapshot = await getDocs(q);
  const sessions: ChatSession[] = [];
  
  querySnapshot.forEach((doc) => {
    sessions.push(doc.data() as ChatSession);
  });
  
  return sessions;
}

export async function addMessageToSession(
  userId: string,
  sessionId: string,
  message: Message
): Promise<void> {
  const sessionRef = doc(db, 'users', userId, 'chatSessions', sessionId);
  const sessionSnap = await getDoc(sessionRef);
  
  if (sessionSnap.exists()) {
    const session = sessionSnap.data() as ChatSession;
    const updatedMessages = [...session.messages, message];
    
    await updateDoc(sessionRef, {
      messages: updatedMessages,
      updatedAt: Date.now()
    });
  }
}
```

### 10. Add Security and Performance Optimizations

#### Rate Limiting

Already included in the API route example above.

#### API Key Management

Store your OpenRouter API key in environment variables:

```
# .env.local
OPENROUTER_API_KEY=your_api_key_here
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

#### Caching

For frequently asked questions, implement a simple cache:

```typescript
// lib/chat-cache.ts

interface CacheEntry {
  response: string;
  timestamp: number;
}

// Simple in-memory cache with time expiration
export class ChatCache {
  private static instance: ChatCache;
  private cache: Map<string, CacheEntry> = new Map();
  private readonly TTL = 24 * 60 * 60 * 1000; // 24 hours
  
  private constructor() {}
  
  public static getInstance(): ChatCache {
    if (!ChatCache.instance) {
      ChatCache.instance = new ChatCache();
    }
    return ChatCache.instance;
  }
  
  public get(key: string): string | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    // Check if entry has expired
    if (Date.now() - entry.timestamp > this.TTL) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.response;
  }
  
  public set(key: string, response: string): void {
    this.cache.set(key, {
      response,
      timestamp: Date.now()
    });
    
    // Clean up old entries occasionally
    if (Math.random() < 0.1) {
      this.cleanup();
    }
  }
  
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.TTL) {
        this.cache.delete(key);
      }
    }
  }
  
  // Create a cache key from messages (exclude the last user message that we're responding to)
  public static createKey(messages: Array<{role: string, content: string}>): string {
    // Use messages except the last one to create key
    const keyMessages = messages.slice(0, -1);
    return JSON.stringify(keyMessages);
  }
}

export const chatCache = ChatCache.getInstance();
```

## Next Steps

1. **Install Required Dependencies**:
   ```bash
   npm install date-fns
   ```

2. **Set Up Environment Variables**:
   Create a `.env.local` file with your API keys:
   ```
   OPENROUTER_API_KEY=your_api_key_here
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

3. **Implement the Chat Components**:
   - Start with the context and service layer
   - Build the UI components
   - Add the API endpoints if needed

4. **Testing**:
   - Test the chat interactions
   - Verify that messages are properly persisted
   - Check rate limiting and security features

5. **Deployment Considerations**:
   - Ensure API keys are secured in environment variables
   - Set up proper CORS headers for production
   - Consider adding additional monitoring or logging

## Future Enhancements

1. **Support for Streaming Responses**
2. **Context-aware AI responses based on user's browsing history**
3. **Image and file upload capabilities**
4. **Voice input and text-to-speech output**
5. **Integration with course content for contextual answers**
6. **Support for multiple AI providers through OpenRouter**
7. **Custom AI training on your educational materials**

This implementation will give you a fully functional AI chatbot with a solid architecture and user experience. 