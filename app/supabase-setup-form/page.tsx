'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';
import Link from 'next/link';

export default function SupabaseSetupFormPage() {
  const [supabaseUrl, setSupabaseUrl] = useState(process.env.NEXT_PUBLIC_SUPABASE_URL || '');
  const [supabaseKey, setSupabaseKey] = useState(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '');
  const [projectRef, setProjectRef] = useState('');
  const [showInstructions, setShowInstructions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const extractProjectRef = (url: string): string => {
    try {
      // URL format: https://<project-ref>.supabase.co
      const match = url.match(/https:\/\/([^.]+)\.supabase\.co/);
      return match ? match[1] : '';
    } catch (err) {
      return '';
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setSupabaseUrl(url);
    setProjectRef(extractProjectRef(url));
  };

  const openSupabaseProjectSettings = () => {
    if (!projectRef) {
      setError('Could not extract project reference from URL. Please enter a valid Supabase URL.');
      return;
    }
    
    const url = `https://supabase.com/dashboard/project/${projectRef}/settings`;
    window.open(url, '_blank');
    setSuccess('Opening Supabase project settings in a new tab.');
  };

  const openCreateBucketPage = () => {
    if (!projectRef) {
      setError('Could not extract project reference from URL. Please enter a valid Supabase URL.');
      return;
    }
    
    const url = `https://supabase.com/dashboard/project/${projectRef}/storage/buckets`;
    window.open(url, '_blank');
    setSuccess('Opening Supabase storage bucket page in a new tab.');
    setShowInstructions(true);
  };

  const openApiDocsPage = () => {
    const url = 'https://supabase.com/docs/guides/storage/security/access-control';
    window.open(url, '_blank');
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Supabase Manual Setup Guide</h1>
      <p className="text-gray-500 mb-8">
        Set up Supabase through the dashboard to avoid CORS and authentication issues
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Project Information</CardTitle>
            <CardDescription>
              Your Supabase project information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Supabase URL</label>
                <input 
                  type="text"
                  value={supabaseUrl}
                  onChange={handleUrlChange}
                  className="w-full p-2 border rounded"
                  placeholder="https://your-project.supabase.co"
                />
                <p className="text-xs text-gray-500 mt-1">
                  From your .env.local file (NEXT_PUBLIC_SUPABASE_URL)
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Supabase Anon Key</label>
                <input 
                  type="text"
                  value={supabaseKey}
                  onChange={(e) => setSupabaseKey(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="your-anon-key"
                />
                <p className="text-xs text-gray-500 mt-1">
                  From your .env.local file (NEXT_PUBLIC_SUPABASE_ANON_KEY)
                </p>
              </div>
              
              {projectRef && (
                <div>
                  <label className="block text-sm font-medium mb-1">Project Reference</label>
                  <input 
                    type="text"
                    value={projectRef}
                    readOnly
                    className="w-full p-2 border rounded bg-gray-50"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Extracted from your Supabase URL
                  </p>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={openSupabaseProjectSettings} className="w-full">
              Open Project Settings
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Storage Setup</CardTitle>
            <CardDescription>
              Create bucket and set policies manually
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <h3 className="font-medium">Required Storage Setup:</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>Create a bucket named <strong>chat-files</strong></li>
                <li>Make the bucket <strong>public</strong></li>
                <li>Add RLS policies for all operations (SELECT, INSERT, UPDATE, DELETE)</li>
              </ul>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button onClick={openCreateBucketPage} className="w-full">
              Open Bucket Creation Page
            </Button>
            <Button onClick={openApiDocsPage} variant="outline" className="w-full">
              View Storage Documentation
            </Button>
          </CardFooter>
        </Card>
      </div>

      {error && (
        <Alert variant="destructive" className="mt-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert className="mt-6 bg-green-50 border-green-200 text-green-800">
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {showInstructions && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              How to Create the Storage Bucket
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <h3 className="font-medium text-lg">Step 1: Create the chat-files bucket</h3>
              <div className="pl-4">
                <ol className="list-decimal space-y-2">
                  <li>On the Storage page, click "Create a new bucket"</li>
                  <li>Enter the name "chat-files"</li>
                  <li>Check "Enable public bucket" to make it public</li>
                  <li>Click "Create bucket"</li>
                </ol>
              </div>
              
              <h3 className="font-medium text-lg mt-4">Step 2: Add RLS policies to allow all operations</h3>
              <div className="pl-4">
                <ol className="list-decimal space-y-2">
                  <li>Click on the "chat-files" bucket</li>
                  <li>Go to the "Policies" tab</li>
                  <li>Click "Add policy" and then "Create a policy from scratch"</li>
                  <li>For each operation (SELECT, INSERT, UPDATE, DELETE):
                    <ul className="list-disc pl-5 mt-1">
                      <li>Name the policy "allow_public_[operation]" (lowercase)</li>
                      <li>Select the operation type</li>
                      <li>For "For operation on storage.objects", select "Using a predefined policy template"</li>
                      <li>Choose "Allow access to everyone"</li>
                      <li>Click "Save policy"</li>
                    </ul>
                  </li>
                  <li>Repeat for all four operations</li>
                </ol>
              </div>
              
              <p className="mt-4">After completing these steps, return to the app and try uploading a file using the direct storage test page.</p>
              
              <div className="mt-4 flex justify-center">
                <Link href="/supabase-direct-storage-test">
                  <Button>Go to Direct Storage Test</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 