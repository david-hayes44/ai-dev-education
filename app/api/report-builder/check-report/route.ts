import { NextRequest, NextResponse } from "next/server";
import { getReportState } from "@/lib/report-processor";
import { ReportState } from "@/components/report-builder/types";

// Define the interface for the report status response
interface ReportStatusResponse {
  status: string;
  isComplete: boolean;
  error?: string;
  reportState?: ReportState;
  hasPartialResults?: boolean;
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
    console.log(`[check-report API] Fetching state for report: ${reportId}`);
    
    const { isComplete, reportState, status, error } = await getReportState(reportId);
    
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
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 