// src/services/liveVideoService.ts
import unifiedAuth from '../utils/unifiedAuth';

export interface LiveVideo {
  id: string;
  slug: string;
  title: string;
  description: string;
  thumbnail?: string;
  is_live: boolean;
  live_status?: string;
  viewer_count?: number;
  current_viewers?: number;
  created_at: string;
  start_time?: string;
  scheduled_start_time?: string;
  author?: {
    username: string;
    first_name: string;
    last_name: string;
  };
}

export interface CreateLiveVideoData {
  title: string;
  description: string;
  thumbnail?: File | null;
  videoFile?: File | null; // For upload mode
  mode?: 'live' | 'upload';
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Demo mode - set to true to use localStorage for testing
const DEMO_MODE = import.meta.env.VITE_LIVE_VIDEO_DEMO === 'true' || false; // Disable demo by default

class LiveVideoService {
  private getAuthHeaders(includeContentType: boolean = true) {
    const token = unifiedAuth.getAccessToken();
    const headers: Record<string, string> = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    if (includeContentType) {
      headers['Content-Type'] = 'application/json';
    }
    
    return headers;
  }

  async createLiveVideo(data: CreateLiveVideoData): Promise<LiveVideo> {
    // Check authentication first
    const token = unifiedAuth.getAccessToken();
    if (!token) {
      throw new Error('You must be logged in to create a live video');
    }

    // Demo mode for testing UI without backend
    if (DEMO_MODE) {
      const demoVideo: LiveVideo = {
        id: Date.now().toString(),
        slug: `demo-video-${Date.now()}`,
        title: data.title,
        description: data.description,
        thumbnail: data.thumbnail ? URL.createObjectURL(data.thumbnail) : undefined,
        is_live: true,
        live_status: 'live',
        viewer_count: Math.floor(Math.random() * 50) + 1,
        current_viewers: Math.floor(Math.random() * 50) + 1,
        created_at: new Date().toISOString(),
        start_time: new Date().toISOString(),
        scheduled_start_time: new Date().toISOString(),
        author: {
          username: 'demo_user',
          first_name: 'Demo',
          last_name: 'User'
        }
      };
      
      // Store in localStorage for demo
      localStorage.setItem('currentLiveVideo', JSON.stringify(demoVideo));
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return demoVideo;
    }

    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    
    // Handle upload mode vs live mode
    if (data.mode === 'upload' && data.videoFile) {
      // For uploaded videos, set them as ready to play
      formData.append('video_file', data.videoFile);
      formData.append('live_status', 'live'); // Make uploaded videos appear as "live" content
      // Set immediate availability for uploads
      const now = new Date();
      formData.append('scheduled_start_time', now.toISOString());
    } else {
      // For live videos, schedule for immediate start
      const now = new Date();
      const startTime = new Date(now.getTime() + 5000); // 5 seconds from now
      const endTime = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours from now
      formData.append('scheduled_start_time', startTime.toISOString());
      formData.append('scheduled_end_time', endTime.toISOString());
    }
    
    if (data.thumbnail) {
      formData.append('thumbnail', data.thumbnail);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/live-video/live-videos/`, {
        method: 'POST',
        headers: this.getAuthHeaders(false), // Don't include Content-Type for FormData
        body: formData,
      });

      if (response.status === 401) {
        throw new Error('You must be logged in to create a live video. Please sign in and try again.');
      }

      if (response.status === 404) {
        throw new Error('Live video feature is not yet available on the backend. Please contact your administrator to implement the live video API endpoints.');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.detail || 'Failed to create live video');
      }

      const liveVideo = await response.json();
      console.log('Created live video response:', liveVideo); // Debug log
      
      // Check if we have a slug to start the stream
      if (!liveVideo.slug && !liveVideo.id) {
        console.error('No slug or id in response:', liveVideo);
        throw new Error('Live video created but missing identification field');
      }
      
      // Only try to start live stream for actual live videos (not uploads)
      if (data.mode !== 'upload') {
        // Immediately start the live video using slug or id as fallback
        const identifier = liveVideo.slug || liveVideo.id;
        await this.startLiveVideo(identifier);
      }
      
      // Return the video with updated status
      return { ...liveVideo, live_status: 'live', is_live: true };
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Unable to connect to the backend server. Please check your connection and try again.');
      }
      throw error;
    }
  }

  async startLiveVideo(identifier: string): Promise<void> {
    const url = `${API_BASE_URL}/live-video/live-videos/${identifier}/start_stream/`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.detail || 'Failed to start live video');
    }
  }

  async getCurrentLiveVideo(): Promise<LiveVideo | null> {
    // Demo mode for testing UI without backend
    if (DEMO_MODE) {
      const storedVideo = localStorage.getItem('currentLiveVideo');
      if (storedVideo) {
        try {
          const video = JSON.parse(storedVideo);
          // Check if video is still "live" (demo videos expire after 30 minutes)
          const startTime = new Date(video.start_time);
          const now = new Date();
          const diffMinutes = (now.getTime() - startTime.getTime()) / (1000 * 60);
          
          if (diffMinutes < 30) {
            // Update viewer count for demo
            video.viewer_count = Math.floor(Math.random() * 100) + 10;
            video.current_viewers = video.viewer_count;
            return video;
          } else {
            // Demo video expired
            localStorage.removeItem('currentLiveVideo');
            return null;
          }
        } catch {
          localStorage.removeItem('currentLiveVideo');
          return null;
        }
      }
      return null;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/live-video/live-videos/hero_live/`, {
        method: 'GET',
      });

      if (response.status === 404) {
        // Either no live video or endpoints not implemented
        return null;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch current live video');
      }

      return response.json();
    } catch (error) {
      // Silently handle connection errors and 404s
      if (error instanceof TypeError && error.message.includes('fetch')) {
        // Network error - endpoints probably don't exist
        return null;
      }
      return null; // Return null on any error to avoid breaking the UI
    }
  }

  async endLiveVideo(id: string): Promise<void> {
    // Demo mode for testing UI without backend
    if (DEMO_MODE) {
      const storedVideo = localStorage.getItem('currentLiveVideo');
      if (storedVideo) {
        try {
          const video = JSON.parse(storedVideo);
          if (video.id === id) {
            localStorage.removeItem('currentLiveVideo');
          }
        } catch {
          localStorage.removeItem('currentLiveVideo');
        }
      }
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return;
    }

    const response = await fetch(`${API_BASE_URL}/live-video/live-videos/${id}/end/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.detail || 'Failed to end live video');
    }
  }
}

export default new LiveVideoService();
