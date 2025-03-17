import pkg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Client } = pkg;

// Initialize dotenv
dotenv.config({ path: '.env.local' });

// Get directory name in ESM environment
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the schema file
const schemaPath = path.join(__dirname, 'supabase-schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

// Get connection parameters from environment
const host = process.env.POSTGRES_HOST || 'localhost';
const database = process.env.POSTGRES_DATABASE || 'postgres';
const user = process.env.POSTGRES_USER || 'postgres';
const password = process.env.POSTGRES_PASSWORD;
const port_db = process.env.POSTGRES_PORT || 5432;

// Log environment variables (without sensitive data)
console.log('Environment variables:');
console.log('- POSTGRES_HOST:', process.env.POSTGRES_HOST || '(not set, using default)');
console.log('- POSTGRES_DATABASE:', process.env.POSTGRES_DATABASE || '(not set, using default)');
console.log('- POSTGRES_USER:', process.env.POSTGRES_USER || '(not set, using default)');
console.log('- POSTGRES_PASSWORD:', process.env.POSTGRES_PASSWORD ? '(set)' : '(not set)');
console.log('- POSTGRES_PORT:', process.env.POSTGRES_PORT || '(not set, using default)');

// Connection config
const connectionConfig = {
  host,
  database,
  user,
  password,
  port: port_db,
  ssl: { rejectUnauthorized: false }
};

// Split SQL into individual statements
const statements = schema
  .split(';')
  .map(stmt => stmt.trim())
  .filter(stmt => stmt.length > 0)
  .map(stmt => stmt + ';');

async function applySchema() {
  console.log('Starting schema application...');
  console.log(`Found ${statements.length} SQL statements to execute`);
  console.log(`Connecting to PostgreSQL at ${host}:${port_db}/${database} (user: ${user})`);
  
  const client = new Client(connectionConfig);
  
  try {
    console.log('Attempting to connect to PostgreSQL...');
    await client.connect();
    console.log('Connected to PostgreSQL successfully');
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      try {
        console.log(`\nExecuting statement ${i + 1}/${statements.length}:`);
        console.log(statement.substring(0, 100) + (statement.length > 100 ? '...' : ''));
        
        await client.query(statement);
        console.log('✅ Statement executed successfully');
        successCount++;
      } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        console.error('Full error:', error);
        errorCount++;
      }
    }
    
    console.log('\n===== Schema Application Summary =====');
    console.log(`Total statements: ${statements.length}`);
    console.log(`Successful: ${successCount}`);
    console.log(`Failed: ${errorCount}`);
    console.log('====================================');
  } catch (error) {
    console.error('Error connecting to PostgreSQL:', error.message);
    console.error('Full connection error:', error);
    
    if (error.code === 'ENOTFOUND') {
      console.error('Host not found. Check your POSTGRES_HOST environment variable.');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('Connection refused. Make sure PostgreSQL is running and accessible.');
    } else if (error.code === '28P01') {
      console.error('Authentication failed. Check your POSTGRES_USER and POSTGRES_PASSWORD.');
    }
  } finally {
    try {
      await client.end();
      console.log('PostgreSQL connection closed');
    } catch (error) {
      console.error('Error closing PostgreSQL connection:', error.message);
    }
  }
}

// Execute the schema application
applySchema()
  .then(() => {
    console.log('Schema creation process finished');
  })
  .catch(error => {
    console.error('Error in schema application process:', error);
    process.exit(1);
  }); 