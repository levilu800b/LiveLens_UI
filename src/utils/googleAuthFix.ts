// src/utils/googleAuthFix.ts - Enhanced Google Authentication Handler
import { googleAuthService } from '../services/googleAuth';
import unifiedAuth from './unifiedAuth';
import { userActions } from '../store/reducers/userReducers';

export const handleGoogleSignup = async (dispatch: any, navigate: any) => {
  try {
    // Check Google OAuth configuration
    if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) {
      throw new Error('Google OAuth not configured. Please add VITE_GOOGLE_CLIENT_ID to your environment variables.');
    }

    
    // Get Google user data
    const googleUser = await googleAuthService.signIn();
      email: googleUser.email,
      name: `${googleUser.first_name} ${googleUser.last_name}`
    });
    
    // Call Google signup endpoint with enhanced error handling
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/google-signup/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: googleUser.email,
        first_name: googleUser.first_name,
        last_name: googleUser.last_name,
        google_id: googleUser.google_id,
        avatar_url: googleUser.avatar_url
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      
      // Handle specific error cases
      if (response.status === 400 && errorData.error?.includes('already exists')) {
        // User exists, try login instead
        return handleGoogleLogin(dispatch, navigate);
      }
      
      throw new Error(errorData.error || errorData.message || 'Google signup failed');
    }

    const data = await response.json();

    // Store authentication data using unifiedAuth
    if (data.access_token && data.refresh_token) {
      unifiedAuth.setTokens(data.access_token, data.refresh_token);
    }

    // Store complete user data
    if (data.user) {
      // Ensure user object has all required fields for profile updates
      const completeUser = {
        ...data.user,
        // Fill in any missing profile fields
        phoneNumber: data.user.phoneNumber || '',
        gender: data.user.gender || '',
        country: data.user.country || '',
        dateOfBirth: data.user.dateOfBirth || '',
        isVerified: true, // Google users are pre-verified
      };
      
      unifiedAuth.user.setUser(completeUser);
      dispatch(userActions.setUserInfo(completeUser));
    }

    // Navigate to home page
    navigate('/');
    return data;
    
  } catch (error: any) {
    throw error;
  }
};

export const handleGoogleLogin = async (dispatch: any, navigate: any) => {
  try {
    
    // Get Google user data
    const googleUser = await googleAuthService.signIn();

    // Use unifiedAuth for consistent authentication
    const response = await unifiedAuth.auth.googleLogin({
      email: googleUser.email,
      google_id: googleUser.google_id
    });

    
    // Update Redux store with complete user data
    if (response.user) {
      dispatch(userActions.setUserInfo(response.user));
    }

    // Navigate to appropriate page
    navigate('/');
    return response;
    
  } catch (error: any) {
    
    // If user not found, suggest signup
    if (error.message.includes('not found') || error.message.includes('Please sign up')) {
      throw new Error('Account not found. Please sign up with Google first.');
    }
    
    throw error;
  }
};

// Debug helper for Google authentication issues
export const debugGoogleAuth = async () => {
  
  // Test backend connectivity
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/profile/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${unifiedAuth.getAccessToken()}`,
      },
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
    }
  } catch (error) {
  }
};