/**
 * Deep Linking Utilities
 * 
 * This module provides functionality for deep linking to specific sections
 * within content pages, including section identification and highlighting.
 */

/**
 * Interface for a section in a page
 */
export interface PageSection {
  id: string;
  title: string;
  element?: HTMLElement;
  level: number; // Heading level (1-6)
  content?: string;
  offset?: number; // Offset from top of page
}

/**
 * Extract all sections from the current page
 * This is a client-side utility to identify heading sections
 */
export function extractPageSections(): PageSection[] {
  if (typeof window === 'undefined') {
    return [];
  }
  
  // Query all headings in the content area
  const contentArea = document.querySelector('main') || document.body;
  const headings = contentArea.querySelectorAll('h1, h2, h3, h4, h5, h6');
  
  const sections: PageSection[] = [];
  
  headings.forEach((heading) => {
    const headingElement = heading as HTMLElement;
    const id = headingElement.id || createIdFromHeading(headingElement.textContent || '');
    
    // Ensure the heading has an ID for linking
    if (!headingElement.id) {
      headingElement.id = id;
    }
    
    // Get heading level
    const level = parseInt(headingElement.tagName.substring(1), 10);
    
    // Extract content - gets text of all elements until the next heading
    let content = '';
    let currentNode = headingElement.nextElementSibling;
    
    while (currentNode && !currentNode.tagName.match(/^H[1-6]$/)) {
      content += currentNode.textContent + ' ';
      currentNode = currentNode.nextElementSibling;
    }
    
    sections.push({
      id,
      title: headingElement.textContent || '',
      element: headingElement,
      level,
      content: content.trim(),
      offset: headingElement.getBoundingClientRect().top + window.scrollY
    });
  });
  
  return sections;
}

/**
 * Create a URL-friendly ID from a heading text
 */
export function createIdFromHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove non-word characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/--+/g, '-') // Replace multiple hyphens with single hyphen
    .trim();
}

/**
 * Navigate to a specific section by ID
 * Includes smooth scrolling and highlighting
 */
export function navigateToSection(sectionId: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  // Find the section element
  const element = document.getElementById(sectionId);
  
  if (!element) {
    console.warn(`Section with ID "${sectionId}" not found`);
    return;
  }
  
  // Scroll to the element with a slight offset
  const offset = 80; // Account for fixed headers
  const elementPosition = element.getBoundingClientRect().top + window.scrollY;
  
  window.scrollTo({
    top: elementPosition - offset,
    behavior: 'smooth'
  });
  
  // Highlight the section temporarily
  highlightElement(element);
}

/**
 * Temporarily highlight an element to draw user attention
 */
export function highlightElement(element: HTMLElement): void {
  // Add a highlight class
  element.classList.add('section-highlight');
  
  // Remove the highlight after a delay
  setTimeout(() => {
    element.classList.remove('section-highlight');
  }, 2000);
}

/**
 * Get the current section based on scroll position
 */
export function getCurrentSection(): PageSection | null {
  if (typeof window === 'undefined') {
    return null;
  }
  
  const sections = extractPageSections();
  if (sections.length === 0) {
    return null;
  }
  
  // Get current scroll position with a small offset
  const scrollPosition = window.scrollY + 100;
  
  // Find the current section
  for (let i = sections.length - 1; i >= 0; i--) {
    const sectionOffset = sections[i].offset;
    // Check if offset exists and is less than or equal to scroll position
    if (sectionOffset !== undefined && sectionOffset <= scrollPosition) {
      return sections[i];
    }
  }
  
  // Default to first section if not found
  return sections[0];
}

/**
 * Deep link to a specific section using the URL hash
 * This should be called when a component mounts to handle initial deep linking
 */
export function handleInitialDeepLink(): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  // Get the hash from the URL (if any)
  const hash = window.location.hash.substring(1);
  
  if (hash) {
    // Delay slightly to ensure DOM is fully loaded
    setTimeout(() => {
      navigateToSection(hash);
    }, 100);
  }
}

/**
 * Add CSS to enable section highlighting
 * This should be called once to add the necessary styles
 */
export function injectHighlightStyles(): void {
  if (typeof window === 'undefined' || document.getElementById('section-highlight-styles')) {
    return;
  }
  
  const style = document.createElement('style');
  style.id = 'section-highlight-styles';
  style.textContent = `
    .section-highlight {
      animation: section-highlight-animation 2s ease-out;
    }
    
    @keyframes section-highlight-animation {
      0% {
        background-color: rgba(var(--primary-rgb), 0.2);
        outline: 2px solid rgb(var(--primary-rgb));
      }
      70% {
        background-color: rgba(var(--primary-rgb), 0.1);
        outline: 2px solid rgb(var(--primary-rgb));
      }
      100% {
        background-color: transparent;
        outline: none;
      }
    }
  `;
  
  document.head.appendChild(style);
} 