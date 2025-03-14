"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage'
import { getApps } from 'firebase/app'

export default function TestFirebasePage() {
  const [status, setStatus] = useState<string>('Idle')
  const [results, setResults] = useState<Array<{ name: string, status: 'success' | 'error', message: string }>>([])
  const [envVars, setEnvVars] = useState<Record<string, string | undefined>>({})

  useEffect(() => {
    // Collect environment variables
    const firebaseEnvVars: Record<string, string | undefined> = {
      'NEXT_PUBLIC_FIREBASE_API_KEY': process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN': process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      'NEXT_PUBLIC_FIREBASE_PROJECT_ID': process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET': process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID': process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      'NEXT_PUBLIC_FIREBASE_APP_ID': process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    }

    setEnvVars(firebaseEnvVars)
  }, [])

  const testFirebaseInitialization = () => {
    setStatus('Testing Firebase initialization...')
    try {
      const apps = getApps()
      if (apps.length > 0) {
        addResult('Firebase Initialization', 'success', `Firebase initialized with ${apps.length} app(s)`)
      } else {
        addResult('Firebase Initialization', 'error', 'No Firebase apps initialized')
      }
    } catch (error) {
      addResult('Firebase Initialization', 'error', `Error: ${error instanceof Error ? error.message : String(error)}`)
    }
    setStatus('Firebase initialization test completed')
  }

  const testFirebaseStorage = async () => {
    setStatus('Testing Firebase Storage...')
    try {
      // Get Firebase storage
      const storage = getStorage()
      addResult('Storage Reference', 'success', 'Storage reference created')
      
      // Create a test reference
      const testRef = ref(storage, 'test-uploads/test-file.txt')
      addResult('Test Reference', 'success', `Created reference: ${testRef.fullPath}`)
      
      // Try to upload a string
      const testContent = 'Hello, Firebase! ' + new Date().toISOString()
      await uploadString(testRef, testContent)
      addResult('Upload Test', 'success', 'Test content uploaded successfully')
      
      // Try to get the download URL
      const downloadURL = await getDownloadURL(testRef)
      addResult('Download URL', 'success', `Successfully retrieved download URL: ${downloadURL.substring(0, 50)}...`)
      
      setStatus('All Firebase Storage tests passed')
    } catch (error) {
      console.error('Firebase Storage test error:', error)
      addResult('Firebase Storage Test', 'error', `Error: ${error instanceof Error ? error.message : String(error)}`)
      setStatus('Firebase Storage test failed')
    }
  }

  const addResult = (name: string, status: 'success' | 'error', message: string) => {
    setResults(prev => [...prev, { name, status, message }])
  }

  const clearResults = () => {
    setResults([])
    setStatus('Results cleared')
  }

  return (
    <div className="container py-10">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Firebase Storage Test</CardTitle>
          <CardDescription>Test Firebase Storage functionality directly</CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-6">
            {/* Environment Variables */}
            <div>
              <h3 className="text-lg font-medium">Environment Variables</h3>
              <div className="mt-2 bg-muted p-4 rounded-md max-h-40 overflow-auto font-mono text-sm">
                {Object.entries(envVars).map(([key, value]) => (
                  <div key={key} className="flex">
                    <span className="font-bold mr-2">{key}:</span>
                    <span>
                      {value 
                        ? `${value.substring(0, 3)}${'*'.repeat(value.length > 3 ? 6 : 3)}${value.length > 10 ? value.substring(value.length - 3) : ''}`
                        : 'undefined'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Status */}
            <div>
              <h3 className="text-lg font-medium">Status</h3>
              <div className="mt-2 bg-muted p-4 rounded-md">
                {status}
              </div>
            </div>
            
            {/* Test Results */}
            <div>
              <h3 className="text-lg font-medium">Test Results</h3>
              <div className="mt-2 space-y-2">
                {results.length === 0 ? (
                  <div className="text-muted-foreground italic">No tests run yet</div>
                ) : (
                  results.map((result, index) => (
                    <div 
                      key={index} 
                      className={`p-3 rounded-md ${
                        result.status === 'success' ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'
                      }`}
                    >
                      <div className="font-medium flex items-center gap-2">
                        <span className={`${
                          result.status === 'success' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {result.status === 'success' ? '✓' : '✗'}
                        </span>
                        {result.name}
                      </div>
                      <div className="text-sm mt-1">{result.message}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </CardContent>
        
        <Separator />
        
        <CardFooter className="flex justify-between py-4">
          <div className="flex gap-2">
            <Button variant="outline" onClick={testFirebaseInitialization}>
              Test Initialization
            </Button>
            <Button onClick={testFirebaseStorage}>
              Test Storage
            </Button>
          </div>
          <Button variant="ghost" onClick={clearResults}>
            Clear Results
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
} 