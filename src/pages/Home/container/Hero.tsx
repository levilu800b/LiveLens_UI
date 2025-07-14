import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Play, 
  Sparkles, 
  ArrowRight, 
  Volume2, 
  VolumeX, 
  Heart, 
  MessageCircle, 
  Send,
  Users,
  X,
  LogIn
} from 'lucide-react';
import liveVideoService from '../../../services/liveVideoService';
import { useNavigate } from 'react-router-dom';

interface LiveVideoData {
  id: string;
  slug?: string;
  title?: string;
  live_status?: string;
  video_file?: string;
  current_viewers?: number;
  like_count?: number;
  comment_count?: number;
}

const Hero = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [currentLiveVideo, setCurrentLiveVideo] = useState<LiveVideoData | null>(null);
  const [hasTriedFetch, setHasTriedFetch] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  
  // Live video controls
  const [isMuted, setIsMuted] = useState(true);
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<Array<{id: string, user: string, text: string, timestamp: Date}>>([]);
  const [reactions, setReactions] = useState<Array<{id: string, type: string, x: number, y: number}>>([]);
  const [viewerCount, setViewerCount] = useState(() => {
    const saved = localStorage.getItem('hero_viewer_count');
    return saved ? parseInt(saved) : 0;
  });
  const [likeCount, setLikeCount] = useState(() => {
    const saved = localStorage.getItem('hero_like_count');
    return saved ? parseInt(saved) : 0;
  });
  const [commentCount, setCommentCount] = useState(() => {
    const saved = localStorage.getItem('hero_comment_count');
    return saved ? parseInt(saved) : 0;
  });
  
  // Check authentication status
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    setIsAuthenticated(!!token);
  }, []);
  
  useEffect(() => {
    setIsVisible(true);
  }, []);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  };

  const fetchVideoStats = useCallback(async (videoSlugOrId: string) => {
    if (!currentLiveVideo) return;
    
    try {
      // Fetch real comments from your backend using the generic comments API (uses ID)
      // Get all comments by setting a high page_size
      const commentsResponse = await fetch(`/api/comments/?content_type=livevideo&object_id=${currentLiveVideo.id}&page_size=1000`, {
        headers: getAuthHeaders(),
      });
      if (commentsResponse.ok) {
        const commentsData = await commentsResponse.json();
        const commentsList = commentsData.results || [];
        console.log('Fetched comments:', commentsList); // Debug log
        const formattedComments = commentsList.map((comment: {id: string, user?: {username: string}, text: string, created_at: string}) => ({
          id: comment.id,
          user: comment.user?.username || 'Anonymous',
          text: comment.text,
          timestamp: new Date(comment.created_at)
        }));
        setComments(formattedComments);
        // Update comment count with real data from the total count
        setCommentCount(commentsData.count || commentsList.length);
      }
      
      // Fetch real likes from your live video API (uses slug)
      const videoSlug = currentLiveVideo.slug || videoSlugOrId;
      const likesResponse = await fetch(`/api/live-video/live-videos/${videoSlug}/`, {
        headers: getAuthHeaders(),
      });
      if (likesResponse.ok) {
        const videoData = await likesResponse.json();
        console.log('Fetched video data:', videoData); // Debug log
        // Update like count with real data
        setLikeCount(videoData.like_count || 0);
        // Also update viewer count
        setViewerCount(videoData.current_viewers || 1);
      }
    } catch (error) {
      console.info('Stats endpoints not yet implemented:', error);
    }
  }, [currentLiveVideo]);

  // Separate effect for fetching live video with auto-refresh
  useEffect(() => {
    const fetchCurrentLiveVideo = async () => {
      try {
        setHasTriedFetch(true);
        const liveVideo = await liveVideoService.getCurrentLiveVideo();
        if (liveVideo) {
          setCurrentLiveVideo(liveVideo);
          // Update viewer count with real data, but don't decrease if we have more locally  
          setViewerCount(prev => Math.max(prev, liveVideo.current_viewers || 1));
          
          // Fetch real comments and likes data
          await fetchVideoStats(liveVideo.slug || liveVideo.id);
        }
      } catch {
        // Backend endpoints not implemented yet - silently handle
        setCurrentLiveVideo(null);
        console.info('Live video feature not available: Backend endpoints need to be implemented');
      }
    };

    if (!hasTriedFetch) {
      fetchCurrentLiveVideo();
    }

    // Set up auto-refresh every 30 seconds to get latest uploads
    const interval = setInterval(fetchCurrentLiveVideo, 30000);
    
    return () => clearInterval(interval);
  }, [hasTriedFetch, fetchVideoStats]);

  // Persist counts to localStorage
  useEffect(() => {
    localStorage.setItem('hero_viewer_count', viewerCount.toString());
  }, [viewerCount]);

  useEffect(() => {
    localStorage.setItem('hero_like_count', likeCount.toString());
  }, [likeCount]);

  useEffect(() => {
    localStorage.setItem('hero_comment_count', commentCount.toString());
  }, [commentCount]);

  // Clear localStorage when component unmounts (optional)
  useEffect(() => {
    return () => {
      // Uncomment these lines if you want counts to reset when leaving the page
      // localStorage.removeItem('hero_viewer_count');
      // localStorage.removeItem('hero_like_count'); 
      // localStorage.removeItem('hero_comment_count');
    };
  }, []);

  // Update viewer count periodically for live videos and optimize auto-play
  useEffect(() => {
    if (currentLiveVideo && videoRef.current) {
      const video = videoRef.current;
      
      // Immediate video setup for instant playback
      const setupVideo = async () => {
        try {
          // Set video properties for optimal loading
          video.preload = 'auto'; // Changed from 'metadata' to 'auto' for faster loading
          video.muted = isMuted;
          video.loop = true; // Enable loop for immediate replay
          video.playsInline = true;
          video.crossOrigin = 'anonymous'; // Allow cross-origin for better loading
          
          // Set source if different
          if (video.src !== currentLiveVideo.video_file) {
            video.src = currentLiveVideo.video_file || '';
          }
          
          // Force load the video data immediately
          video.load();
          
          // Wait for video to be ready and play immediately
          const playWhenReady = () => {
            video.play().catch(error => {
              console.info('Autoplay prevented by browser, user interaction required:', error);
            });
          };
          
          if (video.readyState >= 3) { // HAVE_FUTURE_DATA
            playWhenReady();
          } else {
            // Use both loadeddata and canplay for better compatibility
            video.addEventListener('loadeddata', playWhenReady, { once: true });
            video.addEventListener('canplay', playWhenReady, { once: true });
          }
          
          // Handle video end for immediate replay
          const handleVideoEnd = () => {
            video.currentTime = 0;
            video.play().catch(console.info);
          };
          
          video.addEventListener('ended', handleVideoEnd);
          
          // Preload the next frame when video metadata loads
          video.addEventListener('loadedmetadata', () => {
            video.currentTime = 0.1; // Seek to small time to trigger frame loading
            video.currentTime = 0; // Reset to beginning
          }, { once: true });
          
          // Cleanup function
          return () => {
            video.removeEventListener('ended', handleVideoEnd);
          };
          
        } catch (error) {
          console.info('Video setup error:', error);
        }
      };
      
      setupVideo();
    }
  }, [currentLiveVideo, isMuted]);

  // Improved toggle mute function to prevent video restart
  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      const video = videoRef.current;
      const newMutedState = !isMuted;
      
      // Store current time to prevent restart
      const currentTime = video.currentTime;
      const wasPlaying = !video.paused;
      
      // Update mute state
      video.muted = newMutedState;
      setIsMuted(newMutedState);
      
      // Ensure video continues from same position
      if (wasPlaying && video.paused) {
        video.currentTime = currentTime;
        video.play().catch(console.info);
      }
    }
  }, [isMuted]);

  const addLikeToBackend = async (videoSlug: string) => {
    try {
      console.log('Sending like for video slug:', videoSlug); // Debug log

      const response = await fetch(`/api/live-video/live-videos/${videoSlug}/interact/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          interaction_type: 'like'
        }),
      });
      
      if (response.ok) {
        const responseData = await response.json();
        console.log('Like response:', responseData); // Debug log
        // Refresh stats after successful like
        await fetchVideoStats(videoSlug);
      } else {
        const errorData = await response.text();
        console.info('Backend like failed:', response.status, errorData);
      }
    } catch (error) {
      console.info('Error adding like:', error);
    }
  };

  const addCommentToBackend = async (videoId: string, commentText: string) => {
    try {
      const response = await fetch(`/api/comments/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          content_type_name: 'livevideo',
          object_id: videoId,
          text: commentText,
        }),
      });
      
      if (response.ok) {
        // Refresh stats after successful comment
        await fetchVideoStats(videoId);
      } else {
        const errorData = await response.text();
        console.info('Backend comment failed:', response.status, errorData);
      }
    } catch (error) {
      console.info('Error adding comment:', error);
    }
  };

  // Authentication-aware comment function
  const sendComment = async () => {
    if (!comment.trim()) return;
    
    // Check authentication for commenting
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      return;
    }
    
    // If we have a current live video, add to backend
    if (currentLiveVideo?.id) {
      await addCommentToBackend(currentLiveVideo.id, comment.trim());
    }
    
    // Always add locally for immediate feedback
    const newComment = {
      id: Date.now().toString(),
      user: 'You',
      text: comment.trim(),
      timestamp: new Date()
    };
    setComments(prev => [newComment, ...prev]); // Add to beginning instead of limiting to 20
    setCommentCount(prev => prev + 1);
    setComment('');
  };

  // Authentication-aware reaction function
  const addReaction = async (type: string, event: React.MouseEvent) => {
    // Check authentication for liking
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      return;
    }
    
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    
    const reaction = {
      id: Date.now().toString(),
      type,
      x,
      y
    };
    
    setReactions(prev => [...prev, reaction]);
    
    // Add like to backend if there's a current video
    if (currentLiveVideo?.slug) {
      await addLikeToBackend(currentLiveVideo.slug);
    }
    
    // Always increment locally for immediate feedback
    setLikeCount(prev => prev + 1);
    
    // Remove reaction after animation
    setTimeout(() => {
      setReactions(prev => prev.filter(r => r.id !== reaction.id));
    }, 2000);
  };

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          
          {/* Text Content */}
          <div className={`transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 backdrop-blur-sm mb-6">
              <Sparkles className="h-4 w-4 text-purple-400 mr-2" />
              <span className="text-sm text-purple-300 font-medium">New Stories Every Day</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
              <span className="bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                Where Stories
              </span>
              <br />
              <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Come Alive
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl text-gray-300 leading-relaxed mb-8 max-w-lg">
              Immerse yourself in a world of captivating stories, breathtaking films, 
              engaging podcasts, and stunning animations. Your journey into extraordinary 
              content starts here.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 mb-10">
              <div className="text-center">
                <div className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">10K+</div>
                <div className="text-sm text-gray-400">Stories</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">5K+</div>
                <div className="text-sm text-gray-400">Films</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text text-transparent">2K+</div>
                <div className="text-sm text-gray-400">Podcasts</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="group bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 hover:scale-105 shadow-2xl hover:shadow-purple-500/25 flex items-center justify-center">
                Discover
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
              </button>
              
              <button className="group bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 hover:scale-105 flex items-center justify-center">
                <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                Watch Demo
              </button>
            </div>
          </div>

          {/* Enhanced Live Video Player - Restored Original Design */}
          <div className={`transform transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <div className="relative">
              
              {/* Main Video Container - Back to Original 4:5 Aspect */}
              <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl">
                <div className="aspect-[4/5] bg-gradient-to-br from-slate-800 to-slate-900 relative group">
                  
                  {/* Video Element or Gradient Overlay */}
                  {currentLiveVideo ? (
                    <>
                      <video
                        ref={videoRef}
                        className="absolute inset-0 w-full h-full object-cover"
                        muted={isMuted}
                        autoPlay
                        playsInline
                        loop
                        preload="auto"
                        crossOrigin="anonymous"
                        src={currentLiveVideo?.video_file || undefined}
                        onClick={(e) => addReaction('❤️', e)}
                        onLoadedData={() => {
                          // Ensure video starts playing immediately when data is loaded
                          if (videoRef.current) {
                            videoRef.current.play().catch(console.info);
                          }
                        }}
                        onCanPlay={() => {
                          // Additional play attempt when video can play
                          if (videoRef.current) {
                            videoRef.current.play().catch(console.info);
                          }
                        }}
                        onLoadStart={() => {
                          // Set ready state for immediate playback
                          if (videoRef.current) {
                            videoRef.current.currentTime = 0;
                          }
                        }}
                      />
                      {/* Live Status Badge */}
                      <div className="absolute top-4 left-4 z-20">
                        <div className="inline-flex items-center px-3 py-1 bg-red-500/90 backdrop-blur-md rounded-full">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-2"></div>
                          <span className="text-sm text-white font-bold">LIVE</span>
                        </div>
                      </div>
                      
                      {/* Sparkles Element - Top Right */}
                      <div className="absolute top-4 right-4 z-20 bg-white/10 backdrop-blur-md rounded-full p-3">
                        <Sparkles className="h-6 w-6 text-purple-400 animate-pulse" />
                      </div>
                      
                      {/* Viewer Count - Below Sparkles */}
                      <div className="absolute top-20 right-4 z-20">
                        <div className="inline-flex items-center px-3 py-1 bg-black/50 backdrop-blur-md rounded-full">
                          <Users className="h-4 w-4 text-white mr-1" />
                          <span className="text-sm text-white font-medium">{viewerCount}</span>
                        </div>
                      </div>

                      {/* Compact Controls - Bottom Right */}
                      <div className="absolute bottom-4 right-4 z-20 flex space-x-2">
                        <button
                          onClick={toggleMute}
                          className="p-2 bg-black/50 backdrop-blur-md rounded-full hover:bg-black/70 transition-colors"
                        >
                          {isMuted ? (
                            <VolumeX className="h-4 w-4 text-white" />
                          ) : (
                            <Volume2 className="h-4 w-4 text-white" />
                          )}
                        </button>
                        
                        <button
                          onClick={() => setShowComments(!showComments)}
                          className="relative p-2 bg-black/50 backdrop-blur-md rounded-full hover:bg-black/70 transition-colors"
                        >
                          <MessageCircle className="h-4 w-4 text-white" />
                          {commentCount > 0 && (
                            <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                              {commentCount > 99 ? '99+' : commentCount}
                            </div>
                          )}
                        </button>
                        
                        <button
                          onClick={(e) => addReaction('❤️', e)}
                          className={`relative p-2 backdrop-blur-md rounded-full transition-colors ${
                            isAuthenticated 
                              ? 'bg-red-500/80 hover:bg-red-500' 
                              : 'bg-gray-500/80 hover:bg-gray-600'
                          }`}
                          title={isAuthenticated ? 'Like this video' : 'Login to like'}
                        >
                          <Heart className="h-4 w-4 text-white" />
                          {likeCount > 0 && (
                            <div className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                              {likeCount > 99 ? '99+' : likeCount}
                            </div>
                          )}
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-t from-purple-900/80 via-transparent to-pink-900/20">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center p-8">
                          <div className="w-24 h-24 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mx-auto mb-6 flex items-center justify-center">
                            <Play className="h-12 w-12 text-white" />
                          </div>
                          <h3 className="text-2xl font-bold text-white mb-2">No Videos Yet</h3>
                          <p className="text-gray-300 mb-6">Videos will appear here when uploaded by admin</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Floating Reactions */}
                  {reactions.map((reaction) => (
                    <div
                      key={reaction.id}
                      className="absolute pointer-events-none text-2xl z-20"
                      style={{
                        left: `${reaction.x}%`,
                        top: `${reaction.y}%`,
                        animation: 'float-up 2s ease-out forwards'
                      }}
                    >
                      {reaction.type}
                    </div>
                  ))}

                  {/* Original Bottom Status */}
                  <div className="absolute bottom-4 left-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                    <div className="flex items-center space-x-2">
                      {currentLiveVideo ? (
                        <>
                          <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                          <span className="text-sm text-white font-medium">Live Now</span>
                        </>
                      ) : (
                        <>
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          <span className="text-sm text-white font-medium">Stories Available</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Compact Comments Sidebar */}
              {showComments && currentLiveVideo && (
                <div className="absolute right-0 top-0 w-72 h-full bg-black/90 backdrop-blur-md z-30 rounded-r-3xl flex flex-col">
                  
                  {/* Comments Header */}
                  <div className="p-4 border-b border-white/20 flex items-center justify-between">
                    <h4 className="text-white font-semibold text-sm">Live Chat</h4>
                    <button
                      onClick={() => setShowComments(false)}
                      className="p-1 hover:bg-white/20 rounded-full transition-colors"
                    >
                      <X className="h-4 w-4 text-white" />
                    </button>
                  </div>

                  {/* Comments List */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-2 max-h-96">
                    {comments.map((comment) => (
                      <div key={comment.id} className="text-xs">
                        <span className="text-purple-400 font-medium">{comment.user}</span>
                        <span className="text-white ml-1">{comment.text}</span>
                        <div className="text-gray-500 text-xs mt-1">
                          {comment.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    ))}
                    {comments.length === 0 && (
                      <div className="text-center text-gray-400 py-4">
                        <MessageCircle className="h-6 w-6 mx-auto mb-2 opacity-50" />
                        <p className="text-xs">No comments yet</p>
                        <p className="text-xs">Be the first to comment!</p>
                      </div>
                    )}
                    {comments.length > 0 && (
                      <div className="text-center text-gray-500 text-xs py-2 border-t border-white/10">
                        Showing {comments.length} comment{comments.length !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>

                  {/* Comment Input */}
                  <div className="p-3 border-t border-white/20">
                    {isAuthenticated ? (
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder="Comment..."
                          className="flex-1 bg-white/10 border border-white/20 rounded-full px-3 py-1 text-white text-xs placeholder-gray-400 focus:outline-none focus:border-purple-400"
                          onKeyPress={(e) => e.key === 'Enter' && sendComment()}
                        />
                        <button
                          onClick={sendComment}
                          disabled={!comment.trim()}
                          className="p-1 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-full transition-colors"
                        >
                          <Send className="h-3 w-3 text-white" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowLoginPrompt(true)}
                        className="w-full py-2 px-3 bg-gradient-to-r from-purple-500/80 to-pink-500/80 hover:from-purple-600 hover:to-pink-600 text-white text-xs rounded-full transition-colors flex items-center justify-center space-x-2"
                      >
                        <LogIn className="h-3 w-3" />
                        <span>Login to Comment</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Original Decorative Elements */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-r from-cyan-400/20 to-purple-400/20 rounded-full blur-xl animate-pulse z-0"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-r from-pink-400/20 to-purple-400/20 rounded-full blur-xl animate-pulse delay-1000 z-0"></div>
              
              {/* Original Floating Cards */}
              <div className="absolute -left-12 top-1/3 z-20 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 transform rotate-6 hover:rotate-3 transition-transform duration-300 hidden lg:block">
                <div className="w-16 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg mb-2"></div>
                <div className="text-xs text-white font-medium">Stories</div>
                <div className="text-xs text-gray-400">10K+ Available</div>
              </div>
              
              <div className="absolute -right-12 top-2/3 z-20 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 transform -rotate-6 hover:-rotate-3 transition-transform duration-300 hidden lg:block">
                <div className="w-16 h-12 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-lg mb-2"></div>
                <div className="text-xs text-white font-medium">Films</div>
                <div className="text-xs text-gray-400">HD Quality</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 max-w-md w-full border border-white/20">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <LogIn className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Login Required</h3>
              <p className="text-gray-300 mb-6">Please login to comment and like videos</p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowLoginPrompt(false)}
                  className="flex-1 py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowLoginPrompt(false);
                    navigate('/login');
                  }}
                  className="flex-1 py-2 px-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-colors"
                >
                  Login
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Responsive Scroll Indicator */}
      <div className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-5 h-8 sm:w-6 sm:h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-0.5 sm:w-1 h-2 sm:h-3 bg-gradient-to-b from-purple-400 to-pink-400 rounded-full mt-1.5 sm:mt-2 animate-pulse"></div>
        </div>
      </div>

      {/* Custom Animations */}
      <style>{`
        @keyframes float-up {
          0% {
            opacity: 1;
            transform: translateY(0px) scale(1);
          }
          50% {
            opacity: 1;
            transform: translateY(-20px) scale(1.2);
          }
          100% {
            opacity: 0;
            transform: translateY(-40px) scale(0.8);
          }
        }
      `}</style>
    </section>
  );
};

export default Hero;