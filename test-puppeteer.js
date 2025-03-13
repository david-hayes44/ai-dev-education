const puppeteer = require('puppeteer');

async function testPuppeteer() {
  console.log('Starting Puppeteer test...');
  
  try {
    console.log('Launching browser...');
    const browser = await puppeteer.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    
    console.log('Browser launched successfully!');
    console.log('Creating new page...');
    const page = await browser.newPage();
    
    console.log('Navigating to example.com...');
    await page.goto('https://example.com');
    
    console.log('Taking screenshot...');
    await page.screenshot({ path: 'test-screenshot.png' });
    
    console.log('Closing browser...');
    await browser.close();
    
    console.log('Test completed successfully!');
  } catch (error) {
    console.error('Test failed with error:', error);
  }
}

testPuppeteer(); 