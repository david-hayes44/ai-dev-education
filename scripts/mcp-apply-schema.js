import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { MCP } from '@modelcontextprotocol/server';

// Initialize dotenv
dotenv.config({ path: '.env.local' });

// Get directory name in ESM environment
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the schema file
const schemaPath = path.join(__dirname, 'supabase-schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

// Split SQL into individual statements
const statements = schema
  .split(';')
  .map(stmt => stmt.trim())
  .filter(stmt => stmt.length > 0);

async function runQuery(sql) {
  try {
    const mcpClient = new MCP("mcp-supabase");
    const result = await mcpClient.invoke('mcp_supabase_query', { sql });
    return { success: true, result };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function applySchema() {
  console.log('Starting schema application...');
  console.log(`Found ${statements.length} SQL statements to execute`);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    console.log(`\nExecuting statement ${i + 1}/${statements.length}:`);
    console.log(statement.substring(0, 100) + (statement.length > 100 ? '...' : ''));
    
    const { success, result, error } = await runQuery(statement);
    
    if (success) {
      console.log('✅ Statement executed successfully');
      successCount++;
    } else {
      console.error(`❌ Error: ${error}`);
      errorCount++;
    }
  }
  
  console.log('\n===== Schema Application Summary =====');
  console.log(`Total statements: ${statements.length}`);
  console.log(`Successful: ${successCount}`);
  console.log(`Failed: ${errorCount}`);
  console.log('====================================');
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