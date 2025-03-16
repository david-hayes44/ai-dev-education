"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'

export default function SupabaseDirectSetupPage() {
  const [logMessages, setLogMessages] = useState<string[]>([])
  const [configStatus, setConfigStatus] = useState<'checking' | 'ready' | 'error'>('checking')
  const [bucketStatus, setBucketStatus] = useState<'none' | 'exists' | 'created' | 'error'>('none')
  const [policyStatus, setPolicyStatus] = useState<'none' | 'created' | 'error'>('none')
  const [isSettingUp, setIsSettingUp] = useState(false)
  
  // Function to add log messages
  const log = (message: string) => {
    setLogMessages(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`])
  }
  
  // Check initial configuration
  useEffect(() => {
    const checkConfiguration = async () => {
      log('Checking Supabase configuration...')
      
      // Check if Supabase is properly configured
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        log('❌ Missing Supabase environment variables')
        setConfigStatus('error')
        return
      }
      
      try {
        // Try a simple request to verify connectivity
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          log(`❌ Supabase connection error: ${error.message}`)
          setConfigStatus('error')
          return
        }
        
        log('✅ Supabase configuration verified')
        setConfigStatus('ready')
        
        // Check if buckets exist
        await checkBuckets()
      } catch (err) {
        log(`❌ Unexpected error: ${err instanceof Error ? err.message : String(err)}`)
        setConfigStatus('error')
      }
    }
    
    checkConfiguration()
  }, [])
  
  // Check if storage buckets exist
  const checkBuckets = async () => {
    log('Checking for existing storage buckets...')
    
    try {
      const { data: buckets, error } = await supabase.storage.listBuckets()
      
      if (error) {
        log(`❌ Error listing buckets: ${error.message}`)
        return
      }
      
      // Check if the chat-files bucket exists
      const chatFilesBucket = buckets?.find(b => b.name === 'chat-files')
      
      if (chatFilesBucket) {
        log('✅ chat-files bucket already exists')
        setBucketStatus('exists')
      } else {
        log('⚠️ chat-files bucket does not exist yet')
        setBucketStatus('none')
      }
    } catch (err) {
      log(`❌ Error checking buckets: ${err instanceof Error ? err.message : String(err)}`)
    }
  }
  
  // Create the storage bucket
  const createBucket = async () => {
    log('Creating chat-files bucket...')
    
    try {
      const { data, error } = await supabase.storage.createBucket(
        'chat-files',
        { public: true } // Make bucket public for easier testing
      )
      
      if (error) {
        if (error.message.includes('already exists')) {
          log('✅ Bucket already exists, continuing...')
          setBucketStatus('exists')
          return true
        }
        
        log(`❌ Error creating bucket: ${error.message}`)
        setBucketStatus('error')
        return false
      }
      
      log('✅ chat-files bucket created successfully')
      setBucketStatus('created')
      return true
    } catch (err) {
      log(`❌ Unexpected error creating bucket: ${err instanceof Error ? err.message : String(err)}`)
      setBucketStatus('error')
      return false
    }
  }
  
  // Create storage policies
  const createPolicies = async () => {
    log('Setting up storage policies...')
    
    try {
      // Create multiple policies for different operations
      const operations = ['select', 'insert', 'update', 'delete']
      let success = true
      
      for (const operation of operations) {
        log(`Creating ${operation} policy...`)
        
        // This uses direct SQL since the Supabase JS client doesn't have a method
        // to create storage policies easily
        const { error } = await supabase.rpc('create_storage_policy', {
          bucket_name: 'chat-files',
          policy_name: `allow_public_${operation}`,
          definition: 'true', // Allow all operations for testing
          operation: operation.toUpperCase()
        })
        
        if (error) {
          if (error.message.includes('already exists')) {
            log(`⚠️ ${operation} policy already exists, skipping`)
          } else {
            log(`❌ Error creating ${operation} policy: ${error.message}`)
            success = false
          }
        } else {
          log(`✅ ${operation} policy created successfully`)
        }
      }
      
      if (success) {
        setPolicyStatus('created')
        return true
      } else {
        setPolicyStatus('error')
        
        // Try direct SQL approach for creating policies
        log('Attempting alternative method to create policies...')
        const { error } = await supabase.rpc('execute_sql', {
          sql: `
            BEGIN;
            
            -- Allow public read access
            INSERT INTO storage.policies (name, bucket_id, definition)
            VALUES (
              'Allow public read access',
              'chat-files',
              '{"bucket_id":"chat-files","created_at":null,"id":null,"name":null,"owner":null,"updated_at":null,"allowed_mime_types":null,"avif_autodetection":false,"file_size_limit":10485760,"object_ownership":null,"owner_id":null,"path_prefix":null,"public":true,"version":0}'
            )
            ON CONFLICT (name, bucket_id) DO NOTHING;
            
            COMMIT;
          `
        })
        
        if (error) {
          log(`❌ Alternative policy creation failed: ${error.message}`)
          return false
        }
        
        log('✅ Alternative policy creation method may have succeeded')
        setPolicyStatus('created')
        return true
      }
    } catch (err) {
      log(`❌ Unexpected error creating policies: ${err instanceof Error ? err.message : String(err)}`)
      setPolicyStatus('error')
      return false
    }
  }
  
  // Direct upload test to verify functionality
  const testFileUpload = async () => {
    log('Testing direct file upload...')
    
    try {
      // Create a small test file in memory
      const testContent = 'This is a test file for Supabase storage'
      const testFile = new File([testContent], 'test-file.txt', { type: 'text/plain' })
      
      // Upload the file
      const { data, error } = await supabase.storage
        .from('chat-files')
        .upload(`test-files/test-${Date.now()}.txt`, testFile)
      
      if (error) {
        log(`❌ Upload test failed: ${error.message}`)
        return false
      }
      
      log('✅ Test file uploaded successfully!')
      log(`📄 File path: ${data.path}`)
      
      // Get the URL
      const { data: { publicUrl } } = supabase.storage
        .from('chat-files')
        .getPublicUrl(data.path)
      
      log(`🔗 File URL: ${publicUrl}`)
      
      return true
    } catch (err) {
      log(`❌ Unexpected error in upload test: ${err instanceof Error ? err.message : String(err)}`)
      return false
    }
  }
  
  // Run full setup
  const runFullSetup = async () => {
    setIsSettingUp(true)
    log('Starting complete Supabase storage setup...')
    
    try {
      // Step 1: Create bucket if needed
      if (bucketStatus !== 'exists' && bucketStatus !== 'created') {
        const bucketSuccess = await createBucket()
        if (!bucketSuccess) {
          log('❌ Failed to create bucket, stopping setup')
          setIsSettingUp(false)
          return
        }
      }
      
      // Step 2: Create policies
      const policySuccess = await createPolicies()
      if (!policySuccess) {
        log('⚠️ Some policies may not have been created, but continuing...')
      }
      
      // Step 3: Test upload
      const uploadSuccess = await testFileUpload()
      if (uploadSuccess) {
        log('🎉 Setup completed successfully! Storage is now working.')
      } else {
        log('❌ Setup completed with errors. Storage may not work correctly.')
      }
    } catch (err) {
      log(`❌ Setup error: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setIsSettingUp(false)
    }
  }
  
  return (
    <div className="container py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-3">Supabase Direct Storage Setup</h1>
      <p className="text-gray-500 mb-8">
        This page will set up Supabase storage for file uploads by creating and configuring buckets and policies.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Configuration Status</CardTitle>
            <CardDescription>Check Supabase connection</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={`flex items-center ${
              configStatus === 'checking' ? 'text-amber-500' :
              configStatus === 'ready' ? 'text-green-500' : 'text-red-500'
            }`}>
              <div className={`w-3 h-3 rounded-full mr-2 ${
                configStatus === 'checking' ? 'bg-amber-500' :
                configStatus === 'ready' ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span>
                {configStatus === 'checking' ? 'Checking...' :
                 configStatus === 'ready' ? 'Connected' : 'Connection Error'}
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Bucket Status</CardTitle>
            <CardDescription>Storage bucket creation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={`flex items-center ${
              bucketStatus === 'none' ? 'text-gray-500' :
              bucketStatus === 'exists' || bucketStatus === 'created' ? 'text-green-500' : 'text-red-500'
            }`}>
              <div className={`w-3 h-3 rounded-full mr-2 ${
                bucketStatus === 'none' ? 'bg-gray-500' :
                bucketStatus === 'exists' || bucketStatus === 'created' ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span>
                {bucketStatus === 'none' ? 'Not Created' :
                 bucketStatus === 'exists' ? 'Already Exists' :
                 bucketStatus === 'created' ? 'Created Successfully' : 'Creation Error'}
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Policy Status</CardTitle>
            <CardDescription>Storage access policies</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={`flex items-center ${
              policyStatus === 'none' ? 'text-gray-500' :
              policyStatus === 'created' ? 'text-green-500' : 'text-red-500'
            }`}>
              <div className={`w-3 h-3 rounded-full mr-2 ${
                policyStatus === 'none' ? 'bg-gray-500' :
                policyStatus === 'created' ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span>
                {policyStatus === 'none' ? 'Not Created' :
                 policyStatus === 'created' ? 'Created Successfully' : 'Creation Error'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex justify-center mb-8">
        <Button 
          size="lg"
          disabled={configStatus !== 'ready' || isSettingUp}
          onClick={runFullSetup}
          className="px-8"
        >
          {isSettingUp ? 'Setting Up...' : 'Run Complete Setup'}
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Setup Log</CardTitle>
          <CardDescription>Progress and error messages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-black rounded p-4 text-white font-mono text-sm h-[400px] overflow-y-auto">
            {logMessages.length === 0 ? (
              <p className="text-gray-400">Waiting for actions...</p>
            ) : (
              logMessages.map((msg, i) => (
                <div key={i} className="mb-1">
                  {msg}
                </div>
              ))
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            {isSettingUp ? 'Setup in progress...' : 'Ready for setup'}
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={checkBuckets}
              disabled={isSettingUp}
            >
              Refresh Bucket Status
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={testFileUpload}
              disabled={isSettingUp || bucketStatus === 'none'}
            >
              Test File Upload
            </Button>
          </div>
        </CardFooter>
      </Card>
      
      <div className="mt-8 p-6 border rounded-lg bg-gray-50">
        <h2 className="text-xl font-bold mb-3">Next Steps</h2>
        <p className="mb-4">After storage setup is complete, test file uploads on the following pages:</p>
        <div className="flex gap-3">
          <Button asChild variant="outline">
            <a href="/storage-test">Storage Test</a>
          </Button>
          <Button asChild variant="outline">
            <a href="/chat-supabase">Chat Implementation</a>
          </Button>
        </div>
      </div>
    </div>
  )
} 