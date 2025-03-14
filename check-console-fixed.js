const puppeteer = require('puppeteer');

async function checkConsoleErrors() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({ 
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    console.log('Opening new page...');
    const page = await browser.newPage();
    
    // Collect all console messages
    const consoleMessages = {
      errors: [],
      warnings: [],
      info: []
    };
    
    page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      
      if (type === 'error') {
        consoleMessages.errors.push(text);
      } else if (type === 'warning') {
        consoleMessages.warnings.push(text);
      } else if (type === 'info' || type === 'log') {
        consoleMessages.info.push(text);
      }
    });
    
    // Collect network errors
    page.on('requestfailed', request => {
      consoleMessages.errors.push(`Network request failed: ${request.url()} - ${request.failure().errorText}`);
    });
    
    // Navigate to the local deployment
    console.log('Navigating to http://localhost:3004...');
    const response = await page.goto('http://localhost:3004', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    // Wait a bit for any additional errors
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Check for specific element to ensure page loaded
    const mainContentExists = await page.evaluate(() => {
      return !!document.querySelector('main');
    });
    
    console.log(`Main content exists: ${mainContentExists}`);
    
    // Print console messages
    console.log('\nConsole Errors:');
    if (consoleMessages.errors.length > 0) {
      consoleMessages.errors.forEach((err, i) => {
        console.log(`${i+1}. ${err}`);
      });
    } else {
      console.log('No console errors detected');
    }
    
    console.log('\nConsole Warnings:');
    if (consoleMessages.warnings.length > 0) {
      consoleMessages.warnings.forEach((warn, i) => {
        console.log(`${i+1}. ${warn}`);
      });
    } else {
      console.log('No console warnings detected');
    }
    
    // Check for specific error patterns
    const hydrationErrors = consoleMessages.errors.filter(err => 
      err.includes('hydration') || err.includes('mismatch')
    );
    
    if (hydrationErrors.length > 0) {
      console.log('\nHydration Errors Detected:');
      hydrationErrors.forEach((err, i) => {
        console.log(`${i+1}. ${err}`);
      });
    }
    
    const moduleErrors = consoleMessages.errors.filter(err => 
      err.includes('MODULE_NOT_FOUND') || err.includes('Cannot find module')
    );
    
    if (moduleErrors.length > 0) {
      console.log('\nModule Not Found Errors:');
      moduleErrors.forEach((err, i) => {
        console.log(`${i+1}. ${err}`);
      });
    }
    
    // Take a screenshot of the final state
    console.log('\nTaking screenshot...');
    await page.screenshot({ path: 'console-check.png', fullPage: true });
    
  } catch (error) {
    console.error('Error during console check:', error);
  } finally {
    console.log('Closing browser...');
    await browser.close();
  }
}

checkConsoleErrors().catch(console.error); 