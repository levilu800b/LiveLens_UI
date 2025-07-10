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
  description?: string;
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
  duration: number;
  duration_formatted: string;
  file_size: number;
  video_quality: string;
  frame_rate: string;
  resolution_formatted: string;
  created_at: string;
  updated_at?: string;
  published_at?: string;
  average_rating: number;
  rating_count: number;
  is_liked: boolean;
  is_bookmarked: boolean;
  user_rating: number | null;
  watch_progress?: {
    last_position: number;
    completion_percentage: number;
  };
  is_series: boolean;
  series_name: string;
  episode_number: number | null;
  season_number: number | null;
  // Technical specifications
  resolution_width: number;
  resolution_height: number;
  // Optional fields that might come from production_info
  director?: string;
  animator?: string;
  studio?: string;
  music_composer?: string;
  sound_designer?: string;
  language?: string;
  release_year?: number;
  animation_software?: string;
  render_engine?: string;
  production_time?: number;
  // Additional fields
  voice_actors?: string[];
  subtitles_available?: string[];
  budget?: number;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface AnimationViewData {
  watch_duration: number;
  completion_percentage: number;
  quality_watched: string;
  device_type: string;
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

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
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
    return apiRequest(`/animations/animations/${queryString ? `?${queryString}` : ''}`);
  }

  async getAnimation(id: string): Promise<Animation> {
    return apiRequest(`/animations/animations/${id}/`);
  }

  async getFeaturedAnimations(): Promise<Animation[]> {
    return apiRequest('/animations/animations/featured/');
  }

  async getTrendingAnimations(): Promise<Animation[]> {
    return apiRequest('/animations/animations/trending/');
  }

  async getAnimationStats(): Promise<{
    total_animations: number;
    total_views: number;
    total_likes: number;
    total_bookmarks: number;
  }> {
    return apiRequest('/animations/stats/');
  }

  async interactWithAnimation(animationId: string, action: string, data: Record<string, unknown> = {}): Promise<{ status: string; message: string }> {
    return apiRequest(`/animations/animations/${animationId}/interact/`, {
      method: 'POST',
      body: JSON.stringify({
        interaction_type: action,
        ...data,
      }),
    });
  }

  async trackAnimationView(animationId: string, viewData: AnimationViewData): Promise<void> {
    return apiRequest(`/animations/track-view/${animationId}/`, {
      method: 'POST',
      body: JSON.stringify(viewData),
    });
  }

  async getAnimationPlayUrl(animationId: string): Promise<{ video_url: string }> {
    return apiRequest(`/animations/animations/${animationId}/play_now/`);
  }

  async updateAnimation(id: string, formData: FormData): Promise<Animation> {
    return apiRequest(`/animations/animations/${id}/`, {
      method: 'PATCH',
      body: formData,
    });
  }

  async createAnimation(formData: FormData): Promise<Animation> {
    return apiRequest('/animations/animations/', {
      method: 'POST',
      body: formData,
    });
  }

  async deleteAnimation(id: string): Promise<void> {
    return apiRequest(`/animations/animations/${id}/`, {
      method: 'DELETE',
    });
  }
}

export default new AnimationService();
