import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pkg from 'pg';
import dotenv from 'dotenv';

// Initialize dotenv
dotenv.config({ path: '.env.local' });

const { Client } = pkg;

// Get directory name in ESM environment
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get command line arguments
const sqlFilePath = process.argv[2];

if (!sqlFilePath) {
  console.error('Error: No SQL file specified');
  console.error('Usage: node run-sql.js <path-to-sql-file>');
  process.exit(1);
}

// Resolve the SQL file path
const resolvedPath = path.resolve(process.cwd(), sqlFilePath);

// Check if the file exists
if (!fs.existsSync(resolvedPath)) {
  console.error(`Error: SQL file not found: ${resolvedPath}`);
  process.exit(1);
}

// Read the SQL file
const sql = fs.readFileSync(resolvedPath, 'utf8');
console.log(`Executing SQL file: ${resolvedPath}`);

// Get connection parameters from environment
const host = process.env.POSTGRES_HOST || 'localhost';
const database = process.env.POSTGRES_DATABASE || 'postgres';
const user = process.env.POSTGRES_USER || 'postgres';
const password = process.env.POSTGRES_PASSWORD;
const port_db = process.env.POSTGRES_PORT || 5432;

if (!password) {
  console.error('Error: POSTGRES_PASSWORD not found in environment variables');
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

// Split SQL into individual statements
const statements = sql
  .split(';')
  .map(stmt => stmt.trim())
  .filter(stmt => stmt.length > 0)
  .map(stmt => stmt + ';');

async function executeSQL() {
  console.log(`Found ${statements.length} SQL statements to execute`);
  console.log(`Connecting to PostgreSQL at ${host}:${port_db}/${database} (user: ${user})`);
  
  const client = new Client(connectionConfig);
  
  try {
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
        errorCount++;
        
        // Continue with the next statement
        continue;
      }
    }
    
    console.log('\n===== Execution Summary =====');
    console.log(`Total statements: ${statements.length}`);
    console.log(`Successful: ${successCount}`);
    console.log(`Failed: ${errorCount}`);
    console.log('====================================');
    
    if (errorCount > 0) {
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error connecting to PostgreSQL:', error.message);
    return false;
  } finally {
    await client.end();
    console.log('PostgreSQL connection closed');
  }
}

// Execute the SQL
executeSQL()
  .then(success => {
    if (success) {
      console.log('SQL execution completed successfully');
      process.exit(0);
    } else {
      console.error('SQL execution completed with errors');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Error in SQL execution process:', error);
    process.exit(1);
  }); 