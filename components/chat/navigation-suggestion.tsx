"use client"

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ExternalLink, ChevronRight } from "lucide-react";
import Link from 'next/link';

export interface NavigationSuggestion {
  title: string;
  path: string;
  description?: string;
  confidence?: number;
}

interface NavigationSuggestionCardProps {
  suggestion: NavigationSuggestion;
}

export function NavigationSuggestionCard({ suggestion }: NavigationSuggestionCardProps) {
  const isExternalLink = suggestion.path.startsWith('http');
  
  return (
    <Card className="p-4 flex flex-col gap-2 rounded-lg shadow-sm">
      <div className="flex justify-between items-start">
        <h3 className="font-medium text-sm">{suggestion.title}</h3>
        {suggestion.confidence !== undefined && (
          <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
            {Math.round(suggestion.confidence * 100)}% match
          </span>
        )}
      </div>
      
      {suggestion.description && (
        <p className="text-xs text-muted-foreground line-clamp-2">
          {suggestion.description}
        </p>
      )}
      
      <div className="mt-2">
        {isExternalLink ? (
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-8"
            asChild
          >
            <a href={suggestion.path} target="_blank" rel="noopener noreferrer">
              Visit Page
              <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-8"
            asChild
          >
            <Link href={suggestion.path}>
              Go to page
              <ChevronRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        )}
      </div>
    </Card>
  );
}

interface NavigationSuggestionsProps {
  suggestions: NavigationSuggestion[];
}

export function NavigationSuggestions({ suggestions }: NavigationSuggestionsProps) {
  const [expanded, setExpanded] = useState<boolean>(false);
  
  // Show max 3 suggestions when collapsed
  const visibleSuggestions = expanded ? suggestions : suggestions.slice(0, 2);
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium">Navigation Suggestions</h3>
        {suggestions.length > 2 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? 'Show less' : `Show all (${suggestions.length})`}
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {visibleSuggestions.map((suggestion, index) => (
          <NavigationSuggestionCard key={index} suggestion={suggestion} />
        ))}
      </div>
    </div>
  );
}

export default NavigationSuggestions; 