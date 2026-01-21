'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, getToken, getUser, setAuth, clearAuth, login as authLogin, logout as authLogout } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize auth state from localStorage
    const storedToken = getToken();
    const storedUser = getUser();
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(storedUser);
    }
    
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const result = await authLogin(email, password);
    setToken(result.token);
    setUser(result.user);
    return result.user;
  };

  const logout = () => {
    authLogout();
    setToken(null);
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

