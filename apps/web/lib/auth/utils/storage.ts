'use client';

import { AUTH_CONFIG } from '../config';
import { AuthTokens, User } from '../types';

export class TokenStorage {
  // Check if running in browser
  private static isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  // Store tokens in localStorage
  static setTokens(tokens: AuthTokens): void {
    if (!this.isBrowser()) return;

    try {
      localStorage.setItem(AUTH_CONFIG.ACCESS_TOKEN_KEY, tokens.access);
      localStorage.setItem(AUTH_CONFIG.REFRESH_TOKEN_KEY, tokens.refresh);
    } catch (error) {
      console.error('Error storing tokens:', error);
    }
  }

  // Get tokens from localStorage
  static getTokens(): AuthTokens | null {
    if (!this.isBrowser()) return null;

    try {
      const accessToken = localStorage.getItem(AUTH_CONFIG.ACCESS_TOKEN_KEY);
      const refreshToken = localStorage.getItem(AUTH_CONFIG.REFRESH_TOKEN_KEY);

      if (accessToken && refreshToken) {
        return { access: accessToken, refresh: refreshToken };
      }
      return null;
    } catch (error) {
      console.error('Error retrieving tokens:', error);
      return null;
    }
  }

  // Get access token
  static getAccessToken(): string | null {
    if (!this.isBrowser()) return null;
    return localStorage.getItem(AUTH_CONFIG.ACCESS_TOKEN_KEY);
  }

  // Get refresh token
  static getRefreshToken(): string | null {
    if (!this.isBrowser()) return null;
    return localStorage.getItem(AUTH_CONFIG.REFRESH_TOKEN_KEY);
  }

  // Remove tokens from localStorage
  static clearTokens(): void {
    if (!this.isBrowser()) return;

    try {
      localStorage.removeItem(AUTH_CONFIG.ACCESS_TOKEN_KEY);
      localStorage.removeItem(AUTH_CONFIG.REFRESH_TOKEN_KEY);
      localStorage.removeItem(AUTH_CONFIG.USER_DATA_KEY);
    } catch (error) {
      console.error('Error clearing tokens:', error);
    }
  }

  // Store user data
  static setUser(user: User): void {
    if (!this.isBrowser()) return;

    try {
      localStorage.setItem(AUTH_CONFIG.USER_DATA_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Error storing user data:', error);
    }
  }

  // Get user data
  static getUser(): User | null {
    if (!this.isBrowser()) return null;

    try {
      const userData = localStorage.getItem(AUTH_CONFIG.USER_DATA_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error retrieving user data:', error);
      return null;
    }
  }

  // Clear all auth data
  static clearAll(): void {
    this.clearTokens();
  }
}

// Utility function to check if user is authenticated
export const isAuthenticated = (): boolean => {
  return TokenStorage.getAccessToken() !== null;
};

// Utility function to get current user
export const getCurrentUser = (): User | null => {
  return TokenStorage.getUser();
};
