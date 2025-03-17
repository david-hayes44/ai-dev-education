"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export interface TOCItem {
  id: string;
  title: string;
  level: number;
  children?: TOCItem[];
}

interface TableOfContentsProps {
  items?: TOCItem[];
  autoGenerate?: boolean;
  contentSelector?: string;
  className?: string;
}

/**
 * TableOfContents component that can either use manually defined items or auto-generate from page content
 * 
 * @param items Optional pre-defined TOC items
 * @param autoGenerate Whether to auto-generate TOC from page headings (defaults to false)
 * @param contentSelector CSS selector for the content container to scan for headings (defaults to '.prose')
 * @param className Additional classes to apply to the container
 */
export function TableOfContents({ 
  items, 
  autoGenerate = false, 
  contentSelector = '.prose',
  className 
}: TableOfContentsProps) {
  const [tocItems, setTocItems] = useState<TOCItem[]>(items || []);
  const [activeId, setActiveId] = useState<string>("");

  // Auto-generate TOC items from page headings if enabled
  useEffect(() => {
    if (autoGenerate && !items) {
      const contentElement = document.querySelector(contentSelector);
      if (contentElement) {
        const headings = contentElement.querySelectorAll('h2, h3, h4, h5, h6');
        const newItems: TOCItem[] = [];
        
        headings.forEach((heading) => {
          // Get heading level (h2 = 2, h3 = 3, etc.)
          const level = parseInt(heading.tagName.charAt(1));
          
          // Get or generate ID
          let id = heading.id;
          if (!id) {
            // Generate ID from heading text if none exists
            id = heading.textContent?.toLowerCase()
              .replace(/\s+/g, '-')
              .replace(/[^\w-]/g, '') || `heading-${newItems.length}`;
            heading.id = id;
          }
          
          const item: TOCItem = {
            id,
            title: heading.textContent || '',
            level,
          };
          
          // Add to items array
          newItems.push(item);
        });
        
        // Convert flat list to hierarchical structure
        const hierarchicalItems = buildHierarchy(newItems);
        setTocItems(hierarchicalItems);
      }
    }
  }, [autoGenerate, contentSelector, items]);

  // Track active section based on scroll position
  useEffect(() => {
    if (tocItems.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-100px 0px -66%', threshold: 0 }
    );

    // Observe all section headings
    const ids = getAllIds(tocItems);
    ids.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      ids.forEach((id) => {
        const element = document.getElementById(id);
        if (element) {
          observer.unobserve(element);
        }
      });
    };
  }, [tocItems]);

  // Build hierarchical structure from flat list
  const buildHierarchy = (items: TOCItem[]): TOCItem[] => {
    const result: TOCItem[] = [];
    const stack: TOCItem[] = [];
    
    items.forEach((item) => {
      // Reset stack if we find a level 2 heading (h2)
      if (item.level === 2) {
        stack.length = 0;
        result.push(item);
        stack.push(item);
        return;
      }
      
      // Find parent
      while (stack.length > 0 && stack[stack.length - 1].level >= item.level) {
        stack.pop();
      }
      
      if (stack.length === 0) {
        // No parent found, add to top level
        result.push(item);
        stack.push(item);
      } else {
        // Add as child to parent
        const parent = stack[stack.length - 1];
        if (!parent.children) parent.children = [];
        parent.children.push(item);
        stack.push(item);
      }
    });
    
    return result;
  };

  // Get all IDs from hierarchical structure
  const getAllIds = (items: TOCItem[]): string[] => {
    const ids: string[] = [];
    
    const extractIds = (items: TOCItem[]) => {
      items.forEach((item) => {
        ids.push(item.id);
        if (item.children) {
          extractIds(item.children);
        }
      });
    };
    
    extractIds(items);
    return ids;
  };

  // Render TOC items recursively
  const renderItems = (items: TOCItem[]) => {
    return (
      <ul className="space-y-1 text-sm">
        {items.map((item) => (
          <li key={item.id}>
            <a 
              href={`#${item.id}`}
              className={cn(
                "text-muted-foreground hover:text-primary transition-colors block py-1",
                activeId === item.id && "text-primary font-medium"
              )}
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

  if (tocItems.length === 0) {
    return null;
  }

  return (
    <div className={cn("p-4 border rounded-lg sticky top-20", className)}>
      <p className="font-medium mb-3">On this page</p>
      {renderItems(tocItems)}
    </div>
  );
}

// Export a simpler version for direct use in content pages
export function SimpleTOC() {
  return (
    <div className="hidden lg:block">
      <TableOfContents autoGenerate={true} />
    </div>
  );
} 