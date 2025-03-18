'use client';

import { useDeepLinking } from "@/lib/hooks/use-deep-linking";
import { cn } from "@/lib/utils";

interface TableOfContentsProps {
  className?: string;
}

export function TableOfContents({ className }: TableOfContentsProps) {
  const { sections, currentSection, goToSection } = useDeepLinking();
  
  if (sections.length <= 1) {
    return null;
  }
  
  return (
    <div className={cn("relative space-y-1", className)}>
      <div className="sticky top-20">
        <h4 className="font-medium text-sm mb-2">On This Page</h4>
        <ul className="space-y-1">
          {sections.map((section) => (
            <li key={section.id}>
              <button
                onClick={() => goToSection(section.id)}
                className={cn(
                  "text-sm w-full text-left py-1 px-2 rounded-sm transition-colors",
                  "hover:bg-accent/20",
                  currentSection?.id === section.id 
                    ? "bg-accent/30 font-medium text-primary" 
                    : "text-muted-foreground",
                  section.level === 1 ? "font-medium" : "",
                  section.level > 1 ? `ml-${Math.min(section.level - 1, 3) * 2}` : ""
                )}
              >
                {section.title}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
} 