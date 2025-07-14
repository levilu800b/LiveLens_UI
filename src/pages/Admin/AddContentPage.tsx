// src/pages/Admin/AddContentPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { 
  Save, 
  Upload, 
  X, 
  Play,
  AlertTriangle
} from 'lucide-react';
import AdminLayout from '../../components/Admin/AdminLayout';
import { uiActions } from '../../store/reducers/uiReducers';
import mediaService from '../../services/mediaService';

interface ContentFormData {
  title: string;
  description: string;
  short_description: string;
  category: string;
  content_type: string;
  tags: string[];
  thumbnail?: File | null;
  poster?: File | null;
  banner?: File | null;
  video_file?: File | null;
  duration: number;
  video_quality: string;
  status: 'draft' | 'published';
  release_year?: number;
  language: string;
  creator: string;
  series_name: string;
  episode_number?: number;
  difficulty_level: string;
  is_live: boolean;
  scheduled_live_time?: string;
  live_stream_url?: string;
}

const AddContentPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ContentFormData>({
    title: '',
    description: '',
    short_description: '',
    category: 'documentary', // Use valid category from backend
    content_type: 'tutorial', // This is the content type
    tags: [],
    duration: 15,
    video_quality: '1080p',
    status: 'draft',
    language: 'English',
    creator: '',
    series_name: '',
    difficulty_level: 'beginner',
    is_live: false
  });
  const [tagInput, setTagInput] = useState('');

  const categoryOptions = [
    { value: 'action', label: 'Action' },
    { value: 'adventure', label: 'Adventure' },
    { value: 'comedy', label: 'Comedy' },
    { value: 'drama', label: 'Drama' },
    { value: 'horror', label: 'Horror' },
    { value: 'romance', label: 'Romance' },
    { value: 'sci_fi', label: 'Science Fiction' },
    { value: 'fantasy', label: 'Fantasy' },
    { value: 'thriller', label: 'Thriller' },
    { value: 'documentary', label: 'Documentary' },
    { value: 'animation', label: 'Animation' },
    { value: 'mystery', label: 'Mystery' },
    { value: 'crime', label: 'Crime' },
    { value: 'biography', label: 'Biography' },
    { value: 'history', label: 'History' },
    { value: 'music', label: 'Music' },
    { value: 'sport', label: 'Sport' },
    { value: 'family', label: 'Family' },
    { value: 'educational', label: 'Educational' },
    { value: 'tech', label: 'Technology' },
    { value: 'lifestyle', label: 'Lifestyle' },
    { value: 'other', label: 'Other' }
  ];

  const contentTypeOptions = [
    { value: 'tutorial', label: 'Tutorial' },
    { value: 'review', label: 'Review' },
    { value: 'vlog', label: 'Vlog' },
    { value: 'interview', label: 'Interview' },
    { value: 'presentation', label: 'Presentation' },
    { value: 'webinar', label: 'Webinar' },
    { value: 'course', label: 'Course' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'news', label: 'News' },
    { value: 'sports', label: 'Sports' },
    { value: 'music_video', label: 'Music Video' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'short_film', label: 'Short Film' },
    { value: 'documentary', label: 'Documentary' },
    { value: 'other', label: 'Other' }
  ];

  const qualityOptions = [
    { value: '360p', label: '360p' },
    { value: '480p', label: '480p' },
    { value: '720p', label: '720p HD' },
    { value: '1080p', label: '1080p Full HD' },
    { value: '1440p', label: '1440p QHD' },
    { value: '2160p', label: '4K UHD' },
    { value: '4320p', label: '8K UHD' }
  ];

  const difficultyOptions = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
    { value: 'expert', label: 'Expert' }
  ];

  const handleInputChange = (field: keyof ContentFormData, value: string | number | boolean | File | null | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (field: 'thumbnail' | 'poster' | 'banner' | 'video_file', file: File | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: file
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
      if (formData.description.trim().length < 10) {
        throw new Error('Description must be at least 10 characters long');
      }
      // Video file is optional for now
      // if (!formData.is_live && !formData.video_file) {
      //   throw new Error('Video file is required (unless this is a live stream)');
      // }
      if (formData.is_live && !formData.live_stream_url && !formData.scheduled_live_time) {
        throw new Error('Live stream URL or scheduled time is required for live content');
      }

      // Create FormData for file uploads
      const submitData = new FormData();
      
      // Add text fields
      submitData.append('title', formData.title.trim());
      submitData.append('description', formData.description.trim());
      submitData.append('short_description', formData.short_description.trim() || formData.description.substring(0, 200));
      submitData.append('category', formData.category);
      submitData.append('content_type', formData.content_type);
      submitData.append('duration', formData.duration.toString());
      submitData.append('video_quality', formData.video_quality);
      submitData.append('status', action === 'publish' ? 'published' : 'draft');
      submitData.append('language', formData.language);
      submitData.append('creator', formData.creator);
      submitData.append('difficulty_level', formData.difficulty_level);
      submitData.append('is_live', formData.is_live.toString());

      // Add optional fields
      if (formData.release_year) {
        submitData.append('release_year', formData.release_year.toString());
      }
      if (formData.series_name) {
        submitData.append('series_name', formData.series_name);
      }
      if (formData.episode_number) {
        submitData.append('episode_number', formData.episode_number.toString());
      }
      if (formData.is_live && formData.live_stream_url) {
        submitData.append('live_stream_url', formData.live_stream_url);
      }
      if (formData.is_live && formData.scheduled_live_time) {
        submitData.append('scheduled_live_time', formData.scheduled_live_time);
      }

      // Add arrays (tags)
      formData.tags.forEach(tag => {
        submitData.append('tags', tag);
      });

      // Add file uploads
      if (formData.thumbnail) {
        submitData.append('thumbnail', formData.thumbnail);
      }
      if (formData.poster) {
        submitData.append('poster', formData.poster);
      }
      if (formData.banner) {
        submitData.append('banner', formData.banner);
      }
      if (formData.video_file) {
        submitData.append('video_file', formData.video_file);
      }

      await mediaService.createContent(submitData);
      
      // Show success message
      const actionText = action === 'publish' ? 'published' : 'saved as draft';
      dispatch(uiActions.addNotification({
        type: 'success',
        message: `Content "${formData.title}" has been ${actionText} successfully!`
      }));

      // Navigate to the media/contents page to show the new content
      if (action === 'publish') {
        navigate('/media/contents');
      } else {
        navigate('/admin/content');
      }

    } catch (err: unknown) {
      console.error('Error creating content:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create content. Please try again.';
      setError(errorMessage);
      dispatch(uiActions.addNotification({
        type: 'error',
        message: errorMessage
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="py-4 sm:py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center min-w-0 flex-1 pt-16 lg:pt-0">
                  <Play className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 mr-2 sm:mr-3 flex-shrink-0" />
                  <div className="min-w-0">
                    <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">Add New Content</h1>
                    <p className="mt-1 sm:mt-2 text-xs sm:text-base text-gray-600">Create new video content</p>
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
        <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 max-w-5xl mx-auto">
          {error && (
            <div className="mb-4 sm:mb-6 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">{error}</div>
                </div>
              </div>
            </div>
          )}

          <form className="space-y-4 sm:space-y-6 lg:space-y-8">
            {/* Basic Information */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Basic Information</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm sm:text-base"
                    placeholder="Enter content title"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm sm:text-base resize-y"
                    placeholder="Enter content description"
                  />
                </div>

                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Short Description
                  </label>
                  <textarea
                    value={formData.short_description}
                    onChange={(e) => handleInputChange('short_description', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm sm:text-base resize-y"
                    placeholder="Brief description for cards (optional)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm sm:text-base"
                  >
                    {categoryOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content Type
                  </label>
                  <select
                    value={formData.content_type}
                    onChange={(e) => handleInputChange('content_type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm sm:text-base"
                  >
                    {contentTypeOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty Level
                  </label>
                  <select
                    value={formData.difficulty_level}
                    onChange={(e) => handleInputChange('difficulty_level', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm sm:text-base"
                  >
                    {difficultyOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Video Quality
                  </label>
                  <select
                    value={formData.video_quality}
                    onChange={(e) => handleInputChange('video_quality', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm sm:text-base"
                  >
                    {qualityOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.duration}
                    onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 15)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm sm:text-base"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm sm:text-base"
                    placeholder="e.g., English, Spanish"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Creator/Host
                  </label>
                  <input
                    type="text"
                    value={formData.creator}
                    onChange={(e) => handleInputChange('creator', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm sm:text-base"
                    placeholder="Content creator name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Release Year
                  </label>
                  <input
                    type="number"
                    min="1900"
                    max={new Date().getFullYear() + 5}
                    value={formData.release_year || ''}
                    onChange={(e) => handleInputChange('release_year', e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Series Name (if part of series)
                  </label>
                  <input
                    type="text"
                    value={formData.series_name}
                    onChange={(e) => handleInputChange('series_name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm sm:text-base"
                    placeholder="Series or channel name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Episode Number (if applicable)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.episode_number || ''}
                    onChange={(e) => handleInputChange('episode_number', e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm sm:text-base"
                  />
                </div>
              </div>
            </div>

            {/* Live Streaming Options */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Live Streaming Options</h3>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_live"
                    checked={formData.is_live}
                    onChange={(e) => handleInputChange('is_live', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_live" className="ml-2 block text-sm text-gray-900">
                    This is live content
                  </label>
                </div>

                {formData.is_live && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Live Stream URL
                      </label>
                      <input
                        type="url"
                        value={formData.live_stream_url || ''}
                        onChange={(e) => handleInputChange('live_stream_url', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm sm:text-base"
                        placeholder="https://example.com/stream"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Scheduled Live Time
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.scheduled_live_time || ''}
                        onChange={(e) => handleInputChange('scheduled_live_time', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm sm:text-base"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tags */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Tags</h3>
              
              <div className="flex flex-col sm:flex-row gap-2 mb-4">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm sm:text-base"
                  placeholder="Add a tag and press Enter"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm whitespace-nowrap"
                >
                  Add Tag
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs sm:text-sm bg-blue-100 text-blue-800"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-blue-400 hover:bg-blue-200 hover:text-blue-500 focus:outline-none focus:bg-blue-200 focus:text-blue-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Media Files */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Media Files</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {formData.is_live ? 'Video File (Optional for Live)' : 'Video File *'} (MP4, AVI, MOV)
                  </label>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => handleFileChange('video_file', e.target.files?.[0] || null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thumbnail Image (JPG, PNG)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange('thumbnail', e.target.files?.[0] || null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Poster Image (JPG, PNG)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange('poster', e.target.files?.[0] || null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm sm:text-base"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Banner Image (JPG, PNG)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange('banner', e.target.files?.[0] || null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm sm:text-base"
                  />
                </div>
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
                    {loading ? 'Publishing...' : 'Publish Content'}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AddContentPage;
