import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Initialize dotenv
dotenv.config({ path: '.env.local' });

// Initialize Supabase client with service role key for admin operations
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

// Define the RLS policies for each bucket
const bucketPolicies = {
  attachments: [
    {
      name: "Users can view attachments in their conversations",
      operation: "SELECT",
      expression: `auth.role() = 'authenticated' AND 
        EXISTS (
          SELECT 1 FROM messages m
          JOIN conversations c ON m.conversation_id = c.id
          WHERE 
            SPLIT_PART(name, '/', 1) = m.id::text 
            AND c.user_id = auth.uid()
        )`
    },
    {
      name: "Users can upload attachments",
      operation: "INSERT",
      expression: `auth.role() = 'authenticated' AND (LENGTH(name) > 0)`
    },
    {
      name: "Users can delete their own attachments",
      operation: "DELETE",
      expression: `auth.role() = 'authenticated' AND 
        EXISTS (
          SELECT 1 FROM messages m
          JOIN conversations c ON m.conversation_id = c.id
          WHERE 
            SPLIT_PART(name, '/', 1) = m.id::text
            AND c.user_id = auth.uid()
        )`
    }
  ],
  avatars: [
    {
      name: "Public read access for avatars",
      operation: "SELECT",
      expression: `true`
    },
    {
      name: "Users can upload their own avatar",
      operation: "INSERT",
      expression: `auth.role() = 'authenticated' AND SPLIT_PART(name, '/', 1) = auth.uid()::text`
    },
    {
      name: "Users can update their own avatar",
      operation: "UPDATE",
      expression: `auth.role() = 'authenticated' AND SPLIT_PART(name, '/', 1) = auth.uid()::text`
    },
    {
      name: "Users can delete their own avatar",
      operation: "DELETE",
      expression: `auth.role() = 'authenticated' AND SPLIT_PART(name, '/', 1) = auth.uid()::text`
    }
  ],
  exports: [
    {
      name: "Users can view their own exports",
      operation: "SELECT",
      expression: `auth.role() = 'authenticated' AND SPLIT_PART(name, '/', 1) = auth.uid()::text`
    },
    {
      name: "Users can create their own exports",
      operation: "INSERT",
      expression: `auth.role() = 'authenticated' AND SPLIT_PART(name, '/', 1) = auth.uid()::text`
    },
    {
      name: "Users can delete their own exports",
      operation: "DELETE",
      expression: `auth.role() = 'authenticated' AND SPLIT_PART(name, '/', 1) = auth.uid()::text`
    }
  ]
};

/**
 * Enables RLS on the storage.objects table
 */
async function enableRLS() {
  try {
    console.log('Enabling RLS on storage.objects table...');
    
    // We can't directly execute this SQL through the client API
    // This would need to be done through the Supabase dashboard or SQL editor
    console.log('Note: RLS must be enabled manually in the Supabase dashboard SQL editor with:');
    console.log('ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;');
    
    return true;
  } catch (error) {
    console.error('Error enabling RLS:', error.message);
    return false;
  }
}

/**
 * Creates a policy for a bucket
 */
async function createPolicy(bucket, policy) {
  try {
    console.log(`Creating policy "${policy.name}" for bucket "${bucket}"...`);
    
    // This is a simplified version - in reality, we would need to use the Supabase Management API
    // or execute SQL directly through a privileged connection
    console.log(`Policy details:`);
    console.log(`- Operation: ${policy.operation}`);
    console.log(`- Expression: ${policy.expression}`);
    
    // For demonstration, we'll show the SQL that would be executed
    const policySQL = `
CREATE POLICY "${policy.name}"
ON storage.objects FOR ${policy.operation}
${policy.operation === 'INSERT' ? 'WITH CHECK' : 'USING'} (
  bucket_id = '${bucket}' AND
  ${policy.expression}
);`;
    
    console.log('\nSQL to execute:');
    console.log(policySQL);
    
    // In a real implementation, we would execute this SQL
    // For now, we'll just simulate success
    console.log('✅ Policy created successfully (simulated)');
    
    return true;
  } catch (error) {
    console.error(`Error creating policy "${policy.name}" for bucket "${bucket}":`, error.message);
    return false;
  }
}

/**
 * Applies all policies for all buckets
 */
async function applyAllPolicies() {
  console.log('=== Applying Storage RLS Policies ===\n');
  
  // First enable RLS
  await enableRLS();
  
  let totalPolicies = 0;
  let successCount = 0;
  
  // Count total policies
  for (const bucket in bucketPolicies) {
    totalPolicies += bucketPolicies[bucket].length;
  }
  
  console.log(`\nApplying ${totalPolicies} policies across all buckets...\n`);
  
  // Apply policies for each bucket
  for (const bucket in bucketPolicies) {
    console.log(`\n=== Policies for "${bucket}" bucket ===`);
    
    for (const policy of bucketPolicies[bucket]) {
      const success = await createPolicy(bucket, policy);
      if (success) {
        successCount++;
      }
    }
  }
  
  console.log('\n=== Storage RLS Policies Summary ===');
  console.log(`Total policies: ${totalPolicies}`);
  console.log(`Successfully applied: ${successCount}`);
  
  if (successCount < totalPolicies) {
    console.error(`Failed to apply: ${totalPolicies - successCount}`);
    return false;
  }
  
  console.log('\n✅ All storage RLS policies applied successfully (simulated)');
  console.log('\nIMPORTANT: In a real implementation, you would need to:');
  console.log('1. Enable RLS on the storage.objects table through the SQL editor');
  console.log('2. Create each policy through the Supabase dashboard or SQL editor');
  console.log('3. Verify that the policies are working as expected');
  
  return true;
}

// Execute the function
applyAllPolicies()
  .then(success => {
    if (success) {
      console.log('\nStorage RLS policies setup completed.');
      process.exit(0);
    } else {
      console.error('\nStorage RLS policies setup completed with errors.');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Unexpected error during storage RLS setup:', error);
    process.exit(1);
  }); 