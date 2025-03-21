import { NextRequest, NextResponse } from "next/server";
import { sendChatCompletion, ChatMessage } from "@/lib/openrouter";
import { UploadedDocument, ReportState } from "@/components/report-builder/types";

// System prompt for generating the initial report from documents
const getGenerationPrompt = (documents: UploadedDocument[], projectContext?: string) => {
  // Extract text content from documents
  const documentTexts = documents.map(doc => {
    return `--- Document: ${doc.name} ---
${doc.textContent || doc.summary || "No content available"}
`;
  }).join("\n\n");
  
  return `You are the 4-Box Report Builder, an assistant designed to help professionals create concise, informative status reports.

Your task is to analyze the provided documents and generate content for a 4-box report with these sections:

1. Accomplishments Since Last Update: List completed tasks, milestones reached, and successes.
2. Insights / Learnings: Highlight important discoveries, lessons learned, and "aha moments".
3. Decisions / Risks / Resources Required: Note decisions needed, potential issues, and resource requirements.
4. Next Steps / Upcoming Tasks: Outline immediate future work and upcoming deliverables.

When generating the report:
- Be concise and factual
- Organize information in bullet points when appropriate
- Prioritize recent information over older content
- Focus on actionable items and clear status updates
- Maintain professional language suitable for stakeholders

${projectContext ? `Project Context: ${projectContext}\n\n` : ''}

Here are the documents to analyze:

${documentTexts}

Based on these documents, generate content for each section of the 4-box report. Format your response with clear section headers.`;
};

// Process the AI response to extract report content
const processResponseForReportGeneration = (response: string): Partial<ReportState> => {
  // Create a new report state
  const reportState: Partial<ReportState> = {
    sections: {
      accomplishments: '',
      insights: '',
      decisions: '',
      nextSteps: ''
    },
    metadata: {
      lastUpdated: Date.now(),
      // Store the complete original response for future reference
      fullReport: response 
    }
  };
  
  console.log('Processing AI response:', response.substring(0, 200) + '...');
  
  // Extract section content using explicit numbered patterns
  const accomplishmentsMatch = response.match(/(?:(?:1|I)[\.\)]|Accomplishments)\s*(?:Since\s+Last\s+Update)?[^:]*:?\s*\n+([\s\S]*?)(?=\n+\s*(?:(?:2|II)[\.\)]|Insights|Learnings))/i);
  const insightsMatch = response.match(/(?:(?:2|II)[\.\)]|Insights|Learnings)[^:]*:?\s*\n+([\s\S]*?)(?=\n+\s*(?:(?:3|III)[\.\)]|Decisions|Risks))/i);
  const decisionsMatch = response.match(/(?:(?:3|III)[\.\)]|Decisions|Risks)[^:]*:?\s*\n+([\s\S]*?)(?=\n+\s*(?:(?:4|IV)[\.\)]|Next\s+Steps|Upcoming))/i);
  const nextStepsMatch = response.match(/(?:(?:4|IV)[\.\)]|Next\s+Steps|Upcoming)[^:]*:?\s*\n+([\s\S]*?)(?=\n+\s*(?:(?:5|V)[\.\)])|$)/i);
  
  console.log('Section matches found:', {
    accomplishments: !!accomplishmentsMatch,
    insights: !!insightsMatch,
    decisions: !!decisionsMatch,
    nextSteps: !!nextStepsMatch
  });
  
  // Extract content from the fullReport if regex patterns aren't matching correctly
  if (!accomplishmentsMatch && !insightsMatch && !decisionsMatch && !nextStepsMatch && response.includes('Accomplishments Since Last Update')) {
    console.log('Using alternate extraction from fullReport');
    
    // Extract accomplishments - Look for content between Section 1 and Section 2
    const accomplishmentsSection = response.match(/(?:\*\*1\.|1\.|#)(?:\s*|\s+)Accomplishments[^:]*:(?:\*\*)?(?:\s*\n+)([\s\S]*?)(?=(?:\*\*2\.|2\.|#)(?:\s*|\s+)Insights|Learnings)/i);
    if (accomplishmentsSection && accomplishmentsSection[1]?.trim()) {
      reportState.sections!.accomplishments = accomplishmentsSection[1].trim();
    }
    
    // Extract insights - Look for content between Section 2 and Section 3
    const insightsSection = response.match(/(?:\*\*2\.|2\.|#)(?:\s*|\s+)Insights[^:]*:(?:\*\*)?(?:\s*\n+)([\s\S]*?)(?=(?:\*\*3\.|3\.|#)(?:\s*|\s+)Decisions|Risks)/i);
    if (insightsSection && insightsSection[1]?.trim()) {
      reportState.sections!.insights = insightsSection[1].trim();
    }
    
    // Extract decisions - Look for content between Section 3 and Section 4
    const decisionsSection = response.match(/(?:\*\*3\.|3\.|#)(?:\s*|\s+)Decisions[^:]*:(?:\*\*)?(?:\s*\n+)([\s\S]*?)(?=(?:\*\*4\.|4\.|#)(?:\s*|\s+)Next|Upcoming)/i);
    if (decisionsSection && decisionsSection[1]?.trim()) {
      reportState.sections!.decisions = decisionsSection[1].trim();
    }
    
    // Extract next steps - Look for content after Section 4
    const nextStepsSection = response.match(/(?:\*\*4\.|4\.|#)(?:\s*|\s+)Next\s+Steps[^:]*:(?:\*\*)?(?:\s*\n+)([\s\S]*?)(?=\n\n\n|\n\n$|$)/i);
    if (nextStepsSection && nextStepsSection[1]?.trim()) {
      reportState.sections!.nextSteps = nextStepsSection[1].trim();
    }
  }
  
  // Assign content to each section if found
  if (accomplishmentsMatch && accomplishmentsMatch[1]?.trim()) {
    reportState.sections!.accomplishments = accomplishmentsMatch[1].trim();
  }
  
  if (insightsMatch && insightsMatch[1]?.trim()) {
    reportState.sections!.insights = insightsMatch[1].trim();
  }
  
  if (decisionsMatch && decisionsMatch[1]?.trim()) {
    reportState.sections!.decisions = decisionsMatch[1].trim();
  }
  
  if (nextStepsMatch && nextStepsMatch[1]?.trim()) {
    reportState.sections!.nextSteps = nextStepsMatch[1].trim();
  }
  
  // Remove markdown from section content
  if (reportState.sections!.accomplishments) {
    reportState.sections!.accomplishments = reportState.sections!.accomplishments
      .replace(/^\*\*.*?\*\*\s*\n/gm, '')  // Remove bold headers
      .replace(/^#+\s+.*?\n/gm, '');      // Remove markdown headers
  }
  
  if (reportState.sections!.insights) {
    reportState.sections!.insights = reportState.sections!.insights
      .replace(/^\*\*.*?\*\*\s*\n/gm, '')
      .replace(/^#+\s+.*?\n/gm, '');
  }
  
  if (reportState.sections!.decisions) {
    reportState.sections!.decisions = reportState.sections!.decisions
      .replace(/^\*\*.*?\*\*\s*\n/gm, '')
      .replace(/^#+\s+.*?\n/gm, '');
  }
  
  if (reportState.sections!.nextSteps) {
    reportState.sections!.nextSteps = reportState.sections!.nextSteps
      .replace(/^\*\*.*?\*\*\s*\n/gm, '')
      .replace(/^#+\s+.*?\n/gm, '');
  }
  
  // If no content was found, extract from fullReport directly
  if (!reportState.sections!.accomplishments && 
      !reportState.sections!.insights && 
      !reportState.sections!.decisions && 
      !reportState.sections!.nextSteps) {
    
    console.log('Sections still empty, attempting direct extraction from fullReport');
    
    // Direct approach - extract all content with * or - bullet points
    const bulletPoints = response.match(/^[\s]*[\*\-][\s]+(.*?)$/gm);
    
    if (bulletPoints && bulletPoints.length > 0) {
      console.log(`Found ${bulletPoints.length} bullet points in the response`);
      
      // Distribute bullet points evenly across the 4 sections
      const pointsPerSection = Math.ceil(bulletPoints.length / 4);
      
      reportState.sections!.accomplishments = bulletPoints.slice(0, pointsPerSection).join('\n');
      reportState.sections!.insights = bulletPoints.slice(pointsPerSection, pointsPerSection * 2).join('\n');
      reportState.sections!.decisions = bulletPoints.slice(pointsPerSection * 2, pointsPerSection * 3).join('\n');
      reportState.sections!.nextSteps = bulletPoints.slice(pointsPerSection * 3).join('\n');
    }
  }
  
  // Final fallback - create default content for each section if still empty
  if (!reportState.sections!.accomplishments) {
    reportState.sections!.accomplishments = '* No accomplishments identified in documents';
  }
  
  if (!reportState.sections!.insights) {
    reportState.sections!.insights = '* No insights identified in documents';
  }
  
  if (!reportState.sections!.decisions) {
    reportState.sections!.decisions = '* No decisions or risks identified in documents';
  }
  
  if (!reportState.sections!.nextSteps) {
    reportState.sections!.nextSteps = '* No next steps identified in documents';
  }
  
  // Try to extract a title if one exists in the response
  const titleMatch = response.match(/(?:Title|Project|Team|Report):?\s*([^\n]+)/i);
  if (titleMatch && titleMatch[1].trim()) {
    reportState.title = titleMatch[1].trim();
  } else {
    // Default title based on document names
    reportState.title = "Status Report";
  }
  
  // Generate the current date in the same format as the report editor component
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
  
  reportState.date = `${month} ${day}${getOrdinalSuffix(day)} ${year}`;
  
  // Track document references
  reportState.metadata!.relatedDocuments = [];
  
  // Log final output
  console.log('Final extracted report state sections:', {
    accomplishments: reportState.sections!.accomplishments.length,
    insights: reportState.sections!.insights.length,
    decisions: reportState.sections!.decisions.length,
    nextSteps: reportState.sections!.nextSteps.length
  });
  
  return reportState;
};

export async function POST(request: NextRequest) {
  try {
    const { documents = [], projectContext = "" } = await request.json() as { 
      documents: UploadedDocument[],
      projectContext?: string 
    };
    
    if (!documents.length) {
      return NextResponse.json(
        { error: "No documents provided for report generation" },
        { status: 400 }
      );
    }
    
    // Validate OpenRouter API key
    const openRouterApiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
    if (!openRouterApiKey) {
      return NextResponse.json(
        { 
          error: "OpenRouter API key is missing",
          reportState: createEmptyReport()
        },
        { status: 500 }
      );
    }
    
    // OPTIMIZATION: Limit document content length to prevent timeouts
    const optimizedDocuments = documents.map(doc => {
      if (doc.textContent && doc.textContent.length > 10000) {
        console.log(`Truncating large document ${doc.name} from ${doc.textContent.length} chars to 10,000 chars`);
        return {
          ...doc,
          textContent: doc.textContent.substring(0, 10000) + "\n\n[Content truncated for performance]"
        };
      }
      return doc;
    });
    
    // Generate prompt with document content
    const prompt = getGenerationPrompt(optimizedDocuments, projectContext);
    
    // Create messages array for the chat
    const messages: ChatMessage[] = [
      { role: "system", content: prompt }
    ];
    
    try {
      // OPTIMIZATION: Reduce max tokens and set timeout options
      const response = await sendChatCompletion({
        model: "google/gemini-2.0-pro-exp-02-05:free", // Using the correct Gemini model
        messages,
        temperature: 0.7,
        max_tokens: 1500, // Reduced from 2000 to help with performance
        retry_options: {
          max_retries: 2,
          initial_delay: 500,
          max_delay: 2000,
          backoff_factor: 1.5
        }
      });
      
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
            error: "Streaming responses are not yet implemented for this endpoint.",
            reportState: createEmptyReport()
          },
          { status: 400 }
        );
      }
      
      // Get the AI's response text
      const responseText = response.choices?.[0]?.message?.content || '';
      
      // Handle empty responses
      if (!responseText.trim()) {
        console.warn('Empty response from AI model');
        // Create a default report with placeholder content
        const defaultReport = createEmptyReport();
        defaultReport.sections.accomplishments = '* Document analysis did not produce any content';
        defaultReport.sections.insights = '* No insights could be extracted from the documents';
        defaultReport.sections.decisions = '* Try refining the report using the chat or uploading more detailed documents';
        defaultReport.sections.nextSteps = '* Use the chat to add specific next steps to your report';
        
        return NextResponse.json({
          reportState: defaultReport
        });
      }
      
      // Process the response to create the report
      const reportState = processResponseForReportGeneration(responseText);
      
      // Return the generated report state
      return NextResponse.json({
        reportState
      });
      
    } catch (apiError) {
      console.error('Error calling OpenRouter API:', apiError);
      
      // OPTIMIZATION: Return a partial report with error message on timeout
      // Create a default report with error feedback
      const errorReport = createEmptyReport();
      errorReport.title = "Partial Report";
      
      // Add error messaging to the report
      errorReport.sections.accomplishments = "* An error occurred while generating the full report";
      errorReport.sections.insights = "* The service timed out while processing your documents";
      errorReport.sections.decisions = "* Try uploading smaller documents or fewer documents at once";
      errorReport.sections.nextSteps = "* You can still use the chat to add specific content to each section";
      
      return NextResponse.json(
        { 
          error: apiError instanceof Error ? apiError.message : "API timeout or error",
          reportState: errorReport
        },
        { status: 200 } // Return 200 instead of 500 so client can still work with partial report
      );
    }
    
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { 
        error: "Failed to generate report",
        reportState: createEmptyReport()
      },
      { status: 500 }
    );
  }
}

// Helper function to create an empty report structure
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