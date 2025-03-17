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
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

// Define storage buckets
const STORAGE_BUCKETS = [
  'attachments',
  'avatars',
  'exports'
];

/**
 * Creates a bucket in Supabase Storage if it doesn't exist
 * @param {string} bucket The storage bucket name
 */
async function createBucketIfNotExists(bucket) {
  try {
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error(`Error listing buckets: ${listError.message}`);
      return false;
    }
    
    const bucketExists = buckets.some(b => b.name === bucket);
    
    if (!bucketExists) {
      console.log(`Creating bucket: ${bucket}`);
      const { error } = await supabase.storage.createBucket(bucket, {
        public: false, // Set to true if files should be publicly accessible
      });
      
      if (error) {
        console.error(`Error creating bucket ${bucket}: ${error.message}`);
        return false;
      }
      console.log(`✅ Bucket "${bucket}" created successfully`);
    } else {
      console.log(`✅ Bucket "${bucket}" already exists`);
    }
    
    return true;
  } catch (error) {
    console.error(`Error creating bucket ${bucket}:`, error);
    return false;
  }
}

/**
 * Initializes all required storage buckets
 */
async function initializeStorage() {
  console.log('=== Initializing Supabase Storage Buckets ===');
  
  let successCount = 0;
  let failedCount = 0;
  
  for (const bucket of STORAGE_BUCKETS) {
    const success = await createBucketIfNotExists(bucket);
    if (success) {
      successCount++;
    } else {
      failedCount++;
    }
  }
  
  console.log('\n=== Storage Initialization Summary ===');
  console.log(`Total buckets: ${STORAGE_BUCKETS.length}`);
  console.log(`Successfully initialized: ${successCount}`);
  
  if (failedCount > 0) {
    console.error(`Failed to initialize: ${failedCount}`);
    process.exit(1);
  } else {
    console.log('✅ All storage buckets initialized successfully');
  }
}

// Run the initialization
initializeStorage().catch(error => {
  console.error('Uncaught error during storage initialization:', error);
  process.exit(1);
}); 