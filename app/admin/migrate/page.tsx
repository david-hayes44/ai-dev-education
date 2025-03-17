'use client';

import { useState } from 'react';
import { migrateAllStorage } from '@/utils/migrate-storage';

export default function MigratePage() {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentPath, setCurrentPath] = useState('');
  const [results, setResults] = useState<{ success: number; failed: number; skipped: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleMigrate = async () => {
    try {
      setIsRunning(true);
      setProgress(0);
      setCurrentPath('');
      setResults(null);
      setError(null);

      const migrationResults = await migrateAllStorage((current, total, path) => {
        setProgress(Math.round((current / total) * 100));
        setCurrentPath(path);
      });

      setResults(migrationResults);
    } catch (err) {
      console.error('Migration error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Storage Migration Tool</h1>
      
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-lg font-medium mb-4">Firebase to Supabase Migration</h2>
        
        <p className="mb-4 text-gray-600">
          This tool will migrate all files from Firebase Storage to Supabase Storage.
          The process may take some time depending on the number and size of files.
        </p>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}
        
        {isRunning && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Migration in progress...</span>
              <span className="text-sm font-medium">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            {currentPath && (
              <p className="mt-2 text-sm text-gray-500">
                Currently processing: {currentPath}
              </p>
            )}
          </div>
        )}
        
        {results && !isRunning && (
          <div className="mb-6 bg-green-50 p-4 rounded-md">
            <h3 className="font-medium text-green-800 mb-2">Migration Complete</h3>
            <ul className="text-sm text-green-700">
              <li>Successfully migrated: {results.success} files</li>
              <li>Failed: {results.failed} files</li>
              <li>Skipped: {results.skipped} files</li>
            </ul>
          </div>
        )}
        
        <button
          onClick={handleMigrate}
          disabled={isRunning}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
        >
          {isRunning ? 'Migration Running...' : 'Start Migration'}
        </button>
      </div>
    </div>
  );
} 