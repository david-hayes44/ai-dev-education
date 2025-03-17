'use client';

import { useEffect } from 'react';
import { redirect } from 'next/navigation';

export default function SignupRedirect() {
  useEffect(() => {
    redirect('/auth/signup');
  }, []);

  // This renders briefly before the redirect
  return <div className="p-8">Redirecting to signup page...</div>;
} 