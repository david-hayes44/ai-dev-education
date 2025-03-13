#!/usr/bin/env node
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

async function testMcpServer() {
  console.log('Starting Puppeteer MCP server test with ES modules...');
  
  try {
    console.log('Launching server process...');
    
    // Use the direct path to the package's entry point
    const command = 'node --no-warnings ./node_modules/@modelcontextprotocol/server-puppeteer/dist/index.js --config mcp-servers/configs/puppeteer-config.json';
    
    console.log(`Executing command: ${command}`);
    
    // Execute the command
    const { stdout, stderr } = await execPromise(command);
    
    if (stdout) {
      console.log('Standard output:');
      console.log(stdout);
    }
    
    if (stderr) {
      console.error('Standard error:');
      console.error(stderr);
    }
    
    console.log('Command executed successfully');
  } catch (error) {
    console.error('Error occurred:', error.message);
    if (error.stdout) console.log('Standard output:', error.stdout);
    if (error.stderr) console.log('Standard error:', error.stderr);
  }
}

testMcpServer(); 