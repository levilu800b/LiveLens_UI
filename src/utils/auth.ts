// src/utils/auth.ts
import { apiService } from '../services/api';
import type { User } from '../types';

export const AUTH_STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_INFO: 'account'
} as const;

// Token management utilities
export const tokenManager = {
  getAccessToken: (): string | null => {
    return localStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
  },

  getRefreshToken: (): string | null => {
    return localStorage.getItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
  },

  setTokens: (accessToken: string, refreshToken: string): void => {
    localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    localStorage.setItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
  },

  clearTokens: (): void => {
    localStorage.removeItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(AUTH_STORAGE_KEYS.USER_INFO);
  },

  isTokenExpired: (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }
};

// User management utilities
export const userManager = {
  getCurrentUser: (): User | null => {
    const userJson = localStorage.getItem(AUTH_STORAGE_KEYS.USER_INFO);
    if (!userJson) return null;
    
    try {
      return JSON.parse(userJson);
    } catch {
      return null;
    }
  },

  setCurrentUser: (user: User): void => {
    localStorage.setItem(AUTH_STORAGE_KEYS.USER_INFO, JSON.stringify(user));
  },

  clearCurrentUser: (): void => {
    localStorage.removeItem(AUTH_STORAGE_KEYS.USER_INFO);
  },

  isAuthenticated: (): boolean => {
    const token = tokenManager.getAccessToken();
    const user = userManager.getCurrentUser();
    
    return !!(token && user && !tokenManager.isTokenExpired(token));
  },

  isAdmin: (): boolean => {
    const user = userManager.getCurrentUser();
    return user?.isAdmin || false;
  }
};

// Authentication actions
export const authActions = {
  login: async (email: string, password: string) => {
    try {
      const response = await apiService.login(email, password);
      
      if (response.access && response.refresh && response.user) {
        tokenManager.setTokens(response.access, response.refresh);
        userManager.setCurrentUser(response.user);
        return { success: true, user: response.user };
      }
      
      throw new Error('Invalid response format');
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Login failed'
      };
    }
  },

  register: async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => {
    try {
      const response = await apiService.register(userData);
      return { success: true, data: response };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Registration failed'
      };
    }
  },

  verifyEmail: async (email: string, code: string) => {
    try {
      const response = await apiService.verifyEmail(email, code);
      
      if (response.access && response.refresh && response.user) {
        tokenManager.setTokens(response.access, response.refresh);
        userManager.setCurrentUser(response.user);
        return { success: true, user: response.user };
      }
      
      return { success: true, data: response };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Email verification failed'
      };
    }
  },

  logout: async () => {
    try {
      await apiService.logout();
    } catch (error) {
      // Even if the API call fails, we should clear local storage
      console.warn('Logout API call failed:', error);
    } finally {
      tokenManager.clearTokens();
      userManager.clearCurrentUser();
    }
  },

  refreshToken: async () => {
    try {
      const response = await apiService.refreshToken();
      
      if (response.access) {
        tokenManager.setTokens(response.access, tokenManager.getRefreshToken() || '');
        return { success: true };
      }
      
      throw new Error('Invalid refresh response');
    } catch (error) {
      // If refresh fails, logout the user
      authActions.logout();
      return { success: false };
    }
  },

  forgotPassword: async (email: string) => {
    try {
      const response = await apiService.forgotPassword(email);
      return { success: true, data: response };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Password reset request failed'
      };
    }
  },

  resetPassword: async (email: string, code: string, password: string) => {
    try {
      const response = await apiService.resetPassword(email, code, password);
      return { success: true, data: response };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Password reset failed'
      };
    }
  },

  resendVerification: async (email: string) => {
    try {
      const response = await apiService.resendVerification(email);
      return { success: true, data: response };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Failed to resend verification'
      };
    }
  }
};

// Auto-refresh token setup
export const setupTokenRefresh = () => {
  const checkTokenExpiry = () => {
    const token = tokenManager.getAccessToken();
    if (!token) return;

    if (tokenManager.isTokenExpired(token)) {
      authActions.refreshToken();
    }
  };

  // Check token expiry every 5 minutes
  setInterval(checkTokenExpiry, 5 * 60 * 1000);
};

// Axios interceptor setup for automatic token refresh
export const setupApiInterceptors = () => {
  // This would be used if we were using axios instead of fetch
  // For now, we handle token refresh manually in the API service
};

// Validation utilities
export const validation = {
  email: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  password: (password: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  verificationCode: (code: string): boolean => {
    return /^\d{6}$/.test(code);
  }
};

// Initialize authentication on app start
export const initializeAuth = () => {
  // Check if user is already authenticated
  const isAuth = userManager.isAuthenticated();
  
  if (isAuth) {
    setupTokenRefresh();
  }
  
  return {
    isAuthenticated: isAuth,
    user: userManager.getCurrentUser()
  };
};