const { PuppeteerServer } = require('@modelcontextprotocol/server-puppeteer');

async function testMcpServer() {
  console.log('Starting MCP Puppeteer server test...');
  
  try {
    // Create server instance
    console.log('Creating server instance...');
    const server = new PuppeteerServer({
      port: 5004,
      enableSecurity: false,
      dataDir: './data',
      defaultViewport: {
        width: 1280,
        height: 800
      },
      headless: false,
      timeout: 30000,
      closePages: false,
      enableCdp: true,
      maxRetries: 3,
      retryDelay: 500,
      logLevel: 'debug'
    });
    
    console.log('Starting server...');
    await server.start();
    
    console.log('Server started successfully!');
    console.log('Server is running on port 5004');
    console.log('Press Ctrl+C to stop the server');

    // Keep the script running
    process.on('SIGINT', async () => {
      console.log('Stopping server...');
      await server.stop();
      console.log('Server stopped successfully!');
      process.exit(0);
    });
  } catch (error) {
    console.error('Test failed with error:', error);
  }
}

testMcpServer(); 