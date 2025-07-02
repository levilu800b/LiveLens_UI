// src/services/commentService.ts
import unifiedAuth from '../utils/unifiedAuth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export interface Comment {
  id: string;
  user: {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    avatar?: string;
  };
  content_type: string;
  object_id: string;
  text: string;
  parent?: string;
  status: 'published' | 'pending' | 'hidden' | 'deleted';
  like_count: number;
  dislike_count: number;
  reply_count: number;
  is_edited: boolean;
  edited_at?: string;
  is_flagged: boolean;
  created_at: string;
  updated_at: string;
  replies?: Comment[];
  user_interaction?: {
    liked: boolean;
    disliked: boolean;
  };
}

export interface CreateCommentData {
  content_type: string; // e.g., 'stories.story'
  object_id: string;
  text: string;
  parent?: string;
}

export interface CommentFilters {
  content_type?: string;
  object_id?: string;
  status?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}

class CommentService {
  private getAuthHeaders() {
    const token = unifiedAuth.getAccessToken();
    return {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    };
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}/comments${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Get comments for content
  async getComments(filters: CommentFilters = {}): Promise<{
    count: number;
    next: string | null;
    previous: string | null;
    results: Comment[];
  }> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    return this.makeRequest(`/${queryString ? `?${queryString}` : ''}`);
  }

  // Get comments for a specific story
  async getStoryComments(storyId: string, page = 1, pageSize = 20): Promise<{
    count: number;
    next: string | null;
    previous: string | null;
    results: Comment[];
  }> {
    return this.getComments({
      content_type: 'stories.story',
      object_id: storyId,
      page,
      page_size: pageSize,
      ordering: '-created_at',
    });
  }

  // Get single comment
  async getComment(id: string): Promise<Comment> {
    return this.makeRequest(`/${id}/`);
  }

  // Create comment
  async createComment(data: CreateCommentData): Promise<Comment> {
    return this.makeRequest('/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Create story comment
  async createStoryComment(storyId: string, text: string, parentId?: string): Promise<Comment> {
    return this.createComment({
      content_type: 'stories.story',
      object_id: storyId,
      text,
      parent: parentId,
    });
  }

  // Update comment
  async updateComment(id: string, text: string): Promise<Comment> {
    return this.makeRequest(`/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify({ text }),
    });
  }

  // Delete comment
  async deleteComment(id: string): Promise<void> {
    await this.makeRequest(`/${id}/`, {
      method: 'DELETE',
    });
  }

  // Like/unlike comment
  async interactWithComment(
    commentId: string, 
    action: 'like' | 'dislike' | 'flag'
  ): Promise<{ message: string; count?: number }> {
    return this.makeRequest(`/${commentId}/interact/`, {
      method: 'POST',
      body: JSON.stringify({ action }),
    });
  }

  // Get user's comments
  async getMyComments(page = 1, pageSize = 20): Promise<{
    count: number;
    next: string | null;
    previous: string | null;
    results: Comment[];
  }> {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    });

    return this.makeRequest(`/my-comments/?${params.toString()}`);
  }

  // Get comment notifications
  async getNotifications(): Promise<{
    unread_count: number;
    notifications: Array<{
      id: string;
      type: string;
      message: string;
      comment: Comment;
      is_read: boolean;
      created_at: string;
    }>;
  }> {
    return this.makeRequest('/notifications/');
  }

  // Mark notification as read
  async markNotificationRead(notificationId: string): Promise<void> {
    await this.makeRequest(`/notifications/${notificationId}/read/`, {
      method: 'POST',
    });
  }

  // Get comment statistics
  async getStats(): Promise<{
    total_comments: number;
    comments_today: number;
    top_commented_stories: Array<{
      story_id: string;
      story_title: string;
      comment_count: number;
    }>;
    recent_comments: Comment[];
  }> {
    return this.makeRequest('/stats/');
  }
}

export const commentService = new CommentService();
export default commentService;
