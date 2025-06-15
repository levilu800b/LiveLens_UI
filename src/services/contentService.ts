// src/services/contentService.ts
import type { ContentItem } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Helper function for API requests
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: getAuthHeaders(),
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.detail || 'An error occurred');
  }

  return response.json();
};

export const contentService = {
  // User Library Functions
  async getUserLibrary(): Promise<ContentItem[]> {
    try {
      const data = await apiRequest('/user/library/');
      
      // Transform backend data to frontend format
      const transformedData: ContentItem[] = [];
      
      // Process different content types
      if (data.watched_stories) {
        transformedData.push(...data.watched_stories.map((story: any) => ({
          id: story.id,
          title: story.title,
          description: story.description,
          thumbnail: story.thumbnail,
          type: 'story' as const,
          duration: story.estimated_read_time || 0,
          views: story.views || 0,
          likes: story.likes || 0,
          tags: story.tags || [],
          createdAt: story.created_at,
          watchProgress: story.read_progress || 0,
          isFavorited: story.is_favorited || false,
          isBookmarked: story.is_bookmarked || false,
        })));
      }

      if (data.watched_films) {
        transformedData.push(...data.watched_films.map((film: any) => ({
          id: film.id,
          title: film.title,
          description: film.description,
          thumbnail: film.thumbnail,
          type: 'film' as const,
          duration: film.duration || 0,
          views: film.views || 0,
          likes: film.likes || 0,
          tags: film.tags || [],
          createdAt: film.created_at,
          watchProgress: film.watch_progress || 0,
          isFavorited: film.is_favorited || false,
          isBookmarked: film.is_bookmarked || false,
        })));
      }

      if (data.watched_content) {
        transformedData.push(...data.watched_content.map((content: any) => ({
          id: content.id,
          title: content.title,
          description: content.description,
          thumbnail: content.thumbnail,
          type: 'content' as const,
          duration: content.duration || 0,
          views: content.views || 0,
          likes: content.likes || 0,
          tags: content.tags || [],
          createdAt: content.created_at,
          watchProgress: content.watch_progress || 0,
          isFavorited: content.is_favorited || false,
          isBookmarked: content.is_bookmarked || false,
        })));
      }

      if (data.listened_podcasts) {
        transformedData.push(...data.listened_podcasts.map((podcast: any) => ({
          id: podcast.id,
          title: podcast.title,
          description: podcast.description,
          thumbnail: podcast.thumbnail,
          type: 'podcast' as const,
          duration: podcast.duration || 0,
          views: podcast.plays || 0,
          likes: podcast.likes || 0,
          tags: podcast.tags || [],
          createdAt: podcast.created_at,
          watchProgress: podcast.listen_progress || 0,
          isFavorited: podcast.is_favorited || false,
          isBookmarked: podcast.is_bookmarked || false,
        })));
      }

      if (data.watched_animations) {
        transformedData.push(...data.watched_animations.map((animation: any) => ({
          id: animation.id,
          title: animation.title,
          description: animation.description,
          thumbnail: animation.thumbnail,
          type: 'animation' as const,
          duration: animation.duration || 0,
          views: animation.views || 0,
          likes: animation.likes || 0,
          tags: animation.tags || [],
          createdAt: animation.created_at,
          watchProgress: animation.watch_progress || 0,
          isFavorited: animation.is_favorited || false,
          isBookmarked: animation.is_bookmarked || false,
        })));
      }

      // Sort by most recently watched
      return transformedData.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (error) {
      console.error('Error fetching user library:', error);
      throw error;
    }
  },

  // User Favorites Functions
  async getUserFavorites(): Promise<ContentItem[]> {
    try {
      const data = await apiRequest('/user/favorites/');
      
      // Transform backend data to frontend format similar to library
      const transformedData: ContentItem[] = [];
      
      // Process different content types
      ['stories', 'films', 'content', 'podcasts', 'animations', 'sneak_peeks'].forEach(contentType => {
        if (data[contentType]) {
          const type = contentType === 'sneak_peeks' ? 'sneak-peek' : contentType.slice(0, -1);
          transformedData.push(...data[contentType].map((item: any) => ({
            id: item.id,
            title: item.title,
            description: item.description,
            thumbnail: item.thumbnail,
            type: type as ContentItem['type'],
            duration: item.duration || item.estimated_read_time || 0,
            views: item.views || item.plays || 0,
            likes: item.likes || 0,
            tags: item.tags || [],
            createdAt: item.created_at,
            isFavorited: true,
            isBookmarked: item.is_bookmarked || false,
          })));
        }
      });

      // Sort by most recently favorited
      return transformedData.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (error) {
      console.error('Error fetching user favorites:', error);
      throw error;
    }
  },

  // Favorite/Unfavorite Content
  async favoriteContent(contentType: string, contentId: string): Promise<void> {
    try {
      // Map frontend content types to backend endpoints
      const typeMap: Record<string, string> = {
        'story': 'stories',
        'film': 'media/films',
        'content': 'media/content',
        'podcast': 'podcasts',
        'animation': 'animations',
        'sneak-peek': 'sneak-peeks'
      };

      const endpoint = typeMap[contentType];
      if (!endpoint) {
        throw new Error('Invalid content type');
      }

      await apiRequest(`/${endpoint}/${contentId}/favorite/`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Error toggling favorite:', error);
      throw error;
    }
  },

  // Bookmark/Unbookmark Content
  async bookmarkContent(contentType: string, contentId: string): Promise<void> {
    try {
      const typeMap: Record<string, string> = {
        'story': 'stories',
        'film': 'media/films',
        'content': 'media/content',
        'podcast': 'podcasts',
        'animation': 'animations',
        'sneak-peek': 'sneak-peeks'
      };

      const endpoint = typeMap[contentType];
      if (!endpoint) {
        throw new Error('Invalid content type');
      }

      await apiRequest(`/${endpoint}/${contentId}/bookmark/`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      throw error;
    }
  },

  // Update Watch Progress
  async updateWatchProgress(
    contentType: string, 
    contentId: string, 
    progress: number
  ): Promise<void> {
    try {
      const typeMap: Record<string, string> = {
        'story': 'stories',
        'film': 'media/films',
        'content': 'media/content',
        'podcast': 'podcasts',
        'animation': 'animations',
        'sneak-peek': 'sneak-peeks'
      };

      const endpoint = typeMap[contentType];
      if (!endpoint) {
        throw new Error('Invalid content type');
      }

      await apiRequest(`/${endpoint}/${contentId}/progress/`, {
        method: 'POST',
        body: JSON.stringify({ progress }),
      });
    } catch (error) {
      console.error('Error updating watch progress:', error);
      throw error;
    }
  },

  // Mark Content as Watched/Read
  async markAsWatched(contentType: string, contentId: string): Promise<void> {
    try {
      await this.updateWatchProgress(contentType, contentId, 1.0);
    } catch (error) {
      console.error('Error marking as watched:', error);
      throw error;
    }
  },

  // Get Content Details
  async getContentDetails(contentType: string, contentId: string): Promise<ContentItem> {
    try {
      const typeMap: Record<string, string> = {
        'story': 'stories',
        'film': 'media/films',
        'content': 'media/content',
        'podcast': 'podcasts',
        'animation': 'animations',
        'sneak-peek': 'sneak-peeks'
      };

      const endpoint = typeMap[contentType];
      if (!endpoint) {
        throw new Error('Invalid content type');
      }

      const data = await apiRequest(`/${endpoint}/${contentId}/`);
      
      return {
        id: data.id,
        title: data.title,
        description: data.description,
        thumbnail: data.thumbnail,
        type: contentType as ContentItem['type'],
        duration: data.duration || data.estimated_read_time || 0,
        views: data.views || data.plays || 0,
        likes: data.likes || 0,
        tags: data.tags || [],
        createdAt: data.created_at,
        isFavorited: data.is_favorited || false,
        isBookmarked: data.is_bookmarked || false,
        watchProgress: data.watch_progress || data.read_progress || data.listen_progress || 0,
      };
    } catch (error) {
      console.error('Error fetching content details:', error);
      throw error;
    }
  },

  // Search Content
  async searchContent(query: string, contentType?: string): Promise<ContentItem[]> {
    try {
      const searchParams = new URLSearchParams({ q: query });
      if (contentType && contentType !== 'all') {
        searchParams.append('type', contentType);
      }

      const data = await apiRequest(`/search/?${searchParams.toString()}`);
      
      // Transform search results
      return data.results?.map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        thumbnail: item.thumbnail,
        type: item.content_type as ContentItem['type'],
        duration: item.duration || item.estimated_read_time || 0,
        views: item.views || item.plays || 0,
        likes: item.likes || 0,
        tags: item.tags || [],
        createdAt: item.created_at,
        isFavorited: item.is_favorited || false,
        isBookmarked: item.is_bookmarked || false,
      })) || [];
    } catch (error) {
      console.error('Error searching content:', error);
      throw error;
    }
  },

  // Like/Unlike Content
  async likeContent(contentType: string, contentId: string): Promise<void> {
    try {
      const typeMap: Record<string, string> = {
        'story': 'stories',
        'film': 'media/films',
        'content': 'media/content',
        'podcast': 'podcasts',
        'animation': 'animations',
        'sneak-peek': 'sneak-peeks'
      };

      const endpoint = typeMap[contentType];
      if (!endpoint) {
        throw new Error('Invalid content type');
      }

      await apiRequest(`/${endpoint}/${contentId}/like/`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Error toggling like:', error);
      throw error;
    }
  },

  // Get Recommendations
  async getRecommendations(limit: number = 10): Promise<ContentItem[]> {
    try {
      const data = await apiRequest(`/user/recommendations/?limit=${limit}`);
      
      return data.recommendations?.map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        thumbnail: item.thumbnail,
        type: item.content_type as ContentItem['type'],
        duration: item.duration || item.estimated_read_time || 0,
        views: item.views || item.plays || 0,
        likes: item.likes || 0,
        tags: item.tags || [],
        createdAt: item.created_at,
        isFavorited: item.is_favorited || false,
        isBookmarked: item.is_bookmarked || false,
      })) || [];
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      return []; // Return empty array instead of throwing for recommendations
    }
  },
};