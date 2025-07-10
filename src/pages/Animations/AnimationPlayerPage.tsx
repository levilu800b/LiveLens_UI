// src/pages/Animations/AnimationPlayerPage.tsx
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
  Maximize,
  SkipBack,
  SkipForward,
  User,
  Calendar,
  Clock,
  ThumbsUp,
  Send,
  Tag,
  Eye,
  Edit,
  Trash2,
  Settings,
  Film,
  Users,
  Info
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { uiActions } from '../../store/reducers/uiReducers';
import animationService, { type Animation } from '../../services/animationService';
import commentService, { type Comment } from '../../services/commentService';
import MainLayout from '../../components/MainLayout/MainLayout';
import { config } from '../../config';

interface RootState {
  user: {
    userInfo: {
      id: string;
      username: string;
      first_name: string;
      last_name: string;
      avatar?: string;
    } | null;
  };
}

// Helper function to get full avatar URL
const getFullAvatarUrl = (avatarUrl: string | null | undefined): string | undefined => {
  if (!avatarUrl) return undefined;
  if (avatarUrl.startsWith('http')) return avatarUrl;
  return `${config.backendUrl}${avatarUrl}`;
};

// Helper function to get full media URL
const getFullMediaUrl = (mediaUrl: string | null | undefined): string | undefined => {
  if (!mediaUrl) return undefined;
  if (mediaUrl.startsWith('http')) return mediaUrl;
  return `${config.backendUrl}${mediaUrl}`;
};

// Helper function to format time
const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

const AnimationPlayerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const userInfo = useSelector((state: RootState) => state.user.userInfo);
  const dispatch = useDispatch();
  const videoRef = useRef<HTMLVideoElement>(null);
  const commentsLoadedRef = useRef<string | null>(null);

  // Authentication check
  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
      return;
    }
  }, [userInfo, navigate]);

  // States
  const [animation, setAnimation] = useState<Animation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Video player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [quality] = useState('auto');
  
  // Comments state
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [deletingComment, setDeletingComment] = useState<string | null>(null);
  
  // Animation-specific state (removed unused state variables)
  
  // Refs for tracking
  const [startTime] = useState<number>(Date.now());

  // Load animation data
  useEffect(() => {
    const loadAnimation = async () => {
      if (!id) {
        setError('Animation ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const animationData = await animationService.getAnimation(id);
        setAnimation(animationData);
        setError(null);
        
        // Track initial view (only once when animation loads)
        if (userInfo) {
          try {
            await animationService.trackAnimationView(id, {
              device_type: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
              watch_duration: 0,
              completion_percentage: 0,
              quality_watched: 'auto'
            });
          } catch (viewErr) {
            // Don't block loading if view tracking fails
            console.warn('Failed to track initial view:', viewErr);
          }
        }
      } catch (err) {
        console.error('Error loading animation:', err);
        setError(err instanceof Error ? err.message : 'Failed to load animation');
      } finally {
        setLoading(false);
      }
    };

    loadAnimation();
  }, [id, userInfo]);

  // Load comments
  useEffect(() => {
    const loadComments = async () => {
      if (!animation) return;
      
      if (commentsLoadedRef.current === animation.id) return;
      
      try {
        setCommentsLoading(true);
        commentsLoadedRef.current = animation.id;
        const commentsData = await commentService.getComments({
          content_type: 'animation',
          object_id: animation.id,
          page: 1,
          page_size: 20,
          ordering: '-created_at'
        });
        
        setComments(commentsData.results || []);
        
        // Update animation comment count if it differs from loaded comments
        if (animation && commentsData.count !== animation.comment_count) {
          setAnimation(prev => prev ? {
            ...prev,
            comment_count: commentsData.count
          } : null);
        }
      } catch (err) {
        console.error('Error loading comments:', err);
        commentsLoadedRef.current = null;
      } finally {
        setCommentsLoading(false);
      }
    };

    loadComments();
  }, [animation]);

  // Video event handlers
  const handlePlayPause = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
    
    // Track progress every 30 seconds
    if (userInfo && animation && Math.floor(videoRef.current.currentTime) % 30 === 0) {
      trackWatchProgress();
    }
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

  const handleVolumeChange = (newVolume: number) => {
    if (!videoRef.current) return;
    videoRef.current.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    
    if (isMuted) {
      videoRef.current.volume = volume;
      setIsMuted(false);
    } else {
      videoRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const toggleFullscreen = () => {
    if (!videoRef.current) return;
    
    if (!isFullscreen) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const skipTime = (seconds: number) => {
    if (!videoRef.current) return;
    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
    handleSeek(newTime);
  };

  const changePlaybackRate = (rate: number) => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = rate;
    setPlaybackRate(rate);
  };

  // Track watch progress
  const trackWatchProgress = useCallback(async () => {
    if (!animation || !userInfo || !videoRef.current) return;

    try {
      const watchDuration = Math.floor((Date.now() - startTime) / 1000);
      const completionPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;
      
      await animationService.interactWithAnimation(animation.id, 'watch', {
        watch_progress: completionPercentage,
        watch_time: currentTime
      });

      await animationService.trackAnimationView(animation.id, {
        device_type: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
        watch_duration: watchDuration,
        completion_percentage: completionPercentage,
        quality_watched: quality
      });
    } catch (err) {
      console.error('Error tracking watch progress:', err);
    }
  }, [animation, userInfo, startTime, duration, currentTime, quality]);

  // Interaction handlers
  const handleLike = async () => {
    if (!animation || !userInfo) {
      navigate('/login');
      return;
    }

    try {
      await animationService.interactWithAnimation(animation.id, 'like');
      
      setAnimation(prev => {
        if (!prev) return null;
        return {
          ...prev,
          is_liked: !prev.is_liked,
          like_count: prev.is_liked ? prev.like_count - 1 : prev.like_count + 1
        };
      });
    } catch (err) {
      console.error('Error liking animation:', err);
      dispatch(uiActions.addNotification({
        type: 'error',
        message: `Failed to ${animation.is_liked ? 'unlike' : 'like'} animation. Please try again.`
      }));
    }
  };

  const handleBookmark = async () => {
    if (!animation || !userInfo) {
      navigate('/login');
      return;
    }

    try {
      await animationService.interactWithAnimation(animation.id, 'bookmark');
      
      setAnimation(prev => prev ? {
        ...prev,
        is_bookmarked: !prev.is_bookmarked
      } : null);
    } catch (err) {
      console.error('Error bookmarking animation:', err);
      dispatch(uiActions.addNotification({
        type: 'error',
        message: `Failed to ${animation.is_bookmarked ? 'remove bookmark' : 'bookmark'} animation. Please try again.`
      }));
    }
  };

  // Comment handlers
  const handleAddComment = async () => {
    if (!newComment.trim() || !animation || !userInfo) return;

    try {
      const commentData = await commentService.createComment({
        content_type_name: 'animation',
        object_id: animation.id,
        text: newComment.trim()
      });

      setComments(prev => [commentData, ...prev]);
      setAnimation(prev => prev ? {
        ...prev,
        comment_count: prev.comment_count + 1
      } : null);
      setNewComment('');
    } catch (err) {
      console.error('Error adding comment:', err);
      dispatch(uiActions.addNotification({
        message: 'Failed to add comment. Please try again.',
        type: 'error'
      }));
    }
  };

  const handleReplyComment = async () => {
    if (!replyText.trim() || !replyTo || !animation || !userInfo) return;

    try {
      const replyData = await commentService.createComment({
        content_type_name: 'animation',
        object_id: animation.id,
        text: replyText.trim(),
        parent: replyTo
      });

      setComments(prev => prev.map(comment => {
        if (comment.id === replyTo) {
          return {
            ...comment,
            replies: [...(comment.replies || []), replyData],
            reply_count: (comment.reply_count || 0) + 1
          };
        }
        return comment;
      }));

      setAnimation(prev => prev ? {
        ...prev,
        comment_count: prev.comment_count + 1
      } : null);
      
      setReplyTo(null);
      setReplyText('');
    } catch (err) {
      console.error('Error replying to comment:', err);
      dispatch(uiActions.addNotification({
        message: 'Failed to reply to comment. Please try again.',
        type: 'error'
      }));
    }
  };

  const handleEditComment = async () => {
    if (!editText.trim() || !editingComment) return;

    try {
      const updatedComment = await commentService.updateComment(editingComment, editText.trim());

      setComments(prev => prev.map(comment => {
        if (comment.id === editingComment) {
          return { ...comment, ...updatedComment };
        }
        
        if (comment.replies) {
          comment.replies = comment.replies.map(reply => 
            reply.id === editingComment ? { ...reply, ...updatedComment } : reply
          );
        }
        
        return comment;
      }));

      setEditingComment(null);
      setEditText('');
    } catch (err) {
      console.error('Error editing comment:', err);
      dispatch(uiActions.addNotification({
        message: 'Failed to edit comment. Please try again.',
        type: 'error'
      }));
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await commentService.deleteComment(commentId);
      setDeletingComment(null);
      
      setComments(prev => {
        let commentDeleted = false;
        
        const updatedComments = prev.filter(comment => {
          if (comment.id === commentId) {
            commentDeleted = true;
            return false;
          }
          
          if (comment.replies) {
            const originalReplyCount = comment.replies.length;
            comment.replies = comment.replies.filter(reply => reply.id !== commentId);
            
            if (comment.replies.length !== originalReplyCount) {
              comment.reply_count = Math.max(0, (comment.reply_count || 0) - 1);
            }
          }
          
          return true;
        });
        
        if (commentDeleted) {
          setAnimation(prevAnimation => prevAnimation ? {
            ...prevAnimation,
            comment_count: Math.max(0, prevAnimation.comment_count - 1)
          } : null);
        }
        
        return updatedComments;
      });
    } catch (err) {
      console.error('Error deleting comment:', err);
      dispatch(uiActions.addNotification({
        message: 'Failed to delete comment. Please try again.',
        type: 'error'
      }));
    }
  };

  const handleCommentLike = async (commentId: string) => {
    if (!userInfo) {
      navigate('/login');
      return;
    }

    try {
      await commentService.interactWithComment(commentId, 'like');
      
      // Update the comment in the local state
      setComments(prevComments => 
        prevComments.map(comment => {
          if (comment.id === commentId) {
            const isCurrentlyLiked = comment.user_interaction?.liked || false;
            return {
              ...comment,
              like_count: isCurrentlyLiked ? comment.like_count - 1 : comment.like_count + 1,
              user_interaction: {
                ...comment.user_interaction,
                liked: !isCurrentlyLiked,
                disliked: false
              }
            };
          }
          
          // Also check replies
          if (comment.replies) {
            return {
              ...comment,
              replies: comment.replies.map(reply => {
                if (reply.id === commentId) {
                  const isCurrentlyLiked = reply.user_interaction?.liked || false;
                  return {
                    ...reply,
                    like_count: isCurrentlyLiked ? reply.like_count - 1 : reply.like_count + 1,
                    user_interaction: {
                      ...reply.user_interaction,
                      liked: !isCurrentlyLiked,
                      disliked: false
                    }
                  };
                }
                return reply;
              })
            };
          }
          
          return comment;
        })
      );
    } catch (err) {
      console.error('Error liking comment:', err);
      dispatch(uiActions.addNotification({
        message: 'Failed to like comment. Please try again.',
        type: 'error'
      }));
    }
  };

  // Get video URL
  const getVideoUrl = (): string | undefined => {
    if (!animation) return undefined;
    return getFullMediaUrl(animation.video_file);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDuration = (duration: number) => {
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = duration % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    }
    return `${minutes}m ${seconds}s`;
  };

  // Track when user leaves the page
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (userInfo && animation && videoRef.current) {
        trackWatchProgress();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [userInfo, animation, trackWatchProgress]);

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-300">Loading animation...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !animation) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-white mb-4">Animation Not Found</h2>
            <p className="text-gray-400 mb-6">{error || 'The animation you\'re looking for doesn\'t exist.'}</p>
            <button
              onClick={() => navigate('/animations')}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Browse Animations
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-900 text-white">
        {/* Video Player Section */}
        <div className="relative">
          {/* Video Container */}
          <div className="relative aspect-video bg-black">
            {getVideoUrl() ? (
              <video
                ref={videoRef}
                className="w-full h-full object-contain"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setIsPlaying(false)}
                poster={getFullMediaUrl(animation.poster || animation.thumbnail)}
                onMouseEnter={() => setShowControls(true)}
                onMouseLeave={() => setShowControls(true)} // Always show controls for now
              >
                <source src={getVideoUrl()} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-800">
                <div className="text-center">
                  <Film className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Video not available</p>
                </div>
              </div>
            )}

            {/* Video Controls */}
            {getVideoUrl() && showControls && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4">
                {/* Progress Bar */}
                <div className="mb-4">
                  <div 
                    className="w-full h-2 bg-gray-600 rounded cursor-pointer"
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const percent = (e.clientX - rect.left) / rect.width;
                      handleSeek(percent * duration);
                    }}
                  >
                    <div 
                      className="h-full bg-purple-600 rounded"
                      style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Control Buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button onClick={() => skipTime(-10)} className="text-white hover:text-purple-400">
                      <SkipBack className="h-6 w-6" />
                    </button>
                    <button 
                      onClick={handlePlayPause}
                      className="bg-purple-600 hover:bg-purple-700 text-white rounded-full p-3"
                    >
                      {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                    </button>
                    <button onClick={() => skipTime(10)} className="text-white hover:text-purple-400">
                      <SkipForward className="h-6 w-6" />
                    </button>
                    
                    {/* Volume */}
                    <div className="flex items-center space-x-2">
                      <button onClick={toggleMute} className="text-white hover:text-purple-400">
                        {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={isMuted ? 0 : volume}
                        onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                        className="w-20"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {/* Playback Speed */}
                    <select
                      value={playbackRate}
                      onChange={(e) => changePlaybackRate(parseFloat(e.target.value))}
                      className="bg-gray-800 text-white rounded px-2 py-1 text-sm"
                    >
                      <option value={0.25}>0.25x</option>
                      <option value={0.5}>0.5x</option>
                      <option value={0.75}>0.75x</option>
                      <option value={1}>1x</option>
                      <option value={1.25}>1.25x</option>
                      <option value={1.5}>1.5x</option>
                      <option value={2}>2x</option>
                    </select>

                    {/* Fullscreen */}
                    <button onClick={toggleFullscreen} className="text-white hover:text-purple-400">
                      <Maximize className="h-6 w-6" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Back Button */}
            <button
              onClick={() => navigate('/animations')}
              className="absolute top-4 left-4 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Animation Info */}
              <div>
                <h1 className="text-3xl font-bold mb-4">{animation.title}</h1>
                
                {/* Stats & Actions */}
                <div className="flex flex-wrap items-center gap-4 mb-6">
                  <div className="flex items-center space-x-6 text-gray-400">
                    <span className="flex items-center">
                      <Eye className="h-4 w-4 mr-1" />
                      {animation.view_count.toLocaleString()}
                    </span>
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(animation.published_at || animation.created_at)}
                    </span>
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {formatDuration(animation.duration)}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4 ml-auto">
                    <button
                      onClick={handleLike}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                        animation.is_liked
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      <Heart className={`h-5 w-5 ${animation.is_liked ? 'fill-current' : ''}`} />
                      <span>{animation.like_count}</span>
                    </button>
                    
                    <button
                      onClick={handleBookmark}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                        animation.is_bookmarked
                          ? 'bg-yellow-600 text-white'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      <Bookmark className={`h-5 w-5 ${animation.is_bookmarked ? 'fill-current' : ''}`} />
                    </button>
                    
                    <button className="flex items-center space-x-2 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors">
                      <Share2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Description */}
                <div className="prose prose-invert max-w-none">
                  <p className="text-gray-300 leading-relaxed">{animation.description}</p>
                </div>

                {/* Tags */}
                {animation.tags && animation.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-6">
                    {animation.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-purple-900/50 text-purple-300 px-3 py-1 rounded-full text-sm flex items-center"
                      >
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Comments Section */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-6 flex items-center">
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Comments ({animation.comment_count})
                </h3>

                {/* Add Comment */}
                {userInfo ? (
                  <div className="mb-6">
                    <div className="flex space-x-4">
                      <img
                        src={getFullAvatarUrl(userInfo.avatar) || `https://ui-avatars.com/api/?name=${userInfo.first_name}+${userInfo.last_name}&background=6366f1&color=fff`}
                        alt={`${userInfo.first_name} ${userInfo.last_name}`}
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="flex-1">
                        <textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Add a comment..."
                          className="w-full p-3 bg-gray-700 text-white rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:outline-none"
                          rows={3}
                        />
                        <button
                          onClick={handleAddComment}
                          disabled={!newComment.trim()}
                          className="mt-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Comment
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mb-6 p-4 bg-gray-700 rounded-lg text-center">
                    <p className="text-gray-300 mb-2">Sign in to leave a comment</p>
                    <button
                      onClick={() => navigate('/login')}
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
                                    onClick={handleEditComment}
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
                                className={`hover:text-purple-400 flex items-center ${comment.user_interaction?.liked ? 'text-purple-400' : ''}`}
                              >
                                <ThumbsUp className="h-4 w-4 mr-1" />
                                {comment.like_count || 0}
                              </button>
                              
                              {userInfo && (
                                <button
                                  onClick={() => setReplyTo(comment.id)}
                                  className="hover:text-purple-400"
                                >
                                  Reply
                                </button>
                              )}
                              
                              {userInfo?.id === comment.user.id && editingComment !== comment.id && (
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
                                    onClick={() => setDeletingComment(comment.id)}
                                    className="hover:text-red-400 flex items-center"
                                  >
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    Delete
                                  </button>
                                </>
                              )}
                            </div>

                            {/* Reply Form */}
                            {replyTo === comment.id && userInfo && (
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
                                    onClick={handleReplyComment}
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
                                                onClick={handleEditComment}
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
                                            className={`hover:text-purple-400 flex items-center ${reply.user_interaction?.liked ? 'text-purple-400' : ''}`}
                                          >
                                            <ThumbsUp className="h-3 w-3 mr-1" />
                                            {reply.like_count || 0}
                                          </button>
                                          
                                          {userInfo?.id === reply.user.id && editingComment !== reply.id && (
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

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Creator Info */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Creator
                </h3>
                <div className="flex items-center space-x-3">
                  <img
                    src={getFullAvatarUrl(animation.author.avatar) || `https://ui-avatars.com/api/?name=${animation.author.first_name}+${animation.author.last_name}&background=6366f1&color=fff`}
                    alt={`${animation.author.first_name} ${animation.author.last_name}`}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <h4 className="font-medium text-white">
                      {animation.author.first_name} {animation.author.last_name}
                    </h4>
                    <p className="text-gray-400 text-sm">@{animation.author.username}</p>
                  </div>
                </div>
              </div>

              {/* Animation Details */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Info className="h-5 w-5 mr-2" />
                  Details
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Category:</span>
                    <span className="text-white">{animation.category.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Type:</span>
                    <span className="text-white">{animation.animation_type.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Quality:</span>
                    <span className="text-white">{animation.video_quality}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Frame Rate:</span>
                    <span className="text-white">{animation.frame_rate} fps</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Resolution:</span>
                    <span className="text-white">{animation.resolution_formatted}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Language:</span>
                    <span className="text-white">{animation.language}</span>
                  </div>
                  {animation.release_year && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Release Year:</span>
                      <span className="text-white">{animation.release_year}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Production Team */}
              {(animation.director || animation.animator || animation.studio) && (
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Production Team
                  </h3>
                  <div className="space-y-3 text-sm">
                    {animation.director && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Director:</span>
                        <span className="text-white">{animation.director}</span>
                      </div>
                    )}
                    {animation.animator && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Animator:</span>
                        <span className="text-white">{animation.animator}</span>
                      </div>
                    )}
                    {animation.studio && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Studio:</span>
                        <span className="text-white">{animation.studio}</span>
                      </div>
                    )}
                    {animation.music_composer && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Music:</span>
                        <span className="text-white">{animation.music_composer}</span>
                      </div>
                    )}
                    {animation.sound_designer && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Sound:</span>
                        <span className="text-white">{animation.sound_designer}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Technical Info */}
              {(animation.animation_software || animation.render_engine) && (
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Settings className="h-5 w-5 mr-2" />
                    Technical Info
                  </h3>
                  <div className="space-y-3 text-sm">
                    {animation.animation_software && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Software:</span>
                        <span className="text-white">{animation.animation_software}</span>
                      </div>
                    )}
                    {animation.render_engine && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Render Engine:</span>
                        <span className="text-white">{animation.render_engine}</span>
                      </div>
                    )}
                    {animation.production_time && animation.production_time > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Production Time:</span>
                        <span className="text-white">{animation.production_time}h</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Series Info */}
              {animation.is_series && (
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Film className="h-5 w-5 mr-2" />
                    Series Info
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Series:</span>
                      <span className="text-white">{animation.series_name}</span>
                    </div>
                    {animation.season_number && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Season:</span>
                        <span className="text-white">{animation.season_number}</span>
                      </div>
                    )}
                    {animation.episode_number && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Episode:</span>
                        <span className="text-white">{animation.episode_number}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Delete Comment Modal */}
        {deletingComment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-white mb-4">Delete Comment</h3>
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete this comment? This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setDeletingComment(null)}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteComment(deletingComment)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default AnimationPlayerPage;
