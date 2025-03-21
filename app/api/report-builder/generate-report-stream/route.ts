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

Your task is to analyze the provided document and generate content for a 4-box report with these EXACTLY FORMATTED sections:

1. Accomplishments Since Last Update
- List completed tasks, milestones reached, and successes as bullet points
- Each bullet point must start with "*" or "-" 
- Focus on tangible achievements and completed work

2. Insights / Learnings
- Highlight important discoveries, lessons learned, and "aha moments" as bullet points
- Each bullet point must start with "*" or "-"
- Include unexpected findings or realizations

3. Decisions / Risks / Resources Required
- Note decisions needed, potential issues, and resource requirements as bullet points
- Each bullet point must start with "*" or "-"
- Be specific about blockers, open questions, and needs

4. Next Steps / Upcoming Tasks
- Outline immediate future work and upcoming deliverables as bullet points
- Each bullet point must start with "*" or "-"
- Include timelines or deadlines where relevant

IMPORTANT FORMATTING REQUIREMENTS:
- Use EXACTLY these section headers with their numbers (1., 2., 3., 4.)
- Each section MUST be separated by a blank line
- ALL content MUST be formatted as bullet points starting with "*" or "-"
- After each section header, start a new line for the first bullet point
- DO NOT include any additional headers or sections
- DO NOT include any introductory or concluding text
- DO NOT abbreviate or modify the section headers

Example of correct formatting:

1. Accomplishments Since Last Update
* Completed feature X implementation
* Fixed critical bug in module Y
* Delivered presentation to stakeholders

2. Insights / Learnings
* Discovered that approach A is more efficient than B
* User testing revealed unexpected navigation patterns
* Team velocity improved after process change

3. Decisions / Risks / Resources Required
* Need to decide on API approach by next week
* Risk: Integration with legacy system may delay launch
* Resource needed: Additional QA support for testing

4. Next Steps / Upcoming Tasks
* Implement feedback from user testing
* Schedule review meeting with stakeholders
* Begin documentation for release`
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
  
  // Store full accumulated content
  let fullContent = '';
  
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
            // Before stream ends, make one final attempt to organize content
            processFinalContent(fullContent, partialSections);
            
            // Send a final enhanced chunk with the processed section content
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              id: 'final',
              choices: [{ delta: { content: '' }, finish_reason: 'stop', index: 0 }],
              report_metadata: {
                current_section: null,
                section_content: { ...partialSections }
              }
            })}\n\n`));
            
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
              
              // Try to identify current section from the accumulated content
              updateCurrentSection(fullContent, currentSection, partialSections);
              
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
  
  // Helper function to identify the current section 
  function updateCurrentSection(content: string, currentSectionRef: SectionKey | null, sections: Record<SectionKey, string>) {
    // Extract all section blocks from the content
    const accomplishmentsMatch = content.match(/(?:1\.|Accomplishments)(?:\s+Since\s+Last\s+Update)?[^:\n]*(?::|\n)/i);
    const insightsMatch = content.match(/(?:2\.|Insights|Learnings)[^:\n]*(?::|\n)/i);
    const decisionsMatch = content.match(/(?:3\.|Decisions|Risks|Resources)[^:\n]*(?::|\n)/i);
    const nextStepsMatch = content.match(/(?:4\.|Next\s+Steps|Upcoming)[^:\n]*(?::|\n)/i);
    
    // Check if we have enough structure to determine sections
    if (accomplishmentsMatch || insightsMatch || decisionsMatch || nextStepsMatch) {
      // Create arrays of section markers with their positions
      const sectionMarkers = [
        { section: 'accomplishments', pos: accomplishmentsMatch ? accomplishmentsMatch.index || 0 : Infinity, match: accomplishmentsMatch },
        { section: 'insights', pos: insightsMatch ? insightsMatch.index || 0 : Infinity, match: insightsMatch },
        { section: 'decisions', pos: decisionsMatch ? decisionsMatch.index || 0 : Infinity, match: decisionsMatch },
        { section: 'nextSteps', pos: nextStepsMatch ? nextStepsMatch.index || 0 : Infinity, match: nextStepsMatch }
      ].filter(marker => marker.pos !== Infinity)
       .sort((a, b) => (a.pos || 0) - (b.pos || 0));
      
      // Only continue if we found at least one section marker
      if (sectionMarkers.length > 0) {
        // Process each section's content
        for (let i = 0; i < sectionMarkers.length; i++) {
          const marker = sectionMarkers[i];
          const nextMarker = sectionMarkers[i + 1];
          const sectionName = marker.section as SectionKey;
          
          // Calculate the section boundaries
          const startPos = (marker.pos || 0) + (marker.match ? marker.match[0].length : 0);
          const endPos = nextMarker ? (nextMarker.pos || 0) : content.length;
          
          if (startPos < endPos) {
            let sectionContent = content.substring(startPos, endPos).trim();
            
            // Clean up the content but preserve bullet points
            sectionContent = sectionContent
              .replace(/^[\s\n]+|[\s\n]+$/g, '')  // Trim whitespace and newlines
              .replace(/\n{3,}/g, '\n\n');        // Replace excess newlines
            
            // Update the section content
            sections[sectionName] = sectionContent;
          }
        }
      }
      
      // Update the current section based on the latest content
      // Look at the tail end of the content to determine where we are
      const lastPart = content.slice(-100);
      
      if (lastPart.includes('Accomplishments') || lastPart.includes('1.')) {
        currentSection = 'accomplishments';
      } else if (lastPart.includes('Insights') || lastPart.includes('Learnings') || lastPart.includes('2.')) {
        currentSection = 'insights'; 
      } else if (lastPart.includes('Decisions') || lastPart.includes('Risks') || lastPart.includes('3.')) {
        currentSection = 'decisions';
      } else if (lastPart.includes('Next Steps') || lastPart.includes('Upcoming') || lastPart.includes('4.')) {
        currentSection = 'nextSteps';
      }
    }
  }
  
  // Final content processing when stream is done to ensure we have meaningful content
  function processFinalContent(content: string, sections: Record<SectionKey, string>) {
    // If any section is empty, try to extract bullet points from the general content
    const allBulletPoints = content.match(/^[\s]*[\*\-][\s]+(.*?)$/gm) || [];
    
    // First, process organized content with section headers
    updateCurrentSection(content, currentSection, sections);
    
    // For any sections that are still empty, distribute bullet points
    if (allBulletPoints.length > 0) {
      const emptyOrShortSections = Object.keys(sections)
        .filter(section => !sections[section as SectionKey] || sections[section as SectionKey].length < 10)
        .sort() as SectionKey[];
      
      if (emptyOrShortSections.length > 0) {
        // Calculate how many bullet points to allocate per empty section
        const pointsPerSection = Math.ceil(allBulletPoints.length / emptyOrShortSections.length);
        
        // Distribute bullet points to empty sections
        emptyOrShortSections.forEach((section, index) => {
          const startIdx = index * pointsPerSection;
          const endIdx = Math.min(startIdx + pointsPerSection, allBulletPoints.length);
          
          if (startIdx < allBulletPoints.length) {
            sections[section] = allBulletPoints.slice(startIdx, endIdx).join('\n');
          }
        });
      }
    }
    
    // Final check: ensure each section has at least a placeholder
    const fallbackMessages = {
      accomplishments: '* No accomplishments identified in the document',
      insights: '* No specific insights found in the document',
      decisions: '* No decisions or risks explicitly mentioned',
      nextSteps: '* No next steps outlined in the document'
    };
    
    Object.keys(sections).forEach(key => {
      const section = key as SectionKey;
      if (!sections[section] || sections[section].trim().length === 0) {
        sections[section] = fallbackMessages[section];
      }
    });
  }
  
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