'use client';

import { useEffect } from 'react';
import { useAuthContext } from '@/components/providers/auth-provider';
import { Heading } from '@/components/ui/heading';
import { useAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default function MigratePage() {
  const { user, status } = useAuthContext();
  const auth = useAuth();

  // Only admin users should access this page
  useEffect(() => {
    if (status === 'authenticated' && user && !user.isAdmin) {
      redirect('/dashboard');
    }
    
    if (status === 'unauthenticated') {
      redirect('/login');
    }
  }, [status, user]);

  if (status === 'loading') {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="container py-6 space-y-6">
      <Heading title="Storage Migration" description="Migration is no longer required" />
      
      <div className="p-6 bg-yellow-50 border border-yellow-300 rounded-lg text-yellow-800">
        <h3 className="text-lg font-semibold mb-2">Migration Not Required</h3>
        <p>
          The application has been fully migrated to use only Supabase. All Firebase references
          have been removed from the codebase.
        </p>
        <p className="mt-4">
          This page is kept as a placeholder for documentation purposes. No further migration actions are required.
        </p>
      </div>
    </div>
  );
} 