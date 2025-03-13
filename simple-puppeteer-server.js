const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');

const app = express();
const port = 5004;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Store the browser instance
let browser;
let activePage;

// Initialize browser
async function initBrowser() {
  console.log('Initializing browser...');
  try {
    browser = await puppeteer.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    console.log('Browser initialized successfully');
    
    // Create initial page
    const pages = await browser.pages();
    activePage = pages.length > 0 ? pages[0] : await browser.newPage();
    await activePage.goto('https://example.com');
    
    return true;
  } catch (error) {
    console.error('Failed to initialize browser:', error);
    return false;
  }
}

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Puppeteer API Server is running' });
});

app.get('/status', (req, res) => {
  res.json({ 
    status: 'ok', 
    browser: browser ? 'running' : 'not started',
    activePage: activePage ? 'ready' : 'not available'
  });
});

// Initialize browser endpoint
app.post('/browser/init', async (req, res) => {
  if (browser) {
    return res.json({ success: true, message: 'Browser already initialized' });
  }
  
  const success = await initBrowser();
  res.json({ 
    success, 
    message: success ? 'Browser initialized' : 'Failed to initialize browser' 
  });
});

// Navigate to URL
app.post('/browser/navigate', async (req, res) => {
  try {
    if (!browser || !activePage) {
      await initBrowser();
    }
    
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ success: false, message: 'URL is required' });
    }
    
    console.log(`Navigating to ${url}...`);
    await activePage.goto(url);
    
    res.json({ success: true, message: `Navigated to ${url}` });
  } catch (error) {
    console.error('Navigation error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Click element
app.post('/browser/click', async (req, res) => {
  try {
    if (!browser || !activePage) {
      await initBrowser();
    }
    
    const { selector } = req.body;
    if (!selector) {
      return res.status(400).json({ success: false, message: 'Selector is required' });
    }
    
    console.log(`Clicking ${selector}...`);
    await activePage.click(selector);
    
    res.json({ success: true, message: `Clicked ${selector}` });
  } catch (error) {
    console.error('Click error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Type text
app.post('/browser/type', async (req, res) => {
  try {
    if (!browser || !activePage) {
      await initBrowser();
    }
    
    const { selector, text } = req.body;
    if (!selector || !text) {
      return res.status(400).json({ 
        success: false, 
        message: 'Selector and text are required' 
      });
    }
    
    console.log(`Typing "${text}" into ${selector}...`);
    await activePage.type(selector, text);
    
    res.json({ 
      success: true, 
      message: `Typed "${text}" into ${selector}` 
    });
  } catch (error) {
    console.error('Type error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Extract text
app.post('/browser/extract', async (req, res) => {
  try {
    if (!browser || !activePage) {
      await initBrowser();
    }
    
    const { selector } = req.body;
    if (!selector) {
      return res.status(400).json({ success: false, message: 'Selector is required' });
    }
    
    console.log(`Extracting text from ${selector}...`);
    const text = await activePage.evaluate((sel) => {
      const element = document.querySelector(sel);
      return element ? element.textContent : '';
    }, selector);
    
    res.json({ 
      success: true, 
      data: text,
      message: `Extracted text from ${selector}` 
    });
  } catch (error) {
    console.error('Extract error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Take screenshot
app.post('/browser/screenshot', async (req, res) => {
  try {
    if (!browser || !activePage) {
      await initBrowser();
    }
    
    console.log('Taking screenshot...');
    const screenshot = await activePage.screenshot({ encoding: 'base64' });
    
    res.json({ 
      success: true, 
      data: screenshot,
      message: 'Screenshot taken' 
    });
  } catch (error) {
    console.error('Screenshot error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Execute JavaScript code
app.post('/browser/execute', async (req, res) => {
  try {
    if (!browser || !activePage) {
      await initBrowser();
    }
    
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ 
        success: false, 
        message: 'JavaScript code is required' 
      });
    }
    
    console.log('Executing JavaScript...');
    // Execute the JavaScript code in the browser context
    const result = await activePage.evaluate(code => {
      try {
        // Using Function constructor to create a function from the string
        // This allows for multi-line code execution
        const fn = new Function(`return (async () => { ${code} })();`);
        return fn();
      } catch (e) {
        return { error: e.message };
      }
    }, code);
    
    res.json({ 
      success: true, 
      data: result,
      message: 'JavaScript executed' 
    });
  } catch (error) {
    console.error('JavaScript execution error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Start the server
app.listen(port, async () => {
  console.log(`Simple Puppeteer server listening at http://localhost:${port}`);
  console.log('Initializing browser...');
  await initBrowser();
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('Closing browser and shutting down server...');
  if (browser) {
    await browser.close();
  }
  process.exit(0);
}); 