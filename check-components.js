import puppeteer from 'puppeteer';

async function checkComponents() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({ 
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    console.log('Opening new page...');
    const page = await browser.newPage();
    
    // Set viewport to desktop size
    await page.setViewport({ width: 1280, height: 800 });
    
    // Navigate to the local deployment
    console.log('Navigating to local Next.js site...');
    await page.goto('http://localhost:3000', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    // Take a full page screenshot
    console.log('Taking full page screenshot...');
    await page.screenshot({ path: 'full-page.png', fullPage: true });
    
    // Check for header navigation
    console.log('Checking for header navigation...');
    const headerExists = await page.evaluate(() => {
      const header = document.querySelector('header');
      if (!header) return { exists: false };
      
      const navItems = Array.from(header.querySelectorAll('a, button')).map(el => ({
        text: el.innerText.trim(),
        visible: el.offsetParent !== null
      }));
      
      return { 
        exists: true, 
        navItems,
        html: header.outerHTML.substring(0, 500) + '...' // Get first 500 chars
      };
    });
    
    // Take a screenshot of the header if it exists
    if (headerExists.exists) {
      await page.screenshot({ path: 'header.png', clip: { x: 0, y: 0, width: 1280, height: 120 } });
    }
    
    // Check for sidebar navigation
    console.log('Checking for sidebar navigation...');
    const sidebarExists = await page.evaluate(() => {
      const sidebar = document.querySelector('aside') || 
                      document.querySelector('[class*="sidebar"]') || 
                      document.querySelector('nav');
      
      if (!sidebar) return { exists: false };
      
      const navItems = Array.from(sidebar.querySelectorAll('a')).map(el => ({
        text: el.innerText.trim(),
        href: el.getAttribute('href'),
        visible: el.offsetParent !== null
      }));
      
      return { 
        exists: true, 
        navItems,
        html: sidebar.outerHTML.substring(0, 500) + '...' // Get first 500 chars
      };
    });
    
    // Take a screenshot of the sidebar if it exists
    if (sidebarExists.exists) {
      // Screenshot the left side of the page where sidebar would be
      await page.screenshot({ path: 'sidebar.png', clip: { x: 0, y: 0, width: 300, height: 800 } });
    }
    
    // Check for floating chat button
    console.log('Checking for floating chat button...');
    const chatButtonExists = await page.evaluate(() => {
      // Look for button with message icon or text containing "chat"
      const chatButtons = Array.from(document.querySelectorAll('button')).filter(btn => {
        return btn.innerText.toLowerCase().includes('chat') || 
               btn.querySelector('svg[class*="lucide-MessageCircle"]') ||
               btn.closest('[class*="floating-chat"]');
      });
      
      if (chatButtons.length === 0) return { exists: false };
      
      return { 
        exists: true, 
        count: chatButtons.length,
        html: chatButtons[0].outerHTML.substring(0, 500) + '...' // Get first 500 chars
      };
    });
    
    // Take a screenshot of bottom right corner where floating chat button would be
    await page.screenshot({ 
      path: 'bottom-right.png', 
      clip: { 
        x: 1080, 
        y: 600, 
        width: 200, 
        height: 200 
      } 
    });
    
    // Print results
    console.log('\n--- COMPONENT STATUS REPORT ---\n');
    
    console.log('HEADER NAVIGATION:');
    if (headerExists.exists) {
      console.log('✅ Header exists');
      console.log(`Found ${headerExists.navItems.length} navigation items`);
      headerExists.navItems.forEach(item => {
        console.log(`  - ${item.text} (${item.visible ? 'visible' : 'hidden'})`);
      });
    } else {
      console.log('❌ Header not found');
    }
    
    console.log('\nSIDEBAR NAVIGATION:');
    if (sidebarExists.exists) {
      console.log('✅ Sidebar exists');
      console.log(`Found ${sidebarExists.navItems.length} navigation items`);
      sidebarExists.navItems.slice(0, 5).forEach(item => {
        console.log(`  - ${item.text} (${item.visible ? 'visible' : 'hidden'})`);
      });
      if (sidebarExists.navItems.length > 5) {
        console.log(`  - ... and ${sidebarExists.navItems.length - 5} more items`);
      }
    } else {
      console.log('❌ Sidebar not found');
    }
    
    console.log('\nFLOATING CHAT BUTTON:');
    if (chatButtonExists.exists) {
      console.log('✅ Floating chat button exists');
      console.log(`Found ${chatButtonExists.count} chat button(s)`);
    } else {
      console.log('❌ Floating chat button not found');
    }
    
    console.log('\nScreenshots saved:');
    console.log('- full-page.png: Full page screenshot');
    if (headerExists.exists) console.log('- header.png: Header navigation');
    if (sidebarExists.exists) console.log('- sidebar.png: Sidebar navigation');
    console.log('- bottom-right.png: Area where floating chat button should be');
    
  } catch (error) {
    console.error('Error during component analysis:', error);
  } finally {
    console.log('\nClosing browser...');
    await browser.close();
  }
}

checkComponents().catch(console.error); 