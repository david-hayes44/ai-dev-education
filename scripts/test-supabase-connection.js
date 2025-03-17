// Test script for Supabase connectivity
import { supabase } from '../lib/supabase.ts';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

async function testSupabaseConnection() {
  console.log('Testing Supabase connection...');
  console.log(`Supabase URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not set'}`);
  
  try {
    // Test a simple query to confirm database access
    const { data, error } = await supabase
      .from('profiles')
      .select('count(*)')
      .limit(1);
    
    if (error) {
      console.error('Error connecting to Supabase:', error.message);
      return false;
    }
    
    console.log('Successfully connected to Supabase!');
    console.log('Profile count:', data ? data[0]?.count : 'No data');
    
    // Test storage buckets
    console.log('\nChecking storage buckets...');
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError) {
      console.error('Error listing storage buckets:', bucketError.message);
      return false;
    }
    
    if (buckets && buckets.length > 0) {
      console.log('Available buckets:');
      buckets.forEach(bucket => {
        console.log(`- ${bucket.name} (${bucket.public ? 'public' : 'private'})`);
      });
    } else {
      console.log('No storage buckets found. Please create the required buckets.');
    }
    
    // Test authentication settings
    console.log('\nChecking authentication providers...');
    const { data: authSettings, error: authError } = await supabase.auth.getSettings();
    
    if (authError) {
      console.error('Error getting auth settings:', authError.message);
    } else if (authSettings) {
      console.log('Auth configuration is available.');
    }
    
    return true;
  } catch (error) {
    console.error('Unexpected error testing Supabase:', error);
    return false;
  }
}

async function main() {
  const success = await testSupabaseConnection();
  
  if (success) {
    console.log('\n✅ Supabase connection test completed successfully');
    console.log('You can now proceed with the migration process.');
  } else {
    console.log('\n❌ Supabase connection test failed');
    console.log('Please check your configuration and try again.');
  }
  
  process.exit(success ? 0 : 1);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
}); 