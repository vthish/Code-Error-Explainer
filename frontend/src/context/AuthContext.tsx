import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthResponse } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  loginWithGoogle: (payload: { credential?: string; email?: string; name?: string; picture?: string; googleId?: string }) => Promise<void>;
  loginDemo: (email?: string, name?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setIsLoading(false);
      return;
    }

    api
      .getMe()
      .then((res) => {
        setUser(res.user);
      })
      .catch(() => {
        // Clear invalid token
        localStorage.removeItem('auth_token');
        setUser(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const handleAuthSuccess = (res: AuthResponse) => {
    localStorage.setItem('auth_token', res.token);
    setUser(res.user);
  };

  const loginWithGoogle = async (payload: { credential?: string; email?: string; name?: string; picture?: string; googleId?: string }) => {
    setIsLoading(true);
    try {
      const res = await api.loginWithGoogle(payload);
      handleAuthSuccess(res);
    } finally {
      setIsLoading(false);
    }
  };

  const loginDemo = async (email?: string, name?: string) => {
    setIsLoading(true);
    try {
      const res = await api.loginDemo(email, name);
      handleAuthSuccess(res);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        isLoading,
        loginWithGoogle,
        loginDemo,
        logout,
      }}
    >
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
