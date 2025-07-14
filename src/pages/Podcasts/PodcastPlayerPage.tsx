// src/pages/Podcasts/PodcastPlayerPage.tsx
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
  List,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import podcastService from '../../services/podcastService';
import commentService from '../../services/commentService';
import MainLayout from '../../components/MainLayout/MainLayout';
import type { ContentItem } from '../../types';
import type { Comment } from '../../services/commentService';
import { config } from '../../config';
import { uiActions } from '../../store/reducers/uiReducers';

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

// Extended podcast interface with additional fields from the service
interface PodcastData extends ContentItem {
  audioFile?: string;
  videoFile?: string;
  transcriptFile?: string;
  episodeType?: string;
  isExplicit?: boolean;
  isPremium?: boolean;
  averageRating?: number;
  ratingCount?: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  userRating?: number;
  listenProgress?: number;
  episode?: number;
  season?: number;
  series?: {
    id: string;
    title: string;
    description: string;
  };
  guest?: string;
  audioUrl?: string;
  videoUrl?: string;
  commentCount?: number;
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

const PodcastPlayerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userInfo = useSelector((state: RootState) => state.user.userInfo);
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const commentsLoadedRef = useRef<string | null>(null);
  
  const [podcast, setPodcast] = useState<PodcastData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [hasVideo, setHasVideo] = useState(false);
  
  // Progress tracking
  const lastProgressUpdateRef = useRef<number>(0);
  const lastTrackTimeRef = useRef<number>(0); // Track the last time we sent progress
  const progressUpdateInterval = useRef<number | null>(null);
  
  // Comments state
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  
  // Comment edit/delete state
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [deletingComment, setDeletingComment] = useState<string | null>(null);
  
  // UI state
  const [showDescription, setShowDescription] = useState(false);
  const [controlsTimeout, setControlsTimeout] = useState<number | null>(null);

  // Authentication check - redirect to login if not authenticated
  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
      return;
    }
  }, [userInfo, navigate]);

  // Load podcast data
  useEffect(() => {
    const loadPodcast = async () => {
      if (!id) {
        setError('Invalid podcast ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const podcastData = await podcastService.getPodcast(id) as PodcastData;
        setPodcast(podcastData);
        
        // Check if podcast has video file
        const hasVideoFile = !!(podcastData.videoFile || podcastData.videoUrl);
        setHasVideo(hasVideoFile);
        
        // Set comment count
        setCommentCount(podcastData.commentCount || 0);
        
      } catch (err) {
        console.error('Error loading podcast:', err);
        setError(err instanceof Error ? err.message : 'Failed to load podcast');
      } finally {
        setLoading(false);
      }
    };

    loadPodcast();
  }, [id]);

  // Load comments
  const loadComments = useCallback(async (signal?: AbortSignal) => {
    if (!id || !podcast) return;
    
    // Prevent loading comments multiple times for the same podcast
    if (commentsLoadedRef.current === id) return;
    
    try {
      setCommentsLoading(true);
      
      if (signal?.aborted) return;
      
      // Use dedicated podcast comments method
      const commentsData = await commentService.getPodcastComments(id, 1, 20, signal);
      
      if (signal?.aborted) return;
      
      const commentsArray = commentsData.results || [];
      setComments(commentsArray);
      
      // Update comment count
      setCommentCount(commentsData.count || 0);
      
      // Only mark as loaded after successful completion
      commentsLoadedRef.current = id;
      
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      console.error('Error loading comments:', err);
      // Reset the ref on error so comments can be retried
      commentsLoadedRef.current = null;
    } finally {
      setCommentsLoading(false);
    }
  }, [id, podcast]);

  // Load comments when podcast is loaded
  useEffect(() => {
    const abortController = new AbortController();
    
    if (id && podcast) {
      // Reset the ref when userInfo changes (login/logout) or when podcast/id changes
      commentsLoadedRef.current = null;
      loadComments(abortController.signal);
    }
    
    // Cleanup function to cancel requests if component unmounts or dependencies change
    return () => {
      abortController.abort();
    };
  }, [id, podcast, userInfo, loadComments]);

  // Media event handlers
  const handleLoadedMetadata = () => {
    const mediaElement = hasVideo ? videoRef.current : audioRef.current;
    if (mediaElement) {
      setDuration(mediaElement.duration);
      
      // Set playback to previous progress if available
      if (podcast?.watchProgress && podcast.watchProgress > 0) {
        const startTime = mediaElement.duration * podcast.watchProgress;
        mediaElement.currentTime = startTime;
        setCurrentTime(startTime);
      }
    }
  };

  const handleTimeUpdate = () => {
    const mediaElement = hasVideo ? videoRef.current : audioRef.current;
    if (mediaElement) {
      setCurrentTime(mediaElement.currentTime);
      
      // Track progress every 30 seconds, but prevent multiple calls for the same second
      const currentSecond = Math.floor(mediaElement.currentTime);
      const now = Date.now();
      
      if (now - lastProgressUpdateRef.current > 30000 && currentSecond !== lastTrackTimeRef.current) {
        lastTrackTimeRef.current = currentSecond;
        trackProgress(mediaElement.currentTime);
        lastProgressUpdateRef.current = now;
      }
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    // Track completion
    if (duration > 0) {
      trackProgress(duration);
    }
  };

  // Progress tracking
  const trackProgress = async (currentTime: number) => {
    if (!podcast || !duration || currentTime < 0) return;
    
    try {
      const progress = Math.min((currentTime / duration) * 100, 100); // Convert to percentage (0-100)
      
      // Only track if we have valid data
      if (progress >= 0 && progress <= 100) {
        await podcastService.trackProgress(podcast.id, progress, currentTime);
      }
    } catch (error) {
      console.error('Error tracking progress:', error);
      // Don't throw error to prevent breaking audio/video playback
    }
  };

  // Player controls
  const togglePlayPause = () => {
    const mediaElement = hasVideo ? videoRef.current : audioRef.current;
    if (!mediaElement) return;

    if (isPlaying) {
      mediaElement.pause();
    } else {
      mediaElement.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !duration) return;
    
    const rect = progressRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;
    
    const mediaElement = hasVideo ? videoRef.current : audioRef.current;
    if (mediaElement) {
      mediaElement.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    
    const mediaElement = hasVideo ? videoRef.current : audioRef.current;
    if (mediaElement) {
      mediaElement.volume = newVolume;
    }
  };

  const toggleMute = () => {
    const mediaElement = hasVideo ? videoRef.current : audioRef.current;
    if (!mediaElement) return;

    if (isMuted) {
      mediaElement.volume = volume;
      setIsMuted(false);
    } else {
      mediaElement.volume = 0;
      setIsMuted(true);
    }
  };

  const skipForward = () => {
    const mediaElement = hasVideo ? videoRef.current : audioRef.current;
    if (mediaElement) {
      mediaElement.currentTime = Math.min(mediaElement.currentTime + 15, duration);
    }
  };

  const skipBackward = () => {
    const mediaElement = hasVideo ? videoRef.current : audioRef.current;
    if (mediaElement) {
      mediaElement.currentTime = Math.max(mediaElement.currentTime - 15, 0);
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackRate(speed);
    const mediaElement = hasVideo ? videoRef.current : audioRef.current;
    if (mediaElement) {
      mediaElement.playbackRate = speed;
    }
  };

  // Interaction handlers
  const handleLike = async () => {
    if (!podcast || !userInfo) return;

    try {
      await podcastService.likePodcast(podcast.id);
      setPodcast(prev => prev ? {
        ...prev,
        likes: (prev as PodcastData).isLiked ? prev.likes - 1 : prev.likes + 1,
        isLiked: !(prev as PodcastData).isLiked
      } : null);
    } catch (error) {
      console.error('Error liking podcast:', error);
    }
  };

  const handleBookmark = async () => {
    if (!podcast || !userInfo) return;

    try {
      await podcastService.bookmarkPodcast(podcast.id);
      setPodcast(prev => prev ? {
        ...prev,
        isBookmarked: !(prev as PodcastData).isBookmarked
      } : null);
    } catch (error) {
      console.error('Error bookmarking podcast:', error);
    }
  };

  // Comment handlers
  const handleAddComment = async () => {
    if (!newComment.trim() || !podcast || !userInfo) return;

    try {
      const commentData = {
        content_type_name: 'podcast',
        object_id: podcast.id,
        text: newComment.trim(),
      };
      
      const newCommentResponse = await commentService.createComment(commentData);
      
      setNewComment('');
      
      // Immediately add the comment to the local state for instant feedback
      const localComment = {
        ...newCommentResponse,
        user: {
          id: userInfo.id,
          username: userInfo.username,
          first_name: userInfo.first_name,
          last_name: userInfo.last_name,
          avatar_url: userInfo.avatar,
        },
        user_interaction: { liked: false, disliked: false },
        time_since: 'Just now'
      };
      
      setComments(prev => [localComment, ...prev]);
      setCommentCount(prev => prev + 1);
      
      // Also reload from server to get the authoritative state
      setTimeout(() => {
        commentsLoadedRef.current = null; // Reset ref to force reload
        loadComments();
      }, 1000);
      
    } catch (error) {
      console.error('Error adding comment:', error);
      dispatch(uiActions.addNotification({
        type: 'error',
        message: `Failed to add comment: ${error instanceof Error ? error.message : 'Unknown error'}`
      }));
    }
  };

  const handleReply = async (parentId: string) => {
    if (!replyText.trim() || !podcast || !userInfo) return;

    try {
      const commentData = {
        content_type_name: 'podcast',
        object_id: podcast.id,
        text: replyText.trim(),
        parent: parentId,
      };
      
      await commentService.createComment(commentData);
      
      setReplyText('');
      setReplyTo(null);
      
      // Reload comments to get the updated list with replies
      commentsLoadedRef.current = null; // Reset ref to force reload
      await loadComments();
      
    } catch (error) {
      console.error('Error replying to comment:', error);
      dispatch(uiActions.addNotification({
        type: 'error',
        message: 'Failed to add reply. Please try again.'
      }));
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editText.trim()) return;

    try {
      await commentService.updateComment(commentId, editText.trim());
      setEditingComment(null);
      setEditText('');
      
      // Reload comments to get the updated text
      commentsLoadedRef.current = null; // Reset ref to force reload
      await loadComments();
      
    } catch (error) {
      console.error('Error editing comment:', error);
      dispatch(uiActions.addNotification({
        type: 'error',
        message: 'Failed to edit comment. Please try again.'
      }));
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await commentService.deleteComment(commentId);
      setDeletingComment(null);
      
      // Reload comments to reflect the deletion
      commentsLoadedRef.current = null; // Reset ref to force reload
      await loadComments();
      
    } catch (error) {
      console.error('Error deleting comment:', error);
      dispatch(uiActions.addNotification({
        type: 'error',
        message: 'Failed to delete comment. Please try again.'
      }));
    }
  };

  const handleLikeComment = async (commentId: string) => {
    if (!userInfo) return;

    try {
      await commentService.interactWithComment(commentId, 'like');
      
      // Update comment like status locally
      setComments(prev => prev.map(comment => {
        if (comment.id === commentId) {
          const isLiked = comment.user_interaction?.liked || false;
          return {
            ...comment,
            like_count: isLiked ? comment.like_count - 1 : comment.like_count + 1,
            user_interaction: {
              ...comment.user_interaction,
              liked: !isLiked,
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
                const isLiked = reply.user_interaction?.liked || false;
                return {
                  ...reply,
                  like_count: isLiked ? reply.like_count - 1 : reply.like_count + 1,
                  user_interaction: {
                    ...reply.user_interaction,
                    liked: !isLiked,
                    disliked: false
                  }
                };
              }
              return reply;
            })
          };
        }
        
        return comment;
      }));
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlayPause();
          break;
        case 'arrowleft':
          e.preventDefault();
          skipBackward();
          break;
        case 'arrowright':
          e.preventDefault();
          skipForward();
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'l':
          if (userInfo) {
            e.preventDefault();
            handleLike();
          }
          break;
        case 'b':
          if (userInfo) {
            e.preventDefault();
            handleBookmark();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-hide controls for video
  useEffect(() => {
    if (!hasVideo) return;

    const resetControlsTimeout = () => {
      if (controlsTimeout) {
        clearTimeout(controlsTimeout);
      }
      setShowControls(true);
      const timeout = setTimeout(() => {
        if (isPlaying) {
          setShowControls(false);
        }
      }, 3000);
      setControlsTimeout(timeout);
    };

    const handleMouseMove = () => {
      resetControlsTimeout();
    };

    if (isPlaying) {
      resetControlsTimeout();
      document.addEventListener('mousemove', handleMouseMove);
    } else {
      setShowControls(true);
      if (controlsTimeout) {
        clearTimeout(controlsTimeout);
      }
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      if (controlsTimeout) {
        clearTimeout(controlsTimeout);
      }
    };
  }, [isPlaying, hasVideo]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup
  useEffect(() => {
    const currentProgressInterval = progressUpdateInterval.current;
    
    return () => {
      if (currentProgressInterval) {
        clearInterval(currentProgressInterval);
      }
    };
  }, []);

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-white text-xl">Loading podcast...</div>
        </div>
      </MainLayout>
    );
  }

  if (error || !podcast) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-red-500 text-xl">{error || 'Podcast not found'}</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-black text-white">
        {/* Header */}
        <div className="sticky top-0 z-50 bg-black/90 backdrop-blur-sm border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigate('/podcasts')}
                className="flex items-center text-gray-300 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Podcasts
              </button>

              <div className="flex items-center space-x-4">
                {userInfo && (
                  <>
                    <button
                      onClick={handleLike}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-colors ${
                        podcast.isLiked
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${podcast.isLiked ? 'fill-current' : ''}`} />
                      <span>{podcast.likes}</span>
                    </button>

                    <button
                      onClick={handleBookmark}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-colors ${
                        podcast.isBookmarked
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      <Bookmark className={`w-5 h-5 ${podcast.isBookmarked ? 'fill-current' : ''}`} />
                    </button>

                    <button className="flex items-center space-x-2 px-4 py-2 rounded-full bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors">
                      <Share2 className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Main Player */}
            <div className="xl:col-span-2">
              {/* Media Player */}
              <div className="bg-gray-900 rounded-lg overflow-hidden mb-6">
                {hasVideo ? (
                  <div className="relative aspect-video bg-black">
                    <video
                      ref={videoRef}
                      className="w-full h-full object-contain"
                      onLoadedMetadata={handleLoadedMetadata}
                      onTimeUpdate={handleTimeUpdate}
                      onEnded={handleEnded}
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                    >
                      <source src={getFullMediaUrl(podcast.videoFile || podcast.videoUrl)} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                    
                    {/* Video Controls Overlay */}
                    <div 
                      className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300 ${
                        showControls ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        {/* Progress Bar */}
                        <div 
                          ref={progressRef}
                          className="w-full h-2 bg-gray-600 rounded-full cursor-pointer mb-4"
                          onClick={handleSeek}
                        >
                          <div 
                            className="h-full bg-red-600 rounded-full relative"
                            style={{ width: `${(currentTime / duration) * 100}%` }}
                          >
                            <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg"></div>
                          </div>
                        </div>

                        {/* Control Buttons */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <button onClick={skipBackward} className="text-white hover:text-gray-300">
                              <SkipBack className="w-6 h-6" />
                            </button>
                            
                            <button 
                              onClick={togglePlayPause}
                              className="bg-white text-black rounded-full p-3 hover:bg-gray-200 transition-colors"
                            >
                              {isPlaying ? (
                                <Pause className="w-6 h-6" />
                              ) : (
                                <Play className="w-6 h-6 ml-1" />
                              )}
                            </button>
                            
                            <button onClick={skipForward} className="text-white hover:text-gray-300">
                              <SkipForward className="w-6 h-6" />
                            </button>

                            <div className="flex items-center space-x-2">
                              <button onClick={toggleMute} className="text-white hover:text-gray-300">
                                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                              </button>
                              <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={isMuted ? 0 : volume}
                                onChange={handleVolumeChange}
                                className="w-20"
                              />
                            </div>

                            <span className="text-white text-sm">
                              {formatTime(currentTime)} / {formatTime(duration)}
                            </span>
                          </div>

                          <div className="flex items-center space-x-2">
                            <select
                              value={playbackRate}
                              onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
                              className="bg-gray-800 text-white text-sm px-2 py-1 rounded"
                            >
                              <option value={0.5}>0.5x</option>
                              <option value={0.75}>0.75x</option>
                              <option value={1}>1x</option>
                              <option value={1.25}>1.25x</option>
                              <option value={1.5}>1.5x</option>
                              <option value={2}>2x</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Audio Player */
                  <div className="p-8">
                    <audio
                      ref={audioRef}
                      onLoadedMetadata={handleLoadedMetadata}
                      onTimeUpdate={handleTimeUpdate}
                      onEnded={handleEnded}
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                    >
                      <source src={getFullMediaUrl(podcast.audioFile || podcast.audioUrl)} type="audio/mpeg" />
                      Your browser does not support the audio tag.
                    </audio>

                    {/* Audio Player Visual */}
                    <div className="flex items-center space-x-6 mb-6">
                      {podcast.thumbnail && (
                        <img
                          src={getFullMediaUrl(podcast.thumbnail)}
                          alt={podcast.title}
                          className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                        />
                      )}
                      
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold text-white mb-2">{podcast.title}</h2>
                        {podcast.series && (
                          <p className="text-gray-400 mb-1">{podcast.series.title}</p>
                        )}
                        <p className="text-gray-400">
                          Episode {podcast.episode} • Season {podcast.season}
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div 
                      ref={progressRef}
                      className="w-full h-2 bg-gray-700 rounded-full cursor-pointer mb-4"
                      onClick={handleSeek}
                    >
                      <div 
                        className="h-full bg-red-600 rounded-full relative"
                        style={{ width: `${(currentTime / duration) * 100}%` }}
                      >
                        <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg"></div>
                      </div>
                    </div>

                    {/* Audio Controls */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <button onClick={skipBackward} className="text-gray-400 hover:text-white">
                          <SkipBack className="w-6 h-6" />
                        </button>
                        
                        <button 
                          onClick={togglePlayPause}
                          className="bg-red-600 text-white rounded-full p-4 hover:bg-red-700 transition-colors"
                        >
                          {isPlaying ? (
                            <Pause className="w-8 h-8" />
                          ) : (
                            <Play className="w-8 h-8 ml-1" />
                          )}
                        </button>
                        
                        <button onClick={skipForward} className="text-gray-400 hover:text-white">
                          <SkipForward className="w-6 h-6" />
                        </button>

                        <div className="flex items-center space-x-2">
                          <button onClick={toggleMute} className="text-gray-400 hover:text-white">
                            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                          </button>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={isMuted ? 0 : volume}
                            onChange={handleVolumeChange}
                            className="w-24"
                          />
                        </div>

                        <span className="text-gray-400 text-sm">
                          {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <select
                          value={playbackRate}
                          onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
                          className="bg-gray-800 text-white text-sm px-3 py-2 rounded"
                        >
                          <option value={0.5}>0.5x</option>
                          <option value={0.75}>0.75x</option>
                          <option value={1}>1x</option>
                          <option value={1.25}>1.25x</option>
                          <option value={1.5}>1.5x</option>
                          <option value={2}>2x</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Podcast Info */}
              <div className="bg-gray-900 rounded-lg p-6 mb-6">
                {hasVideo && (
                  <>
                    <h1 className="text-3xl font-bold text-white mb-4">{podcast.title}</h1>
                    {podcast.series && (
                      <p className="text-gray-400 mb-2">{podcast.series.title}</p>
                    )}
                    <p className="text-gray-400 mb-4">
                      Episode {podcast.episode} • Season {podcast.season}
                    </p>
                  </>
                )}

                <div className="flex items-center space-x-6 mb-4">
                  <div className="flex items-center text-gray-400">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>{formatTime(podcast.duration * 60)}</span>
                  </div>
                  <div className="flex items-center text-gray-400">
                    <Eye className="w-4 h-4 mr-2" />
                    <span>{podcast.views} plays</span>
                  </div>
                  <div className="flex items-center text-gray-400">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>{new Date(podcast.publishedAt || podcast.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {podcast.tags && podcast.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {podcast.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm flex items-center"
                      >
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {podcast.description && (
                  <div>
                    <button
                      onClick={() => setShowDescription(!showDescription)}
                      className="flex items-center text-gray-300 hover:text-white mb-2"
                    >
                      <span className="font-medium">Description</span>
                      {showDescription ? (
                        <ChevronUp className="w-4 h-4 ml-2" />
                      ) : (
                        <ChevronDown className="w-4 h-4 ml-2" />
                      )}
                    </button>
                    
                    {showDescription && (
                      <div 
                        className="text-gray-300 prose prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: podcast.description }}
                      />
                    )}
                  </div>
                )}
              </div>

              {/* Comments Section */}
              <div className="bg-gray-900 rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white flex items-center">
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Comments ({commentCount})
                  </h3>
                </div>

                {/* Add Comment */}
                {userInfo ? (
                  <div className="mb-6">
                    <div className="flex space-x-4">
                      <img
                        src={getFullAvatarUrl(userInfo.avatar) || '/default-avatar.png'}
                        alt={userInfo.username}
                        className="w-10 h-10 rounded-full flex-shrink-0"
                      />
                      <div className="flex-1">
                        <textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Add a comment..."
                          className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 resize-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          rows={3}
                        />
                        <div className="flex justify-between items-center mt-2">
                          <button
                            onClick={handleAddComment}
                            disabled={!newComment.trim()}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                          >
                            <Send className="w-4 h-4 mr-2" />
                            Comment
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mb-6 p-4 bg-gray-800 rounded-lg text-center">
                    <p className="text-gray-400 mb-2">Please log in to leave a comment</p>
                    <button
                      onClick={() => navigate('/login')}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Log In
                    </button>
                  </div>
                )}

                {/* Comments List */}
                {commentsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-4"></div>
                    <div className="text-gray-400">Loading comments...</div>
                  </div>
                ) : comments.length > 0 ? (
                  <div className="space-y-6">
                    {comments.map((comment) => (
                      <div key={comment.id} className="flex space-x-4">
                        <img
                          src={getFullAvatarUrl(comment.user.avatar_url) || '/default-avatar.png'}
                          alt={comment.user.username}
                          className="w-10 h-10 rounded-full flex-shrink-0"
                        />
                        <div className="flex-1">
                          <div className="bg-gray-800 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-white">
                                  {comment.user.first_name} {comment.user.last_name}
                                </span>
                                <span className="text-gray-500 text-sm">
                                  {comment.time_since || new Date(comment.created_at).toLocaleDateString()}
                                </span>
                                {comment.is_edited && (
                                  <span className="text-gray-500 text-xs">(edited)</span>
                                )}
                              </div>
                              
                              {/* Edit and Delete buttons for own comments */}
                              {userInfo && comment.user.id === userInfo.id && editingComment !== comment.id && (
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => {
                                      setEditingComment(comment.id);
                                      setEditText(comment.text);
                                    }}
                                    className="text-gray-400 hover:text-white transition-colors"
                                    title="Edit comment"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => setDeletingComment(comment.id)}
                                    className="text-gray-400 hover:text-red-400 transition-colors"
                                    title="Delete comment"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                            </div>
                            
                            {editingComment === comment.id ? (
                              <div>
                                <textarea
                                  value={editText}
                                  onChange={(e) => setEditText(e.target.value)}
                                  className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 mb-2 resize-none"
                                  rows={2}
                                />
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleEditComment(comment.id)}
                                    className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => {
                                      setEditingComment(null);
                                      setEditText('');
                                    }}
                                    className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 transition-colors"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <p className="text-gray-300 mb-3">{comment.text}</p>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-4 mt-2">
                            {userInfo && (
                              <button
                                onClick={() => handleLikeComment(comment.id)}
                                className={`flex items-center space-x-1 text-sm transition-colors ${
                                  comment.user_interaction?.liked
                                    ? 'text-red-400'
                                    : 'text-gray-400 hover:text-white'
                                }`}
                              >
                                <ThumbsUp className="w-4 h-4" />
                                <span>{comment.like_count}</span>
                              </button>
                            )}
                            
                            {userInfo && (
                              <button
                                onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                                className="text-gray-400 hover:text-white text-sm transition-colors"
                              >
                                Reply
                              </button>
                            )}
                          </div>
                          
                          {/* Reply Form */}
                          {replyTo === comment.id && (
                            <div className="mt-4 flex space-x-3">
                              <img
                                src={getFullAvatarUrl(userInfo?.avatar) || '/default-avatar.png'}
                                alt="Your avatar"
                                className="w-8 h-8 rounded-full flex-shrink-0"
                              />
                              <div className="flex-1">
                                <textarea
                                  value={replyText}
                                  onChange={(e) => setReplyText(e.target.value)}
                                  placeholder={`Reply to ${comment.user.first_name}...`}
                                  className="w-full bg-gray-800 text-white border border-gray-700 rounded px-3 py-2 resize-none text-sm"
                                  rows={2}
                                />
                                <div className="flex justify-end space-x-2 mt-2">
                                  <button
                                    onClick={() => setReplyTo(null)}
                                    className="px-3 py-1 text-gray-400 hover:text-white text-sm transition-colors"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => handleReply(comment.id)}
                                    disabled={!replyText.trim()}
                                    className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                  >
                                    Reply
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Show replies if available */}
                          {comment.replies && comment.replies.length > 0 && (
                            <div className="mt-4 ml-4 space-y-4 border-l-2 border-gray-700 pl-4">
                              {comment.replies.map((reply) => (
                                <div key={reply.id} className="flex space-x-3">
                                  <img
                                    src={getFullAvatarUrl(reply.user.avatar_url) || '/default-avatar.png'}
                                    alt={reply.user.username}
                                    className="w-8 h-8 rounded-full flex-shrink-0"
                                  />
                                  <div className="flex-1">
                                    <div className="bg-gray-800 rounded-lg p-3">
                                      <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center space-x-2">
                                          <span className="font-medium text-white text-sm">
                                            {reply.user.first_name} {reply.user.last_name}
                                          </span>
                                          <span className="text-gray-500 text-xs">
                                            {reply.time_since || new Date(reply.created_at).toLocaleDateString()}
                                          </span>
                                          {reply.is_edited && (
                                            <span className="text-gray-500 text-xs">(edited)</span>
                                          )}
                                        </div>
                                        
                                        {/* Edit and Delete buttons for own replies */}
                                        {userInfo && reply.user.id === userInfo.id && editingComment !== reply.id && (
                                          <div className="flex items-center space-x-2">
                                            <button
                                              onClick={() => {
                                                setEditingComment(reply.id);
                                                setEditText(reply.text);
                                              }}
                                              className="text-gray-400 hover:text-white transition-colors"
                                              title="Edit reply"
                                            >
                                              <Edit className="w-3 h-3" />
                                            </button>
                                            <button
                                              onClick={() => setDeletingComment(reply.id)}
                                              className="text-gray-400 hover:text-red-400 transition-colors"
                                              title="Delete reply"
                                            >
                                              <Trash2 className="w-3 h-3" />
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                      
                                      {editingComment === reply.id ? (
                                        <div>
                                          <textarea
                                            value={editText}
                                            onChange={(e) => setEditText(e.target.value)}
                                            className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 mb-2 resize-none text-sm"
                                            rows={2}
                                          />
                                          <div className="flex space-x-2">
                                            <button
                                              onClick={() => handleEditComment(reply.id)}
                                              className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition-colors"
                                            >
                                              Save
                                            </button>
                                            <button
                                              onClick={() => {
                                                setEditingComment(null);
                                                setEditText('');
                                              }}
                                              className="px-3 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-700 transition-colors"
                                            >
                                              Cancel
                                            </button>
                                          </div>
                                        </div>
                                      ) : (
                                        <p className="text-gray-300 text-sm">{reply.text}</p>
                                      )}
                                    </div>
                                    
                                    {/* Like button for replies */}
                                    {userInfo && editingComment !== reply.id && (
                                      <div className="flex items-center space-x-4 mt-2">
                                        <button
                                          onClick={() => handleLikeComment(reply.id)}
                                          className={`flex items-center space-x-1 text-xs transition-colors ${
                                            reply.user_interaction?.liked
                                              ? 'text-red-400'
                                              : 'text-gray-400 hover:text-white'
                                          }`}
                                        >
                                          <ThumbsUp className="w-3 h-3" />
                                          <span>{reply.like_count}</span>
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 mb-2">No comments yet</p>
                    <p className="text-gray-500 text-sm">Be the first to share your thoughts!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Episode Info */}
              <div className="bg-gray-900 rounded-lg p-6">
                <h3 className="text-lg font-bold text-white mb-4">Episode Details</h3>
                
                {podcast.author && (
                  <div className="flex items-center space-x-3 mb-4">
                    <User className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-300">{podcast.author.name}</span>
                  </div>
                )}
                
                {podcast.series && (
                  <div className="flex items-center space-x-3 mb-4">
                    <List className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-300">{podcast.series.title}</span>
                  </div>
                )}
                
                <div className="flex items-center space-x-3 mb-4">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-300">{formatTime(podcast.duration * 60)}</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Eye className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-300">{podcast.views} plays</span>
                </div>
              </div>

              {/* Keyboard Shortcuts */}
              <div className="bg-gray-900 rounded-lg p-6">
                <h3 className="text-lg font-bold text-white mb-4">Keyboard Shortcuts</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Play/Pause</span>
                    <span className="text-gray-300">Space, K</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Skip Forward</span>
                    <span className="text-gray-300">→</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Skip Backward</span>
                    <span className="text-gray-300">←</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Mute</span>
                    <span className="text-gray-300">M</span>
                  </div>
                  {userInfo && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Like</span>
                        <span className="text-gray-300">L</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Bookmark</span>
                        <span className="text-gray-300">B</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Delete Comment Modal */}
        {deletingComment && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-bold text-white mb-4">Delete Comment</h3>
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete this comment? This action cannot be undone.
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={() => handleDeleteComment(deletingComment)}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
                <button
                  onClick={() => setDeletingComment(null)}
                  className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default PodcastPlayerPage;
