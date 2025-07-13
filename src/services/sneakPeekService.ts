// src/services/sneakPeekService.ts
import type { ContentItem } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL;

interface Author {
  id: string;
  username: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  avatar?: string;
}

// Backend sneak peek response types
interface BackendSneakPeek {
  id: string;
  slug?: string;
  title: string;
  description?: string;
  summary?: string;
  short_description?: string;
  cover_image?: string;
  thumbnail?: string;
  thumbnail_url?: string;
  duration?: number; // seconds for video content
  video_quality?: '480p' | '720p' | '1080p' | '4K';
  content_rating?: 'G' | 'PG' | 'PG-13' | 'R' | 'NC-17';
  release_date?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  related_content_type?: string;
  related_content_id?: string;
  view_count?: number;
  like_count?: number;
  is_featured?: boolean;
  is_trending?: boolean;
  published_at?: string;
  created_at: string;
  category?: string;
  author?: Author;
  video_file?: string;
  video_file_url?: string;
  poster?: string;
  poster_url?: string;
  content_type?: 'video' | 'image' | 'text';
  is_explicit?: boolean;
  is_premium?: boolean;
  average_rating?: number;
  rating_count?: number;
  is_liked?: boolean;
  is_bookmarked?: boolean;
  user_rating?: number;
  user_interaction?: string[]; // Array of interaction types like ['like', 'favorite']
  tags?: string[] | string;
  tags_list?: string[];
  status?: 'draft' | 'published' | 'archived';
  upcoming_content_type?: string;
  upcoming_content_title?: string;
  upcoming_release_date?: string;
}

// Frontend sneak peek types
export interface SneakPeek extends Omit<ContentItem, 'duration'> {
  slug?: string;
  summary?: string;
  short_description?: string;
  duration?: number; // Optional for sneak peeks
  video_quality?: '480p' | '720p' | '1080p' | '4K';
  content_rating?: 'G' | 'PG' | 'PG-13' | 'R' | 'NC-17';
  release_date?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  related_content_type?: string;
  related_content_id?: string;
  upcoming_content_type?: string;
  upcoming_content_title?: string;
  upcoming_release_date?: string;
  video_file?: string;
  poster?: string;
  is_trending?: boolean;
  is_premium?: boolean;
  is_explicit?: boolean;
  status?: 'draft' | 'published' | 'archived';
}

export interface SneakPeekFormData {
  title: string;
  description: string;
  summary?: string;
  short_description?: string;
  category: string;
  tags: string[];
  upcoming_content_type?: string;
  upcoming_content_title?: string;
  upcoming_release_date?: string;
  duration?: number;
  video_quality?: '480p' | '720p' | '1080p' | '4K';
  content_rating?: 'G' | 'PG' | 'PG-13' | 'R' | 'NC-17';
  release_date?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  related_content_type?: string;
  related_content_id?: string;
  is_featured: boolean;
  is_trending?: boolean;
  is_premium: boolean;
  is_explicit: boolean;
  status: 'draft' | 'published' | 'archived';
  cover_image?: File | string;
  thumbnail?: File | string;
  poster?: File | string;
  video_file?: File | string;
  image_file?: File | string;
}

// Transform backend data to frontend format
const transformSneakPeek = (backendSneakPeek: BackendSneakPeek): SneakPeek => {
  // Helper function to build full URL for media
  const buildMediaUrl = (mediaPath: string | undefined): string | undefined => {
    if (!mediaPath) return undefined;
    if (mediaPath.startsWith('http')) return mediaPath;
    return `${BACKEND_BASE_URL}${mediaPath}`;
  };

  return {
    id: backendSneakPeek.id,
    slug: backendSneakPeek.slug,
    title: backendSneakPeek.title,
    description: backendSneakPeek.description || backendSneakPeek.short_description || backendSneakPeek.summary || '',
    summary: backendSneakPeek.summary,
    short_description: backendSneakPeek.short_description,
    type: 'sneak-peek',
    thumbnail: buildMediaUrl(backendSneakPeek.thumbnail_url || backendSneakPeek.cover_image || backendSneakPeek.thumbnail),
    views: backendSneakPeek.view_count || 0,
    likes: backendSneakPeek.like_count || 0,
    createdAt: backendSneakPeek.created_at,
    tags: (() => {
      // Handle different tag formats from backend
      if (backendSneakPeek.tags_list && Array.isArray(backendSneakPeek.tags_list)) {
        // Fix the broken JSON format in tags_list
        return backendSneakPeek.tags_list.map(tag => {
          if (typeof tag === 'string') {
            // Handle cases like "[\"games\"" or "\"night\"" or "\"studio\"]"
            let cleanTag = tag.trim();
            
            // Remove leading [ or trailing ]
            cleanTag = cleanTag.replace(/^\[/, '').replace(/\]$/, '');
            
            // Remove surrounding quotes
            cleanTag = cleanTag.replace(/^"/, '').replace(/"$/, '');
            
            return cleanTag;
          }
          return tag;
        }).filter(tag => tag && tag.length > 0);
      }
      
      if (backendSneakPeek.tags) {
        // If tags is a string, try to parse it
        if (typeof backendSneakPeek.tags === 'string') {
          try {
            // First, try to parse as JSON
            const parsed = JSON.parse(backendSneakPeek.tags);
            if (Array.isArray(parsed)) {
              return parsed.map(tag => {
                // Handle nested stringified tags
                if (typeof tag === 'string' && tag.startsWith('"') && tag.endsWith('"')) {
                  return tag.slice(1, -1); // Remove outer quotes
                }
                return tag;
              });
            }
            return [parsed];
          } catch {
            // If JSON parsing fails, treat as comma-separated string
            return backendSneakPeek.tags.split(',').map((tag: string) => tag.trim());
          }
        }
        
        // If tags is already an array
        if (Array.isArray(backendSneakPeek.tags)) {
          return backendSneakPeek.tags.map(tag => {
            // Handle nested stringified tags
            if (typeof tag === 'string' && tag.startsWith('"') && tag.endsWith('"')) {
              return tag.slice(1, -1); // Remove outer quotes
            }
            return tag;
          });
        }
      }
      
      return [];
    })(),
    isBookmarked: (backendSneakPeek.user_interaction || []).includes('favorite'),
    isFavorited: (backendSneakPeek.user_interaction || []).includes('like'),
    author: backendSneakPeek.author ? {
      id: backendSneakPeek.author.id,
      name: backendSneakPeek.author.full_name || backendSneakPeek.author.username || 'Unknown Author',
      avatar: backendSneakPeek.author.avatar
    } : undefined,
    category: backendSneakPeek.category,
    status: backendSneakPeek.status,
    publishedAt: backendSneakPeek.published_at,
    featuredAt: backendSneakPeek.is_featured ? backendSneakPeek.created_at : undefined,
    duration: backendSneakPeek.duration,
    video_quality: backendSneakPeek.video_quality,
    content_rating: backendSneakPeek.content_rating,
    release_date: backendSneakPeek.release_date,
    meta_title: backendSneakPeek.meta_title,
    meta_description: backendSneakPeek.meta_description,
    meta_keywords: backendSneakPeek.meta_keywords,
    related_content_type: backendSneakPeek.related_content_type,
    related_content_id: backendSneakPeek.related_content_id,
    video_file: buildMediaUrl(backendSneakPeek.video_file_url),
    poster: buildMediaUrl(backendSneakPeek.poster_url),
    is_trending: backendSneakPeek.is_trending,
    is_premium: backendSneakPeek.is_premium,
    is_explicit: backendSneakPeek.is_explicit,
    upcoming_content_type: backendSneakPeek.upcoming_content_type,
    upcoming_content_title: backendSneakPeek.upcoming_content_title,
    upcoming_release_date: backendSneakPeek.upcoming_release_date,
  };
};

const sneakPeekService = {
  // Get all sneak peeks with filters
  getSneakPeeks: async (params: {
    page?: number;
    page_size?: number;
    category?: string;
    search?: string;
    featured?: boolean;
    ordering?: string;
    _refresh?: number; // Cache busting parameter
  } = {}): Promise<{
    sneakPeeks: SneakPeek[];
    total: number;
    hasNext: boolean;
    hasPrevious: boolean;
  }> => {
    try {
      const searchParams = new URLSearchParams();
      
      if (params.page) searchParams.set('page', params.page.toString());
      if (params.category) searchParams.set('category', params.category);
      if (params.search) searchParams.set('search', params.search);
      if (params.featured !== undefined) searchParams.set('is_featured', params.featured.toString());
      if (params.ordering) searchParams.set('ordering', params.ordering);
      if (params._refresh) searchParams.set('_t', params._refresh.toString()); // Cache busting

      const queryString = searchParams.toString();
      const url = `${API_BASE_URL}/sneak-peeks/${queryString ? `?${queryString}` : ''}`;

      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        sneakPeeks: data.results.map(transformSneakPeek),
        total: data.count,
        hasNext: !!data.next,
        hasPrevious: !!data.previous,
      };
    } catch (error) {
      console.error('Error fetching sneak peeks:', error);
      throw error;
    }
  },

  // Get a single sneak peek by ID or slug
  getSneakPeek: async (idOrSlug: string, refresh = false): Promise<SneakPeek> => {
    try {
      const url = `${API_BASE_URL}/sneak-peeks/${idOrSlug}/${refresh ? `?_t=${Date.now()}` : ''}`;
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Sneak peek not found');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return transformSneakPeek(data);
    } catch (error) {
      console.error('Error fetching sneak peek:', error);
      throw error;
    }
  },

  // Create a new sneak peek
  createSneakPeek: async (sneakPeekData: SneakPeekFormData): Promise<SneakPeek> => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const formData = new FormData();
      
      // Add text fields
      formData.append('title', sneakPeekData.title);
      formData.append('description', sneakPeekData.description);
      if (sneakPeekData.summary) formData.append('summary', sneakPeekData.summary);
      formData.append('category', sneakPeekData.category);
      formData.append('status', sneakPeekData.status);
      formData.append('is_featured', sneakPeekData.is_featured.toString());
      formData.append('is_premium', sneakPeekData.is_premium.toString());
      formData.append('is_explicit', sneakPeekData.is_explicit.toString());
      
      if (sneakPeekData.upcoming_content_type) {
        formData.append('upcoming_content_type', sneakPeekData.upcoming_content_type);
      }
      if (sneakPeekData.upcoming_content_title) {
        formData.append('upcoming_content_title', sneakPeekData.upcoming_content_title);
      }
      if (sneakPeekData.upcoming_release_date) {
        formData.append('upcoming_release_date', sneakPeekData.upcoming_release_date);
      }

      // Add tags as JSON array (use tags_list for consistency with backend)
      if (sneakPeekData.tags && sneakPeekData.tags.length > 0) {
        formData.append('tags_list', JSON.stringify(sneakPeekData.tags));
      }

      // Add file uploads
      if (sneakPeekData.cover_image instanceof File) {
        formData.append('cover_image', sneakPeekData.cover_image);
      }
      if (sneakPeekData.thumbnail instanceof File) {
        formData.append('thumbnail', sneakPeekData.thumbnail);
      }
      if (sneakPeekData.video_file instanceof File) {
        formData.append('video_file', sneakPeekData.video_file);
      }
      if (sneakPeekData.image_file instanceof File) {
        formData.append('image_file', sneakPeekData.image_file);
      }

      const response = await fetch(`${API_BASE_URL}/sneak-peeks/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return transformSneakPeek(data);
    } catch (error) {
      console.error('Error creating sneak peek:', error);
      throw error;
    }
  },

  // Update an existing sneak peek
  updateSneakPeek: async (id: string, sneakPeekData: SneakPeekFormData): Promise<SneakPeek> => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const formData = new FormData();
      
      // Add text fields (only ones supported by backend)
      formData.append('title', sneakPeekData.title);
      formData.append('description', sneakPeekData.description);
      if (sneakPeekData.short_description) formData.append('short_description', sneakPeekData.short_description);
      formData.append('category', sneakPeekData.category);
      formData.append('status', sneakPeekData.status);
      formData.append('is_featured', sneakPeekData.is_featured.toString());
      formData.append('is_premium', sneakPeekData.is_premium.toString());
      
      // Add optional fields only if they have values (backend supported fields)
      if (sneakPeekData.duration !== undefined && sneakPeekData.duration !== null) {
        formData.append('duration', sneakPeekData.duration.toString());
      }
      if (sneakPeekData.video_quality) {
        formData.append('video_quality', sneakPeekData.video_quality);
      }
      if (sneakPeekData.content_rating) {
        formData.append('content_rating', sneakPeekData.content_rating);
      }
      if (sneakPeekData.release_date) {
        formData.append('release_date', sneakPeekData.release_date);
      }
      if (sneakPeekData.meta_title) {
        formData.append('meta_title', sneakPeekData.meta_title);
      }
      if (sneakPeekData.meta_description) {
        formData.append('meta_description', sneakPeekData.meta_description);
      }
      if (sneakPeekData.meta_keywords) {
        formData.append('meta_keywords', sneakPeekData.meta_keywords);
      }
      if (sneakPeekData.related_content_type) {
        formData.append('related_content_type', sneakPeekData.related_content_type);
      }
      if (sneakPeekData.related_content_id) {
        formData.append('related_content_id', sneakPeekData.related_content_id);
      }
      if (sneakPeekData.is_trending !== undefined) {
        formData.append('is_trending', sneakPeekData.is_trending.toString());
      }

      // Add tags as comma-separated string or JSON array
      if (sneakPeekData.tags && sneakPeekData.tags.length > 0) {
        // Use tags_list field for array format (preferred by backend serializer)
        formData.append('tags_list', JSON.stringify(sneakPeekData.tags));
      }

      // Add file uploads only if they are new files
      if (sneakPeekData.cover_image instanceof File) {
        formData.append('cover_image', sneakPeekData.cover_image);
      }
      if (sneakPeekData.thumbnail instanceof File) {
        formData.append('thumbnail', sneakPeekData.thumbnail);
      }
      if (sneakPeekData.poster instanceof File) {
        formData.append('poster', sneakPeekData.poster);
      }
      if (sneakPeekData.video_file instanceof File) {
        formData.append('video_file', sneakPeekData.video_file);
      }
      if (sneakPeekData.image_file instanceof File) {
        formData.append('image_file', sneakPeekData.image_file);
      }

      const response = await fetch(`${API_BASE_URL}/sneak-peeks/${id}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          console.error('Backend error details:', errorData);
          
          if (errorData.detail) {
            errorMessage = errorData.detail;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          } else if (typeof errorData === 'object') {
            // Handle field-specific validation errors
            const fieldErrors = Object.entries(errorData)
              .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
              .join('; ');
            if (fieldErrors) {
              errorMessage = `Validation errors: ${fieldErrors}`;
            }
          }
        } catch (parseError) {
          console.error('Could not parse error response:', parseError);
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return transformSneakPeek(data);
    } catch (error) {
      console.error('Error updating sneak peek:', error);
      throw error;
    }
  },

  // Delete a sneak peek
  deleteSneakPeek: async (id: string): Promise<void> => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_BASE_URL}/sneak-peeks/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting sneak peek:', error);
      throw error;
    }
  },

  // Like/unlike a sneak peek
  toggleLike: async (id: string): Promise<{ isLiked: boolean; likeCount: number }> => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_BASE_URL}/sneak-peeks/${id}/interact/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          interaction_type: 'like'
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Backend returns { "message": "Like added", "action": "added" } or { "action": "removed" }
      const isLiked = data.action === 'added';
      
      // We need to fetch the updated sneak peek to get the current like count
      // For now, we'll estimate the like count change
      return {
        isLiked,
        likeCount: 0, // We'll get this from a refetch or store it in state
      };
    } catch (error) {
      console.error('Error toggling like:', error);
      throw error;
    }
  },

  // Bookmark/unbookmark a sneak peek
  toggleBookmark: async (id: string): Promise<{ isBookmarked: boolean }> => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_BASE_URL}/sneak-peeks/${id}/interact/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          interaction_type: 'favorite'
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Backend returns { "message": "Favorite added", "action": "added" } or { "action": "removed" }
      const isBookmarked = data.action === 'added';
      
      return {
        isBookmarked,
      };
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      throw error;
    }
  },

  // Get featured sneak peeks
  getFeaturedSneakPeeks: async (): Promise<SneakPeek[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/sneak-peeks/?is_featured=true&ordering=-created_at`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.results.map(transformSneakPeek);
    } catch (error) {
      console.error('Error fetching featured sneak peeks:', error);
      throw error;
    }
  },
};

export default sneakPeekService;
