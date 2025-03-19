import { ChatSession, Message, MessageRole, MessageMetadata } from './chat-service';
import { chatStorage } from './chat-storage';

// Define the format for exported conversations
export interface ExportedConversation {
  version: string;
  session: {
    id: string;
    title: string;
    topic?: string;
    category?: string;
    model?: string;
    createdAt: number;
    updatedAt: number;
  };
  messages: Array<{
    role: string;
    content: string;
    timestamp: number;
    metadata?: Record<string, unknown>;
  }>;
}

/**
 * Utility for importing and exporting chat conversations
 */
export class ConversationIO {
  /**
   * Export a conversation to JSON format
   * @param sessionId ID of the session to export
   * @returns Exported conversation data or null if fails
   */
  async exportConversation(sessionId: string): Promise<ExportedConversation | null> {
    try {
      const session = await chatStorage.getSession(sessionId);
      if (!session) {
        console.error('Session not found:', sessionId);
        return null;
      }
      
      // Create export format
      const exportData: ExportedConversation = {
        version: '1.0',
        session: {
          id: session.id,
          title: session.title,
          topic: session.topic,
          category: session.category,
          model: session.model,
          createdAt: session.createdAt,
          updatedAt: session.updatedAt
        },
        messages: session.messages.map(msg => ({
          role: msg.role,
          content: msg.content,
          timestamp: typeof msg.timestamp === 'number' ? msg.timestamp : Number(msg.timestamp),
          metadata: msg.metadata
        }))
      };
      
      return exportData;
    } catch (error) {
      console.error('Error exporting conversation:', error);
      return null;
    }
  }
  
  /**
   * Export a conversation to plain text format
   * @param sessionId ID of the session to export
   * @returns Plain text conversation or null if fails
   */
  async exportConversationAsText(sessionId: string): Promise<string | null> {
    try {
      const session = await chatStorage.getSession(sessionId);
      if (!session) {
        console.error('Session not found:', sessionId);
        return null;
      }
      
      // Build plain text format
      let text = `# ${session.title}\n\n`;
      
      if (session.topic) {
        text += `Topic: ${session.topic}\n`;
      }
      
      if (session.category) {
        text += `Category: ${session.category}\n`;
      }
      
      text += `Date: ${new Date(session.createdAt).toLocaleString()}\n\n`;
      
      // Add messages
      session.messages.forEach(msg => {
        const role = msg.role === 'user' ? 'You' : 'Assistant';
        const time = new Date(msg.timestamp).toLocaleTimeString();
        
        text += `${role} (${time}):\n${msg.content}\n\n`;
      });
      
      return text;
    } catch (error) {
      console.error('Error exporting conversation as text:', error);
      return null;
    }
  }
  
  /**
   * Import a conversation from an exported JSON format
   * @param exportData Exported conversation data
   * @returns The session ID of the imported conversation, or null if it fails
   */
  async importConversation(exportData: ExportedConversation): Promise<string | null> {
    try {
      // Validate the export format
      if (!exportData.version || !exportData.session || !Array.isArray(exportData.messages)) {
        console.error('Invalid export format');
        return null;
      }
      
      // Create a new session
      const sessionId = await chatStorage.createSession({
        title: exportData.session.title,
        topic: exportData.session.topic,
        category: exportData.session.category,
        model: exportData.session.model,
        messages: []
      });
      
      if (!sessionId) {
        console.error('Failed to create session');
        return null;
      }
      
      // Add each message to the session
      for (const msg of exportData.messages) {
        await chatStorage.addMessage(sessionId, {
          role: msg.role as MessageRole,
          content: msg.content,
          timestamp: msg.timestamp,
          metadata: msg.metadata as MessageMetadata,
          attachments: []
        });
      }
      
      return sessionId;
    } catch (error) {
      console.error('Error importing conversation:', error);
      return null;
    }
  }
  
  /**
   * Get a conversation as a downloadable blob
   * @param sessionId Session ID
   * @param format Format ('json' or 'text')
   * @returns Blob for downloading
   */
  async getConversationBlob(sessionId: string, format: 'json' | 'text'): Promise<Blob | null> {
    try {
      if (format === 'json') {
        const exportData = await this.exportConversation(sessionId);
        if (!exportData) return null;
        
        const json = JSON.stringify(exportData, null, 2);
        return new Blob([json], { type: 'application/json' });
      } else {
        const text = await this.exportConversationAsText(sessionId);
        if (!text) return null;
        
        return new Blob([text], { type: 'text/plain' });
      }
    } catch (error) {
      console.error('Error creating conversation blob:', error);
      return null;
    }
  }
  
  /**
   * Create a download URL for a conversation
   * @param sessionId Session ID
   * @param format Format ('json' or 'text')
   * @returns URL for downloading
   */
  async getConversationDownloadUrl(sessionId: string, format: 'json' | 'text'): Promise<string | null> {
    try {
      const blob = await this.getConversationBlob(sessionId, format);
      if (!blob) return null;
      
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Error creating download URL:', error);
      return null;
    }
  }
  
  /**
   * Parse a file to import a conversation
   * @param file File to import
   * @returns Exported conversation data or null if parsing fails
   */
  async parseImportFile(file: File): Promise<ExportedConversation | null> {
    try {
      const text = await file.text();
      
      if (file.type === 'application/json' || file.name.endsWith('.json')) {
        try {
          const data = JSON.parse(text);
          
          // Basic validation of the structure
          if (!data.version || !data.session || !Array.isArray(data.messages)) {
            console.error('Invalid import format');
            return null;
          }
          
          return data as ExportedConversation;
        } catch (err) {
          console.error('Error parsing JSON:', err);
          return null;
        }
      } else {
        console.error('Unsupported file format');
        return null;
      }
    } catch (error) {
      console.error('Error parsing import file:', error);
      return null;
    }
  }
}

// Export singleton instance
export const conversationIO = new ConversationIO(); 