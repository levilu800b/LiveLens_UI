// src/services/contentService.ts - MINIMAL FIX FOR YOUR CURRENT SETUP
import type { ContentItem } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Helper function to get auth headers - FIXED to work with your existing auth
const getAuthHeaders = () => {
  // Your auth system stores token as 'access_token' (confirmed working with profile page)
  const token = localStorage.getItem('access_token');
  
  if (!token) {
    console.warn('⚠️ No access token found - user may need to log in again');
  }
  
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Helper function for API requests with better error handling
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const headers = getAuthHeaders();
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers,
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    
    // Handle authentication errors
    if (response.status === 401) {
      console.error('🚫 Authentication failed');
      // Clear tokens and redirect (matches your existing auth flow)
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('account');
      window.location.href = '/login';
      throw new Error('Your session has expired. Please log in again.');
    }
    
    throw new Error(errorData.message || errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  
  return data;
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
          views: story.read_count || 0,
          likes: story.like_count || 0,
          tags: story.tags || [],
          createdAt: story.created_at,
          watchProgress: 0, // Stories don't have progress tracking in this context
          isFavorited: story.is_liked || false,
          isBookmarked: story.is_bookmarked || false,
        })));
      }

      if (data.watched_films) {
        transformedData.push(...data.watched_films.map((film: any) => ({
          id: film.id,
          title: film.title,
          description: film.description || film.short_description,
          thumbnail: film.thumbnail,
          type: 'film' as const,
          duration: film.duration || 0,
          views: film.view_count || 0,
          likes: film.like_count || 0,
          tags: film.tags || [],
          createdAt: film.created_at,
          watchProgress: film.watch_progress || 0,
          isFavorited: film.is_liked || false,
          isBookmarked: film.is_bookmarked || false,
        })));
      }

      if (data.watched_content) {
        transformedData.push(...data.watched_content.map((content: any) => ({
          id: content.id,
          title: content.title,
          description: content.description || content.short_description,
          thumbnail: content.thumbnail,
          type: 'content' as const,
          duration: content.duration || 0,
          views: content.view_count || 0,
          likes: content.like_count || 0,
          tags: content.tags || [],
          createdAt: content.created_at,
          watchProgress: content.watch_progress || 0,
          isFavorited: content.is_liked || false,
          isBookmarked: content.is_bookmarked || false,
        })));
      }

      if (data.watched_podcasts) {
        transformedData.push(...data.watched_podcasts.map((podcast: any) => ({
          id: podcast.id,
          title: podcast.title,
          description: podcast.description,
          thumbnail: podcast.thumbnail,
          type: 'podcast' as const,
          duration: podcast.duration || 0,
          views: podcast.play_count || 0,
          likes: podcast.like_count || 0,
          tags: podcast.tags || [],
          createdAt: podcast.created_at,
          watchProgress: podcast.listen_progress || 0,
          isFavorited: podcast.is_liked || false,
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
          views: animation.view_count || 0,
          likes: animation.like_count || 0,
          tags: animation.tags || [],
          createdAt: animation.created_at,
          watchProgress: animation.watch_progress || 0,
          isFavorited: animation.is_liked || false,
          isBookmarked: animation.is_bookmarked || false,
        })));
      }

      if (data.watched_sneak_peeks) {
        transformedData.push(...data.watched_sneak_peeks.map((sneakPeek: any) => ({
          id: sneakPeek.id,
          title: sneakPeek.title,
          description: sneakPeek.description,
          thumbnail: sneakPeek.thumbnail,
          type: 'sneak-peek' as const,
          duration: sneakPeek.duration || 0,
          views: sneakPeek.view_count || 0,
          likes: sneakPeek.like_count || 0,
          tags: sneakPeek.tags || [],
          createdAt: sneakPeek.created_at,
          watchProgress: sneakPeek.watch_progress || 0,
          isFavorited: sneakPeek.is_liked || false,
          isBookmarked: sneakPeek.is_bookmarked || false,
        })));
      }

      if (data.watched_live_videos) {
        transformedData.push(...data.watched_live_videos.map((liveVideo: any) => ({
          id: liveVideo.id,
          title: liveVideo.title,
          description: liveVideo.description,
          thumbnail: liveVideo.thumbnail,
          type: 'live-video' as const,
          duration: liveVideo.duration || 0,
          views: liveVideo.total_views || 0,
          likes: liveVideo.like_count || 0,
          tags: liveVideo.tags || [],
          createdAt: liveVideo.created_at,
          watchProgress: liveVideo.watch_progress || 0,
          isFavorited: liveVideo.is_liked || false,
          isBookmarked: liveVideo.is_bookmarked || false,
        })));
      }

      // Sort by most recently watched
      return transformedData.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (error) {
      throw error;
    }
  },

  // User Favorites Functions
  async getUserFavorites(): Promise<ContentItem[]> {
    try {
      const data = await apiRequest('/user/favorites/');
      
      // Transform backend data to frontend format similar to library
      const transformedData: ContentItem[] = [];
      
      // Process stories
      if (data.stories) {
        transformedData.push(...data.stories.map((story: any) => ({
          id: story.id,
          title: story.title,
          description: story.description,
          thumbnail: story.thumbnail,
          type: 'story' as const,
          duration: story.estimated_read_time || 0,
          views: story.read_count || 0,
          likes: story.like_count || 0,
          tags: story.tags || [],
          createdAt: story.created_at,
          isFavorited: true,
          isBookmarked: story.is_bookmarked || false,
        })));
      }

      // Process films
      if (data.films) {
        transformedData.push(...data.films.map((film: any) => ({
          id: film.id,
          title: film.title,
          description: film.description || film.short_description,
          thumbnail: film.thumbnail,
          type: 'film' as const,
          duration: film.duration || 0,
          views: film.view_count || 0,
          likes: film.like_count || 0,
          tags: film.tags || [],
          createdAt: film.created_at,
          isFavorited: true,
          isBookmarked: film.is_bookmarked || false,
        })));
      }

      // Process content
      if (data.content) {
        transformedData.push(...data.content.map((content: any) => ({
          id: content.id,
          title: content.title,
          description: content.description || content.short_description,
          thumbnail: content.thumbnail,
          type: 'content' as const,
          duration: content.duration || 0,
          views: content.view_count || 0,
          likes: content.like_count || 0,
          tags: content.tags || [],
          createdAt: content.created_at,
          isFavorited: true,
          isBookmarked: content.is_bookmarked || false,
        })));
      }

      // Process podcasts
      if (data.podcasts) {
        transformedData.push(...data.podcasts.map((podcast: any) => ({
          id: podcast.id,
          title: podcast.title,
          description: podcast.description,
          thumbnail: podcast.thumbnail,
          type: 'podcast' as const,
          duration: podcast.duration || 0,
          views: podcast.play_count || 0,
          likes: podcast.like_count || 0,
          tags: podcast.tags || [],
          createdAt: podcast.created_at,
          isFavorited: true,
          isBookmarked: podcast.is_bookmarked || false,
        })));
      }

      // Process animations
      if (data.animations) {
        transformedData.push(...data.animations.map((animation: any) => ({
          id: animation.id,
          title: animation.title,
          description: animation.description,
          thumbnail: animation.thumbnail,
          type: 'animation' as const,
          duration: animation.duration || 0,
          views: animation.view_count || 0,
          likes: animation.like_count || 0,
          tags: animation.tags || [],
          createdAt: animation.created_at,
          isFavorited: true,
          isBookmarked: animation.is_bookmarked || false,
        })));
      }

      // Process sneak peeks
      if (data.sneak_peeks) {
        transformedData.push(...data.sneak_peeks.map((sneakPeek: any) => ({
          id: sneakPeek.id,
          title: sneakPeek.title,
          description: sneakPeek.description,
          thumbnail: sneakPeek.thumbnail,
          type: 'sneak-peek' as const,
          duration: sneakPeek.duration || 0,
          views: sneakPeek.view_count || 0,
          likes: sneakPeek.like_count || 0,
          tags: sneakPeek.tags || [],
          createdAt: sneakPeek.created_at,
          isFavorited: true,
          isBookmarked: sneakPeek.is_bookmarked || false,
        })));
      }

      // Process live videos
      if (data.live_videos) {
        transformedData.push(...data.live_videos.map((liveVideo: any) => ({
          id: liveVideo.id,
          title: liveVideo.title,
          description: liveVideo.description,
          thumbnail: liveVideo.thumbnail,
          type: 'live-video' as const,
          duration: liveVideo.duration || 0,
          views: liveVideo.total_views || 0,
          likes: liveVideo.like_count || 0,
          tags: liveVideo.tags || [],
          createdAt: liveVideo.created_at,
          isFavorited: true,
          isBookmarked: liveVideo.is_bookmarked || false,
        })));
      }

      // Sort by most recently favorited
      return transformedData.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (error) {
      throw error;
    }
  },

  // Favorite/Unfavorite Content
  async favoriteContent(contentType: string, contentId: string): Promise<void> {
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

      await apiRequest(`/${endpoint}/${contentId}/favorite/`, {
        method: 'POST',
      });
    } catch (error) {
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
      throw error;
    }
  },

  // Track Watch Progress
  async trackProgress(contentType: string, contentId: string, progress: number): Promise<void> {
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

      await apiRequest(`/${endpoint}/${contentId}/track-progress/`, {
        method: 'POST',
        body: JSON.stringify({ progress }),
      });
    } catch (error) {
      throw error;
    }
  }
};