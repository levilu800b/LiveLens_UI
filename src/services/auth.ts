// src/services/auth.ts - SECURE VERSION
import { secureTokenManager, secureUserStorage } from '../utils/secureStorage';
import Logger from '../utils/logger';

const API_BASE = '/api/auth';

export const authAPI = {
  // Existing signup function - made secure
  signup: async (userData: {
    email: string;
    username: string;
    first_name: string;
    last_name: string;
    password: string;
    password_confirm: string;
  }) => {
    const response = await fetch(`${API_BASE}/register/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      Logger.error('Signup failed:', error.message); // Safe logging
      throw new Error(error.message || 'Signup failed');
    }

    const data = await response.json();
    Logger.log('Signup successful for user'); // No sensitive data
    return data;
  },

  // MISSING: Add regular login function
  login: async (email: string, password: string) => {
  const response = await fetch(`${API_BASE}/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    Logger.error('Login failed');
    throw new Error(error.message || 'Login failed');
  }

  const data = await response.json();
  
  // Store tokens securely
  if (data.access_token && data.refresh_token) {
    secureTokenManager.setTokens(data.access_token, data.refresh_token);
  }
  
  // Store user data securely
  if (data.user) {
    secureUserStorage.setUser(data.user);
  }
  
  Logger.logUserData('Login successful:', data.user);
  
  // ✅ FIXED: Only return user data, no tokens
  return { user: data.user };
},


  // Existing verifyEmail function - made secure
  verifyEmail: async (email: string, code: string) => {
    const response = await fetch(`${API_BASE}/verify-email/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        code: code
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      Logger.error('Email verification failed'); // Safe logging
      throw new Error(error.message || 'Verification failed');
    }

    const data = await response.json();
    Logger.log('Email verification successful');
    return data;
  },

  // Existing password reset functions - made secure
  requestPasswordReset: async (email: string) => {
    const response = await fetch('/api/password-reset/request/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    
    if (!response.ok) {
      Logger.error('Password reset request failed');
      throw new Error('Failed to send reset code');
    }
    
    Logger.log('Password reset code sent');
    return response.json();
  },

  verifyPasswordResetCode: async (email: string, code: string) => {
    const response = await fetch('/api/password-reset/verify/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, reset_code: code }),
    });
    
    if (!response.ok) {
      Logger.error('Password reset code verification failed');
      throw new Error('Invalid reset code');
    }
    
    Logger.log('Password reset code verified');
    return response.json();
  },

  confirmPasswordReset: async (email: string, code: string, newPassword: string) => {
    const response = await fetch('/api/password-reset/confirm/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        reset_code: code,
        new_password: newPassword,
        new_password_confirm: newPassword
      }),
    });
    
    if (!response.ok) {
      Logger.error('Password reset confirmation failed');
      throw new Error('Failed to reset password');
    }
    
    Logger.log('Password reset successful');
    return response.json();
  },

  // Existing Google signup - made secure
  googleSignup: async (googleData: {
    email: string;
    first_name: string;
    last_name: string;
    google_id: string;
    avatar_url?: string;
  }) => {
    const response = await fetch('/api/auth/google-signup/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(googleData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      Logger.error('Google signup failed'); // Don't log sensitive data
      throw new Error(error.message || 'Google signup failed');
    }

    const data = await response.json();
    
    // Store tokens securely
    if (data.access_token && data.refresh_token) {
      secureTokenManager.setTokens(data.access_token, data.refresh_token);
    }
    
    // Store user data securely
    if (data.user) {
      secureUserStorage.setUser(data.user);
    }
    
    Logger.logUserData('Google signup successful:', data.user); // Sanitized
    return data;
  },

  // Existing Google login - made secure
  googleLogin: async (googleData: {
  email: string;
  google_id: string;
}) => {
  const response = await fetch('/api/auth/google-login/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(googleData),
  });
  
  if (!response.ok) {
    const error = await response.json();
    Logger.error('Google login failed');
    throw new Error(error.message || 'Google login failed');
  }

  const data = await response.json();
  
  // Store tokens securely
  if (data.access_token && data.refresh_token) {
    secureTokenManager.setTokens(data.access_token, data.refresh_token);
  }
  
  // Store user data securely
  if (data.user) {
    secureUserStorage.setUser(data.user);
  }
  
  Logger.logUserData('Google login successful:', data.user);
  
  // ✅ FIXED: Only return user data, no tokens
  return { user: data.user };
},

  // NEW: Secure logout function
logout: async () => {
  const refreshToken = secureTokenManager.getRefreshToken();
  
  try {
    if (refreshToken) {
      await fetch(`${API_BASE}/logout/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
    }
  } catch (error) {
    console.error('Logout API failed, clearing local tokens anyway');
  } finally {
    // Always clear tokens and user data
    secureTokenManager.clearTokens();
    secureUserStorage.clearUser();
    
    // Redirect to login
    window.location.href = '/login';
  }
},
  // NEW: Check authentication status
  isAuthenticated: (): boolean => {
    return secureTokenManager.isAuthenticated() && secureUserStorage.getUser() !== null;
  },

  // NEW: Get current user
  getCurrentUser: () => {
    return secureUserStorage.getUser();
  },

  // NEW: Get access token for API calls
  getAccessToken: (): string | null => {
    return secureTokenManager.getAccessToken();
  }
};