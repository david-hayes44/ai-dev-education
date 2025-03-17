'use client';

import { useState, useEffect } from 'react';
import { supabase, STORAGE_BUCKETS } from '@/lib/supabase';
import Link from 'next/link';

interface Bucket {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  public: boolean;
}

interface BucketStatus {
  name: string;
  exists: boolean;
  details: Bucket | undefined;
}

export default function StorageSetupPage() {
  const [buckets, setBuckets] = useState<Bucket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkBuckets() {
      try {
        setLoading(true);
        const { data, error } = await supabase.storage.listBuckets();
        
        if (error) {
          throw error;
        }
        
        setBuckets(data || []);
      } catch (err: unknown) {
        console.error('Error checking buckets:', err);
        setError(err instanceof Error ? err.message : 'Failed to check storage buckets');
      } finally {
        setLoading(false);
      }
    }
    
    checkBuckets();
  }, []);

  // Check if required buckets exist
  const bucketStatus = STORAGE_BUCKETS.map((requiredBucket: string) => {
    const found = buckets.find(b => b.name === requiredBucket);
    return {
      name: requiredBucket,
      exists: !!found,
      details: found
    };
  });

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Storage Setup</h1>
      
      {loading ? (
        <p className="text-gray-500">Checking storage buckets...</p>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Error checking storage buckets</p>
          <p>{error}</p>
        </div>
      ) : (
        <>
          <h2 className="text-xl font-semibold mb-4">Storage Buckets</h2>
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bucket Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created At
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Public
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bucketStatus.map((bucket: BucketStatus) => (
                  <tr key={bucket.name}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {bucket.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {bucket.exists ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Available
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          Missing
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {bucket.details?.created_at ? new Date(bucket.details.created_at).toLocaleString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {bucket.details?.public !== undefined ? (bucket.details.public ? 'Yes' : 'No') : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Manual Setup Instructions</h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>Go to your <a href="https://app.supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Supabase Dashboard</a></li>
              <li>Navigate to Storage in the left sidebar</li>
              <li>Create each of the required buckets: attachments, avatars, and exports</li>
              <li>Apply the appropriate RLS policies as described in the <Link href="/docs/manual-rls-setup.md" target="_blank" className="text-blue-600 hover:underline">RLS Policy Setup Guide</Link></li>
            </ol>
          </div>
          
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium mb-2">Security Recommendations</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Ensure RLS policies are properly configured for each bucket</li>
              <li>Only make buckets public when absolutely necessary</li>
              <li>Use folder structure with user IDs to separate user content</li>
              <li>Set up proper CORS policies if accessing from frontend applications</li>
              <li>Regularly audit storage access patterns</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
} 