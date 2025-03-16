import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create a Supabase client on the server side
// This will have more reliable connections than client-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: NextRequest) {
  try {
    // Check if Supabase is properly configured
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Supabase credentials not configured' },
        { status: 500 }
      );
    }

    // Parse the form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const bucketName = formData.get('bucket') as string || 'chat-files';
    
    // Ensure the bucket exists
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError) {
      console.error('Error listing buckets:', bucketError);
      return NextResponse.json(
        { error: `Error listing buckets: ${bucketError.message}` },
        { status: 500 }
      );
    }
    
    const bucketExists = buckets.some((b: { name: string }) => b.name === bucketName);
    
    if (!bucketExists) {
      console.log(`Bucket ${bucketName} not found, creating it...`);
      
      // Create bucket
      const { data: newBucket, error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true
      });
      
      if (createError) {
        console.error('Error creating bucket:', createError);
        return NextResponse.json(
          { error: `Error creating bucket: ${createError.message}` },
          { status: 500 }
        );
      }
      
      // Set bucket policies - use direct SQL query since the JS client doesn't support policy creation
      console.log('Bucket created, but policies must be set manually in the dashboard');
      // We can't create policies directly from the JavaScript client
      // This requires using the Supabase dashboard or REST API with proper admin privileges
    }
    
    // Generate a unique file name
    const timestamp = new Date().getTime();
    const fileName = `${timestamp}-${file.name}`;
    
    // Handle ArrayBuffer conversion
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);
    
    // Upload file to Supabase
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      console.error('Error uploading file:', error);
      return NextResponse.json(
        { error: `Error uploading file: ${error.message}` },
        { status: 500 }
      );
    }
    
    // Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(data.path);
    
    return NextResponse.json({
      success: true,
      url: publicUrlData.publicUrl,
      path: data.path,
      bucket: bucketName,
      fileName
    });
  } catch (error) {
    console.error('Unexpected error during upload:', error);
    return NextResponse.json(
      { error: `Unexpected error: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
} 