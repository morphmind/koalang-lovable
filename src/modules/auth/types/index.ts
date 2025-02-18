
import { Session } from '@supabase/supabase-js';

export interface User {
  id: string;
  email: string;
  username: string;
  avatar?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  username: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<Session>;
  register: (credentials: RegisterCredentials) => Promise<Session>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}
