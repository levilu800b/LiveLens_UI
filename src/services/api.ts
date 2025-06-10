// src/services/api.ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Auth API functions
export const authAPI = {
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

    return response.json();
  },

  // Google Login
  googleLogin: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/google-login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Google login failed');
    }

    return response.json();
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
  googleSignup: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/google-signup/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Google signup failed');
    }

    return response.json();
  },

  // Verify Email
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

  // Resend Verification
  resendVerification: async (email: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/resend-verification/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to resend verification');
    }

    return response.json();
  },

  // Check Email (for password reset)
  checkEmail: async (email: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/check-email/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Email check failed');
    }

    return response.json();
  },

  // Reset Password
  resetPassword: async (email: string, code: string, newPassword: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        email, 
        code, 
        new_password: newPassword,
        confirm_password: newPassword 
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Password reset failed');
    }

    return response.json();
  },

  // Logout
  logout: async (refreshToken: string) => {
    const accessToken = localStorage.getItem('access_token');
    
    const response = await fetch(`${API_BASE_URL}/auth/logout/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    // Even if the request fails, we should clear local storage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('account');

    if (!response.ok) {
      // Don't throw error for logout - just log it
      console.warn('Logout request failed, but local storage cleared');
    }

    return response.ok ? response.json() : { message: 'Logged out locally' };
  },

  // Refresh Token
  refreshToken: async (refreshToken: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/token/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    return response.json();
  }
};

// Helper function to get auth headers
export const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};