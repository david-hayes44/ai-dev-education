import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Provider, User as SupabaseUser } from '@supabase/supabase-js';

// Type definitions for Supabase auth
export type AuthUser = {
  id: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  provider: string;
  isAdmin?: boolean;
  supabaseUser?: SupabaseUser;
};

export interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: Error | null;
  isAuthenticated: boolean;
}

/**
 * Initialize auth state management for Supabase
 */
export function useAuth(): AuthState & {
  signInWithGoogle: () => Promise<AuthUser | null>;
  signInWithGithub: () => Promise<AuthUser | null>;
  signInWithEmail: (email: string, password: string) => Promise<AuthUser | null>;
  signUp: (email: string, password: string) => Promise<AuthUser | null>;
  signOut: () => Promise<void>;
} {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
    isAuthenticated: false,
  });

  useEffect(() => {
    // Subscribe to Supabase auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          const authUser = mapSupabaseUser(session.user);
          updateAuthState(authUser);
        } else {
          updateAuthState(null);
        }
        
        setState((prev) => ({ ...prev, loading: false }));
      }
    );
    
    // Check for existing session on mount
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      
      if (data?.session?.user) {
        const authUser = mapSupabaseUser(data.session.user);
        updateAuthState(authUser);
      }
      
      setState((prev) => ({ ...prev, loading: false }));
    };
    
    checkSession();
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Helper to update auth state
  const updateAuthState = (user: AuthUser | null) => {
    setState((prev) => ({
      ...prev,
      user,
      isAuthenticated: !!user,
    }));
  };

  // Map Supabase user to AuthUser format
  const mapSupabaseUser = (supabaseUser: SupabaseUser): AuthUser => {
    const email = supabaseUser.email || null;
    const isAdmin = email?.includes('admin') || false;
    
    return {
      id: supabaseUser.id,
      email,
      displayName: (supabaseUser.user_metadata?.full_name as string) || null,
      photoURL: (supabaseUser.user_metadata?.avatar_url as string) || null,
      provider: (supabaseUser.app_metadata?.provider as string) || 'supabase',
      isAdmin,
      supabaseUser
    };
  };

  // Sign in with Google
  const signInWithGoogle = async (): Promise<AuthUser | null> => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) {
        throw error;
      }
      
      // OAuth redirect will happen here, so we don't return anything
      return null;
    } catch (error) {
      setState((prev) => ({ 
        ...prev, 
        error: error as Error,
        loading: false 
      }));
      return null;
    }
  };

  // Sign in with GitHub
  const signInWithGithub = async (): Promise<AuthUser | null> => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) {
        throw error;
      }
      
      // OAuth redirect will happen here, so we don't return anything
      return null;
    } catch (error) {
      setState((prev) => ({ 
        ...prev, 
        error: error as Error,
        loading: false 
      }));
      return null;
    }
  };

  // Sign in with email and password
  const signInWithEmail = async (email: string, password: string): Promise<AuthUser | null> => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        throw error;
      }
      
      if (data?.user) {
        const user = mapSupabaseUser(data.user);
        updateAuthState(user);
        return user;
      }
      
      return null;
    } catch (error) {
      setState((prev) => ({ 
        ...prev, 
        error: error as Error,
        loading: false 
      }));
      return null;
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string): Promise<AuthUser | null> => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) {
        throw error;
      }
      
      if (data?.user) {
        const user = mapSupabaseUser(data.user);
        updateAuthState(user);
        return user;
      }
      
      return null;
    } catch (error) {
      setState((prev) => ({ 
        ...prev, 
        error: error as Error,
        loading: false 
      }));
      return null;
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      updateAuthState(null);
    } catch (error) {
      setState((prev) => ({ 
        ...prev, 
        error: error as Error
      }));
    }
  };

  return {
    ...state,
    signInWithGoogle,
    signInWithGithub,
    signInWithEmail,
    signUp,
    signOut
  };
} 