// src/services/api.ts - COMPATIBILITY WRAPPER
// This file maintains compatibility with existing code while using the unified auth system

import unifiedAuth from '../utils/unifiedAuth';

// ===== BACKWARD COMPATIBILITY EXPORTS =====
// These maintain compatibility with your existing ProfilePage and other components

export const authAPI = {
  // Token management - delegates to unified auth
  getAccessToken: () => unifiedAuth.getAccessToken(),
  getRefreshToken: () => unifiedAuth.getRefreshToken(),
  setTokens: (access: string, refresh: string) => unifiedAuth.setTokens(access, refresh),
  clearTokens: () => unifiedAuth.clearTokens(),
  isAuthenticated: () => unifiedAuth.isAuthenticated(),

  // Auth operations - delegates to unified auth
  login: unifiedAuth.auth.login,
  googleLogin: unifiedAuth.auth.googleLogin,
  register: unifiedAuth.auth.register,
  logout: unifiedAuth.auth.logout,
  refreshToken: unifiedAuth.auth.refreshToken,
};

export const profileAPI = {
  // Profile operations - delegates to unified auth
  getProfile: unifiedAuth.profile.getProfile,
  updateProfile: unifiedAuth.profile.updateProfile,
};

// ===== USER STORAGE COMPATIBILITY =====
// Maintains compatibility with secureUserStorage usage
export const secureUserStorage = {
  getUser: () => unifiedAuth.user.getUser(),
  setUser: (user: any) => unifiedAuth.user.setUser(user),
  clearUser: () => unifiedAuth.user.clearUser(),
};

// ===== DEFAULT EXPORT FOR NEW CODE =====
// For new code, use the unified auth directly
export default unifiedAuth;