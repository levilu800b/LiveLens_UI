// src/utils/hiddenAuth.ts - TOKENS HIDDEN + PERSISTENT
class HiddenAuthManager {
  private static instance: HiddenAuthManager;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private user: any = null;
  private readonly TOKEN_KEY = '_t_';
  private readonly USER_KEY = '_u_';
  
  private constructor() {
    this.loadFromStorage();
  }

  public static getInstance(): HiddenAuthManager {
    if (!HiddenAuthManager.instance) {
      HiddenAuthManager.instance = new HiddenAuthManager();
    }
    return HiddenAuthManager.instance;
  }

  setAuth(accessToken: string, refreshToken: string, userData: any): void {
    // Store tokens in memory
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.user = userData;
    
    // Only store user data in sessionStorage (NO TOKENS)
    sessionStorage.setItem(this.USER_KEY, JSON.stringify(userData));
    
    // Store a simple flag that tokens exist (but not the actual tokens)
    sessionStorage.setItem(this.TOKEN_KEY, 'active');
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
      // Restore user data from sessionStorage
      const storedUser = sessionStorage.getItem(this.USER_KEY);
      const tokenFlag = sessionStorage.getItem(this.TOKEN_KEY);
      
      if (storedUser && tokenFlag === 'active') {
        this.user = JSON.parse(storedUser);
        // Tokens are lost on refresh (memory only), but user data is restored
        // App will refresh tokens automatically using the refresh mechanism
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
    sessionStorage.removeItem(this.USER_KEY);
    sessionStorage.removeItem(this.TOKEN_KEY);
  }

  hasStoredSession(): boolean {
    return sessionStorage.getItem(this.USER_KEY) !== null && 
           sessionStorage.getItem(this.TOKEN_KEY) === 'active';
  }
}

export const hiddenAuth = HiddenAuthManager.getInstance();