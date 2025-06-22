// src/utils/unifiedAuth.ts - FIXED VERSION with Google Signup Support
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ===== TOKEN MANAGEMENT =====
export const tokenManager = {
  getAccessToken: (): string | null => {
    return localStorage.getItem('access_token');
  },

  getRefreshToken: (): string | null => {
    return localStorage.getItem('refresh_token');
  },

  setTokens: (accessToken: string, refreshToken: string): void => {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  },

  clearTokens: (): void => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },

  isTokenExpired: (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return Date.now() >= payload.exp * 1000;
    } catch {
      return true;
    }
  }
};

// ===== USER MANAGEMENT =====
export const userManager = {
  getUser: () => {
    const userData = localStorage.getItem('account');
    return userData ? JSON.parse(userData) : null;
  },

  setUser: (user: any) => {
    localStorage.setItem('account', JSON.stringify(user));
  },

  clearUser: () => {
    localStorage.removeItem('account');
  }
};

// ===== HTTP CLIENT =====
const makeAuthenticatedRequest = async (url: string, options: RequestInit = {}): Promise<any> => {
  const token = tokenManager.getAccessToken();
  
  if (token && !tokenManager.isTokenExpired(token)) {
    options.headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    };
  }

  const response = await fetch(url, options);

  // Handle token expiration
  if (response.status === 401) {
    const refreshToken = tokenManager.getRefreshToken();
    if (refreshToken) {
      try {
        const refreshResponse = await fetch(`${API_BASE_URL}/auth/token/refresh/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh: refreshToken }),
        });

        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          tokenManager.setTokens(data.access, refreshToken);
          
          // Retry original request with new token
          options.headers = {
            ...options.headers,
            'Authorization': `Bearer ${data.access}`,
          };
          return fetch(url, options).then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json();
          });
        }
      } catch (error) {
        console.error('Token refresh failed:', error);
      }
    }
    
    // Clear invalid tokens and redirect
    tokenManager.clearTokens();
    userManager.clearUser();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new Error('Session expired. Please login again.');
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

  // Google Signup - NEW METHOD
  googleSignup: async (googleData: {
    email: string;
    first_name: string;
    last_name: string;
    google_id: string;
    avatar_url?: string;
  }) => {
    const response = await fetch(`${API_BASE_URL}/auth/google-signup/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(googleData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Google signup failed');
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
    // Generate username from email
    const username = userData.email.split('@')[0];
    
    const response = await fetch(`${API_BASE_URL}/auth/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...userData,
        username,
        password_confirm: userData.password
      }),
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
        console.error('Logout API call failed:', error);
      }
    }

    // Clear local storage regardless of API call success
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
      throw new Error('Token refresh failed');
    }

    const data = await response.json();
    tokenManager.setTokens(data.access, refreshToken);
    return data;
  }
};

// ===== PROFILE SERVICE =====
export const profileService = {
  getProfile: async () => {
    return makeAuthenticatedRequest(`${API_BASE_URL}/auth/profile/`);
  },

  updateProfile: async (profileData: any) => {
    if (profileData instanceof FormData) {
      // Handle file uploads
      return makeAuthenticatedRequest(`${API_BASE_URL}/auth/profile/`, {
        method: 'PUT',
        body: profileData,
      });
    } else {
      // Handle JSON data
      return makeAuthenticatedRequest(`${API_BASE_URL}/auth/profile/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });
    }
  }
};

// ===== MAIN UNIFIED AUTH OBJECT =====
const unifiedAuth = {
  // Token management
  getAccessToken: tokenManager.getAccessToken,
  getRefreshToken: tokenManager.getRefreshToken,
  setTokens: tokenManager.setTokens,
  clearTokens: tokenManager.clearTokens,
  
  // Authentication status
  isAuthenticated: (): boolean => {
    const token = tokenManager.getAccessToken();
    return token !== null && !tokenManager.isTokenExpired(token);
  },

  isLoggedIn: (): boolean => {
    return unifiedAuth.isAuthenticated() && userManager.getUser() !== null;
  },

  // Services
  auth: authService,
  profile: profileService,
  user: userManager,

  // HTTP client for authenticated requests
  request: makeAuthenticatedRequest,
};

export default unifiedAuth;