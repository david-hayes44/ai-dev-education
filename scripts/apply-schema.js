import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Initialize dotenv
dotenv.config({ path: '.env.local' });

// Get current file directory in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const schemaPath = path.join(__dirname, 'supabase-schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

// Split the schema into individual statements
const statements = schema
  .split(';')
  .map(stmt => stmt.trim())
  .filter(stmt => stmt.length > 0)
  .map(stmt => stmt + ';');

async function applySchema() {
  console.log('Starting schema application...');
  
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    try {
      console.log(`Executing statement ${i + 1}/${statements.length}`);
      await executeQuery(statement);
      console.log(`✅ Statement ${i + 1} executed successfully`);
    } catch (error) {
      console.error(`❌ Error executing statement ${i + 1}:`, error.message);
      console.log('Statement:', statement);
    }
  }
  
  console.log('Schema application complete!');
}

async function executeQuery(sql) {
  // Using the global mcp_supabase_query function
  try {
    const result = await mcp_supabase_query({ sql });
    return result;
  } catch (error) {
    throw error;
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