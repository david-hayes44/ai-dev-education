import dotenv from 'dotenv';
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Get database connection details from environment variables
const dbConfig = {
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  database: process.env.POSTGRES_DATABASE,
  ssl: {
    rejectUnauthorized: false
  }
};

// Get SQL script path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sqlFilePath = path.join(__dirname, 'chat-tables-setup.sql');

console.log('Creating chat tables using direct PostgreSQL connection...');
console.log(`Connection details: ${dbConfig.user}@${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);

async function createTables() {
  // Create a PostgreSQL client
  const client = new pg.Client(dbConfig);
  
  try {
    // Connect to the database
    console.log('Connecting to PostgreSQL...');
    await client.connect();
    console.log('Connected successfully!');
    
    // Read the SQL script
    console.log('Reading SQL script...');
    const sqlScript = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Split the script into individual statements
    console.log('Executing SQL script...');
    const statements = sqlScript.split(';').filter(stmt => stmt.trim() !== '');
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i].trim();
      if (!stmt) continue;
      
      try {
        console.log(`Executing statement ${i + 1}/${statements.length}...`);
        await client.query(stmt);
        console.log(`Statement ${i + 1} executed successfully`);
      } catch (error) {
        console.warn(`Warning: Statement ${i + 1} failed:`, error.message);
        // Continue with the next statement
      }
    }
    
    // Verify that the tables were created
    console.log('\nVerifying tables were created...');
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('chat_sessions', 'chat_messages')
    `);
    
    console.log('Tables created:', res.rows.map(row => row.table_name).join(', '));
    
    // Insert a test record
    console.log('\nInserting a test session...');
    const sessionRes = await client.query(`
      INSERT INTO chat_sessions (title, user_id)
      VALUES ('Test Session', NULL)
      RETURNING *
    `);
    
    const session = sessionRes.rows[0];
    console.log('Test session created:', session);
    
    // Insert a test message
    console.log('\nInserting a test message...');
    const messageRes = await client.query(`
      INSERT INTO chat_messages (session_id, role, content, metadata)
      VALUES ($1, 'user', 'Hello, this is a test message', '{"type":"test"}')
      RETURNING *
    `, [session.id]);
    
    const message = messageRes.rows[0];
    console.log('Test message created:', message);
    
    // Clean up test data
    console.log('\nCleaning up test data...');
    await client.query(`DELETE FROM chat_sessions WHERE id = $1`, [session.id]);
    console.log('Test data cleaned up successfully!');
    
    console.log('\nChat tables setup completed successfully!');
  } catch (error) {
    console.error('Error setting up chat tables:', error);
  } finally {
    // Close the client connection
    try {
      await client.end();
      console.log('Database connection closed.');
    } catch (err) {
      // Ignore errors on closing
    }
  }
}

createTables().catch(console.error); 