'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AuthContext } from './AuthContext';
import { 
  AuthState, 
  LoginCredentials, 
  RegisterCredentials, 
  User 
} from '../types';
import { authAPI } from '../../api/auth';
import { TokenStorage, isAuthenticated, getCurrentUser } from '../utils/storage';

const initialState: AuthState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>(initialState);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const authenticated = isAuthenticated();
        let user = getCurrentUser();

        if (authenticated && !user) {
          // Fetch user profile if tokens exist but user data is missing
          user = await authAPI.getProfile();
          TokenStorage.setUser(user);
        }

        setState({
          user,
          tokens: TokenStorage.getTokens(),
          isAuthenticated: authenticated,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        console.error('Auth initialization error:', error);
        TokenStorage.clearAll();
        setState({
          ...initialState,
          isLoading: false,
        });
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = useCallback(async (credentials: LoginCredentials) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await authAPI.login(credentials);
      
      // Store tokens and user data
      TokenStorage.setTokens(response.tokens);
      TokenStorage.setUser(response.user);

      setState({
        user: response.user,
        tokens: response.tokens,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      const errorMessage = error.message || 'Login failed. Please try again.';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, []);

  // Register function
  const register = useCallback(async (credentials: RegisterCredentials) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      await authAPI.register(credentials);
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: null,
      }));
    } catch (error: any) {
      const errorMessage = error.message || 'Registration failed. Please try again.';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear storage and reset state
      TokenStorage.clearAll();
      setState({
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  }, []);

  // Refresh tokens
  const refreshTokens = useCallback(async (): Promise<boolean> => {
    try {
      const tokens = TokenStorage.getTokens();
      if (!tokens) return false;

      const response = await authAPI.refreshTokens(tokens.refresh);
      
      TokenStorage.setTokens({
        access: response.access,
        refresh: response.refresh || tokens.refresh,
      });

      setState(prev => ({
        ...prev,
        tokens: {
          access: response.access,
          refresh: response.refresh || tokens.refresh,
        },
      }));

      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      await logout();
      return false;
    }
  }, [logout]);

  // Update user data
  const updateUser = useCallback((userData: Partial<User>) => {
    setState(prev => {
      if (!prev.user) return prev;

      const updatedUser = { ...prev.user, ...userData };
      TokenStorage.setUser(updatedUser);

      return {
        ...prev,
        user: updatedUser,
      };
    });
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    refreshTokens,
    updateUser,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
