# Puppeteer Integration Guide

## Overview

This guide provides comprehensive documentation for setting up and using Puppeteer browser automation within the AI-Dev Education Platform. The implementation includes a simple Express-based Puppeteer server and a client interface that allows for various browser automation tasks.

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Architecture](#architecture)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Running the Puppeteer Server](#running-the-puppeteer-server)
6. [Available API Endpoints](#available-api-endpoints)
7. [Client Integration](#client-integration)
8. [Usage Examples](#usage-examples)
9. [Troubleshooting](#troubleshooting)
10. [Advanced Usage](#advanced-usage)

## System Requirements

- Node.js 16.x or higher
- Chrome or Chromium browser installed
- Windows, macOS, or Linux operating system

## Architecture

The Puppeteer integration consists of two main components:

1. **Puppeteer Server**: A lightweight Express server that manages a Chrome browser instance via Puppeteer
2. **Client Library**: A TypeScript client that communicates with the server via REST API

### Technology Stack

- **Server**: Express.js, Puppeteer
- **Client**: TypeScript, Fetch API
- **UI**: React with Next.js

## Installation

### Dependencies

The following dependencies are required:

```bash
npm install express puppeteer cors
```

These are already included in the project's package.json.

## Configuration

### Server Configuration

The Puppeteer server is configured through a simple JavaScript file. The default configuration runs the server on port 5004 with a visible (non-headless) browser.

Key configuration options in `simple-puppeteer-server.js`:

```javascript
// Browser launch options
browser = await puppeteer.launch({
  headless: false,  // Set to true for production/headless mode
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});

// Server port
const port = 5004;
```

### Client Configuration

The client library (`lib/puppeteer-mcp.ts`) is configured through environment variables:

```typescript
// Default server URL
const PUPPETEER_API_URL = process.env.NEXT_PUBLIC_PUPPETEER_API_URL || 'http://localhost:5004';
```

To change the server URL, set the `NEXT_PUBLIC_PUPPETEER_API_URL` environment variable.

## Running the Puppeteer Server

### Method 1: Using Node directly

```bash
node simple-puppeteer-server.js
```

### Method 2: Using Docker

```bash
docker-compose up puppeteer-server
```

The server will start and automatically initialize a browser instance. You should see the following output:

```
Simple Puppeteer server listening at http://localhost:5004
Initializing browser...
Browser initialized successfully
```

## Available API Endpoints

The Puppeteer server exposes the following REST API endpoints:

| Endpoint | Method | Description | Parameters |
|----------|--------|-------------|------------|
| `/status` | GET | Get server and browser status | None |
| `/browser/init` | POST | Initialize browser | None |
| `/browser/navigate` | POST | Navigate to a URL | `{ url: string }` |
| `/browser/click` | POST | Click an element | `{ selector: string }` |
| `/browser/type` | POST | Type text into an input | `{ selector: string, text: string }` |
| `/browser/extract` | POST | Extract text from an element | `{ selector: string }` |
| `/browser/screenshot` | POST | Take a screenshot | None |
| `/browser/execute` | POST | Execute JavaScript code | `{ code: string }` |

All endpoints return a JSON response with the following structure:

```json
{
  "success": true|false,
  "message": "Human-readable message",
  "data": "Optional data payload"
}
```

## Client Integration

The client library provides TypeScript functions to interact with the Puppeteer server:

```typescript
import { 
  navigateTo, 
  clickElement, 
  typeText, 
  extractText, 
  takeScreenshot,
  initBrowser,
  getStatus
} from "@/lib/puppeteer-mcp";
```

### Basic Usage

```typescript
// Initialize browser
await initBrowser();

// Navigate to a URL
await navigateTo("https://example.com");

// Click an element
await clickElement("#submit-button");

// Type text
await typeText("#search-input", "Hello world");

// Extract text
const result = await extractText(".content");

// Take screenshot
const screenshot = await takeScreenshot();
```

## Usage Examples

### Basic Navigation and Interaction

```typescript
// Initialize browser if not already running
if (!(await getStatus()).data?.browser === "running") {
  await initBrowser();
}

// Navigate to the website
await navigateTo("https://new-ai-dev-education.vercel.app/");

// Click on a navigation link
await clickElement("nav a[href='/concepts']");

// Extract the heading text
const headingText = await extractText("h1");
console.log("Page heading:", headingText.data);

// Take a screenshot
const screenshot = await takeScreenshot();
```

### Advanced JavaScript Execution

For more complex operations, you can use the Debug tab in the browser automation interface to execute custom JavaScript:

```javascript
// Get all links on the page
const links = Array.from(document.querySelectorAll('a')).map(a => ({
  href: a.href,
  text: a.textContent?.trim()
}));
return links;
```

## Troubleshooting

### Common Issues

1. **Browser fails to launch**
   - Ensure Chrome is installed on your system
   - Check for adequate permissions
   - Try running with `--no-sandbox` flag (already set in the default config)

2. **Connection refused errors**
   - Verify the server is running on the expected port
   - Check if any firewall is blocking the connection

3. **Element not found errors**
   - Verify the selector is correct
   - The element might be in an iframe or not yet loaded
   - Try using a wait or delay before interacting with elements

### Debugging

For detailed debugging, check the server console output. You can also use the browser automation interface's Debug tab to:

1. Execute custom JavaScript
2. Explore the DOM structure
3. Inspect element styles

## Advanced Usage

### Custom JavaScript Execution

The `/browser/execute` endpoint allows execution of arbitrary JavaScript in the browser context. This enables complex operations beyond the basic API:

```javascript
// Example: Extract all images with their dimensions
const images = Array.from(document.querySelectorAll('img')).map(img => ({
  src: img.src,
  alt: img.alt,
  width: img.width,
  height: img.height
}));
return images;
```

### DOM Structure Analysis

You can analyze the page structure using the DOM Structure feature:

```javascript
function getNodePath(node, maxDepth = 2, currentDepth = 0) {
  if (!node || currentDepth > maxDepth) return '';
  
  const children = Array.from(node.children)
    .map(child => getNodePath(child, maxDepth, currentDepth + 1))
    .filter(path => path)
    .join('\n');
  
  const classes = node.className ? `.${node.className.replace(/ /g, '.')}` : '';
  const id = node.id ? `#${node.id}` : '';
  const indent = '  '.repeat(currentDepth);
  
  return `${indent}<${node.tagName.toLowerCase()}${id}${classes}>${children ? `\n${children}` : ''}`;
}

return getNodePath(document.body, 3);
```

### Extracting Styles

Get computed styles for any element on the page:

```javascript
const element = document.querySelector('h1');
if (!element) return 'Element not found';

const styles = window.getComputedStyle(element);
const result = {};

['color', 'background-color', 'font-size', 'padding', 'margin', 'width', 'height', 
 'display', 'position', 'font-family', 'font-weight', 'border', 'border-radius']
  .forEach(prop => {
    result[prop] = styles.getPropertyValue(prop);
  });
  
return JSON.stringify(result, null, 2);
```

---

*This documentation was last updated on March 13, 2025.* 