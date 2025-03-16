'use client';

import { useState, useEffect } from 'react';
import { setupStorageCompletely } from '@/lib/direct-storage-setup';
import { supabase } from '@/lib/supabase';

export default function DirectStorageTestPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadUrl, setUploadUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [logMessages, setLogMessages] = useState<string[]>([]);
  const [isSettingUp, setIsSettingUp] = useState(false);

  const bucketName = 'chat-files';

  const addLog = (message: string) => {
    setLogMessages(prev => [...prev, `${new Date().toISOString().substring(11, 19)}: ${message}`]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    setErrorMessage(null);
    setSuccessMessage(null);
    setUploadUrl(null);
  };

  const setupStorage = async () => {
    setIsSettingUp(true);
    addLog('Starting direct storage setup...');
    
    try {
      const result = await setupStorageCompletely(bucketName);
      
      if (result.success) {
        addLog(`Setup successful: ${result.message}`);
        setSuccessMessage('Storage setup completed successfully!');
      } else {
        addLog(`Setup failed: ${result.message}`);
        setErrorMessage(`Storage setup failed: ${result.message}`);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      addLog(`Setup error: ${errorMsg}`);
      setErrorMessage(`Error during setup: ${errorMsg}`);
    } finally {
      setIsSettingUp(false);
    }
  };

  const uploadFile = async () => {
    if (!file) {
      setErrorMessage('Please select a file first');
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    addLog(`Starting upload of file: ${file.name}`);

    try {
      // First verify the bucket exists
      const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
      
      if (bucketError) {
        throw new Error(`Error listing buckets: ${bucketError.message}`);
      }
      
      const bucketExists = buckets.some((b: { name: string }) => b.name === bucketName);
      
      if (!bucketExists) {
        addLog(`Bucket ${bucketName} not found, creating it...`);
        await setupStorage();
      }
      
      // Generate a unique file path
      const timestamp = new Date().getTime();
      const fileName = `${timestamp}-${file.name}`;
      
      addLog(`Uploading file as: ${fileName}`);
      
      // Upload file
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        throw new Error(`Upload error: ${error.message}`);
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(data.path);

      setUploadUrl(publicUrlData.publicUrl);
      setSuccessMessage('File uploaded successfully!');
      addLog('Upload completed successfully');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      setErrorMessage(`Error: ${errorMsg}`);
      addLog(`Error: ${errorMsg}`);
      
      // Detailed error logging
      if (error instanceof Error) {
        console.error('Upload error details:', error);
      }
    } finally {
      setIsUploading(false);
    }
  };

  // Check if we can list buckets (indicates if storage is configured correctly)
  useEffect(() => {
    const checkStorage = async () => {
      try {
        addLog('Checking storage configuration...');
        const { data, error } = await supabase.storage.listBuckets();
        
        if (error) {
          addLog(`Storage check failed: ${error.message}`);
          return;
        }
        
        const bucketExists = data.some((bucket: { name: string }) => bucket.name === bucketName);
        addLog(`Storage check successful. Bucket "${bucketName}" ${bucketExists ? 'exists' : 'does not exist'}.`);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        addLog(`Storage check error: ${errorMsg}`);
      }
    };
    
    checkStorage();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Supabase Direct Storage Test</h1>
      
      <div className="mb-8 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Storage Setup</h2>
        <button
          onClick={setupStorage}
          disabled={isSettingUp}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
        >
          {isSettingUp ? 'Setting up...' : 'Setup Storage (Create Bucket & Policies)'}
        </button>
      </div>
      
      <div className="mb-8 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">File Upload Test</h2>
        <div className="mb-4">
          <input
            type="file"
            onChange={handleFileChange}
            className="mb-2"
          />
          {file && (
            <p className="text-sm text-gray-600">
              Selected: {file.name} ({Math.round(file.size / 1024)} KB)
            </p>
          )}
        </div>
        
        <button
          onClick={uploadFile}
          disabled={!file || isUploading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-green-300"
        >
          {isUploading ? 'Uploading...' : 'Upload File'}
        </button>
      </div>
      
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-800 rounded">
          {errorMessage}
        </div>
      )}
      
      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 border border-green-300 text-green-800 rounded">
          {successMessage}
        </div>
      )}
      
      {uploadUrl && (
        <div className="mb-8">
          <h3 className="font-semibold mb-2">Uploaded File:</h3>
          <div className="p-3 bg-gray-100 rounded break-all">
            <a href={uploadUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
              {uploadUrl}
            </a>
          </div>
          
          {uploadUrl.endsWith('.jpg') || uploadUrl.endsWith('.jpeg') || 
           uploadUrl.endsWith('.png') || uploadUrl.endsWith('.gif') || 
           uploadUrl.endsWith('.webp') ? (
            <div className="mt-4">
              <img 
                src={uploadUrl} 
                alt="Uploaded file preview" 
                className="max-w-full max-h-64 rounded shadow"
              />
            </div>
          ) : null}
        </div>
      )}
      
      <div className="mt-8">
        <h3 className="font-semibold mb-2">Log:</h3>
        <div className="p-3 bg-black text-green-400 font-mono text-sm rounded h-64 overflow-y-auto">
          {logMessages.length > 0 ? (
            logMessages.map((msg, index) => (
              <div key={index}>{msg}</div>
            ))
          ) : (
            <div className="text-gray-500">No log messages yet...</div>
          )}
        </div>
      </div>
    </div>
  );
} 