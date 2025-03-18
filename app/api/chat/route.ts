import { NextRequest, NextResponse } from 'next/server';
import { sendChatCompletion, ChatMessage, ChatCompletionRequest, enrichMessagesWithContext, createEnhancedConceptSchema } from '@/lib/openrouter';
import OpenAI from 'openai';
import { ContentChunk, contentIndexingService } from '@/lib/content-indexing-service';
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

// Enhanced search function that uses semantic search when available
async function searchContent(query: string, limit: number = 5): Promise<ContentChunk[]> {
  try {
    // First try semantic search
    try {
      // Ensure the vector service is initialized
      if (!vectorEmbeddingService.isInitialized) {
        await vectorEmbeddingService.initialize();
      }
      
      // Perform semantic search
      const semanticResults = await vectorEmbeddingService.semanticSearch(query, limit);
      
      // If we got results, return them
      if (semanticResults && semanticResults.length > 0) {
        console.log(`Semantic search found ${semanticResults.length} results for '${query}'`);
        return semanticResults.map(result => result.chunk);
      }
    } catch (error) {
      console.warn('Semantic search failed, falling back to keyword search:', error);
    }
    
    // Fall back to basic content search
    if (!contentIndexingService.isIndexed) {
      await contentIndexingService.indexContent();
    }
    
    return contentIndexingService.search(query, limit);
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
  if (!relevantContent || relevantContent.length === 0) {
    return [];
  }

  // Convert ContentChunk[] to ContentReference[]
  return relevantContent.map((chunk, index) => {
    // Calculate a simple relevance score - in a real implementation,
    // this would use semantic similarity
    let relevance = 0.5 + (0.5 / (index + 1));
    
    return {
      title: chunk.title,
      path: chunk.path,
      sectionId: chunk.section?.toLowerCase().replace(/\s+/g, '-'),
      excerpt: chunk.content.substring(0, 120) + '...',
      relevance: relevance,
    };
  });
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
    let relevantContent: ContentChunk[] = context.relevantContent || [];
    
    // If we don't have relevant content yet, search for it
    if (relevantContent.length === 0) {
      relevantContent = await searchContent(message, 5);
    }
    
    // Update context with relevant content
    const enhancedContext = {
      ...context,
      relevantContent
    };
    
    // Generate context message with relevant content
    const contextMessage = generateContextMessage(enhancedContext);
    
    // Prepare system message
    const systemPrompt = getSystemPrompt();
    
    // Prepare messages array for the chat completion
    const chatMessages = [
      { role: 'system' as MessageRole, content: systemPrompt },
      ...(contextMessage ? [{ role: 'system' as MessageRole, content: contextMessage }] : []),
      ...messages.map(m => ({ role: m.role, content: m.content })),
      { role: 'user' as MessageRole, content: message }
    ];
    
    // If this is a concept explanation, provide a schema to the LLM
    let response;
    if (conceptExplanation.isConceptExplanation) {
      const knowledgeLevel = detectKnowledgeLevel(message);
      const includeCode = isCodeExampleRequested(message);
      
      const functionName = 'generateConceptExplanation';
      // Get the concept schema which returns a Record<string, unknown>
      const schema = createEnhancedConceptSchema();
      
      // Use the OpenAI SDK types directly instead of our ChatCompletionRequest
      response = await openai.chat.completions.create({
        model: model,
        messages: chatMessages,
        temperature: 0.7,
        max_tokens: 2048,
        functions: [{ // Use 'functions' for OpenRouter API which matches OpenAI v1 API
          name: functionName,
          description: "Generate a structured explanation of an AI concept",
          parameters: schema // The schema will be used as the parameters object
        }],
        function_call: { name: functionName } // Use function_call for OpenRouter API
      });
    } else {
      // Regular chat completion
      response = await openai.chat.completions.create({
        model: model,
        messages: chatMessages,
        temperature: 0.7,
        max_tokens: 2048
      });
    }
    
    // Extract response from OpenAI
    let content = '';
    let functionResponse = null;
    
    if (response.choices[0].message.tool_calls && response.choices[0].message.tool_calls.length > 0) {
      const toolCall = response.choices[0].message.tool_calls[0];
      if (toolCall.type === 'function' && toolCall.function.arguments) {
        functionResponse = JSON.parse(toolCall.function.arguments);
        
        // Format the concept explanation
        const concept = functionResponse.concept;
        const explanation = functionResponse.explanation[detectKnowledgeLevel(message)];
        const examples = functionResponse.examples || [];
        const related = functionResponse.relatedConcepts || [];
        
        content = `## ${concept}\n\n${explanation}\n\n`;
        
        if (examples.length > 0) {
          content += `### Example\n\`\`\`\n${examples[0]}\n\`\`\`\n\n`;
        }
        
        if (related.length > 0) {
          content += `### Related Concepts\n`;
          related.forEach((r: any) => {
            content += `- ${r.name}\n`;
          });
        }
      }
    } else if (response.choices[0].message.content) {
      content = response.choices[0].message.content;
    }
    
    // Generate navigation suggestions if needed
    let navigationSuggestions: NavigationSuggestion[] = [];
    if (isNavRequest) {
      navigationSuggestions = await generateNavigationSuggestions(message);
    }
    
    // Generate follow-up questions
    const followUpQuestions = generateFollowUpQuestions(message, content);
    
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