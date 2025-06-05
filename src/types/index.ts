// src/types/index.ts

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  gender?: 'Male' | 'Female';
  country?: string;
  dateOfBirth?: string;
  avatar?: string;
  isAdmin: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  userInfo: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface ContentItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail: string;
  duration: string;
  tags: string[];
  type: 'story' | 'film' | 'content' | 'podcast' | 'animation' | 'sneak-peek';
  videoUrl?: string;
  audioUrl?: string;
  contentBody?: string; // For stories
  likes: number;
  views: number;
  isLiked?: boolean;
  isFavorited?: boolean;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export interface Comment {
  id: string;
  contentId: string;
  userId: string;
  content: string;
  emoji?: string;
  likes: number;
  isLiked?: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  replies?: Comment[];
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
}

export interface TrendingContent {
  id: string;
  title: string;
  type: string;
  views: number;
  likes: number;
  comments: number;
  thumbnail: string;
}

export interface ContentFormData {
  title: string;
  slug: string;
  description: string;
  tags: string[];
  thumbnail: File | null;
  duration: string;
  videoFile?: File | null;
  audioFile?: File | null;
  contentBody?: string;
}

export interface UserActivity {
  id: string;
  userId: string;
  contentId: string;
  type: 'view' | 'like' | 'comment' | 'favorite';
  timestamp: string;
  content: {
    title: string;
    type: string;
    thumbnail: string;
  };
}

export interface SearchFilters {
  query: string;
  type?: string;
  tags?: string[];
  sortBy?: 'newest' | 'oldest' | 'most-viewed' | 'most-liked';
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export interface VideoPlayerProps {
  src: string;
  poster?: string;
  onTimeUpdate?: (currentTime: number) => void;
  onEnded?: () => void;
  autoPlay?: boolean;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export interface ToastProps {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose: () => void;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  statusCode: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// Form validation types
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormState<T> {
  data: T;
  errors: ValidationError[];
  isSubmitting: boolean;
  isValid: boolean;
}

// Chart data types for D3.js
export interface ChartData {
  label: string;
  value: number;
  color?: string;
}

export interface TimeSeriesData {
  date: string;
  value: number;
  category?: string;
}

export interface BarChartData {
  category: string;
  value: number;
  color?: string;
}

export interface PieChartData {
  label: string;
  value: number;
  percentage: number;
  color: string;
}

// Redux state types
export interface RootState {
  user: AuthState; // <-- changed from 'auth' to 'user'
  content: ContentState;
  admin: AdminState;
  ui: UIState;
}

export interface ContentState {
  items: ContentItem[];
  featuredContent: ContentItem[];
  trendingContent: TrendingContent[];
  currentContent: ContentItem | null;
  isLoading: boolean;
  error: string | null;
  filters: SearchFilters;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
  };
}

export interface AdminState {
  stats: AdminStats | null;
  isLoading: boolean;
  error: string | null;
}

export interface UIState {
  isSidebarOpen: boolean;
  theme: 'light' | 'dark';
  notifications: ToastProps[];
  modals: {
    [key: string]: boolean;
  };
}

// AI Content Creation Types
export interface AIPrompt {
  description: string;
  style?: string;
  duration?: number;
  theme?: string;
}

export interface AIGeneratedContent {
  id: string;
  type: 'story' | 'animation';
  content: string | Blob;
  preview?: string;
  status: 'generating' | 'completed' | 'failed';
  createdAt: string;
}