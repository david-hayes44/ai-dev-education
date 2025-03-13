/**
 * Puppeteer MCP client for browser automation
 * 
 * This module provides functions to interact with the Puppeteer MCP server
 * for browser automation capabilities within the AI-Dev Education Platform.
 */

// Configuration for the Puppeteer MCP server
const PUPPETEER_MCP_URL = process.env.NEXT_PUBLIC_PUPPETEER_MCP_URL || 'http://localhost:5004';

/**
 * Browser automation action types
 */
export enum BrowserAction {
  NAVIGATE = 'navigate',
  CLICK = 'click',
  TYPE = 'type',
  SCREENSHOT = 'screenshot',
  EXTRACT_TEXT = 'extractText',
  EVALUATE = 'evaluate',
}

/**
 * Interface for browser automation requests
 */
export interface BrowserRequest {
  action: BrowserAction;
  params: Record<string, unknown>;
}

/**
 * Interface for browser automation responses
 */
export interface BrowserResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}

/**
 * Navigate to a specific URL
 * @param url The URL to navigate to
 */
export async function navigateTo(url: string): Promise<BrowserResponse> {
  return sendBrowserRequest({
    action: BrowserAction.NAVIGATE,
    params: { url }
  });
}

/**
 * Click an element using a selector
 * @param selector The CSS selector to find the element
 */
export async function clickElement(selector: string): Promise<BrowserResponse> {
  return sendBrowserRequest({
    action: BrowserAction.CLICK,
    params: { selector }
  });
}

/**
 * Type text into an input element
 * @param selector The CSS selector to find the input element
 * @param text The text to type
 */
export async function typeText(selector: string, text: string): Promise<BrowserResponse> {
  return sendBrowserRequest({
    action: BrowserAction.TYPE,
    params: { selector, text }
  });
}

/**
 * Extract text from an element
 * @param selector The CSS selector to find the element
 */
export async function extractText(selector: string): Promise<BrowserResponse> {
  return sendBrowserRequest({
    action: BrowserAction.EXTRACT_TEXT,
    params: { selector }
  });
}

/**
 * Take a screenshot of the current page
 * @param path Optional path to save the screenshot (defaults to timestamp)
 */
export async function takeScreenshot(path?: string): Promise<BrowserResponse> {
  return sendBrowserRequest({
    action: BrowserAction.SCREENSHOT,
    params: { path: path || `screenshot_${Date.now()}.png` }
  });
}

/**
 * Evaluate JavaScript code in the context of the page
 * @param code The JavaScript code to evaluate
 */
export async function evaluateCode(code: string): Promise<BrowserResponse> {
  return sendBrowserRequest({
    action: BrowserAction.EVALUATE,
    params: { code }
  });
}

/**
 * Send a request to the Puppeteer MCP server
 * @param request The browser automation request
 */
async function sendBrowserRequest(request: BrowserRequest): Promise<BrowserResponse> {
  try {
    const response = await fetch(`${PUPPETEER_MCP_URL}/browser`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Server error: ${response.status} ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending browser request:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
} 