// src/services/api.ts - UPDATED WITH TOKEN MANAGEMENT
import { secureTokenManager, secureUserStorage } from '../utils/secureStorage';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Auth API functions with token management
export const authAPI = {
  // Token management methods
  getAccessToken: (): string | null => {
    return secureTokenManager.getAccessToken() || localStorage.getItem('access_token');
  },

  getRefreshToken: (): string | null => {
    return secureTokenManager.getRefreshToken() || localStorage.getItem('refresh_token');
  },

  setTokens: (accessToken: string, refreshToken: string): void => {
    secureTokenManager.setTokens(accessToken, refreshToken);
    // Also set in localStorage for backward compatibility
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  },

  clearTokens: (): void => {
    secureTokenManager.clearTokens();
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    secureUserStorage.clearUser();
  },

  isAuthenticated: (): boolean => {
    return secureTokenManager.isAuthenticated() || !!localStorage.getItem('access_token');
  },

  // Login
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Login failed');
    }

    const data = await response.json();
    
    // Store tokens using the secure manager
    if (data.access_token && data.refresh_token) {
      authAPI.setTokens(data.access_token, data.refresh_token);
    }
    
    // Store user data
    if (data.user) {
      secureUserStorage.setUser(data.user);
    }

    return data;
  },

  // Google Login
  googleLogin: async (googleData: { email: string; google_id: string }) => {
    const response = await fetch(`${API_BASE_URL}/auth/google-login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(googleData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Google login failed');
    }

    const data = await response.json();
    
    // Store tokens using the secure manager
    if (data.access_token && data.refresh_token) {
      authAPI.setTokens(data.access_token, data.refresh_token);
    }
    
    // Store user data
    if (data.user) {
      secureUserStorage.setUser(data.user);
    }

    return data;
  },

  // Register
  register: async (userData: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
  }) => {
    const response = await fetch(`${API_BASE_URL}/auth/register/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Registration failed');
    }

    return response.json();
  },

  // Google Signup
  googleSignup: async (userData: {
    first_name: string;
    last_name: string;
    email: string;
    google_id: string;
    avatar_url?: string;
  }) => {
    const response = await fetch(`${API_BASE_URL}/auth/google-signup/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Google signup failed');
    }

    return response.json();
  },

  // Email verification
  verifyEmail: async (email: string, code: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/verify-email/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, code }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Email verification failed');
    }

    return response.json();
  },

  // Request password reset
  requestPasswordReset: async (email: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/request-password-reset/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Password reset request failed');
    }

    return response.json();
  },

  // Reset password
  resetPassword: async (email: string, code: string, newPassword: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        email, 
        code, 
        new_password: newPassword 
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Password reset failed');
    }

    return response.json();
  },

  // Logout
  logout: async (refreshToken?: string) => {
    const token = refreshToken || authAPI.getRefreshToken();
    
    if (token) {
      try {
        await fetch(`${API_BASE_URL}/auth/logout/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refresh_token: token }),
        });
      } catch (error) {
        console.warn('Logout API call failed:', error);
      }
    }
    
    // Clear tokens regardless of API call success
    authAPI.clearTokens();
  },

  // Refresh token
  refreshToken: async (refreshToken?: string) => {
    const token = refreshToken || authAPI.getRefreshToken();
    
    if (!token) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${API_BASE_URL}/auth/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: token }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Token refresh failed');
    }

    const data = await response.json();
    
    // Update tokens
    if (data.access_token) {
      const currentRefresh = authAPI.getRefreshToken() || token;
      authAPI.setTokens(data.access_token, currentRefresh);
    }

    return data;
  },
};

// Profile API functions
export const profileAPI = {
  // Get user profile
  getProfile: async () => {
    const token = authAPI.getAccessToken();
    if (!token) {
      throw new Error('No authentication token found. Please login again.');
    }

    const response = await fetch(`${API_BASE_URL}/auth/profile/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // If unauthorized, try to refresh token
      if (response.status === 401) {
        try {
          await authAPI.refreshToken();
          const newToken = authAPI.getAccessToken();
          
          if (newToken) {
            const retryResponse = await fetch(`${API_BASE_URL}/auth/profile/`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${newToken}`,
                'Content-Type': 'application/json',
              },
            });
            
            if (retryResponse.ok) {
              return retryResponse.json();
            }
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
        }
        
        throw new Error('Your session has expired. Please login again.');
      }
      
      const errorData = await response.json();
      throw new Error(errorData.message || errorData.detail || 'Failed to get profile');
    }

    return response.json();
  },

  // Update user profile with avatar
  updateProfile: async (formData: FormData) => {
    const token = authAPI.getAccessToken();
    if (!token) {
      throw new Error('No authentication token found. Please login again.');
    }

    const response = await fetch(`${API_BASE_URL}/auth/profile/`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        // Don't set Content-Type for FormData - let browser set it with boundary
      },
      body: formData,
    });

    if (!response.ok) {
      // If unauthorized, try to refresh token
      if (response.status === 401) {
        try {
          await authAPI.refreshToken();
          const newToken = authAPI.getAccessToken();
          
          if (newToken) {
            const retryResponse = await fetch(`${API_BASE_URL}/auth/profile/`, {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${newToken}`,
              },
              body: formData,
            });
            
            if (retryResponse.ok) {
              return retryResponse.json();
            }
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
        }
        
        throw new Error('Your session has expired. Please login again.');
      }
      
      const errorData = await response.json();
      throw new Error(errorData.message || errorData.detail || 'Failed to update profile');
    }

    return response.json();
  },
};