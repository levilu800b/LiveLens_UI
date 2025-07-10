// src/pages/Admin/EditAnimationPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { uiActions } from '../../store/reducers/uiReducers';
import { 
  Save, 
  Upload, 
  X, 
  FileText,
  Plus,
  AlertTriangle,
  Palette,
  ArrowLeft,
  Settings,
  Users
} from 'lucide-react';
import AdminLayout from '../../components/Admin/AdminLayout';
import animationService, { type Animation } from '../../services/animationService';

interface AnimationFormData {
  title: string;
  description: string;
  short_description: string;
  category: string;
  animation_type: '2d' | '3d' | 'mixed' | 'motion_graphics' | 'stop_motion' | 'ai_generated';
  tags: string[];
  thumbnail?: File | null;
  poster?: File | null;
  banner?: File | null;
  video_file?: File | null;
  project_file?: File | null;
  storyboard?: File | null;
  concept_art?: File | null;
  duration: number;
  video_quality: '360p' | '480p' | '720p' | '1080p' | '1440p' | '2160p' | '4320p';
  frame_rate: '12' | '24' | '25' | '30' | '60';
  resolution_width: number;
  resolution_height: number;
  animation_software: string;
  render_engine: string;
  production_time: number;
  status: 'draft' | 'published' | 'archived' | 'processing' | 'generating';
  is_featured: boolean;
  is_trending: boolean;
  is_premium: boolean;
  is_series: boolean;
  series_name: string;
  episode_number?: number;
  season_number?: number;
  release_year?: number;
  language: string;
  subtitles_available: string[];
  director: string;
  animator: string;
  voice_actors: string[];
  music_composer: string;
  sound_designer: string;
  studio: string;
  budget?: number;
}

const EditAnimationPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [animation, setAnimation] = useState<Animation | null>(null);
  const [formData, setFormData] = useState<AnimationFormData>({
    title: '',
    description: '',
    short_description: '',
    category: 'other',
    animation_type: '2d',
    tags: [],
    duration: 0,
    video_quality: '1080p',
    frame_rate: '24',
    resolution_width: 1920,
    resolution_height: 1080,
    animation_software: '',
    render_engine: '',
    production_time: 0,
    status: 'draft',
    is_featured: false,
    is_trending: false,
    is_premium: false,
    is_series: false,
    series_name: '',
    language: 'English',
    subtitles_available: [],
    director: '',
    animator: '',
    voice_actors: [],
    music_composer: '',
    sound_designer: '',
    studio: ''
  });

  const [tagInput, setTagInput] = useState('');
  const [voiceActorInput, setVoiceActorInput] = useState('');
  const [subtitleInput, setSubtitleInput] = useState('');

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
        
        // Populate form with existing data
        setFormData({
          title: animationData.title,
          description: animationData.description || '',
          short_description: animationData.short_description || '',
          category: animationData.category,
          animation_type: animationData.animation_type as AnimationFormData['animation_type'],
          tags: animationData.tags || [],
          duration: animationData.duration,
          video_quality: animationData.video_quality as AnimationFormData['video_quality'],
          frame_rate: animationData.frame_rate as AnimationFormData['frame_rate'],
          resolution_width: animationData.resolution_width || 1920,
          resolution_height: animationData.resolution_height || 1080,
          animation_software: animationData.animation_software || '',
          render_engine: animationData.render_engine || '',
          production_time: animationData.production_time || 0,
          status: animationData.status,
          is_featured: animationData.is_featured,
          is_trending: animationData.is_trending,
          is_premium: animationData.is_premium,
          is_series: animationData.is_series,
          series_name: animationData.series_name || '',
          episode_number: animationData.episode_number || undefined,
          season_number: animationData.season_number || undefined,
          release_year: animationData.release_year || undefined,
          language: animationData.language || 'English',
          subtitles_available: animationData.subtitles_available || [],
          director: animationData.director || '',
          animator: animationData.animator || '',
          voice_actors: animationData.voice_actors || [],
          music_composer: animationData.music_composer || '',
          sound_designer: animationData.sound_designer || '',
          studio: animationData.studio || '',
          budget: animationData.budget || undefined
        });

        setError(null);
      } catch (err) {
        console.error('Error loading animation:', err);
        setError('Failed to load animation. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadAnimation();
  }, [id]);

  const handleInputChange = (field: keyof AnimationFormData, value: string | number | boolean | undefined) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (field: keyof AnimationFormData, file: File | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: file
    }));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addVoiceActor = () => {
    if (voiceActorInput.trim() && !formData.voice_actors.includes(voiceActorInput.trim())) {
      setFormData(prev => ({
        ...prev,
        voice_actors: [...prev.voice_actors, voiceActorInput.trim()]
      }));
      setVoiceActorInput('');
    }
  };

  const removeVoiceActor = (actorToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      voice_actors: prev.voice_actors.filter(actor => actor !== actorToRemove)
    }));
  };

  const addSubtitle = () => {
    if (subtitleInput.trim() && !formData.subtitles_available.includes(subtitleInput.trim())) {
      setFormData(prev => ({
        ...prev,
        subtitles_available: [...prev.subtitles_available, subtitleInput.trim()]
      }));
      setSubtitleInput('');
    }
  };

  const removeSubtitle = (subtitleToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      subtitles_available: prev.subtitles_available.filter(subtitle => subtitle !== subtitleToRemove)
    }));
  };

  const handleSubmit = async (action: 'save' | 'publish') => {
    try {
      setSaving(true);
      setError(null);

      // Validation
      if (!formData.title.trim()) {
        throw new Error('Animation title is required');
      }
      if (!formData.description.trim()) {
        throw new Error('Animation description is required');
      }

      const submitData = new FormData();
      
      // Basic fields
      submitData.append('title', formData.title.trim());
      submitData.append('description', formData.description.trim());
      submitData.append('short_description', formData.short_description.trim() || formData.description.substring(0, 250));
      submitData.append('category', formData.category);
      submitData.append('animation_type', formData.animation_type);
      submitData.append('tags', JSON.stringify(formData.tags));
      submitData.append('duration', formData.duration.toString());
      submitData.append('video_quality', formData.video_quality);
      submitData.append('frame_rate', formData.frame_rate);
      submitData.append('resolution_width', formData.resolution_width.toString());
      submitData.append('resolution_height', formData.resolution_height.toString());
      submitData.append('animation_software', formData.animation_software.trim());
      submitData.append('render_engine', formData.render_engine.trim());
      submitData.append('production_time', formData.production_time.toString());
      submitData.append('language', formData.language);
      submitData.append('subtitles_available', JSON.stringify(formData.subtitles_available));
      submitData.append('director', formData.director.trim());
      submitData.append('animator', formData.animator.trim());
      submitData.append('voice_actors', JSON.stringify(formData.voice_actors));
      submitData.append('music_composer', formData.music_composer.trim());
      submitData.append('sound_designer', formData.sound_designer.trim());
      submitData.append('studio', formData.studio.trim());
      
      // Optional fields
      if (formData.release_year) {
        submitData.append('release_year', formData.release_year.toString());
      }
      if (formData.budget) {
        submitData.append('budget', formData.budget.toString());
      }
      if (formData.episode_number) {
        submitData.append('episode_number', formData.episode_number.toString());
      }
      if (formData.season_number) {
        submitData.append('season_number', formData.season_number.toString());
      }
      
      // Booleans
      submitData.append('is_featured', formData.is_featured.toString());
      submitData.append('is_trending', formData.is_trending.toString());
      submitData.append('is_premium', formData.is_premium.toString());
      submitData.append('is_series', formData.is_series.toString());
      submitData.append('series_name', formData.series_name.trim());
      
      // Status
      const status = action === 'publish' ? 'published' : formData.status;
      submitData.append('status', status);

      // Files (only if new files are selected)
      if (formData.video_file) {
        submitData.append('video_file', formData.video_file);
      }
      if (formData.thumbnail) {
        submitData.append('thumbnail', formData.thumbnail);
      }
      if (formData.poster) {
        submitData.append('poster', formData.poster);
      }
      if (formData.banner) {
        submitData.append('banner', formData.banner);
      }
      if (formData.project_file) {
        submitData.append('project_file', formData.project_file);
      }
      if (formData.storyboard) {
        submitData.append('storyboard', formData.storyboard);
      }
      if (formData.concept_art) {
        submitData.append('concept_art', formData.concept_art);
      }

      await animationService.updateAnimation(id!, submitData);
      
      // Show success message
      const actionText = action === 'publish' ? 'published' : 'updated';
      dispatch(uiActions.addNotification({
        message: `Animation "${formData.title}" has been ${actionText} successfully!`,
        type: 'success'
      }));

      // Navigate back to content management
      navigate('/admin/content');

    } catch (err: unknown) {
      console.error('Error updating animation:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update animation. Please try again.';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading animation...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error && !animation) {
    return (
      <AdminLayout>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Animation</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => navigate('/admin/content')}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Back to Content Management
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="py-4 sm:py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center min-w-0 flex-1 pt-16 lg:pt-0">
                  <button
                    onClick={() => navigate('/admin/content')}
                    className="p-2 text-gray-600 hover:text-gray-900 transition-colors mr-3"
                    aria-label="Back to Content Management"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <Palette className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 mr-2 sm:mr-3 flex-shrink-0" />
                  <div className="min-w-0">
                    <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">Edit Animation</h1>
                    <p className="mt-1 sm:mt-2 text-xs sm:text-base text-gray-600">Update animation content and settings</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/admin/content')}
                  className="p-2 text-gray-600 hover:text-gray-900 transition-colors flex-shrink-0 ml-2"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 max-w-6xl mx-auto">
          {/* Error Display */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">{error}</div>
                </div>
              </div>
            </div>
          )}

          <form className="space-y-6 sm:space-y-8">
            {/* Basic Information */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-6 flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Basic Information
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Animation Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-sm sm:text-base"
                    placeholder="Enter animation title"
                  />
                </div>

                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-sm sm:text-base resize-y"
                    placeholder="Enter animation description"
                  />
                </div>

                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Short Description
                  </label>
                  <input
                    type="text"
                    value={formData.short_description}
                    onChange={(e) => handleInputChange('short_description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-sm sm:text-base"
                    placeholder="Brief description for previews"
                    maxLength={250}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.short_description.length}/250 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-sm sm:text-base"
                  >
                    <option value="2d_animation">2D Animation</option>
                    <option value="3d_animation">3D Animation</option>
                    <option value="character_animation">Character Animation</option>
                    <option value="motion_graphics">Motion Graphics</option>
                    <option value="stop_motion">Stop Motion</option>
                    <option value="experimental">Experimental</option>
                    <option value="educational">Educational</option>
                    <option value="commercial">Commercial</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Animation Type
                  </label>
                  <select
                    value={formData.animation_type}
                    onChange={(e) => handleInputChange('animation_type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-sm sm:text-base"
                  >
                    <option value="2d">2D Animation</option>
                    <option value="3d">3D Animation</option>
                    <option value="mixed">Mixed Media</option>
                    <option value="motion_graphics">Motion Graphics</option>
                    <option value="stop_motion">Stop Motion</option>
                    <option value="ai_generated">AI Generated</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (seconds)
                  </label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-sm sm:text-base"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Language
                  </label>
                  <input
                    type="text"
                    value={formData.language}
                    onChange={(e) => handleInputChange('language', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-sm sm:text-base"
                    placeholder="e.g., English, Spanish"
                  />
                </div>
              </div>
            </div>

            {/* Technical Specifications */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-6 flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Technical Specifications
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Video Quality
                  </label>
                  <select
                    value={formData.video_quality}
                    onChange={(e) => handleInputChange('video_quality', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-sm sm:text-base"
                  >
                    <option value="360p">360p</option>
                    <option value="480p">480p</option>
                    <option value="720p">720p HD</option>
                    <option value="1080p">1080p Full HD</option>
                    <option value="1440p">1440p 2K</option>
                    <option value="2160p">2160p 4K</option>
                    <option value="4320p">4320p 8K</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Frame Rate (fps)
                  </label>
                  <select
                    value={formData.frame_rate}
                    onChange={(e) => handleInputChange('frame_rate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-sm sm:text-base"
                  >
                    <option value="12">12 fps</option>
                    <option value="24">24 fps</option>
                    <option value="25">25 fps</option>
                    <option value="30">30 fps</option>
                    <option value="60">60 fps</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Resolution Width
                  </label>
                  <input
                    type="number"
                    value={formData.resolution_width}
                    onChange={(e) => handleInputChange('resolution_width', parseInt(e.target.value) || 1920)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-sm sm:text-base"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Resolution Height
                  </label>
                  <input
                    type="number"
                    value={formData.resolution_height}
                    onChange={(e) => handleInputChange('resolution_height', parseInt(e.target.value) || 1080)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-sm sm:text-base"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Animation Software
                  </label>
                  <input
                    type="text"
                    value={formData.animation_software}
                    onChange={(e) => handleInputChange('animation_software', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-sm sm:text-base"
                    placeholder="e.g., Blender, Maya, After Effects"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Render Engine
                  </label>
                  <input
                    type="text"
                    value={formData.render_engine}
                    onChange={(e) => handleInputChange('render_engine', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-sm sm:text-base"
                    placeholder="e.g., Cycles, Eevee, Arnold"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Production Time (hours)
                  </label>
                  <input
                    type="number"
                    value={formData.production_time}
                    onChange={(e) => handleInputChange('production_time', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-sm sm:text-base"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Release Year
                  </label>
                  <input
                    type="number"
                    value={formData.release_year || ''}
                    onChange={(e) => handleInputChange('release_year', e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-sm sm:text-base"
                    min="1900"
                    max="2030"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget (USD)
                  </label>
                  <input
                    type="number"
                    value={formData.budget || ''}
                    onChange={(e) => handleInputChange('budget', e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-sm sm:text-base"
                    min="0"
                    placeholder="Optional"
                  />
                </div>
              </div>
            </div>

            {/* Production Team */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-6 flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Production Team
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Director
                  </label>
                  <input
                    type="text"
                    value={formData.director}
                    onChange={(e) => handleInputChange('director', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-sm sm:text-base"
                    placeholder="Director name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lead Animator
                  </label>
                  <input
                    type="text"
                    value={formData.animator}
                    onChange={(e) => handleInputChange('animator', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-sm sm:text-base"
                    placeholder="Lead animator name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Music Composer
                  </label>
                  <input
                    type="text"
                    value={formData.music_composer}
                    onChange={(e) => handleInputChange('music_composer', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-sm sm:text-base"
                    placeholder="Composer name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sound Designer
                  </label>
                  <input
                    type="text"
                    value={formData.sound_designer}
                    onChange={(e) => handleInputChange('sound_designer', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-sm sm:text-base"
                    placeholder="Sound designer name"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Studio
                  </label>
                  <input
                    type="text"
                    value={formData.studio}
                    onChange={(e) => handleInputChange('studio', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-sm sm:text-base"
                    placeholder="Production studio name"
                  />
                </div>

                {/* Voice Actors */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Voice Actors
                  </label>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={voiceActorInput}
                        onChange={(e) => setVoiceActorInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addVoiceActor()}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-sm sm:text-base"
                        placeholder="Add voice actor"
                      />
                      <button
                        type="button"
                        onClick={addVoiceActor}
                        className="bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {formData.voice_actors.map((actor, index) => (
                        <span
                          key={index}
                          className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center"
                        >
                          {actor}
                          <button
                            type="button"
                            onClick={() => removeVoiceActor(actor)}
                            className="ml-2 text-purple-600 hover:text-purple-800"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Subtitles */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-6">
                Subtitles & Accessibility
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Subtitles
                </label>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={subtitleInput}
                      onChange={(e) => setSubtitleInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addSubtitle()}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-sm sm:text-base"
                      placeholder="Add subtitle language (e.g., English, Spanish)"
                    />
                    <button
                      type="button"
                      onClick={addSubtitle}
                      className="bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {formData.subtitles_available.map((subtitle, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center"
                      >
                        {subtitle}
                        <button
                          type="button"
                          onClick={() => removeSubtitle(subtitle)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Series Information */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-6">
                Series Information
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_series"
                    checked={formData.is_series}
                    onChange={(e) => handleInputChange('is_series', e.target.checked)}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <label htmlFor="is_series" className="ml-2 text-sm text-gray-700">
                    This is part of a series
                  </label>
                </div>

                {formData.is_series && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Series Name
                      </label>
                      <input
                        type="text"
                        value={formData.series_name}
                        onChange={(e) => handleInputChange('series_name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-sm sm:text-base"
                        placeholder="Enter series name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Season Number
                      </label>
                      <input
                        type="number"
                        value={formData.season_number || ''}
                        onChange={(e) => handleInputChange('season_number', e.target.value ? parseInt(e.target.value) : undefined)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-sm sm:text-base"
                        min="1"
                        placeholder="Season"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Episode Number
                      </label>
                      <input
                        type="number"
                        value={formData.episode_number || ''}
                        onChange={(e) => handleInputChange('episode_number', e.target.value ? parseInt(e.target.value) : undefined)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-sm sm:text-base"
                        min="1"
                        placeholder="Episode"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Media Files */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-6 flex items-center">
                <Upload className="h-5 w-5 mr-2" />
                Media Files
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Video File
                  </label>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => handleFileChange('video_file', e.target.files?.[0] || null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thumbnail
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange('thumbnail', e.target.files?.[0] || null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Poster Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange('poster', e.target.files?.[0] || null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Banner Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange('banner', e.target.files?.[0] || null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project File
                  </label>
                  <input
                    type="file"
                    onChange={(e) => handleFileChange('project_file', e.target.files?.[0] || null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Storyboard
                  </label>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => handleFileChange('storyboard', e.target.files?.[0] || null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Concept Art
                  </label>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => handleFileChange('concept_art', e.target.files?.[0] || null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-sm sm:text-base"
                  />
                </div>
              </div>
            </div>

            {/* Settings & Status */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-6">
                Settings & Status
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-sm sm:text-base"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                    <option value="processing">Processing</option>
                    <option value="generating">Generating</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_featured"
                      checked={formData.is_featured}
                      onChange={(e) => handleInputChange('is_featured', e.target.checked)}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <label htmlFor="is_featured" className="ml-2 text-sm text-gray-700">
                      Featured Animation
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_trending"
                      checked={formData.is_trending}
                      onChange={(e) => handleInputChange('is_trending', e.target.checked)}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <label htmlFor="is_trending" className="ml-2 text-sm text-gray-700">
                      Trending Animation
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_premium"
                      checked={formData.is_premium}
                      onChange={(e) => handleInputChange('is_premium', e.target.checked)}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <label htmlFor="is_premium" className="ml-2 text-sm text-gray-700">
                      Premium Animation
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-6">
                Tags
              </h3>
              
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-sm sm:text-base"
                    placeholder="Add tag"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm flex items-center"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-2 text-gray-600 hover:text-gray-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                
                {formData.tags.length === 0 && (
                  <p className="text-sm text-gray-500">No tags added yet</p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-end bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
              <button
                type="button"
                onClick={() => navigate('/admin/content')}
                className="w-full sm:w-auto px-4 sm:px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSubmit('save')}
                disabled={saving}
                className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center text-sm sm:text-base"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {saving ? 'Saving...' : 'Save Draft'}
              </button>
              <button
                type="button"
                onClick={() => handleSubmit('publish')}
                disabled={saving}
                className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center text-sm sm:text-base"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                {saving ? 'Publishing...' : 'Publish Animation'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
};

export default EditAnimationPage;
