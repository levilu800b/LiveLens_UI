// src/store/actions/user.ts
import { userActions } from '../reducers/userReducers';
import { authAPI } from '../../services/api';
import type { Dispatch } from 'redux';

export const logout = () => async (dispatch: Dispatch) => {
  try {
    // Get refresh token from localStorage
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (refreshToken) {
      // Call backend logout API
      await authAPI.logout(refreshToken);
    }
  } catch (error) {
    // Log error but don't prevent logout
    console.warn('Logout API call failed:', error);
  } finally {
    // Always clear Redux state and localStorage
    dispatch(userActions.resetUserInfo());
    
    // Clear all auth-related items from localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('account');
    
    // Clear any other app-specific data
    localStorage.removeItem('user_preferences');
    sessionStorage.clear();
  }
};

// Login action
export const login = (userData: any, tokens: { access_token: string; refresh_token: string }) => (dispatch: Dispatch) => {
  // Store tokens
  localStorage.setItem('access_token', tokens.access_token);
  localStorage.setItem('refresh_token', tokens.refresh_token);
  localStorage.setItem('account', JSON.stringify(userData));
  
  // Update Redux store
  dispatch(userActions.setUserInfo(userData));
};

// Check auth status on app initialization
export const checkAuthStatus = () => (dispatch: Dispatch) => {
  try {
    const storedUser = localStorage.getItem('account');
    const accessToken = localStorage.getItem('access_token');
    
    if (storedUser && accessToken) {
      const userData = JSON.parse(storedUser);
      dispatch(userActions.setUserInfo(userData));
    } else {
      // If no valid auth data, clear everything
      dispatch(logout());
    }
  } catch (error) {
    console.error('Error checking auth status:', error);
    dispatch(logout());
  }
};