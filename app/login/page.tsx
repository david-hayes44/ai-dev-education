'use client';

import { useEffect } from 'react';
import { redirect } from 'next/navigation';

export default function LoginRedirect() {
  useEffect(() => {
    redirect('/auth/login');
  }, []);

  // This renders briefly before the redirect
  return <div className="p-8">Redirecting to login page...</div>;
} 