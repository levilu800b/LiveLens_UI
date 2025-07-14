// src/services/adminService.ts
import unifiedAuth from '../utils/unifiedAuth';

interface BulkActionResult<T = unknown> {
  success: boolean;
  item?: T;
  userId?: string;
  result?: unknown;
  error?: unknown;
}

export interface AdminActivity {
  id: string;
  admin: {
    username: string;
  };
  activity_type: string;
  description: string;
  timestamp: string;
}

const API_BASE_URL = 'http://localhost:8000/api';

export interface DashboardStats {
  // User Statistics
  total_users: number;
  new_users_today: number;
  active_users_today: number;
  verified_users: number;
  
  // Content Statistics
  total_stories: number;
  total_films: number;
  total_content: number;
  total_podcasts: number;
  total_animations: number;
  total_sneak_peeks: number;
  total_live_videos: number;
  total_all_content: number;
  
  // Engagement Statistics
  total_comments: number;
  total_likes: number;
  total_views: number;
  
  // Trending Content
  trending_stories: Array<{
    id: string;
    title: string;
    author__username: string;
    read_count: number;
    like_count: number;
  }>;
  
  trending_films: Array<{
    id: string;
    title: string;
    creator__username: string;
    view_count: number;
    like_count: number;
  }>;
  
  trending_podcasts: Array<{
    id: string;
    title: string;
    creator__username: string;
    play_count: number;
    like_count: number;
  }>;
  
  trending_animations: Array<{
    id: string;
    title: string;
    creator__username: string;
    view_count: number;
    like_count: number;
  }>;
  
  // Most Active Users
  most_active_users: Array<{
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    content_count: number;
  }>;
  
  // Recent Activities
  recent_activities: Array<{
    id: string;
    admin: {
      username: string;
    };
    activity_type: string;
    description: string;
    timestamp: string;
  }>;
  
  // Additional Metrics
  pending_moderation: number;
  avg_session_duration: number;
  bounce_rate: number;
  email_stats: {
    total_subscribers: number;
    verified_subscribers: number;
    emails_sent_today: number;
    failed_emails_today: number;
  };
}

export interface ContentItem {
  content_type: string;
  content_id: string;
  title: string;
  author: string;
  status: string;
  views: number;
  likes: number;
  comments: number;
  created_at: string;
  is_featured: boolean;
  is_trending: boolean;
}

export interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  is_staff: boolean;
  date_joined: string;
  last_login: string;
  is_verified: boolean;
}

export interface AdminActivity {
  id: string;
  admin: {
    username: string;
  };
  activity_type: string;
  description: string;
  timestamp: string;
  content_type?: string;
  object_id?: string;
}

export interface ModerationItem {
  id: string;
  content_type: string;
  object_id: string;
  submitted_by: {
    username: string;
  };
  status: string;
  priority: number;
  reason: string;
  submitted_at: string;
}

class AdminService {
  private getAuthHeaders() {
    const token = unifiedAuth.getAccessToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}/admin-dashboard/${endpoint}`;
    
    try {
      const headers = this.getAuthHeaders();
      
      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Try to refresh token
          const refreshed = await unifiedAuth.auth.refreshToken();
          if (refreshed) {
            // Retry with new token
            const retryResponse = await fetch(url, {
              ...options,
              headers: {
                ...this.getAuthHeaders(),
                ...options.headers,
              },
            });
            if (retryResponse.ok) {
              const data = await retryResponse.json();
              return data;
            }
          }
          throw new Error('Authentication failed');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      // If backend is not available, provide demo data for dashboard stats
      if (endpoint === 'stats/' && (error instanceof Error && (error.message?.includes('fetch') || error.message?.includes('Failed to fetch')))) {
        return this.getDemoStats() as T;
      }
      throw error;
    }
  }

  private getDemoStats(): DashboardStats {
    return {
      total_users: 1250,
      new_users_today: 23,
      active_users_today: 145,
      verified_users: 892,
      total_stories: 340,
      total_films: 125,
      total_content: 230,
      total_podcasts: 78,
      total_animations: 45,
      total_sneak_peeks: 32,
      total_live_videos: 15,
      total_all_content: 865,
      total_comments: 2456,
      total_likes: 8934,
      total_views: 34567,
      trending_stories: [
        { id: '1', title: 'Amazing Story of Innovation', author__username: 'john_writer', read_count: 1234, like_count: 89 },
        { id: '2', title: 'The Future of Technology', author__username: 'tech_guru', read_count: 987, like_count: 76 },
        { id: '3', title: 'Journey Through Space', author__username: 'space_explorer', read_count: 756, like_count: 63 },
      ],
      trending_films: [
        { id: '1', title: 'Documentary: Ocean Life', creator__username: 'filmmaker_1', view_count: 5432, like_count: 234 },
        { id: '2', title: 'Short Film: City Dreams', creator__username: 'indie_director', view_count: 3456, like_count: 189 },
      ],
      trending_podcasts: [
        { id: '1', title: 'Tech Talk Weekly', creator__username: 'podcast_host', play_count: 2345, like_count: 156 },
      ],
      trending_animations: [
        { id: '1', title: 'Animated Adventure', creator__username: 'animator_pro', view_count: 1234, like_count: 98 },
      ],
      most_active_users: [
        { id: '1', username: 'content_creator_1', first_name: 'Alice', last_name: 'Johnson', content_count: 45 },
        { id: '2', username: 'creative_writer', first_name: 'Bob', last_name: 'Smith', content_count: 38 },
        { id: '3', username: 'video_maker', first_name: 'Carol', last_name: 'Davis', content_count: 32 },
      ],
      recent_activities: [
        {
          id: '1',
          admin: { username: 'admin_user' },
          activity_type: 'content_moderation',
          description: 'Approved story: "Amazing Story of Innovation"',
          timestamp: new Date().toISOString(),
        },
        {
          id: '2',
          admin: { username: 'admin_user' },
          activity_type: 'user_management',
          description: 'Made user "content_creator_1" an admin',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
        },
      ],
      pending_moderation: 12,
      avg_session_duration: 15.5,
      bounce_rate: 25.3,
      email_stats: {
        total_subscribers: 2456,
        verified_subscribers: 2034,
        emails_sent_today: 145,
        failed_emails_today: 3,
      },
    };
  }

  // Dashboard Statistics
  async getDashboardStats(): Promise<DashboardStats> {
    return this.makeRequest<DashboardStats>('stats/');
  }

  // Content Management
  async getContentManagement(filters: {
    content_type?: string;
    status?: string;
    search?: string;
    page?: number;
    page_size?: number;
  } = {}): Promise<{
    content: ContentItem[];
    total_count: number;
    page?: number;
    page_size?: number;
    total_pages?: number;
  }> {
    const params = new URLSearchParams();
    if (filters.content_type) params.append('content_type', filters.content_type);
    if (filters.status) params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.page_size) params.append('page_size', filters.page_size.toString());
    
    const endpoint = `content/${params.toString() ? `?${params.toString()}` : ''}`;
    return this.makeRequest<{
      content: ContentItem[];
      total_count: number;
      page?: number;
      page_size?: number;
      total_pages?: number;
    }>(endpoint);
  }

  // User Management
  async getUserManagement(filters: {
    status?: string;
    search?: string;
    page?: number;
    page_size?: number;
  } = {}): Promise<{
    users: User[];
    total_count: number;
    page?: number;
    page_size?: number;
    total_pages?: number;
  }> {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.page_size) params.append('page_size', filters.page_size.toString());
    
    const endpoint = `users/${params.toString() ? `?${params.toString()}` : ''}`;
    return this.makeRequest<{
      users: User[];
      total_count: number;
      page?: number;
      page_size?: number;
      total_pages?: number;
    }>(endpoint);
  }

  // Admin Activities
  async getAdminActivities(page: number = 1, pageSize: number = 50): Promise<{
    activities: AdminActivity[];
    total_count: number;
    page: number;
    page_size: number;
    has_next: boolean;
  }> {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    });
    
    return this.makeRequest<{
      activities: AdminActivity[];
      total_count: number;
      page: number;
      page_size: number;
      has_next: boolean;
    }>(`activities/?${params.toString()}`);
  }

  // Moderation Queue
  async getModerationQueue(status: string = 'pending'): Promise<{
    queue_items: ModerationItem[];
    total_count: number;
  }> {
    const params = new URLSearchParams({
      status,
    });
    
    return this.makeRequest<{
      queue_items: ModerationItem[];
      total_count: number;
    }>(`moderation/?${params.toString()}`);
  }

  // User Actions
  async makeUserAdmin(userId: string): Promise<{ message: string; user: User }> {
    return this.makeRequest<{ message: string; user: User }>(`users/${userId}/make-admin/`, {
      method: 'POST',
    });
  }

  async removeUserAdmin(userId: string): Promise<{ message: string; user: User }> {
    return this.makeRequest<{ message: string; user: User }>(`users/${userId}/remove-admin/`, {
      method: 'POST',
    });
  }

  async deleteUser(userId: string): Promise<{ message: string }> {
    return this.makeRequest<{ message: string }>(`users/${userId}/delete/`, {
      method: 'DELETE',
    });
  }

  // Content Actions
  async deleteContent(contentType: string, contentId: string): Promise<{ message: string }> {
    return this.makeRequest<{ message: string }>(`content/${contentType}/${contentId}/delete/`, {
      method: 'DELETE',
    });
  }

  // Email Notifications
  async getEmailNotificationStats(): Promise<{
    total_subscribers: number;
    verified_subscribers: number;
    emails_sent_today: number;
    failed_emails_today: number;
    recent_notifications: Array<{
      id: string;
      notification_type: string;
      status: string;
      sent_at: string;
      recipient_count: number;
    }>;
  }> {
    return this.makeRequest<{
      total_subscribers: number;
      verified_subscribers: number;
      emails_sent_today: number;
      failed_emails_today: number;
      recent_notifications: Array<{
        id: string;
        notification_type: string;
        status: string;
        sent_at: string;
        recipient_count: number;
      }>;
    }>('notifications/stats/');
  }

  // Live Stream Management
  async startLiveStream(data: {
    title: string;
    description: string;
    scheduled_start_time: string;
  }): Promise<{ message: string; live_video_id: string }> {
    return this.makeRequest<{ message: string; live_video_id: string }>('live/start/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Bulk Actions
  async bulkDeleteContent(contentItems: { content_type: string; content_id: string }[]): Promise<{ message: string; results: BulkActionResult[] }> {
    const results: BulkActionResult[] = [];
    for (const item of contentItems) {
      try {
        const result = await this.deleteContent(item.content_type, item.content_id);
        results.push({ success: true, item, result });
      } catch (error) {
        results.push({ success: false, item, error });
      }
    }
    return { 
      message: `Bulk delete completed. ${results.filter(r => r.success).length} successful, ${results.filter(r => !r.success).length} failed.`,
      results 
    };
  }

  async bulkMakeUsersAdmin(userIds: string[]): Promise<{ message: string; results: BulkActionResult[] }> {
    const results: BulkActionResult[] = [];
    for (const userId of userIds) {
      try {
        const result = await this.makeUserAdmin(userId);
        results.push({ success: true, userId, result });
      } catch (error) {
        results.push({ success: false, userId, error });
      }
    }
    return { 
      message: `Bulk admin assignment completed. ${results.filter(r => r.success).length} successful, ${results.filter(r => !r.success).length} failed.`,
      results 
    };
  }

  async bulkDeleteUsers(userIds: string[]): Promise<{ message: string; results: BulkActionResult[] }> {
    const results: BulkActionResult[] = [];
    for (const userId of userIds) {
      try {
        const result = await this.deleteUser(userId);
        results.push({ success: true, userId, result });
      } catch (error) {
        results.push({ success: false, userId, error });
      }
    }
    return { 
      message: `Bulk user deletion completed. ${results.filter(r => r.success).length} successful, ${results.filter(r => !r.success).length} failed.`,
      results 
    };
  }
}

export default new AdminService();
