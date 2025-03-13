import { NextRequest, NextResponse } from 'next/server';
import { sendChatCompletion, ChatMessage, ChatCompletionRequest } from '@/lib/openrouter';

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

export async function POST(req: NextRequest) {
  try {
    const { messages, currentPage, model } = await req.json();
    
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid request format' }, { status: 400 });
    }
    
    // Get the user's query (last message)
    const userQuery = messages.findLast((m: ChatMessage) => m.role === 'user')?.content || '';
    
    // Enhance messages with context based on current page if available
    const enhancedMessages: ChatMessage[] = [...messages];
    
    if (currentPage) {
      enhancedMessages.unshift({
        role: 'system',
        content: `The user is currently on the ${currentPage} page. Consider this context in your response if relevant.`
      });
    }
    
    // Check if this is a concept explanation query
    const { isConceptExplanation, topic } = isConceptExplanationQuery(userQuery);
    
    if (isConceptExplanation && topic) {
      const knowledgeLevel = detectKnowledgeLevel(userQuery);
      const includeCode = isCodeExampleRequested(userQuery);
      
      // Add system message to guide the structured response
      enhancedMessages.unshift({
        role: 'system',
        content: `The user is asking about the concept of ${topic}. Provide a structured explanation at the ${knowledgeLevel} level. ${includeCode ? 'Include relevant code examples.' : ''} 
        
Format your response as a JSON object with the following structure:
\`\`\`json
{
  "concept": "name of concept",
  "knowledge_level": "${knowledgeLevel}",
  "summary": "brief summary",
  "details": "detailed explanation using markdown",
  "code_example": "example code if relevant",
  "related_concepts": ["related1", "related2"]
}
\`\`\`

Make sure your entire response is valid JSON that can be parsed. Do not include any text outside the JSON structure.`
      });
    }
    
    // Create the request object
    const request: ChatCompletionRequest = {
      messages: enhancedMessages,
      model: model || 'google/gemini-2.0-flash-thinking-exp:free' // Use the model from the request or default to Gemini 2.0 Flash
    };
    
    // Call the OpenRouter API
    const response = await sendChatCompletion(request);
    
    // Add metadata to the response
    if (isConceptExplanation && topic) {
      // Create a new object with the metadata
      const enhancedResponse = {
        ...response,
        metadata: {
          type: "concept_explanation",
          topic,
          knowledgeLevel: detectKnowledgeLevel(userQuery)
        }
      };
      
      return NextResponse.json(enhancedResponse);
    }
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
} 