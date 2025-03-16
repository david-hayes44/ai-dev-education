"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { uploadFile, deleteFile } from '@/lib/supabase-storage-service'
import { FileAttachment } from '@/lib/chat-service'
import { v4 as uuidv4 } from 'uuid'

export default function StorageTestPage() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<FileAttachment[]>([])
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState<number>(0)
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }
  
  const handleUpload = async () => {
    if (!file) return
    
    setUploading(true)
    setError(null)
    setProgress(0)
    
    try {
      // Log Supabase configuration status
      console.log('Supabase config check:', {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL ? "URL exists" : "Missing URL",
        key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Key exists" : "Missing key"
      })
      
      const result = await uploadFile(
        file, 
        'test-session',
        (progress) => {
          console.log(`Upload progress: ${progress}%`)
          setProgress(progress)
        },
        (error) => {
          console.error("Upload callback error:", error)
          setError(error.message)
        }
      )
      
      console.log('Upload result:', result)
      setUploadedFiles(prev => [...prev, result])
      setFile(null)
      // Reset file input
      const fileInput = document.getElementById('file-upload') as HTMLInputElement
      if (fileInput) fileInput.value = ''
    } catch (err) {
      console.error('Upload error details:', err)
      // More detailed error message
      let errorMessage = 'Unknown error'
      if (err instanceof Error) {
        errorMessage = `${err.name}: ${err.message}`
        // If it's a fetch error, add more details
        if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
          errorMessage += ' - This typically indicates a network issue, CORS problem, or misconfigured Supabase credentials'
        }
      } else {
        errorMessage = String(err)
      }
      setError(errorMessage)
    } finally {
      setUploading(false)
    }
  }
  
  const handleDelete = async (file: FileAttachment) => {
    if (!file.storageRef) {
      setError("No storage reference for this file")
      return
    }
    
    try {
      await deleteFile(file.storageRef)
      setUploadedFiles(prev => prev.filter(f => f.id !== file.id))
    } catch (err) {
      console.error('Delete error:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }
  
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8">Supabase Storage Test</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>File Upload Test</CardTitle>
            <CardDescription>Test uploading files to Supabase Storage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <input 
                id="file-upload"
                type="file" 
                onChange={handleFileChange}
                disabled={uploading}
                className="mb-2"
              />
              
              <Button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="w-full mt-2"
              >
                {uploading ? `Uploading... ${progress}%` : 'Upload File'}
              </Button>
            </div>
            
            {uploading && (
              <div className="w-full h-2 bg-gray-200 rounded-full mt-2">
                <div 
                  className="h-full bg-blue-600 rounded-full" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            )}
            
            {error && (
              <div className="p-3 bg-red-100 text-red-700 rounded mt-4">
                <p className="font-medium">Error</p>
                <p>{error}</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Files</CardTitle>
            <CardDescription>Files uploaded to Supabase Storage</CardDescription>
          </CardHeader>
          <CardContent>
            {uploadedFiles.length === 0 ? (
              <p className="text-gray-500">No files uploaded yet</p>
            ) : (
              <ul className="space-y-4">
                {uploadedFiles.map(file => (
                  <li key={file.id} className="border rounded-md p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{file.name}</p>
                        <p className="text-sm text-gray-500">{file.type} • {formatBytes(file.size)}</p>
                      </div>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDelete(file)}
                      >
                        Delete
                      </Button>
                    </div>
                    
                    <div className="mt-2">
                      <a 
                        href={file.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm"
                      >
                        View File
                      </a>
                    </div>
                    
                    {file.type.startsWith('image/') && (
                      <div className="mt-2">
                        <img 
                          src={file.url} 
                          alt="Preview" 
                          className="max-h-32 object-contain border rounded"
                        />
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Utility function to format bytes
function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
} 