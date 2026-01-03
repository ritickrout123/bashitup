'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  AuthContextType,
  LoginCredentials,
  UserRegistration,
  User,
  APIResponse,
  AuthResponse
} from '@/types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<Omit<User, 'password'> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is authenticated
  const isAuthenticated = !!user;

  // Initialize auth state on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Check authentication status
  const checkAuthStatus = async () => {
    try {
      console.log('Checking auth status...');
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      });

      console.log('Auth check response status:', response.status);

      if (response.ok) {
        const data: APIResponse<Omit<User, 'password'>> = await response.json();
        console.log('Auth check data:', data);
        if (data.success && data.data) {
          setUser(data.data);
        }
      } else {
        console.log('Auth check failed:', response.statusText);
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Login function
  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      console.log('Attempting login...');
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(credentials),
      });

      console.log('Login response status:', response.status);
      const data: APIResponse<AuthResponse> = await response.json();
      console.log('Login response data:', data);

      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || 'Login failed');
      }

      if (data.data) {
        setUser(data.data.user);
        console.log('User set successfully:', data.data.user);
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (userData: UserRegistration) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(userData),
      });

      const data: APIResponse<AuthResponse> = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || 'Registration failed');
      }

      if (data.data) {
        setUser(data.data.user);
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      // Redirect to home page
      window.location.href = '/';
    }
  };

  // Refresh token function
  const refreshToken = async () => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        const data: APIResponse<AuthResponse> = await response.json();
        if (data.success && data.data) {
          setUser(data.data.user);
        }
      } else {
        // If refresh fails, logout user
        setUser(null);
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      setUser(null);
    }
  };

  // Auto-refresh token before expiry
  useEffect(() => {
    if (!isAuthenticated) return;

    // Refresh token every 6 days (before 7-day expiry)
    const refreshInterval = setInterval(() => {
      refreshToken();
    }, 6 * 24 * 60 * 60 * 1000); // 6 days in milliseconds

    return () => clearInterval(refreshInterval);
  }, [isAuthenticated]);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshToken,
    mutate: checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}