// src/utils/memoryAuth.ts - ULTRA SECURE MEMORY ONLY
class MemoryAuthManager {
  private static instance: MemoryAuthManager;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private user: any = null;
  private tokenExpiry: number = 0;

  private constructor() {}

  public static getInstance(): MemoryAuthManager {
    if (!MemoryAuthManager.instance) {
      MemoryAuthManager.instance = new MemoryAuthManager();
    }
    return MemoryAuthManager.instance;
  }

  setAuth(accessToken: string, refreshToken: string, userData: any): void {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.user = userData;
    this.tokenExpiry = Date.now() + (60 * 60 * 1000); // 1 hour
  }

  getAccessToken(): string | null {
    if (this.tokenExpiry > Date.now()) {
      return this.accessToken;
    }
    return null;
  }

  getRefreshToken(): string | null {
    return this.refreshToken;
  }

  getUser(): any {
    return this.user;
  }

  isAuthenticated(): boolean {
    return this.user !== null && (this.getAccessToken() !== null || this.refreshToken !== null);
  }

  clearAuth(): void {
    this.accessToken = null;
    this.refreshToken = null;
    this.user = null;
    this.tokenExpiry = 0;
  }
}

export const memoryAuth = MemoryAuthManager.getInstance();