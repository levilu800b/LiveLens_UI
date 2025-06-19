// src/utils/secureAuth.ts - SECURE AUTHENTICATION (NO TOKEN EXPOSURE)
import type { User } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Only store non-sensitive user data
const USER_DATA_KEY = 'user_profile';

// ===== SECURE USER MANAGEMENT =====
export const secureUserManager = {
  getUser: (): User | null => {
    try {
      const userData = localStorage.getItem(USER_DATA_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  },

  setUser: (user: User): void => {
    // Only store non-sensitive user profile data
    const safeUserData = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
      isAdmin: user.isAdmin,
      // DO NOT store any tokens or sensitive data
    };
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(safeUserData));
  },

  clearUser: (): void => {
    localStorage.removeItem(USER_DATA_KEY);
  },

  isLoggedIn: (): boolean => {
    return secureUserManager.getUser() !== null;
  }
};

// ===== SECURE HTTP CLIENT =====
class SecureHttpClient {
  private async makeRequest(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<any> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      credentials: 'include', // CRITICAL: Include HTTP-only cookies
      headers: {
        'Content-Type': 'application/json',
        // CSRF token will be handled by backend via cookies
        ...options.headers,
      },
    });

    // Handle authentication errors
    if (response.status === 401) {
      // Clear user data and redirect to login
      secureUserManager.clearUser();
      window.location.href = '/login';
      throw new Error('Session expired. Please login again.');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.detail || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async get(endpoint: string): Promise<any> {
    return this.makeRequest(endpoint, { method: 'GET' });
  }

  async post(endpoint: string, data?: any): Promise<any> {
    return this.makeRequest(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put(endpoint: string, data?: any): Promise<any> {
    return this.makeRequest(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async postFormData(endpoint: string, formData: FormData): Promise<any> {
    return fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      credentials: 'include',
      body: formData, // Don't set Content-Type for FormData
    }).then(async response => {
      if (response.status === 401) {
        secureUserManager.clearUser();
        window.location.href = '/login';
        throw new Error('Session expired. Please login again.');
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.detail || `HTTP ${response.status}`);
      }
      
      return response.json();
    });
  }
}

const httpClient = new SecureHttpClient();

// ===== SECURE AUTH SERVICE =====
export const secureAuthService = {
  // Login - tokens stored in HTTP-only cookies
  login: async (email: string, password: string) => {
    const data = await httpClient.post('/auth/login/', { email, password });
    
    // Only store safe user data (NO TOKENS)
    if (data.user) {
      secureUserManager.setUser(data.user);
    }
    
    return data;
  },

  // Google Login
  googleLogin: async (googleData: { email: string; google_id: string }) => {
    const data = await httpClient.post('/auth/google-login/', googleData);
    
    if (data.user) {
      secureUserManager.setUser(data.user);
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
    return httpClient.post('/auth/register/', userData);
  },

  // Logout - backend clears HTTP-only cookies
  logout: async () => {
    try {
      await httpClient.post('/auth/logout/');
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      // Always clear user data
      secureUserManager.clearUser();
      window.location.href = '/login';
    }
  },

  // Check auth status - relies on HTTP-only cookies
  checkAuth: async () => {
    try {
      const data = await httpClient.get('/auth/profile/');
      if (data.user) {
        secureUserManager.setUser(data.user);
        return true;
      }
      return false;
    } catch {
      secureUserManager.clearUser();
      return false;
    }
  }
};

// ===== SECURE PROFILE SERVICE =====
export const secureProfileService = {
  getProfile: async () => {
    const data = await httpClient.get('/auth/profile/');
    
    if (data.user) {
      secureUserManager.setUser(data.user);
    }
    
    return data;
  },

  updateProfile: async (formData: FormData) => {
    const data = await httpClient.postFormData('/auth/profile/', formData);
    
    if (data.user) {
      secureUserManager.setUser(data.user);
    }
    
    return data;
  }
};

// ===== SECURE CONTENT SERVICE =====
export const secureContentService = {
  getUserLibrary: async () => {
    return httpClient.get('/user/library/');
  },

  getUserFavorites: async () => {
    return httpClient.get('/user/favorites/');
  },

  favoriteContent: (contentType: string, contentId: string) => {
    const typeMap: Record<string, string> = {
      'story': 'stories',
      'film': 'media/films',
      'content': 'media/content',
      'podcast': 'podcasts',
      'animation': 'animations',
      'sneak-peek': 'sneak-peeks'
    };

    const endpoint = typeMap[contentType];
    if (!endpoint) {
      throw new Error('Invalid content type');
    }

    return httpClient.post(`/${endpoint}/${contentId}/favorite/`);
  },

  bookmarkContent: (contentType: string, contentId: string) => {
    const typeMap: Record<string, string> = {
      'story': 'stories',
      'film': 'media/films',
      'content': 'media/content',
      'podcast': 'podcasts',
      'animation': 'animations',
      'sneak-peek': 'sneak-peeks'
    };

    const endpoint = typeMap[contentType];
    if (!endpoint) {
      throw new Error('Invalid content type');
    }

    return httpClient.post(`/${endpoint}/${contentId}/bookmark/`);
  }
};

// ===== MAIN EXPORT =====
export default {
  user: secureUserManager,
  auth: secureAuthService,
  profile: secureProfileService,
  content: secureContentService,
  isLoggedIn: secureUserManager.isLoggedIn,
};