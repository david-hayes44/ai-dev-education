import { NextRequest, NextResponse } from "next/server";
import { sendChatCompletion, ChatMessage } from "@/lib/openrouter";
import { ChatRequest, ReportState, ReportSectionKey } from "@/components/report-builder/types";

// System prompt for the report builder assistant
const getSystemPrompt = (reportState: ReportState) => {
  return `You are the 4-Box Report Builder, an assistant designed to help professionals create concise, informative status reports.

Your task is to analyze the user's uploaded documents and conversation to generate content for a 4-box report with these sections:

1. Accomplishments Since Last Update: List completed tasks, milestones reached, and successes.
2. Insights / Learnings: Highlight important discoveries, lessons learned, and "aha moments".
3. Decisions / Risks / Resources Required: Note decisions needed, potential issues, and resource requirements.
4. Next Steps / Upcoming Tasks: Outline immediate future work and upcoming deliverables.

IMPORTANT FORMAT INSTRUCTIONS: 
When generating a complete report:
- ALWAYS use numbered sections exactly as shown above (1., 2., 3., 4.)
- ALWAYS use this exact section structure with clear headings and exactly in this order
- Separate each section with two newlines
- Each section MUST start with the numbered header (1. Accomplishments, 2. Insights, etc.)
- Keep each type of information only in its proper section - do not duplicate information across sections
- Format the content of each section as bullet points, starting each line with * or -

When generating or updating the report:
- Be concise and factual
- Organize information in bullet points
- Prioritize recent information over older content
- Focus on actionable items and clear status updates
- Maintain professional language suitable for stakeholders

When the user asks to add specific content to a section:
1. Identify which section they want to update
2. Add their requested content to that section, formatted appropriately
3. IMPORTANT: Only return the NEW content you're adding, NOT the entire section's existing content
4. Start your response with "✅ Added:" followed by the extracted content in quotes
5. Example good response: "✅ Added: 'Schedule meeting with design team'"
6. DO NOT include the word "section" in your extracted content
7. Do not include any explanation or commentary beyond confirming what was added

When formatting your responses:
- Use clear markdown formatting to make your responses visually appealing and easy to read
- Use bullet points or numbered lists to break up text
- Use **bold** and *italic* for emphasis
- Use emoji to highlight important information (✅, ❌, ⚠️, 📝, etc.)
- Keep paragraphs short and focused

The current report state is:
Title: ${reportState.title || 'Untitled Report'}
Date: ${reportState.date || 'No date specified'}

1. Accomplishments:
${reportState.sections.accomplishments || 'None specified yet'}

2. Insights:
${reportState.sections.insights || 'None specified yet'}

3. Decisions/Risks:
${reportState.sections.decisions || 'None specified yet'}

4. Next Steps:
${reportState.sections.nextSteps || 'None specified yet'}

You can update these sections based on the conversation and uploaded documents. If the user asks to generate the full report, update all sections using the numbered format. If they ask to add content to a specific section, only return the new content you're adding.`;
};

// Function to identify which section of the report should be updated
const identifySectionToUpdate = (message: string): ReportSectionKey | null => {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes("accomplishment") || 
      lowerMessage.includes("success") || 
      lowerMessage.includes("milestone") ||
      lowerMessage.includes("completed") ||
      lowerMessage.includes("achieved") ||
      lowerMessage.includes("finished")) {
    return "accomplishments";
  }
  
  if (lowerMessage.includes("insight") || 
      lowerMessage.includes("learning") || 
      lowerMessage.includes("discover") ||
      lowerMessage.includes("aha") ||
      lowerMessage.includes("found out") ||
      lowerMessage.includes("realized")) {
    return "insights";
  }
  
  if (lowerMessage.includes("decision") || 
      lowerMessage.includes("risk") || 
      lowerMessage.includes("resource") ||
      lowerMessage.includes("roadblock") ||
      lowerMessage.includes("help needed") ||
      lowerMessage.includes("blocker") ||
      lowerMessage.includes("problem") ||
      lowerMessage.includes("issue")) {
    return "decisions";
  }
  
  if (lowerMessage.includes("next step") || 
      lowerMessage.includes("upcoming") || 
      lowerMessage.includes("todo") ||
      lowerMessage.includes("to do") ||
      lowerMessage.includes("to-do") ||
      lowerMessage.includes("plan") ||
      lowerMessage.includes("scheduled") ||
      lowerMessage.includes("future")) {
    return "nextSteps";
  }
  
  return null;
};

// Determine if this is an "add to section" type of request
const isAddToSectionRequest = (message: string): boolean => {
  const lowerMessage = message.toLowerCase();
  
  // Check for explicit modification keywords
  const hasModificationKeyword = 
    lowerMessage.includes("add") || 
    lowerMessage.includes("update") || 
    lowerMessage.includes("include") ||
    lowerMessage.includes("put") ||
    lowerMessage.includes("insert") ||
    lowerMessage.includes("append") ||
    lowerMessage.includes("note") ||
    lowerMessage.includes("record") ||
    lowerMessage.includes("capture") ||
    lowerMessage.includes("log") ||
    lowerMessage.includes("document") ||
    lowerMessage.startsWith("add") ||
    (lowerMessage.includes("to") && (
      lowerMessage.includes("to accomplishments") ||
      lowerMessage.includes("to insights") ||
      lowerMessage.includes("to decisions") ||
      lowerMessage.includes("to next steps")
    ));
  
  // Check for section keywords
  const hasSectionKeyword =
    lowerMessage.includes("accomplishment") || 
    lowerMessage.includes("insight") || 
    lowerMessage.includes("learning") ||
    lowerMessage.includes("decision") ||
    lowerMessage.includes("risk") ||
    lowerMessage.includes("next step") ||
    lowerMessage.includes("section");
  
  return hasModificationKeyword && hasSectionKeyword;
};

// Process the AI response to extract report updates
const processResponseForReportUpdates = (response: string, reportState: ReportState, originalMessage: string, isAddRequest: boolean, targetSection: ReportSectionKey | null): ReportState => {
  // Clone the current report state
  const updatedReport = {
    ...reportState,
    sections: { ...reportState.sections },
    metadata: { 
      ...reportState.metadata, 
      lastUpdated: Date.now(),
      // For complete reports, store the full text for later reference
      ...(isAddRequest ? {} : { fullReport: response })
    }
  };
  
  // Direct content addition for add requests
  if (isAddRequest && targetSection) {
    // Extract content from user message
    const contentToAdd = extractContentFromUserMessage(originalMessage, targetSection);
    
    // Extract content from AI response 
    const aiExtractedContent = extractContentFromAIResponse(response);
    
    // Choose the most appropriate content
    const finalContent = chooseBestContent(contentToAdd, aiExtractedContent);
    
    // Format as bullet point if needed
    const formattedContent = formatAsBulletPoint(finalContent);
    
    // Add to the appropriate section
    if (targetSection === 'accomplishments' && formattedContent.length > 2) {
      updatedReport.sections.accomplishments = appendToSection(updatedReport.sections.accomplishments, formattedContent);
    } else if (targetSection === 'insights' && formattedContent.length > 2) {
      updatedReport.sections.insights = appendToSection(updatedReport.sections.insights, formattedContent);
    } else if (targetSection === 'decisions' && formattedContent.length > 2) {
      updatedReport.sections.decisions = appendToSection(updatedReport.sections.decisions, formattedContent);
    } else if (targetSection === 'nextSteps' && formattedContent.length > 2) {
      updatedReport.sections.nextSteps = appendToSection(updatedReport.sections.nextSteps, formattedContent);
    }
    
    return updatedReport;
  }
  
  // For full reports, extract each section separately using explicit patterns
  const accomplishmentsMatch = response.match(/(?:(?:1|I)[\.\)]|Accomplishments)\s*(?:Since\s+Last\s+Update)?[^:]*:?\s*\n+([\s\S]*?)(?=\n+\s*(?:(?:2|II)[\.\)]|Insights|Learnings))/i);
  const insightsMatch = response.match(/(?:(?:2|II)[\.\)]|Insights|Learnings)[^:]*:?\s*\n+([\s\S]*?)(?=\n+\s*(?:(?:3|III)[\.\)]|Decisions|Risks))/i);
  const decisionsMatch = response.match(/(?:(?:3|III)[\.\)]|Decisions|Risks)[^:]*:?\s*\n+([\s\S]*?)(?=\n+\s*(?:(?:4|IV)[\.\)]|Next\s+Steps|Upcoming))/i);
  const nextStepsMatch = response.match(/(?:(?:4|IV)[\.\)]|Next\s+Steps|Upcoming)[^:]*:?\s*\n+([\s\S]*?)(?=\n+\s*(?:(?:5|V)[\.\)])|$)/i);
  
  // Extract content from markdown format - handles sections with ** bold headers
  if (!accomplishmentsMatch && !insightsMatch && !decisionsMatch && !nextStepsMatch && response.includes('Accomplishments')) {
    console.log('Using alternate extraction for markdown format');
    
    // Extract accomplishments - Look for content between Section 1 and Section 2
    const accomplishmentsSection = response.match(/(?:\*\*1\.|1\.|#)(?:\s*|\s+)Accomplishments[^:]*:(?:\*\*)?(?:\s*\n+)([\s\S]*?)(?=(?:\*\*2\.|2\.|#)(?:\s*|\s+)Insights|Learnings)/i);
    if (accomplishmentsSection && accomplishmentsSection[1]?.trim()) {
      updatedReport.sections.accomplishments = accomplishmentsSection[1].trim();
    }
    
    // Extract insights - Look for content between Section 2 and Section 3
    const insightsSection = response.match(/(?:\*\*2\.|2\.|#)(?:\s*|\s+)Insights[^:]*:(?:\*\*)?(?:\s*\n+)([\s\S]*?)(?=(?:\*\*3\.|3\.|#)(?:\s*|\s+)Decisions|Risks)/i);
    if (insightsSection && insightsSection[1]?.trim()) {
      updatedReport.sections.insights = insightsSection[1].trim();
    }
    
    // Extract decisions - Look for content between Section 3 and Section 4
    const decisionsSection = response.match(/(?:\*\*3\.|3\.|#)(?:\s*|\s+)Decisions[^:]*:(?:\*\*)?(?:\s*\n+)([\s\S]*?)(?=(?:\*\*4\.|4\.|#)(?:\s*|\s+)Next|Upcoming)/i);
    if (decisionsSection && decisionsSection[1]?.trim()) {
      updatedReport.sections.decisions = decisionsSection[1].trim();
    }
    
    // Extract next steps - Look for content after Section 4
    const nextStepsSection = response.match(/(?:\*\*4\.|4\.|#)(?:\s*|\s+)Next\s+Steps[^:]*:(?:\*\*)?(?:\s*\n+)([\s\S]*?)(?=\n\n\n|\n\n$|$)/i);
    if (nextStepsSection && nextStepsSection[1]?.trim()) {
      updatedReport.sections.nextSteps = nextStepsSection[1].trim();
    }
  }
  
  // Only update sections if we found content
  if (accomplishmentsMatch && accomplishmentsMatch[1]?.trim()) {
    updatedReport.sections.accomplishments = accomplishmentsMatch[1].trim();
  }
  
  if (insightsMatch && insightsMatch[1]?.trim()) {
    updatedReport.sections.insights = insightsMatch[1].trim();
  }
  
  if (decisionsMatch && decisionsMatch[1]?.trim()) {
    updatedReport.sections.decisions = decisionsMatch[1].trim();
  }
  
  if (nextStepsMatch && nextStepsMatch[1]?.trim()) {
    updatedReport.sections.nextSteps = nextStepsMatch[1].trim();
  }
  
  // Remove markdown from section content
  if (updatedReport.sections.accomplishments) {
    updatedReport.sections.accomplishments = updatedReport.sections.accomplishments
      .replace(/^\*\*.*?\*\*\s*\n/gm, '')  // Remove bold headers
      .replace(/^#+\s+.*?\n/gm, '');      // Remove markdown headers
  }
  
  if (updatedReport.sections.insights) {
    updatedReport.sections.insights = updatedReport.sections.insights
      .replace(/^\*\*.*?\*\*\s*\n/gm, '')
      .replace(/^#+\s+.*?\n/gm, '');
  }
  
  if (updatedReport.sections.decisions) {
    updatedReport.sections.decisions = updatedReport.sections.decisions
      .replace(/^\*\*.*?\*\*\s*\n/gm, '')
      .replace(/^#+\s+.*?\n/gm, '');
  }
  
  if (updatedReport.sections.nextSteps) {
    updatedReport.sections.nextSteps = updatedReport.sections.nextSteps
      .replace(/^\*\*.*?\*\*\s*\n/gm, '')
      .replace(/^#+\s+.*?\n/gm, '');
  }
  
  return updatedReport;
};

// Extract content from a user message
function extractContentFromUserMessage(message: string, targetSection: ReportSectionKey): string {
  let contentToAdd = message;
  
  // Remove common prefixes
  const addPrefixes = [
    /^add\s+to\s+(accomplishments?|insights?|decisions?|risks?|next\s+steps?)\s*[:\.]\s*/i,
    /^add\s+(.*?)\s+to\s+(accomplishments?|insights?|decisions?|risks?|next\s+steps?)/i,
    /^update\s+(accomplishments?|insights?|decisions?|risks?|next\s+steps?)\s+with\s+/i,
    /^include\s+in\s+(accomplishments?|insights?|decisions?|risks?|next\s+steps?)\s*[:\.]\s*/i,
    /^(accomplishments?|insights?|decisions?|risks?|next\s+steps?)\s*[:\.]\s*/i,
    /^i\s+want\s+to\s+add\s+/i,
    /^i\s+need\s+to\s+add\s+/i,
    /^please\s+add\s+/i,
    /^can\s+you\s+add\s+/i,
  ];
  
  for (const prefix of addPrefixes) {
    contentToAdd = contentToAdd.replace(prefix, '');
  }
  
  // Remove trailing phrases
  contentToAdd = contentToAdd.replace(/\s+to\s+the\s+(accomplishments?|insights?|decisions?|risks?|next\s+steps?)\.?$/i, '');
  contentToAdd = contentToAdd.replace(/\s+to\s+(accomplishments?|insights?|decisions?|risks?|next\s+steps?)\.?$/i, '');
  contentToAdd = contentToAdd.replace(/\s+in\s+the\s+(accomplishments?|insights?|decisions?|risks?|next\s+steps?)\.?$/i, '');
  contentToAdd = contentToAdd.replace(/\s+in\s+(accomplishments?|insights?|decisions?|risks?|next\s+steps?)\.?$/i, '');
  contentToAdd = contentToAdd.replace(/\s+as\s+an?\s+(accomplishments?|insights?|decisions?|risks?|next\s+steps?)\.?$/i, '');
  
  return contentToAdd.trim();
}

// Extract content from AI response
function extractContentFromAIResponse(response: string): string {
  if (!response.includes('✅')) return '';
  
  const afterCheckmark = response.split('✅')[1];
  if (!afterCheckmark) return '';
  
  // Try quoted content first
  const quotedContent = afterCheckmark.match(/'([^']*)'|"([^"]*)"/);
  if (quotedContent && (quotedContent[1] || quotedContent[2])) {
    return quotedContent[1] || quotedContent[2];
  }
  
  // Try "Added:" format
  const addedPattern = afterCheckmark.match(/Added:?\s*([^"\n]+)/i);
  if (addedPattern && addedPattern[1]) {
    return addedPattern[1].trim();
  }
  
  // Use first line
  const firstLine = afterCheckmark.split('\n')[0].trim();
  return firstLine
    .replace(/^(Added|Updated|Included)(\s+|:)/i, '')
    .replace(/\s+to\s+(the\s+)?(accomplishments?|insights?|decisions?|risks?|next\s+steps?)\s+section\.?$/i, '');
}

// Choose the best content from options
function chooseBestContent(userContent: string, aiContent: string): string {
  // If AI provided meaningful content, use it
  if (aiContent.length > 5 && 
      !aiContent.toLowerCase().includes("section") && 
      aiContent.length < userContent.length * 2) {
    return aiContent;
  }
  
  // If AI content is too short or just "section", use user content
  if (aiContent.trim().length < 3 || 
      aiContent.toLowerCase().trim() === "section" || 
      aiContent.toLowerCase().trim() === "section.") {
    return userContent;
  }
  
  return userContent;
}

// Format content as a bullet point
function formatAsBulletPoint(content: string): string {
  if (!content.startsWith('* ') && !content.startsWith('- ')) {
    return '* ' + content;
  }
  return content;
}

// Append content to existing section
function appendToSection(existingContent: string, newContent: string): string {
  return existingContent ? existingContent + '\n' + newContent : newContent;
}

export async function POST(request: NextRequest) {
  try {
    const { message, reportState, documentIds } = await request.json() as ChatRequest;
    
    if (!message) {
      return NextResponse.json(
        { error: "Missing message parameter" },
        { status: 400 }
      );
    }
    
    console.log('Processing chat request:', { 
      message: message.substring(0, 50) + '...',
      reportSections: {
        accomplishments: reportState.sections.accomplishments?.length || 0,
        insights: reportState.sections.insights?.length || 0,
        decisions: reportState.sections.decisions?.length || 0,
        nextSteps: reportState.sections.nextSteps?.length || 0
      }
    });
    
    // Validate API key
    const openRouterApiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
    if (!openRouterApiKey) {
      return NextResponse.json(
        { 
          reply: "I'm sorry, I can't process your request because the API connection is not configured. Please contact the administrator to set up the OpenRouter API key.",
          error: "OpenRouter API key is missing"
        },
        { status: 500 }
      );
    }
    
    // Check if this is an "add to section" request
    const isAddRequest = isAddToSectionRequest(message);
    
    // Identify which section the user might be updating
    const targetSection = identifySectionToUpdate(message);
    
    console.log('Request analysis:', { 
      isAddRequest, 
      targetSection,
      isEmptyReport: Object.values(reportState.sections).every(s => !s)
    });
    
    // Special case: If report is completely empty, force a regeneration instead of an add
    const forceFullReport = Object.values(reportState.sections).every(s => !s);
    
    // OPTIMIZATION: Trim existing report sections to reduce token count
    const optimizedReportState = {
      ...reportState,
      sections: {
        accomplishments: trimSection(reportState.sections.accomplishments, 500),
        insights: trimSection(reportState.sections.insights, 500),
        decisions: trimSection(reportState.sections.decisions, 500),
        nextSteps: trimSection(reportState.sections.nextSteps, 500)
      },
      metadata: reportState.metadata
    };
    
    // Modify the system prompt to indicate this is an add request if applicable
    let systemPrompt = getSystemPrompt(optimizedReportState);
    if (isAddRequest && targetSection && !forceFullReport) {
      systemPrompt += `\n\nThis appears to be a request to UPDATE the "${targetSection}" section. 
IMPORTANT INSTRUCTIONS:
1. This is an ADD request - you must preserve all existing content in the ${targetSection} section
2. DO NOT mention any existing content in your response, only focus on the new content
3. Extract exactly what the user wants to add from their message: "${message}"
4. Begin your response with "✅ Added:" followed by the extracted content in quotes
5. Example good response: "✅ Added: 'Schedule meeting with design team'"
6. DO NOT include the word "section" in your extracted content
7. Do not include any explanation or commentary beyond confirming what was added`;
    }
    
    // Create messages array for the chat
    const messages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: message }
    ];
    
    // Call OpenRouter API
    try {
      console.log('Sending chat completion request to model');
      
      // OPTIMIZATION: Set a timeout for the API request to prevent long-running requests
      const fetchTimeoutMs = 15000; // 15 seconds
      
      // Create a promise that will resolve with the API response
      const fetchPromise = sendChatCompletion({
        model: "google/gemini-2.0-pro-exp-02-05:free",
        messages,
        temperature: 0.7,
        max_tokens: 800, // Reduced from 1000 to improve performance
        retry_options: {
          max_retries: 1, // Reduce retries to speed up response time
          initial_delay: 200,
          max_delay: 1000,
          backoff_factor: 1.5
        }
      });
      
      // Create a timeout promise
      const timeoutPromise = new Promise<{id: string; choices: {message: {content: string}; finish_reason: string; index: number}[]}>((_, reject) => {
        setTimeout(() => {
          reject(new Error('Request timed out after ' + fetchTimeoutMs + 'ms'));
        }, fetchTimeoutMs);
      });
      
      // Race the fetch and timeout promises
      const response = await Promise.race([fetchPromise, timeoutPromise]);
      
      // Check response structure
      if (!response) {
        throw new Error('Empty response from OpenRouter API');
      }
      
      if (typeof response === 'object' && 'error' in response) {
        const errorMessage = typeof response.error === 'string' ? response.error : 'Unknown error from OpenRouter API';
        throw new Error(errorMessage);
      }
      
      // For streaming responses (not implemented yet)
      if (response instanceof ReadableStream) {
        return NextResponse.json(
          { 
            reply: "Streaming responses are not yet implemented for this endpoint.",
            error: "Streaming not supported"
          },
          { status: 400 }
        );
      }
      
      // Get the AI's response text
      const responseText = response.choices?.[0]?.message?.content || '';
      console.log('Received model response:', responseText.substring(0, 100) + '...');
      
      let updatedReport;
      
      // For report updates, try to extract sections directly
      if (!isAddRequest || forceFullReport) {
        // Process the response using our extraction function that handles the complete report
        updatedReport = processResponseForReportUpdates(responseText, reportState, message, isAddRequest && !forceFullReport, targetSection);
      } else {
        // For add requests, use the same processResponseForReportUpdates function
        updatedReport = processResponseForReportUpdates(responseText, reportState, message, isAddRequest, targetSection);
      }
      
      console.log('Updated report sections:', {
        accomplishments: updatedReport.sections.accomplishments?.length || 0,
        insights: updatedReport.sections.insights?.length || 0,
        decisions: updatedReport.sections.decisions?.length || 0,
        nextSteps: updatedReport.sections.nextSteps?.length || 0
      });
      
      // Return the response and updated report
      return NextResponse.json({
        reply: responseText,
        updatedReport
      });
      
    } catch (apiError) {
      console.error('Error calling OpenRouter API:', apiError);
      
      // OPTIMIZATION: For timeouts, try to still be helpful
      const errorMessage = apiError instanceof Error ? apiError.message : "Unknown API error";
      let userFriendlyReply = "❌ **Error:** I apologize, but I encountered an error while processing your request. Please try again later.";
      
      // Give more specific help for timeout errors
      if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
        userFriendlyReply = "⏱️ **Request timed out:** I'm sorry, but your request took too long to process. Please try a shorter message or break your request into smaller parts.";
        
        // If this was an "add to section" request, try to still add the content
        if (isAddRequest && targetSection) {
          // Extract what the user wanted to add
          const contentToAdd = extractContentFromUserMessage(message, targetSection);
          if (contentToAdd) {
            // Create a modified report with just this addition
            const partialReport = { ...reportState };
            const formattedContent = formatAsBulletPoint(contentToAdd);
            
            if (targetSection === 'accomplishments') {
              partialReport.sections.accomplishments = appendToSection(partialReport.sections.accomplishments, formattedContent);
            } else if (targetSection === 'insights') {
              partialReport.sections.insights = appendToSection(partialReport.sections.insights, formattedContent);
            } else if (targetSection === 'decisions') {
              partialReport.sections.decisions = appendToSection(partialReport.sections.decisions, formattedContent);
            } else if (targetSection === 'nextSteps') {
              partialReport.sections.nextSteps = appendToSection(partialReport.sections.nextSteps, formattedContent);
            }
            
            userFriendlyReply += `\n\n✅ I've added your content directly to the ${targetSection} section: "${contentToAdd}"`;
            
            // Return a successful response with the modified report
            return NextResponse.json({
              reply: userFriendlyReply,
              updatedReport: partialReport
            });
          }
        }
      }
      
      // Return error response
      return NextResponse.json(
        { 
          reply: userFriendlyReply,
          error: errorMessage
        },
        { status: 200 } // Use 200 status to avoid client-side errors
      );
    }
    
  } catch (error) {
    console.error('Error processing chat message:', error);
    return NextResponse.json(
      { 
        reply: "❌ **Error:** I'm sorry, I couldn't process your message. Please try again.",
        error: "Failed to process chat message"
      },
      { status: 500 }
    );
  }
}

// OPTIMIZATION: Helper function to trim section content to reduce token count
function trimSection(content: string, maxLength: number): string {
  if (!content || content.length <= maxLength) return content;
  
  // Count the number of bullet points
  const bulletPoints = content.split(/\n+/).filter(line => line.trim().startsWith('*') || line.trim().startsWith('-'));
  
  if (bulletPoints.length <= 3) {
    // If few bullet points, keep them all but truncate each if needed
    return bulletPoints.map(point => {
      if (point.length <= maxLength / bulletPoints.length) return point;
      return point.substring(0, Math.floor(maxLength / bulletPoints.length) - 3) + '...';
    }).join('\n');
  } else {
    // If many bullet points, keep the first 2 and last 1, with a note about trimming
    return bulletPoints.slice(0, 2).join('\n') + 
      '\n* [... additional items truncated for performance ...]\n' + 
      bulletPoints[bulletPoints.length - 1];
  }
} 