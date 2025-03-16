'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

// Define a type for the connection info
interface ConnectionInfo {
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
}

export default function SupabaseDiagnosticsPage() {
  const [log, setLog] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [corsTest, setCorsTest] = useState<'pending' | 'success' | 'failed'>('pending');
  const [dnsTest, setDnsTest] = useState<'pending' | 'success' | 'failed'>('pending');
  const [authTest, setAuthTest] = useState<'pending' | 'success' | 'failed'>('pending');
  const [bucketTest, setBucketTest] = useState<'pending' | 'success' | 'failed'>('pending');

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLog(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  // Get the supabase URL and key from the environment
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Run a direct fetch test outside of the Supabase client
  const runDirectFetch = async () => {
    try {
      addLog(`Testing direct fetch to ${supabaseUrl}`);
      const response = await fetch(`${supabaseUrl}/storage/v1/bucket`, {
        method: 'GET',
        headers: {
          'apikey': supabaseKey || '',
          'Authorization': `Bearer ${supabaseKey}`,
        },
        mode: 'cors',
      });
      
      if (response.ok) {
        const data = await response.json();
        addLog(`Direct fetch successful: ${JSON.stringify(data).substring(0, 100)}...`);
        return true;
      } else {
        const errorText = await response.text();
        addLog(`Direct fetch failed: ${response.status} ${response.statusText}`);
        addLog(`Error: ${errorText}`);
        return false;
      }
    } catch (error) {
      addLog(`Direct fetch exception: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  };

  // Run a DNS lookup test
  const runDnsLookup = async () => {
    try {
      if (!supabaseUrl) {
        addLog('Missing Supabase URL');
        return false;
      }
      
      // Extract hostname from URL
      const hostname = new URL(supabaseUrl).hostname;
      addLog(`Testing DNS resolution for ${hostname}`);
      
      // We can't directly do DNS lookup in the browser, so use fetch with a HEAD request
      const response = await fetch(`${supabaseUrl}`, {
        method: 'HEAD',
        mode: 'no-cors', // This allows us to at least attempt the connection
      });
      
      // With no-cors, we can't check response.ok, but if we got here without an exception, 
      // it means DNS resolved and TCP connection was established
      addLog(`DNS resolution successful for ${hostname}`);
      return true;
    } catch (error) {
      addLog(`DNS lookup failed: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  };

  // Test auth with Supabase client
  const runAuthTest = async () => {
    try {
      addLog('Testing Supabase auth connection');
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        addLog(`Auth test failed: ${error.message}`);
        return false;
      }
      
      addLog('Auth connection successful');
      return true;
    } catch (error) {
      addLog(`Auth test exception: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  };

  // Test storage with Supabase client
  const runStorageTest = async () => {
    try {
      addLog('Testing Supabase storage connection');
      const { data, error } = await supabase.storage.listBuckets();
      
      if (error) {
        addLog(`Storage test failed: ${error.message}`);
        return false;
      }
      
      addLog(`Storage connection successful. Found ${data.length} buckets.`);
      if (data.length > 0) {
        addLog(`Buckets: ${data.map(b => b.name).join(', ')}`);
      }
      return true;
    } catch (error) {
      addLog(`Storage test exception: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  };

  const runAllDiagnostics = async () => {
    setIsRunning(true);
    setLog([]);
    setCorsTest('pending');
    setDnsTest('pending');
    setAuthTest('pending');
    setBucketTest('pending');
    
    addLog('Starting Supabase diagnostics...');
    addLog(`Supabase URL: ${supabaseUrl?.substring(0, 10)}...`);
    addLog(`Supabase Key: ${supabaseKey ? 'Present (starts with ' + supabaseKey.substring(0, 5) + '...)' : 'Missing'}`);
    
    // Test 1: DNS Resolution
    const dnsResult = await runDnsLookup();
    setDnsTest(dnsResult ? 'success' : 'failed');
    
    // Test 2: CORS/Direct Fetch
    const corsResult = await runDirectFetch();
    setCorsTest(corsResult ? 'success' : 'failed');
    
    // Test 3: Auth
    const authResult = await runAuthTest();
    setAuthTest(authResult ? 'success' : 'failed');
    
    // Test 4: Storage
    const bucketResult = await runStorageTest();
    setBucketTest(bucketResult ? 'success' : 'failed');
    
    addLog('Diagnostics complete');
    setIsRunning(false);
  };

  // Display network information
  useEffect(() => {
    const connection = (navigator as { connection?: ConnectionInfo }).connection;
    if (connection) {
      addLog(`Network type: ${connection.effectiveType}`);
      addLog(`Downlink: ${connection.downlink} Mbps`);
      addLog(`RTT: ${connection.rtt} ms`);
    }
    
    addLog(`User agent: ${navigator.userAgent}`);
  }, []);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Supabase Connection Diagnostics</h1>
      <p className="text-gray-500 mb-8">
        Diagnose and resolve issues with your Supabase connection
      </p>

      <div className="mb-8">
        <Button 
          onClick={runAllDiagnostics} 
          disabled={isRunning}
          className="mb-4"
        >
          {isRunning ? 'Running Tests...' : 'Run Diagnostics'}
        </Button>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <span className="mr-2">DNS Resolution</span>
                {dnsTest === 'pending' && <AlertCircle className="h-5 w-5 text-yellow-500" />}
                {dnsTest === 'success' && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                {dnsTest === 'failed' && <XCircle className="h-5 w-5 text-red-500" />}
              </CardTitle>
              <CardDescription>
                Tests if your browser can resolve the Supabase domain
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <span className="mr-2">CORS/Direct API</span>
                {corsTest === 'pending' && <AlertCircle className="h-5 w-5 text-yellow-500" />}
                {corsTest === 'success' && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                {corsTest === 'failed' && <XCircle className="h-5 w-5 text-red-500" />}
              </CardTitle>
              <CardDescription>
                Tests if your browser can make direct fetch calls to Supabase
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <span className="mr-2">Auth Connection</span>
                {authTest === 'pending' && <AlertCircle className="h-5 w-5 text-yellow-500" />}
                {authTest === 'success' && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                {authTest === 'failed' && <XCircle className="h-5 w-5 text-red-500" />}
              </CardTitle>
              <CardDescription>
                Tests if the Supabase client can connect to auth services
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <span className="mr-2">Storage Connection</span>
                {bucketTest === 'pending' && <AlertCircle className="h-5 w-5 text-yellow-500" />}
                {bucketTest === 'success' && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                {bucketTest === 'failed' && <XCircle className="h-5 w-5 text-red-500" />}
              </CardTitle>
              <CardDescription>
                Tests if the Supabase client can connect to storage services
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
        
        {(corsTest === 'failed' || bucketTest === 'failed') && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Connection Issues Detected</AlertTitle>
            <AlertDescription>
              <p className="mb-2">We've detected issues with your Supabase connection. This could be due to:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>CORS restrictions in your browser</li>
                <li>Network connectivity issues</li>
                <li>Firewall or proxy settings blocking the connection</li>
                <li>Supabase service disruption</li>
              </ul>
              <p className="mt-2">Try these solutions:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Check if you're using a VPN or corporate network that might block Supabase</li>
                <li>Try a different browser</li>
                <li>Check Supabase status at <a href="https://status.supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">status.supabase.com</a></li>
                <li>Try creating a bucket manually through the Supabase dashboard</li>
              </ul>
            </AlertDescription>
          </Alert>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Diagnostic Log</CardTitle>
          <CardDescription>
            Detailed information about your Supabase connection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="bg-black text-green-400 p-4 rounded h-64 overflow-y-auto font-mono text-sm">
            {log.length > 0 ? (
              log.map((entry, index) => (
                <div key={index}>{entry}</div>
              ))
            ) : (
              <div className="text-gray-500">Run diagnostics to see logs...</div>
            )}
          </pre>
        </CardContent>
        <CardFooter>
          <Button 
            variant="outline" 
            onClick={() => {
              navigator.clipboard.writeText(log.join('\n'));
              addLog('Log copied to clipboard');
            }}
            disabled={log.length === 0}
            className="mr-2"
          >
            Copy Logs
          </Button>
          <Button 
            variant="secondary"
            onClick={() => window.open('https://supabase.com/dashboard', '_blank')}
          >
            Open Supabase Dashboard
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 