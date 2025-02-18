
import React, { createContext, useReducer, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { authReducer } from './authReducer';
import { AuthContextType, User, LoginCredentials, RegisterCredentials } from '../types';

const initialState = {
  user: null,
  isLoading: true,
  error: null
};

const AuthContext = createContext<AuthContextType>({
  ...initialState,
  login: async () => {
    throw new Error('AuthContext not initialized');
  },
  register: async () => {
    throw new Error('AuthContext not initialized');
  },
  signOut: async () => {
    throw new Error('AuthContext not initialized');
  },
  resetPassword: async () => {
    throw new Error('AuthContext not initialized');
  }
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const navigate = useNavigate();
  const location = useLocation();

  const handleAuthStateChange = async (session: any) => {
    console.log('Handling auth state change:', session);
    
    if (!session?.user) {
      console.log('No session or user, clearing state...');
      dispatch({ type: 'CLEAR_USER' });
      dispatch({ type: 'SET_LOADING', payload: false });
      return;
    }

    try {
      console.log('Fetching user profile...');
      let { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      if (!profile) {
        console.log('Creating new profile...');
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([
            { 
              id: session.user.id,
              email: session.user.email,
              username: session.user.user_metadata?.username || session.user.email?.split('@')[0],
            }
          ])
          .select()
          .single();

        if (createError) throw createError;
        profile = newProfile;
      }

      const user: User = {
        id: session.user.id,
        email: session.user.email!,
        username: profile.username,
        avatar: profile.avatar_url,
        createdAt: new Date(profile.created_at),
        updatedAt: new Date(profile.updated_at)
      };

      console.log('Setting user in context:', user);
      dispatch({ type: 'SET_USER', payload: user });

      // Admin route kontrolü
      if (location.pathname.startsWith('/admin')) {
        const { data: adminRole } = await supabase
          .from('admin_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (!adminRole) {
          console.log('Admin yetkisi yok, ana sayfaya yönlendiriliyor...');
          await signOut();
          return;
        }
      }
      
      // Auth sayfalarındaysa dashboard'a yönlendir
      if (['/login', '/register', '/auth/login', '/auth/register', '/'].includes(location.pathname)) {
        console.log('Auth sayfasından dashboard\'a yönlendiriliyor...');
        navigate('/dashboard', { replace: true });
      }

    } catch (error) {
      console.error('Error in handleAuthStateChange:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Kullanıcı bilgileri yüklenirken hata oluştu' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      console.log('Login attempt...', credentials.email);
      const { data: { session }, error } = await supabase.auth.signInWithPassword(credentials);
      
      if (error) throw error;
      if (!session) throw new Error('No session returned after login');

      console.log('Login successful!');
      return session;

    } catch (error: any) {
      console.error('Login error:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      console.log('Registration attempt...', credentials.email);
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
      if (!session) throw new Error('No session returned after registration');

      console.log('Registration successful!');
      return session;

    } catch (error: any) {
      console.error('Registration error:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const signOut = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      console.log('Signing out...');
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      dispatch({ type: 'CLEAR_USER' });
      navigate('/', { replace: true });
      console.log('Sign out successful!');
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

  useEffect(() => {
    console.log('Setting up auth state change listener...');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session);
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        await handleAuthStateChange(session);
      } else if (event === 'SIGNED_OUT') {
        dispatch({ type: 'CLEAR_USER' });
        dispatch({ type: 'SET_LOADING', payload: false });
        navigate('/', { replace: true });
      }
    });

    // Initial session check
    const checkInitialSession = async () => {
      try {
        console.log('Checking initial session...');
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          await handleAuthStateChange(session);
        } else {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (error) {
        console.error('Initial session check error:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Oturum kontrolü sırasında hata oluştu' });
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    checkInitialSession();

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, location.pathname]);

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
