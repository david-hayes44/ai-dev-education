import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import chalk from 'chalk';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Define storage buckets to create
const STORAGE_BUCKETS = [
  { name: 'attachments', isPublic: false },
  { name: 'avatars', isPublic: true },
  { name: 'exports', isPublic: false }
];

// Initialize Supabase client with service role key for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.error(chalk.red('Error: NEXT_PUBLIC_SUPABASE_URL is not set in .env.local'));
  process.exit(1);
}

if (!supabaseServiceKey) {
  console.error(chalk.red('Error: SUPABASE_SERVICE_ROLE_KEY is not set in .env.local'));
  console.error(chalk.yellow('You need to get this from your Supabase dashboard:'));
  console.error(chalk.yellow('  1. Go to https://app.supabase.com'));
  console.error(chalk.yellow('  2. Select your project'));
  console.error(chalk.yellow('  3. Go to Project Settings > API'));
  console.error(chalk.yellow('  4. Copy the "service_role key" (NOT the anon key)'));
  console.error(chalk.yellow('  5. Add it to your .env.local file as SUPABASE_SERVICE_ROLE_KEY'));
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

/**
 * Creates a bucket if it doesn't exist
 * @param {Object} bucketConfig - Bucket configuration
 * @param {string} bucketConfig.name - Bucket name
 * @param {boolean} bucketConfig.isPublic - Whether the bucket is public
 * @returns {Promise<Object>} Result object with success status and message
 */
async function createBucketIfNotExists({ name, isPublic }) {
  console.log(chalk.blue(`⏳ Processing bucket: ${name}`));
  
  try {
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      return { 
        success: false, 
        message: `Error listing buckets: ${listError.message}` 
      };
    }
    
    const bucketExists = buckets.some(b => b.name === name);
    
    if (!bucketExists) {
      const { error: createError } = await supabase.storage.createBucket(name, {
        public: isPublic
      });
      
      if (createError) {
        return {
          success: false,
          message: `Error creating bucket ${name}: ${createError.message}`
        };
      }
      
      return {
        success: true,
        message: `Created bucket "${name}" (${isPublic ? 'public' : 'private'})`
      };
    }
    
    return {
      success: true,
      message: `Bucket "${name}" already exists`
    };
  } catch (error) {
    return {
      success: false,
      message: `Unexpected error with bucket ${name}: ${error.message}`
    };
  }
}

/**
 * Create all required storage buckets
 */
async function createAllBuckets() {
  console.log(chalk.green('=== Creating Supabase Storage Buckets ==='));
  console.log(chalk.yellow(`URL: ${supabaseUrl}`));
  console.log();
  
  let results = [];
  
  // Process buckets sequentially to avoid rate limiting
  for (const bucket of STORAGE_BUCKETS) {
    const result = await createBucketIfNotExists(bucket);
    results.push({ bucket, ...result });
    
    if (result.success) {
      console.log(chalk.green(`✅ ${result.message}`));
    } else {
      console.log(chalk.red(`❌ ${result.message}`));
    }
  }
  
  // Summary
  const successful = results.filter(r => r.success).length;
  const failed = STORAGE_BUCKETS.length - successful;
  
  console.log();
  console.log(chalk.green('=== Storage Bucket Creation Summary ==='));
  console.log(chalk.blue(`Total buckets: ${STORAGE_BUCKETS.length}`));
  console.log(chalk.green(`Successfully created/verified: ${successful}`));
  
  if (failed > 0) {
    console.log(chalk.red(`Failed: ${failed}`));
    
    // List failed buckets
    console.log();
    console.log(chalk.red('Failed buckets:'));
    results.filter(r => !r.success).forEach(r => {
      console.log(chalk.red(`- ${r.bucket.name}: ${r.message}`));
    });
    
    process.exit(1);
  } else {
    console.log(chalk.green('\n✅ All storage buckets created/verified successfully'));
  }
}

// Run the bucket creation
createAllBuckets().catch(error => {
  console.error(chalk.red('\n❌ Unexpected error:'), error);
  process.exit(1);
}); 