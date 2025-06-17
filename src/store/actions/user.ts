// src/store/actions/user.ts - FIXED TYPING
import { userActions } from '../reducers/userReducers';
import { authAPI } from '../../services/api';
import { secureUserStorage } from '../../utils/secureStorage';
import type { AppDispatch } from '../index'; // Use AppDispatch instead of Dispatch

export const logout = () => async (dispatch: AppDispatch) => {
  try {
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (refreshToken) {
      await authAPI.logout(refreshToken);
    }
  } catch (error) {
    console.warn('Logout API call failed:', error);
  } finally {
    // Clear Redux state
    dispatch(userActions.resetUserInfo());
    
    // Clear ONLY auth-related storage items (not everything)
    secureUserStorage.clearUser();
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('account');
    localStorage.removeItem('user_preferences');
    
    // Don't use localStorage.clear() or sessionStorage.clear() - too aggressive!
    
  }
};

// Fix other actions too:
export const login = (userData: any, tokens: { access_token: string; refresh_token: string }) => (dispatch: AppDispatch) => {
  localStorage.setItem('access_token', tokens.access_token);
  localStorage.setItem('refresh_token', tokens.refresh_token);
  
  
  secureUserStorage.setUser(userData);
  
  // Verify it was stored
  dispatch(userActions.setUserInfo(userData));
  };


export const checkAuthStatus = () => (dispatch: AppDispatch) => {
  try {
    const storedUser = localStorage.getItem('account');
    const accessToken = localStorage.getItem('access_token');
    
    if (storedUser && accessToken) {
      const userData = JSON.parse(storedUser);
      dispatch(userActions.setUserInfo(userData));
    } else {
      dispatch(logout());
    }
  } catch (error) {
    console.error('Error checking auth status:', error);
    dispatch(logout());
  }
};