/**
 * Simple Puppeteer API client for browser automation
 * 
 * This module provides functions to interact with the simple Puppeteer server
 * for browser automation capabilities within the AI-Dev Education Platform.
 */

// Configuration for the Puppeteer server
const PUPPETEER_API_URL = process.env.NEXT_PUBLIC_PUPPETEER_API_URL || 'http://localhost:5004';

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
  message?: string;
}

/**
 * Navigate to a specific URL
 * @param url The URL to navigate to
 */
export async function navigateTo(url: string): Promise<BrowserResponse> {
  return callApiEndpoint('/browser/navigate', { url });
}

/**
 * Click an element using a selector
 * @param selector The CSS selector to find the element
 */
export async function clickElement(selector: string): Promise<BrowserResponse> {
  return callApiEndpoint('/browser/click', { selector });
}

/**
 * Fill out an input element with text
 * @param selector The CSS selector to find the input element
 * @param value The text to type
 */
export async function typeText(selector: string, value: string): Promise<BrowserResponse> {
  return callApiEndpoint('/browser/type', { selector, text: value });
}

/**
 * Extract text from an element
 * @param selector The CSS selector to find the element
 */
export async function extractText(selector: string): Promise<BrowserResponse> {
  return callApiEndpoint('/browser/extract', { selector });
}

/**
 * Take a screenshot of the current page or element
 */
export async function takeScreenshot(): Promise<BrowserResponse> {
  return callApiEndpoint('/browser/screenshot', {});
}

/**
 * Initialize the browser
 */
export async function initBrowser(): Promise<BrowserResponse> {
  return callApiEndpoint('/browser/init', {});
}

/**
 * Get server status
 */
export async function getStatus(): Promise<BrowserResponse> {
  try {
    const response = await fetch(`${PUPPETEER_API_URL}/status`);
    
    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }
    
    const data = await response.json();
    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Error checking status:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Call an API endpoint on the Puppeteer server
 */
async function callApiEndpoint(endpoint: string, data: Record<string, unknown>): Promise<BrowserResponse> {
  try {
    const response = await fetch(`${PUPPETEER_API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Server error: ${response.status} ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error calling ${endpoint}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
} 