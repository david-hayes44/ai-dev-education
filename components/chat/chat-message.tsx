"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { User, Bot, Code, Book, Tag, FileText, Download, Paperclip, File } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { MessageMetadata, FileAttachment } from "@/lib/chat-service"
import { Button } from "@/components/ui/button"

export type MessageType = "user" | "assistant"

interface ChatMessageProps {
  type: MessageType
  content: string
  metadata?: MessageMetadata
  attachments?: FileAttachment[]
}

export function ChatMessage({ type, content, metadata, attachments }: ChatMessageProps) {
  // Check if this is a JSON response (structured output)
  let structuredContent = null;
  
  if (type === "assistant" && metadata?.type === "concept_explanation") {
    try {
      const jsonContent = JSON.parse(content);
      structuredContent = (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Book className="h-4 w-4" />
            <h3 className="text-lg font-semibold">{jsonContent.concept}</h3>
            {jsonContent.knowledge_level && (
              <span className="ml-auto inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                {jsonContent.knowledge_level}
              </span>
            )}
          </div>
          
          <p className="font-medium text-base">{jsonContent.summary}</p>
          
          <div className="prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown>{jsonContent.details}</ReactMarkdown>
          </div>
          
          {jsonContent.code_example && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Code className="h-4 w-4" />
                <h4 className="font-medium">Example Code</h4>
              </div>
              <div className="bg-muted rounded-md p-4 overflow-auto">
                <pre className="text-sm">
                  <code>
                    {jsonContent.code_example}
                  </code>
                </pre>
              </div>
            </div>
          )}
          
          {jsonContent.related_concepts && jsonContent.related_concepts.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                <h4 className="font-medium">Related Concepts</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {jsonContent.related_concepts.map((concept: string, index: number) => (
                  <span key={index} className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    {concept}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    } catch (error) {
      // If parsing fails, fall back to regular markdown rendering
      console.log("Structured message parsing failed, rendering as plain markdown");
    }
  }

  // Helper function to format code blocks
  const CodeBlock = ({ className, children }: { className?: string; children: React.ReactNode }) => {
    // Extract language from className (format: 'language-xxx')
    const language = className ? className.replace('language-', '') : '';
    return (
      <div className="bg-muted rounded-md p-4 overflow-auto my-4">
        <pre className="text-sm">
          <code className={cn(language ? `language-${language}` : '')}>
            {children}
          </code>
        </pre>
      </div>
    );
  };

  // Render file attachments
  const renderAttachments = () => {
    if (!attachments || attachments.length === 0) return null;
    
    return (
      <div className="mt-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Paperclip className="h-4 w-4" />
          <span>Attachments ({attachments.length})</span>
        </div>
        
        <div className="flex flex-col gap-3">
          {attachments.map((attachment) => (
            <div key={attachment.id} className="border rounded-md overflow-hidden bg-muted/30">
              {/* Image preview */}
              {attachment.type.startsWith("image/") && attachment.thumbnailUrl && (
                <div className="w-full border-b">
                  <a href={attachment.url} target="_blank" rel="noopener noreferrer">
                    <img 
                      src={attachment.thumbnailUrl} 
                      alt={attachment.name}
                      className="w-full max-h-[300px] object-contain bg-muted/50"
                    />
                  </a>
                </div>
              )}
              
              {/* File information & actions */}
              <div className="p-3 flex justify-between items-center">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {attachment.type.startsWith("image/") ? (
                    <div className="h-8 w-8 flex items-center justify-center bg-primary/10 text-primary rounded">
                      <FileText className="h-4 w-4" />
                    </div>
                  ) : (
                    <div className="h-8 w-8 flex items-center justify-center bg-primary/10 text-primary rounded">
                      <File className="h-4 w-4" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate" title={attachment.name}>
                      {attachment.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {attachment.type.split('/')[1] || attachment.type} · {formatFileSize(attachment.size)}
                    </div>
                  </div>
                </div>
                
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-8 px-2" 
                  asChild
                >
                  <a href={attachment.url} download={attachment.name}>
                    <Download className="h-4 w-4 mr-1" />
                    <span>Download</span>
                  </a>
                </Button>
              </div>
              
              {/* Text content preview */}
              {attachment.content && (
                <div className="p-3 pt-0">
                  <div className="rounded-md bg-muted/70 p-3 max-h-[200px] overflow-y-auto">
                    <pre className="text-xs whitespace-pre-wrap">{attachment.content}</pre>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  // Helper function to format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div
      className={cn(
        "flex w-full items-start gap-4 p-5",
        type === "user" ? "bg-muted/50" : "bg-background"
      )}
    >
      <div className="flex h-9 w-9 shrink-0 select-none items-center justify-center rounded-md border shadow-sm">
        {type === "user" ? (
          <User className="h-5 w-5" />
        ) : (
          <Bot className="h-5 w-5" />
        )}
      </div>
      <div className="min-w-0 flex-1 space-y-2">
        {structuredContent ? (
          <>
            {structuredContent}
            {renderAttachments()}
          </>
        ) : (
          <>
            <div className="prose-sm dark:prose-invert w-full max-w-none leading-relaxed">
              <ReactMarkdown
                components={{
                  code: ({ className, children }) => {
                    // Check if this is a code block (not inline code)
                    const isCodeBlock = className?.includes('language-');
                    if (isCodeBlock) {
                      return <CodeBlock className={className}>{children}</CodeBlock>;
                    }
                    return <code className="bg-muted rounded px-1.5 py-0.5">{children}</code>;
                  },
                  p: ({ children }) => (
                    <p className="mb-4">{children}</p>
                  ),
                  ul: ({ children }) => (
                    <ul className="my-3 ml-4 list-disc space-y-2">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="my-3 ml-4 list-decimal space-y-2">{children}</ol>
                  ),
                  li: ({ children }) => (
                    <li className="pl-1">{children}</li>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="mt-4 border-l-4 border-primary/20 pl-4 italic">{children}</blockquote>
                  )
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
            {renderAttachments()}
          </>
        )}
      </div>
    </div>
  )
} 