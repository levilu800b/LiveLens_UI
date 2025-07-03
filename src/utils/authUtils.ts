// src/utils/authUtils.ts - PROPER LOGOUT FUNCTION
export const performCompleteLogout = async () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  
  try {
    // 1. Get refresh token before clearing
    const refreshToken = localStorage.getItem('refresh_token');
    
    // 2. Call backend logout API (if token exists)
    if (refreshToken) {
      try {
        await fetch(`${API_BASE_URL}/auth/logout/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
      } catch (error) {
        console.warn('Backend logout failed, continuing with local cleanup:', error);
      }
    }
  } catch (error) {
    console.warn('Logout API call failed:', error);
  }
  
  // 3. FORCE CLEAR ALL AUTH DATA (this is the critical part)
  
  // Clear all auth-related localStorage items
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token'); 
  localStorage.removeItem('account');
  localStorage.removeItem('user_preferences');
  localStorage.removeItem('keep_session');
  
  // Clear any other auth-related items that might exist
  const authKeys = Object.keys(localStorage).filter(key => 
    key.includes('token') || 
    key.includes('auth') || 
    key.includes('user') ||
    key.includes('session')
  );
  
  authKeys.forEach(key => {
    localStorage.removeItem(key);
  });
  
  // Clear sessionStorage too
  sessionStorage.clear();
  
  // 4. Force redirect to login (important!)
  window.location.replace('/login');
};

// Enhanced storage clearing function
export const clearAllAuthData = () => {
  // Clear specific known auth keys
  const authKeys = [
    'access_token',
    'refresh_token', 
    'account',
    'user_preferences',
    'keep_session',
    'user_session',
    'auth_token',
    'token',
    'user',
    'userInfo'
  ];
  
  authKeys.forEach(key => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key);
    }
  });
  
  // Clear everything that might be auth-related
  Object.keys(localStorage).forEach(key => {
    if (key.toLowerCase().includes('token') || 
        key.toLowerCase().includes('auth') || 
        key.toLowerCase().includes('user') ||
        key.toLowerCase().includes('session')) {
      localStorage.removeItem(key);
    }
  });
  
  // Clear sessionStorage
  sessionStorage.clear();
};