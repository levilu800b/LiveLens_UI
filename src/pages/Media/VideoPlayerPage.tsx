// src/pages/Media/VideoPlayerPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
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
  Star,
  ThumbsUp,
  Send,
  Tag,
  Users,
  Eye,
  Subtitles,
  X,
  HelpCircle,
  Edit,
  Trash2
} from 'lucide-react';
import { useSelector } from 'react-redux';
import mediaService from '../../services/mediaService';
import commentService from '../../services/commentService';
import MainLayout from '../../components/MainLayout/MainLayout';
import type { Film, Content, Subtitle } from '../../services/mediaService';
import type { Comment } from '../../services/commentService';
import { config } from '../../config';
import unifiedAuth from '../../utils/unifiedAuth';

// Add subtitle styling
const subtitleStyles = `
  video::cue {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 18px;
    color: white;
    background-color: rgba(0, 0, 0, 0.8);
    text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.9);
    padding: 2px 6px;
    border-radius: 2px;
  }
  
  video::cue(.large) {
    font-size: 24px;
  }
  
  video::cue(.small) {
    font-size: 14px;
  }
`;

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

const VideoPlayerPage: React.FC = () => {
  const { type, id } = useParams<{ type: string; id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const userInfo = useSelector((state: RootState) => state.user.userInfo);
  const videoRef = useRef<HTMLVideoElement>(null);
  const commentsLoadedRef = useRef<string | null>(null);
  
  const [media, setMedia] = useState<Film | Content | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTrailer, setIsTrailer] = useState(false);
  
  // Video player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [quality, setQuality] = useState('auto');
  
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
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  
  // Subtitle state
  const [subtitles, setSubtitles] = useState<Subtitle[]>([]);
  const [currentSubtitle, setCurrentSubtitle] = useState<string | null>(null);
  const [showSubtitleMenu, setShowSubtitleMenu] = useState(false);
  const [subtitleSize, setSubtitleSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [subtitleDelay, setSubtitleDelay] = useState(0);
  const [currentSubtitleText, setCurrentSubtitleText] = useState<string>('');
  const [subtitleCues, setSubtitleCues] = useState<Array<{start: number, end: number, text: string}>>([]);

  // Load media data
  useEffect(() => {
    const loadMedia = async () => {
      if (!type || !id) {
        setError('Invalid media parameters');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        let mediaData: Film | Content;
        
        if (type === 'film') {
          mediaData = await mediaService.getFilm(id);
        } else if (type === 'content') {
          mediaData = await mediaService.getContentItem(id);
        } else {
          throw new Error('Invalid media type');
        }
        
        setMedia(mediaData);
        
        // Initialize comment count from media data
        setCommentCount(mediaData.comment_count || 0);
        
        // Reset comments loaded ref for new media
        commentsLoadedRef.current = null;
        
        // Reset comments for new media
        setComments([]);
        
        // Load subtitles if available (for now, create sample data based on subtitles_available)
        if (mediaData.subtitles && Array.isArray(mediaData.subtitles)) {
          setSubtitles(mediaData.subtitles);
          
          // Set default subtitle
          const defaultSubtitle = mediaData.subtitles.find((sub: Subtitle) => sub.is_default);
          if (defaultSubtitle) {
            setCurrentSubtitle(defaultSubtitle.id);
          }
        } else if (mediaData.subtitles_available && mediaData.subtitles_available.length > 0) {
          // Create sample subtitle data based on available languages
          const sampleSubtitles: Subtitle[] = mediaData.subtitles_available.map((lang, index) => ({
            id: `subtitle_${index}`,
            language: lang,
            language_code: lang.toLowerCase().substring(0, 2),
            label: lang,
            url: createSampleSubtitleFile(lang), // Use sample VTT file
            is_default: index === 0
          }));
          
          setSubtitles(sampleSubtitles);
          
          // Set first language as default
          if (sampleSubtitles.length > 0) {
            setCurrentSubtitle(sampleSubtitles[0].id);
          }
        } else {
          // Create default demo subtitles when none are available
          const demoSubtitles: Subtitle[] = [
            {
              id: 'demo_english',
              language: 'English',
              language_code: 'en',
              label: 'English',
              url: createSampleSubtitleFile('English'),
              is_default: true
            },
            {
              id: 'demo_spanish',
              language: 'Spanish',
              language_code: 'es',
              label: 'Español',
              url: createSampleSubtitleFile('Spanish'),
              is_default: false
            },
            {
              id: 'demo_french',
              language: 'French',
              language_code: 'fr',
              label: 'Français',
              url: createSampleSubtitleFile('French'),
              is_default: false
            }
          ];
          
          setSubtitles(demoSubtitles);
          // Don't set any subtitle as default for demo
        }
        
        // Determine if this is a trailer based on URL params
        const urlParams = new URLSearchParams(location.search);
        const isTrailerParam = urlParams.get('trailer') === 'true';
        setIsTrailer(isTrailerParam);
        
        // Reset video state when switching between trailer and full video
        if (videoRef.current) {
          videoRef.current.currentTime = 0;
          setCurrentTime(0);
          setIsPlaying(false);
        }
        
      } catch (err) {
        console.error('Error loading media:', err);
        setError(err instanceof Error ? err.message : 'Failed to load media');
      } finally {
        setLoading(false);
      }
    };

    loadMedia();
  }, [type, id, location.search]); // Added location.search to dependencies

  // Load comments
  useEffect(() => {
    const loadComments = async () => {
      if (!media) return;
      
      // Prevent loading comments multiple times for the same media
      if (commentsLoadedRef.current === media.id) return;
      
      try {
        setCommentsLoading(true);
        commentsLoadedRef.current = media.id;
        const commentsData = type === 'film' 
          ? await commentService.getComments({
              content_type: 'film',
              object_id: media.id,
              page: 1,
              page_size: 20,
              ordering: '-created_at'
            })
          : await commentService.getComments({
              content_type: 'content',
              object_id: media.id,
              page: 1,
              page_size: 20,
              ordering: '-created_at'
            });
        
        setComments(commentsData.results || []);
        
        // Update comment count with accurate server data
        const actualCount = commentsData.count !== undefined ? commentsData.count : commentsData.results?.length || 0;
        setCommentCount(prevCount => prevCount !== actualCount ? actualCount : prevCount);
      } catch (err) {
        console.error('Error loading comments:', err);
        // Reset the ref on error so comments can be retried
        commentsLoadedRef.current = null;
      } finally {
        setCommentsLoading(false);
      }
    };

    loadComments();
  }, [media, type]);

  // Load subtitle tracks when subtitles change
  useEffect(() => {
    if (subtitles.length > 0 && videoRef.current) {
      subtitles.forEach(subtitle => {
        loadSubtitleTrack(subtitle);
      });
    }
  }, [subtitles]);

  // Apply subtitle styles
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = subtitleStyles;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // Get video URL
  const getVideoUrl = (): string | undefined => {
    if (!media) return undefined;
    
    if (isTrailer) {
      return getFullMediaUrl(media.trailer_file);
    } else {
      return getFullMediaUrl(media.video_file);
    }
  };

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

  // Subtitle functions
  const handleSubtitleChange = async (subtitleId: string | null) => {
    if (!videoRef.current) return;
    
    // Remove existing subtitle tracks
    const tracks = videoRef.current.textTracks;
    for (let i = 0; i < tracks.length; i++) {
      tracks[i].mode = 'disabled';
    }
    
    setCurrentSubtitle(subtitleId);
    setCurrentSubtitleText('');
    
    if (subtitleId) {
      const subtitle = subtitles.find(sub => sub.id === subtitleId);
      if (subtitle) {
        // Parse subtitle file and load cues
        await parseSubtitleFile(subtitle);
      }
    }
    
    setShowSubtitleMenu(false);
  };

  const parseSubtitleFile = async (subtitle: Subtitle) => {
    try {
      const response = await fetch(subtitle.url);
      const vttText = await response.text();
      const cues = parseVTT(vttText);
      setSubtitleCues(cues);
    } catch (error) {
      console.error('Error loading subtitle file:', error);
    }
  };

  const parseVTT = (vttText: string) => {
    const lines = vttText.split('\n');
    const cues: Array<{start: number, end: number, text: string}> = [];
    
    let i = 0;
    while (i < lines.length) {
      const line = lines[i].trim();
      
      // Skip WEBVTT header and empty lines
      if (line === 'WEBVTT' || line === '' || line.startsWith('NOTE')) {
        i++;
        continue;
      }
      
      // Check if this line contains timestamp
      if (line.includes('-->')) {
        const [startTime, endTime] = line.split('-->').map(t => t.trim());
        const start = parseTimeToSeconds(startTime);
        const end = parseTimeToSeconds(endTime);
        
        // Get subtitle text (next non-empty lines until empty line or end)
        i++;
        let text = '';
        while (i < lines.length && lines[i].trim() !== '') {
          if (text) text += '\n';
          text += lines[i].trim();
          i++;
        }
        
        if (text) {
          cues.push({ start, end, text });
        }
      } else {
        i++;
      }
    }
    
    return cues;
  };

  const parseTimeToSeconds = (timeString: string): number => {
    const [time, milliseconds] = timeString.split('.');
    const [hours, minutes, seconds] = time.split(':').map(Number);
    return hours * 3600 + minutes * 60 + seconds + (milliseconds ? parseInt(milliseconds) / 1000 : 0);
  };

  // Update current subtitle text based on video time
  useEffect(() => {
    if (currentSubtitle && subtitleCues.length > 0) {
      const adjustedTime = currentTime + subtitleDelay;
      const currentCue = subtitleCues.find(
        cue => adjustedTime >= cue.start && adjustedTime <= cue.end
      );
      setCurrentSubtitleText(currentCue ? currentCue.text : '');
    } else {
      setCurrentSubtitleText('');
    }
  }, [currentTime, currentSubtitle, subtitleCues, subtitleDelay]);

  const loadSubtitleTrack = (subtitle: Subtitle) => {
    if (!videoRef.current) return;
    
    // Check if track already exists
    const existingTrack = Array.from(videoRef.current.textTracks)
      .find(track => track.label === subtitle.label);
    
    if (!existingTrack) {
      const track = document.createElement('track');
      track.kind = 'subtitles';
      // Don't apply getFullMediaUrl to blob URLs (they start with 'blob:')
      track.src = subtitle.url.startsWith('blob:') ? subtitle.url : (getFullMediaUrl(subtitle.url) || subtitle.url);
      track.srclang = subtitle.language_code;
      track.label = subtitle.label;
      track.default = subtitle.is_default || false;
      
      videoRef.current.appendChild(track);
    }
  };

  // Create sample VTT subtitle file (for demo purposes)
  const createSampleSubtitleFile = (language: string): string => {
    let sampleVTT = '';
    
    if (language === 'English') {
      sampleVTT = `WEBVTT

00:00:00.000 --> 00:00:03.500
Hello everyone, welcome to today's presentation.

00:00:03.500 --> 00:00:07.000
In this video, we'll be exploring some fascinating topics.

00:00:07.000 --> 00:00:11.200
First, let me introduce myself and explain what we'll cover.

00:00:11.200 --> 00:00:15.800
The main focus will be on practical applications and real-world examples.

00:00:15.800 --> 00:00:19.500
As we progress, you'll see how these concepts work together.

00:00:19.500 --> 00:00:23.000
Please feel free to take notes as we go through each section.

00:00:23.000 --> 00:00:27.200
Now, let's dive into our first topic and see what we can discover.

00:00:27.200 --> 00:00:31.000
This approach has been proven effective in many different scenarios.`;
    } else if (language === 'Spanish' || language === 'Español') {
      sampleVTT = `WEBVTT

00:00:00.000 --> 00:00:03.500
Hola a todos, bienvenidos a la presentación de hoy.

00:00:03.500 --> 00:00:07.000
En este video, exploraremos algunos temas fascinantes.

00:00:07.000 --> 00:00:11.200
Primero, permítanme presentarme y explicar lo que cubriremos.

00:00:11.200 --> 00:00:15.800
El enfoque principal será en aplicaciones prácticas y ejemplos reales.

00:00:15.800 --> 00:00:19.500
A medida que avancemos, verán cómo estos conceptos funcionan juntos.

00:00:19.500 --> 00:00:23.000
Por favor, siéntanse libres de tomar notas mientras repasamos cada sección.

00:00:23.000 --> 00:00:27.200
Ahora, profundicemos en nuestro primer tema y veamos qué podemos descubrir.

00:00:27.200 --> 00:00:31.000
Este enfoque ha demostrado ser efectivo en muchos escenarios diferentes.`;
    } else if (language === 'French' || language === 'Français') {
      sampleVTT = `WEBVTT

00:00:00.000 --> 00:00:03.500
Bonjour tout le monde, bienvenue à la présentation d'aujourd'hui.

00:00:03.500 --> 00:00:07.000
Dans cette vidéo, nous explorerons des sujets fascinants.

00:00:07.000 --> 00:00:11.200
D'abord, permettez-moi de me présenter et d'expliquer ce que nous couvrirons.

00:00:11.200 --> 00:00:15.800
L'accent principal sera sur les applications pratiques et les exemples réels.

00:00:15.800 --> 00:00:19.500
Au fur et à mesure, vous verrez comment ces concepts fonctionnent ensemble.

00:00:19.500 --> 00:00:23.000
N'hésitez pas à prendre des notes pendant que nous parcourons chaque section.

00:00:23.000 --> 00:00:27.200
Maintenant, plongeons dans notre premier sujet et voyons ce que nous pouvons découvrir.

00:00:27.200 --> 00:00:31.000
Cette approche s'est avérée efficace dans de nombreux scénarios différents.`;
    } else {
      // Default English for any other language
      sampleVTT = `WEBVTT

00:00:00.000 --> 00:00:03.500
Welcome to this demonstration video.

00:00:03.500 --> 00:00:07.000
This is sample subtitle content in ${language}.

00:00:07.000 --> 00:00:11.200
The subtitles are synchronized with the video timeline.

00:00:11.200 --> 00:00:15.800
You can adjust the timing and appearance as needed.

00:00:15.800 --> 00:00:19.500
Multiple languages are supported for accessibility.

00:00:19.500 --> 00:00:23.000
Thank you for testing the subtitle functionality.

00:00:23.000 --> 00:00:27.200
Press C to cycle through available subtitle languages.

00:00:27.200 --> 00:00:31.000
We hope you find this feature useful and accessible.`;
    }
    
    // Create a blob URL for the sample subtitle
    const blob = new Blob([sampleVTT], { type: 'text/vtt' });
    return URL.createObjectURL(blob);
  };

  // Mouse movement handler for controls
  const handleMouseMove = () => {
    setShowControls(true);
    
    if (controlsTimeout) {
      clearTimeout(controlsTimeout);
    }
    
    const timeout = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
    
    setControlsTimeout(timeout);
  };

  // Format time helper
  const formatTime = (time: number): string => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Format date helper
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Only handle shortcuts when not typing in input/textarea
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (event.key.toLowerCase()) {
        case ' ':
          event.preventDefault();
          handlePlayPause();
          break;
        case 'arrowleft':
          event.preventDefault();
          skipTime(-10);
          break;
        case 'arrowright':
          event.preventDefault();
          skipTime(10);
          break;
        case 'm':
          event.preventDefault();
          toggleMute();
          break;
        case 'f':
          event.preventDefault();
          toggleFullscreen();
          break;
        case 'c':
          event.preventDefault();
          if (subtitles.length > 0) {
            // Cycle through subtitles: off -> first -> second -> ... -> last -> off
            const currentIndex = currentSubtitle 
              ? subtitles.findIndex(sub => sub.id === currentSubtitle)
              : -1;
            
            if (currentIndex === -1 || currentIndex === subtitles.length - 1) {
              // Turn off subtitles
              handleSubtitleChange(null);
            } else {
              // Next subtitle
              handleSubtitleChange(subtitles[currentIndex + 1].id);
            }
          }
          break;
        case '?':
        case 'h':
          event.preventDefault();
          setShowKeyboardHelp(!showKeyboardHelp);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }); // Note: Removed dependency array to avoid function recreation issues

  // Interaction handlers
  const handleLike = async () => {
    if (!media || !userInfo) {
      navigate('/login');
      return;
    }

    try {
      if (type === 'film') {
        await mediaService.interactWithFilm(media.id, { interaction_type: 'like' });
      } else {
        await mediaService.interactWithContent(media.id, { interaction_type: 'like' });
      }
      
      setMedia(prev => prev ? {
        ...prev,
        is_liked: !prev.is_liked,
        like_count: prev.is_liked ? prev.like_count - 1 : prev.like_count + 1
      } : null);
    } catch (err) {
      console.error('Error liking media:', err);
      alert('Failed to like media. Please try again.');
    }
  };

  const handleBookmark = async () => {
    if (!media || !userInfo) {
      navigate('/login');
      return;
    }

    try {
      if (type === 'film') {
        await mediaService.interactWithFilm(media.id, { interaction_type: 'bookmark' });
      } else {
        await mediaService.interactWithContent(media.id, { interaction_type: 'bookmark' });
      }
      
      setMedia(prev => prev ? {
        ...prev,
        is_bookmarked: !prev.is_bookmarked
      } : null);
    } catch (err) {
      console.error('Error bookmarking media:', err);
      alert('Failed to bookmark media. Please try again.');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: media?.title,
          text: media?.description,
          url: window.location.href,
        });
      } catch {
        // User cancelled sharing
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  // Comment handlers
  const submitComment = async () => {
    if (!newComment.trim() || !media) {
      return;
    }

    if (!userInfo) {
      alert('Please log in to submit comments.');
      return;
    }

    // Check authentication status using unifiedAuth
    if (!unifiedAuth.isAuthenticated()) {
      alert('Your session has expired. Please log in again to submit comments.');
      navigate('/login');
      return;
    }

    try {
      const comment = type === 'film'
        ? await commentService.createComment({
            content_type_name: 'film',
            object_id: media.id,
            text: newComment.trim()
          })
        : await commentService.createComment({
            content_type_name: 'content',
            object_id: media.id,
            text: newComment.trim()
          });
      
      setComments(prev => [comment, ...prev]);
      setNewComment('');
      setCommentCount(prev => prev + 1);
      
      setMedia(prev => prev ? {
        ...prev,
        comment_count: prev.comment_count + 1
      } : null);
      
    } catch (err: unknown) {
      console.error('Error submitting comment:', err);
      
      const error = err as { status?: number; message?: string };
      
      if (error.status === 401 || error.message?.includes('Unauthorized')) {
        try {
          // Attempt immediate token refresh
          const refreshToken = localStorage.getItem('refresh_token');
          if (refreshToken) {
            const response = await fetch(`${config.backendUrl}/api/auth/token/refresh/`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                refresh: refreshToken
              })
            });
            
            if (response.ok) {
              const data = await response.json();
              localStorage.setItem('access_token', data.access);
              if (data.refresh) {
                localStorage.setItem('refresh_token', data.refresh);
              }
              
              alert('Your session was refreshed. Please try submitting your comment again.');
              return;
            }
          }
        } catch {
          // Token refresh failed, fall through to login redirect
        }
        
        alert('Your session has expired. Please log in again to submit comments.');
        navigate('/login');
      } else {
        alert(`Failed to submit comment: ${error.message || 'Unknown error'}. Please try again.`);
      }
    }
  };

  const submitReply = async (parentId: string) => {
    if (!replyText.trim() || !media) {
      return;
    }

    if (!userInfo) {
      alert('Please log in to submit replies.');
      return;
    }

    // Check authentication status using unifiedAuth
    if (!unifiedAuth.isAuthenticated()) {
      alert('Your session has expired. Please log in again to submit replies.');
      navigate('/login');
      return;
    }

    try {
      const reply = type === 'film'
        ? await commentService.createComment({
            content_type_name: 'film',
            object_id: media.id,
            text: replyText.trim(),
            parent: parentId
          })
        : await commentService.createComment({
            content_type_name: 'content',
            object_id: media.id,
            text: replyText.trim(),
            parent: parentId
          });
      
      setComments(prev => prev.map(comment => 
        comment.id === parentId 
          ? { 
              ...comment, 
              replies: [...(comment.replies || []), reply], 
              reply_count: (comment.reply_count || 0) + 1 
            }
          : comment
      ));
      
      setReplyText('');
      setReplyTo(null);
      
    } catch (err: unknown) {
      console.error('Error submitting reply:', err);
      
      const error = err as { status?: number; message?: string };
      
      if (error.status === 401 || error.message?.includes('Unauthorized')) {
        try {
          // Attempt immediate token refresh
          const refreshToken = localStorage.getItem('refresh_token');
          if (refreshToken) {
            const response = await fetch(`${config.backendUrl}/api/auth/token/refresh/`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                refresh: refreshToken
              })
            });
            
            if (response.ok) {
              const data = await response.json();
              localStorage.setItem('access_token', data.access);
              if (data.refresh) {
                localStorage.setItem('refresh_token', data.refresh);
              }
              
              alert('Your session was refreshed. Please try submitting your reply again.');
              return;
            }
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
        }
        
        alert('Your session has expired. Please log in again to submit replies.');
        navigate('/login');
      } else {
        alert(`Failed to submit reply: ${error.message || 'Unknown error'}. Please try again.`);
      }
    }
  };

  const likeComment = async (commentId: string) => {
    if (!userInfo) {
      navigate('/login');
      return;
    }

    try {
      await commentService.interactWithComment(commentId, 'like');
      
      setComments(prev => prev.map(comment => {
        const updateComment = (c: typeof comment): typeof comment => {
          if (c.id === commentId) {
            const wasLiked = c.user_interaction?.liked || false;
            return {
              ...c,
              like_count: wasLiked ? c.like_count - 1 : c.like_count + 1,
              user_interaction: {
                ...c.user_interaction,
                liked: !wasLiked,
                disliked: false
              }
            };
          }
          if (c.replies) {
            return {
              ...c,
              replies: c.replies.map(updateComment)
            };
          }
          return c;
        };
        return updateComment(comment);
      }));
      
    } catch (err) {
      console.error('Error liking comment:', err);
      alert('Failed to like comment. Please try again.');
    }
  };

  const editComment = async (commentId: string, newText: string) => {
    if (!newText.trim()) {
      alert('Comment cannot be empty');
      return;
    }

    try {
      const updatedComment = await commentService.updateComment(commentId, newText.trim());
      
      setComments(prev => prev.map(comment => {
        const updateComment = (c: typeof comment): typeof comment => {
          if (c.id === commentId) {
            return {
              ...c,
              text: updatedComment.text,
              is_edited: true,
              updated_at: updatedComment.updated_at
            };
          }
          if (c.replies) {
            return {
              ...c,
              replies: c.replies.map(updateComment)
            };
          }
          return c;
        };
        return updateComment(comment);
      }));
      
      setEditingComment(null);
      setEditText('');
      
    } catch (err) {
      console.error('Error editing comment:', err);
      alert('Failed to edit comment. Please try again.');
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      setDeletingComment(commentId);
      await commentService.deleteComment(commentId);
      
      // Update UI immediately after successful deletion
      setComments(prev => {
        let commentDeleted = false;
        
        const updatedComments = prev.filter(comment => {
          // Remove the comment if it's the one being deleted
          if (comment.id === commentId) {
            commentDeleted = true;
            return false;
          }
          
          // Remove replies if they match the commentId
          if (comment.replies) {
            const originalReplyCount = comment.replies.length;
            comment.replies = comment.replies.filter(reply => reply.id !== commentId);
            
            // If a reply was removed, update the reply count
            if (comment.replies.length !== originalReplyCount) {
              comment.reply_count = Math.max(0, (comment.reply_count || 0) - 1);
            }
          }
          
          return true;
        });
        
        // Update counts based on what was deleted
        if (commentDeleted) {
          setCommentCount(prevCount => Math.max(0, prevCount - 1));
          setMedia(prevMedia => prevMedia ? {
            ...prevMedia,
            comment_count: Math.max(0, prevMedia.comment_count - 1)
          } : null);
        }
        
        return updatedComments;
      });
      
      // Clear any edit states if the deleted comment was being edited
      if (editingComment === commentId) {
        setEditingComment(null);
        setEditText('');
      }
      
      // Clear reply state if replying to deleted comment
      if (replyTo === commentId) {
        setReplyTo(null);
        setReplyText('');
      }
      
    } catch (err) {
      console.error('Error deleting comment:', err);
      alert('Failed to delete comment. Please try again.');
    } finally {
      setDeletingComment(null);
    }
  };

  const startEditingComment = (comment: Comment) => {
    setEditingComment(comment.id);
    setEditText(comment.text);
    setReplyTo(null); // Close any open reply forms
  };

  const cancelEditingComment = () => {
    setEditingComment(null);
    setEditText('');
  };

  const toggleDescription = () => {
    setShowDescription(prev => !prev);
  };

  // Load media data on mount and when type/id change
  useEffect(() => {
    const fetchData = async () => {
      if (!type || !id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Fetch media details
        const mediaData = type === 'film'
          ? await mediaService.getFilm(id)
          : await mediaService.getContentItem(id);
        
        setMedia(mediaData);
        
        // Set comment count
        setCommentCount(mediaData.comment_count || 0);
        
        // Load comments if not already loaded
        if (commentsLoadedRef.current !== mediaData.id) {
          const commentsData = await commentService.getComments({
            content_type: type,
            object_id: mediaData.id,
            page: 1,
            page_size: 20,
            ordering: '-created_at'
          });
          
          setComments(commentsData.results || []);
          commentsLoadedRef.current = mediaData.id;
        }
        
        // Load subtitles
        if (mediaData.subtitles && mediaData.subtitles.length > 0) {
          setSubtitles(mediaData.subtitles);
          
          // Set default subtitle if available
          const defaultSubtitle = mediaData.subtitles.find((sub: Subtitle) => sub.is_default);
          if (defaultSubtitle) {
            setCurrentSubtitle(defaultSubtitle.id);
          }
        } else {
          setSubtitles([]);
          setCurrentSubtitle(null);
        }
        
      } catch (err) {
        setError(err.message || 'Failed to load media');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [type, id]);

  // Refresh comment count periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (media && media.id) {
        commentService.getComments({
          content_type: type,
          object_id: media.id,
          page: 1,
          page_size: 1,
          ordering: '-created_at'
        }).then(commentsData => {
          setCommentCount(commentsData.count || 0);
        }).catch(err => {
          console.error('Error refreshing comment count:', err);
        });
      }
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [media, type]);

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white">Loading video...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !media) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-400 mb-4">{error || 'Media not found'}</p>
            <button
              onClick={() => navigate(-1)}
              className="text-white hover:text-gray-300"
            >
              ← Go Back
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const videoUrl = getVideoUrl();

  return (
    <MainLayout>
      <div className="min-h-screen bg-black">
        {/* Video Player */}
        <div className="relative w-full h-screen max-h-[70vh] bg-black" onMouseMove={handleMouseMove}>
          {videoUrl ? (
            <>
              <video
                ref={videoRef}
                className="w-full h-full object-contain"
                src={videoUrl}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setIsPlaying(false)}
                onClick={handlePlayPause}
                crossOrigin="anonymous"
              >
                {subtitles.map((subtitle) => (
                  <track
                    key={subtitle.id}
                    kind="subtitles"
                    src={subtitle.url.startsWith('blob:') ? subtitle.url : (getFullMediaUrl(subtitle.url) || subtitle.url)}
                    srcLang={subtitle.language_code}
                    label={subtitle.label}
                    default={subtitle.is_default}
                  />
                ))}
              </video>

              {/* Custom Subtitle Display */}
              {currentSubtitleText && (
                <div className="absolute bottom-20 left-0 right-0 flex justify-center px-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`
                        bg-black/80 text-white px-4 py-2 rounded-lg text-center max-w-4xl
                        ${subtitleSize === 'small' ? 'text-sm' : subtitleSize === 'large' ? 'text-xl' : 'text-base'}
                        font-medium shadow-lg backdrop-blur-sm
                      `}
                      style={{
                        lineHeight: '1.4',
                        wordWrap: 'break-word',
                        textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                      }}
                    >
                      {currentSubtitleText.split('\n').map((line, index) => (
                        <div key={index}>{line}</div>
                      ))}
                    </div>
                    
                    {/* Demo Subtitle Indicator */}
                    {currentSubtitle && subtitles.find(sub => sub.id === currentSubtitle)?.id.startsWith('demo_') && (
                      <div className="mt-2 px-2 py-1 bg-yellow-600/80 text-yellow-100 text-xs rounded backdrop-blur-sm">
                        Demo Subtitles - Not actual video dialogue
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-900">
              <div className="text-center">
                <Play className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">
                  {isTrailer ? 'Trailer not available' : 'Video not available'}
                </p>
              </div>
            </div>
          )}

          {/* Video Controls Overlay */}
          {videoUrl && (
            <div 
              className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/60 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}
              onClick={() => setShowSubtitleMenu(false)}
            >
              {/* Top Controls */}
              <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
                <button
                  onClick={() => navigate(-1)}
                  className="flex items-center text-white hover:text-gray-300 transition-colors"
                >
                  <ArrowLeft className="h-6 w-6 mr-2" />
                  Back
                </button>
                
                <div className="flex items-center space-x-4">
                  <span className="text-white text-sm">
                    {isTrailer ? 'Trailer' : 'Full Video'}
                  </span>
                  
                  {/* Quality Selector */}
                  <select
                    value={quality}
                    onChange={(e) => setQuality(e.target.value)}
                    className="bg-black/50 text-white text-sm rounded px-2 py-1 border border-gray-600"
                  >
                    <option value="auto">Auto</option>
                    <option value="1080p">1080p</option>
                    <option value="720p">720p</option>
                    <option value="480p">480p</option>
                  </select>
                </div>
              </div>

              {/* Center Play Button */}
              {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <button
                    onClick={handlePlayPause}
                    className="bg-red-600 hover:bg-red-700 text-white rounded-full p-4 transition-colors"
                  >
                    <Play className="h-8 w-8" />
                  </button>
                </div>
              )}

              {/* Bottom Controls */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="relative bg-gray-600 h-1 rounded-full">
                    <div 
                      className="absolute left-0 top-0 h-full bg-red-600 rounded-full transition-all duration-200"
                      style={{ width: `${(currentTime / duration) * 100}%` }}
                    />
                    <input
                      type="range"
                      min={0}
                      max={duration}
                      value={currentTime}
                      onChange={(e) => handleSeek(Number(e.target.value))}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Control Buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={handlePlayPause}
                      className="text-white hover:text-gray-300 transition-colors"
                    >
                      {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                    </button>

                    <button
                      onClick={() => skipTime(-10)}
                      className="text-white hover:text-gray-300 transition-colors"
                    >
                      <SkipBack className="h-5 w-5" />
                    </button>

                    <button
                      onClick={() => skipTime(10)}
                      className="text-white hover:text-gray-300 transition-colors"
                    >
                      <SkipForward className="h-5 w-5" />
                    </button>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={toggleMute}
                        className="text-white hover:text-gray-300 transition-colors"
                      >
                        {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                      </button>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.1}
                        value={isMuted ? 0 : volume}
                        onChange={(e) => handleVolumeChange(Number(e.target.value))}
                        className="w-20 h-1 bg-gray-600 rounded-full appearance-none slider"
                      />
                    </div>

                    <span className="text-white text-sm">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>

                  <div className="flex items-center space-x-4">
                    {/* Subtitle Toggle Button with Menu */}
                    {subtitles.length > 0 && (
                      <div className="relative" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowSubtitleMenu(!showSubtitleMenu);
                          }}
                          className={`p-2 rounded transition-colors border ${
                            currentSubtitle 
                              ? 'text-red-400 bg-red-600/20 border-red-400' 
                              : 'text-white hover:text-gray-300 border-gray-600 hover:border-gray-400'
                          }`}
                          title="Subtitles (Press C to cycle)"
                        >
                          <Subtitles className="h-5 w-5" />
                        </button>
                        
                        {showSubtitleMenu && (
                          <div className="absolute bottom-full right-0 mb-2 bg-black/90 border border-gray-600 rounded-lg py-2 min-w-48 z-[60]">
                            <div className="px-3 py-2 text-gray-400 text-xs font-medium uppercase border-b border-gray-600">
                              Subtitles
                            </div>
                            
                            <button
                              onClick={() => handleSubtitleChange(null)}
                              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-700 transition-colors ${
                                !currentSubtitle ? 'text-red-400 bg-gray-800' : 'text-white'
                              }`}
                            >
                              Off
                            </button>
                            
                            {subtitles.map((subtitle) => (
                              <button
                                key={subtitle.id}
                                onClick={() => handleSubtitleChange(subtitle.id)}
                                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-700 transition-colors ${
                                  currentSubtitle === subtitle.id ? 'text-red-400 bg-gray-800' : 'text-white'
                                }`}
                              >
                                {subtitle.label}
                                {subtitle.is_default && (
                                  <span className="text-gray-400 text-xs ml-1">(Default)</span>
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Playback Speed */}
                    <select
                      value={playbackRate}
                      onChange={(e) => changePlaybackRate(Number(e.target.value))}
                      className="bg-black/50 text-white text-sm rounded px-2 py-1 border border-gray-600"
                    >
                      <option value={0.5}>0.5x</option>
                      <option value={0.75}>0.75x</option>
                      <option value={1}>1x</option>
                      <option value={1.25}>1.25x</option>
                      <option value={1.5}>1.5x</option>
                      <option value={2}>2x</option>
                    </select>

                    <button
                      onClick={toggleFullscreen}
                      className="text-white hover:text-gray-300 transition-colors"
                    >
                      <Maximize className="h-5 w-5" />
                    </button>

                    <button
                      onClick={() => setShowKeyboardHelp(!showKeyboardHelp)}
                      className="text-white hover:text-gray-300 transition-colors"
                      title="Keyboard shortcuts (? or H)"
                    >
                      <HelpCircle className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Keyboard Help Overlay */}
        {showKeyboardHelp && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full mx-4 border border-gray-600">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Keyboard Shortcuts</h3>
                <button
                  onClick={() => setShowKeyboardHelp(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Play / Pause</span>
                  <kbd className="bg-gray-700 px-2 py-1 rounded text-white">Space</kbd>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Skip backward 10s</span>
                  <kbd className="bg-gray-700 px-2 py-1 rounded text-white">←</kbd>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Skip forward 10s</span>
                  <kbd className="bg-gray-700 px-2 py-1 rounded text-white">→</kbd>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Mute / Unmute</span>
                  <kbd className="bg-gray-700 px-2 py-1 rounded text-white">M</kbd>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Fullscreen</span>
                  <kbd className="bg-gray-700 px-2 py-1 rounded text-white">F</kbd>
                </div>
                
                {subtitles.length > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Cycle subtitles</span>
                    <kbd className="bg-gray-700 px-2 py-1 rounded text-white">C</kbd>
                  </div>
                )}
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Show this help</span>
                  <div className="space-x-1">
                    <kbd className="bg-gray-700 px-2 py-1 rounded text-white">?</kbd>
                    <span className="text-gray-400">or</span>
                    <kbd className="bg-gray-700 px-2 py-1 rounded text-white">H</kbd>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-700">
                <p className="text-gray-400 text-xs text-center">
                  Keyboard shortcuts work when not typing in text fields
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Media Information */}
        <div className="bg-gray-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Info */}
              <div className="lg:col-span-2">
                {/* Title and Actions */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {isTrailer && (
                        <span className="bg-red-600 text-white px-2 py-1 rounded text-sm font-medium">
                          TRAILER
                        </span>
                      )}
                      <span className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-sm">
                        {media.category.toUpperCase()}
                      </span>
                      {media.is_premium && (
                        <span className="bg-yellow-600 text-white px-2 py-1 rounded text-sm font-medium">
                          PREMIUM
                        </span>
                      )}
                    </div>
                    
                    <h1 className="text-3xl font-bold mb-2">{media.title}</h1>
                    
                    <div className="flex items-center space-x-4 text-gray-400 text-sm mb-4">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(media.created_at)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{isTrailer ? media.trailer_duration_formatted : media.duration_formatted}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Eye className="h-4 w-4" />
                        <span>{media.view_count.toLocaleString()} views</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4" />
                        <span>{media.average_rating.toFixed(1)} ({media.rating_count})</span>
                      </div>
                    </div>

                    {/* Series Info */}
                    {type === 'film' && (media as Film).is_series && (
                      <div className="mb-4">
                        <div className="bg-gray-800 rounded-lg p-3">
                          <h3 className="font-semibold text-lg">{(media as Film).series_name}</h3>
                          {(media as Film).season_number && (media as Film).episode_number && (
                            <p className="text-gray-400">
                              Season {(media as Film).season_number}, Episode {(media as Film).episode_number}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Content Type Info for Content */}
                    {type === 'content' && (
                      <div className="mb-4">
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="bg-gray-800 px-3 py-1 rounded">
                            {(media as Content).content_type.replace('_', ' ').toUpperCase()}
                          </span>
                          {(media as Content).difficulty_level && (
                            <span className="bg-blue-900 px-3 py-1 rounded">
                              {(media as Content).difficulty_level?.toUpperCase()}
                            </span>
                          )}
                          {(media as Content).is_live && (
                            <span className="bg-red-600 px-3 py-1 rounded animate-pulse">
                              LIVE
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2 mt-4 sm:mt-0">
                    <button
                      onClick={handleLike}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                        media.is_liked 
                          ? 'bg-red-600 text-white' 
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      <Heart className="h-4 w-4" />
                      <span>{media.like_count}</span>
                    </button>

                    <button
                      onClick={handleBookmark}
                      className={`p-2 rounded-lg transition-colors ${
                        media.is_bookmarked 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      <Bookmark className="h-4 w-4" />
                    </button>

                    <button
                      onClick={handleShare}
                      className="p-2 bg-gray-800 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <Share2 className="h-4 w-4" />
                    </button>

                    {!isTrailer && media.trailer_file && (
                      <button
                        onClick={() => navigate(`/watch/${type}/${id}?trailer=true`)}
                        className="px-4 py-2 bg-gray-800 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        Watch Trailer
                      </button>
                    )}

                    {isTrailer && (
                      <button
                        onClick={() => navigate(`/watch/${type}/${id}`)}
                        className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors"
                      >
                        Watch Full {type === 'film' ? 'Film' : 'Video'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <div className={`text-gray-300 ${showDescription ? '' : 'line-clamp-3'}`}>
                    {media.description}
                  </div>
                  <button
                    onClick={() => setShowDescription(!showDescription)}
                    className="text-gray-400 hover:text-white mt-2 text-sm"
                  >
                    {showDescription ? 'Show less' : 'Show more'}
                  </button>
                </div>

                {/* Tags */}
                {media.tags.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center space-x-2 mb-2">
                      <Tag className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-400 text-sm">Tags</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {media.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-sm hover:bg-gray-700 cursor-pointer"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar Info */}
              <div className="lg:col-span-1">
                <div className="bg-gray-800 rounded-lg p-6">
                  {/* Film-specific info */}
                  {type === 'film' && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold mb-4">Film Details</h3>
                      
                      {(media as Film).director && (
                        <div>
                          <span className="text-gray-400 text-sm">Director</span>
                          <p className="text-white">{(media as Film).director}</p>
                        </div>
                      )}

                      {(media as Film).cast.length > 0 && (
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-400 text-sm">Cast</span>
                          </div>
                          <div className="space-y-1">
                            {(media as Film).cast.slice(0, 5).map((actor, index) => (
                              <p key={index} className="text-white text-sm">{actor}</p>
                            ))}
                            {(media as Film).cast.length > 5 && (
                              <p className="text-gray-400 text-sm">
                                +{(media as Film).cast.length - 5} more
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {(media as Film).producer && (
                        <div>
                          <span className="text-gray-400 text-sm">Producer</span>
                          <p className="text-white">{(media as Film).producer}</p>
                        </div>
                      )}

                      {(media as Film).studio && (
                        <div>
                          <span className="text-gray-400 text-sm">Studio</span>
                          <p className="text-white">{(media as Film).studio}</p>
                        </div>
                      )}

                      {(media as Film).release_year && (
                        <div>
                          <span className="text-gray-400 text-sm">Release Year</span>
                          <p className="text-white">{(media as Film).release_year}</p>
                        </div>
                      )}

                      <div>
                        <span className="text-gray-400 text-sm">Rating</span>
                        <p className="text-white">{(media as Film).mpaa_rating}</p>
                      </div>

                      <div>
                        <span className="text-gray-400 text-sm">Language</span>
                        <p className="text-white">{media.language}</p>
                      </div>
                    </div>
                  )}

                  {/* Content-specific info */}
                  {type === 'content' && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold mb-4">Content Details</h3>
                      
                      <div>
                        <span className="text-gray-400 text-sm">Creator</span>
                        <p className="text-white">{(media as Content).creator}</p>
                      </div>

                      <div>
                        <span className="text-gray-400 text-sm">Type</span>
                        <p className="text-white">{(media as Content).content_type.replace('_', ' ')}</p>
                      </div>

                      {(media as Content).difficulty_level && (
                        <div>
                          <span className="text-gray-400 text-sm">Difficulty</span>
                          <p className="text-white">{(media as Content).difficulty_level}</p>
                        </div>
                      )}

                      <div>
                        <span className="text-gray-400 text-sm">Language</span>
                        <p className="text-white">{media.language}</p>
                      </div>

                      {(media as Content).series_name && (
                        <div>
                          <span className="text-gray-400 text-sm">Series</span>
                          <p className="text-white">{(media as Content).series_name}</p>
                          {(media as Content).episode_number && (
                            <p className="text-gray-400 text-sm">Episode {(media as Content).episode_number}</p>
                          )}
                        </div>
                      )}

                      {(media as Content).is_live && (
                        <div>
                          <span className="text-red-400 text-sm font-medium">🔴 LIVE CONTENT</span>
                          {(media as Content).scheduled_live_time && (
                            <p className="text-gray-400 text-sm">
                              Scheduled: {formatDate((media as Content).scheduled_live_time!)}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Quality and File Info */}
                  <div className="mt-6 pt-6 border-t border-gray-700">
                    <h4 className="text-sm font-semibold text-gray-400 mb-3">Video Quality</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400 text-sm">Quality</span>
                        <span className="text-white text-sm">{media.video_quality}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400 text-sm">File Size</span>
                        <span className="text-white text-sm">{media.file_size_formatted}</span>
                      </div>
                    </div>
                  </div>

                  {/* Subtitle Info */}
                  {(subtitles.length > 0 || media.subtitles_available.length > 0) && (
                    <div className="mt-6 pt-6 border-t border-gray-700">
                      <h4 className="text-sm font-semibold text-gray-400 mb-3">Available Subtitles</h4>
                      <div className="space-y-1">
                        {subtitles.length > 0 ? (
                          subtitles.map((subtitle) => (
                            <div key={subtitle.id} className="flex justify-between items-center">
                              <span className="text-gray-300 text-sm">{subtitle.label}</span>
                              <div className="flex items-center space-x-2">
                                {subtitle.is_default && (
                                  <span className="text-yellow-400 text-xs">Default</span>
                                )}
                                {currentSubtitle === subtitle.id && (
                                  <span className="text-red-400 text-xs">Active</span>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          media.subtitles_available.map((lang, index) => (
                            <div key={index} className="text-gray-300 text-sm">
                              {lang}
                            </div>
                          ))
                        )}
                      </div>
                      
                      {/* Subtitle Controls */}
                      {currentSubtitle && (
                        <div className="mt-4 space-y-3">
                          <div className="border-t border-gray-600 pt-3">
                            <label className="block text-gray-400 text-xs font-medium mb-2">
                              Subtitle Size
                            </label>
                            <select
                              value={subtitleSize}
                              onChange={(e) => setSubtitleSize(e.target.value as 'small' | 'medium' | 'large')}
                              className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                            >
                              <option value="small">Small</option>
                              <option value="medium">Medium</option>
                              <option value="large">Large</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-gray-400 text-xs font-medium mb-2">
                              Subtitle Delay: {subtitleDelay > 0 ? '+' : ''}{subtitleDelay}s
                            </label>
                            <input
                              type="range"
                              min={-5}
                              max={5}
                              step={0.1}
                              value={subtitleDelay}
                              onChange={(e) => setSubtitleDelay(Number(e.target.value))}
                              className="w-full h-1 bg-gray-600 rounded-full appearance-none slider"
                            />
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                              <span>-5s</span>
                              <span>0s</span>
                              <span>+5s</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Comments Section */}
            <div className="mt-12">
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-6 flex items-center">
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Comments ({commentCount})
                </h3>
                
                {/* Add Comment */}
                {userInfo ? (
                  <div className="mb-8">
                    <div className="flex space-x-4">
                      {userInfo.avatar && getFullAvatarUrl(userInfo.avatar) ? (
                        <img
                          src={getFullAvatarUrl(userInfo.avatar)!}
                          alt={userInfo.username}
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                      )}
                      
                      <div className="flex-1">
                        <textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Share your thoughts..."
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-white placeholder-gray-400 resize-none"
                          rows={3}
                        />
                        
                        <div className="flex justify-end mt-3">
                          <button
                            onClick={submitComment}
                            disabled={!newComment.trim() || !unifiedAuth.isAuthenticated()}
                            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <Send className="h-4 w-4 mr-2" />
                            Post Comment
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mb-8 p-4 bg-gray-700 rounded-lg text-center">
                    <p className="text-gray-300 mb-4">Please log in to leave a comment</p>
                    <button
                      onClick={() => navigate('/login')}
                      className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Log In
                    </button>
                  </div>
                )}
                
                {/* Comments List */}
                {commentsLoading ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading comments...</p>
                  </div>
                ) : comments.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No comments yet. Be the first to share your thoughts!</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {comments.map((comment) => {
                      if (!comment || !comment.id || !comment.user) {
                        return null;
                      }
                      
                      return (
                        <div key={comment.id} className="border-b border-gray-700 pb-6 last:border-b-0">
                          <div className="flex space-x-4">
                            {comment.user.avatar_url && getFullAvatarUrl(comment.user.avatar_url) ? (
                              <img
                                src={getFullAvatarUrl(comment.user.avatar_url)!}
                                alt={comment.user.username}
                                className="w-10 h-10 rounded-full"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                                <User className="h-5 w-5 text-gray-400" />
                              </div>
                            )}
                            
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <span className="font-medium text-white">
                                  {comment.user.first_name} {comment.user.last_name}
                                </span>
                                <span className="text-gray-400 text-sm">
                                  {comment.time_since || formatDate(comment.created_at)}
                                </span>
                                {comment.is_edited && (
                                  <span className="text-gray-500 text-xs">(edited)</span>
                                )}
                              </div>
                              
                              {/* Comment text or edit form */}
                              {editingComment === comment.id ? (
                                <div className="mb-3">
                                  <textarea
                                    value={editText}
                                    onChange={(e) => setEditText(e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-white placeholder-gray-400 resize-none text-sm"
                                    rows={3}
                                  />
                                  
                                  <div className="flex justify-end space-x-2 mt-2">
                                    <button
                                      onClick={cancelEditingComment}
                                      className="px-3 py-1 text-gray-400 hover:text-white transition-colors text-sm"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      onClick={() => editComment(comment.id, editText)}
                                      disabled={!editText.trim()}
                                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                                    >
                                      Save
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-gray-300 mb-3">{comment.text}</p>
                              )}
                              
                              <div className="flex items-center space-x-4">
                                <button
                                  onClick={() => likeComment(comment.id)}
                                  className={`flex items-center space-x-1 text-sm transition-colors ${
                                    comment.user_interaction?.liked
                                      ? 'text-red-400'
                                      : 'text-gray-400 hover:text-red-400'
                                  }`}
                                >
                                  <ThumbsUp className="h-4 w-4" />
                                  <span>{comment.like_count}</span>
                                </button>
                                
                                {userInfo && editingComment !== comment.id && (
                                  <button
                                    onClick={() => setReplyTo(comment.id)}
                                    className="text-sm text-gray-400 hover:text-white transition-colors"
                                  >
                                    Reply
                                  </button>
                                )}
                                
                                {/* Edit and Delete buttons for own comments */}
                                {userInfo && comment.user.id === userInfo.id && editingComment !== comment.id && (
                                  <>
                                    <button
                                      onClick={() => startEditingComment(comment)}
                                      className="text-sm text-gray-400 hover:text-white transition-colors flex items-center"
                                      title="Edit comment"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </button>
                                    
                                    <button
                                      onClick={() => deleteComment(comment.id)}
                                      disabled={deletingComment === comment.id}
                                      className="text-sm text-gray-400 hover:text-red-400 transition-colors flex items-center disabled:opacity-50"
                                      title="Delete comment"
                                    >
                                      {deletingComment === comment.id ? (
                                        <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                                      ) : (
                                        <Trash2 className="h-4 w-4" />
                                      )}
                                    </button>
                                  </>
                                )}
                              </div>
                              
                              {/* Reply Form */}
                              {replyTo === comment.id && (
                                <div className="mt-4">
                                  <div className="flex space-x-3">
                                    {userInfo?.avatar && getFullAvatarUrl(userInfo.avatar) ? (
                                      <img
                                        src={getFullAvatarUrl(userInfo.avatar)!}
                                        alt={userInfo.username}
                                        className="w-8 h-8 rounded-full"
                                      />
                                    ) : (
                                      <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                                        <User className="h-4 w-4 text-gray-400" />
                                      </div>
                                    )}
                                    
                                    <div className="flex-1">
                                      <textarea
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        placeholder={`Reply to ${comment.user.first_name}...`}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-white placeholder-gray-400 resize-none text-sm"
                                        rows={2}
                                      />
                                      
                                      <div className="flex justify-end space-x-2 mt-2">
                                        <button
                                          onClick={() => {
                                            setReplyTo(null);
                                            setReplyText('');
                                          }}
                                          className="px-3 py-1 text-gray-400 hover:text-white transition-colors text-sm"
                                        >
                                          Cancel
                                        </button>
                                        <button
                                          onClick={() => submitReply(comment.id)}
                                          disabled={!replyText.trim()}
                                          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                                        >
                                          Reply
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              {/* Replies */}
                              {comment.replies && comment.replies.length > 0 && (
                                <div className="mt-4 space-y-4 ml-8 border-l-2 border-gray-700 pl-4">
                                  {comment.replies.map((reply) => (
                                    <div key={reply.id} className="flex space-x-3">
                                      {reply.user.avatar_url && getFullAvatarUrl(reply.user.avatar_url) ? (
                                        <img
                                          src={getFullAvatarUrl(reply.user.avatar_url)!}
                                          alt={reply.user.username}
                                          className="w-8 h-8 rounded-full"
                                        />
                                      ) : (
                                        <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                                          <User className="h-4 w-4 text-gray-400" />
                                        </div>
                                      )}
                                      
                                      <div className="flex-1">
                                        <div className="flex items-center space-x-2 mb-1">
                                          <span className="font-medium text-white text-sm">
                                            {reply.user.first_name} {reply.user.last_name}
                                          </span>
                                          <span className="text-gray-400 text-xs">
                                            {reply.time_since || formatDate(reply.created_at)}
                                          </span>
                                          {reply.is_edited && (
                                            <span className="text-gray-500 text-xs">(edited)</span>
                                          )}
                                        </div>
                                        
                                        {/* Reply text or edit form */}
                                        {editingComment === reply.id ? (
                                          <div className="mb-2">
                                            <textarea
                                              value={editText}
                                              onChange={(e) => setEditText(e.target.value)}
                                              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-white placeholder-gray-400 resize-none text-xs"
                                              rows={2}
                                            />
                                            
                                            <div className="flex justify-end space-x-2 mt-2">
                                              <button
                                                onClick={cancelEditingComment}
                                                className="px-2 py-1 text-gray-400 hover:text-white transition-colors text-xs"
                                              >
                                                Cancel
                                              </button>
                                              <button
                                                onClick={() => editComment(reply.id, editText)}
                                                disabled={!editText.trim()}
                                                className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs"
                                              >
                                                Save
                                              </button>
                                            </div>
                                          </div>
                                        ) : (
                                          <p className="text-gray-300 text-sm mb-2">{reply.text}</p>
                                        )}
                                        
                                        <div className="flex items-center space-x-3">
                                          <button
                                            onClick={() => likeComment(reply.id)}
                                            className={`flex items-center space-x-1 text-xs transition-colors ${
                                              reply.user_interaction?.liked
                                                ? 'text-red-400'
                                                : 'text-gray-400 hover:text-red-400'
                                            }`}
                                          >
                                            <ThumbsUp className="h-3 w-3" />
                                            <span>{reply.like_count}</span>
                                          </button>
                                          
                                          {userInfo && editingComment !== reply.id && (
                                            <button
                                              onClick={() => setReplyTo(reply.id)}
                                              className="text-xs text-gray-400 hover:text-white transition-colors"
                                            >
                                              Reply
                                            </button>
                                          )}
                                          
                                          {/* Edit and Delete buttons for own replies */}
                                          {userInfo && reply.user.id === userInfo.id && editingComment !== reply.id && (
                                            <>
                                              <button
                                                onClick={() => startEditingComment(reply)}
                                                className="text-xs text-gray-400 hover:text-white transition-colors flex items-center"
                                                title="Edit reply"
                                              >
                                                <Edit className="h-3 w-3" />
                                              </button>
                                              
                                              <button
                                                onClick={() => deleteComment(reply.id)}
                                                disabled={deletingComment === reply.id}
                                                className="text-xs text-gray-400 hover:text-red-400 transition-colors flex items-center disabled:opacity-50"
                                                title="Delete reply"
                                              >
                                                {deletingComment === reply.id ? (
                                                  <div className="w-3 h-3 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                  <Trash2 className="h-3 w-3" />
                                                )}
                                              </button>
                                            </>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default VideoPlayerPage;
