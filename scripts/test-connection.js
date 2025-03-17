import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import pkg from 'pg';

const { Client } = pkg;

// Initialize dotenv
dotenv.config({ path: '.env.local' });

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Get PostgreSQL credentials from environment variables
const host = process.env.POSTGRES_HOST;
const database = process.env.POSTGRES_DATABASE;
const user = process.env.POSTGRES_USER;
const password = process.env.POSTGRES_PASSWORD;
const port_db = process.env.POSTGRES_PORT;

async function testSupabaseConnection() {
  console.log('=== Supabase Connection Test ===');
  
  // Check if credentials are set
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials. Run "npm run supabase:setup" first.');
    return false;
  }
  
  console.log('Supabase URL:', supabaseUrl);
  console.log('Testing Supabase connection...');
  
  try {
    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Test connection by getting user
    const { data, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('❌ Supabase connection error:', error.message);
      return false;
    }
    
    console.log('✅ Supabase connection successful!');
    return true;
  } catch (error) {
    console.error('❌ Supabase connection error:', error.message);
    return false;
  }
}

async function testPostgresConnection() {
  console.log('\n=== PostgreSQL Connection Test ===');
  
  // Check if credentials are set
  if (!host || !database || !user || !password || !port_db) {
    console.error('❌ Missing PostgreSQL credentials. Run "npm run supabase:setup" first.');
    return false;
  }
  
  console.log('PostgreSQL Host:', host);
  console.log('PostgreSQL Database:', database);
  console.log('PostgreSQL User:', user);
  console.log('Testing PostgreSQL connection...');
  
  // Connection config
  const connectionConfig = {
    host,
    database,
    user,
    password,
    port: port_db,
    ssl: { rejectUnauthorized: false }
  };
  
  const client = new Client(connectionConfig);
  
  try {
    await client.connect();
    console.log('✅ PostgreSQL connection successful!');
    
    // Test query
    const result = await client.query('SELECT current_database() as db, current_user as user');
    console.log('Query result:', result.rows[0]);
    
    await client.end();
    return true;
  } catch (error) {
    console.error('❌ PostgreSQL connection error:', error.message);
    console.error('Full error:', error);
    
    if (error.code === 'ENOTFOUND') {
      console.error('Host not found. Check your POSTGRES_HOST environment variable.');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('Connection refused. Make sure PostgreSQL is running and accessible.');
    } else if (error.code === '28P01') {
      console.error('Authentication failed. Check your POSTGRES_USER and POSTGRES_PASSWORD.');
    }
    
    try {
      await client.end();
    } catch (e) {
      // Ignore
    }
    
    return false;
  }
}

async function runTests() {
  const supabaseResult = await testSupabaseConnection();
  const postgresResult = await testPostgresConnection();
  
  console.log('\n=== Test Summary ===');
  console.log('Supabase Connection:', supabaseResult ? '✅ Success' : '❌ Failed');
  console.log('PostgreSQL Connection:', postgresResult ? '✅ Success' : '❌ Failed');
  
  if (supabaseResult && postgresResult) {
    console.log('\n✅ All tests passed! Your Supabase setup is working correctly.');
    console.log('Next step: Run "npm run supabase:pg-schema" to create the database schema.');
  } else {
    console.log('\n❌ Some tests failed. Please check the errors above and fix your configuration.');
    console.log('You may need to run "npm run supabase:setup" again with the correct credentials.');
  }
}

runTests().catch(error => {
  console.error('Error running tests:', error);
  process.exit(1);
}); 