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
// Update the model to use the working model from the report builder
const model = 'google/gemini-2.0-flash-001';

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
  isStreaming?: boolean;
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

/**
 * Main API handler for chat endpoint with streaming support
 */
export async function POST(req: NextRequest) {
  try {
    // Process request with improved error handling
    const body = await req.json() as ChatRequest;
    const userQuery = body.message || '';
    const messages = body.messages || [];
    const userContext = body.context || {};
    
    if (!userQuery && messages.length === 0) {
      return NextResponse.json({ error: "No message provided" }, { status: 400 });
    }
    
    // Generate a unique ID for the response message
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    
    // Process query for special handling
    const isNavRequest = isNavigationRequest(userQuery);
    const conceptExplanation = isConceptExplanationQuery(userQuery);
    const knowledgeLevel = detectKnowledgeLevel(userQuery);
    const shouldIncludeCode = isCodeExampleRequested(userQuery);
    
    // Base system message
    let systemMessage = getSystemPrompt();
    
    // Initialize metadata for the response
    const responseMetadata: ChatResponse['metadata'] = {
      type: 'standard'
    };
    
    // Add relevant content to the context message if available
    if (!userContext.relevantContent || userContext.relevantContent.length === 0) {
      // If no content was provided, try to find relevant content
      try {
        const chunks = await searchContent(userQuery);
        if (chunks.length > 0) {
          userContext.relevantContent = chunks;
          
          // Extract potential references for citation
          responseMetadata.contentReferences = extractContentReferences(userQuery, chunks);
        }
      } catch (error) {
        console.error('Error searching for content:', error);
      }
    }
    
    // Add context message with current page and relevant content
    const contextMessage = generateContextMessage(userContext);
    
    // If it's a navigation request, handle special case
    if (isNavRequest) {
      // Mark as navigation request in the metadata
      responseMetadata.isNavigationRequest = true;
      
      try {
        // Generate navigation suggestions based on the query
        const suggestions = await generateNavigationSuggestions(userQuery);
        if (suggestions && suggestions.length > 0) {
          responseMetadata.navigationSuggestions = suggestions;
        }
      } catch (error) {
        console.error('Error generating navigation suggestions:', error);
      }
      
      // Add navigation instruction to system prompt
      systemMessage += "\nThe user is looking for navigation assistance. Please help them find the right page or section.";
    }
    
    // If it's a concept explanation, add structured output request
    if (conceptExplanation.isConceptExplanation) {
      // Add structured output schema for concept explanations
      systemMessage += `\nThe user is requesting an explanation of the concept "${conceptExplanation.topic}". Please provide a structured explanation.`;
      responseMetadata.type = 'concept_explanation';
      
      // Add additional instruction based on knowledge level
      systemMessage += `\nProvide the explanation at a ${knowledgeLevel} level.`;
      
      if (shouldIncludeCode) {
        systemMessage += "\nInclude relevant code examples where appropriate.";
      }
    }
    
    // Create the message array for the chat completion
    const chatMessages: ChatMessage[] = [
      { role: "system", content: systemMessage + '\n' + contextMessage },
      ...messages
    ];
    
    // Use streaming response implementation
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send initial response with metadata
          const initialResponseChunk = {
            id: messageId,
            role: 'assistant',
            content: '',
            timestamp: Date.now(),
            metadata: responseMetadata,
            isStreaming: true
          };
          
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(initialResponseChunk)}\n\n`));
          
          // Call OpenRouter with streaming enabled
          const apiStream = await sendChatCompletion({
            messages: chatMessages,
            model,
            stream: true,
            temperature: 0.7,
            // Add retry options for better reliability
            retry_options: {
              max_retries: 3,
              initial_delay: 1000,
              max_delay: 10000,
              backoff_factor: 2
            }
          }) as ReadableStream;
          
          if (!apiStream) {
            throw new Error('Failed to get streaming response from OpenRouter');
          }
          
          // Process the streaming response
          const reader = apiStream.getReader();
          let accumulatedResponse = '';
          
          while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
              // Final chunk with complete response
              const finalResponse: ChatResponse = {
                id: messageId,
                role: 'assistant',
                content: accumulatedResponse,
                timestamp: Date.now(),
                metadata: responseMetadata
              };
              
              // Add follow-up questions for a better user experience
              if (accumulatedResponse) {
                finalResponse.metadata!.followUpQuestions = generateFollowUpQuestions(userQuery, accumulatedResponse);
              }
              
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(finalResponse)}\n\n`));
              controller.enqueue(encoder.encode('data: [DONE]\n\n'));
              break;
            }
            
            // Process the chunk
            const decoder = new TextDecoder();
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n\n');
            
            for (const line of lines) {
              if (line.trim() === '' || !line.startsWith('data: ')) continue;
              
              const data = line.slice(6).trim();
              
              if (data === '[DONE]') continue;
              
              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content || '';
                
                if (content) {
                  // Accumulate content
                  accumulatedResponse += content;
                  
                  // Send stream update
                  const streamUpdate: ChatResponse = {
                    id: messageId,
                    role: 'assistant',
                    content: accumulatedResponse,
                    timestamp: Date.now(),
                    metadata: responseMetadata,
                    isStreaming: true
                  };
                  
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify(streamUpdate)}\n\n`));
                }
              } catch (error) {
                console.error('Error parsing streaming response:', error);
              }
            }
          }
        } catch (error) {
          // Handle errors gracefully in the stream
          const errorResponse = {
            id: messageId,
            role: 'assistant',
            content: `I'm sorry, I encountered an error while processing your request. ${error instanceof Error ? error.message : 'Please try again.'}`,
            timestamp: Date.now(),
            metadata: { type: 'error' }
          };
          
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorResponse)}\n\n`));
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          console.error('Chat streaming error:', error);
        }
      }
    });
    
    // Return the stream with proper headers
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: `Error processing message: ${error instanceof Error ? error.message : 'Unknown error'}` }, 
      { status: 500 }
    );
  }
} 