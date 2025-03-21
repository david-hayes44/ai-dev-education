import { UploadedDocument, ReportState } from "@/components/report-builder/types";
import { sendChatCompletion, ChatMessage } from "@/lib/openrouter";
import { supabaseReportStorage } from "@/lib/supabase-report-storage";

// Type definitions
type ProcessingStatus = 'pending' | 'processing' | 'completed' | 'error';

interface ReportProcessingState {
  reportId: string;
  status: ProcessingStatus;
  documents: UploadedDocument[];
  projectContext?: string;
  createdAt: number;
  updatedAt: number;
  result?: ReportState;
  error?: string;
}

// Determine if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Storage interface for report processing state
 */
interface ReportStorage {
  get(reportId: string): Promise<ReportProcessingState | undefined>;
  set(reportId: string, state: ReportProcessingState): Promise<void>;
  delete(reportId: string): Promise<void>;
  cleanup(): Promise<void>;
}

// Use Supabase storage for both development and production
// This addresses the Vercel serverless state issue
const storage: ReportStorage = supabaseReportStorage;

console.log(`Using Supabase storage for report processing with NODE_ENV=${process.env.NODE_ENV}, VERCEL=${process.env.VERCEL}`);

// Set up periodic cleanup
const CLEANUP_INTERVAL = 15 * 60 * 1000; // 15 minutes
setInterval(() => {
  storage.cleanup().catch(err => 
    console.error('Error during storage cleanup:', err)
  );
}, CLEANUP_INTERVAL);

/**
 * Store a report for background processing
 */
export async function storeReportForProcessing(
  reportId: string,
  documents: UploadedDocument[],
  projectContext?: string
): Promise<string> {
  console.log(`Storing report ${reportId} for processing (using Supabase storage)`);
  
  const reportState: ReportProcessingState = {
    reportId,
    status: 'pending',
    documents,
    projectContext,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  
  await storage.set(reportId, reportState);
  return reportId;
}

/**
 * Get the current state of a report
 */
export async function getReportState(reportId: string): Promise<{
  isComplete: boolean;
  reportState?: ReportState;
  status: ProcessingStatus;
  error?: string;
}> {
  const report = await storage.get(reportId);
  
  if (!report) {
    console.warn(`Report ${reportId} not found in Supabase storage`);
    return { 
      isComplete: false, 
      status: 'error', 
      error: 'Report not found'
    };
  }
  
  return {
    isComplete: report.status === 'completed',
    reportState: report.result,
    status: report.status,
    error: report.error
  };
}

/**
 * Trigger background processing of a report
 */
export async function triggerBackgroundProcessing(reportId: string): Promise<void> {
  console.log(`[report-processor] Triggering background processing for report: ${reportId}`);
  
  try {
    const report = await storage.get(reportId);
    
    if (!report) {
      console.error(`[report-processor] Report ${reportId} not found for processing`);
      // Create a minimal report if it doesn't exist yet
      const newReport: ReportProcessingState = {
        reportId,
        status: 'pending',
        documents: [],
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      
      console.log(`[report-processor] Creating a new report entry for ${reportId}`);
      await storage.set(reportId, newReport);
      return;
    }
    
    // Log report details
    console.log(`[report-processor] Report found with ${report.documents.length} documents and status: ${report.status}`);
    
    // Update status to processing
    report.status = 'processing';
    report.updatedAt = Date.now();
    await storage.set(reportId, report);
    
    // Process in the background
    console.log(`[report-processor] Starting async processing of report ${reportId}`);
    
    // Handle unhandled promise rejection
    processReportAsync(reportId).catch(err => {
      console.error(`[report-processor] Error processing report ${reportId}:`, err);
      
      // Update with error status
      updateReportError(reportId, err instanceof Error ? err.message : String(err))
        .catch(updateErr => console.error(`[report-processor] Error updating report error status: ${updateErr}`));
    });
    
    console.log(`[report-processor] Background processing triggered for report ${reportId}`);
  } catch (error) {
    console.error(`[report-processor] Error triggering background processing:`, error);
    throw error;
  }
}

/**
 * Update a report with error status
 */
async function updateReportError(reportId: string, errorMessage: string): Promise<void> {
  try {
    const report = await storage.get(reportId);
    if (report) {
      report.status = 'error';
      report.error = errorMessage;
      report.updatedAt = Date.now();
      await storage.set(reportId, report);
      console.log(`[report-processor] Updated report ${reportId} with error status: ${errorMessage}`);
    } else {
      console.error(`[report-processor] Could not update error: Report ${reportId} not found`);
      
      // Create a minimal error report
      const errorReport: ReportProcessingState = {
        reportId,
        status: 'error',
        documents: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        error: errorMessage
      };
      
      await storage.set(reportId, errorReport);
      console.log(`[report-processor] Created new error report for ${reportId}`);
    }
  } catch (err) {
    console.error(`[report-processor] Failed to update error status:`, err);
  }
}

/**
 * Process a report asynchronously in the background
 */
async function processReportAsync(reportId: string): Promise<void> {
  console.log(`[report-processor] Starting async processing of report ${reportId}`);
  
  try {
    // Get the report from storage with retries to ensure documents are available
    let report;
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      // Get the report from storage
      report = await storage.get(reportId);
      
      if (!report) {
        throw new Error(`Report ${reportId} not found in storage, cannot process`);
      }
      
      // Validate documents array
      if (!report.documents || !Array.isArray(report.documents)) {
        throw new Error(`Report ${reportId} has invalid document structure`);
      }
      
      // If we have documents, break the retry loop
      if (report.documents.length > 0) {
        console.log(`[report-processor] Successfully retrieved report with ${report.documents.length} documents after ${retryCount} retries`);
        break;
      }
      
      // Otherwise, retry after a delay
      retryCount++;
      console.log(`[report-processor] Report ${reportId} has no documents yet, retrying (${retryCount}/${maxRetries})...`);
      
      // Exponential backoff - wait longer with each retry
      const delayMs = 500 * Math.pow(2, retryCount);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
    
    // Final check after retries
    if (!report || report.documents.length === 0) {
      throw new Error(`Report ${reportId} has no documents to process after ${maxRetries} retries`);
    }
    
    // Log documents for debugging
    console.log(`[report-processor] Processing report ${reportId} with ${report.documents.length} documents:`);
    report.documents.forEach((doc, index) => {
      console.log(`[report-processor] Document ${index + 1}: ${doc.name} (ID: ${doc.id}, Size: ${doc.size} bytes, Content Length: ${doc.textContent?.length || 0})`);
    });
    
    // Validate document content
    const invalidDocs = report.documents.filter(doc => !doc.textContent || doc.textContent.trim() === '');
    if (invalidDocs.length > 0) {
      console.warn(`[report-processor] Warning: ${invalidDocs.length} documents have no content:`, 
        invalidDocs.map(d => `${d.name} (${d.id})`).join(', '));
    }
    
    // If all documents are invalid (no content), throw an error
    if (invalidDocs.length === report.documents.length) {
      throw new Error(`Report ${reportId} has documents but none contain processable text content`);
    }
    
    // Filter to only include documents with content
    const validDocuments = report.documents.filter(doc => doc.textContent && doc.textContent.trim() !== '');
    console.log(`[report-processor] Processing ${validDocuments.length} valid documents with text content`);
    
    // Process the documents to get summaries
    const summaries = await processDocumentsSequentially(validDocuments);
    
    if (summaries.length === 0) {
      throw new Error(`Failed to generate summaries for report ${reportId}`);
    }
    
    console.log(`[report-processor] Generated ${summaries.length} summaries, generating report`);
    
    // Generate the report from summaries
    const reportState = await generateReportFromSummaries(
      summaries, 
      report.projectContext || ""
    );
    
    // Save the completed report
    report.status = 'completed';
    report.result = reportState;
    report.updatedAt = Date.now();
    await storage.set(reportId, report);
    
    console.log(`[report-processor] Successfully completed processing report ${reportId}`);
  } catch (error) {
    console.error(`[report-processor] Error processing report ${reportId}:`, error);
    
    // Update the report with error status
    try {
      const errorMessage = error instanceof Error ? error.message : String(error);
      await updateReportError(reportId, errorMessage);
    } catch (updateError) {
      console.error(`[report-processor] Failed to update report error status:`, updateError);
    }
  }
}

// Process documents one at a time to avoid timeouts
async function processDocumentsSequentially(documents: UploadedDocument[]): Promise<string[]> {
  const summaries: string[] = [];
  
  if (!documents || !Array.isArray(documents) || documents.length === 0) {
    console.warn('[report-processor] No documents provided for processing');
    return ['No documents provided for processing'];
  }
  
  // Process each document in sequence
  for (const doc of documents) {
    try {
      console.log(`Processing document: ${doc.name}`);
      
      // Skip documents without content
      if (!doc.textContent || doc.textContent.trim() === '') {
        console.log(`Skipping document ${doc.name} - no content`);
        continue;
      }
      
      // Add safeguard for excessively long documents
      const maxContentLength = 50000; // Limit to 50k chars to avoid timeouts
      const trimmedContent = doc.textContent.length > maxContentLength
        ? doc.textContent.substring(0, maxContentLength) + '... [content truncated for processing]'
        : doc.textContent;
      
      // Chunk the document if it's large 
      const chunks = chunkDocument(trimmedContent, 2000); // 2000 char chunks
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
    console.log(`Sending summarization request for ${docName} chunk ${chunkIndex+1}/${totalChunks} using model google/gemini-2.0-flash-001`);
    
    // Use a faster, smaller model with lower token count
    const response = await sendChatCompletion({
      model: "google/gemini-2.0-flash-001",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
      max_tokens: 2000, // Increased from 500
      retry_options: {
        max_retries: 1,
        initial_delay: 200,
        max_delay: 1000,
        backoff_factor: 1.5
      }
    });
    
    if (response instanceof ReadableStream) {
      console.warn(`Received streaming response for chunk summarization, which is not supported`);
      return `[Error: Streaming response not supported for chunk summarization]`;
    }
    
    const summaryText = response.choices?.[0]?.message?.content || '';
    
    // Log summary stats for debugging
    console.log(`Received summary for ${docName} chunk ${chunkIndex+1}/${totalChunks}: ${summaryText.length} chars`);
    
    return summaryText;
    
  } catch (error) {
    console.error(`Error summarizing chunk of ${docName}:`, error);
    
    // Enhanced error reporting
    let errorMessage = "Unknown error";
    if (error instanceof Error) {
      errorMessage = error.message;
      console.error('Error details:', error.stack);
      
      // Check for specific error types
      if (errorMessage.includes('timeout') || errorMessage.includes('aborted')) {
        errorMessage = "Request timed out - server may be overloaded";
      } else if (errorMessage.includes('rate limit') || errorMessage.includes('429')) {
        errorMessage = "API rate limit exceeded";
      }
    }
    
    return `[Error summarizing chunk: ${errorMessage}]`;
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
      model: "google/gemini-2.0-flash-001",
      messages: [{ role: "system", content: prompt }],
      temperature: 0.7,
      max_tokens: 4000, // Increased from 1500
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
    
    // Log response for debugging
    console.log(`OpenRouter API response for report generation:`, {
      hasContent: !!responseText.trim(),
      contentLength: responseText.length,
      firstFewWords: responseText.substring(0, 100) + '...'
    });

    if (!responseText.trim()) {
      // Fall back to an empty report if no content
      const emptyReport = createEmptyReport();
      emptyReport.sections.accomplishments = "* No content was generated from your documents";
      emptyReport.sections.insights = "* Try uploading different documents or adding specific details via chat";
      emptyReport.metadata.error = "API returned empty response";
      return emptyReport;
    }
    
    // Use the existing extraction function with type casting to ensure it's a complete ReportState
    const extractedReport = processResponseForReportGeneration(responseText);
    
    // Ensure all required fields are present
    return {
      title: extractedReport.title || "Status Report",
      date: extractedReport.date || createFormattedDate(),
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
    
    // Capture more specific error details for debugging
    let errorMessage = "Error generating report from document summaries";
    if (error instanceof Error) {
      errorMessage += `: ${error.message}`;
      console.error('Error details:', error.stack);
    }
    
    // Create a fallback report with error information
    const fallbackReport = createEmptyReport();
    fallbackReport.title = "Error Report";
    fallbackReport.sections.accomplishments = `* ${errorMessage}`;
    fallbackReport.sections.insights = "* You can still add content using the chat interface";
    fallbackReport.sections.decisions = "* Try asking specific questions to build your report section by section";
    fallbackReport.sections.nextSteps = "* Use 'add X to next steps' to build this section manually";
    
    // Add error metadata for debugging
    fallbackReport.metadata = {
      ...fallbackReport.metadata,
      error: errorMessage,
      lastUpdated: Date.now()
    };
    
    return fallbackReport;
  }
}

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
  
  // Generate the current date
  reportState.date = createFormattedDate();
  
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

// Helper function to create an empty report structure
function createEmptyReport(): ReportState {
  return {
    title: "Status Report",
    date: createFormattedDate(),
    sections: {
      accomplishments: "",
      insights: "",
      decisions: "",
      nextSteps: ""
    },
    metadata: {
      lastUpdated: Date.now(),
      relatedDocuments: [],
      fullReport: "",
      error: ""
    }
  };
}

// Helper function to create a formatted date
function createFormattedDate(): string {
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
  
  return `${month} ${day}${getOrdinalSuffix(day)} ${year}`;
} 