// src/utils/encryptedStorage.ts - ENCRYPTED STORAGE
import CryptoJS from 'crypto-js';

class EncryptedStorage {
  private static instance: EncryptedStorage;
  private readonly SECRET_KEY = 'your-app-secret-key-here'; // In production, use env variable
  private readonly STORAGE_KEY = '_es_';

  private constructor() {}

  public static getInstance(): EncryptedStorage {
    if (!EncryptedStorage.instance) {
      EncryptedStorage.instance = new EncryptedStorage();
    }
    return EncryptedStorage.instance;
  }

  // Encrypt and store data
  setSecureData(key: string, data: any): void {
    try {
      const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), this.SECRET_KEY).toString();
      sessionStorage.setItem(this.STORAGE_KEY + key, encrypted);
    } catch (error) {
      // Fail silently in production
    }
  }

  // Decrypt and retrieve data
  getSecureData(key: string): any {
    try {
      const encrypted = sessionStorage.getItem(this.STORAGE_KEY + key);
      if (encrypted) {
        const decrypted = CryptoJS.AES.decrypt(encrypted, this.SECRET_KEY);
        return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
      }
    } catch (error) {
      // Return null if decryption fails
    }
    return null;
  }

  // Remove encrypted data
  removeSecureData(key: string): void {
    sessionStorage.removeItem(this.STORAGE_KEY + key);
  }

  // Clear all encrypted data
  clearAll(): void {
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith(this.STORAGE_KEY)) {
        sessionStorage.removeItem(key);
      }
    });
  }
}

export const encryptedStorage = EncryptedStorage.getInstance();

// Encrypted auth manager
export const secureAuth = {
  setTokens: (access: string, refresh: string) => {
    encryptedStorage.setSecureData('tokens', { access, refresh, exp: Date.now() + 3600000 });
  },

  getAccessToken: (): string | null => {
    const tokens = encryptedStorage.getSecureData('tokens');
    return tokens && tokens.exp > Date.now() ? tokens.access : null;
  },

  getRefreshToken: (): string | null => {
    const tokens = encryptedStorage.getSecureData('tokens');
    return tokens ? tokens.refresh : null;
  },

  setUser: (user: any) => {
    encryptedStorage.setSecureData('user', user);
  },

  getUser: () => {
    return encryptedStorage.getSecureData('user');
  },

  clearAuth: () => {
    encryptedStorage.clearAll();
  },

  isAuthenticated: (): boolean => {
    return secureAuth.getUser() !== null && 
           (secureAuth.getAccessToken() !== null || secureAuth.getRefreshToken() !== null);
  }
};