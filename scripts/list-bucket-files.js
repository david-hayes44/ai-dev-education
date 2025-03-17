import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Initialize dotenv
dotenv.config({ path: '.env.local' });

// Initialize Supabase client directly with service role key for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables. Check your .env.local file.');
  console.error('SUPABASE_SERVICE_ROLE_KEY is required for admin operations.');
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

// Get bucket name from command line arguments
const bucketName = process.argv[2];
const path = process.argv[3] || '';

if (!bucketName) {
  console.error('Error: No bucket name specified');
  console.error('Usage: node list-bucket-files.js <bucket-name> [path]');
  process.exit(1);
}

/**
 * List files in a bucket
 */
async function listFiles(bucket, path = '') {
  console.log(`=== Listing files in bucket "${bucket}" ${path ? `(path: "${path}")` : ''} ===`);
  
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(path);
    
    if (error) {
      console.error('Error listing files:', error.message);
      return;
    }
    
    if (!data || data.length === 0) {
      console.log('No files found');
      return;
    }
    
    // Separate folders and files
    const folders = data.filter(item => item.id === null);
    const files = data.filter(item => item.id !== null);
    
    if (folders.length > 0) {
      console.log('\nFolders:');
      folders.forEach(folder => {
        console.log(`- ${folder.name}/`);
      });
    }
    
    if (files.length > 0) {
      console.log('\nFiles:');
      files.forEach(file => {
        const size = file.metadata?.size 
          ? `(${formatFileSize(file.metadata.size)})` 
          : '';
        console.log(`- ${file.name} ${size}`);
      });
    }
    
    console.log(`\nTotal: ${folders.length} folders, ${files.length} files`);
  } catch (error) {
    console.error('Error listing files:', error);
  }
}

/**
 * Format file size in a human-readable format
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Run the function
listFiles(bucketName, path).catch(error => {
  console.error('Uncaught error:', error);
  process.exit(1);
}); 