// src/services/authService.ts
import { apiService, handleApiError } from './api';
import type { User } from '../types';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface VerifyEmailData {
  email: string;
  code: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  email: string;
  code: string;
  newPassword: string;
  confirmPassword: string;
}

export interface GoogleAuthData {
  accessToken: string;
}

export interface AuthResponse {
  user: User;
  access: string;
  refresh: string;
  message: string;
}

export interface VerificationResponse {
  message: string;
  success: boolean;
}

class AuthService {
  // Sign up new user
  async signup(data: SignupData): Promise<VerificationResponse> {
    try {
      const response = await apiService.post<VerificationResponse>('/auth/register/', {
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        password: data.password,
        password_confirm: data.confirmPassword,
      });
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // Google signup
  async googleSignup(data: GoogleAuthData): Promise<AuthResponse> {
    try {
      const response = await apiService.post<AuthResponse>('/auth/google-signup/', {
        access_token: data.accessToken,
      });
      
      this.setAuthTokens(response.access, response.refresh);
      this.setUserData(response.user);
      
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // Verify email
  async verifyEmail(data: VerifyEmailData): Promise<VerificationResponse> {
    try {
      const response = await apiService.post<VerificationResponse>('/auth/verify-email/', {
        email: data.email,
        code: data.code,
      });
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // Resend verification code
  async resendVerification(email: string): Promise<VerificationResponse> {
    try {
      const response = await apiService.post<VerificationResponse>('/auth/resend-verification/', {
        email,
      });
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // Login user
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiService.post<AuthResponse>('/auth/login/', credentials);
      
      this.setAuthTokens(response.access, response.refresh);
      this.setUserData(response.user);
      
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // Google login
  async googleLogin(data: GoogleAuthData): Promise<AuthResponse> {
    try {
      const response = await apiService.post<AuthResponse>('/auth/google-login/', {
        access_token: data.accessToken,
      });
      
      this.setAuthTokens(response.access, response.refresh);
      this.setUserData(response.user);
      
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // Logout user
  async logout(): Promise<void> {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await apiService.post('/auth/logout/', {
          refresh: refreshToken,
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearAuthData();
    }
  }

  // Check if email exists
  async checkEmail(email: string): Promise<{ exists: boolean }> {
    try {
      const response = await apiService.post<{ exists: boolean }>('/auth/check-email/', {
        email,
      });
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // Request password reset
  async requestPasswordReset(data: ForgotPasswordData): Promise<VerificationResponse> {
    try {
      const response = await apiService.post<VerificationResponse>('/password-reset/request/', {
        email: data.email,
      });
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // Verify reset code
  async verifyResetCode(email: string, code: string): Promise<VerificationResponse> {
    try {
      const response = await apiService.post<VerificationResponse>('/password-reset/verify/', {
        email,
        code,
      });
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // Reset password
  async resetPassword(data: ResetPasswordData): Promise<VerificationResponse> {
    try {
      const response = await apiService.post<VerificationResponse>('/password-reset/confirm/', {
        email: data.email,
        code: data.code,
        new_password: data.newPassword,
        password_confirm: data.confirmPassword,
      });
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // Get user profile
  async getProfile(): Promise<User> {
    try {
      const response = await apiService.get<User>('/auth/profile/');
      this.setUserData(response);
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // Update user profile
  async updateProfile(data: Partial<User>): Promise<User> {
    try {
      const formData = new FormData();
      
      Object.keys(data).forEach(key => {
        const value = data[key as keyof User];
        if (value !== undefined && value !== null) {
          if (key === 'avatar' && value instanceof File) {
            formData.append(key, value);
          } else {
            formData.append(key, String(value));
          }
        }
      });

      const response = await apiService.put<User>('/auth/profile/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      this.setUserData(response);
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // Change password
  async changePassword(oldPassword: string, newPassword: string): Promise<VerificationResponse> {
    try {
      const response = await apiService.post<VerificationResponse>('/auth/change-password/', {
        old_password: oldPassword,
        new_password: newPassword,
      });
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // Delete account
  async deleteAccount(password: string): Promise<VerificationResponse> {
    try {
      const response = await apiService.post<VerificationResponse>('/auth/delete-account/', {
        password,
      });
      this.clearAuthData();
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // Get user stats
  async getUserStats(): Promise<any> {
    try {
      const response = await apiService.get('/auth/stats/');
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // Helper methods
  private setAuthTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  }

  private setUserData(user: User): void {
    localStorage.setItem('account', JSON.stringify(user));
  }

  private clearAuthData(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('account');
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = localStorage.getItem('access_token');
    const user = localStorage.getItem('account');
    return !!(token && user);
  }

  // Get current user data
  getCurrentUser(): User | null {
    const userData = localStorage.getItem('account');
    return userData ? JSON.parse(userData) : null;
  }

  // Get access token
  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  // Get refresh token
  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }
}

export const authService = new AuthService();