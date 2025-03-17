import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Initialize dotenv
dotenv.config({ path: '.env.local' });

// Get directory name in ESM environment
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the schema file
const schemaPath = path.join(__dirname, 'supabase-schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials. Check your .env.local file.');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Split SQL into individual statements
const statements = schema
  .split(';')
  .map(stmt => stmt.trim())
  .filter(stmt => stmt.length > 0)
  .map(stmt => stmt + ';');

async function applySchema() {
  console.log('Starting schema application...');
  console.log(`Found ${statements.length} SQL statements to execute`);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    try {
      console.log(`\nExecuting statement ${i + 1}/${statements.length}:`);
      console.log(statement.substring(0, 100) + (statement.length > 100 ? '...' : ''));
      
      // Execute SQL using the Postgres interface
      const { data, error } = await supabase.auth.getSession()
        .then(async ({ data: { session } }) => {
          if (!session) {
            throw new Error('No session available. Cannot execute SQL.');
          }
          return await supabase.rpc('pg_catalog', {
            query: statement
          }, {
            headers: {
              Authorization: `Bearer ${session.access_token}`
            }
          });
        });
      
      if (error) {
        console.error(`❌ Error: ${error.message}`);
        errorCount++;
      } else {
        console.log('✅ Statement executed successfully');
        successCount++;
      }
    } catch (error) {
      console.error(`❌ Execution error: ${error.message}`);
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