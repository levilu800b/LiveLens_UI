// src/utils/secureAuth.ts - EVERYTHING ENCRYPTED + PERSISTENT
import SimpleEncryption from './encryption';

class SecureAuthManager {
  private static instance: SecureAuthManager;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private user: any = null;
  private readonly STORAGE_KEY = '_s_';
  
  private constructor() {
    this.loadFromStorage();
  }

  public static getInstance(): SecureAuthManager {
    if (!SecureAuthManager.instance) {
      SecureAuthManager.instance = new SecureAuthManager();
    }
    return SecureAuthManager.instance;
  }

  setAuth(accessToken: string, refreshToken: string, userData: any): void {
    // Store in memory
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.user = userData;
    
    // Encrypt EVERYTHING before storing
    const authData = {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: userData,
      timestamp: Date.now()
    };
    
    const encrypted = SimpleEncryption.encrypt(JSON.stringify(authData));
    sessionStorage.setItem(this.STORAGE_KEY, encrypted);
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  getRefreshToken(): string | null {
    return this.refreshToken;
  }

  getUser(): any {
    return this.user;
  }

  private loadFromStorage(): void {
    try {
      const encrypted = sessionStorage.getItem(this.STORAGE_KEY);
      if (encrypted) {
        const decrypted = SimpleEncryption.decrypt(encrypted);
        if (decrypted) {
          const authData = JSON.parse(decrypted);
          
          // Check if data is not too old (24 hours max)
          const age = Date.now() - authData.timestamp;
          if (age < 24 * 60 * 60 * 1000) {
            this.accessToken = authData.access_token;
            this.refreshToken = authData.refresh_token;
            this.user = authData.user;
          } else {
            this.clearAuth();
          }
        }
      }
    } catch (error) {
      this.clearAuth();
    }
  }

  isAuthenticated(): boolean {
    return this.user !== null;
  }

  clearAuth(): void {
    this.accessToken = null;
    this.refreshToken = null;
    this.user = null;
    sessionStorage.removeItem(this.STORAGE_KEY);
  }

  hasValidSession(): boolean {
    const encrypted = sessionStorage.getItem(this.STORAGE_KEY);
    return encrypted !== null && this.user !== null;
  }
}

export const secureAuth = SecureAuthManager.getInstance();
