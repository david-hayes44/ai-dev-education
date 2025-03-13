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
export async function navigateTo(url: string) {
  return callMcpTool('puppeteer_navigate', { url });
}

/**
 * Click an element using a selector
 * @param selector The CSS selector to find the element
 */
export async function clickElement(selector: string) {
  return callMcpTool('puppeteer_click', { selector });
}

/**
 * Fill out an input element with text
 * @param selector The CSS selector to find the input element
 * @param value The text to type
 */
export async function typeText(selector: string, value: string) {
  return callMcpTool('puppeteer_fill', { selector, value });
}

/**
 * Extract text from an element
 * This uses JavaScript evaluation to get the text content
 * @param selector The CSS selector to find the element
 */
export async function extractText(selector: string) {
  return callMcpTool('puppeteer_evaluate', { 
    script: `return document.querySelector("${selector}")?.textContent || ""` 
  });
}

/**
 * Take a screenshot of the current page or element
 * @param name Name to identify the screenshot
 * @param selector Optional selector for element to screenshot
 * @param width Optional width for the screenshot
 * @param height Optional height for the screenshot
 */
export async function takeScreenshot(name: string = `screenshot_${Date.now()}`, selector?: string, width?: number, height?: number) {
  return callMcpTool('puppeteer_screenshot', { 
    name,
    selector,
    width: width || 800,
    height: height || 600
  });
}

/**
 * Evaluate JavaScript code in the context of the page
 * @param script The JavaScript code to evaluate
 */
export async function evaluateCode(script: string) {
  return callMcpTool('puppeteer_evaluate', { script });
}

/**
 * Hover over an element
 * @param selector The CSS selector for the element to hover
 */
export async function hoverElement(selector: string) {
  return callMcpTool('puppeteer_hover', { selector });
}

/**
 * Select an option from a dropdown
 * @param selector The CSS selector for the select element
 * @param value The value to select
 */
export async function selectOption(selector: string, value: string) {
  return callMcpTool('puppeteer_select', { selector, value });
}

/**
 * Call an MCP tool on the Puppeteer server
 * @param tool The name of the tool to call
 * @param args The arguments for the tool
 */
async function callMcpTool(tool: string, args: Record<string, unknown>) {
  try {
    const response = await fetch(`${PUPPETEER_MCP_URL}/mcp/tools/${tool}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ args }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Server error: ${response.status} ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error calling ${tool}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
} 