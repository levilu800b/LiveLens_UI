// src/services/animationService.ts
import unifiedAuth from '../utils/unifiedAuth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ===== INTERFACES =====
export interface AnimationFilter {
  search?: string;
  category?: string;
  animation_type?: string;
  tags?: string[];
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
  avatar?: string;
}

export interface Animation {
  id: string;
  title: string;
  slug: string;
  description: string;
  short_description: string;
  category: string;
  animation_type: string;
  tags: string[];
  thumbnail: string;
  poster?: string;
  banner?: string;
  video_file?: string;
  project_file?: string;
  storyboard?: string;
  concept_art?: string;
  author: Author;
  status: 'draft' | 'published' | 'archived' | 'processing' | 'generating';
  is_featured: boolean;
  is_trending: boolean;
  is_premium: boolean;
  view_count: number;
  like_count: number;
  comment_count: number;
  download_count: number;
  share_count: number;
  average_rating: number;
  rating_count: number;
  duration: number;
  duration_formatted: string;
  video_quality: string;
  frame_rate: string;
  file_size: number;
  file_size_formatted: string;
  resolution_width: number;
  resolution_height: number;
  resolution_formatted: string;
  animation_software?: string;
  render_engine?: string;
  production_time: number;
  release_year?: number;
  language: string;
  subtitles_available: string[];
  director: string;
  animator: string;
  voice_actors: string[];
  music_composer: string;
  sound_designer: string;
  studio: string;
  budget?: number;
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

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface AnimationStats {
  total_animations: number;
  total_views: number;
  total_likes: number;
  total_downloads: number;
  avg_rating: number;
  categories: Array<{
    category: string;
    count: number;
  }>;
  animation_types: Array<{
    type: string;
    count: number;
  }>;
}

export interface HeroAnimationResponse {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  video_file?: string;
  is_trending: boolean;
  view_count: number;
  like_count: number;
  duration_formatted: string;
  category: string;
  animation_type: string;
}

export interface AnimationLibrary {
  liked: Animation[];
  bookmarked: Animation[];
  watched: Animation[];
  my_animations: Animation[];
}

export interface SearchResults {
  animations: Animation[];
  total_results: number;
  search_query: string;
}

export interface AnimationCollection {
  id: string;
  title: string;
  description: string;
  animations: Animation[];
  created_at: string;
}

export interface AnimationPlaylist {
  id: string;
  title: string;
  description: string;
  animations: Animation[];
  is_public: boolean;
  created_at: string;
}

// ===== HELPER FUNCTIONS =====
const getAuthHeaders = () => {
  const token = unifiedAuth.getAccessToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

const getFormHeaders = () => {
  const token = unifiedAuth.getAccessToken();
  return {
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const headers = options.body instanceof FormData 
    ? getFormHeaders() 
    : getAuthHeaders();

  const response = await fetch(`${API_BASE_URL}/animations${endpoint}`, {
    headers,
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    
    if (response.status === 401) {
      console.error('🚫 Authentication failed');
      unifiedAuth.clearTokens();
      window.location.href = '/login';
      throw new Error('Your session has expired. Please log in again.');
    }
    
    throw new Error(errorData.message || errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
};

// ===== ANIMATION SERVICE =====
class AnimationService {
  // ===== ANIMATION METHODS =====
  
  async getAnimations(filters: AnimationFilter = {}): Promise<PaginatedResponse<Animation>> {
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
    return apiRequest(`/animations/${queryString ? `?${queryString}` : ''}`);
  }

  async getAnimation(id: string): Promise<Animation> {
    return apiRequest(`/animations/${id}/`);
  }

  async getFeaturedAnimations(): Promise<Animation[]> {
    return apiRequest('/animations/featured/');
  }

  async getTrendingAnimations(): Promise<Animation[]> {
    return apiRequest('/animations/trending/');
  }

  async getAnimationSeries(): Promise<Array<{
    series_name: string;
    episode_count: number;
    latest_episode: string;
  }>> {
    return apiRequest('/animations/series/');
  }

  async getMyAnimations(filters: AnimationFilter = {}): Promise<PaginatedResponse<Animation>> {
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
    return apiRequest(`/animations/my_animations/${queryString ? `?${queryString}` : ''}`);
  }

  // ===== INTERACTION METHODS =====
  
  async interactWithAnimation(
    animationId: string, 
    interactionType: string, 
    data: Record<string, unknown> = {}
  ): Promise<{ message: string; interaction?: unknown }> {
    return apiRequest(`/animations/${animationId}/interact/`, {
      method: 'POST',
      body: JSON.stringify({
        interaction_type: interactionType,
        ...data
      }),
    });
  }

  async getAnimationPlayUrl(animationId: string): Promise<{ video_url: string }> {
    return apiRequest(`/animations/${animationId}/play_now/`);
  }

  // ===== STATS AND HERO METHODS =====
  
  async getHeroAnimation(): Promise<HeroAnimationResponse> {
    return apiRequest('/hero/');
  }

  async getAnimationStats(): Promise<AnimationStats> {
    return apiRequest('/stats/');
  }

  // ===== SEARCH METHODS =====
  
  async searchAnimations(query: string, filters: AnimationFilter = {}): Promise<SearchResults> {
    const params = new URLSearchParams({
      search: query,
      ...Object.fromEntries(
        Object.entries(filters).filter(([, value]) =>
          value !== undefined && value !== null && value !== ''
        )
      )
    });

    return apiRequest(`/search/?${params.toString()}`);
  }

  // ===== LIBRARY METHODS =====
  
  async getAnimationLibrary(): Promise<AnimationLibrary> {
    return apiRequest('/library/');
  }

  // ===== COLLECTION AND PLAYLIST METHODS =====
  
  async getAnimationCollections(): Promise<AnimationCollection[]> {
    return apiRequest('/collections/');
  }

  async createAnimationCollection(data: {
    title: string;
    description: string;
    animation_ids: string[];
  }): Promise<AnimationCollection> {
    return apiRequest('/collections/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getAnimationPlaylists(): Promise<AnimationPlaylist[]> {
    return apiRequest('/playlists/');
  }

  async createAnimationPlaylist(data: {
    title: string;
    description: string;
    is_public: boolean;
    animation_ids: string[];
  }): Promise<AnimationPlaylist> {
    return apiRequest('/playlists/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ===== ANALYTICS METHODS =====
  
  async trackAnimationView(animationId: string, viewData: {
    watch_duration?: number;
    completion_percentage?: number;
    quality_watched?: string;
    device_type?: string;
  } = {}): Promise<void> {
    return apiRequest(`/track-view/${animationId}/`, {
      method: 'POST',
      body: JSON.stringify(viewData),
    });
  }

  // ===== METADATA METHODS =====
  
  async getAnimationCategories(): Promise<Array<{ value: string; label: string }>> {
    return apiRequest('/animations/categories/');
  }

  async getAnimationTypes(): Promise<Array<{ value: string; label: string }>> {
    return apiRequest('/animations/animation_types/');
  }

  // ===== ADMIN METHODS (if user has permissions) =====
  
  async createAnimation(formData: FormData): Promise<Animation> {
    return apiRequest('/animations/', {
      method: 'POST',
      body: formData,
    });
  }

  async updateAnimation(id: string, formData: FormData): Promise<Animation> {
    return apiRequest(`/animations/${id}/`, {
      method: 'PUT',
      body: formData,
    });
  }

  async deleteAnimation(id: string): Promise<void> {
    return apiRequest(`/animations/${id}/`, {
      method: 'DELETE',
    });
  }
}

export default new AnimationService();
