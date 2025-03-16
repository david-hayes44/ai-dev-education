'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function ServerStorageTestPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    setError(null);
    setUploadResult(null);

    if (selectedFile) {
      addLog(`Selected file: ${selectedFile.name} (${Math.round(selectedFile.size / 1024)} KB)`);
    }
  };

  const uploadFile = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadResult(null);
    addLog(`Starting server-side upload of file: ${file.name}`);

    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', 'chat-files');

      // Send to server API
      addLog('Sending file to server API...');
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      addLog('Upload completed successfully!');
      setUploadResult(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      addLog(`Error: ${errorMessage}`);
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Server-Side Storage Test</h1>
      <p className="text-muted-foreground mb-8">
        Test file uploads using the server API route, which bypasses browser CORS limitations
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Upload File</CardTitle>
            <CardDescription>
              Select a file to upload via the server API
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="w-full"
                  disabled={isUploading}
                />
                {file && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Selected: {file.name} ({Math.round(file.size / 1024)} KB)
                  </p>
                )}
              </div>

              {error && (
                <div className="p-3 bg-red-100 border border-red-300 text-red-800 rounded">
                  {error}
                </div>
              )}

              {uploadResult && (
                <div className="p-3 bg-green-100 border border-green-300 text-green-800 rounded">
                  <p className="font-medium">Upload successful!</p>
                  <div className="mt-2 break-all">
                    <a 
                      href={uploadResult.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {uploadResult.url}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={uploadFile}
              disabled={!file || isUploading}
              className="w-full"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Upload File'
              )}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upload Logs</CardTitle>
            <CardDescription>
              Detailed information about the upload process
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-black text-green-400 p-3 rounded font-mono text-sm h-80 overflow-y-auto">
              {logs.length > 0 ? (
                logs.map((log, index) => (
                  <div key={index}>{log}</div>
                ))
              ) : (
                <div className="text-gray-500">No logs yet. Select and upload a file to begin.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {uploadResult?.url && uploadResult.url.match(/\.(jpg|jpeg|png|gif|webp)$/i) && (
        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Image Preview</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <img 
                src={uploadResult.url} 
                alt="Uploaded image" 
                className="max-w-full max-h-96 object-contain rounded shadow"
              />
            </CardContent>
          </Card>
        </div>
      )}

      <div className="mt-8 p-4 border rounded bg-gray-50">
        <h2 className="text-xl font-bold mb-2">How This Works</h2>
        <p className="mb-4">
          This page uses a server-side approach to upload files, which helps avoid CORS and browser restrictions:
        </p>
        <ol className="list-decimal pl-5 space-y-2">
          <li>The file is sent to a Next.js API route (<code>/api/upload</code>)</li>
          <li>The server creates a Supabase client with your credentials</li>
          <li>The server handles bucket creation if needed</li>
          <li>The file is uploaded to Supabase Storage from the server</li>
          <li>The public URL is returned to the browser</li>
        </ol>
        <p className="mt-4 text-gray-600">
          This approach is more reliable since the server has fewer restrictions than the browser when making API calls.
        </p>
      </div>
    </div>
  );
} 