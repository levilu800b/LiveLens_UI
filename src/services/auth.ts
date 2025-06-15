// src/services/auth.ts - UPDATED FOR ENCRYPTED STORAGE
import { secureAuth } from '../utils/secureAuth';

const API_BASE = '/api/auth';

export const authAPI = {
  signup: async (userData: any) => {
    const response = await fetch(`${API_BASE}/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Signup failed');
    }

    return response.json();
  },

  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE}/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    const data = await response.json();
    
    // Store everything encrypted
    if (data.access_token && data.refresh_token && data.user) {
      secureAuth.setAuth(data.access_token, data.refresh_token, data.user);
    }
    
    return { user: data.user };
  },

  verifyEmail: async (email: string, code: string) => {
    const response = await fetch(`${API_BASE}/verify-email/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Verification failed');
    }

    return response.json();
  },

  requestPasswordReset: async (email: string) => {
    const response = await fetch('/api/password-reset/request/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to send reset code');
    }
    
    return response.json();
  },

  verifyPasswordResetCode: async (email: string, code: string) => {
    const response = await fetch('/api/password-reset/verify/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, reset_code: code }),
    });
    
    if (!response.ok) {
      throw new Error('Invalid reset code');
    }
    
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
      throw new Error('Failed to reset password');
    }
    
    return response.json();
  },

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
      throw new Error(error.message || 'Google signup failed');
    }

    const data = await response.json();
    
    // Store everything encrypted
    if (data.access_token && data.refresh_token && data.user) {
      secureAuth.setAuth(data.access_token, data.refresh_token, data.user);
    }
    
    return { user: data.user };
  },

  googleLogin: async (googleData: any) => {
    const response = await fetch('/api/auth/google-login/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(googleData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Google login failed');
    }

    const data = await response.json();
    
    // Store everything encrypted
    if (data.access_token && data.refresh_token && data.user) {
      secureAuth.setAuth(data.access_token, data.refresh_token, data.user);
    }
    
    return { user: data.user };
  },

  logout: async () => {
    const refreshToken = secureAuth.getRefreshToken();
    
    try {
      if (refreshToken) {
        await fetch(`${API_BASE}/logout/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
      }
    } catch (error) {
      // Fail silently
    } finally {
      secureAuth.clearAuth();
      window.location.href = '/login';
    }
  },

  isAuthenticated: (): boolean => {
    return secureAuth.isAuthenticated();
  },

  getCurrentUser: () => {
    return secureAuth.getUser();
  },

  getAccessToken: (): string | null => {
    return secureAuth.getAccessToken();
  }
}