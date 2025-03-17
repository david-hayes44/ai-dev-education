// Script to run the Supabase schema creation SQL
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runSqlSchema() {
  console.log('Starting Supabase schema creation...');
  
  // Get Supabase credentials from environment
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Missing Supabase credentials in .env.local');
    return false;
  }
  
  try {
    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Read the SQL schema file
    const schemaPath = path.join(__dirname, 'create-supabase-schema.sql');
    const sqlSchema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split the SQL statements by semicolon
    const statements = sqlSchema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    console.log(`Found ${statements.length} SQL statements to execute`);
    
    // Create a direct PostgreSQL connection via fetch to the Supabase API
    const postgrestUrl = `${supabaseUrl}/rest/v1/rpc/execute_sql`;
    
    // Execute each statement sequentially
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      const statementPreview = statement.length > 50 
        ? statement.substring(0, 50) + '...' 
        : statement;
        
      console.log(`Executing statement ${i + 1}/${statements.length}: ${statementPreview}`);
      
      try {
        // Use the SQL function in Supabase to execute the statement
        const { error } = await supabase.rpc('execute_sql', { 
          query: statement
        });
        
        if (error) {
          console.error(`Error executing statement ${i + 1}: ${error.message}`);
          console.error('Statement:', statement);
          // Continue with the next statement despite errors
        }
      } catch (err) {
        console.error(`Error executing statement ${i + 1}: ${err.message}`);
        console.error('Statement:', statement);
        // Continue with the next statement despite errors
      }
    }
    
    console.log('Supabase schema creation completed!');
    return true;
    
  } catch (error) {
    console.error('Error running SQL schema:', error);
    return false;
  }
}

// Run the schema creation
runSqlSchema()
  .then(success => {
    if (success) {
      console.log('\n✅ Schema creation completed!');
      process.exit(0);
    } else {
      console.error('\n❌ Schema creation failed!');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  }); 