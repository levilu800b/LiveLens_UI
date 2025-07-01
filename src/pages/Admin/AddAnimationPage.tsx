// src/pages/Admin/AddAnimationPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Save, 
  Upload, 
  X, 
  FileText,
  Plus,
  AlertTriangle,
  Play,
  Image as ImageIcon,
  Palette,
  Settings,
  Users
} from 'lucide-react';
import AdminLayout from '../../components/Admin/AdminLayout';

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
  trailer_file?: File | null;
  project_file?: File | null;
  storyboard?: File | null;
  concept_art?: File | null;
  duration: number;
  trailer_duration: number;
  video_quality: '360p' | '480p' | '720p' | '1080p' | '1440p' | '2160p' | '4320p';
  frame_rate: '12' | '24' | '25' | '30' | '60';
  resolution_width: number;
  resolution_height: number;
  animation_software: string;
  render_engine: string;
  production_time: number;
  status: 'draft' | 'published' | 'processing' | 'generating';
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

const AddAnimationPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<AnimationFormData>({
    title: '',
    description: '',
    short_description: '',
    category: 'other',
    animation_type: '2d',
    tags: [],
    duration: 0,
    trailer_duration: 0,
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

  const categoryOptions = [
    { value: '2d_traditional', label: '2D Traditional' },
    { value: '2d_digital', label: '2D Digital' },
    { value: '3d_animation', label: '3D Animation' },
    { value: 'stop_motion', label: 'Stop Motion' },
    { value: 'motion_graphics', label: 'Motion Graphics' },
    { value: 'character_animation', label: 'Character Animation' },
    { value: 'explainer', label: 'Explainer Video' },
    { value: 'educational', label: 'Educational' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'music_video', label: 'Music Video' },
    { value: 'short_film', label: 'Short Film' },
    { value: 'series', label: 'Series' },
    { value: 'experimental', label: 'Experimental' },
    { value: 'ai_generated', label: 'AI Generated' },
    { value: 'other', label: 'Other' }
  ];

  const animationTypeOptions = [
    { value: '2d', label: '2D Animation' },
    { value: '3d', label: '3D Animation' },
    { value: 'mixed', label: 'Mixed Media' },
    { value: 'motion_graphics', label: 'Motion Graphics' },
    { value: 'stop_motion', label: 'Stop Motion' },
    { value: 'ai_generated', label: 'AI Generated' }
  ];

  const videoQualityOptions = [
    { value: '360p', label: '360p' },
    { value: '480p', label: '480p' },
    { value: '720p', label: '720p HD' },
    { value: '1080p', label: '1080p Full HD' },
    { value: '1440p', label: '1440p QHD' },
    { value: '2160p', label: '4K UHD' },
    { value: '4320p', label: '8K UHD' }
  ];

  const frameRateOptions = [
    { value: '12', label: '12 FPS' },
    { value: '24', label: '24 FPS' },
    { value: '25', label: '25 FPS' },
    { value: '30', label: '30 FPS' },
    { value: '60', label: '60 FPS' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setFormData(prev => ({
        ...prev,
        [name]: files[0]
      }));
    }
  };

  const removeFile = (fieldName: keyof AnimationFormData) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: null
    }));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim().toLowerCase())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim().toLowerCase()]
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

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (action: 'save' | 'publish') => {
    try {
      setLoading(true);
      setError(null);

      // Validation
      if (!formData.title.trim()) {
        throw new Error('Title is required');
      }
      if (!formData.description.trim()) {
        throw new Error('Description is required');
      }
      if (!formData.video_file && !formData.trailer_file) {
        throw new Error('At least one video file (main or trailer) is required');
      }
      if (formData.is_series && !formData.series_name.trim()) {
        throw new Error('Series name is required for series animations');
      }
      if (formData.is_series && !formData.episode_number) {
        throw new Error('Episode number is required for series animations');
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
      submitData.append('trailer_duration', formData.trailer_duration.toString());
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
      const status = action === 'publish' ? 'published' : 'draft';
      submitData.append('status', status);

      // Files
      if (formData.video_file) {
        submitData.append('video_file', formData.video_file);
      }
      if (formData.trailer_file) {
        submitData.append('trailer_file', formData.trailer_file);
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

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/animations/animations/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: submitData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.detail || 'Failed to create animation');
      }

      await response.json();
      
      // Show success message
      const actionText = action === 'publish' ? 'published' : 'saved as draft';
      alert(`Animation "${formData.title}" has been ${actionText} successfully!`);

      // Navigate back to content management
      navigate('/admin/content');

    } catch (err: unknown) {
      console.error('Error creating animation:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create animation. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col h-full">
        {/* Fixed Header */}
        <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between pt-16 lg:pt-0">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <Palette className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 flex-shrink-0" />
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">Add New Animation</h1>
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

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
              {error && (
                <div className="mb-4 sm:mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <p className="text-red-700 text-sm sm:text-base">{error}</p>
                </div>
              )}

              <form className="space-y-4 sm:space-y-6 lg:space-y-8">
                {/* Required fields indicator */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 sm:mb-6">
                  <p className="text-xs sm:text-sm text-blue-700">
                    <span className="font-medium">Fields marked with * are required.</span> 
                    Please fill out all required fields before submitting.
                  </p>
                </div>
            {/* Basic Information */}
            <div className="space-y-4 sm:space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Animation Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Enter animation title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  >
                    {categoryOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Enter detailed animation description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Short Description
                </label>
                <textarea
                  name="short_description"
                  value={formData.short_description}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Brief description for cards (optional - will use main description if empty)"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Animation Type
                  </label>
                  <select
                    name="animation_type"
                    value={formData.animation_type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  >
                    {animationTypeOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Language
                  </label>
                  <input
                    type="text"
                    name="language"
                    value={formData.language}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Animation language"
                  />
                </div>
              </div>
            </div>

            {/* Series Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Series Information</h3>
              
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="is_series"
                    checked={formData.is_series}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">This is part of a series</span>
                </label>
              </div>

              {formData.is_series && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Series Name *
                    </label>
                    <input
                      type="text"
                      name="series_name"
                      value={formData.series_name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="Enter series name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Episode Number *
                    </label>
                    <input
                      type="number"
                      name="episode_number"
                      value={formData.episode_number || ''}
                      onChange={handleInputChange}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Season Number
                    </label>
                    <input
                      type="number"
                      name="season_number"
                      value={formData.season_number || ''}
                      onChange={handleInputChange}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Technical Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Technical Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (seconds)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="Duration in seconds"
                    />
                    <span className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-600 min-w-fit">
                      {formatDuration(formData.duration)}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trailer Duration (seconds)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      name="trailer_duration"
                      value={formData.trailer_duration}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="Trailer duration in seconds"
                    />
                    <span className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-600 min-w-fit">
                      {formatDuration(formData.trailer_duration)}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Video Quality
                  </label>
                  <select
                    name="video_quality"
                    value={formData.video_quality}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  >
                    {videoQualityOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Frame Rate
                  </label>
                  <select
                    name="frame_rate"
                    value={formData.frame_rate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  >
                    {frameRateOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Resolution Width
                  </label>
                  <input
                    type="number"
                    name="resolution_width"
                    value={formData.resolution_width}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Width in pixels"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Resolution Height
                  </label>
                  <input
                    type="number"
                    name="resolution_height"
                    value={formData.resolution_height}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Height in pixels"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Animation Software
                  </label>
                  <input
                    type="text"
                    name="animation_software"
                    value={formData.animation_software}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="e.g., Blender, Maya, After Effects"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Render Engine
                  </label>
                  <input
                    type="text"
                    name="render_engine"
                    value={formData.render_engine}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="e.g., Cycles, Eevee, Arnold"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Production Time (hours)
                  </label>
                  <input
                    type="number"
                    name="production_time"
                    value={formData.production_time}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Total production hours"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Release Year
                  </label>
                  <input
                    type="number"
                    name="release_year"
                    value={formData.release_year || ''}
                    onChange={handleInputChange}
                    min="1900"
                    max="2030"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Release year"
                  />
                </div>
              </div>
            </div>

            {/* Media Files */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 flex items-center gap-2">
                <Play className="w-5 h-5" />
                Media Files
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Video File */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Main Video File
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    {formData.video_file ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Play className="w-5 h-5 text-blue-600" />
                          <span className="text-sm text-gray-600 truncate">
                            {formData.video_file.name}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile('video_file')}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <label className="cursor-pointer">
                          <span className="text-blue-600 hover:text-blue-700">Upload video file</span>
                          <input
                            type="file"
                            name="video_file"
                            onChange={handleFileChange}
                            accept="video/*"
                            className="hidden"
                          />
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {/* Trailer File */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trailer File
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    {formData.trailer_file ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Play className="w-5 h-5 text-blue-600" />
                          <span className="text-sm text-gray-600 truncate">
                            {formData.trailer_file.name}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile('trailer_file')}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <label className="cursor-pointer">
                          <span className="text-blue-600 hover:text-blue-700">Upload trailer</span>
                          <input
                            type="file"
                            name="trailer_file"
                            onChange={handleFileChange}
                            accept="video/*"
                            className="hidden"
                          />
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {/* Thumbnail */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thumbnail
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    {formData.thumbnail ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ImageIcon className="w-5 h-5 text-blue-600" />
                          <span className="text-sm text-gray-600 truncate">
                            {formData.thumbnail.name}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile('thumbnail')}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <label className="cursor-pointer">
                          <span className="text-blue-600 hover:text-blue-700">Upload thumbnail</span>
                          <input
                            type="file"
                            name="thumbnail"
                            onChange={handleFileChange}
                            accept="image/*"
                            className="hidden"
                          />
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {/* Poster */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Poster
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    {formData.poster ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ImageIcon className="w-5 h-5 text-blue-600" />
                          <span className="text-sm text-gray-600 truncate">
                            {formData.poster.name}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile('poster')}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <label className="cursor-pointer">
                          <span className="text-blue-600 hover:text-blue-700">Upload poster</span>
                          <input
                            type="file"
                            name="poster"
                            onChange={handleFileChange}
                            accept="image/*"
                            className="hidden"
                          />
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {/* Banner */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Banner
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    {formData.banner ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ImageIcon className="w-5 h-5 text-blue-600" />
                          <span className="text-sm text-gray-600 truncate">
                            {formData.banner.name}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile('banner')}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <label className="cursor-pointer">
                          <span className="text-blue-600 hover:text-blue-700">Upload banner</span>
                          <input
                            type="file"
                            name="banner"
                            onChange={handleFileChange}
                            accept="image/*"
                            className="hidden"
                          />
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {/* Concept Art */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Concept Art
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    {formData.concept_art ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ImageIcon className="w-5 h-5 text-blue-600" />
                          <span className="text-sm text-gray-600 truncate">
                            {formData.concept_art.name}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile('concept_art')}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <label className="cursor-pointer">
                          <span className="text-blue-600 hover:text-blue-700">Upload concept art</span>
                          <input
                            type="file"
                            name="concept_art"
                            onChange={handleFileChange}
                            accept="image/*"
                            className="hidden"
                          />
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {/* Project File */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project File
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    {formData.project_file ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="w-5 h-5 text-blue-600" />
                          <span className="text-sm text-gray-600 truncate">
                            {formData.project_file.name}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile('project_file')}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <label className="cursor-pointer">
                          <span className="text-blue-600 hover:text-blue-700">Upload project file</span>
                          <input
                            type="file"
                            name="project_file"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {/* Storyboard */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Storyboard
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    {formData.storyboard ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="w-5 h-5 text-blue-600" />
                          <span className="text-sm text-gray-600 truncate">
                            {formData.storyboard.name}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile('storyboard')}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <label className="cursor-pointer">
                          <span className="text-blue-600 hover:text-blue-700">Upload storyboard</span>
                          <input
                            type="file"
                            name="storyboard"
                            onChange={handleFileChange}
                            accept=".pdf,.doc,.docx,image/*"
                            className="hidden"
                          />
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Production Team */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Production Team
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Director
                  </label>
                  <input
                    type="text"
                    name="director"
                    value={formData.director}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Animation director"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lead Animator
                  </label>
                  <input
                    type="text"
                    name="animator"
                    value={formData.animator}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Lead animator(s)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Music Composer
                  </label>
                  <input
                    type="text"
                    name="music_composer"
                    value={formData.music_composer}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Music composer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sound Designer
                  </label>
                  <input
                    type="text"
                    name="sound_designer"
                    value={formData.sound_designer}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Sound designer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Studio
                  </label>
                  <input
                    type="text"
                    name="studio"
                    value={formData.studio}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Animation studio"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget ($)
                  </label>
                  <input
                    type="number"
                    name="budget"
                    value={formData.budget || ''}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Production budget"
                  />
                </div>
              </div>

              {/* Voice Actors */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Voice Actors
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={voiceActorInput}
                    onChange={(e) => setVoiceActorInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addVoiceActor())}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Add a voice actor and press Enter"
                  />
                  <button
                    type="button"
                    onClick={addVoiceActor}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.voice_actors.map((actor, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {actor}
                      <button
                        type="button"
                        onClick={() => removeVoiceActor(actor)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Add a tag and press Enter"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Subtitles */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Available Subtitles
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={subtitleInput}
                  onChange={(e) => setSubtitleInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSubtitle())}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Add a subtitle language and press Enter"
                />
                <button
                  type="button"
                  onClick={addSubtitle}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.subtitles_available.map((subtitle, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {subtitle}
                    <button
                      type="button"
                      onClick={() => removeSubtitle(subtitle)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Settings</h3>
              
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="is_featured"
                    checked={formData.is_featured}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Featured Animation</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="is_trending"
                    checked={formData.is_trending}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Trending</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="is_premium"
                    checked={formData.is_premium}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Premium Content</span>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="sticky bottom-0 bg-white rounded-lg border border-gray-200 p-4 sm:p-6 shadow-lg">
              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center space-y-3 sm:space-y-0 gap-3">
                <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left order-2 sm:order-1">
                  * Required fields
                </div>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 order-1 sm:order-2">
                  <button
                    type="button"
                    onClick={() => navigate('/admin/content')}
                    className="px-4 sm:px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSubmit('save')}
                    disabled={loading}
                    className="flex items-center justify-center px-4 sm:px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 text-sm sm:text-base"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Saving...' : 'Save as Draft'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSubmit('publish')}
                    disabled={loading}
                    className="flex items-center justify-center px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm sm:text-base"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {loading ? 'Publishing...' : 'Publish Animation'}
                  </button>
                </div>
              </div>
            </div>
          </form>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AddAnimationPage;
