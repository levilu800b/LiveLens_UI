// src/services/podcastService.ts
import type { ContentItem } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface Author {
  id: string;
  username: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  avatar?: string;
}

// Backend podcast response types
interface BackendPodcast {
  id: string;
  title: string;
  description?: string;
  summary?: string;
  cover_image?: string;
  thumbnail?: string;
  duration: number; // seconds
  play_count?: number;
  like_count?: number;
  is_featured?: boolean;
  published_at?: string;
  created_at: string;
  episode_number: number;
  season_number: number;
  series?: BackendSeries;
  author?: Author;
  guest?: string;
  audio_file?: string;
  video_file?: string;
  transcript_file?: string;
  episode_type?: string;
  is_explicit?: boolean;
  is_premium?: boolean;
  average_rating?: number;
  rating_count?: number;
  is_liked?: boolean;
  is_bookmarked?: boolean;
  user_rating?: number;
  listen_progress?: number;
  tags?: string[];
}

interface BackendSeries {
  id: string;
  title: string;
  description: string;
  short_description?: string;
  cover_image?: string;
  thumbnail?: string;
  category: string;
  subcategory?: string;
  tags?: string[];
  author?: Author;
  host: string;
  language: string;
  is_active: boolean;
  is_featured: boolean;
  is_explicit: boolean;
  episode_count?: number;
  total_duration?: number;
  latest_episode?: Partial<BackendPodcast>;
  recent_episodes?: Partial<BackendPodcast>[];
  is_subscribed?: boolean;
  subscriber_count?: number;
  website?: string;
  rss_feed?: string;
  created_at: string;
  updated_at: string;
}

interface PodcastStats {
  total_episodes: number;
  total_series: number;
  total_plays: number;
  total_duration: number;
}

interface Category {
  value: string;
  label: string;
}

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Helper function for API requests
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const headers = getAuthHeaders();
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers,
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    
    if (response.status === 401) {
      console.error('🚫 Authentication failed');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('account');
      window.location.href = '/login';
      throw new Error('Your session has expired. Please log in again.');
    }
    
    throw new Error(errorData.message || errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
  }

  return await response.json();
};

// Transform backend podcast data to frontend format
const transformPodcast = (podcast: BackendPodcast): ContentItem & {
  episode?: number;
  season?: number;
  isTrending?: boolean;
  releaseDate?: string;
  series?: BackendSeries;
  guest?: string;
  audioFile?: string;
  videoFile?: string;
  transcriptFile?: string;
  episodeType?: string;
  isExplicit?: boolean;
  isPremium?: boolean;
  averageRating?: number;
  ratingCount?: number;
  isLiked?: boolean;
  userRating?: number;
  listenProgress?: number;
} => ({
  id: podcast.id,
  title: podcast.title,
  description: podcast.description || podcast.summary || '',
  thumbnail: podcast.cover_image || podcast.thumbnail,
  duration: Math.floor(podcast.duration / 60), // Convert seconds to minutes
  type: 'podcast' as const,
  tags: podcast.tags || [],
  views: podcast.play_count || 0,
  likes: podcast.like_count || 0,
  createdAt: podcast.created_at,
  // Additional podcast-specific fields
  isTrending: podcast.is_featured || false,
  releaseDate: podcast.published_at || podcast.created_at,
  episode: podcast.episode_number,
  season: podcast.season_number,
  series: podcast.series,
  author: podcast.author ? {
    id: podcast.author.id,
    name: podcast.author.full_name || `${podcast.author.first_name || ''} ${podcast.author.last_name || ''}`.trim() || podcast.author.username,
    avatar: podcast.author.avatar,
  } : undefined,
  guest: podcast.guest,
  audioFile: podcast.audio_file,
  videoFile: podcast.video_file,
  transcriptFile: podcast.transcript_file,
  episodeType: podcast.episode_type,
  isExplicit: podcast.is_explicit,
  isPremium: podcast.is_premium,
  averageRating: podcast.average_rating,
  ratingCount: podcast.rating_count,
  // User-specific data
  isLiked: podcast.is_liked,
  isBookmarked: podcast.is_bookmarked,
  userRating: podcast.user_rating,
  listenProgress: podcast.listen_progress,
});

// Transform backend series data to frontend format
const transformSeries = (series: BackendSeries) => ({
  id: series.id,
  title: series.title,
  description: series.description,
  shortDescription: series.short_description,
  thumbnail: series.cover_image || series.thumbnail,
  category: series.category,
  subcategory: series.subcategory,
  tags: series.tags || [],
  author: series.author,
  host: series.host,
  language: series.language,
  isActive: series.is_active,
  isFeatured: series.is_featured,
  isExplicit: series.is_explicit,
  episodeCount: series.episode_count,
  totalDuration: series.total_duration,
  latestEpisode: series.latest_episode,
  recentEpisodes: series.recent_episodes,
  isSubscribed: series.is_subscribed,
  subscriberCount: series.subscriber_count,
  website: series.website,
  rssFeed: series.rss_feed,
  createdAt: series.created_at,
  updatedAt: series.updated_at,
});



export const podcastService = {
  // Get all podcast episodes
  async getPodcasts(params?: {
    search?: string;
    tags?: string[];
    sortBy?: string;
    series?: string;
    category?: string;
    featured?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<{ results: ContentItem[]; count: number }> {
    try {
      const searchParams = new URLSearchParams();
      
      if (params?.search) searchParams.append('search', params.search);
      if (params?.tags?.length) searchParams.append('tags', params.tags.join(','));
      if (params?.sortBy) searchParams.append('ordering', params.sortBy);
      if (params?.series) searchParams.append('series', params.series);
      if (params?.category) searchParams.append('category', params.category);
      if (params?.featured) searchParams.append('is_featured', 'true');
      if (params?.limit) searchParams.append('limit', params.limit.toString());
      if (params?.offset) searchParams.append('offset', params.offset.toString());

      const query = searchParams.toString();
      const endpoint = `/podcasts/episodes/${query ? `?${query}` : ''}`;
      
      const data = await apiRequest(endpoint);
      
      return {
        results: data.results?.map(transformPodcast) || [],
        count: data.count || 0,
      };
    } catch (error) {
      console.error('❌ Error fetching podcasts:', error);
      throw error;
    }
  },

  // Get featured podcasts
  async getFeaturedPodcasts(): Promise<ContentItem[]> {
    try {
      const data = await apiRequest('/podcasts/episodes/featured/');
      return data.map(transformPodcast);
    } catch (error) {
      console.error('❌ Error fetching featured podcasts:', error);
      throw error;
    }
  },

  // Get trending podcasts
  async getTrendingPodcasts(): Promise<ContentItem[]> {
    try {
      const data = await apiRequest('/podcasts/episodes/trending/');
      return data.map(transformPodcast);
    } catch (error) {
      console.error('❌ Error fetching trending podcasts:', error);
      throw error;
    }
  },

  // Get recent podcasts
  async getRecentPodcasts(): Promise<ContentItem[]> {
    try {
      const data = await apiRequest('/podcasts/episodes/recent/');
      return data.map(transformPodcast);
    } catch (error) {
      console.error('❌ Error fetching recent podcasts:', error);
      throw error;
    }
  },

  // Get podcast by ID
  async getPodcast(id: string): Promise<ContentItem> {
    try {
      const data = await apiRequest(`/podcasts/episodes/${id}/`);
      return transformPodcast(data);
    } catch (error) {
      console.error('❌ Error fetching podcast:', error);
      throw error;
    }
  },

  // Get podcast series
  async getPodcastSeries(params?: {
    search?: string;
    category?: string;
    featured?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<{ results: BackendSeries[]; count: number }> {
    try {
      const searchParams = new URLSearchParams();
      
      if (params?.search) searchParams.append('search', params.search);
      if (params?.category) searchParams.append('category', params.category);
      if (params?.featured) searchParams.append('is_featured', 'true');
      if (params?.limit) searchParams.append('limit', params.limit.toString());
      if (params?.offset) searchParams.append('offset', params.offset.toString());

      const query = searchParams.toString();
      const endpoint = `/podcasts/series/${query ? `?${query}` : ''}`;
      
      const data = await apiRequest(endpoint);
      
      return {
        results: data.results?.map(transformSeries) || [],
        count: data.count || 0,
      };
    } catch (error) {
      console.error('❌ Error fetching podcast series:', error);
      throw error;
    }
  },

  // Get series by ID
  async getSeries(id: string): Promise<ReturnType<typeof transformSeries>> {
    try {
      const data = await apiRequest(`/podcasts/series/${id}/`);
      return transformSeries(data);
    } catch (error) {
      console.error('❌ Error fetching series:', error);
      throw error;
    }
  },

  // Like/unlike podcast
  async likePodcast(id: string): Promise<void> {
    try {
      await apiRequest(`/podcasts/episodes/${id}/interact/`, {
        method: 'POST',
        body: JSON.stringify({ interaction_type: 'like' }),
      });
    } catch (error) {
      console.error('❌ Error liking podcast:', error);
      throw error;
    }
  },

  // Bookmark/unbookmark podcast
  async bookmarkPodcast(id: string): Promise<void> {
    try {
      await apiRequest(`/podcasts/episodes/${id}/interact/`, {
        method: 'POST',
        body: JSON.stringify({ interaction_type: 'bookmark' }),
      });
    } catch (error) {
      console.error('❌ Error bookmarking podcast:', error);
      throw error;
    }
  },

  // Rate podcast
  async ratePodcast(id: string, rating: number): Promise<void> {
    try {
      await apiRequest(`/podcasts/episodes/${id}/interact/`, {
        method: 'POST',
        body: JSON.stringify({ 
          interaction_type: 'rate',
          rating: rating
        }),
      });
    } catch (error) {
      console.error('❌ Error rating podcast:', error);
      throw error;
    }
  },

  // Track listening progress
  async trackProgress(id: string, progress: number, duration?: number): Promise<void> {
    try {
      await apiRequest(`/podcasts/episodes/${id}/interact/`, {
        method: 'POST',
        body: JSON.stringify({ 
          interaction_type: 'listen',
          listen_progress: progress,
          ...(duration && { listen_time: duration })
        }),
      });
    } catch (error) {
      console.error('❌ Error tracking progress:', error);
      throw error;
    }
  },

  // Get podcast categories
  async getCategories(): Promise<Category[]> {
    try {
      const data = await apiRequest('/podcasts/series/categories/');
      return data;
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
      throw error;
    }
  },

  // Get podcast stats
  async getStats(): Promise<PodcastStats> {
    try {
      const data = await apiRequest('/podcasts/stats/');
      return data;
    } catch (error) {
      console.error('❌ Error fetching stats:', error);
      throw error;
    }
  },

  // Subscribe to series
  async subscribeSeries(seriesId: string): Promise<void> {
    try {
      await apiRequest(`/podcasts/series/${seriesId}/interact/`, {
        method: 'POST',
        body: JSON.stringify({ interaction_type: 'subscribe' }),
      });
    } catch (error) {
      console.error('❌ Error subscribing to series:', error);
      throw error;
    }
  },

  // Get user's podcast library
  async getLibrary(): Promise<ContentItem[]> {
    try {
      const data = await apiRequest('/podcasts/library/');
      return data.results?.map(transformPodcast) || [];
    } catch (error) {
      console.error('❌ Error fetching podcast library:', error);
      throw error;
    }
  },

  // Create podcast episode
  async createEpisode(episodeData: FormData): Promise<BackendPodcast> {
    try {
      // Remove Content-Type header to let browser set it for FormData
      const token = localStorage.getItem('access_token');
      const headers: Record<string, string> = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/podcasts/episodes/`, {
        method: 'POST',
        headers,
        body: episodeData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 401) {
          console.error('🚫 Authentication failed');
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('account');
          window.location.href = '/login';
          throw new Error('Your session has expired. Please log in again.');
        }
        
        throw new Error(errorData.message || errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Error creating podcast episode:', error);
      throw error;
    }
  },

  // Create a new podcast series
  async createPodcastSeries(seriesData: FormData): Promise<BackendSeries> {
    try {
      const token = localStorage.getItem('access_token');
      const headers: Record<string, string> = {};
      
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/podcasts/series/`, {
        method: 'POST',
        headers,
        body: seriesData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 401) {
          console.error('🚫 Authentication failed');
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('account');
          window.location.href = '/login';
          throw new Error('Your session has expired. Please log in again.');
        }
        
        throw new Error(errorData.message || errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Error creating podcast series:', error);
      throw error;
    }
  },

  // Get next episode number for a series
  async getNextEpisodeNumber(seriesId: string, seasonNumber: number = 1): Promise<{ next_episode_number: number; season_number: number; series_id: string }> {
    try {
      const token = localStorage.getItem('access_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/podcasts/series/${seriesId}/next_episode_number/?season=${seasonNumber}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Error getting next episode number:', error);
      throw error;
    }
  },

  // Update podcast episode
  async updatePodcast(id: string, data: FormData | Record<string, unknown>): Promise<BackendPodcast> {
    try {
      // Handle both FormData and JSON updates
      if (data instanceof FormData) {
        // Remove Content-Type header to let browser set it for FormData
        const token = localStorage.getItem('access_token');
        const headers: Record<string, string> = {};
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}/podcasts/episodes/${id}/`, {
          method: 'PATCH',
          headers,
          body: data,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          
          if (response.status === 401) {
            console.error('🚫 Authentication failed');
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('account');
            window.location.href = '/login';
            throw new Error('Your session has expired. Please log in again.');
          }
          
          throw new Error(errorData.message || errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
      } else {
        // For JSON updates (when no files involved)
        return apiRequest(`/podcasts/episodes/${id}/`, {
          method: 'PATCH',
          body: JSON.stringify(data),
        });
      }
    } catch (error) {
      console.error('❌ Error updating podcast episode:', error);
      throw error;
    }
  },

  // Delete podcast episode
  async deletePodcast(id: string): Promise<void> {
    try {
      await apiRequest(`/podcasts/episodes/${id}/`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('❌ Error deleting podcast episode:', error);
      throw error;
    }
  },
};

export default podcastService;
