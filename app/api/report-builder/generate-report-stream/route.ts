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

Your task is to analyze the provided document and generate content for a 4-box report with these clearly separated sections:

1. Accomplishments Since Last Update
- List completed tasks, milestones reached, and successes
- Format as bullet points with each point starting with "*" or "-"
- Focus on tangible achievements and completed work

2. Insights / Learnings
- Highlight important discoveries, lessons learned, and "aha moments"
- Format as bullet points with each point starting with "*" or "-"
- Include unexpected findings or realizations

3. Decisions / Risks / Resources Required
- Note decisions needed, potential issues, and resource requirements
- Format as bullet points with each point starting with "*" or "-"
- Be specific about blockers, open questions, and needs

4. Next Steps / Upcoming Tasks
- Outline immediate future work and upcoming deliverables
- Format as bullet points with each point starting with "*" or "-"
- Include timelines or deadlines where relevant

When generating the report:
- Always use the exact section headers as specified above (numbered 1-4)
- Make a clear separation between sections with a blank line
- Be concise and factual - use bullet points for all items
- Prioritize recent information over older content
- Focus on actionable items and clear status updates
- Maintain professional language suitable for stakeholders

Always structure your response following this exact format, with each section clearly labeled with its number and title.`
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
  
  // Keep track of the entire content to better parse sections
  let fullContent = '';
  
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
              // Add to full content
              fullContent += content;
              
              // More robust section detection based on headers and numbering patterns
              if (content.match(/(?:Accomplishments|1\.)\s*(?:Since\s+Last\s+Update)?/i) || 
                  fullContent.match(/(?:Accomplishments|1\.)\s*(?:Since\s+Last\s+Update)?[^:]*:?\s*\n/i)) {
                currentSection = 'accomplishments';
              } else if (content.match(/(?:Insights|Learnings|2\.)/i) || 
                         fullContent.match(/(?:Insights|Learnings|2\.)[^:]*:?\s*\n/i)) {
                currentSection = 'insights';
              } else if (content.match(/(?:Decisions|Risks|Resources|3\.)/i) || 
                         fullContent.match(/(?:Decisions|Risks|Resources|3\.)[^:]*:?\s*\n/i)) {
                currentSection = 'decisions';
              } else if (content.match(/(?:Next\s+Steps|Upcoming|4\.)/i) || 
                         fullContent.match(/(?:Next\s+Steps|Upcoming|4\.)[^:]*:?\s*\n/i)) {
                currentSection = 'nextSteps';
              }
              
              // If we have a current section, add the text to it
              if (currentSection) {
                partialSections[currentSection] += content;
              }
              
              // Check if we've moved to a new section based on the full content
              // This helps capture section transitions more accurately
              const accomplishmentsMatch = fullContent.match(/(?:1\.|Accomplishments)[^:]*(?::|\n)/i);
              const insightsMatch = fullContent.match(/(?:2\.|Insights|Learnings)[^:]*(?::|\n)/i);
              const decisionsMatch = fullContent.match(/(?:3\.|Decisions|Risks|Resources)[^:]*(?::|\n)/i);
              const nextStepsMatch = fullContent.match(/(?:4\.|Next\s+Steps|Upcoming)[^:]*(?::|\n)/i);
              
              // Get the positions of each section header in the full content
              const positions = {
                accomplishments: accomplishmentsMatch ? accomplishmentsMatch.index || Infinity : Infinity,
                insights: insightsMatch ? insightsMatch.index || Infinity : Infinity,
                decisions: decisionsMatch ? decisionsMatch.index || Infinity : Infinity,
                nextSteps: nextStepsMatch ? nextStepsMatch.index || Infinity : Infinity
              };
              
              // If we have at least two section headers, we can clean up the content
              // by ensuring each section only contains content that belongs to it
              if (Object.values(positions).filter(p => p !== Infinity).length >= 2) {
                // Rebuild the sections based on their positions in the full text
                const sections = ['accomplishments', 'insights', 'decisions', 'nextSteps'] as SectionKey[];
                
                // Sort sections by their position in the full content
                const sortedSections = sections
                  .filter(s => positions[s] !== Infinity)
                  .sort((a, b) => positions[a] - positions[b]);
                
                // Extract content for each section based on its position and the position of the next section
                if (sortedSections.length >= 2) {
                  for (let i = 0; i < sortedSections.length; i++) {
                    const section = sortedSections[i];
                    const nextSection = sortedSections[i + 1];
                    const startPos = positions[section];
                    const endPos = nextSection ? positions[nextSection] : fullContent.length;
                    
                    if (startPos !== Infinity && endPos !== Infinity) {
                      // Extract the section content from the full content
                      let sectionContent = fullContent.substring(startPos, endPos);
                      
                      // Remove the section header
                      sectionContent = sectionContent.replace(/^(?:\d\.|[A-Za-z\s\/]+)[^:]*(?::|\n)/i, '');
                      
                      // Clean up the content
                      sectionContent = sectionContent.trim();
                      
                      // Update the section content
                      partialSections[section] = sectionContent;
                    }
                  }
                }
              }
              
              // Periodically clean up section content by removing section headers from the content
              for (const section of Object.keys(partialSections) as SectionKey[]) {
                partialSections[section] = partialSections[section]
                  .replace(/^(?:1\.|Accomplishments)[^:]*:?\s*\n/m, '')
                  .replace(/^(?:2\.|Insights|Learnings)[^:]*:?\s*\n/m, '')
                  .replace(/^(?:3\.|Decisions|Risks|Resources)[^:]*:?\s*\n/m, '')
                  .replace(/^(?:4\.|Next\s+Steps|Upcoming)[^:]*:?\s*\n/m, '');
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