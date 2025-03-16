/**
 * Test script to verify Supabase connection
 * This script connects to Supabase and performs basic operations
 */

import { supabase } from '../lib/supabase';

async function testSupabaseConnection() {
  console.log('Testing Supabase connection...');
  
  try {
    // Test 1: Check if Supabase is accessible
    const { data, error } = await supabase.from('sessions').select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('Error connecting to Supabase:', error);
      return;
    }
    
    console.log('✅ Successfully connected to Supabase');
    
    // Test 2: Create a test bucket if it doesn't exist
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('Error listing storage buckets:', bucketsError);
    } else {
      console.log('Available storage buckets:', buckets.map(b => b.name).join(', ') || 'None');
      
      // Check if our bucket exists
      const hasChatFilesBucket = buckets.some(b => b.name === 'chat-files');
      
      if (!hasChatFilesBucket) {
        console.log('Creating chat-files bucket...');
        
        const { data: newBucket, error: createError } = await supabase.storage.createBucket('chat-files', {
          public: false,
        });
        
        if (createError) {
          console.error('Error creating chat-files bucket:', createError);
        } else {
          console.log('✅ Successfully created chat-files bucket');
        }
      } else {
        console.log('✅ chat-files bucket already exists');
      }
    }
    
    // Test 3: Test database schema by creating and querying a test session
    console.log('Testing database schema...');
    
    // Create a test session
    const testSessionId = 'test-session-' + Date.now();
    const { error: insertError } = await supabase
      .from('sessions')
      .insert({
        id: testSessionId,
        title: 'Test Session',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    
    if (insertError) {
      console.error('Error creating test session:', insertError);
      console.log('You may need to run the SQL schema setup script first.');
    } else {
      console.log('✅ Successfully created test session');
      
      // Clean up - delete the test session
      const { error: deleteError } = await supabase
        .from('sessions')
        .delete()
        .eq('id', testSessionId);
      
      if (deleteError) {
        console.error('Error deleting test session:', deleteError);
      } else {
        console.log('✅ Successfully deleted test session');
      }
    }
    
    console.log('\nSuggested next steps:');
    console.log('1. Run the SQL schema setup script to create database tables');
    console.log('2. Add Supabase environment variables to .env.local');
    console.log('3. Set up storage buckets and security policies');
    
  } catch (error) {
    console.error('Unexpected error testing Supabase connection:', error);
  }
}

if (require.main === module) {
  testSupabaseConnection().catch(console.error);
} 