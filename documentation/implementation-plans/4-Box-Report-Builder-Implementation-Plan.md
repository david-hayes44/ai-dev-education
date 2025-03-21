# 4-Box Report Builder Assistant Implementation Plan

## 1. Overview

The 4-Box Report Builder Assistant is designed to help users create structured status reports quickly by analyzing uploaded documents and generating a report in a standardized 4-box format. The assistant will provide:

- Document upload capabilities for ingesting project materials
- AI-powered extraction and summarization of key information
- Interactive chat interface for refining the generated report
- Real-time editable 4-box report display
- Export functionality for completed reports

## 2. Architecture

### Core Components

```
ReportBuilderAssistant
├── DocumentProcessor - Handles document uploads and text extraction
├── ChatInterface - Manages conversation flow with AI
├── ReportEditor - Interactive 4-box report editor
└── ReportExporter - Handles export to various formats
```

### Technical Stack

- **Frontend**: Next.js 14 with App Router, TypeScript, Tailwind CSS
- **AI Integration**: OpenRouter API via existing implementation
- **Document Processing**: Client-side text extraction with server processing
- **State Management**: React state with context for global state

## 3. User Interface Design

### Layout

The UI will be split horizontally with two main sections:

1. **Left Panel (Chat & Upload)**: 
   - Document uploader with drag/drop support
   - Chat interface with message history
   - Document attachment visualization
   - Upload status indicators

2. **Right Panel (Report Editor)**:
   - Report header with title and date
   - 4-box grid layout with clearly labeled sections:
     - Accomplishments Since Last Update
     - Insights / Learnings
     - Decisions / Risks / Resources Required
     - Next Steps / Upcoming Tasks
   - Interactive edit controls for each section
   - Export/Copy buttons

## 4. State Management

Two primary state objects will be maintained:

```typescript
// For conversation and document tracking
interface ChatState {
  messages: Message[];
  isProcessing: boolean;
  uploadedDocuments: UploadedDocument[];
}

// For the report content
interface ReportState {
  title: string;
  date: string;
  sections: {
    accomplishments: string;
    insights: string;
    decisions: string;
    nextSteps: string;
  }
}
```

## 5. Data Flow

1. **Document Upload Flow**:
   - User uploads document(s) → client-side processing → server extraction
   - Text content stored in session state → AI summarization
   - Initial report sections generated from document content

2. **Chat Interaction Flow**:
   - User sends message → message added to chat state
   - AI processes message with document and report context
   - AI responds and optionally updates report sections
   - UI reflects changes to both chat and report states

3. **Report Editing Flow**:
   - User edits report section directly → updates report state
   - Edit history maintained for undo/redo
   - Changes reflected in conversation context for continued relevance

## 6. API Implementation

### Endpoints

```typescript
// Chat interaction with report context
POST /api/report-builder/chat
Body: { message: string, reportState: ReportState }
Response: { reply: string, updatedReport?: ReportState }

// Document processing
POST /api/report-builder/process-document
Body: { document: File }
Response: { documentId: string, textContent: string, summary: string }

// Initial report generation
POST /api/report-builder/generate-report
Body: { documents: UploadedDocument[], projectContext?: string }
Response: { reportState: ReportState }

// Report export functionality
POST /api/report-builder/export
Body: { reportState: ReportState, format: 'pdf'|'md'|'docx' }
Response: { url: string } // URL to download the exported file
```

## 7. OpenRouter AI Integration

### System Prompt Design

The system prompt will be specialized for report generation with sections like:

```
You are the 4-Box Report Builder, an assistant designed to help professionals create concise, informative status reports.

Your task is to analyze the user's uploaded documents and conversation to generate content for a 4-box report with these sections:

1. Accomplishments Since Last Update: List completed tasks, milestones reached, and successes.
2. Insights / Learnings: Highlight important discoveries, lessons learned, and "aha moments".
3. Decisions / Risks / Resources Required: Note decisions needed, potential issues, and resource requirements.
4. Next Steps / Upcoming Tasks: Outline immediate future work and upcoming deliverables.

When generating or updating the report:
- Be concise and factual
- Organize information in bullet points when appropriate
- Prioritize recent information over older content
- Focus on actionable items and clear status updates
- Maintain professional language suitable for stakeholders

Use function calling to update specific sections of the report when requested.
```

### Function Calling Schema

```typescript
{
  name: "update_report_section",
  description: "Updates a specific section of the 4-box report",
  parameters: {
    type: "object",
    properties: {
      section: {
        type: "string",
        enum: ["accomplishments", "insights", "decisions", "nextSteps"]
      },
      content: {
        type: "string",
        description: "The new content for the specified section"
      }
    },
    required: ["section", "content"]
  }
}
```

## 8. Document Processing Implementation

1. **Client-Side Processing**:
   - Basic metadata extraction (filename, type, size)
   - Image-based document detection
   - Progress indicators for large files

2. **Server-Side Processing**:
   - Text extraction from various document types (PDF, DOCX, TXT, HTML, MD)
   - Table data extraction and formatting
   - Content summarization for context window management
   - Key information identification (dates, metrics, status items)

3. **Context Management**:
   - Chunking of document content for token management
   - Relevance scoring for prioritizing recent/important content
   - Document metadata tracking for source attribution

## 9. Implementation Phases

### Phase 1: MVP (1-2 days)

- Basic page layout with chat and report display
- Document upload with text extraction
- OpenRouter integration with report-specific prompting
- Initial 4-box report generation
- Basic styling and responsiveness

### Phase 2: Enhanced Features (2-3 days)

- Improved document processing with better format support
- Direct section editing with history
- Function calling for targeted section updates
- Report templates and customization
- Export functionality to various formats

### Phase 3: Refinement (1-2 days)

- UI/UX improvements based on testing
- Performance optimizations
- Error handling and edge cases
- Accessibility improvements
- User experience enhancements

## 10. Project Structure

```
/app
  /staff-hub
    /assistants
      /report-builder
        /page.tsx         # Main page component for the report builder
/components
  /report-builder
    /chat-interface.tsx   # Chat and document upload interface
    /document-uploader.tsx # Document upload component
    /report-editor.tsx    # Interactive 4-box report editor
    /report-exporter.tsx  # Export functionality component
    /types.ts            # Type definitions for the report builder
/app/api
  /report-builder
    /chat/route.ts        # Chat endpoint with OpenRouter integration
    /process-document/route.ts # Document processing endpoint
    /generate-report/route.ts  # Initial report generation
    /export/route.ts      # Report export functionality
/lib
  /document-processor.ts  # Document processing utilities
  /report-templates.ts    # Report templates and formatting
  /openrouter-utils.ts    # Enhanced OpenRouter utilities
```

## 11. Testing Strategy

- Unit tests for core components
- Integration tests for API endpoints
- End-to-end tests for complete user flows
- Document processing tests with various file types
- AI response validation with different inputs

## 12. Future Enhancements

- Team collaboration features for shared reports
- Historical report tracking and versioning
- Integration with project management tools
- Advanced document analysis for better information extraction
- Customizable report templates for different use cases
- AI-powered suggestions for improving report content 