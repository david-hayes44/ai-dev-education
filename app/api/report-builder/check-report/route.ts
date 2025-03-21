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
    
    // Check if report exists in the filesystem directly as a fallback
    if (report.status === 'error' && report.error === 'Report not found') {
      console.log(`[check-report API] Report not found via normal channels, checking filesystem directly`);
      
      // Try to find the report file directly
      try {
        const dataDir = path.resolve(process.cwd(), '.data', 'reports');
        const expectedPath = path.join(dataDir, `report-${reportId}.json`);
        
        console.log(`[check-report API] Checking for file at: ${expectedPath}`);
        
        try {
          await fs.access(expectedPath, fs.constants.R_OK);
          console.log(`[check-report API] File exists but was not loaded by storage system`);
        } catch (err) {
          console.error(`[check-report API] File does not exist or is not accessible: ${expectedPath}`);
        }
        
        // List all files in the directory to see what's there
        try {
          const files = await fs.readdir(dataDir);
          console.log(`[check-report API] Files in reports directory:`, files);
        } catch (err) {
          console.error(`[check-report API] Could not read directory ${dataDir}:`, err);
        }
      } catch (fsError) {
        console.error(`[check-report API] Filesystem check error:`, fsError);
      }
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