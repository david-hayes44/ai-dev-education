// Custom MCP bridge server that connects to PostgreSQL directly
import express from 'express';
import pg from 'pg';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const { Client } = pg;

// Create express app
const app = express();
const port = 30000;

// Enable CORS
app.use(cors());
app.use(express.json());

// Get connection parameters from environment
const host = process.env.POSTGRES_HOST || 'localhost';
const database = process.env.POSTGRES_DATABASE || 'postgres';
const user = process.env.POSTGRES_USER || 'postgres';
const password = process.env.POSTGRES_PASSWORD;
const port_db = process.env.POSTGRES_PORT || 5432;

if (!password) {
  console.error('Error: Missing POSTGRES_PASSWORD in .env.local');
  process.exit(1);
}

// Connection config
const connectionConfig = {
  host,
  database,
  user,
  password,
  port: port_db,
  ssl: { rejectUnauthorized: false }
};

// Create a client pool
const clients = {};
let clientCounter = 0;

// MCP query endpoint
app.post('/query', async (req, res) => {
  try {
    const { sql } = req.body;
    console.log(`[${new Date().toISOString()}] Executing query:`, sql);
    
    // Create a new client for this request
    const clientId = `client_${clientCounter++}`;
    clients[clientId] = new Client(connectionConfig);
    
    await clients[clientId].connect();
    const result = await clients[clientId].query(sql);
    
    // Close the client immediately after use
    await clients[clientId].end();
    delete clients[clientId];
    
    // Format the result in a way the MCP expects
    const rows = result.rows;
    console.log(`[${new Date().toISOString()}] Query successful, returning ${rows.length} rows`);
    
    res.json(rows);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Query error:`, error.message);
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ status: 'MCP Bridge is running' });
});

// Start the server
app.listen(port, () => {
  console.log(`[${new Date().toISOString()}] MCP Bridge server started on port ${port}`);
  console.log(`Connection config: ${host}:${port_db}/${database} (user: ${user})`);
});

// Handle process termination
process.on('SIGINT', async () => {
  console.log(`[${new Date().toISOString()}] Shutting down MCP Bridge...`);
  
  // Close all open clients
  for (const clientId in clients) {
    try {
      await clients[clientId].end();
    } catch (e) {
      console.error(`Error closing client ${clientId}:`, e);
    }
  }
  
  process.exit(0);
}); 