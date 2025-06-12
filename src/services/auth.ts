// src/services/auth.ts
const API_BASE = '/api/auth';

export const authAPI = {
  // Your existing signup function...
  signup: async (userData: {
    email: string;
    username: string;
    first_name: string;
    last_name: string;
    password: string;
    password_confirm: string;
  }) => {
    const response = await fetch(`${API_BASE}/register/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Signup failed');
    }

    return response.json();
  },

  // ADD THIS NEW FUNCTION:
  verifyEmail: async (email: string, code: string) => {
    const response = await fetch(`${API_BASE}/verify-email/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        code: code
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Verification failed');
    }

    return response.json();
  },

  
  requestPasswordReset: async (email: string) => {
    const response = await fetch('/api/password-reset/request/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!response.ok) throw new Error('Failed to send reset code');
    return response.json();
  },

  verifyPasswordResetCode: async (email: string, code: string) => {
    const response = await fetch('/api/password-reset/verify/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, reset_code: code }),
    });
    if (!response.ok) throw new Error('Invalid reset code');
    return response.json();
  },

  
  confirmPasswordReset: async (email: string, code: string, newPassword: string) => {
    const response = await fetch('/api/password-reset/confirm/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        reset_code: code,
        new_password: newPassword,
        new_password_confirm: newPassword
      }),
    });
    if (!response.ok) throw new Error('Failed to reset password');
    return response.json();
  },

  // Add these to your existing authAPI object in src/services/auth.ts:

googleSignup: async (googleData: {
  email: string;
  first_name: string;
  last_name: string;
  google_id: string;
  avatar_url?: string;
}) => {
  const response = await fetch('/api/auth/google-signup/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(googleData),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Google signup failed');
  }
  return response.json();
},

googleLogin: async (googleData: {
  email: string;
  google_id: string;
}) => {
  const response = await fetch('/api/auth/google-login/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(googleData),
  });
  
  if (!response.ok) {
    const error = await response.json();
    console.error('Django error details:', error);  // ← ADD THIS
    throw new Error(error.message || 'Google login failed');
  }
  return response.json();
},
};