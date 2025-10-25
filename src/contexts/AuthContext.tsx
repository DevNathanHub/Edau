
import React, { createContext, useContext, useEffect, useState } from 'react';
// ...existing code...
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { apiService } from '@/lib/api';
import { User, isTokenExpired, getTokenPayload } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  session: { token: string } | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, userData?: any) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<{ token: string } | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Initialize session from localStorage and token; fallback to /auth/me
  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('auth_token');
      const storedUser = localStorage.getItem('auth_user');
      if (!token) {
        setLoading(false);
        return;
      }
      if (isTokenExpired(token)) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        setUser(null);
        setSession(null);
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      setSession({ token });
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          setUser(parsed);
          setIsAdmin(parsed.role === 'admin');
          setLoading(false);
          return;
        } catch (error) {
          console.warn('Failed to load user from localStorage:', error);
        }
      }
      const decoded = getTokenPayload(token);
      if (decoded && decoded.userId && decoded.email) {
        const fallback: any = {
          _id: decoded.userId,
          email: decoded.email,
          first_name: decoded.first_name || '',
          last_name: decoded.last_name || '',
          role: decoded.role || 'user',
        };
        setUser(fallback);
        setIsAdmin(fallback.role === 'admin');
        localStorage.setItem('auth_user', JSON.stringify(fallback));
        setLoading(false);
        return;
      }
      // Try backend as last resort
      const me = await apiService.me();
      const mePayload: any = me.data && (me.data as any).data;
      if (mePayload) {
        setUser({
          _id: mePayload.id,
          email: mePayload.email,
          first_name: mePayload.first_name,
          last_name: mePayload.last_name,
          role: mePayload.role,
        } as any);
        setIsAdmin(mePayload.role === 'admin');
        localStorage.setItem('auth_user', JSON.stringify(mePayload));
      } else {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        setUser(null);
        setSession(null);
        setIsAdmin(false);
      }
      setLoading(false);
    };
    init();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('[Auth] Attempting login:', email);
      const result = await apiService.login(email, password);
      if (result.error) {
        console.log('[Auth] Login error:', result.error);
        toast({
          title: 'Login failed',
          description: typeof result.error === 'string' ? result.error : (result.error ? JSON.stringify(result.error) : 'Invalid credentials'),
          variant: 'destructive',
        });
        return { error: result.error };
      }
      const responseData: any = result.data || {};
      const token = responseData.token;
      const userData = responseData.user;
      if (userData && token) {
        setUser(userData);
        setSession({ token });
        localStorage.setItem('auth_token', token);
        localStorage.setItem('auth_user', JSON.stringify(userData));
        setIsAdmin((userData as any).role === 'admin');
        toast({
          title: 'Login successful',
          description: `Welcome back, ${userData.first_name || userData.email}!`,
        });
        console.log('[AuthContext] signIn: token saved:', token);
        console.log('[AuthContext] signIn: user saved:', userData);
        console.log('[Auth] Login success, navigating to /');
        navigate('/dashboard');
      }
      return { error: null };
    } catch (error) {
      console.error('[Auth] Sign in error:', error);
      return { error: { message: 'An error occurred during sign in' } };
    }
  };

  const signUp = async (email: string, password: string, userData?: any) => {
    try {
      console.log('[Auth] Attempting signup:', email);
      const result = await apiService.register({
        email,
        password,
        ...userData
      });
      if (result.error) {
        console.log('[Auth] Signup error:', result.error);
        toast({
          title: 'Signup failed',
          description: typeof result.error === 'string' ? result.error : (result.error ? JSON.stringify(result.error) : 'Could not create account'),
          variant: 'destructive',
        });
        return { error: result.error };
      }
      // Auto-login after successful registration
      if (result.data) {
        const responseData: any = result.data || {};
        const token = responseData.token;
        const newUser = responseData.user;
        if (!newUser || !token) {
          return { error: { message: 'Malformed signup response' } };
        }
        setUser(newUser);
        setSession({ token });
        localStorage.setItem('auth_token', token);
        localStorage.setItem('auth_user', JSON.stringify(newUser));
        setIsAdmin((newUser as any).role === 'admin');
        toast({
          title: 'Account created',
          description: `Welcome, ${newUser.first_name || newUser.email}!`,
        });
        console.log('[AuthContext] signUp: token saved:', token);
        console.log('[AuthContext] signUp: user saved:', newUser);
        console.log('[Auth] Signup success, navigating to /dashboard');
        navigate('/dashboard');
      }
      return { error: null };
    } catch (error) {
      console.error('[Auth] Sign up error:', error);
      return { error: { message: 'An error occurred during sign up' } };
    }
  };

  const signOut = async () => {
    console.log('[Auth] Signing out');
    toast({
      title: 'Signed out',
      description: 'You have been signed out.',
    });
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
    setUser(null);
    setSession(null);
    setIsAdmin(false);
    navigate('/login');
  };

  const value = {
    user,
    session,
    isAdmin,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
