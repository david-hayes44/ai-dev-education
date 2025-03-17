// Simple script to test MCP Supabase connection
import { fetch } from 'undici';

async function testMcpConnection() {
  try {
    console.log('Testing MCP Supabase connection...');
    
    // Try to connect to the MCP server on localhost:30000
    const response = await fetch('http://localhost:30000/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        sql: 'SELECT current_timestamp as time, current_database() as database' 
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`MCP query failed: ${errorText || response.statusText}`);
    }
    
    const result = await response.json();
    console.log('Connection successful!');
    console.log('Result:', result);
    
    // Test listing tables
    console.log('\nListing tables...');
    const tablesResponse = await fetch('http://localhost:30000/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        sql: `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' LIMIT 10` 
      }),
    });
    
    if (!tablesResponse.ok) {
      const errorText = await tablesResponse.text();
      throw new Error(`Table query failed: ${errorText || tablesResponse.statusText}`);
    }
    
    const tablesResult = await tablesResponse.json();
    console.log('Tables query successful!');
    console.log('Tables:', tablesResult);
    
  } catch (error) {
    console.error('Error testing MCP connection:', error.message);
  }
}

testMcpConnection(); 