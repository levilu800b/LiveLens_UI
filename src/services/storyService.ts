// src/services/storyService.ts
import unifiedAuth from '../utils/unifiedAuth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export interface Story {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string[];
  thumbnail: string;
  cover_image: string;
  author: {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    avatar: string;
  };
  status: 'draft' | 'published' | 'archived';
  is_featured: boolean;
  is_trending: boolean;
  read_count: number;
  like_count: number;
  comment_count: number;
  estimated_read_time: number;
  pages: StoryPage[];
  total_pages: number;
  is_liked: boolean;
  is_bookmarked: boolean;
  reading_progress?: {
    last_page_read: number;
    progress_percentage: number;
  };
  related_stories: Story[];
  // Series support
  series?: {
    id: string;
    title: string;
    description: string;
    total_stories: number;
    current_position: number;
  };
  series_id?: string;
  series_position?: number;
  next_in_series?: {
    id: string;
    title: string;
    slug: string;
  };
  previous_in_series?: {
    id: string;
    title: string;
    slug: string;
  };
  created_at: string;
  updated_at: string;
  published_at: string;
}

export interface StoryPage {
  id: string;
  page_number: number;
  title: string;
  content: string;
  page_image?: string;
  word_count: number;
  created_at: string;
  updated_at: string;
}

export interface StoryListItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  excerpt: string;
  category: string;
  tags: string[];
  thumbnail: string;
  cover_image: string;
  author: {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    avatar: string;
  };
  status: string;
  is_featured: boolean;
  is_trending: boolean;
  read_count: number;
  like_count: number;
  comment_count: number;
  estimated_read_time: number;
  total_pages: number;
  is_liked: boolean;
  is_bookmarked: boolean;
  created_at: string;
  updated_at: string;
  published_at: string;
}

export interface CreateStoryData {
  title: string;
  description: string;
  content: string; // Main story content
  category: string;
  tags: string[];
  thumbnail?: File;
  cover_image?: File;
  status: 'draft' | 'published';
  is_featured?: boolean;
  is_trending?: boolean;
}

export interface StoryFilters {
  category?: string;
  tags?: string[];
  author?: string;
  status?: string;
  is_featured?: boolean;
  is_trending?: boolean;
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}

class StoryService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Create headers object
    const headers: Record<string, string> = {};
    
    // Add auth headers if available
    const token = unifiedAuth.getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Only add Content-Type if it's not FormData (browser will set the correct boundary)
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    // Merge with any headers from options (but don't override Content-Type for FormData)
    if (options.headers) {
      const optionHeaders = options.headers as Record<string, string>;
      Object.entries(optionHeaders).forEach(([key, value]) => {
        // Don't override Content-Type for FormData
        if (key.toLowerCase() === 'content-type' && options.body instanceof FormData) {
          return;
        }
        headers[key] = value;
      });
    }
    
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorData: Record<string, unknown> = {};
      try {
        errorData = await response.json();
      } catch {
        // If we can't parse JSON, try to get text
        try {
          const errorText = await response.text();
          errorData = { message: errorText, raw_error: errorText };
        } catch {
          errorData = { message: `HTTP ${response.status}: ${response.statusText}` };
        }
      }
      
      // Handle authentication errors specifically
      if (response.status === 401) {
        // Try to refresh token or redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/admin';
        }
      }
      
      // Create a detailed error message
      let errorMessage = (errorData.detail as string) || (errorData.message as string) || `HTTP ${response.status}: ${response.statusText}`;
      
      // If there are field-specific errors, include them
      if (errorData.errors || (typeof errorData === 'object' && !errorData.detail && !errorData.message)) {
        const fieldErrors = errorData.errors || errorData;
        if (typeof fieldErrors === 'object' && fieldErrors !== null) {
          const errorDetails = Object.entries(fieldErrors)
            .map(([field, messages]) => {
              const msgArray = Array.isArray(messages) ? messages : [messages];
              return `${field}: ${msgArray.join(', ')}`;
            })
            .join('; ');
          
          if (errorDetails) {
            errorMessage += ` - Field errors: ${errorDetails}`;
          }
        }
      }
      
      throw new Error(errorMessage);
    }

    return response.json();
  }

  // Get all stories with filters
  async getStories(filters: StoryFilters = {}): Promise<{
    count: number;
    next: string | null;
    previous: string | null;
    results: StoryListItem[];
  }> {
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
    return this.makeRequest(`/stories/stories/${queryString ? `?${queryString}` : ''}`);
  }

  // Get story by ID
  async getStory(id: string): Promise<Story> {
    return this.makeRequest(`/stories/stories/${id}/`);
  }

  // Get story pages
  async getStoryPages(id: string, pageNumber?: number): Promise<{
    total_pages: number;
    pages: StoryPage[];
  }> {
    const params = pageNumber ? `?page_number=${pageNumber}` : '';
    return this.makeRequest(`/stories/stories/${id}/pages/${params}`);
  }

  // Get featured stories
  async getFeaturedStories(): Promise<StoryListItem[]> {
    return this.makeRequest('/stories/featured/');
  }

  // Get trending stories
  async getTrendingStories(): Promise<StoryListItem[]> {
    return this.makeRequest('/stories/trending/');
  }

  // Get hero story
  async getHeroStory(): Promise<Story> {
    return this.makeRequest('/stories/hero/');
  }

  // Get my stories
  async getMyStories(filters: StoryFilters = {}): Promise<{
    count: number;
    next: string | null;
    previous: string | null;
    results: StoryListItem[];
  }> {
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
    return this.makeRequest(`/stories/my_stories/${queryString ? `?${queryString}` : ''}`);
  }

  // Get user library (read stories, bookmarks)
  async getMyLibrary(): Promise<{
    read_stories: StoryListItem[];
    bookmarked_stories: StoryListItem[];
  }> {
    return this.makeRequest('/stories/my_library/');
  }

  // Search stories
  async searchStories(query: string, filters: Omit<StoryFilters, 'search'> = {}): Promise<{
    count: number;
    total_pages: number;
    current_page: number;
    has_next: boolean;
    has_previous: boolean;
    results: StoryListItem[];
  }> {
    const params = new URLSearchParams({ q: query });
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v.toString()));
        } else {
          params.append(key, value.toString());
        }
      }
    });

    return this.makeRequest(`/stories/search/?${params.toString()}`);
  }

  // Create story
  async createStory(data: CreateStoryData): Promise<Story> {
    const formData = new FormData();
    
    // Add basic fields
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('content', data.content);
    formData.append('category', data.category);
    
    // Handle tags properly - send each tag individually instead of JSON string
    if (data.tags && data.tags.length > 0) {
      // Send tags as individual form fields - Django will handle this as a list
      data.tags.forEach(tag => {
        formData.append('tags', tag);
      });
    }
    
    formData.append('status', data.status);
    
    if (data.is_featured !== undefined) {
      formData.append('is_featured', data.is_featured.toString());
    }
    if (data.is_trending !== undefined) {
      formData.append('is_trending', data.is_trending.toString());
    }

    // Add files
    if (data.thumbnail) formData.append('thumbnail', data.thumbnail);
    if (data.cover_image) formData.append('cover_image', data.cover_image);

    return this.makeRequest('/stories/stories/', {
      method: 'POST',
      body: formData,
    });
  }

  // Update story
  async updateStory(id: string, data: Partial<CreateStoryData>): Promise<Story> {
    // Check if file uploads are present
    const hasFiles = data.thumbnail || data.cover_image;
    
    if (hasFiles) {
      // Use FormData for file uploads
      const formData = new FormData();
      
      // Add basic fields
      if (data.title) formData.append('title', data.title);
      if (data.description) formData.append('description', data.description);
      if (data.content) formData.append('content', data.content);
      if (data.category) formData.append('category', data.category);
      if (data.tags) formData.append('tags', JSON.stringify(data.tags));
      if (data.status) formData.append('status', data.status);
      
      if (data.is_featured !== undefined) {
        formData.append('is_featured', data.is_featured.toString());
      }
      if (data.is_trending !== undefined) {
        formData.append('is_trending', data.is_trending.toString());
      }
      
      // Add file uploads
      if (data.thumbnail) {
        formData.append('thumbnail', data.thumbnail);
      }
      if (data.cover_image) {
        formData.append('cover_image', data.cover_image);
      }

      return this.makeRequest(`/stories/stories/${id}/`, {
        method: 'PATCH',
        body: formData,
      });
    } else {
      // Use JSON for updates without files
      const updatePayload: Record<string, unknown> = {};
      
      // Add basic fields
      if (data.title) updatePayload.title = data.title;
      if (data.description) updatePayload.description = data.description;
      if (data.content) updatePayload.content = data.content;
      if (data.category) updatePayload.category = data.category;
      if (data.tags) updatePayload.tags = data.tags; // Send as array, not JSON string
      if (data.status) updatePayload.status = data.status;
      
      if (data.is_featured !== undefined) {
        updatePayload.is_featured = data.is_featured;
      }
      if (data.is_trending !== undefined) {
        updatePayload.is_trending = data.is_trending;
      }

      return this.makeRequest(`/stories/stories/${id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatePayload),
      });
    }
  }

  // Delete story
  async deleteStory(id: string): Promise<void> {
    await this.makeRequest(`/stories/stories/${id}/`, {
      method: 'DELETE',
    });
  }

  // Story interactions (like, bookmark, reading progress)
  async interactWithStory(
    id: string, 
    interactionType: 'like' | 'bookmark' | 'read',
    data?: { reading_progress?: number; last_page_read?: number }
  ): Promise<{ message: string; interaction?: unknown }> {
    const requestBody = {
      interaction_type: interactionType,
      ...data,
    };
    
    return this.makeRequest(`/stories/stories/${id}/interact/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
  }

  // Track story view
  async trackStoryView(
    id: string,
    data: { time_spent?: number; pages_viewed?: number[] }
  ): Promise<void> {
    await this.makeRequest(`/stories/track-view/${id}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  }

  // Get story categories
  async getCategories(): Promise<Array<{ value: string; label: string }>> {
    return this.makeRequest('/stories/categories/');
  }

  // Get story statistics
  async getStats(): Promise<{
    total_stories: number;
    published_stories: number;
    draft_stories: number;
    total_reads: number;
    total_likes: number;
    avg_read_time: number;
    trending_stories: StoryListItem[];
    featured_stories: StoryListItem[];
    recent_stories: StoryListItem[];
  }> {
    return this.makeRequest('/stories/stats/');
  }

  // Debug method to check token validity
  async validateToken(): Promise<{ valid: boolean; message: string }> {
    const token = unifiedAuth.getAccessToken();
    
    if (!token) {
      return { valid: false, message: 'No token found' };
    }

    try {
      // Try a simple authenticated request
      const response = await fetch(`${API_BASE_URL}/stories/my_stories/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        return { valid: true, message: 'Token is valid' };
      } else {
        const errorData = await response.json().catch(() => ({}));
        return { 
          valid: false, 
          message: `Token invalid: ${response.status} - ${errorData.detail || response.statusText}` 
        };
      }
    } catch (error) {
      return { 
        valid: false, 
        message: `Token validation error: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }
}

// Debug utility - can be called from browser console
if (typeof window !== 'undefined') {
  (window as unknown as { debugStoryAuth: () => Promise<{ valid: boolean; message: string }> }).debugStoryAuth = async () => {
    const service = new StoryService();
    const result = await service.validateToken();
    return result;
  };
}

export const storyService = new StoryService();
export default storyService;
