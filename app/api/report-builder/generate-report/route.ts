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
    
    // Create a minimal report without any AI processing
    const emptyReport = createEmptyReport();
    emptyReport.title = documents.length === 1 
      ? `Report: ${documents[0].name}` 
      : `Report: ${documents.length} Documents`;
    
    // Instead of trying to analyze all documents, just acknowledge their receipt
    emptyReport.sections.accomplishments = documents.map(doc => 
      `* Document "${doc.name}" received (${Math.round(doc.size / 1024)} KB)`
    ).join('\n');
    
    // Add instructions for using chat
    emptyReport.sections.insights = "* Use the chat to analyze your documents";
    emptyReport.sections.insights += "\n* Try asking: 'What are the key insights from my documents?'";
    
    emptyReport.sections.decisions = "* Use the chat to identify decisions needed";
    emptyReport.sections.decisions += "\n* Try asking: 'What decisions or risks are mentioned in my documents?'";
    
    emptyReport.sections.nextSteps = "* Use the chat to extract next steps";
    emptyReport.sections.nextSteps += "\n* Try asking: 'What are the upcoming tasks mentioned in my documents?'";
    
    // Return the minimal report immediately
    return NextResponse.json({
      reportState: emptyReport
    });
    
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

// Process documents one at a time to avoid timeouts
async function processDocumentsSequentially(documents: UploadedDocument[]): Promise<string[]> {
  const summaries: string[] = [];
  
  // Process each document in sequence
  for (const doc of documents) {
    try {
      console.log(`Processing document: ${doc.name}`);
      
      // Skip documents without content
      if (!doc.textContent || doc.textContent.trim() === '') {
        console.log(`Skipping document ${doc.name} - no content`);
        continue;
      }
      
      // Chunk the document if it's large
      const chunks = chunkDocument(doc.textContent, 2000); // 2000 char chunks
      console.log(`Split document into ${chunks.length} chunks`);
      
      // Process each chunk to get summaries
      const chunkSummaries: string[] = [];
      for (const [index, chunk] of chunks.entries()) {
        try {
          console.log(`Processing chunk ${index + 1}/${chunks.length} of document ${doc.name}`);
          
          // Get a quick summary of this chunk
          const summary = await summarizeChunk(chunk, doc.name, index, chunks.length);
          if (summary) {
            chunkSummaries.push(summary);
          }
        } catch (error) {
          console.error(`Error processing chunk ${index + 1} of document ${doc.name}:`, error);
          // Continue with other chunks even if one fails
        }
      }
      
      // Combine chunk summaries into a document summary
      const documentSummary = `Document: ${doc.name}\n\n${chunkSummaries.join('\n\n')}`;
      summaries.push(documentSummary);
      
    } catch (error) {
      console.error(`Error processing document ${doc.name}:`, error);
      // Continue with other documents even if one fails
    }
  }
  
  return summaries;
}

// Split a document into smaller chunks
function chunkDocument(text: string, chunkSize: number): string[] {
  const chunks: string[] = [];
  
  // If text is small enough, return it as a single chunk
  if (text.length <= chunkSize) {
    return [text];
  }
  
  // Try to split on paragraph breaks first
  const paragraphs = text.split(/\n\s*\n/);
  let currentChunk = '';
  
  for (const paragraph of paragraphs) {
    // If adding this paragraph would exceed the chunk size
    if (currentChunk.length + paragraph.length > chunkSize && currentChunk.length > 0) {
      // Save the current chunk and start a new one
      chunks.push(currentChunk);
      currentChunk = paragraph;
    } else {
      // Add the paragraph to the current chunk
      currentChunk = currentChunk 
        ? `${currentChunk}\n\n${paragraph}`
        : paragraph;
    }
  }
  
  // Add the last chunk if it's not empty
  if (currentChunk) {
    chunks.push(currentChunk);
  }
  
  // If chunks are still too large, split them further
  const finalChunks: string[] = [];
  for (const chunk of chunks) {
    if (chunk.length <= chunkSize) {
      finalChunks.push(chunk);
    } else {
      // Split by sentences if paragraphs are too long
      const sentences = chunk.split(/(?<=[.!?])\s+/);
      let sentenceChunk = '';
      
      for (const sentence of sentences) {
        if (sentenceChunk.length + sentence.length > chunkSize && sentenceChunk.length > 0) {
          finalChunks.push(sentenceChunk);
          sentenceChunk = sentence;
        } else {
          sentenceChunk = sentenceChunk 
            ? `${sentenceChunk} ${sentence}`
            : sentence;
        }
      }
      
      if (sentenceChunk) {
        finalChunks.push(sentenceChunk);
      }
    }
  }
  
  return finalChunks;
}

// Summarize a single chunk of text
async function summarizeChunk(chunk: string, docName: string, chunkIndex: number, totalChunks: number): Promise<string> {
  // Skip empty chunks
  if (!chunk || chunk.trim() === '') {
    return '';
  }
  
  const prompt = `Summarize the following content from document "${docName}" (chunk ${chunkIndex+1} of ${totalChunks}). 
Focus on extracting key information that would be relevant for a status report, including:
- Accomplishments or completed tasks
- Insights or lessons learned
- Decisions needed or risks identified
- Next steps or future tasks

Content to summarize:
${chunk}

Provide a concise summary that captures the essential information.`;
  
  try {
    // Use a faster, smaller model with lower token count
    const response = await sendChatCompletion({
      model: "google/gemini-2.0-pro-exp-02-05:free", // Using the correct Gemini model
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
      max_tokens: 500, // Keep the summary short
      retry_options: {
        max_retries: 1,
        initial_delay: 200,
        max_delay: 1000,
        backoff_factor: 1.5
      }
    });
    
    if (response instanceof ReadableStream) {
      return `[Error: Streaming response not supported for chunk summarization]`;
    }
    
    return response.choices?.[0]?.message?.content || '';
    
  } catch (error) {
    console.error(`Error summarizing chunk:`, error);
    return `[Error summarizing chunk: ${error instanceof Error ? error.message : 'Unknown error'}]`;
  }
}

// Generate a full report from the document summaries
async function generateReportFromSummaries(summaries: string[], projectContext: string): Promise<ReportState> {
  if (summaries.length === 0) {
    return createEmptyReport();
  }
  
  try {
    // Create a concise prompt with the summaries
    const combinedSummaries = summaries.join('\n\n---\n\n');
    
    // Set a character limit for combined summaries
    const trimmedSummaries = combinedSummaries.length > 10000 
      ? combinedSummaries.substring(0, 10000) + '\n\n[Additional content truncated due to length]'
      : combinedSummaries;
    
    const prompt = `Generate a 4-box status report based on these document summaries:

${trimmedSummaries}

${projectContext ? `Project Context: ${projectContext}\n\n` : ''}

Format the report with these four sections:
1. Accomplishments Since Last Update
2. Insights / Learnings
3. Decisions / Risks / Resources Required
4. Next Steps / Upcoming Tasks

Use bullet points for each item. Focus on key information that would be most relevant for a status update.`;
    
    // Send the request with a reasonable timeout
    const response = await sendChatCompletion({
      model: "google/gemini-2.0-pro-exp-02-05:free",
      messages: [{ role: "system", content: prompt }],
      temperature: 0.7,
      max_tokens: 1500,
      retry_options: {
        max_retries: 1,
        initial_delay: 500,
        max_delay: 2000,
        backoff_factor: 1.5
      }
    });
    
    // Handle streaming responses
    if (response instanceof ReadableStream) {
      // Fall back to an empty report with an explanation
      const emptyReport = createEmptyReport();
      emptyReport.sections.accomplishments = "* Error: Received streaming response";
      emptyReport.sections.insights = "* Please try again with fewer documents";
      return emptyReport;
    }
    
    // Process the response to create a report
    const responseText = response.choices?.[0]?.message?.content || '';
    
    if (!responseText.trim()) {
      // Fall back to an empty report if no content
      const emptyReport = createEmptyReport();
      emptyReport.sections.accomplishments = "* No content was generated from your documents";
      emptyReport.sections.insights = "* Try uploading different documents or adding specific details via chat";
      return emptyReport;
    }
    
    // Use the existing extraction function with type casting to ensure it's a complete ReportState
    const extractedReport = processResponseForReportGeneration(responseText);

    // Ensure all required fields are present
    return {
      title: extractedReport.title || "Status Report",
      date: extractedReport.date || new Date().toDateString(),
      sections: {
        accomplishments: extractedReport.sections?.accomplishments || "",
        insights: extractedReport.sections?.insights || "",
        decisions: extractedReport.sections?.decisions || "",
        nextSteps: extractedReport.sections?.nextSteps || ""
      },
      metadata: {
        lastUpdated: Date.now(),
        relatedDocuments: extractedReport.metadata?.relatedDocuments || [],
        fullReport: responseText
      }
    };
    
  } catch (error) {
    console.error('Error generating report from summaries:', error);
    // Create a fallback report with error information
    const fallbackReport = createEmptyReport();
    fallbackReport.title = "Error Report";
    fallbackReport.sections.accomplishments = "* Error generating report from document summaries";
    fallbackReport.sections.insights = "* You can still add content using the chat interface";
    fallbackReport.sections.decisions = "* Try asking specific questions to build your report section by section";
    fallbackReport.sections.nextSteps = "* Use 'add X to next steps' to build this section manually";
    return fallbackReport;
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