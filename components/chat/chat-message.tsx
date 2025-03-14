"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { User, Bot, Code, Book, Tag } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { MessageMetadata } from "@/lib/chat-service"

export type MessageType = "user" | "assistant"

interface ChatMessageProps {
  type: MessageType
  content: string
  metadata?: MessageMetadata
}

export function ChatMessage({ type, content, metadata }: ChatMessageProps) {
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
          structuredContent
        ) : (
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
        )}
      </div>
    </div>
  )
} 