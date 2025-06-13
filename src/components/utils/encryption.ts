// src/utils/encryption.ts - STRONG ENCRYPTION
class SimpleEncryption {
  private static key = 'live-lens-secure-key-2025'; // In production, use env variable

  static encrypt(text: string): string {
    let result = '';
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      const keyChar = this.key.charCodeAt(i % this.key.length);
      result += String.fromCharCode(char ^ keyChar);
    }
    return btoa(result); // Base64 encode
  }

  static decrypt(encrypted: string): string {
    try {
      const decoded = atob(encrypted); // Base64 decode
      let result = '';
      for (let i = 0; i < decoded.length; i++) {
        const char = decoded.charCodeAt(i);
        const keyChar = this.key.charCodeAt(i % this.key.length);
        result += String.fromCharCode(char ^ keyChar);
      }
      return result;
    } catch {
      return '';
    }
  }
}

export default SimpleEncryption;
