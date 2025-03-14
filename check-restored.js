const puppeteer = require('puppeteer');

async function checkRestoredComponents() {
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
    await page.goto('http://localhost:3004', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    // Take a screenshot of the initial state
    console.log('Taking initial screenshot...');
    await page.screenshot({ path: 'initial-state.png', fullPage: true });
    
    // Check for sidebar
    console.log('Checking for sidebar...');
    const sidebarExists = await page.evaluate(() => {
      return !!document.querySelector('[class*="sidebar"]') || 
             !!document.querySelector('aside') ||
             !!document.querySelector('nav');
    });
    
    console.log(`Sidebar exists: ${sidebarExists}`);
    
    // Check for floating chat button
    console.log('Checking for floating chat button...');
    const chatButtonExists = await page.evaluate(() => {
      // Looking for the floating chat button which typically has MessageCircle icon
      const chatButtons = Array.from(document.querySelectorAll('button')).filter(btn => {
        return btn.innerText.toLowerCase().includes('chat') || 
               btn.querySelector('svg[class*="lucide-MessageCircle"]') ||
               btn.closest('[class*="floating-chat"]');
      });
      return chatButtons.length > 0;
    });
    
    console.log(`Chat button exists: ${chatButtonExists}`);
    
    if (chatButtonExists) {
      // Try to click the chat button
      console.log('Clicking chat button...');
      await page.evaluate(() => {
        const chatButtons = Array.from(document.querySelectorAll('button')).filter(btn => {
          return btn.innerText.toLowerCase().includes('chat') || 
                 btn.querySelector('svg[class*="lucide-MessageCircle"]') ||
                 btn.closest('[class*="floating-chat"]');
        });
        if (chatButtons.length > 0) {
          chatButtons[0].click();
        }
      });
      
      // Wait for chat window to appear
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Take a screenshot with chat open
      console.log('Taking screenshot with chat open...');
      await page.screenshot({ path: 'chat-open.png', fullPage: true });
    }
    
  } catch (error) {
    console.error('Error during check:', error);
  } finally {
    console.log('Closing browser...');
    await browser.close();
  }
}

checkRestoredComponents().catch(console.error); 