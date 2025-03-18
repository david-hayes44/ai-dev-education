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

export interface ChatMessageProps {
  message: Message
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
  const isUser = message.role === "user"
  const isLoading = message.metadata?.type === "loading"
  const isError = message.metadata?.type === "error"
  const isStreaming = message.isStreaming
  const hasAttachments = message.attachments && message.attachments.length > 0
  const [selectedAttachment, setSelectedAttachment] = useState<LocalFileAttachment | null>(null)
  const { selectedModel, sendMessage, sendStreamingMessage } = useChat()
  const { getNavigationSuggestions, navigateTo } = useNavigation()
  const [resourceRecommendations, setResourceRecommendations] = useState<NavigationSuggestion[]>([])
  const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([])
  const chatService = React.useMemo(() => 
    typeof window !== 'undefined' 
      ? (window as unknown as { chatService: ChatServiceInterface }).chatService 
      : null, 
    []
  )

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
    
  const handleAttachmentClick = (attachment: ChatFileAttachment) => {
    // If it's a real attachment with URL, open it
    if (attachment.url) {
      // Check if it's a data URL (local attachment)
      if (attachment.url.startsWith('data:')) {
        // For data URLs (local attachments), show in the modal
        setSelectedAttachment(attachment as LocalFileAttachment);
      } 
      // Check if it's a local attachment with file metadata embedded in URL
      else if (attachment.url.includes(';name=')) {
        // Just show basic metadata in the modal since we can't display the actual file content
        setSelectedAttachment({
          ...attachment,
          isLocalReference: true
        });
      }
      // For remote images, show in the modal
      else if (attachment.type.startsWith('image/')) {
        setSelectedAttachment(attachment as LocalFileAttachment);
      } 
      // For other files with real URLs, open in a new tab
      else if (attachment.url !== '#') {
        window.open(attachment.url, '_blank');
      }
    }
  };

  // Generate suggestions and follow-up questions for the latest assistant message
  React.useEffect(() => {
    // Only process assistant messages that are not loading/streaming
    if (message.role === 'assistant' && 
        message.content && 
        !message.isStreaming && 
        !message.metadata?.type && 
        chatService) {
      
      // Generate resource recommendations
      chatService.generateResourceRecommendations(message)
        .then((recommendations: NavigationSuggestion[]) => {
          if (recommendations.length > 0) {
            setResourceRecommendations(recommendations);
          }
        })
        .catch((err: Error) => console.error('Error generating recommendations:', err));
      
      // Generate follow-up questions
      const followUps = chatService.generateFollowUpQuestions(message);
      if (followUps.length > 0) {
        setFollowUpQuestions(followUps);
      }
    }
  }, [message, chatService]);
  
  // Handler for follow-up question clicks
  const handleFollowUpClick = (question: string) => {
    if (sendMessage) {
      sendMessage(question);
    }
  };
  
  // Handler for resource recommendation clicks
  const handleResourceClick = (suggestion: NavigationSuggestion) => {
    if (navigateTo) {
      navigateTo(suggestion.path, suggestion.sectionId);
    }
  };

  return (
    <>
      <div
        className={cn(
          "flex gap-3 p-4",
          isUser ? "bg-muted/50" : "bg-background",
          className
        )}
      >
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
            {isStreaming && (
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-primary/10 text-primary animate-pulse">
                Streaming...
              </span>
            )}
            {displayAttachments.length > 0 && (
              <span className="text-xs flex items-center gap-1 text-muted-foreground">
                <Paperclip className="h-3 w-3" />
                {displayAttachments.length} attachment{displayAttachments.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
          
          <div className="chat-message-content">
            {isLoading ? (
              <div className="flex items-center space-x-1">
                <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground delay-0" />
                <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground delay-150" />
                <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground delay-300" />
              </div>
            ) : isError ? (
              <div className="text-destructive">{message.content}</div>
            ) : (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown
                  components={{
                    pre: ({ node, ...props }) => (
                      <div className="overflow-auto rounded-md border my-2 bg-muted p-2">
                        <pre {...props} />
                      </div>
                    ),
                    code: ({ node, className, children, ...props }) => (
                      <code className={cn("rounded-md px-1 py-0.5 bg-muted", className)} {...props}>
                        {children}
                      </code>
                    ),
                  }}
                >
                  {text}
                </ReactMarkdown>
                {isStreaming && (
                  <div className="mt-1 inline-flex h-3 w-3 animate-pulse rounded-full bg-primary/40"></div>
                )}
                
                {/* Display attachments */}
                {displayAttachments.length > 0 && (
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {displayAttachments.map((attachment) => (
                      <div 
                        key={attachment.id} 
                        className="max-w-[280px] cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => handleAttachmentClick(attachment)}
                      >
                        {attachment.url !== '#' ? (
                          <FileAttachmentComponent
                            file={{
                              url: attachment.url,
                              name: attachment.name,
                              type: attachment.type,
                              size: attachment.size
                            }}
                            onDownload={() => handleAttachmentClick(attachment)}
                            isLocal={attachment.url.startsWith('data:') || attachment.url.includes(';name=')}
                          />
                        ) : (
                          <div 
                            className="border rounded-md p-2 bg-muted/20 flex items-center gap-2 text-xs"
                          >
                            <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="font-medium truncate max-w-[150px]">
                              {attachment.name}
                            </span>
                            <span className="text-muted-foreground">
                              ({attachment.type.split('/').pop()})
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Add resource recommendations for assistant messages */}
                {message.role === 'assistant' && resourceRecommendations.length > 0 && (
                  <div className="mt-4">
                    <NavigationSuggestions suggestions={resourceRecommendations} />
                  </div>
                )}
                
                {/* Add follow-up questions for assistant messages */}
                {message.role === 'assistant' && followUpQuestions.length > 0 && (
                  <FollowUpQuestions 
                    questions={followUpQuestions} 
                    onQuestionClick={handleFollowUpClick} 
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Image preview dialog */}
      <Dialog open={selectedAttachment !== null} onOpenChange={(open) => !open && setSelectedAttachment(null)}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader className="flex justify-between items-center">
            <DialogTitle className="text-base">{selectedAttachment?.name}</DialogTitle>
            <button onClick={() => setSelectedAttachment(null)}>
              <X className="h-4 w-4" />
            </button>
          </DialogHeader>
          {selectedAttachment?.type.startsWith('image/') && selectedAttachment?.url.startsWith('data:') && (
            <div className="flex justify-center items-center p-4">
              <img 
                src={selectedAttachment.url} 
                alt={selectedAttachment.name}
                className="max-h-[70vh] max-w-full object-contain"
              />
            </div>
          )}
          {selectedAttachment?.isLocalReference && (
            <div className="p-4 text-center">
              <div className="bg-muted p-6 rounded-md flex flex-col items-center justify-center">
                <FileText className="h-16 w-16 text-muted-foreground mb-2" />
                <h3 className="font-medium">{selectedAttachment.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedAttachment.size ? formatFileSize(selectedAttachment.size) : ''}
                  {selectedAttachment.type ? ` • ${selectedAttachment.type.split('/').pop()}` : ''}
                </p>
                <p className="mt-4 text-sm">This file was attached locally and cannot be displayed</p>
              </div>
            </div>
          )}
          <div className="flex justify-end">
            {selectedAttachment?.url.startsWith('data:') && !selectedAttachment?.isLocalReference && (
              <a 
                href={selectedAttachment?.url} 
                download={selectedAttachment?.name}
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
    </>
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