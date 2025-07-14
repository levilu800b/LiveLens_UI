// src/services/uploadService.ts
import unifiedAuth from '../utils/unifiedAuth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export interface UploadResponse {
  url: string;
  filename: string;
  size: number;
}

class UploadService {
  private getAuthHeaders(): Record<string, string> {
    const token = unifiedAuth.getAccessToken();
    if (token) {
      return {
        'Authorization': `Bearer ${token}`,
      };
    }
    return {};
  }

  async uploadImage(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('upload_type', 'story_content');

      const response = await fetch(`${API_BASE_URL}/stories/upload/image/`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Validate the response structure
      if (!data.url) {
        throw new Error('No URL returned from server');
      }
      
      return data.url;
    } catch {
      // Fallback to base64 encoding if upload fails
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      });
    }
  }
}

export const uploadService = new UploadService();
export default uploadService;
