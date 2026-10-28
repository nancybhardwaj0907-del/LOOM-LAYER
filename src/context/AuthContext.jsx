import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

const LOCAL_AUTH_STORAGE_KEY = 'loom_layer_auth_user_v1';

const AuthContext = createContext({
  user: null,
  session: null,
  loading: true,
  error: null,
  isAuthenticated: false,
  isConfigured: false,
  signInWithGoogle: async () => {},
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
  loginWithDemo: () => {},
  signOut: async () => {}
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(LOCAL_AUTH_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
      const defaultUser = {
        id: 'atelier-director-1',
        email: 'director@loomandlayer.atelier',
        user_metadata: {
          name: 'Elena Rostova',
          full_name: 'Elena Rostova',
          avatar_url: '/atelier/user_avatar.jpg'
        }
      };
      try {
        localStorage.setItem(LOCAL_AUTH_STORAGE_KEY, JSON.stringify(defaultUser));
      } catch (_) {}
      return defaultUser;
    } catch {
      return null;
    }
  });
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    // 1. Get initial Supabase session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!isMounted) return;
      if (error) {
        console.warn('[Auth] Error getting initial session:', error.message);
      } else if (session) {
        setSession(session);
        setUser(session.user);
        try {
          localStorage.setItem(LOCAL_AUTH_STORAGE_KEY, JSON.stringify(session.user));
        } catch (e) {
          console.warn('[Auth] Could not persist session to localStorage', e);
        }
      }
      setLoading(false);
    }).catch((err) => {
      if (!isMounted) return;
      console.warn('[Auth] Unexpected error on getSession:', err);
      setLoading(false);
    });

    // 2. Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        if (!isMounted) return;
        setSession(currentSession);
        if (currentSession?.user) {
          setUser(currentSession.user);
          try {
            localStorage.setItem(LOCAL_AUTH_STORAGE_KEY, JSON.stringify(currentSession.user));
          } catch (e) {
            console.warn('[Auth] Could not persist session to localStorage', e);
          }
        }
        setLoading(false);
      }
    );

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    if (!isSupabaseConfigured || !supabase) {
      // Fallback demo sign in if Supabase credentials are not ready
      loginWithDemo('Google Atelier Designer', 'designer@atelier.com');
      return { success: true };
    }

    setError(null);
    try {
      const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}/` : undefined;
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      });

      if (error) {
        console.error('[Auth] Google Sign-in error:', error.message);
        setError(error.message);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (err) {
      console.error('[Auth] Unexpected error during Google Sign-in:', err);
      setError(err.message || 'Failed to sign in with Google');
      return { success: false, error: err.message };
    }
  };

  const signInWithEmail = async (email, password) => {
    setError(null);
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) {
          // If user doesn't exist in Supabase yet, offer demo login or return error
          console.warn('[Auth] Supabase email login notice:', error.message);
          return { success: false, error: error.message };
        }

        setUser(data.user);
        setSession(data.session);
        localStorage.setItem(LOCAL_AUTH_STORAGE_KEY, JSON.stringify(data.user));
        return { success: true, user: data.user };
      } catch (err) {
        return { success: false, error: err.message };
      }
    }

    // Local fallback
    const mockUser = {
      id: 'usr_' + Date.now(),
      email: email || 'nancy@atelier.com',
      user_metadata: { name: email.split('@')[0] || 'Atelier Designer' }
    };
    setUser(mockUser);
    localStorage.setItem(LOCAL_AUTH_STORAGE_KEY, JSON.stringify(mockUser));
    return { success: true, user: mockUser };
  };

  const signUpWithEmail = async (email, password, name = 'Atelier Designer') => {
    setError(null);
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name }
          }
        });

        if (error) {
          return { success: false, error: error.message };
        }

        if (data?.user) {
          setUser(data.user);
          localStorage.setItem(LOCAL_AUTH_STORAGE_KEY, JSON.stringify(data.user));
        }
        return { success: true, user: data.user };
      } catch (err) {
        return { success: false, error: err.message };
      }
    }

    const mockUser = {
      id: 'usr_' + Date.now(),
      email,
      user_metadata: { name }
    };
    setUser(mockUser);
    localStorage.setItem(LOCAL_AUTH_STORAGE_KEY, JSON.stringify(mockUser));
    return { success: true, user: mockUser };
  };

  const loginWithDemo = (name = 'Nancy Bhardwaj', email = 'nancy@atelier.com') => {
    const demoUser = {
      id: 'demo-nancy-1',
      email,
      user_metadata: {
        name,
        avatar_url: '/atelier/user_avatar.jpg'
      }
    };
    setUser(demoUser);
    try {
      localStorage.setItem(LOCAL_AUTH_STORAGE_KEY, JSON.stringify(demoUser));
    } catch (e) {
      console.warn('Could not store demo user', e);
    }
    return demoUser;
  };

  const signOut = async () => {
    setError(null);
    try {
      if (isSupabaseConfigured && supabase) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.warn('[Auth] Sign-out warning:', err);
    } finally {
      setUser(null);
      setSession(null);
      try {
        localStorage.removeItem(LOCAL_AUTH_STORAGE_KEY);
      } catch (e) {
        console.warn('Could not remove auth user', e);
      }
    }
  };

  const value = {
    user,
    session,
    loading,
    error,
    isAuthenticated: Boolean(user),
    isConfigured: isSupabaseConfigured,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    loginWithDemo,
    signOut
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
