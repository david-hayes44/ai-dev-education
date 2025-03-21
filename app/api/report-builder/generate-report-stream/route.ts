import { NextRequest } from "next/server";
import { UploadedDocument, ReportState } from "@/components/report-builder/types";
import { sendChatCompletion, ChatMessage } from "@/lib/openrouter";

// Define type for section keys
type SectionKey = 'accomplishments' | 'insights' | 'decisions' | 'nextSteps';

/**
 * Creates an empty report structure
 */
function createEmptyReport(): ReportState {
  const now = new Date();
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  const month = monthNames[now.getMonth()];
  const day = now.getDate();
  const year = now.getFullYear();
  
  const getOrdinalSuffix = (d: number) => {
    if (d > 3 && d < 21) return 'th';
    switch (d % 10) {
      case 1: return "st";
      case 2: return "nd";
      case 3: return "rd";
      default: return "th";
    }
  };
  
  return {
    title: "Status Report",
    date: `${month} ${day}${getOrdinalSuffix(day)} ${year}`,
    sections: {
      accomplishments: "",
      insights: "",
      decisions: "",
      nextSteps: ""
    },
    metadata: {
      lastUpdated: Date.now(),
      relatedDocuments: []
    }
  };
}

/**
 * Streaming API endpoint to generate a 4-box report from uploaded documents
 * Returns a streaming response with partial results as they're generated
 */
export async function POST(request: NextRequest) {
  try {
    const { documents = [], projectContext = "" } = await request.json() as { 
      documents: UploadedDocument[],
      projectContext?: string 
    };
    
    if (!documents.length) {
      // Return an error stream
      return new Response(createErrorStream("No documents provided for report generation"), {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        }
      });
    }
    
    // Only use the first document for processing to simplify and improve stability
    const firstDocument = documents[0];
    
    // Validate document content is present
    if (!firstDocument.textContent || firstDocument.textContent.trim() === '') {
      return new Response(createErrorStream("Document contains no text content to process"), {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        }
      });
    }
    
    console.log(`[generate-report-stream API] Processing document: ${firstDocument.name} (ID: ${firstDocument.id || 'no-id'}, Size: ${firstDocument.size} bytes, Content: ${firstDocument.textContent ? `${firstDocument.textContent.length} chars` : 'none'})`);
    
    // Create a prompt that includes the document content
    const messages: ChatMessage[] = [
      {
        role: "system",
        content: `You are the 4-Box Report Builder, an assistant designed to help professionals create concise, informative status reports.

Your task is to analyze the provided document and generate content for a 4-box report with these sections:

1. Accomplishments Since Last Update: List completed tasks, milestones reached, and successes.
2. Insights / Learnings: Highlight important discoveries, lessons learned, and "aha moments".
3. Decisions / Risks / Resources Required: Note decisions needed, potential issues, and resource requirements.
4. Next Steps / Upcoming Tasks: Outline immediate future work and upcoming deliverables.

When generating the report:
- Be concise and factual
- Organize information in bullet points
- Prioritize recent information over older content
- Focus on actionable items and clear status updates
- Maintain professional language suitable for stakeholders

Structure your response with section headers and bullet points for each section.`
      },
      {
        role: "user",
        content: `Here is the document to analyze:\n\n${firstDocument.textContent}\n\n${
          projectContext ? `Project Context: ${projectContext}\n\n` : ''
        }Based on this document, generate content for each section of the 4-box report.`
      }
    ];
    
    console.log('OpenRouter request stats: model=google/gemini-2.0-flash-001, message_count=2, total_content_length=' + (messages[0].content.length + messages[1].content.length));
    
    // Request streaming response from OpenRouter
    try {
      const stream = await sendChatCompletion({
        messages,
        model: "google/gemini-2.0-flash-001",
        stream: true,
        temperature: 0.2
      }) as ReadableStream;
      
      // Transform the stream to include useful metadata
      const transformedStream = transformOpenRouterStream(stream);
      
      // Return the stream directly to the client
      return new Response(transformedStream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        }
      });
    } catch (error) {
      console.error(`[generate-report-stream API] Error calling OpenRouter API:`, error);
      return new Response(createErrorStream(`Error calling OpenRouter API: ${error instanceof Error ? error.message : String(error)}`), {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        }
      });
    }
  } catch (error) {
    console.error('[generate-report-stream API] Error in stream generation:', error);
    return new Response(createErrorStream(`Error processing report: ${error instanceof Error ? error.message : String(error)}`), {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });
  }
}

/**
 * Transform the OpenRouter stream to include report structure information
 */
function transformOpenRouterStream(inputStream: ReadableStream): ReadableStream {
  const encoder = new TextEncoder();
  let buffer = '';
  let currentSection: SectionKey | null = null;
  
  // Store partial results for each section
  const partialSections: Record<SectionKey, string> = {
    accomplishments: '',
    insights: '',
    decisions: '',
    nextSteps: ''
  };
  
  // Create a transformed stream
  const transformStream = new TransformStream({
    async transform(chunk, controller) {
      // Decode the chunk
      const decoder = new TextDecoder();
      const text = decoder.decode(chunk);
      
      // Add to buffer and process line by line
      buffer += text;
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          
          if (data === '[DONE]') {
            // End of stream
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            continue;
          }
          
          try {
            // Parse the JSON data
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content || '';
            
            if (content) {
              // Try to determine which section this chunk belongs to
              if (content.includes('Accomplishments') || content.includes('1.')) {
                currentSection = 'accomplishments';
              } else if (content.includes('Insights') || content.includes('Learnings') || content.includes('2.')) {
                currentSection = 'insights';
              } else if (content.includes('Decisions') || content.includes('Risks') || content.includes('3.')) {
                currentSection = 'decisions';
              } else if (content.includes('Next Steps') || content.includes('Upcoming') || content.includes('4.')) {
                currentSection = 'nextSteps';
              }
              
              // If we have a current section, add the text to it
              if (currentSection) {
                partialSections[currentSection] += content;
              }
              
              // Create an enhanced chunk with report structure information
              const enhanced = {
                ...parsed,
                report_metadata: {
                  current_section: currentSection,
                  section_content: {
                    ...partialSections
                  }
                }
              };
              
              // Send the enhanced chunk
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(enhanced)}\n\n`));
            } else {
              // Pass through the original chunk if there's no content
              controller.enqueue(encoder.encode(line + '\n'));
            }
          } catch (error) {
            console.error('Error transforming stream chunk:', error);
            // Pass through the original chunk on error
            controller.enqueue(encoder.encode(line + '\n'));
          }
        } else {
          // Pass through non-data lines
          controller.enqueue(encoder.encode(line + '\n'));
        }
      }
    },
    
    flush(controller) {
      // Handle any remaining data in the buffer
      if (buffer.trim()) {
        controller.enqueue(encoder.encode(buffer + '\n'));
      }
    }
  });
  
  // Pipe the input stream through the transform stream
  inputStream.pipeTo(transformStream.writable).catch(err => {
    console.error('Error piping stream:', err);
  });
  
  // Return the readable part of the transform stream
  return transformStream.readable;
}

/**
 * Creates a ReadableStream that emits error messages in SSE format
 */
function createErrorStream(errorMessage: string): ReadableStream {
  return new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      
      // Send an initial message
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({
        id: 'error',
        choices: [{
          delta: { content: `Error: ${errorMessage}` },
          finish_reason: 'error',
          index: 0
        }],
        report_metadata: {
          error: errorMessage
        }
      })}\n\n`));
      
      // Send a [DONE] event
      controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      controller.close();
    }
  });
} 