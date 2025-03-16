/**
 * Direct Storage Setup Utility
 * 
 * This utility provides direct REST API calls to Supabase for setting up storage
 * when the JavaScript client encounters issues or permissions problems.
 */

// Function to create a bucket via direct REST API
export async function createBucketViaREST(bucketName: string, isPublic: boolean = true): Promise<boolean> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase credentials');
      return false;
    }
    
    console.log('Attempting to create bucket via REST API:', {
      bucketName,
      isPublic,
      urlPrefix: supabaseUrl.substring(0, 10) + '...',
    });
    
    // Direct REST call to create bucket
    const response = await fetch(`${supabaseUrl}/storage/v1/bucket`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({
        id: bucketName,
        name: bucketName,
        public: isPublic
      })
    }).catch(err => {
      console.error('Network error during fetch:', err.message);
      throw new Error(`Network error: ${err.message}`);
    });
    
    // If the response is undefined, throw an explicit error
    if (!response) {
      throw new Error('No response received from server');
    }
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries([...response.headers.entries()]));
    
    const data = await response.json().catch(err => {
      console.error('Error parsing JSON response:', err);
      throw new Error(`Error parsing response: ${err.message}`);
    });
    
    console.log('Response data:', data);
    
    if (!response.ok) {
      // Check if error is because bucket already exists
      if (data.error && (data.error.includes('already exists') || response.status === 409)) {
        console.log('Bucket already exists:', bucketName);
        return true;
      }
      
      console.error('Failed to create bucket via REST:', data, 'Status:', response.status);
      return false;
    }
    
    console.log('Successfully created bucket via REST:', bucketName);
    return true;
  } catch (error) {
    console.error('Error in createBucketViaREST:', error);
    return false;
  }
}

// Function to create storage policy via direct REST API
export async function createPolicyViaREST(
  bucketName: string, 
  policyName: string, 
  operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE',
  definition: string = 'true'
): Promise<boolean> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase credentials');
      return false;
    }
    
    console.log('Attempting to create policy via REST API:', {
      bucketName,
      policyName,
      operation,
      urlPrefix: supabaseUrl.substring(0, 10) + '...',
    });
    
    // Direct REST call to create policy
    const response = await fetch(`${supabaseUrl}/storage/v1/policies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({
        name: policyName,
        bucket_id: bucketName,
        operation,
        definition,
        check: definition
      })
    }).catch(err => {
      console.error('Network error during fetch:', err.message);
      throw new Error(`Network error: ${err.message}`);
    });
    
    // If the response is undefined, throw an explicit error
    if (!response) {
      throw new Error('No response received from server');
    }
    
    console.log('Policy creation response status:', response.status);
    console.log('Policy creation response headers:', Object.fromEntries([...response.headers.entries()]));
    
    const data = await response.json().catch(err => {
      console.error('Error parsing JSON response:', err);
      throw new Error(`Error parsing response: ${err.message}`);
    });
    
    console.log('Policy creation response data:', data);
    
    if (!response.ok) {
      // Check if error is because policy already exists
      if (data.error && (data.error.includes('already exists') || response.status === 409)) {
        console.log(`Policy ${policyName} already exists for bucket ${bucketName}`);
        return true;
      }
      
      console.error('Failed to create policy via REST:', data, 'Status:', response.status);
      return false;
    }
    
    console.log(`Successfully created ${operation} policy via REST for bucket ${bucketName}`);
    return true;
  } catch (error) {
    console.error('Error in createPolicyViaREST:', error);
    return false;
  }
}

// Set up all required storage components
export async function setupStorageCompletely(bucketName: string = 'chat-files'): Promise<{
  success: boolean;
  bucketCreated: boolean;
  policiesCreated: boolean;
  message: string;
}> {
  try {
    // Validate Supabase configuration
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return {
        success: false,
        bucketCreated: false,
        policiesCreated: false,
        message: 'Missing Supabase credentials. Check your .env.local file.'
      };
    }
    
    console.log('Starting storage setup with configuration:', {
      url: supabaseUrl.substring(0, 10) + '...',
      hasKey: !!supabaseKey,
      bucketName
    });
    
    // Step 1: Create bucket
    const bucketSuccess = await createBucketViaREST(bucketName, true);
    
    if (!bucketSuccess) {
      return {
        success: false,
        bucketCreated: false,
        policiesCreated: false,
        message: 'Failed to create storage bucket'
      };
    }
    
    // Step 2: Create all necessary policies
    const operations = ['SELECT', 'INSERT', 'UPDATE', 'DELETE'] as const;
    const policyResults = await Promise.all(
      operations.map(op => 
        createPolicyViaREST(bucketName, `allow_public_${op.toLowerCase()}`, op)
      )
    );
    
    const allPoliciesCreated = policyResults.every(result => result);
    
    return {
      success: true,
      bucketCreated: true,
      policiesCreated: allPoliciesCreated,
      message: allPoliciesCreated 
        ? 'Successfully created bucket and all policies' 
        : 'Created bucket but some policies may have failed'
    };
  } catch (error) {
    return {
      success: false,
      bucketCreated: false,
      policiesCreated: false,
      message: `Error in setupStorageCompletely: ${error instanceof Error ? error.message : String(error)}`
    };
  }
} 