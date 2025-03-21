"use client";

import { PageHeader } from "@/components/page-header";
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Message, UploadedDocument, ReportState } from "@/components/report-builder/types";
import { v4 as uuidv4 } from 'uuid';

// Import components dynamically to prevent hydration errors
const ChatInterface = dynamic(() => import("@/components/report-builder/chat-interface"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col h-full border rounded-lg overflow-hidden bg-white shadow-sm">
      <div className="p-4 border-b bg-slate-50">
        <h2 className="text-lg font-medium">Chat &amp; Document Upload</h2>
        <p className="text-sm text-slate-500">Loading chat interface...</p>
      </div>
      <div className="flex-1 p-4 flex items-center justify-center">
        <div className="animate-pulse text-slate-400">Loading...</div>
      </div>
    </div>
  )
});

const ReportEditor = dynamic(() => import("@/components/report-builder/report-editor"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col h-full border rounded-lg overflow-hidden bg-white shadow-sm">
      <div className="p-4 border-b bg-slate-50">
        <h2 className="text-lg font-medium">4-Box Report</h2>
        <p className="text-sm text-slate-500">Loading report editor...</p>
      </div>
      <div className="flex-1 p-4 flex items-center justify-center">
        <div className="animate-pulse text-slate-400">Loading...</div>
      </div>
    </div>
  )
});

// Default empty report state
const createEmptyReport = (): ReportState => {
  const now = new Date();
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  const getOrdinalSuffix = (d: number) => {
    if (d > 3 && d < 21) return 'th';
    switch (d % 10) {
      case 1: return "st";
      case 2: return "nd";
      case 3: return "rd";
      default: return "th";
    }
  };
  
  return {
    title: "",
    date: `${monthNames[now.getMonth()]} ${now.getDate()}${getOrdinalSuffix(now.getDate())} ${now.getFullYear()}`,
    sections: {
      accomplishments: "",
      insights: "",
      decisions: "",
      nextSteps: ""
    },
    metadata: {
      lastUpdated: Date.now(),
      relatedDocuments: []
    }
  };
};

// Welcome message for first-time users
const getWelcomeMessage = (): Message => ({
  id: uuidv4(),
  role: 'assistant',
  content: `# 📊 Welcome to the 4-Box Report Builder!

I'll help you create professional status reports from your documents and communications.

## 🚀 How to Get Started

### 1️⃣ Upload Documents
- Click the **paperclip icon** or the **Upload Documents** button
- Add project materials like emails, meeting notes, or documents
- Multiple file formats are supported (PDF, Word, text, images)

### 2️⃣ Generate Initial Report
- Once documents are uploaded, I'll analyze them automatically
- An initial 4-box report will be created based on your content
- You'll see the results in the report editor on the right

### 3️⃣ Refine with Chat
Ask me to update specific sections by trying commands like:
\`\`\`
Add completing the UI design to accomplishments
Update the next steps section with the launch date
What risks should I include in the decisions section?
\`\`\`

### 4️⃣ Edit Directly
- You can click on any section in the report editor to make direct changes
- Each box can be edited independently

### 5️⃣ Export or Copy
- When finished, use the **Copy** or **Export** buttons to share your report

---

Ready to create your first report? Upload a document to get started, or ask me any questions!`,
  timestamp: Date.now()
});

export default function ReportBuilderPage() {
  // Create a ref to track if the component is mounted
  const [mounted, setMounted] = useState(false);
  
  // Initialize states with empty values - will be populated properly on mount
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);
  const [reportState, setReportState] = useState<ReportState>(createEmptyReport());
  const [initialLoad, setInitialLoad] = useState(true); // Track initial load to prevent auto-scrolling
  const [regenerating, setRegenerating] = useState(false); // Track regeneration state

  // Set mounted state when component mounts
  useEffect(() => {
    // Mark the component as mounted first
    setMounted(true);
    
    // Ensure page starts at the top when first loaded
    if (typeof window !== 'undefined') {
      // Use a zero timeout to ensure this happens after any rendering
      setTimeout(() => {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'instant' // Use 'instant' instead of 'smooth' to avoid visible scrolling
        });
      }, 0);
    }
    
    // Defer adding welcome message to a separate effect to prevent auto-scrolling
  }, []);
  
  // Add welcome message in a separate effect after component is mounted
  useEffect(() => {
    if (mounted && messages.length === 0) {
      // Defer adding the welcome message to next tick to avoid triggering scroll
      setTimeout(() => {
        setMessages([getWelcomeMessage()]);
        // Mark initial load as complete after welcome message is added
        setInitialLoad(false);
      }, 100);
    }
  }, [mounted, messages.length]);

  // Handle sending a message
  const handleSendMessage = async (content: string) => {
    // Don't allow empty messages
    if (!content.trim()) return;
    
    // Add user message to the chat
    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content,
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Create placeholder for assistant response
    const placeholder: Message = {
      id: uuidv4(),
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      isStreaming: true
    };
    
    setMessages(prev => [...prev, placeholder]);
    setIsProcessing(true);
    
    try {
      // Call the chat API
      const response = await fetch('/api/report-builder/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: content,
          reportState,
          documentIds: uploadedDocuments.map(doc => doc.id)
        })
      });
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      
      // Update messages with the actual response
      setMessages(prev => prev.map(msg => 
        msg.id === placeholder.id
          ? {
              ...msg,
              content: data.reply,
              isStreaming: false,
              timestamp: Date.now()
            }
          : msg
      ));
      
      // Update report state if there are changes
      if (data.updatedReport) {
        setReportState(prev => ({
          ...prev,
          ...data.updatedReport,
          sections: {
            ...prev.sections,
            ...data.updatedReport.sections
          },
          metadata: {
            ...prev.metadata,
            lastUpdated: Date.now()
          }
        }));
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Update messages with error
      setMessages(prev => prev.map(msg => 
        msg.id === placeholder.id
          ? {
              ...msg,
              content: "I'm sorry, I encountered an error while processing your request. Please try again.",
              isStreaming: false,
              metadata: { type: 'error' },
              timestamp: Date.now()
            }
          : msg
      ));
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle document upload
  const handleDocumentUploaded = async (document: UploadedDocument) => {
    // Add document to state
    setUploadedDocuments(prev => [...prev, document]);
    
    // Add system message about the upload
    const systemMessage: Message = {
      id: uuidv4(),
      role: 'assistant',
      content: `📄 Document **"${document.name}"** has been uploaded and processed.`,
      timestamp: Date.now(),
      metadata: {
        type: 'upload'
      }
    };
    
    setMessages(prev => [...prev, systemMessage]);
    
    // If this is the first document, generate an initial report
    if (uploadedDocuments.length === 0) {
      await generateInitialReport([document]);
    }
  };

  // Handle document removal
  const handleDocumentRemoved = (documentId: string) => {
    setUploadedDocuments(prev => prev.filter(doc => doc.id !== documentId));
  };

  // Handle report changes
  const handleReportChange = (updatedReport: ReportState) => {
    setReportState(updatedReport);
  };

  // Generate initial report from documents
  const generateInitialReport = async (documents: UploadedDocument[]) => {
    if (documents.length === 0) return;
    
    setIsProcessing(true);
    
    // Add system message about report generation
    const systemMessage: Message = {
      id: uuidv4(),
      role: 'assistant',
      content: "⏳ **Generating initial report** from uploaded documents...",
      timestamp: Date.now(),
      isStreaming: true
    };
    
    setMessages(prev => [...prev, systemMessage]);
    
    // Define formatDate function here
    const formatDate = () => {
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
    };
    
    let attempts = 0;
    const maxAttempts = 2;
    
    while (attempts < maxAttempts) {
      try {
        attempts++;
        console.log(`Attempting to generate report (attempt ${attempts}/${maxAttempts})`);
        
        // Call the generate report API with a timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 25000); // 25 second timeout
        
        const response = await fetch('/api/report-builder/generate-report', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            documents,
            projectContext: ""
          }),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }
        
        const data = await response.json();
        
        // Enhanced debug logging
        console.log('Report generation response received:', data);
        console.log('Initial report state:', JSON.stringify(data.reportState, null, 2));
        
        // Check if we have a reportId for background processing
        if (data.reportId) {
          console.log(`Report is being processed in background with ID: ${data.reportId}`);
          
          // Set the initial report state
          setReportState(data.reportState);
          
          // Start polling for updates
          pollForReportUpdates(data.reportId, systemMessage.id);
          
          // Break out of retry loop since we have a valid response
          break;
        } else if (data.reportState?.sections) {
          console.log('Received complete report state from API');
          
          // Verify that all required fields are present and provide fallbacks
          const validatedReportState: ReportState = {
            title: data.reportState.title || "Status Report",
            date: data.reportState.date || formatDate(),
            sections: {
              accomplishments: data.reportState.sections?.accomplishments || "* No accomplishments detected",
              insights: data.reportState.sections?.insights || "* No insights detected",
              decisions: data.reportState.sections?.decisions || "* No decisions detected",
              nextSteps: data.reportState.sections?.nextSteps || "* No next steps detected"
            },
            metadata: {
              lastUpdated: Date.now(),
              relatedDocuments: data.reportState.metadata?.relatedDocuments || [],
              fullReport: data.reportState.metadata?.fullReport || ""
            }
          };
          
          console.log('Setting validated report state:', JSON.stringify(validatedReportState, null, 2));
          
          // Update state with the validated report data
          setReportState(validatedReportState);
          
          // Check if we got a partial (error) report
          const hasError = data.error && data.reportState.title === "Partial Report";
          
          // Show a helpful message if there's no meaningful content
          const isEmpty = !validatedReportState.sections.accomplishments.includes("*") &&
                        !validatedReportState.sections.insights.includes("*") &&
                        !validatedReportState.sections.decisions.includes("*") &&
                        !validatedReportState.sections.nextSteps.includes("*");
                          
          if (isEmpty) {
            console.warn("Report appears empty, adding guidance for user");
            // Add guidance for empty reports
            validatedReportState.sections.accomplishments = "* No specific accomplishments found in your documents";
            validatedReportState.sections.insights = "* Try asking in chat: 'What insights can you find in my documents?'";
            validatedReportState.sections.decisions = "* Try asking in chat: 'What decisions need to be made based on my documents?'";
            validatedReportState.sections.nextSteps = "* Try asking in chat: 'What next steps are mentioned in my documents?'";
            setReportState(validatedReportState);
          }
          
          // Update system message based on success or partial success
          setMessages(prev => prev.map(msg => 
            msg.id === systemMessage.id
              ? {
                  ...msg,
                  content: hasError 
                    ? "⚠️ **Partial report generated.** " + data.error
                    : "✅ **Initial report generated** based on your documents. You can now refine it using the chat.",
                  isStreaming: false,
                  timestamp: Date.now(),
                  metadata: hasError ? { type: 'info' } : undefined
                }
              : msg
          ));
          
          // Break out of retry loop on success
          break;
        } else {
          console.error('No reportState in API response');
          throw new Error('Missing report state in response');
        }
        
      } catch (error) {
        console.error('Error generating report:', error);
        
        // If we've exhausted our retries, show error message with better guidance
        if (attempts >= maxAttempts) {
          // Update system message with error and troubleshooting steps
          setMessages(prev => prev.map(msg => 
            msg.id === systemMessage.id
              ? {
                  ...msg,
                  content: "❌ **Error generating report**. This could be due to:\n\n" +
                           "1. The OpenRouter service may be experiencing issues\n" + 
                           "2. The account may have insufficient credits\n" +
                           "3. The request may have timed out\n\n" +
                           "Try with smaller or fewer documents, or build your report using the chat.",
                  isStreaming: false,
                  metadata: { type: 'error' },
                  timestamp: Date.now()
                }
              : msg
          ));
          
          // Create fallback report with error messaging and clear guidance
          const fallbackReport = createEmptyReport();
          fallbackReport.title = "Error Generating Report";
          fallbackReport.sections.accomplishments = "* Error generating report - try uploading smaller documents";
          fallbackReport.sections.accomplishments += "\n* Or try one document at a time";
          fallbackReport.sections.insights = "* You can still add content using the chat interface";
          fallbackReport.sections.insights += "\n* Try asking: 'What are the key insights from my documents?'";
          fallbackReport.sections.decisions = "* Try asking specific questions to build your report section by section";
          fallbackReport.sections.decisions += "\n* For example: 'What decisions are mentioned in my documents?'";
          fallbackReport.sections.nextSteps = "* Use 'add X to next steps' to build this section";
          fallbackReport.sections.nextSteps += "\n* Or try: 'What next steps should I take based on these documents?'";
          
          setReportState(fallbackReport);
        } else {
          // If there are retries left, update message to indicate retrying
          setMessages(prev => prev.map(msg => 
            msg.id === systemMessage.id
              ? {
                  ...msg,
                  content: `⏳ **Retrying report generation** (attempt ${attempts}/${maxAttempts})`,
                  isStreaming: true,
                  timestamp: Date.now()
                }
              : msg
          ));
          
          // Wait briefly before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
    
    setIsProcessing(false);
  };

  // Function to force regenerate the report
  const forceRegenerateReport = async () => {
    if (uploadedDocuments.length === 0 || regenerating) return;
    
    setRegenerating(true);
    
    // Add system message about report regeneration
    const systemMessage: Message = {
      id: uuidv4(),
      role: 'assistant',
      content: "⏳ **Regenerating report** from uploaded documents...",
      timestamp: Date.now(),
      isStreaming: true
    };
    
    setMessages(prev => [...prev, systemMessage]);
    
    try {
      await generateInitialReport(uploadedDocuments);
      
      // Update message to indicate success
      setMessages(prev => prev.map(msg => 
        msg.id === systemMessage.id
          ? {
              ...msg,
              content: "✅ **Report regenerated** successfully.",
              isStreaming: false
            }
          : msg
      ));
    } catch (error) {
      console.error('Error regenerating report:', error);
      
      // Update message to indicate error
      setMessages(prev => prev.map(msg => 
        msg.id === systemMessage.id
          ? {
              ...msg,
              content: "❌ **Error regenerating report**. Please try again.",
              isStreaming: false,
              metadata: { type: 'error' }
            }
          : msg
      ));
    } finally {
      setRegenerating(false);
    }
  };
  
  // Check if report is empty
  const isReportEmpty = !reportState.sections.accomplishments && 
                       !reportState.sections.insights && 
                       !reportState.sections.decisions && 
                       !reportState.sections.nextSteps;

  // Function to poll for report updates in the background
  const pollForReportUpdates = async (reportId: string, messageId: string) => {
    // Update message to show polling status
    setMessages(prev => prev.map(msg => 
      msg.id === messageId
        ? {
            ...msg,
            content: "⏳ **Processing your documents**... This may take up to 30 seconds.",
            isStreaming: false,
            timestamp: Date.now()
          }
        : msg
    ));
    
    // Start polling with a 3-second interval
    let attempts = 0;
    const maxAttempts = 30; // 90 seconds max (30 * 3s)
    const pollInterval = 3000; // 3 seconds
    
    const poll = async () => {
      if (attempts >= maxAttempts) {
        console.warn(`Exceeded max polling attempts (${maxAttempts}) for report ${reportId}`);
        
        setMessages(prev => prev.map(msg => 
          msg.id === messageId
            ? {
                ...msg,
                content: "⚠️ **Processing timed out**. The report may be too large or complex. " +
                         "Try using the chat to ask about specific content in your documents.",
                isStreaming: false,
                metadata: { type: 'error' },
                timestamp: Date.now()
              }
            : msg
        ));
        
        return;
      }
      
      try {
        attempts++;
        
        const response = await fetch(`/api/report-builder/check-report?reportId=${reportId}`);
        
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }
        
        const data = await response.json();
        console.log(`Polling attempt ${attempts}: Status=${data.status}`, data);
        
        if (data.status === 'completed' && data.reportState) {
          // We have a completed report - update the UI
          console.log('Report processing completed:', data.reportState);
          
          // Update report state with the completed report
          setReportState(data.reportState);
          
          // Update message to show completion
          setMessages(prev => prev.map(msg => 
            msg.id === messageId
              ? {
                  ...msg,
                  content: "✅ **Report generation complete!** Your document analysis is ready. " +
                           "You can refine it using the chat.",
                  isStreaming: false,
                  timestamp: Date.now()
                }
              : msg
          ));
          
          return; // Stop polling
        } else if (data.status === 'error') {
          // Handle error state
          console.error('Error in report processing:', data.error);
          
          setMessages(prev => prev.map(msg => 
            msg.id === messageId
              ? {
                  ...msg,
                  content: `❌ **Error generating report**: ${data.error || 'Unknown error'}. ` +
                           "Try with smaller documents or use the chat to analyze specific parts.",
                  isStreaming: false,
                  metadata: { type: 'error' },
                  timestamp: Date.now()
                }
              : msg
          ));
          
          return; // Stop polling
        } else if (data.status === 'processing') {
          // Still processing - update message with progress indication
          if (attempts % 3 === 0) { // Update message every ~9 seconds
            const dots = '.'.repeat((attempts / 3) % 4); // Creates animated dots ...
            
            setMessages(prev => prev.map(msg => 
              msg.id === messageId
                ? {
                    ...msg,
                    content: `⏳ **Processing your documents${dots}** ` +
                             `(${attempts * 3}s) This may take up to 90 seconds for large files.`,
                    timestamp: Date.now()
                  }
                : msg
            ));
          }
          
          // Continue polling
          setTimeout(poll, pollInterval);
        } else {
          // Unknown status - continue polling
          setTimeout(poll, pollInterval);
        }
        
      } catch (error) {
        console.error('Error polling for report updates:', error);
        
        // Continue polling despite error (could be temporary network issue)
        setTimeout(poll, pollInterval);
      }
    };
    
    // Start polling immediately
    poll();
  };

  // Only render the components when mounted to prevent hydration issues
  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader
        title="4-Box Report Builder"
        description="Generate concise, professional status reports from your documents and communications."
      />
      
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-240px)] min-h-[600px]">
        {/* Chat Interface (Left Side) */}
        {mounted && (
          <ChatInterface
            onSendMessage={handleSendMessage}
            messages={messages}
            isProcessing={isProcessing}
            onDocumentUploaded={handleDocumentUploaded}
            onDocumentRemoved={handleDocumentRemoved}
            uploadedDocuments={uploadedDocuments}
          />
        )}
        
        {/* Report Editor (Right Side) */}
        {mounted && (
          <div className="flex flex-col h-full">
            <ReportEditor
              reportState={reportState}
              onReportChange={handleReportChange}
            />
            
            {(isReportEmpty || reportState.sections.accomplishments.includes("Error generating report")) && uploadedDocuments.length > 0 && (
              <div className="mt-2 text-center">
                <p className="text-sm text-slate-500 mb-2">
                  {reportState.sections.accomplishments.includes("Error generating report") 
                    ? "Report generation timed out. You can regenerate with fewer documents or build your report using the chat."
                    : "Report appears to be empty. Would you like to regenerate it?"}
                </p>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={forceRegenerateReport}
                    disabled={regenerating}
                    className={`px-3 py-1.5 rounded-md text-sm ${
                      regenerating 
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {regenerating ? 'Regenerating...' : 'Regenerate Report'}
                  </button>
                  
                  {reportState.sections.accomplishments.includes("Error generating report") && (
                    <button
                      onClick={() => handleSendMessage("Can you help me build this report step by step?")}
                      className="px-3 py-1.5 rounded-md text-sm bg-slate-100 text-slate-700 hover:bg-slate-200"
                    >
                      Build with Chat
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Show placeholders while not mounted */}
        {!mounted && (
          <>
            <div className="flex flex-col border rounded-lg overflow-hidden bg-white shadow-sm">
              <div className="p-4 border-b bg-slate-50">
                <h2 className="text-lg font-medium">Chat &amp; Document Upload</h2>
                <p className="text-sm text-slate-500">Loading...</p>
              </div>
              <div className="flex-1 p-4 flex items-center justify-center">
                <div className="animate-pulse text-slate-400">Loading chat interface...</div>
              </div>
            </div>
            
            <div className="flex flex-col border rounded-lg overflow-hidden bg-white shadow-sm">
              <div className="p-4 border-b bg-slate-50">
                <h2 className="text-lg font-medium">4-Box Report</h2>
                <p className="text-sm text-slate-500">Loading...</p>
              </div>
              <div className="flex-1 p-4 flex items-center justify-center">
                <div className="animate-pulse text-slate-400">Loading report editor...</div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 