import puppeteer from 'puppeteer';

async function checkComponents() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    console.log('Opening new page...');
    const page = await browser.newPage();
    
    // Enable console logging
    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
    
    // Set viewport to desktop size
    await page.setViewport({ width: 1280, height: 800 });
    
    // Navigate to the local deployment
    console.log('Navigating to local Next.js site...');
    await page.goto('http://localhost:3001', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    // Take a screenshot
    await page.screenshot({ path: 'site-status.png', fullPage: true });
    
    // Check for header
    const headerExists = await page.evaluate(() => {
      return !!document.querySelector('header');
    });
    
    // Check for sidebar
    const sidebarExists = await page.evaluate(() => {
      return !!document.querySelector('[class*="sidebar"]') || 
             !!document.querySelector('aside') || 
             !!document.querySelector('nav');
    });
    
    // Check for floating chat button with multiple selectors
    const chatButtonDetails = await page.evaluate(() => {
      // Try various selectors
      const buttonWithIcon = document.querySelector('button svg[class*="MessageCircle"]');
      const buttonInBottomRight = document.querySelector('.fixed.bottom-0.right-0 button');
      const buttonWithRoundedFull = document.querySelector('button.rounded-full');
      
      return {
        buttonWithIcon: !!buttonWithIcon,
        buttonInBottomRight: !!buttonInBottomRight,
        buttonWithRoundedFull: !!buttonWithRoundedFull,
        bottomRightElements: Array.from(document.querySelectorAll('.fixed.bottom-0.right-0 *')).map(
          el => ({
            tagName: el.tagName,
            className: el.className,
            innerHTML: el.innerHTML.slice(0, 50) + (el.innerHTML.length > 50 ? '...' : '')
          })
        )
      };
    });
    
    // Capture the bottom right corner
    const viewport = await page.viewport();
    await page.screenshot({
      path: 'bottom-right-corner.png',
      clip: {
        x: viewport.width - 200,
        y: viewport.height - 200,
        width: 200,
        height: 200
      }
    });
    
    // Check for errors in the browser console
    console.log('Checking for JavaScript errors...');
    const jsErrors = [];
    page.on('pageerror', error => {
      jsErrors.push(error.message);
    });
    
    // Check for responsive layout issues
    await page.setViewport({ width: 768, height: 1024 });
    await page.screenshot({ path: 'site-tablet.png' });
    
    await page.setViewport({ width: 390, height: 844 });
    await page.screenshot({ path: 'site-mobile.png' });
    
    console.log('\n--- COMPONENT STATUS REPORT ---\n');
    console.log(`- Header: ${headerExists ? '✅' : '❌'}`);
    console.log(`- Sidebar: ${sidebarExists ? '✅' : '❌'}`);
    console.log(`- Chat Button: ${
      chatButtonDetails.buttonWithIcon || 
      chatButtonDetails.buttonInBottomRight || 
      chatButtonDetails.buttonWithRoundedFull ? '✅' : '❌'}`);
    
    console.log('\n--- FLOATING CHAT DETAILS ---');
    console.log(`- Button with message icon: ${chatButtonDetails.buttonWithIcon ? '✅' : '❌'}`);
    console.log(`- Button in bottom right: ${chatButtonDetails.buttonInBottomRight ? '✅' : '❌'}`);
    console.log(`- Button with rounded-full class: ${chatButtonDetails.buttonWithRoundedFull ? '✅' : '❌'}`);
    
    if (chatButtonDetails.bottomRightElements.length > 0) {
      console.log('\n--- BOTTOM RIGHT CORNER ELEMENTS ---');
      chatButtonDetails.bottomRightElements.forEach((el, i) => {
        console.log(`${i+1}. <${el.tagName.toLowerCase()}> - Classes: ${el.className}`);
      });
    } else {
      console.log('\n❌ No elements found in bottom right corner');
    }
    
    // Check for broken images
    const brokenImages = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'));
      return images
        .filter(img => !img.complete || img.naturalWidth === 0 || img.naturalHeight === 0)
        .map(img => ({ src: img.src, alt: img.alt }));
    });
    
    if (brokenImages.length > 0) {
      console.log('\n--- BROKEN IMAGES ---');
      brokenImages.forEach(img => console.log(`- ${img.alt || 'No alt text'} (${img.src})`));
    }
    
    if (jsErrors.length > 0) {
      console.log('\n--- JAVASCRIPT ERRORS ---');
      jsErrors.forEach(err => console.log(`- ${err}`));
    }
    
    // Wait for user to see the results
    await new Promise(resolve => setTimeout(resolve, 5000));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

checkComponents().catch(console.error); 