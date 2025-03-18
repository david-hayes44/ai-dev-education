'use client';

import { useEffect, useState } from 'react';
import {
  extractPageSections,
  handleInitialDeepLink,
  injectHighlightStyles,
  navigateToSection,
  PageSection,
  getCurrentSection
} from '../deep-linking';

/**
 * Custom hook for deep linking functionality
 * Provides utilities for section navigation, highlighting, and tracking
 */
export function useDeepLinking() {
  const [sections, setSections] = useState<PageSection[]>([]);
  const [currentSection, setCurrentSection] = useState<PageSection | null>(null);
  
  // Initialize deep linking when component mounts
  useEffect(() => {
    // Add highlight styles
    injectHighlightStyles();
    
    // Extract page sections
    const pageSections = extractPageSections();
    setSections(pageSections);
    
    // Handle initial deep link (from URL hash)
    handleInitialDeepLink();
    
    // Set up scroll listener to track current section
    const handleScroll = () => {
      const section = getCurrentSection();
      setCurrentSection(section);
    };
    
    // Call once to initialize
    handleScroll();
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  // Navigate to a section
  const goToSection = (sectionId: string) => {
    navigateToSection(sectionId);
  };
  
  return {
    sections,
    currentSection,
    goToSection
  };
}

/**
 * Section navigation component
 * Renders a list of section links for the current page
 */
export function SectionNavigation() {
  const { sections, currentSection, goToSection } = useDeepLinking();
  
  if (sections.length <= 1) {
    return null;
  }
  
  return (
    <nav className="section-navigation my-4 p-3 border rounded-md">
      <h3 className="font-medium text-sm mb-2">On This Page</h3>
      <ul className="space-y-1">
        {sections.map((section) => (
          <li key={section.id}>
            <button
              onClick={() => goToSection(section.id)}
              className={`
                text-xs w-full text-left px-2 py-1 rounded-sm
                hover:bg-accent/20
                ${currentSection?.id === section.id ? 'bg-accent/30 font-medium' : ''}
                ${section.level > 1 ? `ml-${Math.min(section.level - 1, 4) * 2}` : ''}
              `}
            >
              {section.title}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/**
 * Deep link detector and activator
 * This component should be placed at the top level of content pages
 * to ensure deep linking functionality is available
 */
export function DeepLinkDetector() {
  useDeepLinking();
  
  // This component doesn't render anything, it just sets up the deep linking
  return null;
} 