import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Initialize dotenv
dotenv.config({ path: '.env.local' });

// Get directory name in ESM environment
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
const bucketName = process.argv[2] || 'attachments';
const filePath = process.argv[3] || path.join(__dirname, 'test-file.txt');
const uploadPath = process.argv[4] || 'test/test-file.txt';

/**
 * Create a test file if it doesn't exist
 */
function createTestFile(filePath) {
  if (!fs.existsSync(filePath)) {
    const content = `This is a test file created at ${new Date().toISOString()}\n`;
    fs.writeFileSync(filePath, content);
    console.log(`Created test file at ${filePath}`);
  }
}

/**
 * Upload a file to a bucket
 */
async function uploadFile(bucket, filePath, uploadPath) {
  console.log(`=== Uploading file to bucket "${bucket}" ===`);
  console.log(`Local file: ${filePath}`);
  console.log(`Upload path: ${uploadPath}`);
  
  try {
    // Create the test file if it doesn't exist
    createTestFile(filePath);
    
    // Read the file
    const fileBuffer = fs.readFileSync(filePath);
    
    // Upload the file
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(uploadPath, fileBuffer, {
        cacheControl: '3600',
        upsert: true,
      });
    
    if (error) {
      console.error('Error uploading file:', error.message);
      return;
    }
    
    console.log('✅ File uploaded successfully');
    console.log('File details:', data);
    
    // Get the public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(uploadPath);
    
    console.log('Public URL:', urlData.publicUrl);
  } catch (error) {
    console.error('Error uploading file:', error);
  }
}

// Run the function
uploadFile(bucketName, filePath, uploadPath).catch(error => {
  console.error('Uncaught error:', error);
  process.exit(1);
}); 