// src/utils/secureStorage.ts - UPDATED VERSION
interface TokenData {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

class SecureTokenManager {
  private static instance: SecureTokenManager;
  private tokens: TokenData | null = null;
  private readonly STORAGE_KEY = '_app_session';

  private constructor() {
    this.loadFromSession();
  }

  public static getInstance(): SecureTokenManager {
    if (!SecureTokenManager.instance) {
      SecureTokenManager.instance = new SecureTokenManager();
    }
    return SecureTokenManager.instance;
  }

  setTokens(accessToken: string, refreshToken: string): void {
    const expiresAt = Date.now() + (60 * 60 * 1000); // 1 hour
    
    this.tokens = {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_at: expiresAt
    };

    // Store refresh token in sessionStorage
    sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify({
      refresh_token: refreshToken,
      expires_at: expiresAt
    }));
  }

  getAccessToken(): string | null {
    // Always check session storage first
    this.loadFromSession();
    
    if (this.tokens && this.tokens.expires_at > Date.now()) {
      return this.tokens.access_token;
    }
    return null;
  }

  getRefreshToken(): string | null {
    this.loadFromSession();
    return this.tokens?.refresh_token || null;
  }

  private loadFromSession(): void {
    try {
      const stored = sessionStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        if (data.expires_at > Date.now()) {
          // Keep existing access token if we have one, otherwise leave empty
          this.tokens = {
            access_token: this.tokens?.access_token || '',
            refresh_token: data.refresh_token,
            expires_at: data.expires_at
          };
        } else {
          this.clearTokens();
        }
      }
    } catch (error) {
      this.clearTokens();
    }
  }

  clearTokens(): void {
    this.tokens = null;
    sessionStorage.removeItem(this.STORAGE_KEY);
  }

  isAuthenticated(): boolean {
    return this.getRefreshToken() !== null;
  }

  // NEW: Check if we need to refresh the access token
  needsRefresh(): boolean {
    return this.getRefreshToken() !== null && this.getAccessToken() === null;
  }
}

export const secureTokenManager = SecureTokenManager.getInstance();

// Enhanced user storage with validation
export const secureUserStorage = {
  setUser: (userData: any) => {
    if (userData && userData.id) {
      // Store in BOTH sessionStorage AND localStorage for persistence
      sessionStorage.setItem('account', JSON.stringify(userData));
      localStorage.setItem('user_session', JSON.stringify(userData));
    }
  },

  getUser: () => {
    try {      
      // Try sessionStorage first
      let stored = sessionStorage.getItem('account');
      
      // If sessionStorage is empty, try localStorage
      if (!stored) {
        stored = localStorage.getItem('user_session');
        
        // If found in localStorage, restore to sessionStorage
        if (stored) {
          sessionStorage.setItem('account', stored);
        }
      }
      
      if (stored) {
        const user = JSON.parse(stored);
        if (user && user.id && user.email) {
          return user;
        }
      }
    } catch (error) {
      console.error('Failed to get user from storage:', error);
    }
    return null;
  },

  clearUser: () => {
    sessionStorage.removeItem('account');
    localStorage.removeItem('user_session');
  }
};