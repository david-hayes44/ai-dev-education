import { useState, useRef, useEffect } from 'react';
import { Message, UploadedDocument } from './types';
import DocumentUploader from './document-uploader';
import { Paperclip, Send, Bot, Loader2, Upload, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ChatInterfaceProps {
  onSendMessage: (message: string) => void;
  messages: Message[];
  isProcessing: boolean;
  onDocumentUploaded: (document: UploadedDocument) => void;
  onDocumentRemoved: (documentId: string) => void;
  uploadedDocuments: UploadedDocument[];
  initialLoad?: boolean;
  regenerating?: boolean;
  onRegenerateClick?: () => void;
}

export default function ChatInterface({ 
  onSendMessage, 
  messages, 
  isProcessing,
  onDocumentUploaded,
  onDocumentRemoved,
  uploadedDocuments,
  initialLoad = false,
  regenerating = false,
  onRegenerateClick
}: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const [showUploader, setShowUploader] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isInitialRender = useRef(true);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  // Scroll chat container only when new messages are added, not on initial load
  useEffect(() => {
    // Skip scrolling for the initial welcome message
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }
    
    // Don't scroll on initial load if flag is set
    if (initialLoad) {
      return;
    }
    
    // Only scroll if this is not the welcome message
    if (messages.length > 1) {
      // Scroll the chat container, not the page
      const chatContainer = chatContainerRef.current;
      if (chatContainer) {
        // Delay the scroll to ensure content is rendered
        setTimeout(() => {
          chatContainer.scrollTop = chatContainer.scrollHeight;
        }, 100);
      }
    }
  }, [messages, initialLoad]);
  
  // Define the scrollToBottom function for manual scrolling
  const scrollToBottom = () => {
    const chatContainer = chatContainerRef.current;
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (input.trim() === '' || isProcessing) {
      return;
    }
    
    onSendMessage(input);
    setInput('');
  };
  
  const toggleUploader = () => {
    setShowUploader(!showUploader);
  };
  
  return (
    <div className="chat-interface flex flex-col h-full border rounded-lg overflow-hidden bg-white dark:bg-gray-900 shadow-sm">
      <div className="p-4 border-b bg-slate-50 dark:bg-gray-800">
        <h2 className="text-lg font-medium dark:text-gray-200">Chat &amp; Document Upload</h2>
        <p className="text-sm text-slate-500 dark:text-gray-400">Upload relevant documents and refine your report</p>
      </div>
      
      <div className="flex-1 p-4 overflow-auto min-h-[450px]" ref={chatContainerRef}>
        {messages.length === 0 ? (
          <div className="py-12 flex items-center justify-center text-slate-400 dark:text-gray-500 h-full">
            <div className="text-center">
              <Bot className="h-12 w-12 mx-auto mb-4 text-slate-300 dark:text-gray-600" />
              <p className="text-center text-base mb-6">
                Upload documents or start chatting to generate your report
              </p>
              
              <div className="flex gap-4 justify-center">
                <button
                  onClick={toggleUploader}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-md transition-colors"
                >
                  <Upload className="h-5 w-5" />
                  <span className="font-medium">Upload Documents</span>
                </button>
                
                <button
                  onClick={() => onSendMessage("Help me create a 4-box report")}
                  className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-slate-800 dark:text-gray-200 px-4 py-3 rounded-md transition-colors"
                >
                  <Bot className="h-5 w-5" />
                  <span className="font-medium">Start with AI</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {uploadedDocuments.length > 0 && !showUploader && (
              <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-md">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-medium text-blue-700 dark:text-blue-400">Uploaded Documents</h3>
                  <button 
                    onClick={toggleUploader}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline"
                  >
                    Manage
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {uploadedDocuments.map(doc => (
                    <div key={doc.id} className="flex items-center gap-1 bg-white dark:bg-gray-800 px-2 py-1 rounded text-xs border dark:border-gray-700">
                      <FileText className="h-3 w-3 text-blue-500" />
                      <span className="truncate max-w-[120px]">{doc.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div 
                  key={message.id || index} 
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`p-3 rounded-lg max-w-[85%] ${
                      message.role === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-slate-100 dark:bg-gray-800 text-slate-800 dark:text-gray-200'
                    }`}
                  >
                    {message.isStreaming ? (
                      <div className="flex items-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Generating...</span>
                      </div>
                    ) : (
                      <div className={`markdown-content prose prose-sm max-w-none prose-headings:mt-2 prose-headings:mb-1 ${
                        message.role === 'user' ? 'prose-invert' : 'dark:prose-invert'
                      }`}>
                        <ReactMarkdown>
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    )}
                    
                    {message.metadata?.type === 'upload' && (
                      <div className="mt-2 text-xs opacity-75">
                        Document uploaded and processed
                      </div>
                    )}
                    
                    {message.metadata?.type === 'report-update' && (
                      <div className="mt-2 text-xs opacity-75">
                        Updated {message.metadata.section} section
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} className="h-10" />
            </div>
          </>
        )}
      </div>
      
      {showUploader && (
        <div className="border-t dark:border-gray-700 p-4 bg-white dark:bg-gray-900">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-base font-medium dark:text-gray-200">Upload Documents</h3>
            <button 
              onClick={toggleUploader}
              className="text-sm text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-300"
            >
              Close
            </button>
          </div>
          <DocumentUploader 
            onDocumentUploaded={onDocumentUploaded}
            onDocumentRemoved={onDocumentRemoved}
            uploadedDocuments={uploadedDocuments}
          />
        </div>
      )}
      
      <div className="p-4 border-t dark:border-gray-700 sticky bottom-0 bg-white dark:bg-gray-900">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <button 
            type="button"
            className={`p-2 rounded-md ${showUploader ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'hover:bg-slate-100 dark:hover:bg-gray-800 text-slate-500 dark:text-gray-400'}`}
            aria-label="Upload document"
            onClick={toggleUploader}
            title="Upload Documents"
          >
            <Paperclip className="h-5 w-5" />
          </button>
          <input 
            type="text" 
            className="flex-1 p-2 border dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200" 
            placeholder="Type a message or ask for help..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isProcessing}
          />
          <button 
            type="submit"
            disabled={isProcessing || input.trim() === ''}
            className={`p-2 rounded-md ${
              isProcessing || input.trim() === '' 
                ? 'bg-slate-300 dark:bg-gray-700 text-slate-500 dark:text-gray-500 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
            aria-label="Send message"
          >
            {isProcessing ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </form>
        
        {uploadedDocuments.length > 0 && !showUploader && (
          <div className="mt-2">
            <button 
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline" 
              onClick={toggleUploader}
            >
              {uploadedDocuments.length} document{uploadedDocuments.length !== 1 ? 's' : ''} uploaded • Manage documents
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 