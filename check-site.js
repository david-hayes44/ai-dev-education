const puppeteer = require('puppeteer');

async function checkSite() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({ 
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    console.log('Opening new page...');
    const page = await browser.newPage();
    
    // Navigate to the local deployment
    console.log('Navigating to http://localhost:3004...');
    const response = await page.goto('http://localhost:3004', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    // Get HTTP status
    const status = response.status();
    console.log(`Page loaded with status: ${status}`);
    
    // Take a screenshot
    console.log('Taking screenshot...');
    await page.screenshot({ path: 'site-screenshot.png', fullPage: true });
    
    // Get page content
    const pageTitle = await page.title();
    console.log(`Page title: ${pageTitle}`);
    
    const bodyContent = await page.evaluate(() => {
      return document.body.innerText;
    });
    console.log('Page content:');
    console.log('--------------------------------------');
    console.log(bodyContent.slice(0, 1000) + '...'); // Print first 1000 chars
    console.log('--------------------------------------');
    
    // Check for specific error messages
    if (bodyContent.includes('missing required error components')) {
      console.log('Found "missing required error components" error!');
    }
    
    // Check page structure
    const pageElements = await page.evaluate(() => {
      return {
        hasHeader: !!document.querySelector('header'),
        hasFooter: !!document.querySelector('footer'),
        hasMain: !!document.querySelector('main'),
        errorMessages: Array.from(document.querySelectorAll('.error-message, [role="alert"]')).map(el => el.innerText)
      };
    });
    
    console.log('Page structure:', pageElements);
    
  } catch (error) {
    console.error('Error during page check:', error);
  } finally {
    console.log('Closing browser...');
    await browser.close();
  }
}

checkSite().catch(console.error); 