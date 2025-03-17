import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Initialize dotenv
dotenv.config({ path: '.env.local' });

// Initialize Supabase client directly with service role key for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables. Check your .env.local file.');
  console.error('SUPABASE_SERVICE_ROLE_KEY is required for bucket creation.');
  process.exit(1);
}

const supabase = createClient(
  supabaseUrl,
  supabaseServiceKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

// Define storage buckets
const STORAGE_BUCKETS = ['attachments', 'avatars', 'exports'];

/**
 * Check if storage buckets exist
 */
async function checkStorageBuckets() {
  console.log('=== Checking Supabase Storage Buckets ===');
  
  try {
    // List all buckets
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('Error listing buckets:', error.message);
      return;
    }
    
    console.log(`Found ${buckets.length} buckets:`);
    
    // Check each required bucket
    for (const requiredBucket of STORAGE_BUCKETS) {
      const found = buckets.find(b => b.name === requiredBucket);
      
      if (found) {
        console.log(`✅ ${requiredBucket}: Available (created at ${new Date(found.created_at).toLocaleString()}, public: ${found.public ? 'Yes' : 'No'})`);
      } else {
        console.log(`❌ ${requiredBucket}: Missing`);
      }
    }
    
    // Check for any additional buckets
    const additionalBuckets = buckets.filter(b => !STORAGE_BUCKETS.includes(b.name));
    
    if (additionalBuckets.length > 0) {
      console.log('\nAdditional buckets found:');
      for (const bucket of additionalBuckets) {
        console.log(`- ${bucket.name} (created at ${new Date(bucket.created_at).toLocaleString()}, public: ${bucket.public ? 'Yes' : 'No'})`);
      }
    }
    
    // Check if all required buckets exist
    const allExist = STORAGE_BUCKETS.every(bucket => buckets.some(b => b.name === bucket));
    
    console.log('\n=== Storage Buckets Summary ===');
    console.log(`Required buckets: ${STORAGE_BUCKETS.length}`);
    console.log(`Available: ${buckets.filter(b => STORAGE_BUCKETS.includes(b.name)).length}`);
    console.log(`Missing: ${STORAGE_BUCKETS.length - buckets.filter(b => STORAGE_BUCKETS.includes(b.name)).length}`);
    
    if (allExist) {
      console.log('\n✅ All required storage buckets are available');
    } else {
      console.log('\n❌ Some required storage buckets are missing');
    }
  } catch (error) {
    console.error('Error checking storage buckets:', error);
  }
}

// Run the check
checkStorageBuckets().catch(error => {
  console.error('Uncaught error during storage check:', error);
  process.exit(1);
}); 