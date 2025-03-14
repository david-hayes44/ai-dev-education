const puppeteer = require('puppeteer');

async function checkFloatingChat() {
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
    
    // Check for chat button
    console.log('Checking for chat button...');
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
      console.log('Taking screenshot before clicking chat button...');
      await page.screenshot({ path: 'before-chat-click.png' });
      
      // Try to click the chat button
      console.log('Attempting to click chat button...');
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
      console.log('Waiting for chat to appear...');
      await page.waitForTimeout(2000); // Wait for animations
      
      console.log('Taking screenshot after clicking chat button...');
      await page.screenshot({ path: 'after-chat-click.png' });
      
      // Check if chat container opened
      const chatContainerExists = await page.evaluate(() => {
        return !!document.querySelector('[class*="chat-container"]') || 
               !!document.querySelector('[class*="ChatContainer"]') ||
               !!document.querySelector('[class*="floating-chat"][class*="open"]');
      });
      
      console.log(`Chat container exists: ${chatContainerExists}`);
      
      if (chatContainerExists) {
        // Try to type a message
        console.log('Attempting to type in chat input...');
        
        // Look for the input element
        const inputExists = await page.evaluate(() => {
          const inputs = Array.from(document.querySelectorAll('input[type="text"], textarea'));
          const chatInputs = inputs.filter(input => {
            const placeholder = input.placeholder?.toLowerCase() || '';
            return placeholder.includes('message') || 
                   placeholder.includes('chat') || 
                   placeholder.includes('type') ||
                   input.closest('[class*="chat-input"]');
          });
          
          if (chatInputs.length > 0) {
            // Focus the input
            chatInputs[0].focus();
            return true;
          }
          return false;
        });
        
        console.log(`Chat input exists: ${inputExists}`);
        
        if (inputExists) {
          // Type a test message
          await page.keyboard.type('Hello, this is a test message');
          await page.waitForTimeout(1000);
          
          console.log('Taking screenshot after typing message...');
          await page.screenshot({ path: 'after-typing.png' });
          
          // Try to send the message
          console.log('Attempting to send message...');
          await page.evaluate(() => {
            // Look for a send button
            const sendButtons = Array.from(document.querySelectorAll('button')).filter(btn => {
              return btn.innerText.toLowerCase().includes('send') || 
                     btn.querySelector('svg[class*="lucide-Send"]') ||
                     btn.closest('[class*="chat-input"]');
            });
            
            if (sendButtons.length > 0) {
              sendButtons[0].click();
            } else {
              // Try to submit the form
              const form = document.querySelector('form');
              if (form) {
                form.dispatchEvent(new Event('submit', { bubbles: true }));
              }
            }
          });
          
          // Wait for response
          console.log('Waiting for response...');
          await page.waitForTimeout(3000);
          
          console.log('Taking screenshot after sending message...');
          await page.screenshot({ path: 'after-sending.png' });
        }
      }
    }
    
    // Capture any console errors
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    console.log('Console errors:', consoleErrors);
    
  } catch (error) {
    console.error('Error during chat check:', error);
  } finally {
    console.log('Closing browser...');
    await browser.close();
  }
}

checkFloatingChat().catch(console.error); 