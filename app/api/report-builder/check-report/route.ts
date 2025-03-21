import { NextRequest, NextResponse } from "next/server";
import { getReportState } from "@/lib/report-processor";

/**
 * API endpoint to check the status of a report being processed in the background
 * Retrieves report data from Supabase storage
 */
export async function GET(request: NextRequest) {
  try {
    // Get reportId from query parameters
    const { searchParams } = new URL(request.url);
    const reportId = searchParams.get('reportId');
    
    console.log(`[check-report API] Received request for reportId: ${reportId}`);
    
    if (!reportId) {
      console.warn('[check-report API] Missing reportId parameter');
      return NextResponse.json(
        { error: "Missing reportId parameter" },
        { status: 400 }
      );
    }
    
    // Get current report state from Supabase via the report processor
    console.log(`[check-report API] Fetching state for report: ${reportId}`);
    const report = await getReportState(reportId);
    
    console.log(`[check-report API] Report state retrieved:`, {
      status: report.status,
      isComplete: report.isComplete,
      hasReportState: !!report.reportState,
      error: report.error || 'none'
    });
    
    // If report not found, provide a useful fallback instead of an error
    if (report.status === 'error' && report.error === 'Report not found') {
      console.log(`[check-report API] Report ${reportId} not found, providing fallback`);
      
      // Create a fallback report that the user can interact with
      const fallbackReport = {
        title: "Processing Report",
        date: new Date().toLocaleDateString(),
        sections: {
          accomplishments: "* Your report is being processed\n* This might take a moment to complete",
          insights: "* The report processing system uses Supabase for reliable storage\n* You can continue to use the chat while waiting",
          decisions: "* If this message persists, you can try regenerating the report\n* Or try using the chat interface to analyze your documents",
          nextSteps: "* Wait a few more moments for processing to complete\n* If needed, click 'Regenerate Report' below\n* You can also ask specific questions in the chat"
        },
        metadata: {
          lastUpdated: Date.now(),
          error: "Report processing in progress - this is a temporary message"
        }
      };
      
      // Return a processing status instead of error, with the fallback report
      return NextResponse.json({
        isComplete: false,
        reportState: fallbackReport,
        status: 'processing',
        message: "Report processing in progress - please continue waiting"
      });
    }
    
    console.log(`[check-report API] Returning report status: ${report.status}`);
    
    // Make sure we always return a valid response with all expected fields
    return NextResponse.json({
      isComplete: report.isComplete || false,
      reportState: report.reportState || null,
      status: report.status || 'error',
      error: report.error || undefined
    });
  } catch (error) {
    console.error('[check-report API] Error checking report status:', error);
    
    return NextResponse.json(
      { 
        error: "Failed to check report status",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
} 