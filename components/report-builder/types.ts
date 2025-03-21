/**
 * Type definitions for the 4-Box Report Builder
 */

// Chat message types
export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  isStreaming?: boolean;
  metadata?: {
    type?: 'error' | 'info' | 'upload' | 'report-update';
    section?: ReportSectionKey;
    action?: string;
  };
}

// File upload types
export interface UploadedDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  textContent?: string;
  summary?: string;
  url?: string;
  path?: string;
  timestamp: number;
}

// Report section keys
export type ReportSectionKey = 'accomplishments' | 'insights' | 'decisions' | 'nextSteps';

// Report state
export interface ReportState {
  title: string;
  date: string;
  sections: {
    accomplishments: string;
    insights: string;
    decisions: string;
    nextSteps: string;
  };
  metadata: {
    lastUpdated: number;
    relatedDocuments?: string[]; // IDs of documents used to generate this report
    fullReport?: string; // Store the complete AI-generated report for reference
  };
}

// Chat state
export interface ChatState {
  messages: Message[];
  isProcessing: boolean;
  uploadedDocuments: UploadedDocument[];
  reportState: ReportState;
}

// API request for chat
export interface ChatRequest {
  message: string;
  reportState: ReportState;
  documentIds?: string[];
}

// API response from chat
export interface ChatResponse {
  reply: string;
  updatedReport?: Partial<ReportState>;
}

// Document processing request
export interface ProcessDocumentRequest {
  document: File;
}

// Document processing response
export interface ProcessDocumentResponse {
  documentId: string;
  textContent: string;
  summary: string;
}

// Report generation request
export interface GenerateReportRequest {
  documents: UploadedDocument[];
  projectContext?: string;
}

// Report export request
export interface ExportReportRequest {
  reportState: ReportState;
  format: 'pdf' | 'md' | 'docx';
}

// Report export response
export interface ExportReportResponse {
  url: string;
} 