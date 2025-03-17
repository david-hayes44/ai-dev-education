// Script to run the MCP PostgreSQL server directly
import { spawn } from 'child_process';
import path from 'path';

// Connection string with properly encoded password
const connectionString = "postgresql://postgres.mbabelguxbendvcawgnu:Fourth_22025%23%40%21@aws-0-us-east-2.pooler.supabase.com:5432/postgres?sslmode=require";

console.log('Starting MCP PostgreSQL server...');
console.log('Connection string (sanitized):', connectionString.replace(/:[^:]*@/, ':***@'));

try {
  // Run the MCP server as a child process
  const mcp = spawn('npx', ['-y', '@modelcontextprotocol/server-postgres', connectionString, '--verbose'], {
    stdio: 'inherit',
    shell: true
  });

  mcp.on('error', (error) => {
    console.error('Error starting MCP server:', error);
  });

  mcp.on('close', (code) => {
    console.log(`MCP server process exited with code ${code}`);
  });

  console.log('MCP server started with PID:', mcp.pid);
  console.log('Press Ctrl+C to stop the server');
} catch (error) {
  console.error('Failed to start MCP server:', error);
} 