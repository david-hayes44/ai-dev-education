import { NextRequest, NextResponse } from "next/server";
import { getReportState, ProcessingStatus } from "@/lib/report-processor";
import { ReportState } from "@/components/report-builder/types";

/**
 * NOTE: This API endpoint is being kept for backward compatibility.
 * The preferred approach for getting report updates is now using the streaming response
 * from the generate-report-stream endpoint, which eliminates the need for polling
 * and provides real-time updates as they become available.
 */

// Define the interface for the report status response
interface ReportStatusResponse {
  status: string;
  isComplete: boolean;
  error?: string;
  reportState?: ReportState;
  hasPartialResults?: boolean;
}

// Define interface for the report state result
interface ReportStateResult {
  isComplete: boolean;
  reportState?: ReportState;
  status: ProcessingStatus;
  error?: string;
}

/**
 * API endpoint to check the status of a report being processed in the background
 * Retrieves report data from Supabase storage
 */
export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const reportId = params.get('reportId');
    
    if (!reportId) {
      return NextResponse.json(
        { error: "Missing reportId parameter" },
        { status: 400 }
      );
    }
    
    console.log(`[check-report API] Received request for reportId: ${reportId}`);
    
    // Set timeout for Supabase retrieval
    const timeoutPromise = new Promise<{timeout: true}>(resolve => {
      setTimeout(() => resolve({timeout: true}), 15000); // 15 second timeout
    });
    
    // Fetch the report state with timeout protection
    const fetchPromise = getReportState(reportId)
      .then(result => ({timeout: false, result}));
    
    // Race between fetch and timeout
    const result = await Promise.race([fetchPromise, timeoutPromise]);
    
    if ('timeout' in result && result.timeout) {
      console.log(`[check-report API] Timeout waiting for report ${reportId}`);
      return NextResponse.json(
        { 
          status: 'processing',
          isComplete: false,
          error: 'Timeout waiting for report state',
          hasPartialResults: false
        },
        { status: 408 } // Request Timeout status
      );
    }
    
    // We know this is a fetch result if we get here
    const { isComplete, reportState, status, error } = (result as {timeout: false, result: ReportStateResult}).result;
    
    console.log(`[check-report API] Report state retrieved:`, {
      status,
      isComplete,
      hasReportState: !!reportState,
      error: error || 'none'
    });
    
    // Include reportState in the response when:
    // 1. Report is complete OR
    // 2. We have partial results during processing (streaming)
    const shouldIncludePartialResults = 
      status === 'processing' && 
      reportState && 
      reportState.metadata && 
      reportState.metadata.isPartialResult === true;
    
    const response: ReportStatusResponse = {
      status,
      isComplete,
      ...(error ? { error } : {}),
    };
    
    // Include the partial or complete report state when appropriate
    if (isComplete || shouldIncludePartialResults) {
      response.reportState = reportState;
      response.hasPartialResults = shouldIncludePartialResults;
    }
    
    console.log(`[check-report API] Returning report status: ${status}${shouldIncludePartialResults ? ' with partial results' : ''}`);
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('[check-report API] Error checking report status:', error);
    
    return NextResponse.json(
      { 
        error: "Failed to check report status",
        details: error instanceof Error ? error.message : String(error),
        status: 'error',
        isComplete: false,
      },
      { status: 500 }
    );
  }
} 