import fetch from 'node-fetch';
import { promises as fs } from 'fs';

const SITE_URL = 'https://new-ai-dev-education-lyzi32bwg-dave-hayes-projects.vercel.app';
const PUPPETEER_SERVER = 'http://localhost:5004';

async function testAuthPages() {
  console.log('Testing authentication pages...');
  
  try {
    // Check if Puppeteer server is running
    const statusResponse = await fetch(`${PUPPETEER_SERVER}/status`);
    if (!statusResponse.ok) {
      throw new Error('Puppeteer server is not running. Start it with: node simple-puppeteer-server.js');
    }
    
    console.log('Puppeteer server is running.');
    
    // Initialize browser
    const browserResponse = await fetch(`${PUPPETEER_SERVER}/browser/init`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ headless: false, defaultViewport: { width: 1280, height: 800 } })
    });
    
    if (!browserResponse.ok) {
      throw new Error('Failed to initialize browser');
    }
    
    console.log('Browser initialized successfully.');
    
    // Test login page
    console.log(`Navigating to ${SITE_URL}/login`);
    let navResponse = await fetch(`${PUPPETEER_SERVER}/page/navigate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: `${SITE_URL}/login` })
    });
    
    if (!navResponse.ok) {
      throw new Error('Failed to navigate to login page');
    }
    
    console.log('Taking screenshot of login page...');
    const loginScreenshot = await fetch(`${PUPPETEER_SERVER}/page/screenshot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: 'login-page.png' })
    });
    
    if (!loginScreenshot.ok) {
      throw new Error('Failed to take login page screenshot');
    }
    
    console.log('Login page screenshot saved as login-page.png');
    
    // Get page content to see if there are any errors
    const contentResponse = await fetch(`${PUPPETEER_SERVER}/page/content`);
    if (contentResponse.ok) {
      const content = await contentResponse.text();
      console.log('Page title:', content.match(/<title>(.*?)<\/title>/i)?.[1] || 'Title not found');
      
      // Check for common error messages
      if (content.includes('Error') || content.includes('404') || content.includes('not found')) {
        console.log('Potential error detected on page:', content.match(/<h1>(.*?)<\/h1>/i)?.[1] || 'Error message not found');
      }
    }
    
    // Test signup page
    console.log(`Navigating to ${SITE_URL}/signup`);
    navResponse = await fetch(`${PUPPETEER_SERVER}/page/navigate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: `${SITE_URL}/signup` })
    });
    
    if (!navResponse.ok) {
      throw new Error('Failed to navigate to signup page');
    }
    
    console.log('Taking screenshot of signup page...');
    const signupScreenshot = await fetch(`${PUPPETEER_SERVER}/page/screenshot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: 'signup-page.png' })
    });
    
    if (!signupScreenshot.ok) {
      throw new Error('Failed to take signup page screenshot');
    }
    
    console.log('Signup page screenshot saved as signup-page.png');
    
    // Get page content to see if there are any errors
    const signupContentResponse = await fetch(`${PUPPETEER_SERVER}/page/content`);
    if (signupContentResponse.ok) {
      const content = await signupContentResponse.text();
      console.log('Page title:', content.match(/<title>(.*?)<\/title>/i)?.[1] || 'Title not found');
      
      // Check for common error messages
      if (content.includes('Error') || content.includes('404') || content.includes('not found')) {
        console.log('Potential error detected on page:', content.match(/<h1>(.*?)<\/h1>/i)?.[1] || 'Error message not found');
      }
    }
    
    // Try old routes that might have been used before
    console.log('Checking old auth routes...');
    const oldRoutes = [
      '/auth/login',
      '/auth/signup',
      '/auth/signin',
      '/signin'
    ];
    
    for (const route of oldRoutes) {
      console.log(`Checking route: ${SITE_URL}${route}`);
      navResponse = await fetch(`${PUPPETEER_SERVER}/page/navigate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: `${SITE_URL}${route}` })
      });
      
      if (navResponse.ok) {
        console.log(`Taking screenshot of ${route}...`);
        await fetch(`${PUPPETEER_SERVER}/page/screenshot`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: `${route.replace(/\//g, '-')}.png` })
        });
      }
    }
    
    // Close browser
    await fetch(`${PUPPETEER_SERVER}/browser/close`, { method: 'POST' });
    console.log('Browser closed.');
    
  } catch (error) {
    console.error('Error during testing:', error);
  }
}

// Run the test
testAuthPages(); 