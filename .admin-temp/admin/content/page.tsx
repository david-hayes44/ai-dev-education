'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, RefreshCw, Database, FileText } from 'lucide-react';

export default function ContentManagementPage() {
  const [isIndexing, setIsIndexing] = useState(false);
  const [indexingStatus, setIndexingStatus] = useState<string | null>(null);
  const [indexingError, setIndexingError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalPages: 0,
    totalChunks: 0,
    totalVectors: 0,
    lastIndexed: null as string | null,
  });

  const triggerContentIndexing = async () => {
    setIsIndexing(true);
    setIndexingStatus('Starting content indexing...');
    setIndexingError(null);
    
    try {
      const response = await fetch('/api/admin/index-content', {
        method: 'POST',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to index content');
      }
      
      const data = await response.json();
      setIndexingStatus('Content indexing completed successfully');
      setStats({
        totalPages: data.pagesIndexed || 0,
        totalChunks: data.chunksCreated || 0,
        totalVectors: data.vectorsStored || 0,
        lastIndexed: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error indexing content:', error);
      setIndexingError(error instanceof Error ? error.message : 'Unknown error occurred');
      setIndexingStatus(null);
    } finally {
      setIsIndexing(false);
    }
  };

  const fetchIndexingStats = async () => {
    try {
      const response = await fetch('/api/admin/indexing-stats');
      
      if (!response.ok) {
        throw new Error('Failed to fetch indexing stats');
      }
      
      const data = await response.json();
      setStats({
        totalPages: data.totalPages || 0,
        totalChunks: data.totalChunks || 0,
        totalVectors: data.totalVectors || 0,
        lastIndexed: data.lastIndexed,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Fetch stats on component mount
  useState(() => {
    fetchIndexingStats();
  });

  return (
    <div className="container mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Content Management</h1>
        <p className="text-muted-foreground">
          Manage content indexing for AI navigation assistance
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Indexing Control Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              <span>Content Indexing</span>
            </CardTitle>
            <CardDescription>
              Generate vector embeddings for site content to enable semantic search using Open Router
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {indexingStatus && (
              <Alert variant="default" className="bg-muted/50">
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Status</AlertTitle>
                <AlertDescription>{indexingStatus}</AlertDescription>
              </Alert>
            )}
            
            {indexingError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{indexingError}</AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              onClick={triggerContentIndexing} 
              disabled={isIndexing}
              className="w-full"
            >
              {isIndexing ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Indexing Content...
                </>
              ) : (
                <>
                  <Database className="mr-2 h-4 w-4" />
                  Generate Content Index
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        {/* Content Stats Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              <span>Content Statistics</span>
            </CardTitle>
            <CardDescription>
              Overview of indexed content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Pages Indexed</p>
                <p className="text-2xl font-bold">{stats.totalPages}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Content Chunks</p>
                <p className="text-2xl font-bold">{stats.totalChunks}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Vector Embeddings</p>
                <p className="text-2xl font-bold">{stats.totalVectors}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Last Indexed</p>
                <p className="text-sm">{stats.lastIndexed 
                  ? new Date(stats.lastIndexed).toLocaleString() 
                  : 'Never'}</p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              onClick={fetchIndexingStats} 
              className="w-full"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Stats
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 