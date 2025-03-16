"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { supabase } from '@/lib/supabase'
import { isSupabaseConfigured } from '@/lib/supabase'

export function SupabaseDiagnostic() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [buckets, setBuckets] = useState<string[]>([])
  const [checkingBucket, setCheckingBucket] = useState(false)
  const [bucketStatus, setBucketStatus] = useState<'unknown' | 'exists' | 'not-found' | 'error'>('unknown')
  
  useEffect(() => {
    const checkSupabase = async () => {
      try {
        // Basic configuration check
        if (!isSupabaseConfigured()) {
          setStatus('error')
          setErrorMessage('Supabase is not properly configured. Check your environment variables.')
          return
        }
        
        // Try to make a simple request to test connectivity
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          setStatus('error')
          setErrorMessage(`Error connecting to Supabase: ${error.message}`)
          return
        }
        
        // List available buckets
        const { data: bucketsData, error: bucketsError } = await supabase.storage.listBuckets()
        
        if (bucketsError) {
          setStatus('error')
          setErrorMessage(`Error listing buckets: ${bucketsError.message}`)
          return
        }
        
        if (bucketsData) {
          setBuckets(bucketsData.map(b => b.name))
        }
        
        setStatus('success')
      } catch (err) {
        setStatus('error')
        setErrorMessage(err instanceof Error ? err.message : 'Unknown error')
      }
    }
    
    checkSupabase()
  }, [])
  
  const checkChatFilesBucket = async () => {
    setCheckingBucket(true)
    setBucketStatus('unknown')
    
    try {
      // Check if the chat-files bucket exists
      const chatFilesBucket = buckets.find(b => b === 'chat-files')
      
      if (!chatFilesBucket) {
        setBucketStatus('not-found')
        setCheckingBucket(false)
        return
      }
      
      // Try to list files in the bucket to verify access
      const { data, error } = await supabase.storage
        .from('chat-files')
        .list('test-files', { limit: 1 })
      
      if (error && error.message.includes('does not exist')) {
        // The bucket exists but the folder doesn't - this is fine
        setBucketStatus('exists')
      } else if (error) {
        console.error('Error checking bucket:', error)
        setBucketStatus('error')
        setErrorMessage(`Error accessing bucket: ${error.message}`)
      } else {
        setBucketStatus('exists')
      }
    } catch (err) {
      console.error('Error in bucket check:', err)
      setBucketStatus('error')
      setErrorMessage(err instanceof Error ? err.message : 'Unknown error checking bucket')
    } finally {
      setCheckingBucket(false)
    }
  }
  
  const createChatFilesBucket = async () => {
    setCheckingBucket(true)
    
    try {
      const { data, error } = await supabase.storage.createBucket('chat-files', {
        public: true
      })
      
      if (error) {
        setErrorMessage(`Error creating bucket: ${error.message}`)
      } else {
        setBuckets(prev => [...prev, 'chat-files'])
        setBucketStatus('exists')
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Unknown error creating bucket')
    } finally {
      setCheckingBucket(false)
    }
  }
  
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Supabase Diagnostic</CardTitle>
        <CardDescription>Check Supabase configuration and storage</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-2">Configuration Status</h3>
            {status === 'loading' && <p>Checking Supabase configuration...</p>}
            
            {status === 'success' && (
              <Alert className="bg-green-50 border-green-200">
                <AlertTitle>Connected to Supabase</AlertTitle>
                <AlertDescription>
                  Your Supabase configuration appears to be working correctly.
                </AlertDescription>
              </Alert>
            )}
            
            {status === 'error' && (
              <Alert variant="destructive">
                <AlertTitle>Configuration Error</AlertTitle>
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}
          </div>
          
          {buckets.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-2">Storage Buckets</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {buckets.map(bucket => (
                  <span 
                    key={bucket} 
                    className={`px-2 py-1 text-sm rounded-full ${
                      bucket === 'chat-files' 
                        ? 'bg-green-100 text-green-800 font-medium' 
                        : 'bg-gray-100'
                    }`}
                  >
                    {bucket}
                  </span>
                ))}
              </div>
              
              <div className="mt-4">
                <h4 className="font-medium mb-2">Chat Files Bucket Status</h4>
                
                {buckets.includes('chat-files') ? (
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">✓ chat-files bucket exists</span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={checkChatFilesBucket}
                      disabled={checkingBucket}
                    >
                      Verify Access
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-amber-600">⚠ chat-files bucket not found</span>
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={createChatFilesBucket}
                      disabled={checkingBucket}
                    >
                      Create Bucket
                    </Button>
                  </div>
                )}
                
                {bucketStatus === 'exists' && (
                  <p className="text-green-600 mt-2">
                    ✓ Bucket verified - storage should work correctly
                  </p>
                )}
                
                {bucketStatus === 'not-found' && (
                  <p className="text-red-600 mt-2">
                    ✗ The chat-files bucket was not found
                  </p>
                )}
                
                {bucketStatus === 'error' && (
                  <p className="text-red-600 mt-2">
                    ✗ Error checking bucket: {errorMessage}
                  </p>
                )}
              </div>
            </div>
          )}
          
          <div className="mt-4 pt-4 border-t">
            <h3 className="text-lg font-medium mb-2">Environment Variables</h3>
            <div className="bg-gray-50 p-4 rounded text-sm font-mono">
              <div>
                NEXT_PUBLIC_SUPABASE_URL: 
                {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✓ Set' : '✗ Missing'}
              </div>
              <div>
                NEXT_PUBLIC_SUPABASE_ANON_KEY: 
                {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✓ Set' : '✗ Missing'}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 