import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

// Get directory name in ESM environment
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');
const envPath = path.join(rootDir, '.env.local');

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Prompt for input
const prompt = (question) => new Promise((resolve) => {
  rl.question(question, (answer) => resolve(answer));
});

async function setupEnv() {
  console.log('=== Supabase Environment Setup ===');
  console.log('This script will help you set up your Supabase credentials.');
  console.log('You can find these in your Supabase project dashboard.');
  console.log('');
  
  // Get Supabase project URL
  const supabaseUrl = await prompt('Enter your Supabase project URL (e.g., https://your-project-id.supabase.co): ');
  
  // Get Supabase anon key
  const supabaseAnonKey = await prompt('Enter your Supabase anon key: ');
  
  // Extract project ID from URL
  const projectId = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
  
  if (!projectId) {
    console.error('Invalid Supabase URL format. Expected https://your-project-id.supabase.co');
    process.exit(1);
  }
  
  // Get database password
  const dbPassword = await prompt('Enter your Supabase database password: ');
  
  // Create .env.local content
  const envContent = `# Supabase connection details
NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${supabaseAnonKey}

# PostgreSQL connection details
POSTGRES_HOST=db.${projectId}.supabase.co
POSTGRES_DATABASE=postgres
POSTGRES_USER=postgres
POSTGRES_PASSWORD=${dbPassword}
POSTGRES_PORT=5432

# Connection string (for backward compatibility)
POSTGRES_CONNECTION_STRING=postgresql://postgres:${dbPassword}@db.${projectId}.supabase.co:5432/postgres
`;

  // Write to .env.local
  fs.writeFileSync(envPath, envContent);
  
  console.log('');
  console.log('✅ .env.local file created successfully!');
  console.log(`File location: ${envPath}`);
  console.log('');
  console.log('Next steps:');
  console.log('1. Run "npm run supabase:test" to test your connection');
  console.log('2. Run "npm run supabase:pg-schema" to create the database schema');
  
  rl.close();
}

setupEnv().catch(error => {
  console.error('Error setting up environment:', error);
  process.exit(1);
}); 