// src/types/index.ts

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  isAdmin: boolean;
  isVerified: boolean;
  phoneNumber?: string;
  gender?: 'Male' | 'Female';
  country?: string;
  dateOfBirth?: string;
  createdAt: string;
  lastLogin?: string;
}

export interface UserState {
  userInfo: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
  message: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  first_name: string;
  last_name: string;
  username?: string;
  email: string;
  password: string;
  password_confirm: string;
}

export interface Content {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  type: 'story' | 'film' | 'content' | 'podcast' | 'animation' | 'sneak-peek';
  tags: string[];
  views: number;
  likes: number;
  releaseDate: string;
  category?: string;
  isTrending?: boolean;
  isFeatured?: boolean;
  slug?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Story extends Content {
  type: 'story';
  excerpt: string;
  content: string;
  readTime: string;
  author: string;
}

export interface Film extends Content {
  type: 'film';
  director: string;
  cast?: string[];
  genre: string;
  rating?: string;
  trailerUrl?: string;
  videoUrl: string;
}

export interface ContentItem extends Content {
  type: 'content';
  videoUrl: string;
  trailerUrl?: string;
}

export interface Podcast extends Content {
  type: 'podcast';
  host: string;
  guests?: string[];
  audioUrl?: string;
  videoUrl?: string;
  episodeNumber?: number;
  season?: number;
}

export interface Animation extends Content {
  type: 'animation';
  style: '2D' | '3D' | 'Mixed';
  complexity: 'Beginner' | 'Intermediate' | 'Advanced';
  animationType: string;
  videoUrl: string;
}

export interface SneakPeek extends Content {
  type: 'sneak-peek';
  crew: string;
  videoUrl: string;
}

export interface ContentState {
  items: Content[];
  featuredContent: Content[];
  trendingContent: Content[];
  currentContent: Content | null;
  isLoading: boolean;
  error: string | null;
  filters: {
    query: string;
    type: string;
    tags: string[];
    sortBy: 'newest' | 'oldest' | 'popular' | 'trending';
  };
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
  };
}

export interface AdminStats {
  totalUsers: number;
  totalContent: number;
  totalStories: number;
  totalFilms: number;
  totalPodcasts: number;
  totalAnimations: number;
  totalSneakPeeks: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  trendingContent: Content[];
  mostLiked: Content[];
  mostViewed: Content[];
  mostCommented: Content[];
  recentUsers: User[];
}

export interface AdminState {
  stats: AdminStats | null;
  isLoading: boolean;
  error: string | null;
}

export interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  onClose: () => void;
}

export interface UIState {
  isSidebarOpen: boolean;
  theme: 'light' | 'dark';
  notifications: ToastProps[];
  modals: Record<string, boolean>;
}

export interface Comment {
  id: string;
  user: User;
  content: string;
  createdAt: string;
  updatedAt: string;
  parentId?: string;
  replies?: Comment[];
  likes: number;
  isLiked: boolean;
}

export interface CommentState {
  comments: Comment[];
  isLoading: boolean;
  error: string | null;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    marketing: boolean;
  };
  privacy: {
    showProfile: boolean;
    showActivity: boolean;
  };
  autoplay: boolean;
  quality: 'auto' | '720p' | '1080p' | '4k';
}

export interface UserActivity {
  id: string;
  type: 'view' | 'like' | 'comment' | 'share';
  contentId: string;
  contentType: string;
  timestamp: string;
  duration?: number;
}

export interface SearchFilters {
  query?: string;
  type?: string;
  tags?: string[];
  category?: string;
  sortBy?: 'newest' | 'oldest' | 'popular' | 'trending';
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface APIResponse<T> {
  data: T;
  message?: string;
  success: boolean;
  pagination?: PaginationInfo;
}

export interface ErrorResponse {
  error: string;
  details?: any;
  field_errors?: Record<string, string[]>;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface FileUpload {
  file: File;
  progress: UploadProgress;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  url?: string;
  error?: string;
}

// Form types
export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface NewsletterFormData {
  email: string;
}

export interface FeedbackFormData {
  type: 'bug' | 'feature' | 'general';
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
}

// AI-related types
export interface AIPrompt {
  id: string;
  type: 'story' | 'animation' | 'subtitle' | 'voice';
  prompt: string;
  response?: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  createdAt: string;
  updatedAt: string;
}

export interface AISettings {
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt?: string;
}

export interface VoiceSettings {
  voice: string;
  speed: number;
  pitch: number;
  volume: number;
  language: string;
}

// Route types
export interface RouteParams {
  id?: string;
  type?: string;
  slug?: string;
}

export interface LocationState {
  from?: Location;
  email?: string;
  firstName?: string;
  lastName?: string;
}

// Media player types
export interface PlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isFullscreen: boolean;
  quality: string;
  playbackRate: number;
  subtitles: boolean;
  subtitleTrack?: string;
}

export interface VideoSource {
  url: string;
  quality: string;
  type: string;
}

export interface SubtitleTrack {
  id: string;
  language: string;
  label: string;
  url: string;
  default?: boolean;
}