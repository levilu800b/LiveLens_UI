// src/pages/SneakPeeks/SneakPeekPlayerPage.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Heart, 
  MessageCircle, 
  Bookmark, 
  Share2, 
  Play,
  Pause,
  Volume2,
  VolumeX,
  User,
  Calendar,
  Send,
  Tag,
  Eye,
  Edit,
  Trash2,
  Film,
  ThumbsUp,
  Maximize,
  Minimize
} from 'lucide-react';
import { useSelector } from 'react-redux';
import sneakPeekService, { type SneakPeek } from '../../services/sneakPeekService';
import commentService, { type Comment } from '../../services/commentService';
import type { RootState } from '../../store';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';

// Utility functions
const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const getFullMediaUrl = (path: string) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${BACKEND_BASE_URL}${path}`;
};

const getFullAvatarUrl = (avatarUrl: string | null | undefined): string | undefined => {
  if (!avatarUrl) return undefined;
  if (avatarUrl.startsWith('http')) return avatarUrl;
  return `${BACKEND_BASE_URL}${avatarUrl}`;
};

const SneakPeekPlayerPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  
  const { userInfo: user, isAuthenticated } = useSelector((state: RootState) => state.user);
  
  const [sneakPeek, setSneakPeek] = useState<SneakPeek | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Video/Image state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Interaction state
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [newComment, setNewComment] = useState('');
  
  // Comment state
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);
  const commentsLoadedRef = useRef<string | null>(null);
  
  // Prevent infinite re-renders with ref-based throttling
  const lastFetchRef = useRef<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch sneak peek data
  const fetchSneakPeek = useCallback(async () => {
    if (!slug || lastFetchRef.current === slug) return;
    
    try {
      setLoading(true);
      setError(null);
      lastFetchRef.current = slug;
      
      const data = await sneakPeekService.getSneakPeek(slug, refreshKey > 0);
      setSneakPeek(data);
      
      // Check if we have a locally stored like state for this sneak peek
      const localLikeKey = `sneakpeak_liked_${slug}`;
      const localLikeState = localStorage.getItem(localLikeKey);
      
      // Use backend data first, then fall back to local storage if backend doesn't have user interaction data
      const backendLikeState = data.isFavorited || false;
      const finalLikeState = backendLikeState || (localLikeState === 'true');
      
      setIsLiked(finalLikeState);
      setIsBookmarked(data.isBookmarked || false);
      setLikeCount(data.likes || 0);
      
      // View is automatically tracked by the backend when getSneakPeek is called
    } catch (error) {
      console.error('Error fetching sneak peek:', error);
      setError(error instanceof Error ? error.message : 'Failed to load sneak peek');
    } finally {
      setLoading(false);
    }
  }, [slug, refreshKey]);

  useEffect(() => {
    fetchSneakPeek();
  }, [fetchSneakPeek]);

  // Listen for storage events to trigger refresh when data is updated elsewhere
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'sneakPeekDataUpdated') {
        setRefreshKey(Date.now());
        localStorage.removeItem('sneakPeekDataUpdated');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also check for updates on focus
    const handleFocus = () => {
      const lastUpdate = localStorage.getItem('sneakPeekDataUpdated');
      if (lastUpdate) {
        setRefreshKey(Date.now());
        localStorage.removeItem('sneakPeekDataUpdated');
      }
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Load comments
  useEffect(() => {
    const loadComments = async () => {
      if (!sneakPeek) return;
      
      if (commentsLoadedRef.current === sneakPeek.id) return;
      
      try {
        setCommentsLoading(true);
        commentsLoadedRef.current = sneakPeek.id;
        const commentsData = await commentService.getComments({
          content_type: 'sneakpeek',
          object_id: sneakPeek.id,
          page: 1,
          page_size: 20,
          ordering: '-created_at'
        });
        
        setComments(commentsData.results || []);
      } catch (err) {
        // Only log non-authentication errors
        if (err instanceof Error && !err.message.includes('401') && !err.message.includes('Unauthorized')) {
          console.error('Error loading comments:', err);
        }
        // Set empty comments array on error
        setComments([]);
      } finally {
        setCommentsLoading(false);
      }
    };

    loadComments();
  }, [sneakPeek]);

  // Video event handlers
  const handlePlayPause = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleVolumeToggle = () => {
    if (!videoRef.current) return;
    
    const newMuted = !isMuted;
    videoRef.current.muted = newMuted;
    setIsMuted(newMuted);
  };

  const handleVolumeChange = (newVolume: number) => {
    if (!videoRef.current) return;
    
    videoRef.current.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
  };

  const handleSeek = (time: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = time;
    setCurrentTime(time);
  };

  // Interaction handlers
  const handleLike = async () => {
    if (!isAuthenticated || !slug) {
      // Would open sign in modal if available
      return;
    }

    // Prevent multiple clicks while processing
    if (loading) return;

    try {
      const result = await sneakPeekService.toggleLike(slug);
      
      // Update state based on server response only
      setIsLiked(result.isLiked);
      
      // Store the like state locally for persistence
      const localLikeKey = `sneakpeak_liked_${slug}`;
      localStorage.setItem(localLikeKey, result.isLiked.toString());
      
      // Update like count based on the action
      if (result.isLiked) {
        setLikeCount(prev => prev + 1);
      } else {
        setLikeCount(prev => Math.max(0, prev - 1));
      }
      
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleBookmark = async () => {
    if (!isAuthenticated || !slug) {
      // Would open sign in modal if available
      return;
    }

    try {
      const result = await sneakPeekService.toggleBookmark(slug);
      setIsBookmarked(result.isBookmarked);
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: sneakPeek?.title,
          text: sneakPeek?.description,
          url: window.location.href,
        });
      } catch {
        // User cancelled sharing
      }
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(window.location.href);
      // Would show toast if available
    }
  };

  const handleFullscreen = async () => {
    if (!videoContainerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await videoContainerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Error toggling fullscreen:', error);
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !isAuthenticated || !sneakPeek) return;

    try {
      const commentData = await commentService.createComment({
        content_type_name: 'sneakpeek',
        object_id: sneakPeek.id,
        text: newComment.trim(),
        parent: replyTo || undefined
      });

      // Add new comment to the list
      if (replyTo) {
        // Handle reply - update the parent comment's replies
        setComments(prev => prev.map(comment => 
          comment.id === replyTo 
            ? { ...comment, replies: [...(comment.replies || []), commentData] }
            : comment
        ));
        setReplyTo(null);
        setReplyText('');
      } else {
        // Add as new top-level comment
        setComments(prev => [commentData, ...prev]);
        setNewComment('');
      }
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  const handleEditComment = async (commentId: string, newContent: string) => {
    if (!isAuthenticated || !newContent.trim()) {
      setEditingComment(null);
      setEditText('');
      return;
    }

    try {
      const updatedComment = await commentService.updateComment(commentId, newContent.trim());

      // The backend might return a partial response (just the text field)
      // So we need to merge it with the existing comment data
      setComments(prev => prev.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            // Merge any fields that came back from the server first
            ...updatedComment,
            // Then override with our guaranteed values
            text: newContent.trim(),
            is_edited: true,
            updated_at: new Date().toISOString()
          };
        }
        // Handle nested replies
        if (comment.replies) {
          return {
            ...comment,
            replies: comment.replies.map(reply => 
              reply.id === commentId ? {
                ...reply,
                // Merge any fields that came back from the server first
                ...updatedComment,
                // Then override with our guaranteed values
                text: newContent.trim(),
                is_edited: true,
                updated_at: new Date().toISOString()
              } : reply
            )
          };
        }
        return comment;
      }));
      setEditingComment(null);
      setEditText('');
    } catch (error) {
      console.error('Error editing comment:', error);
      // Don't let the error crash the page - just revert the edit state
      setEditingComment(null);
      setEditText('');
      // Show more specific error message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Failed to update comment: ${errorMessage}. Please try again.`);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!isAuthenticated) return;

    try {
      await commentService.deleteComment(commentId);
      setComments(prev => {
        return prev.map(comment => {
          if (comment.id === commentId) {
            return null; // This comment will be filtered out
          }
          // Handle nested replies
          if (comment.replies) {
            return {
              ...comment,
              replies: comment.replies.filter(reply => reply.id !== commentId)
            };
          }
          return comment;
        }).filter((comment): comment is Comment => comment !== null); // Type-safe filter
      });
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleCommentLike = async (commentId: string) => {
    if (!isAuthenticated) return;

    try {
      await commentService.interactWithComment(commentId, 'like');
      
      // Update comment like count optimistically
      setComments(prev => prev.map(comment => {
        if (comment.id === commentId) {
          const isCurrentlyLiked = comment.user_interaction?.liked || false;
          return {
            ...comment,
            like_count: isCurrentlyLiked ? comment.like_count - 1 : comment.like_count + 1,
            user_interaction: {
              liked: !isCurrentlyLiked,
              disliked: comment.user_interaction?.disliked || false,
            }
          };
        }
        // Handle nested replies
        if (comment.replies) {
          return {
            ...comment,
            replies: comment.replies.map(reply => 
              reply.id === commentId 
                ? {
                    ...reply,
                    like_count: (reply.user_interaction?.liked || false) 
                      ? reply.like_count - 1 
                      : reply.like_count + 1,
                    user_interaction: {
                      liked: !(reply.user_interaction?.liked || false),
                      disliked: reply.user_interaction?.disliked || false,
                    }
                  }
                : reply
            )
          };
        }
        return comment;
      }));
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  const handleReply = async (commentId: string) => {
    if (!isAuthenticated || !replyText.trim()) return;

    try {
      const newReply = await commentService.createComment({
        content_type_name: 'sneakpeek',
        object_id: sneakPeek?.id?.toString() || '',
        text: replyText.trim(),
        parent: commentId
      });

      setComments(prev => prev.map(comment => 
        comment.id === commentId 
          ? { ...comment, replies: [...(comment.replies || []), newReply] }
          : comment
      ));
      setReplyTo(null);
      setReplyText('');
    } catch (error) {
      console.error('Error posting reply:', error);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) return '1 day ago';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
      if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
      return `${Math.ceil(diffDays / 365)} years ago`;
    } catch {
      return 'Unknown date';
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading sneak peek...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Error Loading Sneak Peek</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => navigate('/sneak-peeks')}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Back to Sneak Peeks
          </button>
        </div>
      </div>
    );
  }

  // Not found state
  if (!sneakPeek) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400">Sneak peek not found</p>
          <button
            onClick={() => navigate('/sneak-peeks')}
            className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Back to Sneak Peeks
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Header />
      
      <main className="pt-16">
        {/* Navigation */}
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={() => navigate('/sneak-peeks')}
            className="flex items-center text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Sneak Peeks
          </button>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Media Player */}
            <div className="lg:col-span-2">
              <div ref={videoContainerRef} className="bg-black rounded-lg overflow-hidden relative group">
                {sneakPeek.video_file ? (
                  <>
                    <video
                      ref={videoRef}
                      className="w-full aspect-video"
                      poster={getFullMediaUrl(sneakPeek.thumbnail || '')}
                      onTimeUpdate={handleTimeUpdate}
                      onLoadedMetadata={handleLoadedMetadata}
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                    >
                      <source src={getFullMediaUrl(sneakPeek.video_file)} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                    
                    {/* Video Controls */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-4 left-4 right-4">
                        {/* Progress Bar */}
                        <div className="mb-4">
                          <div className="w-full bg-gray-600 h-1 rounded-full cursor-pointer"
                               onClick={(e) => {
                                 const rect = e.currentTarget.getBoundingClientRect();
                                 const pos = (e.clientX - rect.left) / rect.width;
                                 handleSeek(pos * duration);
                               }}>
                            <div 
                              className="bg-purple-500 h-1 rounded-full"
                              style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                            />
                          </div>
                        </div>
                        
                        {/* Controls */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <button
                              onClick={handlePlayPause}
                              className="text-white hover:text-purple-400 transition-colors"
                            >
                              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                            </button>
                            
                            <button
                              onClick={handleVolumeToggle}
                              className="text-white hover:text-purple-400 transition-colors"
                            >
                              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                            </button>
                            
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.01"
                              value={isMuted ? 0 : volume}
                              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                              className="w-20"
                            />
                          </div>
                          
                          <div className="flex items-center space-x-4">
                            <div className="text-white text-sm">
                              {formatTime(currentTime)} / {formatTime(duration)}
                            </div>
                            
                            <button
                              onClick={handleFullscreen}
                              className="text-white hover:text-purple-400 transition-colors"
                            >
                              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="aspect-video flex items-center justify-center bg-gray-800">
                    <div className="text-center text-gray-400">
                      <Film className="w-16 h-16 mx-auto mb-4" />
                      <p>Preview coming soon</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Title and Description */}
              <div className="mt-6">
                <h1 className="text-2xl lg:text-3xl font-bold text-white mb-4">
                  {sneakPeek.title}
                </h1>
                
                {/* Metadata */}
                <div className="flex flex-wrap items-center gap-4 text-gray-400 text-sm mb-4">
                  <div className="flex items-center">
                    <Eye className="w-4 h-4 mr-1" />
                    {sneakPeek.views.toLocaleString()} views
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {formatDate(sneakPeek.publishedAt || sneakPeek.createdAt)}
                  </div>
                  {sneakPeek.author && (
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      {sneakPeek.author.name}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4 mb-6">
                  <button
                    onClick={handleLike}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      isLiked 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                    {likeCount}
                  </button>
                  
                  <button
                    onClick={handleBookmark}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      isBookmarked 
                        ? 'bg-yellow-600 text-white' 
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
                    Save
                  </button>
                  
                  <button
                    onClick={handleShare}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <Share2 className="w-5 h-5" />
                    Share
                  </button>
                </div>

                {/* Description */}
                <div className="prose prose-invert max-w-none">
                  <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {sneakPeek.description}
                  </p>
                </div>

                {/* Tags */}
                {sneakPeek.tags && sneakPeek.tags.length > 0 && (
                  <div className="mt-6">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Tag className="w-4 h-4 text-gray-400" />
                      {sneakPeek.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Upcoming Content Info */}
              {(sneakPeek.upcoming_content_type || sneakPeek.upcoming_content_title) && (
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Coming Soon</h3>
                  {sneakPeek.upcoming_content_title && (
                    <p className="text-purple-400 font-medium mb-2">
                      {sneakPeek.upcoming_content_title}
                    </p>
                  )}
                  {sneakPeek.upcoming_content_type && (
                    <p className="text-gray-400 text-sm mb-2">
                      Type: {sneakPeek.upcoming_content_type}
                    </p>
                  )}
                  {sneakPeek.upcoming_release_date && (
                    <p className="text-gray-400 text-sm">
                      Expected: {new Date(sneakPeek.upcoming_release_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Comments Section */}
          <div className="mt-8 bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
              <MessageCircle className="h-5 w-5 mr-2" />
              Comments ({comments.length})
            </h3>
              
              {/* Add Comment */}
              {isAuthenticated ? (
                <form onSubmit={handleCommentSubmit} className="mb-6">
                  <textarea
                    ref={commentInputRef}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows={3}
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      type="submit"
                      disabled={!newComment.trim()}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Send className="w-4 h-4" />
                      Post Comment
                    </button>
                  </div>
                </form>
              ) : (
                <div className="mb-6 p-4 bg-gray-700 rounded-lg text-center">
                  <p className="text-gray-300 mb-2">Sign in to leave a comment</p>
                  <button
                    onClick={() => navigate('/auth/login')}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Sign In
                  </button>
                </div>
              )}

              {/* Comments List */}
              <div className="space-y-4">
                {commentsLoading ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-gray-400">Loading comments...</p>
                  </div>
                ) : comments.length > 0 ? (
                  comments.map((comment) => (
                    <div key={comment.id} className="border-l-2 border-gray-700 pl-4">
                      {/* Comment Header */}
                      <div className="flex items-start space-x-3">
                        <img
                          src={getFullAvatarUrl(comment.user.avatar_url) || `https://ui-avatars.com/api/?name=${comment.user.first_name}+${comment.user.last_name}&background=6366f1&color=fff`}
                          alt={`${comment.user.first_name} ${comment.user.last_name}`}
                          className="w-8 h-8 rounded-full"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-white">
                              {comment.user.first_name} {comment.user.last_name}
                            </span>
                            <span className="text-gray-400 text-sm">
                              {formatDate(comment.created_at)}
                            </span>
                            {comment.is_edited && (
                              <span className="text-gray-500 text-sm">(edited)</span>
                            )}
                          </div>

                          {/* Comment Content */}
                          {editingComment === comment.id ? (
                            <div className="space-y-2">
                              <textarea
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                className="w-full p-2 bg-gray-700 text-white rounded resize-none focus:ring-2 focus:ring-purple-500 focus:outline-none"
                                rows={2}
                              />
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleEditComment(comment.id, editText)}
                                  className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingComment(null);
                                    setEditText('');
                                  }}
                                  className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-gray-300 mb-2">{comment.text}</p>
                          )}

                          {/* Comment Actions */}
                          <div className="flex items-center space-x-4 text-sm text-gray-400">
                            <button 
                              onClick={() => handleCommentLike(comment.id)}
                              className={`hover:text-purple-400 flex items-center ${
                                comment.user_interaction?.liked ? 'text-purple-400' : ''
                              }`}
                            >
                              <ThumbsUp className="h-4 w-4 mr-1" />
                              {comment.like_count || 0}
                            </button>
                            
                            {user && (
                              <button
                                onClick={() => setReplyTo(comment.id)}
                                className="hover:text-purple-400"
                              >
                                Reply
                              </button>
                            )}
                            
                            {(user?.id === comment.user.id || user?.isAdmin) && editingComment !== comment.id && (
                              <>
                                <button
                                  onClick={() => {
                                    setEditingComment(comment.id);
                                    setEditText(comment.text);
                                  }}
                                  className="hover:text-purple-400 flex items-center"
                                >
                                  <Edit className="h-4 w-4 mr-1" />
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteComment(comment.id)}
                                  className="hover:text-red-400 flex items-center"
                                >
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Delete
                                </button>
                              </>
                            )}
                          </div>

                          {/* Reply Form */}
                          {replyTo === comment.id && user && (
                            <div className="mt-3 ml-4">
                              <textarea
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Write a reply..."
                                className="w-full p-2 bg-gray-700 text-white rounded resize-none focus:ring-2 focus:ring-purple-500 focus:outline-none"
                                rows={2}
                              />
                              <div className="flex space-x-2 mt-2">
                                <button
                                  onClick={() => handleReply(comment.id)}
                                  disabled={!replyText.trim()}
                                  className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 disabled:opacity-50"
                                >
                                  Reply
                                </button>
                                <button
                                  onClick={() => {
                                    setReplyTo(null);
                                    setReplyText('');
                                  }}
                                  className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Replies */}
                          {comment.replies && comment.replies.length > 0 && (
                            <div className="mt-3 space-y-3">
                              {comment.replies.map((reply) => (
                                <div key={reply.id} className="ml-4 border-l border-gray-600 pl-3">
                                  <div className="flex items-start space-x-2">
                                    <img
                                      src={getFullAvatarUrl(reply.user.avatar_url) || `https://ui-avatars.com/api/?name=${reply.user.first_name}+${reply.user.last_name}&background=6366f1&color=fff`}
                                      alt={`${reply.user.first_name} ${reply.user.last_name}`}
                                      className="w-6 h-6 rounded-full"
                                    />
                                    <div className="flex-1">
                                      <div className="flex items-center space-x-2 mb-1">
                                        <span className="font-medium text-white text-sm">
                                          {reply.user.first_name} {reply.user.last_name}
                                        </span>
                                        <span className="text-gray-400 text-xs">
                                          {formatDate(reply.created_at)}
                                        </span>
                                      </div>
                                      
                                      {/* Reply Content - Edit Mode */}
                                      {editingComment === reply.id ? (
                                        <div className="space-y-2">
                                          <textarea
                                            value={editText}
                                            onChange={(e) => setEditText(e.target.value)}
                                            className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-sm text-white resize-none"
                                            rows={2}
                                          />
                                          <div className="flex space-x-2">
                                            <button
                                              onClick={() => handleEditComment(reply.id, editText)}
                                              className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
                                            >
                                              Save
                                            </button>
                                            <button
                                              onClick={() => {
                                                setEditingComment(null);
                                                setEditText('');
                                              }}
                                              className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                                            >
                                              Cancel
                                            </button>
                                          </div>
                                        </div>
                                      ) : (
                                        <p className="text-gray-300 text-sm mb-2">{reply.text}</p>
                                      )}

                                      {/* Reply Actions */}
                                      <div className="flex items-center space-x-4 text-xs text-gray-400">
                                        <button 
                                          onClick={() => handleCommentLike(reply.id)}
                                          className={`hover:text-purple-400 flex items-center ${
                                            reply.user_interaction?.liked ? 'text-purple-400' : ''
                                          }`}
                                        >
                                          <ThumbsUp className="h-3 w-3 mr-1" />
                                          {reply.like_count || 0}
                                        </button>
                                        
                                        {(user?.id === reply.user.id || user?.isAdmin) && editingComment !== reply.id && (
                                          <>
                                            <button
                                              onClick={() => {
                                                setEditingComment(reply.id);
                                                setEditText(reply.text);
                                              }}
                                              className="hover:text-purple-400 flex items-center"
                                            >
                                              <Edit className="h-3 w-3 mr-1" />
                                              Edit
                                            </button>
                                            <button
                                              onClick={() => handleDeleteComment(reply.id)}
                                              className="hover:text-red-400 flex items-center"
                                            >
                                              <Trash2 className="h-3 w-3 mr-1" />
                                              Delete
                                            </button>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <MessageCircle className="h-12 w-12 text-gray-600 mx-auto mb-2" />
                    <p className="text-gray-400">No comments yet. Be the first to comment!</p>
                  </div>
                )}
              </div>
            </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default SneakPeekPlayerPage;
