// src/services/mediaService.ts
import unifiedAuth from '../utils/unifiedAuth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ===== INTERFACES =====
export interface MediaFilter {
  search?: string;
  category?: string;
  tags?: string[];
  author?: string;
  status?: string;
  is_featured?: boolean;
  is_trending?: boolean;
  is_premium?: boolean;
  ordering?: string;
  page?: number;
  page_size?: number;
}

export interface Author {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
}

export interface Subtitle {
  id: string;
  language: string;
  language_code: string;
  label: string;
  url: string;
  is_default?: boolean;
}

export interface MediaInteraction {
  id: string;
  interaction_type: 'like' | 'bookmark' | 'watch' | 'rate';
  rating?: number;
  watch_progress?: number;
  created_at: string;
}

// Film specific interfaces
export interface Film {
  id: string;
  title: string;
  slug: string;
  description: string;
  short_description: string;
  category: string;
  tags: string[];
  thumbnail: string;
  poster?: string;
  banner?: string;
  video_file?: string;
  author: Author;
  status: 'draft' | 'published' | 'archived';
  is_featured: boolean;
  is_trending: boolean;
  is_premium: boolean;
  view_count: number;
  like_count: number;
  comment_count: number;
  download_count: number;
  average_rating: number;
  rating_count: number;
  duration: number;
  duration_formatted: string;
  video_quality: string;
  file_size: number;
  file_size_formatted: string;
  release_year?: number;
  language: string;
  subtitles_available: string[];
  subtitles?: Subtitle[];
  director: string;
  cast: string[];
  producer: string;
  studio: string;
  budget?: number;
  box_office?: number;
  mpaa_rating: string;
  is_series: boolean;
  series_name?: string;
  episode_number?: number;
  season_number?: number;
  is_liked: boolean;
  is_bookmarked: boolean;
  user_rating?: number;
  watch_progress?: number;
  created_at: string;
  updated_at: string;
  published_at?: string;
}

// Content specific interfaces
export interface Content {
  id: string;
  title: string;
  slug: string;
  description: string;
  short_description: string;
  category: string;
  content_type: string;
  tags: string[];
  thumbnail: string;
  poster?: string;
  banner?: string;
  video_file?: string;
  author: Author;
  status: 'draft' | 'published' | 'archived';
  is_featured: boolean;
  is_trending: boolean;
  is_premium: boolean;
  view_count: number;
  like_count: number;
  comment_count: number;
  download_count: number;
  average_rating: number;
  rating_count: number;
  duration: number;
  duration_formatted: string;
  video_quality: string;
  file_size: number;
  file_size_formatted: string;
  release_year?: number;
  language: string;
  subtitles_available: string[];
  subtitles?: Subtitle[];
  creator: string;
  series_name?: string;
  episode_number?: number;
  difficulty_level?: string;
  is_live: boolean;
  scheduled_live_time?: string;
  live_stream_url?: string;
  is_liked: boolean;
  is_bookmarked: boolean;
  user_rating?: number;
  watch_progress?: number;
  created_at: string;
  updated_at: string;
  published_at?: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface MediaStats {
  total_films: number;
  total_content: number;
  total_views: number;
  total_likes: number;
  trending_films: Film[];
  trending_content: Content[];
  featured_films: Film[];
  featured_content: Content[];
  recent_films: Film[];
  recent_content: Content[];
}

export interface HeroMediaResponse {
  id: string;
  title: string;
  description: string;
  short_description?: string;
  category: string;
  thumbnail: string;
  banner?: string;
  type: 'film' | 'content';
  duration_formatted: string;
  view_count: number;
  like_count: number;
  average_rating: number;
  is_trending: boolean;
  is_featured: boolean;
}

export interface MediaLibrary {
  watched_films: Film[];
  watched_content: Content[];
  bookmarked_films: Film[];
  bookmarked_content: Content[];
}

export interface SearchResults {
  films: Film[];
  content: Content[];
}

export interface MediaCollection {
  id: string;
  name: string;
  description: string;
  user: Author;
  films: Film[];
  content: Content[];
  is_public: boolean;
  total_items: number;
  created_at: string;
  updated_at: string;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  user: Author;
  is_public: boolean;
  total_items: number;
  created_at: string;
  updated_at: string;
  items: PlaylistItem[];
}

export interface PlaylistItem {
  id: string;
  content_type: 'film' | 'content';
  object_id: string;
  order: number;
  added_at: string;
}

// ===== HELPER FUNCTIONS =====
const getAuthHeaders = () => {
  const token = unifiedAuth.getAccessToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

const getFormDataHeaders = () => {
  const token = unifiedAuth.getAccessToken();
  return {
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const headers = options.body instanceof FormData 
    ? getFormDataHeaders() 
    : getAuthHeaders();

  const response = await fetch(`${API_BASE_URL}/media${endpoint}`, {
    headers,
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    
    if (response.status === 401) {
      unifiedAuth.clearTokens();
      window.location.href = '/login';
      throw new Error('Your session has expired. Please log in again.');
    }
    
    throw new Error(errorData.message || errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
};

// ===== MEDIA SERVICE =====
class MediaService {
  // ===== FILM METHODS =====
  
  async getFilms(filters: MediaFilter = {}): Promise<PaginatedResponse<Film>> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v.toString()));
        } else {
          params.append(key, value.toString());
        }
      }
    });

    const queryString = params.toString();
    return apiRequest(`/films/${queryString ? `?${queryString}` : ''}`);
  }

  async getFilm(id: string): Promise<Film> {
    return apiRequest(`/films/${id}/`);
  }

  async getFeaturedFilms(): Promise<Film[]> {
    return apiRequest('/films/featured/');
  }

  async getTrendingFilms(): Promise<Film[]> {
    return apiRequest('/films/trending/');
  }

  async getMyFilms(filters: MediaFilter = {}): Promise<PaginatedResponse<Film>> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v.toString()));
        } else {
          params.append(key, value.toString());
        }
      }
    });

    const queryString = params.toString();
    return apiRequest(`/films/my_films/${queryString ? `?${queryString}` : ''}`);
  }

  async getFilmCategories(): Promise<{ value: string; label: string }[]> {
    return apiRequest('/films/categories/');
  }

  async playFilm(id: string): Promise<{
    video_url: string;
    duration: number;
    duration_formatted: string;
    quality: string;
    subtitles: string[];
  }> {
    return apiRequest(`/films/${id}/play_now/`);
  }

  async interactWithFilm(id: string, interactionData: {
    interaction_type: 'like' | 'bookmark' | 'watch' | 'rate';
    rating?: number;
    watch_progress?: number;
  }): Promise<{
    message: string;
    interaction?: MediaInteraction;
  }> {
    return apiRequest(`/films/${id}/interact/`, {
      method: 'POST',
      body: JSON.stringify(interactionData),
    });
  }

  async createFilm(formData: FormData): Promise<Film> {
    return apiRequest('/films/', {
      method: 'POST',
      body: formData,
    });
  }

  async updateFilm(id: string, data: FormData | Record<string, unknown>): Promise<Film> {
    // Handle both FormData and JSON updates
    if (data instanceof FormData) {
      return apiRequest(`/films/${id}/`, {
        method: 'PATCH',
        body: data,
      });
    } else {
      // For JSON updates (when no files involved)
      return apiRequest(`/films/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    }
  }

  async deleteFilm(id: string): Promise<void> {
    await apiRequest(`/films/${id}/`, {
      method: 'DELETE',
    });
  }

  // ===== CONTENT METHODS =====

  async getContent(filters: MediaFilter = {}): Promise<PaginatedResponse<Content>> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v.toString()));
        } else {
          params.append(key, value.toString());
        }
      }
    });

    const queryString = params.toString();
    return apiRequest(`/content/${queryString ? `?${queryString}` : ''}`);
  }

  async getContentItem(id: string): Promise<Content> {
    return apiRequest(`/content/${id}/`);
  }

  async getFeaturedContent(): Promise<Content[]> {
    return apiRequest('/content/featured/');
  }

  async getTrendingContent(): Promise<Content[]> {
    return apiRequest('/content/trending/');
  }

  async getMyContent(filters: MediaFilter = {}): Promise<PaginatedResponse<Content>> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v.toString()));
        } else {
          params.append(key, value.toString());
        }
      }
    });

    const queryString = params.toString();
    return apiRequest(`/content/my_content/${queryString ? `?${queryString}` : ''}`);
  }

  async getContentCategories(): Promise<{ value: string; label: string }[]> {
    return apiRequest('/content/categories/');
  }

  async playContent(id: string): Promise<{
    video_url: string;
    duration: number;
    duration_formatted: string;
    quality: string;
    subtitles: string[];
    live_stream_url?: string;
  }> {
    return apiRequest(`/content/${id}/play_now/`);
  }

  async interactWithContent(id: string, interactionData: {
    interaction_type: 'like' | 'bookmark' | 'watch' | 'rate';
    rating?: number;
    watch_progress?: number;
  }): Promise<{
    message: string;
    interaction?: MediaInteraction;
  }> {
    return apiRequest(`/content/${id}/interact/`, {
      method: 'POST',
      body: JSON.stringify(interactionData),
    });
  }

  async createContent(formData: FormData): Promise<Content> {
    return apiRequest('/content/', {
      method: 'POST',
      body: formData,
    });
  }

  async updateContent(id: string, data: FormData | Record<string, unknown>): Promise<Content> {
    // Handle both FormData and JSON updates
    if (data instanceof FormData) {
      return apiRequest(`/content/${id}/`, {
        method: 'PATCH',
        body: data,
      });
    } else {
      // For JSON updates (when no files involved)
      return apiRequest(`/content/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    }
  }

  async deleteContent(id: string): Promise<void> {
    await apiRequest(`/content/${id}/`, {
      method: 'DELETE',
    });
  }

  // ===== GENERAL MEDIA METHODS =====

  async getHeroMedia(type: 'film' | 'content' = 'film'): Promise<HeroMediaResponse> {
    return apiRequest(`/hero/?type=${type}`);
  }

  async searchMedia(query: string, filters: {
    type?: 'film' | 'content' | 'all';
    category?: string;
    tags?: string;
    author?: string;
  } = {}): Promise<SearchResults> {
    const params = new URLSearchParams({ q: query });
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    return apiRequest(`/search/?${params.toString()}`);
  }

  async getMediaStats(): Promise<MediaStats> {
    return apiRequest('/stats/');
  }

  async getMediaLibrary(): Promise<MediaLibrary> {
    return apiRequest('/library/');
  }

  async trackMediaView(mediaType: 'film' | 'content', mediaId: string, viewData: {
    watch_duration?: number;
    completion_percentage?: number;
    quality_watched?: string;
    device_type?: 'desktop' | 'mobile' | 'tablet' | 'tv' | 'other';
  } = {}): Promise<{ message: string }> {
    return apiRequest(`/track-view/${mediaType}/${mediaId}/`, {
      method: 'POST',
      body: JSON.stringify(viewData),
    });
  }

  // ===== COLLECTIONS AND PLAYLISTS =====

  async getCollections(filters: MediaFilter = {}): Promise<PaginatedResponse<MediaCollection>> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v.toString()));
        } else {
          params.append(key, value.toString());
        }
      }
    });

    const queryString = params.toString();
    return apiRequest(`/collections/${queryString ? `?${queryString}` : ''}`);
  }

  async createCollection(data: {
    name: string;
    description: string;
    is_public: boolean;
  }): Promise<MediaCollection> {
    return apiRequest('/collections/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async addFilmToCollection(collectionId: string, filmId: string): Promise<{ message: string }> {
    return apiRequest(`/collections/${collectionId}/add_film/`, {
      method: 'POST',
      body: JSON.stringify({ film_id: filmId }),
    });
  }

  async addContentToCollection(collectionId: string, contentId: string): Promise<{ message: string }> {
    return apiRequest(`/collections/${collectionId}/add_content/`, {
      method: 'POST',
      body: JSON.stringify({ content_id: contentId }),
    });
  }

  async getPlaylists(filters: MediaFilter = {}): Promise<PaginatedResponse<Playlist>> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v.toString()));
        } else {
          params.append(key, value.toString());
        }
      }
    });

    const queryString = params.toString();
    return apiRequest(`/playlists/${queryString ? `?${queryString}` : ''}`);
  }

  async createPlaylist(data: {
    name: string;
    description: string;
    is_public: boolean;
  }): Promise<Playlist> {
    return apiRequest('/playlists/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

// ===== EXPORT =====
const mediaService = new MediaService();
export default mediaService;
