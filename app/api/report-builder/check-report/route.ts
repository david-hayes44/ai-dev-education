import { NextRequest, NextResponse } from "next/server";
import { getReportState } from "@/lib/report-processor";

/**
 * API endpoint to check the status of a report being processed in the background
 */
export async function GET(request: NextRequest) {
  try {
    // Get reportId from query parameters
    const { searchParams } = new URL(request.url);
    const reportId = searchParams.get('reportId');
    
    if (!reportId) {
      return NextResponse.json(
        { error: "Missing reportId parameter" },
        { status: 400 }
      );
    }
    
    // Get current report state
    const report = await getReportState(reportId);
    
    return NextResponse.json({
      isComplete: report.isComplete,
      reportState: report.reportState,
      status: report.status,
      error: report.error
    });
  } catch (error) {
    console.error('Error checking report status:', error);
    
    return NextResponse.json(
      { 
        error: "Failed to check report status",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
} 