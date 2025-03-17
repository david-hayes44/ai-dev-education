import { useState, useEffect } from 'react';
import { 
  Auth,
  GoogleAuthProvider, 
  GithubAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword as firebaseCreateUser,
  signInWithEmailAndPassword as firebaseSignIn,
  UserCredential as FirebaseUserCredential,
  User as FirebaseUser,
  getIdToken
} from 'firebase/auth';
import { auth as firebaseAuth } from '@/lib/firebase';
import { supabase } from '@/lib/supabase';
import { Provider, User as SupabaseUser } from '@supabase/supabase-js';

// Type definitions to handle both systems
export type AuthUser = {
  id: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  provider: string;
  // For migration tracking
  source: 'firebase' | 'supabase';
  // Raw user objects
  firebaseUser?: FirebaseUser;
  supabaseUser?: SupabaseUser;
};

export interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: Error | null;
  isAuthenticated: boolean;
}

/**
 * Enum for tracking which authentication system to use
 */
export enum AuthSystem {
  FIREBASE = 'firebase',
  SUPABASE = 'supabase',
  DUAL = 'dual', // During migration, we'll use both
}

// Default auth system - change as migration progresses
let currentAuthSystem: AuthSystem = AuthSystem.FIREBASE;

/**
 * Set the current authentication system
 */
export function setAuthSystem(system: AuthSystem) {
  currentAuthSystem = system;
  if (typeof window !== 'undefined') {
    localStorage.setItem('authSystem', system);
  }
}

/**
 * Get the current authentication system
 */
export function getAuthSystem(): AuthSystem {
  if (typeof window !== 'undefined') {
    const savedSystem = localStorage.getItem('authSystem') as AuthSystem | null;
    if (savedSystem) {
      currentAuthSystem = savedSystem;
    }
  }
  return currentAuthSystem;
}

/**
 * Initialize auth state management for both Firebase and Supabase
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
    // Get the configured auth system
    const system = getAuthSystem();
    let unsubscribeFirebase: (() => void) | null = null;
    let unsubscribeSupabase: (() => void) | null = null;

    if (system === AuthSystem.FIREBASE || system === AuthSystem.DUAL) {
      // Subscribe to Firebase auth state changes
      unsubscribeFirebase = onAuthStateChanged(
        firebaseAuth,
        async (firebaseUser) => {
          if (firebaseUser) {
            const authUser = mapFirebaseUser(firebaseUser);
            updateAuthState(authUser);

            // If in dual mode, sync with Supabase
            if (system === AuthSystem.DUAL) {
              try {
                const idToken = await getIdToken(firebaseUser);
                await syncFirebaseToSupabase(idToken);
              } catch (error) {
                console.error('Failed to sync Firebase user to Supabase:', error);
              }
            }
          } else if (system === AuthSystem.FIREBASE) {
            // Only clear if we're in Firebase-only mode
            updateAuthState(null);
          }
          
          // Mark as loaded if we're in Firebase-only mode
          if (system === AuthSystem.FIREBASE) {
            setState((prev) => ({ ...prev, loading: false }));
          }
        },
        (error) => {
          setState((prev) => ({ 
            ...prev, 
            error: error as Error,
            loading: false 
          }));
        }
      );
    }

    if (system === AuthSystem.SUPABASE || system === AuthSystem.DUAL) {
      // Subscribe to Supabase auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
          if (session?.user) {
            const authUser = mapSupabaseUser(session.user);
            updateAuthState(authUser);
          } else if (system === AuthSystem.SUPABASE) {
            // Only clear if we're in Supabase-only mode
            updateAuthState(null);
          }
          
          // Mark as loaded if we're in Supabase-only mode
          if (system === AuthSystem.SUPABASE) {
            setState((prev) => ({ ...prev, loading: false }));
          }

          // If dual, mark as loaded when both systems have been checked
          if (system === AuthSystem.DUAL && !unsubscribeFirebase) {
            setState((prev) => ({ ...prev, loading: false }));
          }
        }
      );
      
      unsubscribeSupabase = () => {
        subscription.unsubscribe();
      };
    }

    return () => {
      if (unsubscribeFirebase) unsubscribeFirebase();
      if (unsubscribeSupabase) unsubscribeSupabase();
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

  // Map Firebase user to common AuthUser format
  const mapFirebaseUser = (firebaseUser: FirebaseUser): AuthUser => {
    const providerData = firebaseUser.providerData[0];
    return {
      id: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      provider: providerData?.providerId || 'firebase',
      source: 'firebase',
      firebaseUser
    };
  };

  // Map Supabase user to common AuthUser format
  const mapSupabaseUser = (supabaseUser: SupabaseUser): AuthUser => {
    return {
      id: supabaseUser.id,
      email: supabaseUser.email,
      displayName: (supabaseUser.user_metadata?.full_name as string) || null,
      photoURL: (supabaseUser.user_metadata?.avatar_url as string) || null,
      provider: (supabaseUser.app_metadata?.provider as string) || 'supabase',
      source: 'supabase',
      supabaseUser
    };
  };

  // Sync Firebase auth to Supabase during migration phase
  const syncFirebaseToSupabase = async (idToken: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'firebase',
        token: idToken,
      });
      
      if (error) {
        console.error('Error syncing Firebase to Supabase:', error);
      }
    } catch (error) {
      console.error('Error syncing Firebase to Supabase:', error);
    }
  };

  // Sign in with Google
  const signInWithGoogle = async (): Promise<AuthUser | null> => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      
      const system = getAuthSystem();
      let user: AuthUser | null = null;
      
      if (system === AuthSystem.FIREBASE || system === AuthSystem.DUAL) {
        // Firebase sign in
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(firebaseAuth, provider);
        user = mapFirebaseUser(result.user);
        
        // If dual mode, also sign in to Supabase
        if (system === AuthSystem.DUAL) {
          const idToken = await getIdToken(result.user);
          await syncFirebaseToSupabase(idToken);
        }
      } else if (system === AuthSystem.SUPABASE) {
        // Supabase sign in
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/auth/callback`
          }
        });
        
        if (error) throw error;
        // Note: actual user will be set by the auth state listener
      }
      
      return user;
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
      
      const system = getAuthSystem();
      let user: AuthUser | null = null;
      
      if (system === AuthSystem.FIREBASE || system === AuthSystem.DUAL) {
        // Firebase sign in
        const provider = new GithubAuthProvider();
        const result = await signInWithPopup(firebaseAuth, provider);
        user = mapFirebaseUser(result.user);
        
        // If dual mode, also sign in to Supabase
        if (system === AuthSystem.DUAL) {
          const idToken = await getIdToken(result.user);
          await syncFirebaseToSupabase(idToken);
        }
      } else if (system === AuthSystem.SUPABASE) {
        // Supabase sign in
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'github',
          options: {
            redirectTo: `${window.location.origin}/auth/callback`
          }
        });
        
        if (error) throw error;
        // Note: actual user will be set by the auth state listener
      }
      
      return user;
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
      
      const system = getAuthSystem();
      let user: AuthUser | null = null;
      
      if (system === AuthSystem.FIREBASE || system === AuthSystem.DUAL) {
        // Firebase sign in
        const result = await firebaseSignIn(firebaseAuth, email, password);
        user = mapFirebaseUser(result.user);
        
        // If dual mode, also sign in to Supabase
        if (system === AuthSystem.DUAL) {
          const idToken = await getIdToken(result.user);
          await syncFirebaseToSupabase(idToken);
        }
      } else if (system === AuthSystem.SUPABASE) {
        // Supabase sign in
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (error) throw error;
        if (data.user) {
          user = mapSupabaseUser(data.user);
        }
      }
      
      return user;
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
      
      const system = getAuthSystem();
      let user: AuthUser | null = null;
      
      if (system === AuthSystem.FIREBASE || system === AuthSystem.DUAL) {
        // Firebase sign up
        const result = await firebaseCreateUser(firebaseAuth, email, password);
        user = mapFirebaseUser(result.user);
        
        // If dual mode, also sign up in Supabase
        if (system === AuthSystem.DUAL) {
          const idToken = await getIdToken(result.user);
          await syncFirebaseToSupabase(idToken);
        }
      } else if (system === AuthSystem.SUPABASE) {
        // Supabase sign up
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`
          }
        });
        
        if (error) throw error;
        if (data.user) {
          user = mapSupabaseUser(data.user);
        }
      }
      
      return user;
    } catch (error) {
      setState((prev) => ({ 
        ...prev, 
        error: error as Error,
        loading: false 
      }));
      return null;
    }
  };

  // Sign out from both systems
  const signOut = async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      
      const system = getAuthSystem();
      
      if (system === AuthSystem.FIREBASE || system === AuthSystem.DUAL) {
        // Firebase sign out
        await firebaseSignOut(firebaseAuth);
      }
      
      if (system === AuthSystem.SUPABASE || system === AuthSystem.DUAL) {
        // Supabase sign out
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      }
      
      updateAuthState(null);
    } catch (error) {
      setState((prev) => ({ 
        ...prev, 
        error: error as Error
      }));
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
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