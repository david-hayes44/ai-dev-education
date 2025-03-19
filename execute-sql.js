import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Client } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database connection configuration with encoded password
const password = encodeURIComponent('Fourth_2025#@!');
const connectionString = `postgresql://postgres:${password}@db.mbabelguxbendvcawgnu.supabase.co:5432/postgres`;

// Read the SQL file
const sqlFile = path.join(__dirname, 'chat-tables-setup.sql');
const sql = fs.readFileSync(sqlFile, 'utf8');
console.log(`Loaded SQL file: ${sqlFile} (${sql.length} characters)`);

async function executeSQL() {
  console.log('Starting SQL execution process...');
  const client = new Client({
    connectionString,
    // Add longer timeout for complex operations
    query_timeout: 20000
  });

  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected to database successfully!');

    console.log('Executing SQL script...');
    // Split and execute each statement separately to handle errors better
    const statements = sql.split(';').filter(stmt => stmt.trim() !== '');
    console.log(`Found ${statements.length} SQL statements to execute`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (!statement) continue;
      
      try {
        console.log(`Executing statement ${i + 1}/${statements.length}...`);
        console.log(`Statement preview: ${statement.substring(0, 50)}...`);
        await client.query(statement);
        console.log(`Statement ${i + 1}/${statements.length} executed successfully`);
      } catch (error) {
        console.warn(`Warning: Statement ${i + 1} failed: ${error.message}`);
        console.log('Statement:', statement);
        // Continue with next statement rather than aborting
      }
    }
    
    // Verify table creation
    console.log('\nVerifying table creation:');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('chat_sessions', 'chat_messages')
    `);
    
    console.log('Tables created:', tablesResult.rows);
    
    console.log('\nSQL script execution completed!');
  } catch (error) {
    console.error('Error executing SQL script:', error);
  } finally {
    await client.end();
    console.log('Database connection closed.');
  }
}

executeSQL().catch(err => {
  console.error('Unhandled error in script execution:', err);
  process.exit(1);
}); 