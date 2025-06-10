// src/services/api.ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add authentication token if available
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication methods
  async register(userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) {
    return this.request('/auth/register/', {
      method: 'POST',
      body: JSON.stringify({
        first_name: userData.firstName,
        last_name: userData.lastName,
        email: userData.email,
        password: userData.password,
      }),
    });
  }

  async login(email: string, password: string) {
    return this.request('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async verifyEmail(email: string, code: string) {
    return this.request('/auth/verify-email/', {
      method: 'POST',
      body: JSON.stringify({ email, verification_code: code }),
    });
  }

  async resendVerification(email: string) {
    return this.request('/auth/resend-verification/', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async forgotPassword(email: string) {
    return this.request('/password-reset/request-reset/', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(email: string, code: string, password: string) {
    return this.request('/password-reset/confirm-reset/', {
      method: 'POST',
      body: JSON.stringify({ 
        email, 
        reset_code: code, 
        new_password: password 
      }),
    });
  }

  async logout() {
    const refreshToken = localStorage.getItem('refresh_token');
    return this.request('/auth/logout/', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  }

  async getProfile() {
    return this.request('/auth/profile/');
  }

  async updateProfile(profileData: any) {
    return this.request('/auth/profile/', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async refreshToken() {
    const refreshToken = localStorage.getItem('refresh_token');
    return this.request('/auth/token/refresh/', {
      method: 'POST',
      body: JSON.stringify({ refresh: refreshToken }),
    });
  }

  async googleSignUp(credential: string) {
    return this.request('/auth/google-signup/', {
      method: 'POST',
      body: JSON.stringify({ credential }),
    });
  }

  async googleLogin(credential: string) {
    return this.request('/auth/google-login/', {
      method: 'POST',
      body: JSON.stringify({ credential }),
    });
  }

  // Content methods (placeholder for now)
  async getStories(params?: any) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/stories/${query}`);
  }

  async getFilms(params?: any) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/media/films/${query}`);
  }

  async getContents(params?: any) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/media/contents/${query}`);
  }

  async getPodcasts(params?: any) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/podcasts/${query}`);
  }

  async getAnimations(params?: any) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/animations/${query}`);
  }

  async getSneakPeeks(params?: any) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/sneak-peeks/${query}`);
  }
}

export const apiService = new ApiService();
export default apiService;