// src/services/googleAuth.ts

declare global {
  interface Window {
    google: any;
  }
}

export interface GoogleUser {
  email: string;
  first_name: string;
  last_name: string;
  google_id: string;
  avatar_url?: string;
}

class GoogleAuthService {
  private isScriptLoaded = false;
  private isLoading = false;
  private clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  private loadGoogleScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.google) {
        this.isScriptLoaded = true;
        resolve();
        return;
      }

      if (this.isLoading) {
        const checkLoaded = () => {
          if (window.google) {
            resolve();
          } else {
            setTimeout(checkLoaded, 100);
          }
        };
        checkLoaded();
        return;
      }

      this.isLoading = true;

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        this.isScriptLoaded = true;
        this.isLoading = false;
        setTimeout(() => {
          if (window.google) {
            resolve();
          } else {
            reject(new Error('Google script loaded but API not available'));
          }
        }, 100);
      };
      
      script.onerror = () => {
        this.isLoading = false;
        reject(new Error('Failed to load Google script'));
      };

      document.head.appendChild(script);
    });
  }

  // NEW: More reliable sign-in method using renderButton
  async signInWithButton(buttonElement: HTMLElement): Promise<GoogleUser> {
    try {
      await this.loadGoogleScript();

      if (!this.clientId) {
        throw new Error('Google Client ID not configured. Please check your environment variables.');
      }

      return new Promise((resolve, reject) => {
        window.google.accounts.id.initialize({
          client_id: this.clientId,
          callback: (response: any) => {
            try {
              const userData = this.parseJwtToken(response.credential);
              resolve(userData);
            } catch (error) {
              reject(new Error(`Failed to parse Google response: ${error.message}`));
            }
          },
        });

        // Clear the button first
        buttonElement.innerHTML = '';

        // Render Google button
        window.google.accounts.id.renderButton(buttonElement, {
          theme: 'outline',
          size: 'large',
          width: buttonElement.offsetWidth || 300,
          text: 'continue_with',
          shape: 'rectangular',
        });

        // Auto-click the button after a short delay
        setTimeout(() => {
          const googleButton = buttonElement.querySelector('div[role="button"]') as HTMLElement;
          if (googleButton) {
            googleButton.click();
          } else {
            reject(new Error('Google button not rendered properly'));
          }
        }, 500);
      });
    } catch (error) {
      throw new Error(`Google sign-in failed: ${error.message}`);
    }
  }

  // FALLBACK: Original prompt method (less reliable)
  async signInWithPrompt(): Promise<GoogleUser> {
    try {
      await this.loadGoogleScript();

      if (!this.clientId) {
        throw new Error('Google Client ID not configured');
      }

      return new Promise((resolve, reject) => {
        window.google.accounts.id.initialize({
          client_id: this.clientId,
          callback: (response: any) => {
            try {
              const userData = this.parseJwtToken(response.credential);
              resolve(userData);
            } catch (error) {
              reject(error);
            }
          },
        });

        window.google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            reject(new Error('Google sign-in popup was blocked or not displayed. Please allow popups and try again.'));
          }
        });
      });
    } catch (error) {
      throw new Error(`Google sign-in failed: ${error.message}`);
    }
  }

  // Main sign-in method - tries button first, falls back to prompt
  async signIn(): Promise<GoogleUser> {
    // Create a temporary button for the more reliable method
    const tempButton = document.createElement('div');
    tempButton.style.position = 'absolute';
    tempButton.style.top = '-9999px';
    tempButton.style.left = '-9999px';
    tempButton.style.width = '300px';
    tempButton.style.height = '40px';
    document.body.appendChild(tempButton);

    try {
      const result = await this.signInWithButton(tempButton);
      document.body.removeChild(tempButton);
      return result;
    } catch (error) {
      document.body.removeChild(tempButton);
      console.warn('Button method failed, trying prompt method:', error.message);
      return this.signInWithPrompt();
    }
  }

  private parseJwtToken(token: string): GoogleUser {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      const payload = JSON.parse(jsonPayload);
      
      return {
        email: payload.email,
        first_name: payload.given_name || '',
        last_name: payload.family_name || '',
        google_id: payload.sub,
        avatar_url: payload.picture,
      };
    } catch (error) {
      throw new Error('Failed to parse Google user data');
    }
  }

  isAvailable(): boolean {
    return this.isScriptLoaded && !!window.google && !!this.clientId;
  }

  getClientId(): string | undefined {
    return this.clientId;
  }
}

export const googleAuthService = new GoogleAuthService();