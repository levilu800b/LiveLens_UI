// src/utils/silencer.ts - COMPLETE CONSOLE SILENCE
class ConsoleSilencer {
  private static originalMethods: any = {};
  private static isSilenced = false;

  // Completely disable all console output
  static silence(): void {
    if (this.isSilenced) return;

    // Store original methods
    this.originalMethods = {
      log: console.log,
      error: console.error,
      warn: console.warn,
      info: console.info,
      debug: console.debug,
      trace: console.trace,
      table: console.table,
      group: console.group,
      groupEnd: console.groupEnd,
      time: console.time,
      timeEnd: console.timeEnd
    };

    // Replace all console methods with empty functions
    Object.keys(this.originalMethods).forEach(method => {
      console[method] = () => {};
    });

    this.isSilenced = true;
  }

  // Restore console (for development only)
  static restore(): void {
    if (!this.isSilenced) return;

    Object.keys(this.originalMethods).forEach(method => {
      console[method] = this.originalMethods[method];
    });

    this.isSilenced = false;
  }

  // Secure logger that only works in development
  static secureLog(message: string, data?: any): void {
    if (import.meta.env.DEV && !this.isSilenced) {
      const sanitized = data ? this.sanitize(data) : '';
      this.originalMethods.log(`[SECURE] ${message}`, sanitized);
    }
  }

  private static sanitize(data: any): any {
    if (typeof data === 'string') {
      if (data.includes('eyJ') || data.length > 100) return '[HIDDEN]';
    }
    if (typeof data === 'object' && data !== null) {
      const clean = { ...data };
      delete clean.access_token;
      delete clean.refresh_token;
      delete clean.password;
      return clean;
    }
    return data;
  }
}

export default ConsoleSilencer;