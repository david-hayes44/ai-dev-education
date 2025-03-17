import React from "react";
import Link from "next/link";
import { ArrowRight, Lightbulb, Info, AlertTriangle, CheckCircle } from "lucide-react";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  language: string;
  code: string;
  filename?: string;
  highlightLines?: number[];
}

export function CodeBlock({ language, code, filename, highlightLines }: CodeBlockProps) {
  return (
    <div className="my-6 rounded-lg overflow-hidden border">
      {filename && (
        <div className="bg-muted px-4 py-2 text-sm border-b">
          {filename}
        </div>
      )}
      <pre className={`p-4 overflow-x-auto bg-black text-white language-${language}`}>
        <code>{code}</code>
      </pre>
    </div>
  );
}

interface CalloutProps {
  type: "info" | "warning" | "tip" | "success";
  title?: string;
  children: React.ReactNode;
}

export function Callout({ type, title, children }: CalloutProps) {
  const icons = {
    info: <Info className="h-4 w-4" />,
    warning: <AlertTriangle className="h-4 w-4" />,
    tip: <Lightbulb className="h-4 w-4" />,
    success: <CheckCircle className="h-4 w-4" />
  };

  const styles = {
    info: "border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950",
    warning: "border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950",
    tip: "border-purple-200 bg-purple-50 dark:border-purple-900 dark:bg-purple-950",
    success: "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950"
  };

  return (
    <div className={cn("my-6 rounded-lg border p-4", styles[type])}>
      <div className="flex items-start">
        <div className="mr-3 mt-1">{icons[type]}</div>
        <div>
          {title && <p className="font-medium mb-1">{title}</p>}
          <div className="text-sm">{children}</div>
        </div>
      </div>
    </div>
  );
}

interface RelatedContentProps {
  links: Array<{
    title: string;
    href: string;
    description?: string;
  }>;
}

export function RelatedContent({ links }: RelatedContentProps) {
  return (
    <div className="mt-12 border-t pt-8">
      <h3 className="text-xl font-semibold mb-4">Related Content</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {links.map((link, i) => (
          <Link 
            key={i} 
            href={link.href}
            className="group block p-4 border rounded-lg hover:border-primary hover:bg-accent transition-colors"
          >
            <h4 className="font-medium group-hover:text-primary">{link.title}</h4>
            {link.description && <p className="text-sm text-muted-foreground mt-1">{link.description}</p>}
            <div className="mt-2 text-sm text-primary flex items-center">
              <span>Read more</span>
              <ArrowRight className="ml-1 h-3 w-3" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export interface TableOfContentsItem {
  id: string;
  title: string;
  level: number;
  children?: TableOfContentsItem[];
}

interface TableOfContentsProps {
  items: TableOfContentsItem[];
}

export function TableOfContents({ items }: TableOfContentsProps) {
  const renderItems = (items: TableOfContentsItem[]) => {
    return (
      <ul className="space-y-1 text-sm">
        {items.map((item) => (
          <li key={item.id}>
            <a 
              href={`#${item.id}`}
              className="text-muted-foreground hover:text-primary transition-colors block py-1"
            >
              {item.title}
            </a>
            {item.children && item.children.length > 0 && (
              <ul className="pl-4 space-y-1 mt-1">
                {renderItems(item.children)}
              </ul>
            )}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="p-4 border rounded-lg sticky top-20">
      <p className="font-medium mb-3">On this page</p>
      {renderItems(items)}
    </div>
  );
}

interface ContentTemplateProps {
  title: string;
  description?: string;
  metadata: {
    difficulty: "beginner" | "intermediate" | "advanced";
    timeToComplete?: string;
    keywords?: string[];
    prerequisites?: Array<{
      title: string;
      href: string;
    }>;
  };
  tableOfContents?: TableOfContentsItem[];
  relatedContent?: Array<{
    title: string;
    href: string;
    description?: string;
  }>;
  children: React.ReactNode;
}

export function ContentTemplate({
  title,
  description,
  metadata,
  tableOfContents,
  relatedContent,
  children
}: ContentTemplateProps) {
  // Render difficulty badge
  const difficultyColors = {
    beginner: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
    intermediate: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
    advanced: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100"
  };

  return (
    <>
      <PageHeader title={title} description={description} />
      <Container className="py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Sidebar with table of contents */}
          {tableOfContents && (
            <div className="lg:col-span-3 lg:block hidden">
              <TableOfContents items={tableOfContents} />
            </div>
          )}

          {/* Main content area */}
          <div className={cn(
            "lg:col-span-9",
            !tableOfContents && "lg:col-span-12"
          )}>
            {/* Metadata section */}
            <div className="flex flex-wrap gap-2 items-center mb-8 pb-6 border-b">
              <span className={cn(
                "px-2 py-1 rounded-full text-xs font-medium",
                difficultyColors[metadata.difficulty]
              )}>
                {metadata.difficulty.charAt(0).toUpperCase() + metadata.difficulty.slice(1)}
              </span>
              
              {metadata.timeToComplete && (
                <span className="text-xs text-muted-foreground">
                  {metadata.timeToComplete} to complete
                </span>
              )}
            </div>

            {/* Prerequisites if any */}
            {metadata.prerequisites && metadata.prerequisites.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-medium mb-2">Prerequisites</h3>
                <ul className="space-y-1">
                  {metadata.prerequisites.map((prereq, i) => (
                    <li key={i}>
                      <Link 
                        href={prereq.href}
                        className="text-sm text-primary hover:underline"
                      >
                        {prereq.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Main content */}
            <div className="prose prose-lg dark:prose-invert max-w-none">
              {children}
            </div>

            {/* Related content section */}
            {relatedContent && relatedContent.length > 0 && (
              <RelatedContent links={relatedContent} />
            )}
          </div>
        </div>
      </Container>
    </>
  );
} 