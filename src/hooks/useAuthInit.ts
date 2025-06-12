// src/hooks/useAuthInit.ts
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { secureUserStorage, secureTokenManager } from '../utils/secureStorage';
import { userActions } from '../store/reducers/userReducers';

export const useAuthInit = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Restore authentication state on app startup
    const initializeAuth = async () => {
      try {
        // Check if user data exists in sessionStorage
        const savedUser = secureUserStorage.getUser();
        const hasRefreshToken = secureTokenManager.getRefreshToken();
        
        if (savedUser && hasRefreshToken) {
          // Restore user to Redux state
          dispatch(userActions.setUserInfo(savedUser));
          
          // Try to refresh access token
          await refreshAccessToken();
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        // Clear any corrupted data
        secureTokenManager.clearTokens();
        secureUserStorage.clearUser();
      }
    };

    initializeAuth();
  }, [dispatch]);

  const refreshAccessToken = async () => {
    try {
      const refreshToken = secureTokenManager.getRefreshToken();
      if (!refreshToken) return false;

      const response = await fetch('/api/auth/token/refresh/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        secureTokenManager.setTokens(data.access, refreshToken);
        return true;
      } else {
        throw new Error('Token refresh failed');
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      // Clear invalid tokens
      secureTokenManager.clearTokens();
      secureUserStorage.clearUser();
      return false;
    }
  };
};