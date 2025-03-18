'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { DeepLinkDetector } from '@/lib/hooks/use-deep-linking';
import { TableOfContents } from './table-of-contents';

interface ContentPageProps {
  children: ReactNode;
  showTableOfContents?: boolean;
  className?: string;
}

export function ContentPage({
  children,
  showTableOfContents = true,
  className
}: ContentPageProps) {
  return (
    <div className={cn("relative", className)}>
      {/* Install DeepLinkDetector for section detection and linking */}
      <DeepLinkDetector />
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Main content area */}
        <div className="md:col-span-9">
          {children}
        </div>
        
        {/* Table of contents sidebar */}
        {showTableOfContents && (
          <div className="hidden md:block md:col-span-3">
            <div className="sticky top-20">
              <TableOfContents />
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 