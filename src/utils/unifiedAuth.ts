// src/utils/unifiedAuth.ts - SINGLE SOURCE OF TRUTH FOR AUTHENTICATION
import type { User } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Storage Keys - Single source of truth
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'account',
} as const;

// ===== TOKEN MANAGEMENT =====
export const tokenManager = {
  getAccessToken: (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  },

  getRefreshToken: (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  },

  setTokens: (accessToken: string, refreshToken: string): void => {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
  },

  clearTokens: (): void => {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
  },

  isTokenExpired: (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  },

  isAuthenticated: (): boolean => {
    const token = tokenManager.getAccessToken();
    const user = userManager.getUser();
    return !!(token && user && !tokenManager.isTokenExpired(token));
  }
};

// ===== USER DATA MANAGEMENT =====
export const userManager = {
  getUser: (): User | null => {
    const userJson = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    if (!userJson) return null;
    
    try {
      return JSON.parse(userJson);
    } catch {
      return null;
    }
  },

  setUser: (user: User): void => {
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
  },

  clearUser: (): void => {
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
  }
};

// ===== HTTP REQUEST HELPER =====
const makeAuthenticatedRequest = async (
  endpoint: string, 
  options: RequestInit = {}
): Promise<any> => {
  const token = tokenManager.getAccessToken();
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  // Handle 401 - Try to refresh token
  if (response.status === 401 && token) {
    try {
      await authService.refreshToken();
      const newToken = tokenManager.getAccessToken();
      
      if (newToken) {
        const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${newToken}`,
            ...options.headers,
          },
        });
        
        if (retryResponse.ok) {
          return retryResponse.json();
        }
      }
    } catch (refreshError) {
      console.error('Token refresh failed:', refreshError);
      authService.logout();
      throw new Error('Your session has expired. Please login again.');
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.detail || `HTTP ${response.status}`);
  }

  return response.json();
};

// ===== AUTH SERVICE =====
export const authService = {
  // Login
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Login failed');
    }

    const data = await response.json();
    
    // Store tokens and user data
    if (data.access_token && data.refresh_token) {
      tokenManager.setTokens(data.access_token, data.refresh_token);
    }
    
    if (data.user) {
      userManager.setUser(data.user);
    }

    return data;
  },

  // Google Login
  googleLogin: async (googleData: { email: string; google_id: string }) => {
    const response = await fetch(`${API_BASE_URL}/auth/google-login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(googleData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Google login failed');
    }

    const data = await response.json();
    
    // Store tokens and user data
    if (data.access_token && data.refresh_token) {
      tokenManager.setTokens(data.access_token, data.refresh_token);
    }
    
    if (data.user) {
      userManager.setUser(data.user);
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Registration failed');
    }

    return response.json();
  },

  // Logout
  logout: async () => {
    const refreshToken = tokenManager.getRefreshToken();
    
    if (refreshToken) {
      try {
        await fetch(`${API_BASE_URL}/auth/logout/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
      } catch (error) {
        console.warn('Logout API call failed:', error);
      }
    }
    
    // Clear all auth data
    tokenManager.clearTokens();
    userManager.clearUser();
  },

  // Refresh Token
  refreshToken: async () => {
    const refreshToken = tokenManager.getRefreshToken();
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${API_BASE_URL}/auth/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Token refresh failed');
    }

    const data = await response.json();
    
    // Update access token
    if (data.access) {
      tokenManager.setTokens(data.access, refreshToken);
    }

    return data;
  }
};

// ===== PROFILE SERVICE =====
export const profileService = {
  // Get Profile
  getProfile: async () => {
    return makeAuthenticatedRequest('/auth/profile/');
  },

  // Update Profile (supports FormData for file uploads)
  updateProfile: async (formData: FormData) => {
    const token = tokenManager.getAccessToken();
    if (!token) {
      throw new Error('No authentication token found. Please login again.');
    }

    const response = await fetch(`${API_BASE_URL}/auth/profile/`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        // Don't set Content-Type for FormData
      },
      body: formData,
    });

    if (!response.ok) {
      // Handle 401 with token refresh
      if (response.status === 401) {
        try {
          await authService.refreshToken();
          const newToken = tokenManager.getAccessToken();
          
          if (newToken) {
            const retryResponse = await fetch(`${API_BASE_URL}/auth/profile/`, {
              method: 'PUT',
              headers: { Authorization: `Bearer ${newToken}` },
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
  }
};

// ===== CONTENT SERVICE HELPER =====
export const contentService = {
  // Make authenticated requests for content
  request: async (endpoint: string, options: RequestInit = {}) => {
    return makeAuthenticatedRequest(endpoint, options);
  }
};

// ===== DEFAULT EXPORT - UNIFIED AUTH =====
export default {
  // Token management
  ...tokenManager,
  
  // User management
  user: userManager,
  
  // Auth operations
  auth: authService,
  
  // Profile operations
  profile: profileService,
  
  // Content requests
  content: contentService,
  
  // Quick auth check
  isLoggedIn: tokenManager.isAuthenticated,
};