
import React, { createContext, useReducer, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { authReducer } from './authReducer';
import { AuthContextType, User } from '../types';

const initialState = {
  user: null,
  isLoading: true,
  error: null
};

const AuthContext = createContext<AuthContextType>({
  ...initialState,
  login: async () => {},
  register: async () => {},
  signOut: async () => {},
  resetPassword: async () => {}
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthChange = async (session: any) => {
      if (!session?.user) {
        dispatch({ type: 'CLEAR_USER' });
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }

      try {
        let { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();

        if (!profile) {
          const { data: newProfile, error: profileError } = await supabase
            .from('profiles')
            .insert([
              { 
                id: session.user.id,
                email: session.user.email,
                username: session.user.user_metadata.username || session.user.email?.split('@')[0],
              }
            ])
            .select()
            .single();

          if (profileError) throw profileError;
          profile = newProfile;
        }

        const user: User = {
          id: session.user.id,
          email: session.user.email!,
          username: profile.username || '',
          avatar: profile.avatar_url,
          createdAt: new Date(profile.created_at || session.user.created_at),
          updatedAt: new Date(profile.updated_at || session.user.created_at)
        };

        dispatch({ type: 'SET_USER', payload: user });
        
        // Admin giriş kontrolü
        if (window.location.pathname === '/admin/login') {
          const { data: adminRole } = await supabase
            .from('admin_roles')
            .select('role')
            .eq('user_id', session.user.id)
            .maybeSingle();

          if (adminRole) {
            navigate('/admin/dashboard');
          } else {
            await supabase.auth.signOut();
            navigate('/');
          }
        } else if (['/login', '/register', '/'].includes(window.location.pathname)) {
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Kullanıcı bilgileri yüklenirken hata oluştu' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session);
      
      if (event === 'SIGNED_IN') {
        await handleAuthChange(session);
      } else if (event === 'SIGNED_OUT') {
        dispatch({ type: 'CLEAR_USER' });
        dispatch({ type: 'SET_LOADING', payload: false });
        navigate('/');
      }
    });

    // Initial session check
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Initial session check:', session);
        
        if (session) {
          await handleAuthChange(session);
        } else {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (error) {
        console.error('Session check error:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Oturum kontrolü sırasında hata oluştu' });
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    checkSession();
  }, [navigate]);

  const login = async (credentials: { email: string; password: string }) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const { data: { session }, error } = await supabase.auth.signInWithPassword(credentials);
      if (error) throw error;

      return session;
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const register = async (credentials: { email: string; password: string; username: string }) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const { data: { session }, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            username: credentials.username
          }
        }
      });
      
      if (error) throw error;

      return session;
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const signOut = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      dispatch({ type: 'CLEAR_USER' });
      navigate('/');
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const resetPassword = async (email: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, signOut, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
