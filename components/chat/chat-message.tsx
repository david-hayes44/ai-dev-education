"use client"

import * as React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Message, MessageMetadataType } from "@/lib/chat-service"
import ReactMarkdown from "react-markdown"
import { Copy, FileText, Image as ImageIcon, FileIcon, MessageCircle, User, Bot, Paperclip, X, Download } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { useChat } from "@/contexts/chat-context"
import { useNavigation } from "@/contexts/navigation-context"
import { NavigationSuggestion, NavigationSuggestions } from "./navigation-suggestion"
import { ContentReference, ContentReferences } from "./content-references"

// Import from @/lib/chat-service to avoid naming conflicts
import type { FileAttachment as ChatFileAttachment } from "@/lib/chat-service"

// Interface for ChatService with only the methods we need
interface ChatServiceInterface {
  generateResourceRecommendations: (message: Message) => Promise<NavigationSuggestion[]>;
  generateFollowUpQuestions: (message: Message) => string[];
  createAssistantMessagePlaceholder: (content: string, attachments?: ChatFileAttachment[]) => Message;
  updateAssistantMessageWithError: (error: unknown) => void;
  isNavigationRequest: (message: string) => boolean;
}

// Extended Message interface to include contentReferences
interface MessageWithContentReferences extends Message {
  contentReferences?: ContentReference[];
}

export interface ChatMessageProps {
  message: MessageWithContentReferences
  className?: string
}

// Extended local FileAttachment interface for UI purposes
interface LocalFileAttachment extends ChatFileAttachment {
  isLocalReference?: boolean;
}

// File attachment component for displaying file attachments
const FileAttachmentComponent = ({ file, onDownload, isLocal }: { 
  file: { url: string, name: string, type: string, size: number }, 
  onDownload: () => void,
  isLocal?: boolean
}) => (
  <div className="border rounded-md p-2 bg-muted/20 flex items-center gap-2 text-xs">
    <FileIcon className="h-3.5 w-3.5 text-muted-foreground" />
    <span className="font-medium truncate max-w-[150px]">{file.name}</span>
    <span className="text-muted-foreground">{file.type.split('/').pop()}</span>
    {!isLocal && <Download className="h-3 w-3 ml-auto cursor-pointer" onClick={onDownload} />}
  </div>
);

export default function ChatMessage({ message, className }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [activeImage, setActiveImage] = useState("");
  const [showResourceSuggestions, setShowResourceSuggestions] = useState(false);
  const [resourceSuggestions, setResourceSuggestions] = useState<NavigationSuggestion[]>([]);
  const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([]);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  const [attachmentError, setAttachmentError] = useState<Record<string, boolean>>({});
  const [loadingAttachments, setLoadingAttachments] = useState<Record<string, boolean>>({});
  const [showRetryButton, setShowRetryButton] = useState(false);
  
  const isUser = message.role === "user";
  const isAssistant = message.role === "assistant";
  const isSystem = message.role === "system";
  const isError = message.metadata?.type === "error";
  const isLoading = message.metadata?.type === "loading";
  const isThinking = message.metadata?.type === "thinking"; 
  const isSuggestion = message.metadata?.type === "suggestion";
  const isConceptExplanation = message.metadata?.type === "concept_explanation";
  const isRechunking = Boolean(message.metadata?.rechunking);
  const isStreaming = Boolean(message.isStreaming);
  const hasContentReferences = message.contentReferences && message.contentReferences.length > 0;
  const { sendMessage } = useChat();
  const { navigateTo } = useNavigation();
  
  const chatService = React.useMemo(() => 
    typeof window !== 'undefined' 
      ? (window as unknown as { chatService: ChatServiceInterface }).chatService 
      : null, 
    []
  );
  
  const isAttachmentMessage = message.attachments && message.attachments.length > 0;
  
  // Function to extract attachment references from markdown content
  const extractAttachmentRefs = (content: string): {
    text: string,
    attachments: { name: string, type: string }[]
  } => {
    const attachmentRegex = /\[Attachment: (.+) \((.+)\)\]/g;
    const attachments: { name: string, type: string }[] = [];
    let match;
    
    // Find all attachment references
    while ((match = attachmentRegex.exec(content)) !== null) {
      attachments.push({
        name: match[1],
        type: match[2]
      });
    }
    
    // Remove attachment references from text
    const cleanedText = content.replace(/\n\n\[Attachment:.+\]/g, '');
    
    return {
      text: cleanedText,
      attachments
    };
  };
  
  // Format file size in a human-readable way
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };
  
  // Process content for attachment references (temporary approach)
  const { text, attachments } = extractAttachmentRefs(message.content);
  const displayAttachments = message.attachments || 
    (attachments.length > 0 ? attachments.map((a, i) => ({
      id: `extracted-${i}`,
      name: a.name,
      type: a.type,
      url: '#',
      path: '',
      size: 0,
    })) : []);
    
  // Enhanced file loading with error handling
  const handleAttachmentLoad = (attachmentId: string) => {
    setLoadingAttachments(prev => ({
      ...prev,
      [attachmentId]: false
    }));
  };
  
  const handleAttachmentError = (attachmentId: string) => {
    setAttachmentError(prev => ({
      ...prev,
      [attachmentId]: true
    }));
    setLoadingAttachments(prev => ({
      ...prev,
      [attachmentId]: false
    }));
  };
  
  const handleAttachmentClick = (attachment: ChatFileAttachment) => {
    // Mark this attachment as loading when clicked
    setLoadingAttachments(prev => ({
      ...prev,
      [attachment.id]: true
    }));
    
    // Rest of the existing method...
    if (attachment.type.startsWith("image/")) {
      setActiveImage(attachment.url);
      setImageDialogOpen(true);
    } else if (attachment.url) {
      // For non-image files, open in a new tab or download
      window.open(attachment.url, "_blank");
    }
  };

  // Add implementations for the resource recommendations and follow-up questions
  const generateResourceRecommendations = async () => {
    if (!isAssistant || !chatService) return;
    
    try {
      setIsGeneratingSuggestions(true);
      const recommendations = await chatService.generateResourceRecommendations(message);
      if (recommendations.length > 0) {
        setResourceSuggestions(recommendations);
        setShowResourceSuggestions(true);
      }
    } catch (error) {
      console.error("Error generating resource recommendations:", error);
    } finally {
      setIsGeneratingSuggestions(false);
    }
  };

  // Generate follow-up questions
  const generateFollowUpQuestions = () => {
    if (!isAssistant || !chatService) return;
    
    try {
      const questions = chatService.generateFollowUpQuestions(message);
      if (questions.length > 0) {
        setFollowUpQuestions(questions);
      }
    } catch (error) {
      console.error("Error generating follow-up questions:", error);
    }
  };

  // Handle follow-up question click
  const handleFollowUpClick = (question: string) => {
    if (sendMessage) {
      sendMessage(question);
    }
  };

  // Handle resource suggestion click
  const handleResourceClick = (suggestion: NavigationSuggestion) => {
    if (navigateTo) {
      navigateTo(suggestion.path, suggestion.sectionId);
    }
  };
  
  // Generate suggestions and follow-up questions for the latest assistant message
  React.useEffect(() => {
    // Only process assistant messages that are not loading/streaming
    if (isAssistant && 
        message.content && 
        !isStreaming && 
        !isLoading && 
        !isRechunking && 
        chatService) {
      
      // Generate resource recommendations
      generateResourceRecommendations();
      
      // Generate follow-up questions
      generateFollowUpQuestions();
    }
  }, [message, isAssistant, isStreaming, isLoading, isRechunking]);

  // Add useEffect to show retry button after 10 seconds of loading
  React.useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (isLoading || isStreaming) {
      // Show retry button after 10 seconds of loading
      timeoutId = setTimeout(() => {
        setShowRetryButton(true);
      }, 10000);
    } else {
      setShowRetryButton(false);
    }
    
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isLoading, isStreaming]);
  
  // Add handler for retry button click
  const handleRetry = () => {
    if (!chatService) return;
    
    // Update the message to show error state
    chatService.updateAssistantMessageWithError(new Error("Request canceled by user"));
    
    // Clear loading state
    setShowRetryButton(false);
  };

  // Helper function to determine what status indicator to show
  const getStatusIndicator = () => {
    if (isStreaming) {
      return (
        <div className="flex items-center">
          <span className="text-xs px-1.5 py-0.5 rounded-full bg-primary/10 text-primary animate-pulse">
            Streaming...
          </span>
          {showRetryButton && (
            <div className="flex gap-1">
              <Button 
                variant="ghost" 
                className="h-6 ml-2 text-xs px-2 py-0 text-muted-foreground hover:text-destructive"
                onClick={handleRetry}
              >
                Cancel
              </Button>
              <Button 
                variant="ghost" 
                className="h-6 text-xs px-2 py-0 text-destructive"
                onClick={() => {
                  // Force immediate error state
                  console.error("DEBUG: Force error triggered by user");
                  // Log debug info
                  console.log("DEBUG INFO:", {
                    messageId: message.id,
                    isStreaming,
                    isLoading,
                    hasOpenRouterKey: !!process.env.NEXT_PUBLIC_OPENROUTER_API_KEY?.substring(0, 3),
                    metadataType: message.metadata?.type,
                    browserInfo: navigator.userAgent
                  });
                  if (chatService) {
                    chatService.updateAssistantMessageWithError(new Error("User forced error"));
                  }
                }}
              >
                Force Error
              </Button>
            </div>
          )}
        </div>
      );
    } 
    
    if (isLoading) {
      return (
        <div className="flex items-center">
          <span className="text-xs px-1.5 py-0.5 rounded-full bg-primary/10 text-primary animate-pulse">
            Loading...
          </span>
          {showRetryButton && (
            <div className="flex gap-1">
              <Button 
                variant="ghost" 
                className="h-6 ml-2 text-xs px-2 py-0 text-muted-foreground hover:text-destructive"
                onClick={handleRetry}
              >
                Cancel
              </Button>
              <Button 
                variant="ghost" 
                className="h-6 text-xs px-2 py-0 text-destructive"
                onClick={() => {
                  // Force immediate error state
                  console.error("DEBUG: Force error triggered by user");
                  // Log debug info
                  console.log("DEBUG INFO:", {
                    messageId: message.id,
                    isStreaming,
                    isLoading,
                    hasOpenRouterKey: !!process.env.NEXT_PUBLIC_OPENROUTER_API_KEY?.substring(0, 3),
                    metadataType: message.metadata?.type,
                    browserInfo: navigator.userAgent
                  });
                  if (chatService) {
                    chatService.updateAssistantMessageWithError(new Error("User forced error"));
                  }
                }}
              >
                Force Error
              </Button>
            </div>
          )}
        </div>
      );
    }
    
    if (isThinking) {
      return (
        <span className="text-xs px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground animate-pulse">
          Thinking...
        </span>
      );
    }
    
    if (isRechunking) {
      return (
        <span className="text-xs px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground animate-pulse">
          Processing...
        </span>
      );
    }
    
    if (message.metadata?.type === "fallback") {
      return (
        <span className="text-xs px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-800 dark:text-amber-100">
          Fallback Mode
        </span>
      );
    }
    
    if (isError) {
      return (
        <span className="text-xs px-1.5 py-0.5 rounded-full bg-destructive/10 text-destructive">
          Error
        </span>
      );
    }
    
    return null;
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-2 relative group",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <Avatar className={cn("h-8 w-8", isUser ? "bg-primary" : "bg-muted")}>
          {isUser ? (
            <User className="h-4 w-4 text-primary-foreground" />
          ) : (
            <Bot className="h-4 w-4" />
          )}
        </Avatar>

        <div className="flex-1 space-y-2">
          <div className="text-sm font-medium flex items-center gap-2">
            {isUser ? "You" : "AI Tutor"}
            {getStatusIndicator()}
            {displayAttachments.length > 0 && (
              <span className="text-xs flex items-center gap-1 text-muted-foreground">
                <Paperclip className="h-3 w-3" />
                {displayAttachments.length} attachment{displayAttachments.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
          
          <div className={cn(
            "prose prose-sm dark:prose-invert max-w-none",
            isLoading && "animate-pulse",
            isThinking && "text-muted-foreground italic",
            isRechunking && "text-muted-foreground",
            isError && "text-destructive",
            message.metadata?.type === "fallback" && "text-amber-800 dark:text-amber-300"
          )}>
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '200ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '400ms' }}></div>
              </div>
            ) : isRechunking ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                <span>Processing message history...</span>
              </div>
            ) : isStreaming ? (
              <div className={cn("transition-all duration-200", isStreaming ? "border-l-2 border-primary pl-2" : "")}>
                {message.content ? (
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                ) : (
                  <span className="text-muted-foreground">Generating response...</span>
                )}
              </div>
            ) : (
              <ReactMarkdown>{message.content || ""}</ReactMarkdown>
            )}
          </div>
          
          {isAttachmentMessage && (
            <div className="mt-2 space-y-1">
              <h4 className="text-xs text-muted-foreground font-medium mb-1">
                {message.attachments!.length === 1 ? "Attachment" : "Attachments"}
              </h4>
              <div className="flex flex-wrap gap-2">
                {message.attachments!.map((attachment) => (
                  <Card 
                    key={attachment.id} 
                    className={cn(
                      "flex items-center p-2 gap-2 cursor-pointer w-auto max-w-full overflow-hidden group/attachment hover:bg-accent transition-colors duration-200",
                      attachmentError[attachment.id] && "border-destructive/50 bg-destructive/10"
                    )}
                    onClick={() => handleAttachmentClick(attachment)}
                  >
                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded bg-muted relative overflow-hidden">
                      {loadingAttachments[attachment.id] ? (
                        <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                      ) : attachment.type.startsWith("image/") ? (
                        attachment.thumbnailUrl ? (
                          <Image 
                            src={attachment.thumbnailUrl} 
                            alt={attachment.name} 
                            fill 
                            className="object-cover" 
                            onLoad={() => handleAttachmentLoad(attachment.id)}
                            onError={() => handleAttachmentError(attachment.id)}
                          />
                        ) : (
                          <ImageIcon className="h-4 w-4 text-muted-foreground" />
                        )
                      ) : (
                        <FileIcon className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium truncate">{attachment.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(attachment.size)}
                      </p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 opacity-0 group-hover/attachment:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Download the file
                        window.open(attachment.url, "_blank");
                      }}
                    >
                      <Download className="h-3 w-3" />
                      <span className="sr-only">Download</span>
                    </Button>
                  </Card>
                ))}
              </div>
              {Object.keys(attachmentError).length > 0 && (
                <p className="text-xs text-destructive mt-1">
                  Some attachments could not be loaded. They may be unavailable or restricted.
                </p>
              )}
            </div>
          )}
          
          {message.role === 'assistant' && resourceSuggestions.length > 0 && (
            <div className="mt-4">
              <NavigationSuggestions suggestions={resourceSuggestions} />
            </div>
          )}
          
          {message.role === 'assistant' && followUpQuestions.length > 0 && (
            <FollowUpQuestions 
              questions={followUpQuestions} 
              onQuestionClick={handleFollowUpClick} 
            />
          )}
          
          {/* Display content references if available */}
          {isAssistant && !isStreaming && !isLoading && hasContentReferences && (
            <ContentReferences references={message.contentReferences || []} />
          )}
        </div>
      </div>
      
      <Dialog open={imageDialogOpen} onOpenChange={(open) => !open && setImageDialogOpen(false)}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader className="flex justify-between items-center">
            <DialogTitle className="text-base">{activeImage}</DialogTitle>
            <button onClick={() => setImageDialogOpen(false)}>
              <X className="h-4 w-4" />
            </button>
          </DialogHeader>
          {activeImage.startsWith('data:') && (
            <div className="flex justify-center items-center p-4">
              <img 
                src={activeImage} 
                alt={activeImage}
                className="max-h-[70vh] max-w-full object-contain"
              />
            </div>
          )}
          <div className="flex justify-end">
            {activeImage.startsWith('data:') && !activeImage.includes(';name=') && (
              <a 
                href={activeImage} 
                download={activeImage}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <Download className="h-3.5 w-3.5" />
                Download
              </a>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// For backwards compatibility with existing imports
export { ChatMessage }

interface FollowUpQuestionProps {
  questions: string[];
  onQuestionClick: (question: string) => void;
}

function FollowUpQuestions({ questions, onQuestionClick }: FollowUpQuestionProps) {
  if (!questions.length) return null;
  
  return (
    <div className="mt-4 space-y-2">
      <h4 className="text-sm font-medium">Follow-up Questions</h4>
      <div className="flex flex-wrap gap-2">
        {questions.map((question, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={() => onQuestionClick(question)}
          >
            <MessageCircle className="h-3 w-3 mr-1" />
            {question}
          </Button>
        ))}
      </div>
    </div>
  );
} 