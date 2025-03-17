import { TableOfContentsItem } from "@/components/content/ContentTemplate";

/**
 * Extracts table of contents from HTML content
 * @param content HTML content as string
 * @returns Array of TableOfContentsItem objects
 */
export function extractTableOfContents(content: string): TableOfContentsItem[] {
  // This is a simplified implementation
  // In production, you'd use a more robust HTML parser
  const headingRegex = /<h([2-4])\s+id="([^"]+)"[^>]*>(.*?)<\/h\1>/g;
  const matches = [...content.matchAll(headingRegex)];
  
  const items: TableOfContentsItem[] = [];
  const levelMap: Record<number, TableOfContentsItem[]> = {};
  
  matches.forEach((match) => {
    const level = parseInt(match[1], 10);
    const id = match[2];
    const title = match[3].replace(/<[^>]+>/g, ''); // Strip HTML tags from title
    
    const item: TableOfContentsItem = { id, title, level };
    
    if (level === 2) {
      // Top-level heading
      items.push(item);
      levelMap[2] = items;
    } else {
      // Sub-level heading
      const parentLevel = level - 1;
      const parentList = levelMap[parentLevel];
      
      if (parentList && parentList.length > 0) {
        const parent = parentList[parentList.length - 1];
        if (!parent.children) {
          parent.children = [];
        }
        parent.children.push(item);
        
        if (!levelMap[level]) {
          levelMap[level] = [];
        }
        levelMap[level].push(item);
      }
    }
  });
  
  return items;
}

/**
 * Generates metadata for content
 * @param params Metadata parameters
 * @returns Metadata object
 */
export function generateMetadata({
  title,
  description,
  keywords = [],
  section,
}: {
  title: string;
  description: string;
  keywords?: string[];
  section?: string;
}) {
  const baseKeywords = ["AI development", "MCP", "AI-assisted coding"];
  const allKeywords = [...baseKeywords, ...keywords].join(", ");
  
  return {
    title: title,
    description: description,
    keywords: allKeywords,
    openGraph: {
      title: `${title} | AI Dev Education`,
      description: description,
      type: 'article',
      url: `https://ai-dev-education.com/${section ? `${section}/` : ''}`,
      images: [
        {
          url: 'https://ai-dev-education.com/og-image.jpg',
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | AI Dev Education`,
      description: description,
      images: ['https://ai-dev-education.com/og-image.jpg'],
    },
  };
}

/**
 * Creates a slug from a string
 * @param text Text to convert to slug
 * @returns Slug string
 */
export function createSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/--+/g, '-') // Replace multiple hyphens with single hyphen
    .trim();
}

/**
 * Formats an ISO date string to a readable format
 * @param isoString ISO date string
 * @returns Formatted date string (e.g., "March 15, 2023")
 */
export function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Calculates the estimated reading time for content
 * @param content Content as string
 * @returns Reading time in minutes
 */
export function calculateReadingTime(content: string): number {
  // Average reading speed is about 200-250 words per minute
  const wordsPerMinute = 225;
  const textOnly = content.replace(/<[^>]+>/g, ''); // Strip HTML tags
  const wordCount = textOnly.split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / wordsPerMinute);
  
  return readingTime;
} 