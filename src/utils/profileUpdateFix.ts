// src/utils/profileUpdateFix.ts - Enhanced Profile Update for Google Users
import unifiedAuth from './unifiedAuth';

export const updateUserProfile = async (formData: {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  gender: string;
  country: string;
  dateOfBirth: string;
}, avatarFile?: File) => {
  
  try {
    const currentUser = unifiedAuth.user.getUser();
    if (!currentUser) {
      throw new Error('User not found. Please login again.');
    }

    // Validate required authentication
    if (!unifiedAuth.isAuthenticated()) {
      throw new Error('Authentication required. Please login again.');
    }

    const accessToken = unifiedAuth.getAccessToken();
    if (!accessToken) {
      throw new Error('No access token found. Please login again.');
    }

    // Create FormData for file upload support
    const formDataToSend = new FormData();
    
    // ✅ FIXED: Proper handling of form fields, especially dates
    formDataToSend.append('firstName', formData.firstName.trim());
    formDataToSend.append('lastName', formData.lastName.trim());
    formDataToSend.append('phoneNumber', formData.phoneNumber.trim());
    formDataToSend.append('gender', formData.gender);
    formDataToSend.append('country', formData.country.trim());
    
    // ✅ CRITICAL FIX: Only send dateOfBirth if it has a valid value
    if (formData.dateOfBirth && formData.dateOfBirth.trim()) {
      formDataToSend.append('dateOfBirth', formData.dateOfBirth.trim());
    }

    // Add avatar file if provided
    if (avatarFile) {
      formDataToSend.append('avatar', avatarFile);
    }

    // Make the API call with explicit headers and error handling
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/profile/`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        // Don't set Content-Type for FormData - browser sets it automatically with boundary
      },
      body: formDataToSend,
    });

    // Handle authentication errors
    if (response.status === 401) {
      
      try {
        // Try to refresh the token
        await unifiedAuth.auth.refreshToken();
        const newToken = unifiedAuth.getAccessToken();
        
        if (newToken) {
          
          // Retry the request with new token
          const retryResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/profile/`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${newToken}`,
            },
            body: formDataToSend,
          });
          
          if (retryResponse.ok) {
            const retryData = await retryResponse.json();
            return retryData;
          } else {
            const retryErrorData = await retryResponse.json().catch(() => ({}));
            console.error('❌ Retry failed:', retryErrorData);
            throw new Error(retryErrorData.error || retryErrorData.message || 'Profile update failed after token refresh');
          }
        }
      } catch (refreshError) {
        console.error('❌ Token refresh failed:', refreshError);
        throw new Error('Your session has expired. Please login again.');
      }
      
      throw new Error('Authentication failed. Please login again.');
    }

    // Handle other HTTP errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Profile update failed:', errorData);
      
      // Provide specific error messages
      if (response.status === 400) {
        // ✅ IMPROVED: Better error handling for validation errors
        let errorMessage = 'Invalid profile data. Please check your inputs.';
        
        if (errorData.details) {
          const fieldErrors = [];
          for (const [field, errors] of Object.entries(errorData.details)) {
            if (Array.isArray(errors)) {
              fieldErrors.push(`${field}: ${errors.join(', ')}`);
            }
          }
          if (fieldErrors.length > 0) {
            errorMessage = `Validation errors: ${fieldErrors.join('; ')}`;
          }
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
        
        throw new Error(errorMessage);
      } else if (response.status === 403) {
        throw new Error('Permission denied. You can only update your own profile.');
      } else if (response.status === 500) {
        throw new Error('Server error. Please try again later.');
      } else {
        throw new Error(errorData.error || errorData.message || `HTTP ${response.status} error`);
      }
    }

    // Parse successful response
    const responseData = await response.json();

    // Update local user data - handle different response structures
    const updatedUser = responseData.user || responseData.updatedUser || responseData.data || responseData;
    
    if (updatedUser && typeof updatedUser === 'object') {
      // Merge with existing user data to preserve all fields
      const currentUserData = unifiedAuth.user.getUser() || {};
      const completeUpdatedUser = {
        ...currentUserData,
        ...updatedUser,
        // Ensure critical fields are preserved
        id: updatedUser.id || currentUserData.id,
        email: updatedUser.email || currentUserData.email,
        isVerified: updatedUser.isVerified !== undefined ? updatedUser.isVerified : currentUserData.isVerified,
      };
      
      // Update stored user data
      unifiedAuth.user.setUser(completeUpdatedUser);
      
      return {
        ...responseData,
        user: completeUpdatedUser
      };
    }

    return responseData;

  } catch (error: any) {
    console.error('❌ Profile update error:', error);
    
    // Re-throw with better error messages
    if (error.message.includes('fetch')) {
      throw new Error('Network error. Please check your connection and try again.');
    }
    
    throw error;
  }
};

// ✅ ENHANCED: Better validation that handles dates properly
export const validateProfileData = (formData: {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  gender: string;
  country: string;
  dateOfBirth: string;
}) => {
  const errors: { [key: string]: string } = {};

  if (!formData.firstName.trim()) {
    errors.firstName = 'First name is required';
  }

  if (!formData.lastName.trim()) {
    errors.lastName = 'Last name is required';
  }

  if (formData.phoneNumber && !/^\+?[\d\s\-()]+$/.test(formData.phoneNumber)) {
    errors.phoneNumber = 'Invalid phone number format';
  }

  // ✅ FIXED: Better date validation
  if (formData.dateOfBirth && formData.dateOfBirth.trim()) {
    const date = new Date(formData.dateOfBirth);
    const now = new Date();
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      errors.dateOfBirth = 'Invalid date format';
    } else if (date > now) {
      errors.dateOfBirth = 'Date of birth cannot be in the future';
    } else {
      // Check if user is too young (optional)
      const age = now.getFullYear() - date.getFullYear();
      if (age < 13) {
        errors.dateOfBirth = 'You must be at least 13 years old';
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
// Debug function for profile update issues
export const debugProfileUpdate = async () => {
  
  const user = unifiedAuth.user.getUser();
  const token = unifiedAuth.getAccessToken();
  
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    isVerified: user.isVerified
  } : 'No user data');
  
  
  if (token) {
    try {
      // Test profile endpoint accessibility
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/profile/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      
      if (response.ok) {
        const profileData = await response.json();
      } else {
        const errorData = await response.json().catch(() => ({}));
      }
    } catch (error) {
    }
  }
};