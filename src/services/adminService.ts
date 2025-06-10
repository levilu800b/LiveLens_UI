// src/services/adminService.ts
import { apiService, handleApiError } from './api';
import type { AdminStats, User, ContentItem, PaginatedResponse } from '../types';

export interface AdminUser extends User {
  lastLogin?: string;
  isActive: boolean;
  joinedAt: string;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
}

export interface ContentAnalytics {
  id: string;
  contentType: string;
  contentId: string;
  title: string;
  viewsCount: number;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  performanceScore: number;
  trendingScore: number;
  date: string;
}

export interface SystemAlert {
  id: string;
  title: string;
  message: string;
  alertType: 'info' | 'warning' | 'error' | 'success';
  category: string;
  isRead: boolean;
  createdAt: string;
}

export interface DashboardOverview {
  stats: AdminStats;
  trendingContent: ContentItem[];
  recentUsers: AdminUser[];
  systemAlerts: SystemAlert[];
  chartData: {
    userGrowth: Array<{ date: string; users: number }>;
    contentViews: Array<{ date: string; views: number }>;
    engagement: Array<{ type: string; count: number }>;
  };
}

class AdminService {
  // Dashboard Overview
  async getDashboardOverview(): Promise<DashboardOverview> {
    try {
      const response = await apiService.get<DashboardOverview>('/admin-dashboard/overview/');
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getDashboardStats(): Promise<AdminStats> {
    try {
      const response = await apiService.get<AdminStats>('/admin-dashboard/stats/');
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // User Management
  async getUsers(filters?: {
    search?: string;
    isActive?: boolean;
    isAdmin?: boolean;
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedResponse<AdminUser>> {
    try {
      const params = this.buildParams(filters);
      const response = await apiService.get<PaginatedResponse<AdminUser>>(`/admin-dashboard/users/${params}`);
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getUser(userId: string): Promise<AdminUser> {
    try {
      const response = await apiService.get<AdminUser>(`/admin-dashboard/users/${userId}/`);
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async updateUser(userId: string, data: Partial<AdminUser>): Promise<AdminUser> {
    try {
      const response = await apiService.patch<AdminUser>(`/admin-dashboard/users/${userId}/`, data);
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      await apiService.delete(`/admin-dashboard/users/${userId}/`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async makeUserAdmin(userId: string): Promise<AdminUser> {
    try {
      const response = await apiService.post<AdminUser>(`/admin-dashboard/users/${userId}/make-admin/`);
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async revokeAdminAccess(userId: string): Promise<AdminUser> {
    try {
      const response = await apiService.post<AdminUser>(`/admin-dashboard/users/${userId}/revoke-admin/`);
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // Content Management
  async getAllContent(filters?: {
    contentType?: string;
    status?: string;
    search?: string;
    sortBy?: string;
    page?: number;
  }): Promise<PaginatedResponse<ContentItem>> {
    try {
      const params = this.buildParams(filters);
      const response = await apiService.get<PaginatedResponse<ContentItem>>(`/admin-dashboard/content/${params}`);
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async updateContentStatus(contentType: string, contentId: string, status: string): Promise<ContentItem> {
    try {
      const response = await apiService.patch<ContentItem>(`/admin-dashboard/content/${contentType}/${contentId}/`, {
        status
      });
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async deleteContent(contentType: string, contentId: string): Promise<void> {
    try {
      await apiService.delete(`/admin-dashboard/content/${contentType}/${contentId}/`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async featureContent(contentType: string, contentId: string, featured: boolean): Promise<ContentItem> {
    try {
      const response = await apiService.patch<ContentItem>(`/admin-dashboard/content/${contentType}/${contentId}/`, {
        is_featured: featured
      });
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // Analytics
  async getContentAnalytics(filters?: {
    contentType?: string;
    dateRange?: { start: string; end: string };
    sortBy?: string;
  }): Promise<ContentAnalytics[]> {
    try {
      const params = this.buildParams(filters);
      const response = await apiService.get<ContentAnalytics[]>(`/admin-dashboard/analytics/${params}`);
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getTrendingContent(timeframe: '24h' | '7d' | '30d' = '7d'): Promise<ContentItem[]> {
    try {
      const response = await apiService.get<ContentItem[]>(`/admin-dashboard/trending/?timeframe=${timeframe}`);
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getMostLikedContent(timeframe: '24h' | '7d' | '30d' = '7d'): Promise<ContentItem[]> {
    try {
      const response = await apiService.get<ContentItem[]>(`/admin-dashboard/most-liked/?timeframe=${timeframe}`);
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getMostViewedContent(timeframe: '24h' | '7d' | '30d' = '7d'): Promise<ContentItem[]> {
    try {
      const response = await apiService.get<ContentItem[]>(`/admin-dashboard/most-viewed/?timeframe=${timeframe}`);
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getMostCommentedContent(timeframe: '24h' | '7d' | '30d' = '7d'): Promise<ContentItem[]> {
    try {
      const response = await apiService.get<ContentItem[]>(`/admin-dashboard/most-commented/?timeframe=${timeframe}`);
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // Comments Management
  async getComments(filters?: {
    contentType?: string;
    contentId?: string;
    flagged?: boolean;
    page?: number;
  }): Promise<any> {
    try {
      const params = this.buildParams(filters);
      const response = await apiService.get(`/admin-dashboard/comments/${params}`);
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async deleteComment(commentId: string): Promise<void> {
    try {
      await apiService.delete(`/admin-dashboard/comments/${commentId}/`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async moderateComment(commentId: string, action: 'approve' | 'flag' | 'delete'): Promise<void> {
    try {
      await apiService.post(`/admin-dashboard/comments/${commentId}/moderate/`, { action });
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // System Alerts
  async getSystemAlerts(): Promise<SystemAlert[]> {
    try {
      const response = await apiService.get<SystemAlert[]>('/admin-dashboard/alerts/');
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async markAlertAsRead(alertId: string): Promise<void> {
    try {
      await apiService.patch(`/admin-dashboard/alerts/${alertId}/`, { is_read: true });
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async dismissAlert(alertId: string): Promise<void> {
    try {
      await apiService.delete(`/admin-dashboard/alerts/${alertId}/`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // Reports
  async generateReport(reportType: string, filters?: any): Promise<{ taskId: string }> {
    try {
      const response = await apiService.post(`/admin-dashboard/reports/generate/`, {
        report_type: reportType,
        filters
      });
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getReportStatus(taskId: string): Promise<any> {
    try {
      const response = await apiService.get(`/admin-dashboard/reports/status/${taskId}/`);
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async downloadReport(reportId: string): Promise<Blob> {
    try {
      const response = await apiService.get(`/admin-dashboard/reports/download/${reportId}/`, {
        responseType: 'blob'
      });
      return response as unknown as Blob;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // AI Features
  async generateAIStory(prompt: string): Promise<{ content: string; id: string }> {
    try {
      const response = await apiService.post('/admin-dashboard/ai/generate-story/', { prompt });
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async generateAIAnimation(prompt: string): Promise<{ videoUrl: string; id: string }> {
    try {
      const response = await apiService.post('/admin-dashboard/ai/generate-animation/', { prompt });
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async generateDailyAIPost(): Promise<{ content: string; type: string }> {
    try {
      const response = await apiService.post('/admin-dashboard/ai/generate-daily-post/');
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // System Health
  async getSystemHealth(): Promise<any> {
    try {
      const response = await apiService.get('/admin-dashboard/system-health/');
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async runSystemCheck(): Promise<any> {
    try {
      const response = await apiService.post('/admin-dashboard/system-check/');
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // Helper methods
  private buildParams(filters?: any): string {
    if (!filters) return '';

    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (typeof value === 'object' && value.start && value.end) {
          // Handle date range
          params.append(`${key}_start`, value.start);
          params.append(`${key}_end`, value.end);
        } else {
          params.append(key, String(value));
        }
      }
    });

    return params.toString() ? `?${params.toString()}` : '';
  }
}

export const adminService = new AdminService();