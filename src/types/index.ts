// src/types/index.ts

// User Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  isAdmin: boolean;
  isEmailVerified: boolean;
  phoneNumber?: string;
  gender?: 'male' | 'female' | '';
  country?: string;
  dateOfBirth?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile extends User {
  bio?: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  id?: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  autoPlayVideos: boolean;
  preferredVideoQuality: '360p' | '480p' | '720p' | '1080p' | 'auto';
  preferredLanguage: string;
  darkMode: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Content Types
export interface ContentItem {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  type: 'story' | 'film' | 'content' | 'podcast' | 'animation' | 'sneak-peek' | 'live-video';
  duration: number; // in minutes for videos, estimated read time for stories
  views: number;
  likes: number;
  tags: string[];
  createdAt: string;
  updatedAt?: string;
  isFavorited?: boolean;
  isBookmarked?: boolean;
  watchProgress?: number; // 0.0 to 1.0
  author?: {
    id: string;
    name: string;
    avatar?: string;
  };
  category?: string;
  slug?: string;
  status?: 'draft' | 'published' | 'archived';
  featuredAt?: string;
  publishedAt?: string;
}

export interface Story extends ContentItem {
  type: 'story';
  content: string; // Main story content
  estimatedReadTime: number;
  readProgress?: number;
  chapters?: StoryChapter[];
  illustrations?: string[];
}

export interface StoryChapter {
  id: string;
  title: string;
  content: string;
  order: number;
  estimatedReadTime: number;
}

export interface MediaContent extends ContentItem {
  type: 'film' | 'content' | 'animation' | 'sneak-peek';
  videoUrl: string;
  videoSize?: number;
  resolution?: string;
  watchProgress?: number;
  subtitles?: Subtitle[];
}

export interface Podcast extends ContentItem {
  type: 'podcast';
  audioUrl?: string;
  videoUrl?: string; // For video podcasts
  series?: PodcastSeries;
  episodeNumber?: number;
  seasonNumber?: number;
  listenProgress?: number;
  transcript?: string;
}

export interface PodcastSeries {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  category: string;
  tags: string[];
  totalEpisodes: number;
  isSubscribed?: boolean;
}

export interface Subtitle {
  language: string;
  url: string;
  isDefault?: boolean;
}

// Library and Favorites Types
export interface LibraryItem {
  id: string;
  content: ContentItem;
  addedAt: string;
  lastWatchedAt?: string;
  isCompleted: boolean;
  watchProgress: number;
  notes?: string;
}

export interface FavoriteItem {
  id: string;
  content: ContentItem;
  addedAt: string;
  category?: 'loved' | 'liked' | 'want-to-watch';
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  items: ContentItem[];
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
  totalDuration: number;
  itemCount: number;
}

// Comment Types
export interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  contentType: ContentItem['type'];
  contentId: string;
  parentId?: string; // For nested comments
  replies?: Comment[];
  likes: number;
  isLiked?: boolean;
  createdAt: string;
  updatedAt?: string;
  isEdited?: boolean;
}

export interface CommentCreate {
  content: string;
  contentType: ContentItem['type'];
  contentId: string;
  parentId?: string;
}

// Authentication Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface EmailVerification {
  email: string;
  code: string;
}

export interface PasswordReset {
  email: string;
  code: string;
  newPassword: string;
  confirmPassword: string;
}

export interface PasswordChange {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  count: number;
  next?: string;
  previous?: string;
  results: T[];
}

export interface SearchResults {
  stories: Story[];
  films: MediaContent[];
  content: MediaContent[];
  podcasts: Podcast[];
  animations: MediaContent[];
  sneakPeeks: MediaContent[];
  total: number;
}

// Settings Types
export interface NotificationSettings {
  email: {
    newContent: boolean;
    favorites: boolean;
    comments: boolean;
    newsletter: boolean;
  };
  push: {
    newContent: boolean;
    favorites: boolean;
    comments: boolean;
    reminders: boolean;
  };
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'private';
  showWatchHistory: boolean;
  showFavorites: boolean;
  allowComments: boolean;
  allowFollowers: boolean;
}

export interface PlaybackSettings {
  autoPlay: boolean;
  autoPlayNext: boolean;
  defaultQuality: '360p' | '480p' | '720p' | '1080p' | 'auto';
  playbackSpeed: number;
  subtitlesEnabled: boolean;
  subtitleLanguage: string;
  volume: number;
}

// Admin Types
export interface AdminStats {
  totalUsers: number;
  totalContent: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  recentSignups: number;
  activeUsers: number;
  contentByType: Record<string, number>;
  topContent: ContentItem[];
  recentActivity: AdminActivity[];
}

export interface AdminActivity {
  id: string;
  type: string;
  description: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  timestamp: string;
  metadata?: Record<string, any>;
}

// Upload Types
export interface FileUpload {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  url?: string;
  error?: string;
}

export interface ContentUpload {
  title: string;
  description: string;
  tags: string[];
  thumbnail?: FileUpload;
  content?: FileUpload; // For video/audio files
  status: 'draft' | 'uploading' | 'processing' | 'ready' | 'published';
  slug?: string;
  category?: string;
}

// Filter and Sort Types
export interface ContentFilter {
  type?: ContentItem['type'] | 'all';
  category?: string;
  tags?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  duration?: {
    min: number;
    max: number;
  };
  quality?: string;
}

export interface SortOption {
  value: string;
  label: string;
  field: string;
  order: 'asc' | 'desc';
}

// Notification Types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
  persistent?: boolean;
  actions?: NotificationAction[];
  timestamp: string;
  isRead?: boolean;
}

export interface ToastProps {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose: () => void;
}

export interface NotificationAction {
  label: string;
  action: () => void;
  style?: 'primary' | 'secondary' | 'danger';
}

// Redux State Types
export interface RootState {
  user: UserState;
  ui: UIState;
  content: ContentState;
}

export interface UserState {
  userInfo: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  preferences: UserPreferences | null;
}

export interface UIState {
  isSidebarOpen: boolean;
  theme: 'light' | 'dark';
  notifications: ToastProps[];
  modals: Record<string, boolean>;
}

export interface ContentState {
  currentContent: ContentItem | null;
  isLoading: boolean;
  error: string | null;
  searchResults: ContentItem[];
  searchQuery: string;
  filters: ContentFilter;
  sortBy: string;
}

// Event Types
export interface VideoPlayerEvent {
  type: 'play' | 'pause' | 'ended' | 'timeupdate' | 'loadstart' | 'canplay' | 'error';
  currentTime?: number;
  duration?: number;
  buffered?: number;
  error?: string;
}

export interface ReadingEvent {
  type: 'start' | 'progress' | 'complete' | 'bookmark';
  position?: number;
  totalWords?: number;
  chapter?: number;
  timeSpent?: number;
}

// Utility Types
export type ContentType = ContentItem['type'];
export type UserRole = 'user' | 'admin' | 'moderator';
export type ViewMode = 'grid' | 'list';
export type LoadingState = 'idle' | 'loading' | 'succeeded' | 'failed';

// Form Types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'textarea' | 'select' | 'file' | 'checkbox' | 'radio' | 'date';
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  validation?: {
    pattern?: RegExp;
    minLength?: number;
    maxLength?: number;
    custom?: (value: any) => string | null;
  };
}

export interface FormErrors {
  [fieldName: string]: string;
}

// Analytics Types
export interface AnalyticsEvent {
  event: string;
  properties: Record<string, any>;
  timestamp: string;
  userId?: string;
  sessionId: string;
}

export interface UserActivity {
  id: string;
  userId: string;
  activity: string;
  contentId?: string;
  contentType?: ContentType;
  metadata: Record<string, any>;
  timestamp: string;
  sessionId: string;
  ipAddress?: string;
  userAgent?: string;
}