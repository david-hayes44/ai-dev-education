import { NextRequest, NextResponse } from 'next/server';
import { sendChatCompletion, ChatMessage, ChatCompletionRequest, enrichMessagesWithContext, createEnhancedConceptSchema } from '@/lib/openrouter';
import OpenAI from 'openai';
import { ContentChunk, semanticSearch } from '@/lib/content-indexing-service';
import { NavigationSuggestion } from '@/components/chat/navigation-suggestion';
import { vectorEmbeddingService } from '@/lib/vector-embedding-service';
import { ContentReference } from '@/components/chat/content-references';

// List of AI-related topics we can provide structured explanations for
const AI_TOPICS = [
  "deep learning", "machine learning", "neural networks", "natural language processing", 
  "computer vision", "reinforcement learning", "generative ai", "transformer models",
  "llm", "large language models", "model context protocol", "mcp", "attention mechanism",
  "fine-tuning", "prompt engineering", "rag", "retrieval augmented generation", "vector database",
  "embedding", "tokens", "tokenization", "cuda", "gpu acceleration", "quantization", "onnx",
  "agentic ai", "multimodal", "diffusion models", "gan", "stable diffusion", "openai",
  "anthropic", "claude", "gpt", "cursor", "langchain", "semantic kernel"
];

// Server-side environment variables
const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
const model = 'anthropic/claude-3-opus:1:0';

// Specify role type explicitly to match the expected literal union type
type MessageRole = 'user' | 'assistant' | 'system';

// Define types
interface ChatRequest {
  message: string;
  messages: Array<{
    role: MessageRole;
    content: string;
  }>;
  context?: {
    relevantContent?: ContentChunk[];
    currentPage?: string;
    pageTitle?: string;
    pageDescription?: string;
  };
}

interface ChatResponse {
  role: 'assistant';
  content: string;
  timestamp: number;
  id: string;
  metadata?: {
    type?: string;
    isNavigationRequest?: boolean;
    navigationSuggestions?: NavigationSuggestion[];
    followUpQuestions?: string[];
    contentReferences?: ContentReference[];
  };
}

// Initialize OpenAI client for OpenRouter
const openai = new OpenAI({
  apiKey: apiKey || '',
  baseURL: 'https://openrouter.ai/api/v1',
});

// Function to detect if a query is asking for a concept explanation
function isConceptExplanationQuery(query: string): { isConceptExplanation: boolean, topic?: string } {
  const lowerQuery = query.toLowerCase();
  
  // Check if the query is asking for an explanation
  const explanationPatterns = [
    /what is/i, /explain/i, /how does/i, /define/i, /meaning of/i,
    /concept of/i, /tell me about/i, /what are/i, /describe/i
  ];
  
  const isAskingForExplanation = explanationPatterns.some(pattern => pattern.test(lowerQuery));
  if (!isAskingForExplanation) return { isConceptExplanation: false };
  
  // Check if the query contains an AI-related topic
  for (const topic of AI_TOPICS) {
    if (lowerQuery.includes(topic)) {
      return { isConceptExplanation: true, topic };
    }
  }
  
  return { isConceptExplanation: false };
}

// Function to detect the knowledge level of the user based on their query
function detectKnowledgeLevel(query: string): "beginner" | "intermediate" | "advanced" {
  const lowerQuery = query.toLowerCase();
  
  // Advanced patterns
  const advancedPatterns = [
    /in depth/i, /advanced/i, /complex/i, /technical details/i, /implementation/i,
    /architecture/i, /under the hood/i, /internals/i, /mathematics behind/i
  ];
  
  // Intermediate patterns
  const intermediatePatterns = [
    /how does it work/i, /mechanism/i, /process/i, /explain the concept/i,
    /principle/i, /fundamentals/i, /overview/i, /compared to/i
  ];
  
  if (advancedPatterns.some(pattern => pattern.test(lowerQuery))) {
    return "advanced";
  } else if (intermediatePatterns.some(pattern => pattern.test(lowerQuery))) {
    return "intermediate";
  } else {
    return "beginner";
  }
}

// Function to check if code examples are requested
function isCodeExampleRequested(query: string): boolean {
  const lowerQuery = query.toLowerCase();
  
  const codePatterns = [
    /code example/i, /example code/i, /sample code/i, /implementation/i,
    /how to implement/i, /how to code/i, /code sample/i, /programming/i,
    /with code/i, /show code/i, /code snippet/i, /how would you code/i
  ];
  
  return codePatterns.some(pattern => pattern.test(lowerQuery));
}

// Enhanced function to check if navigation assistance is requested
function isNavigationRequest(query: string): boolean {
  const lowerQuery = query.toLowerCase();
  
  const navigationPatterns = [
    /where can i find/i, /show me/i, /navigate to/i, /take me to/i,
    /where is/i, /how do i get to/i, /link to/i, /find/i,
    /section about/i, /page on/i, /documentation for/i,
    /go to/i, /bring up/i, /open the/i, /access/i
  ];
  
  // Only return true for explicit navigation requests with these patterns
  // Simply mentioning a topic like "MCP servers" shouldn't trigger navigation
  return navigationPatterns.some(pattern => pattern.test(lowerQuery)) &&
    !lowerQuery.includes("tell me about") &&
    !lowerQuery.includes("explain") &&
    !lowerQuery.includes("what is") &&
    !lowerQuery.includes("how does");
}

/**
 * Search for content related to a query
 * Uses semantic search to find relevant content
 */
async function searchContent(query: string, limit: number = 5): Promise<ContentChunk[]> {
  try {
    // Use semantic search directly
    return await semanticSearch(query, { limit });
  } catch (error) {
    console.error('Content search error:', error);
    return [];
  }
}

// Enhanced function to generate navigation suggestions using semantic search
async function generateNavigationSuggestions(query: string): Promise<NavigationSuggestion[]> {
  // Extract potential topic from navigation query
  const navigationPatterns = [
    /where can i find (.*)/i, /show me (.*)/i, /navigate to (.*)/i, 
    /take me to (.*)/i, /where is (.*)/i, /how do i get to (.*)/i, 
    /link to (.*)/i, /find (.*)/i, /go to (.*)/i
  ];
  
  let topic = '';
  for (const pattern of navigationPatterns) {
    const match = query.match(pattern);
    if (match && match[1]) {
      topic = match[1].trim();
      break;
    }
  }
  
  if (!topic) {
    const words = query.split(/\s+/);
    // Use the last few words if no explicit topic was found
    topic = words.slice(Math.max(0, words.length - 3)).join(' ');
  }
  
  try {
    // First try to use semantic search for better results
    const chunks = await searchContent(topic, 3);
    
    // Convert search results to navigation suggestions
    return chunks.map((chunk) => ({
      title: chunk.title,
      path: chunk.path,
      description: chunk.content.substring(0, 100) + '...',
      confidence: 0.85,
      sectionId: chunk.section?.toLowerCase().replace(/\s+/g, '-'),
      isSemanticMatch: true
    }));
  } catch (error) {
    console.error('Error generating navigation suggestions:', error);
    return [];
  }
}

// Format relevant content for context
function formatContentContext(content: ContentChunk[]): string {
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

// Enhanced context message generation that provides more structured data
function generateContextMessage(context?: ChatRequest['context']): string {
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
    contextMessage += `\nRELEVANT CONTENT (Use this information to provide accurate answers):\n${formatContentContext(context.relevantContent)}\n`;
  }

  return contextMessage;
}

// Enhanced system prompt that instructs the model on how to use references
function getSystemPrompt(): string {
  return `You are AITutor, an educational assistant for the AI Dev Education platform. Your purpose is to help users understand AI development concepts and navigate the platform resources.

When responding:
- Be concise and informative, focusing on providing accurate information
- When referencing platform resources, mention them specifically and cite your sources
- Adapt your responses based on the current page context provided
- Provide context-aware help based on the user's current location in the documentation
- When you use information from RELEVANT CONTENT, explicitly reference it in your answer
- For navigation requests, guide users to the most relevant sections

The platform covers topics including:
- Model Context Protocol (MCP)
- AI Agent development
- Prompt engineering
- LLM systems
- Multimodal AI
- AI safety and alignment`;
}

// Generate follow-up questions based on the response and query
function generateFollowUpQuestions(query: string, response: string): string[] {
  const topics = extractTopics(query, response);
  const followUps: string[] = [];
  
  // Generate follow-ups based on topics
  topics.forEach(topic => {
    if (topic.toLowerCase().includes('mcp') || topic.toLowerCase().includes('model context protocol')) {
      followUps.push(`How can I implement ${topic} in my project?`);
      followUps.push(`What are the key components of ${topic}?`);
    } else if (topic.toLowerCase().includes('server') || topic.toLowerCase().includes('architecture')) {
      followUps.push(`What are the security considerations for ${topic}?`);
      followUps.push(`How does ${topic} scale with increasing users?`);
    } else if (topic.toLowerCase().includes('development')) {
      followUps.push(`What tools are recommended for ${topic}?`);
      followUps.push(`What are best practices for ${topic}?`);
    }
  });
  
  // Add generic follow-ups if we don't have enough
  if (followUps.length < 2) {
    followUps.push("Can you provide code examples?");
    followUps.push("Where can I learn more about this?");
    followUps.push("What related topics should I explore next?");
  }
  
  // Return a maximum of 3 unique follow-up questions
  return [...new Set(followUps)].slice(0, 3);
}

// Extract topics from text
function extractTopics(query: string, response: string): string[] {
  const keywords = [
    'mcp', 'model context protocol', 'context management',
    'context window', 'token limit', 'server', 'architecture',
    'security', 'api', 'development', 'workflow', 'agent',
    'integration', 'tools', 'cursor', 'ide', 'llm',
    'large language model', 'prompt engineering'
  ];
  
  const foundTopics: string[] = [];
  const lowerQuery = query.toLowerCase();
  const lowerResponse = response.toLowerCase();
  
  // Find keywords in the text
  keywords.forEach(keyword => {
    if (lowerQuery.includes(keyword) || lowerResponse.includes(keyword)) {
      foundTopics.push(keyword);
    }
  });
  
  return [...new Set(foundTopics)];
}

// Extract content references from a response
function extractContentReferences(query: string, relevantContent: ContentChunk[]): ContentReference[] {
  try {
    if (!relevantContent || relevantContent.length === 0) {
      return [];
    }
    
    // Extract the most relevant content chunks
    const topChunks = relevantContent.slice(0, 3);
    
    // Convert to ContentReference format
    const references: ContentReference[] = topChunks.map(chunk => {
      // Calculate relevance score - if not provided, use a default
      const relevance = chunk.relevance !== undefined 
        ? chunk.relevance 
        : 0.7; // Default relevance for chunks without a score
      
      // Create a short excerpt from the content
      const excerpt = chunk.content.length > 120 
        ? chunk.content.substring(0, 120) + '...'
        : chunk.content;
        
      return {
        title: chunk.title,
        path: chunk.path,
        sectionId: chunk.sectionId,
        excerpt,
        relevance
      };
    });
    
    return references;
  } catch (error: unknown) {
    console.error('Error extracting content references:', error);
    return [];
  }
}

// Enhanced POST handler that integrates semantic search and content references
export async function POST(req: NextRequest) {
  try {
    const { message, messages = [], context = {} } = await req.json() as ChatRequest;
    
    if (!message) {
      return NextResponse.json(
        { error: "Missing message parameter" },
        { status: 400 }
      );
    }
    
    // Detect if this is a concept explanation query
    const conceptExplanation = isConceptExplanationQuery(message);
    
    // Detect if this is a navigation request
    const isNavRequest = isNavigationRequest(message);
    
    // Prepare context data
    const relevantContent: ContentChunk[] = context.relevantContent || [];
    
    // If we don't have relevant content yet, search for it
    if (relevantContent.length === 0) {
      const searchResults = await searchContent(message, 5);
      relevantContent.push(...searchResults);
    }
    
    // Update context with relevant content
    const enhancedContext = {
      ...context,
      relevantContent
    };
    
    // Add system context message
    const contextMessage = generateContextMessage(enhancedContext);
    
    // Call OpenRouter if API key is available
    const openRouterApiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
    let content = '';
    let navigationSuggestions: NavigationSuggestion[] = [];
    let followUpQuestions: string[] = [];
    
    if (openRouterApiKey) {
      // If this is potentially a concept explanation, use enhanced prompt
      if (conceptExplanation.isConceptExplanation) {
        // Generate structured explanation using schema
        try {
          // Fix: Call the function with optional parameters or directly without args
          const knowledgeLevel = detectKnowledgeLevel(message);
          const includeCode = isCodeExampleRequested(message);
          const conceptSchema = createEnhancedConceptSchema({
            knowledgeLevel,
            includeCode
          });
          
          // Streaming full response
          const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${openRouterApiKey}`,
              'HTTP-Referer': process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
              'X-Title': 'AI Education Platform'
            },
            body: JSON.stringify({
              model: 'anthropic/claude-3-sonnet:beta',
              messages: [
                {
                  role: 'system',
                  content: `You are an AI education assistant focused on explaining AI concepts clearly and accurately. ${contextMessage}
                  
When explaining AI concepts, use this JSON schema to structure your response:
${JSON.stringify(conceptSchema, null, 2)}

Make sure your response is valid JSON that follows this schema exactly, with all required fields. Do not include any markdown formatting, just the pure JSON.`
                },
                ...messages.map((msg): { role: string; content: string } => ({ 
                  role: msg.role, 
                  content: msg.content 
                })),
                { role: 'user', content: message }
              ],
              response_format: { type: "json_object" }
            })
          });
          
          if (!response.ok) {
            throw new Error(`OpenRouter API error: ${response.status}`);
          }
          
          const responseData = await response.json() as { choices: [{ message: { content: string } }] };
          content = responseData.choices[0].message.content;
          
          // Generate navigation suggestions and follow-up questions
          navigationSuggestions = await generateNavigationSuggestions(message);
          followUpQuestions = generateFollowUpQuestions(message, content);
        } catch (error) {
          console.error('Error generating structured concept explanation:', error);
          content = `I apologize, but I encountered an error while trying to explain this concept. Please try asking in a different way or about a different topic.`;
        }
      } else {
        // Regular chat response
        try {
          const systemPrompt = getSystemPrompt();
          
          // Add context-specific information to the system prompt
          const fullSystemPrompt = `${systemPrompt}\n\n${contextMessage}`;
          
          // Streaming full response
          const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${openRouterApiKey}`,
              'HTTP-Referer': process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
              'X-Title': 'AI Education Platform'
            },
            body: JSON.stringify({
              model: 'anthropic/claude-3-haiku',
              messages: [
                { role: 'system', content: fullSystemPrompt },
                ...messages.map((msg): { role: string; content: string } => ({ 
                  role: msg.role, 
                  content: msg.content 
                })),
                { role: 'user', content: message }
              ]
            })
          });
          
          if (!response.ok) {
            throw new Error(`OpenRouter API error: ${response.status}`);
          }
          
          const responseData = await response.json() as { choices: [{ message: { content: string } }] };
          content = responseData.choices[0].message.content;
          
          // Generate navigation suggestions
          if (isNavRequest) {
            navigationSuggestions = await generateNavigationSuggestions(message);
          }
          
          // Generate follow-up questions
          followUpQuestions = generateFollowUpQuestions(message, content);
          
        } catch (error) {
          console.error('Error calling OpenRouter API:', error);
          content = `I apologize, but I encountered an error while processing your request. Please try again later.`;
        }
      }
    } else {
      // Fallback for when OpenRouter is not available
      content = `I'm sorry, but I'm not fully configured yet. Please check that the OpenRouter API key is properly set up.`;
    }
    
    // Extract content references
    const contentReferences = extractContentReferences(message, relevantContent);
    
    // Prepare the response
    const chatResponse: ChatResponse = {
      role: 'assistant',
      content,
      timestamp: Date.now(),
      id: crypto.randomUUID(),
      metadata: {
        isNavigationRequest: isNavRequest,
        type: conceptExplanation.isConceptExplanation ? 'concept' : 'answer',
        navigationSuggestions,
        followUpQuestions,
        contentReferences
      }
    };
    
    return NextResponse.json(chatResponse);
    
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: "Failed to process chat message" },
      { status: 500 }
    );
  }
} 