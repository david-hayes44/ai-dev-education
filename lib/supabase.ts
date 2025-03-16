import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mbabelguxbendvcawgnu.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1iYWJlbGd1eGJlbmR2Y2F3Z251Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIxMjQ1MjcsImV4cCI6MjA1NzcwMDUyN30.jCk13o94Q9sPc_oK49FNrtAyD589XH5o8hT0VO5HSic';

// Log Supabase configuration for debugging (only in development)
if (process.env.NODE_ENV === 'development') {
  console.log('Supabase config (sanitized):', {
    url: supabaseUrl ? `${supabaseUrl.substring(0, 10)}...` : undefined,
    hasKey: !!supabaseKey,
    environment: process.env.NODE_ENV,
    isConfigComplete: !!(supabaseUrl && supabaseKey),
    isRelativePath: supabaseUrl?.startsWith('/'),
    origin: typeof window !== 'undefined' ? window.location.origin : 'SSR'
  });
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('WARNING: Missing Supabase environment variables. Check your .env.local file.');
  }
}

// Create Supabase client with debug logs on errors
export const supabase = createClient(
  supabaseUrl,
  supabaseKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

// Try a simple ping to check connectivity when the client initializes
if (process.env.NODE_ENV === 'development') {
  supabase.auth.getSession()
    .then(() => console.log('Supabase client initialized successfully'))
    .catch(err => console.error('Error initializing Supabase client:', err));
}

// Helper function to check if Supabase is properly configured
export function isSupabaseConfigured(): boolean {
  const isConfigured = !!(supabaseUrl && supabaseKey);
  console.log('Supabase configuration check:', isConfigured ? 'SUCCESS' : 'MISSING CONFIG');
  return isConfigured;
} 