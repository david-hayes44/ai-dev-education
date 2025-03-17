import { NextRequest, NextResponse } from "next/server";
import { getSiteContentIndex, searchContent, getCurrentPageContent } from "@/lib/content-indexing";

/**
 * API route for searching site content
 * GET /api/content/search?q=query
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const path = searchParams.get("path");
    
    // If no query or path provided, return error
    if (!query && !path) {
      return NextResponse.json(
        { error: "Missing required parameters. Use 'q' for search or 'path' for current page content." },
        { status: 400 }
      );
    }
    
    // Get site content index
    const contentIndex = await getSiteContentIndex();
    
    if (query) {
      // Search content based on query
      const results = searchContent(query, contentIndex);
      
      return NextResponse.json({
        query,
        results: results.map(node => ({
          path: node.path,
          title: node.title,
          description: node.description,
          summary: node.summary || node.content.substring(0, 150) + "...",
          keywords: node.keywords,
        })),
      });
    } else if (path) {
      // Get content for current page
      const content = getCurrentPageContent(path, contentIndex);
      
      if (!content) {
        return NextResponse.json(
          { error: `No content found for path: ${path}` },
          { status: 404 }
        );
      }
      
      const pageNode = contentIndex.pathToNodeMap.get(path);
      
      return NextResponse.json({
        path,
        content,
        title: pageNode?.title,
        description: pageNode?.description,
        keywords: pageNode?.keywords,
        relatedPaths: pageNode?.relatedPaths,
      });
    }
    
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error in content API:", error);
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 