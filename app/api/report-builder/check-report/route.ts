import { NextRequest, NextResponse } from "next/server";
import { getReportState } from "@/lib/report-processor";
import path from 'path';
import fs from 'fs/promises';

/**
 * API endpoint to check the status of a report being processed in the background
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
    
    // Get current report state
    console.log(`[check-report API] Fetching state for report: ${reportId}`);
    const report = await getReportState(reportId);
    
    // If report not found, provide a useful fallback instead of an error
    if (report.status === 'error' && report.error === 'Report not found') {
      console.log(`[check-report API] Report ${reportId} not found, providing fallback`);
      
      // Create a fallback report that the user can interact with
      const fallbackReport = {
        title: "Processing Report",
        date: new Date().toLocaleDateString(),
        sections: {
          accomplishments: "* Your report is being processed\n* This sometimes takes longer in serverless environments",
          insights: "* The report processing system is distributed across multiple servers\n* You can continue to use the chat while waiting",
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
    
    return NextResponse.json({
      isComplete: report.isComplete,
      reportState: report.reportState,
      status: report.status,
      error: report.error
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