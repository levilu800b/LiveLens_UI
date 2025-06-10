// src/services/contentService.ts
import { apiService, handleApiError } from './api';
import type { ContentItem, PaginatedResponse, SearchFilters } from '../types';

export interface ContentFilters extends SearchFilters {
  status?: 'published' | 'draft' | 'archived';
  category?: string;
  author?: string;
  featured?: boolean;
  trending?: boolean;
}

export interface CreateContentData {
  title: string;
  description: string;
  tags: string[];
  category?: string;
  thumbnail?: File;
  content?: string; // For stories
  videoFile?: File; // For videos
  audioFile?: File; // For podcasts
  duration?: string;
  status?: 'draft' | 'published';
}

class ContentService {
  // Stories API
  async getStories(filters?: ContentFilters): Promise<PaginatedResponse<ContentItem>> {
    try {
      const params = this.buildFilterParams(filters);
      const response = await apiService.get<PaginatedResponse<ContentItem>>(`/stories/stories/${params}`);
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getStory(id: string): Promise<ContentItem> {
    try {
      const response = await apiService.get<ContentItem>(`/stories/stories/${id}/`);
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getHeroStory(): Promise<ContentItem> {
    try {
      const response = await apiService.get<ContentItem>('/stories/hero/');
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async createStory(data: CreateContentData): Promise<ContentItem> {
    try {
      const formData = this.buildFormData(data);
      const response = await apiService.upload<ContentItem>('/stories/stories/', formData);
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async updateStory(id: string, data: Partial<CreateContentData>): Promise<ContentItem> {
    try {
      const formData = this.buildFormData(data);
      const response = await apiService.put<ContentItem>(`/stories/stories/${id}/`, formData);
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async deleteStory(id: string): Promise<void> {
    try {
      await apiService.delete(`/stories/stories/${id}/`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // Films API
  async getFilms(filters?: ContentFilters): Promise<PaginatedResponse<ContentItem>> {
    try {
      const params = this.buildFilterParams(filters);
      const response = await apiService.get<PaginatedResponse<ContentItem>>(`/media/films/${params}`);
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getFilm(id: string): Promise<ContentItem> {
    try {
      const response = await apiService.get<ContentItem>(`/media/films/${id}/`);
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async createFilm(data: CreateContentData): Promise<ContentItem> {
    try {
      const formData = this.buildFormData(data);
      const response = await apiService.upload<ContentItem>('/media/films/', formData);
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // Content API
  async getContents(filters?: ContentFilters): Promise<PaginatedResponse<ContentItem>> {
    try {
      const params = this.buildFilterParams(filters);
      const response = await apiService.get<PaginatedResponse<ContentItem>>(`/media/contents/${params}`);
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getContent(id: string): Promise<ContentItem> {
    try {
      const response = await apiService.get<ContentItem>(`/media/contents/${id}/`);
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async createContent(data: CreateContentData): Promise<ContentItem> {
    try {
      const formData = this.buildFormData(data);
      const response = await apiService.upload<ContentItem>('/media/contents/', formData);
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // Podcasts API
  async getPodcasts(filters?: ContentFilters): Promise<PaginatedResponse<ContentItem>> {
    try {
      const params = this.buildFilterParams(filters);
      const response = await apiService.get<PaginatedResponse<ContentItem>>(`/podcasts/podcasts/${params}`);
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getPodcast(id: string): Promise<ContentItem> {
    try {
      const response = await apiService.get<ContentItem>(`/podcasts/podcasts/${id}/`);
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async createPodcast(data: CreateContentData): Promise<ContentItem> {
    try {
      const formData = this.buildFormData(data);
      const response = await apiService.upload<ContentItem>('/podcasts/podcasts/', formData);
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // Animations API
  async getAnimations(filters?: ContentFilters): Promise<PaginatedResponse<ContentItem>> {
    try {
      const params = this.buildFilterParams(filters);
      const response = await apiService.get<PaginatedResponse<ContentItem>>(`/animations/animations/${params}`);
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getAnimation(id: string): Promise<ContentItem> {
    try {
      const response = await apiService.get<ContentItem>(`/animations/animations/${id}/`);
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async createAnimation(data: CreateContentData): Promise<ContentItem> {
    try {
      const formData = this.buildFormData(data);
      const response = await apiService.upload<ContentItem>('/animations/animations/', formData);
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // Sneak Peeks API
  async getSneakPeeks(filters?: ContentFilters): Promise<PaginatedResponse<ContentItem>> {
    try {
      const params = this.buildFilterParams(filters);
      const response = await apiService.get<PaginatedResponse<ContentItem>>(`/sneak-peeks/sneak-peeks/${params}`);
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getSneakPeek(id: string): Promise<ContentItem> {
    try {
      const response = await apiService.get<ContentItem>(`/sneak-peeks/sneak-peeks/${id}/`);
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async createSneakPeek(data: CreateContentData): Promise<ContentItem> {
    try {
      const formData = this.buildFormData(data);
      const response = await apiService.upload<ContentItem>('/sneak-peeks/sneak-peeks/', formData);
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // Common content operations
  async likeContent(contentType: string, contentId: string): Promise<{ liked: boolean; likeCount: number }> {
    try {
      const response = await apiService.post(`/${contentType}/${contentType}/${contentId}/like/`);
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async favoriteContent(contentType: string, contentId: string): Promise<{ favorited: boolean }> {
    try {
      const response = await apiService.post(`/${contentType}/${contentType}/${contentId}/favorite/`);
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async trackView(contentType: string, contentId: string, viewData?: any): Promise<void> {
    try {
      await apiService.post(`/${contentType}/track-view/${contentId}/`, viewData);
    } catch (error) {
      // Don't throw error for view tracking
      console.error('View tracking failed:', error);
    }
  }

  // Search across all content types
  async searchContent(query: string, filters?: ContentFilters): Promise<PaginatedResponse<ContentItem>> {
    try {
      const params = this.buildFilterParams({ ...filters, query });
      const response = await apiService.get<PaginatedResponse<ContentItem>>(`/search/${params}`);
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // Get trending content
  async getTrendingContent(): Promise<ContentItem[]> {
    try {
      const response = await apiService.get<ContentItem[]>('/trending/');
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // Get featured content
  async getFeaturedContent(): Promise<ContentItem[]> {
    try {
      const response = await apiService.get<ContentItem[]>('/featured/');
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // Get user's library
  async getUserLibrary(): Promise<ContentItem[]> {
    try {
      const response = await apiService.get<ContentItem[]>('/auth/library/');
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // Get user's favorites
  async getUserFavorites(): Promise<ContentItem[]> {
    try {
      const response = await apiService.get<ContentItem[]>('/auth/favorites/');
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // AI Content Generation
  async generateStory(prompt: string): Promise<{ content: string; id: string }> {
    try {
      const response = await apiService.post('/ai/generate-story/', { prompt });
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async generateAnimation(prompt: string): Promise<{ videoUrl: string; id: string }> {
    try {
      const response = await apiService.post('/ai/generate-animation/', { prompt });
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // Helper methods
  private buildFilterParams(filters?: ContentFilters): string {
    if (!filters) return '';

    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(item => params.append(key, item));
        } else {
          params.append(key, String(value));
        }
      }
    });

    return params.toString() ? `?${params.toString()}` : '';
  }

  private buildFormData(data: any): FormData {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (value instanceof File) {
          formData.append(key, value);
        } else if (Array.isArray(value)) {
          value.forEach(item => formData.append(key, item));
        } else {
          formData.append(key, String(value));
        }
      }
    });

    return formData;
  }
}

export const contentService = new ContentService();