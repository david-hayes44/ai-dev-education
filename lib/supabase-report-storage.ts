import { UploadedDocument, ReportState } from "@/components/report-builder/types";
import { supabase } from "./supabase";
import crypto from 'crypto';

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

/**
 * Supabase storage implementation for reports
 * Uses the reports and report_documents tables in Supabase
 */
class SupabaseStorage {
  /**
   * Retrieves a report from Supabase storage
   */
  async get(reportId: string): Promise<ReportProcessingState | undefined> {
    console.log(`[SupabaseStorage] Attempting to get report ${reportId} from Supabase`);
    try {
      // Fetch the report data
      const { data: report, error: reportError } = await supabase
        .from('reports')
        .select('*')
        .eq('id', reportId)
        .single();

      if (reportError) {
        console.error(`[SupabaseStorage] Error fetching report ${reportId}:`, reportError);
        return undefined;
      }

      if (!report) {
        console.warn(`[SupabaseStorage] Report ${reportId} not found in Supabase`);
        return undefined;
      }

      // Fetch associated documents
      const { data: documents, error: documentsError } = await supabase
        .from('report_documents')
        .select('*')
        .eq('report_id', reportId);

      if (documentsError) {
        console.error(`[SupabaseStorage] Error fetching documents for report ${reportId}:`, documentsError);
      }

      // Format the data to match ReportProcessingState
      const uploadedDocuments: UploadedDocument[] = (documents || []).map(doc => ({
        id: doc.id,
        name: doc.document_name,
        type: doc.document_type,
        size: doc.document_size,
        textContent: doc.text_content,
        summary: doc.summary,
        timestamp: new Date(doc.created_at).getTime()
      }));

      // Convert Supabase data format to our internal format
      const reportState: ReportProcessingState = {
        reportId: report.id,
        status: report.status as ProcessingStatus,
        documents: uploadedDocuments,
        projectContext: report.project_context,
        createdAt: new Date(report.created_at).getTime(),
        updatedAt: new Date(report.updated_at).getTime(),
        result: report.result,
        error: report.error
      };

      console.log(`[SupabaseStorage] Successfully retrieved report ${reportId} with ${uploadedDocuments.length} documents`);
      return reportState;
    } catch (err) {
      console.error(`[SupabaseStorage] Unexpected error retrieving report ${reportId}:`, err);
      return undefined;
    }
  }

  /**
   * Stores a report in Supabase storage
   */
  async set(reportId: string, state: ReportProcessingState): Promise<void> {
    console.log(`[SupabaseStorage] Storing report ${reportId} in Supabase with status: ${state.status}`);
    console.log(`[SupabaseStorage] Report has ${state.documents.length} documents attached`);
    
    try {
      // Check if the report already exists
      const { data: existingReport, error: checkError } = await supabase
        .from('reports')
        .select('id, created_at')
        .eq('id', reportId)
        .maybeSingle();

      if (checkError) {
        console.error(`[SupabaseStorage] Error checking if report ${reportId} exists:`, checkError);
      }

      // Prepare the report data
      const now = new Date().toISOString();
      const reportData = {
        id: reportId,
        status: state.status,
        project_context: state.projectContext,
        result: state.result,
        error: state.error,
        created_at: existingReport?.created_at || now,
        updated_at: now
      };

      console.log(`[SupabaseStorage] Upserting report data:`, JSON.stringify(reportData, null, 2).substring(0, 500) + '...');

      // Store or update the report
      const { error: reportError } = await supabase
        .from('reports')
        .upsert(reportData, { onConflict: 'id' });

      if (reportError) {
        console.error(`[SupabaseStorage] Error storing report ${reportId}:`, reportError);
        throw reportError;
      }

      // Then store each document
      console.log(`[SupabaseStorage] Storing ${state.documents.length} documents for report ${reportId}`);
      
      if (state.documents.length === 0) {
        console.warn(`[SupabaseStorage] Warning: Report ${reportId} has no documents to store!`);
        return; // Exit early if there are no documents
      }
      
      // Prepare all documents for batch insertion
      const documentsToInsert = [];
      
      // Helper function to check if a string is a valid UUID
      function isValidUUID(str: string): boolean {
        const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return UUID_REGEX.test(str);
      }
      
      for (const doc of state.documents) {
        // Ensure document ID is a valid UUID
        // If it's not already a UUID, generate a new one
        let documentId = doc.id;
        
        if (!documentId || !isValidUUID(documentId)) {
          documentId = crypto.randomUUID();
          console.log(`[SupabaseStorage] Document ID "${doc.id}" is not a valid UUID, generated new ID: ${documentId}`);
        }

        console.log(`[SupabaseStorage] Preparing document: ${documentId} - ${doc.name} (${doc.size} bytes)`);
        
        // Ensure textContent is never null/undefined
        if (!doc.textContent || doc.textContent.trim() === '') {
          doc.textContent = `[Empty document: ${doc.name}]`;
          console.warn(`[SupabaseStorage] Document ${documentId} had empty content, adding placeholder text`);
        }
        
        const docData = {
          id: documentId,
          report_id: reportId,
          document_name: doc.name,
          document_type: doc.type,
          document_size: doc.size,
          text_content: doc.textContent,
          summary: doc.summary,
          created_at: new Date(doc.timestamp).toISOString()
        };
        
        documentsToInsert.push(docData);
      }
      
      // Batch insert all documents
      console.log(`[SupabaseStorage] Batch inserting ${documentsToInsert.length} documents for report ${reportId}`);
      const { error: batchError } = await supabase
        .from('report_documents')
        .upsert(documentsToInsert, { onConflict: 'id' });
        
      if (batchError) {
        console.error(`[SupabaseStorage] Error batch storing documents for report ${reportId}:`, batchError);
        throw batchError;
      }

      console.log(`[SupabaseStorage] Successfully stored report ${reportId} with ${state.documents.length} documents`);
      
      // Verify documents were stored correctly by retrieving them
      const { data: verifyDocs, error: verifyError } = await supabase
        .from('report_documents')
        .select('*')
        .eq('report_id', reportId);
        
      if (verifyError) {
        console.error(`[SupabaseStorage] Error verifying document storage for ${reportId}:`, verifyError);
      } else {
        console.log(`[SupabaseStorage] Verified ${verifyDocs?.length || 0} of ${state.documents.length} documents were stored for report ${reportId}`);
        
        if ((verifyDocs?.length || 0) < state.documents.length) {
          console.warn(`[SupabaseStorage] Warning: Some documents may not have been stored correctly!`);
        }
      }
    } catch (err) {
      console.error(`[SupabaseStorage] Unexpected error storing report ${reportId}:`, err);
      throw err;
    }
  }

  /**
   * Deletes a report from Supabase storage
   */
  async delete(reportId: string): Promise<void> {
    console.log(`[SupabaseStorage] Deleting report ${reportId} from Supabase`);
    try {
      // Delete the report (documents will be deleted via ON DELETE CASCADE)
      const { error } = await supabase
        .from('reports')
        .delete()
        .eq('id', reportId);

      if (error) {
        console.error(`[SupabaseStorage] Error deleting report ${reportId}:`, error);
      } else {
        console.log(`[SupabaseStorage] Successfully deleted report ${reportId}`);
      }
    } catch (err) {
      console.error(`[SupabaseStorage] Unexpected error deleting report ${reportId}:`, err);
    }
  }

  /**
   * Cleans up old reports
   */
  async cleanup(): Promise<void> {
    console.log(`[SupabaseStorage] Running cleanup of old reports`);
    try {
      // Delete reports older than 1 hour
      const oneHourAgo = new Date();
      oneHourAgo.setHours(oneHourAgo.getHours() - 1);

      const { error, count } = await supabase
        .from('reports')
        .delete({ count: 'exact' })
        .lt('created_at', oneHourAgo.toISOString());

      if (error) {
        console.error('[SupabaseStorage] Error during cleanup:', error);
      } else {
        console.log(`[SupabaseStorage] Cleaned up ${count} old reports`);
      }
    } catch (err) {
      console.error('[SupabaseStorage] Unexpected error during cleanup:', err);
    }
  }
}

// Create and export a singleton instance
export const supabaseReportStorage = new SupabaseStorage(); 