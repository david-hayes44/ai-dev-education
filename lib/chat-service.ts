import { db } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  getDocs, 
  serverTimestamp,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { 
  sendChatCompletion, 
  ChatMessage as OpenRouterChatMessage, 
  AVAILABLE_MODELS,
  getModelById
} from '@/lib/openrouter';

// Define the message type for our application
export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  model?: string;
}

// Define model selection type
export interface ModelOption {
  id: string;
  name: string;
  provider: string;
}

// Convert Firestore document to ChatMessage
const convertFirestoreDoc = (doc: QueryDocumentSnapshot<DocumentData>): ChatMessage => {
  const data = doc.data();
  return {
    id: doc.id,
    type: data.type,
    content: data.content,
    timestamp: data.timestamp?.toDate() || new Date(),
    model: data.model,
  };
};

// Save a message to Firestore
export const saveMessage = async (message: Omit<ChatMessage, 'id' | 'timestamp'>): Promise<string> => {
  try {
    const messagesRef = collection(db, 'messages');
    const docRef = await addDoc(messagesRef, {
      ...message,
      timestamp: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving message:', error);
    throw error;
  }
};

// Get recent messages from Firestore
export const getRecentMessages = async (messageLimit = 20): Promise<ChatMessage[]> => {
  try {
    const messagesRef = collection(db, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'desc'), limit(messageLimit));
    const querySnapshot = await getDocs(q);
    
    const messages = querySnapshot.docs.map(convertFirestoreDoc);
    
    // Return in chronological order
    return messages.reverse();
  } catch (error) {
    console.error('Error getting messages:', error);
    return [];
  }
};

// Get available model options
export const getAvailableModels = (): ModelOption[] => {
  return AVAILABLE_MODELS;
};

// Process a user message and get AI response
export const processUserMessage = async (
  userContent: string, 
  modelId = 'google/gemini-2.0-flash-thinking-exp:free',
  temperature = 0.7,
  maxTokens = 1000
): Promise<ChatMessage> => {
  try {
    // Save user message to Firestore
    await saveMessage({
      type: 'user',
      content: userContent,
    });
    
    // Get model info for context
    const modelInfo = getModelById(modelId);
    const modelName = modelInfo?.name || modelId;
    
    // Convert to OpenRouter format
    const messages: OpenRouterChatMessage[] = [
      {
        role: 'system',
        content: `You are an AI assistant for the AI-Dev Education Platform. Your purpose is to help users understand AI-assisted development and the Model Context Protocol (MCP). Be concise, helpful, and informative. You are currently responding as ${modelName}.`
      },
      {
        role: 'user',
        content: userContent
      }
    ];
    
    // Get AI response from OpenRouter
    const response = await sendChatCompletion({
      messages,
      model: modelId,
      temperature,
      max_tokens: maxTokens,
    });
    
    const assistantContent = response.choices[0].message.content;
    
    // Save assistant message to Firestore
    const assistantMessageId = await saveMessage({
      type: 'assistant',
      content: assistantContent,
      model: modelId,
    });
    
    // Return the assistant message
    return {
      id: assistantMessageId,
      type: 'assistant',
      content: assistantContent,
      timestamp: new Date(),
      model: modelId,
    };
  } catch (error) {
    console.error('Error processing message:', error);
    
    // Create a fallback response
    const fallbackMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'assistant',
      content: 'I apologize, but I encountered an error processing your message. Please try again later.',
      timestamp: new Date(),
      model: modelId,
    };
    
    // Try to save the fallback message to Firestore
    try {
      await saveMessage({
        type: fallbackMessage.type,
        content: fallbackMessage.content,
        model: modelId,
      });
    } catch (e) {
      console.error('Error saving fallback message:', e);
    }
    
    return fallbackMessage;
  }
}; 