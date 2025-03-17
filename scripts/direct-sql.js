import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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

// This function will be called by the MCP bridge
export async function runSqlStatements() {
  console.log('Starting schema application...');
  console.log(`Found ${statements.length} SQL statements to execute`);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    console.log(`\nExecuting statement ${i + 1}/${statements.length}:`);
    console.log(statement.substring(0, 100) + (statement.length > 100 ? '...' : ''));
    
    try {
      // This assumes mcp_supabase_query is available in the global scope
      // when this code is executed by the MCP bridge
      const result = await mcp_supabase_query({ sql: statement });
      console.log('✅ Statement executed successfully');
      successCount++;
    } catch (error) {
      console.error(`❌ Error: ${error.message || error}`);
      errorCount++;
    }
  }
  
  console.log('\n===== Schema Application Summary =====');
  console.log(`Total statements: ${statements.length}`);
  console.log(`Successful: ${successCount}`);
  console.log(`Failed: ${errorCount}`);
  console.log('====================================');
  
  return { successCount, errorCount, total: statements.length };
}

// If this script is run directly (not imported)
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('This script is meant to be used by the MCP bridge.');
  console.log('Please run it through the MCP bridge using:');
  console.log('npm run supabase:mcp-schema');
} 