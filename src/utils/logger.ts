// src/utils/logger.ts - ULTRA SECURE VERSION
const isDevelopment = import.meta.env.DEV;

class Logger {
  private static shouldLog = isDevelopment;

  static log(...args: any[]): void {
    if (this.shouldLog) {
      const safeArgs = args.map(arg => this.sanitizeAny(arg));
    }
  }

  static error(...args: any[]): void {
    if (this.shouldLog) {
      const safeArgs = args.map(arg => this.sanitizeAny(arg));
      console.error(...safeArgs);
    }
  }

  static logUserData(label: string, data: any): void {
    if (this.shouldLog) {
      const sanitized = this.sanitizeUserData(data);
    }
  }

  // Sanitize ANY data to remove tokens
  private static sanitizeAny(data: any): any {
    if (typeof data === 'string') {
      // Hide JWT tokens (they start with 'eyJ')
      if (data.includes('eyJ') && data.length > 50) {
        return '[JWT TOKEN HIDDEN]';
      }
      // Hide any string that looks like a token
      if (data.includes('access_token') || data.includes('refresh_token')) {
        return '[TOKEN DATA HIDDEN]';
      }
    }
    
    if (typeof data === 'object' && data !== null) {
      return this.sanitizeUserData(data);
    }
    
    return data;
  }

  private static sanitizeUserData(data: any): any {
    if (!data || typeof data !== 'object') return data;

    const sanitized = { ...data };
    
    // Remove ALL sensitive fields
    delete sanitized.access_token;
    delete sanitized.refresh_token;
    delete sanitized.password;
    delete sanitized.google_id;
    
    // Mask email
    if (sanitized.email) {
      const [local, domain] = sanitized.email.split('@');
      sanitized.email = `${local.slice(0, 2)}***@${domain}`;
    }

    return sanitized;
  }
}

export default Logger;