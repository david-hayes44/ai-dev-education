import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  // Get the code and next URL from the request
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const next = url.searchParams.get('next') || '/';
  
  if (code) {
    // Exchange code for session
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error('Error in auth callback:', error);
      return NextResponse.redirect(new URL(`/auth/error?error=${error.message}`, request.url));
    }
  }
  
  // Redirect to the next URL or homepage
  return NextResponse.redirect(new URL(next, request.url));
} 