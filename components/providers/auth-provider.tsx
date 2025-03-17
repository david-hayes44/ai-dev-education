'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '@/lib/auth';
import type { AuthUser } from '@/lib/auth';

interface AuthProviderProps {
  children: ReactNode;
}

export type AuthContextType = {
  user: AuthUser | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: AuthProviderProps) {
  // Initialize auth
  const { user, loading, isAuthenticated } = useAuth();
  
  // Map to a simpler status
  const status = loading 
    ? 'loading' 
    : isAuthenticated 
      ? 'authenticated' 
      : 'unauthenticated';

  return (
    <AuthContext.Provider 
      value={{
        user,
        status,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
} 