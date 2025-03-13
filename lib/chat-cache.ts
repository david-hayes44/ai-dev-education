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
    try {
      if (!key) return null;
      
      const entry = this.cache.get(key);
      
      if (!entry) return null;
      
      // Check if entry has expired
      if (Date.now() - entry.timestamp > this.TTL) {
        this.cache.delete(key);
        return null;
      }
      
      return entry.response;
    } catch (error) {
      console.error('Error in cache.get:', error);
      return null;
    }
  }
  
  public set(key: string, response: string): void {
    try {
      if (!key || !response) return;
      
      this.cache.set(key, {
        response,
        timestamp: Date.now()
      });
      
      // Clean up old entries occasionally
      if (Math.random() < 0.1) {
        this.cleanup();
      }
    } catch (error) {
      console.error('Error in cache.set:', error);
    }
  }
  
  private cleanup(): void {
    try {
      const now = Date.now();
      Array.from(this.cache.entries()).forEach(([key, entry]) => {
        if (now - entry.timestamp > this.TTL) {
          this.cache.delete(key);
        }
      });
    } catch (error) {
      console.error('Error in cache cleanup:', error);
    }
  }
  
  // Create a cache key from messages (exclude the last user message that we're responding to)
  public static createKey(messages: Array<{role: string, content: string}>): string {
    try {
      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return '';
      }
      
      // Use messages except the last one to create key
      const keyMessages = messages.slice(0, -1);
      return JSON.stringify(keyMessages);
    } catch (error) {
      console.error('Error creating cache key:', error);
      return '';
    }
  }
}

export const chatCache = ChatCache.getInstance(); 