import puppeteer from 'puppeteer';

async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testInteractions() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1280, height: 800 }
  });
  
  try {
    console.log('Opening new page...');
    const page = await browser.newPage();
    
    // Enable request logging
    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
    
    // Navigate to the local deployment
    console.log('Navigating to local Next.js site...');
    await page.goto('http://localhost:3001', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    // Take a screenshot of initial load
    await page.screenshot({ path: 'initial-page.png', fullPage: true });
    
    console.log('\n--- CONTENT CHECK ---');
    
    // Check page title
    const title = await page.title();
    console.log(`Page Title: ${title}`);
    
    // Check main heading
    const heading = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      return h1 ? h1.innerText : 'No h1 found';
    });
    console.log(`Main Heading: ${heading}`);
    
    // TEST 1: Check navigation links
    console.log('\n--- NAVIGATION LINKS TEST ---');
    const navLinks = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('nav a, header a'));
      return links.map(link => ({
        text: link.innerText.trim(),
        href: link.getAttribute('href')
      }));
    });
    
    console.log(`Found ${navLinks.length} navigation links`);
    navLinks.slice(0, 10).forEach((link, i) => {
      console.log(`${i+1}. "${link.text}" → ${link.href}`);
    });
    
    // TEST 2: Test the floating chat button interaction
    console.log('\n--- FLOATING CHAT INTERACTION TEST ---');
    
    // Check for chat button
    const chatButtonExists = await page.evaluate(() => {
      return !!document.querySelector('.fixed.bottom-0.right-0 button');
    });
    
    if (chatButtonExists) {
      console.log('✅ Chat button found');
      
      // Click the chat button
      console.log('Clicking chat button...');
      await page.click('.fixed.bottom-0.right-0 button');
      await wait(1000);
      
      // Take a screenshot of open chat
      await page.screenshot({ path: 'chat-open.png', fullPage: true });
      
      // Check if chat container is visible
      const chatIsOpen = await page.evaluate(() => {
        return !!document.querySelector('.fixed.bottom-0.right-0 .rounded-lg.border');
      });
      
      console.log(`Chat opened successfully: ${chatIsOpen ? '✅' : '❌'}`);
      
      if (chatIsOpen) {
        // Check chat header
        const chatHeader = await page.evaluate(() => {
          const header = document.querySelector('.fixed.bottom-0.right-0 .rounded-lg h3');
          return header ? header.innerText : 'No header found';
        });
        
        console.log(`Chat Header: ${chatHeader}`);
        
        // Close the chat
        console.log('Closing chat...');
        const closeButton = await page.evaluate(() => {
          const buttons = Array.from(document.querySelectorAll('.fixed.bottom-0.right-0 .rounded-lg button'));
          const closeBtn = buttons.find(btn => btn.querySelector('svg[class*="lucide-X"]'));
          if (closeBtn) {
            closeBtn.click();
            return true;
          }
          return false;
        });
        
        await wait(1000);
        
        // Check if chat is closed
        const chatIsClosed = await page.evaluate(() => {
          return !document.querySelector('.fixed.bottom-0.right-0 .rounded-lg.border');
        });
        
        console.log(`Chat closed successfully: ${chatIsClosed ? '✅' : '❌'}`);
      }
    } else {
      console.log('❌ Chat button not found');
    }
    
    // TEST 3: Test responsive behavior
    console.log('\n--- RESPONSIVE BEHAVIOR TEST ---');
    
    // Tablet size
    await page.setViewport({ width: 768, height: 1024 });
    await wait(1000);
    await page.screenshot({ path: 'tablet-view.png' });
    
    const tabletMenu = await page.evaluate(() => {
      return !!document.querySelector('.md\\:hidden button');
    });
    
    console.log(`Tablet menu button visible: ${tabletMenu ? '✅' : '❌'}`);
    
    // Mobile size
    await page.setViewport({ width: 390, height: 844 });
    await wait(1000);
    await page.screenshot({ path: 'mobile-view.png' });
    
    const mobileMenu = await page.evaluate(() => {
      return !!document.querySelector('.md\\:hidden button');
    });
    
    console.log(`Mobile menu button visible: ${mobileMenu ? '✅' : '❌'}`);
    
    // If mobile menu exists, click it
    if (mobileMenu) {
      console.log('Clicking mobile menu button...');
      await page.evaluate(() => {
        const mobileMenuBtn = document.querySelector('.md\\:hidden button');
        if (mobileMenuBtn) mobileMenuBtn.click();
      });
      
      await wait(1000);
      await page.screenshot({ path: 'mobile-menu-open.png' });
      
      // Check if mobile menu is open
      const menuIsOpen = await page.evaluate(() => {
        return !!document.querySelector('.fixed.inset-0');
      });
      
      console.log(`Mobile menu opened successfully: ${menuIsOpen ? '✅' : '❌'}`);
    }
    
    console.log('\nTests completed. Screenshots saved.');
    
  } catch (error) {
    console.error('Error during testing:', error);
  } finally {
    await browser.close();
  }
}

testInteractions().catch(console.error); 