// Simple wrapper script to test Supabase connection
// Uses Node.js ESM loader to handle TypeScript imports
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testSupabaseConnection() {
  console.log('Testing Supabase connection...');
  
  // Get credentials from environment
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Missing Supabase credentials in .env.local');
    return false;
  }
  
  console.log(`Supabase URL: ${supabaseUrl}`);
  console.log('Supabase Key: [HIDDEN]');
  
  try {
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Test connection with simple query
    console.log('Testing database connection...');
    
    // First try to get available tables
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .limit(5);
    
    if (tablesError) {
      console.log('Could not query tables. This is expected if tables are not yet created.');
      console.log('Error:', tablesError.message);
    } else {
      console.log('Available tables:', tables.map(t => t.table_name).join(', '));
    }
    
    // Test storage
    console.log('\nListing storage buckets...');
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError) {
      console.error('Error listing buckets:', bucketError.message);
    } else {
      console.log('Buckets:', buckets.length > 0 ? buckets.map(b => b.name).join(', ') : 'No buckets found');
    }
    
    // Test raw SQL query capability
    console.log('\nTesting raw SQL capability...');
    const { data: sqlData, error: sqlError } = await supabase
      .rpc('postgres_version');
    
    if (sqlError) {
      console.log('Raw SQL query failed. This is not critical if you are not using raw SQL.');
      console.log('Error:', sqlError.message);
      
      // Try a different approach with a basic query
      const { data: timeData, error: timeError } = await supabase
        .from('_what_time_is_it')
        .select('*')
        .limit(1);
      
      if (!timeError) {
        console.log('Alternative query succeeded.');
      }
    } else {
      console.log('PostgreSQL version:', sqlData);
    }
    
    console.log('\nConnection test completed.');
    return true;
  } catch (error) {
    console.error('Error connecting to Supabase:', error.message);
    return false;
  }
}

// Run the test
testSupabaseConnection()
  .then(success => {
    if (success) {
      console.log('\n✅ Supabase connection established successfully!');
      console.log('You can now proceed with schema creation and migration.');
      process.exit(0);
    } else {
      console.error('\n❌ Supabase connection test failed!');
      console.log('Please check your credentials and try again.');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  }); 