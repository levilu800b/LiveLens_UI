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
    avatar_url?: string;
    is_admin?: boolean;
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
  time_since?: string;
  thread_level?: number;
  can_edit?: boolean;
  can_delete?: boolean;
}

export interface CreateCommentData {
  content_type_name: string; // e.g., 'story'
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

// Enhanced Comment interface for moderation
export interface ModerationComment extends Comment {
  moderated_by?: {
    username: string;
  };
  moderated_at?: string;
  moderation_reason?: string;
  content_title: string;
  report_count: number;
  flagged_by_users?: Array<{
    id: string;
    username: string;
  }>;
  moderation_history?: Array<{
    action: string;
    moderator?: string;
    reason: string;
    old_status: string;
    new_status: string;
    created_at: string;
  }>;
  risk_score: number;
}

export interface CommentModerationStats {
  total_comments: number;
  published_comments: number;
  pending_comments: number;
  hidden_comments: number;
  deleted_comments: number;
  flagged_comments: number;
  recent_reports: number;
  moderation_actions_today: number;
  top_moderators: Array<{
    moderator__username: string;
    action_count: number;
  }>;
  actions_by_type: Array<{
    action: string;
    count: number;
  }>;
}

export interface BulkModerationData {
  comment_ids: string[];
  action: 'approve' | 'hide' | 'delete' | 'flag' | 'unflag';
  reason?: string;
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
      console.error('CommentService API Error:', {
        endpoint: url,
        status: response.status,
        error: errorData
      });
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
      content_type: 'story',
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
      content_type_name: 'story',
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
    action: 'like' | 'dislike' | 'report'
  ): Promise<{ message: string; action: string }> {
    return this.makeRequest(`/${commentId}/interact/`, {
      method: 'POST',
      body: JSON.stringify({ interaction_type: action }),
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

  // === MODERATION METHODS ===

  // Get comments for moderation
  async getModerationComments(filters: {
    status?: string;
    flagged?: boolean;
    content_type?: string;
    search?: string;
    page?: number;
    page_size?: number;
  } = {}): Promise<{
    results: ModerationComment[];
    count: number;
    next?: string;
    previous?: string;
  }> {
    const params = new URLSearchParams();
    
    if (filters.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters.flagged) params.append('flagged', 'true');
    if (filters.content_type) params.append('content_type', filters.content_type);
    if (filters.search) params.append('search', filters.search);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.page_size) params.append('page_size', filters.page_size.toString());

    return this.makeRequest(`/moderation/?${params.toString()}`);
  }

  // Get moderation statistics
  async getModerationStats(days: number = 30): Promise<CommentModerationStats> {
    return this.makeRequest(`/moderation/stats/?days=${days}`);
  }

  // Bulk moderate comments
  async bulkModerateComments(data: BulkModerationData): Promise<{
    message: string;
    moderated_count: number;
  }> {
    return this.makeRequest('/moderation/bulk/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  }

  // Auto-moderate comments
  async autoModerateComments(): Promise<{
    message: string;
    flagged_count: number;
  }> {
    return this.makeRequest('/moderation/auto/', {
      method: 'POST',
    });
  }

  // Moderate individual comment
  async moderateComment(
    commentId: string, 
    action: 'approve' | 'hide' | 'delete', 
    reason?: string
  ): Promise<{
    message: string;
    comment: ModerationComment;
  }> {
    return this.makeRequest(`/${commentId}/moderate/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action, reason }),
    });
  }

  // Hard delete comment (permanent)
  async hardDeleteComment(
    commentId: string, 
    reason: string
  ): Promise<{
    message: string;
    deleted_comment: {
      id: string;
      user: string;
      text: string;
    };
  }> {
    return this.makeRequest(`/${commentId}/hard-delete/`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason }),
    });
  }
}

export const commentService = new CommentService();
export default commentService;
