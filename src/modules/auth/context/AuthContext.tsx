
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        
        if (event === 'SIGNED_IN') {
          if (session?.user) {
            try {
              // Load user profile data
              const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

              const user: User = {
                id: session.user.id,
                email: session.user.email!,
                username: profile?.username || '',
                avatar: profile?.avatar_url,
                createdAt: new Date(profile?.created_at || session.user.created_at),
                updatedAt: new Date(profile?.updated_at || session.user.created_at)
              };

              dispatch({ type: 'SET_USER', payload: user });
              dispatch({ type: 'SET_LOADING', payload: false });
              
              console.log('User data loaded:', user);

              // Admin kontrolü yap
              const { data: adminRole } = await supabase
                .from('admin_roles')
                .select('role')
                .eq('user_id', session.user.id)
                .maybeSingle();

              // Eğer admin sayfasında değilse ve normal giriş yapılmışsa dashboard'a yönlendir
              const currentPath = window.location.pathname;
              if (!currentPath.startsWith('/admin')) {
                navigate('/dashboard');
              }
              // Admin sayfasında giriş yapıldıysa ve admin rolü varsa admin dashboard'a yönlendir
              else if (currentPath.startsWith('/admin') && adminRole) {
                navigate('/admin/dashboard');
              }
              // Admin sayfasında giriş yapıldı ama admin değilse ana sayfaya yönlendir
              else if (currentPath.startsWith('/admin') && !adminRole) {
                await supabase.auth.signOut();
                navigate('/');
              }

            } catch (error) {
              console.error('Error loading user data:', error);
              dispatch({ type: 'SET_ERROR', payload: 'Kullanıcı bilgileri yüklenirken hata oluştu' });
              dispatch({ type: 'SET_LOADING', payload: false });
            }
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out');
          dispatch({ type: 'CLEAR_USER' });
          dispatch({ type: 'SET_LOADING', payload: false });
          navigate('/');
        }
      }
    );

    // Initial session check
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Initial session check:', session);
        
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          const user: User = {
            id: session.user.id,
            email: session.user.email!,
            username: profile?.username || '',
            avatar: profile?.avatar_url,
            createdAt: new Date(profile?.created_at || session.user.created_at),
            updatedAt: new Date(profile?.updated_at || session.user.created_at)
          };

          dispatch({ type: 'SET_USER', payload: user });
        }
      } catch (error) {
        console.error('Session check error:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Oturum kontrolü sırasında hata oluştu' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    checkSession();

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const login = async (credentials: { email: string; password: string }) => {
    try {
      console.log('Login attempt started');
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const { error, data } = await supabase.auth.signInWithPassword(credentials);
      
      if (error) {
        console.error('Login error:', error);
        throw error;
      }

      console.log('Login successful:', data);

    } catch (error: any) {
      console.error('Login process error:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const register = async (credentials: { email: string; password: string; username: string }) => {
    try {
      console.log('Register attempt started');
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const { error } = await supabase.auth.signUp(credentials);
      
      if (error) {
        console.error('Register error:', error);
        throw error;
      }

      console.log('Register successful');

    } catch (error: any) {
      console.error('Register process error:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const signOut = async () => {
    try {
      console.log('Sign out attempt started');
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      dispatch({ type: 'CLEAR_USER' });
      console.log('Sign out successful');
      
    } catch (error: any) {
      console.error('Sign out error:', error);
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
