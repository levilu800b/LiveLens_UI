// src/pages/Admin/AddSneakPeekPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Save, 
  Upload, 
  X, 
  Plus,
  AlertTriangle,
  Play,
  Image as ImageIcon,
  Eye
} from 'lucide-react';
import AdminLayout from '../../components/Admin/AdminLayout';

interface SneakPeekFormData {
  title: string;
  description: string;
  short_description: string;
  category: string;
  tags: string[];
  video_file?: File | null;
  thumbnail?: File | null;
  poster?: File | null;
  duration: number;
  video_quality: '480p' | '720p' | '1080p' | '4K';
  release_date?: string;
  content_rating: 'G' | 'PG' | 'PG-13' | 'R' | 'NC-17';
  status: 'draft' | 'published' | 'archived';
  is_featured: boolean;
  is_trending: boolean;
  is_premium: boolean;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  related_content_type: string;
  related_content_id?: string;
}

const AddSneakPeekPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<SneakPeekFormData>({
    title: '',
    description: '',
    short_description: '',
    category: 'teaser',
    tags: [],
    duration: 0,
    video_quality: '1080p',
    content_rating: 'PG',
    status: 'draft',
    is_featured: false,
    is_trending: false,
    is_premium: false,
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    related_content_type: ''
  });
  const [tagInput, setTagInput] = useState('');

  const categoryOptions = [
    { value: 'upcoming_film', label: 'Upcoming Film' },
    { value: 'upcoming_content', label: 'Upcoming Content' },
    { value: 'upcoming_story', label: 'Upcoming Story' },
    { value: 'upcoming_podcast', label: 'Upcoming Podcast' },
    { value: 'upcoming_animation', label: 'Upcoming Animation' },
    { value: 'behind_scenes', label: 'Behind the Scenes' },
    { value: 'teaser', label: 'Teaser' },
    { value: 'trailer', label: 'Trailer' },
    { value: 'announcement', label: 'Announcement' },
    { value: 'other', label: 'Other' }
  ];

  const videoQualityOptions = [
    { value: '480p', label: '480p' },
    { value: '720p', label: '720p' },
    { value: '1080p', label: '1080p' },
    { value: '4K', label: '4K' }
  ];

  const contentRatingOptions = [
    { value: 'G', label: 'G - General Audiences' },
    { value: 'PG', label: 'PG - Parental Guidance' },
    { value: 'PG-13', label: 'PG-13 - Parents Strongly Cautioned' },
    { value: 'R', label: 'R - Restricted' },
    { value: 'NC-17', label: 'NC-17 - Adults Only' }
  ];

  const relatedContentTypeOptions = [
    { value: '', label: 'Select Content Type' },
    { value: 'film', label: 'Film' },
    { value: 'story', label: 'Story' },
    { value: 'podcast', label: 'Podcast' },
    { value: 'animation', label: 'Animation' },
    { value: 'content', label: 'General Content' }
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
        [name]: parseInt(value) || 0
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

  const removeFile = (fieldName: keyof SneakPeekFormData) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: null
    }));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim().toLowerCase()) && formData.tags.length < 10) {
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

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
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
      if (!formData.video_file) {
        throw new Error('Video file is required');
      }
      if (formData.duration > 600) {
        throw new Error('Sneak peeks cannot be longer than 10 minutes');
      }
      if (formData.tags.length > 10) {
        throw new Error('Maximum 10 tags allowed');
      }

      const submitData = new FormData();
      
      // Basic fields
      submitData.append('title', formData.title.trim());
      submitData.append('description', formData.description.trim());
      submitData.append('short_description', formData.short_description.trim() || formData.description.substring(0, 250));
      submitData.append('category', formData.category);
      submitData.append('tags_list', JSON.stringify(formData.tags));
      submitData.append('duration', formData.duration.toString());
      submitData.append('video_quality', formData.video_quality);
      submitData.append('content_rating', formData.content_rating);
      submitData.append('meta_title', formData.meta_title.trim());
      submitData.append('meta_description', formData.meta_description.trim());
      submitData.append('meta_keywords', formData.meta_keywords.trim());
      submitData.append('related_content_type', formData.related_content_type);
      
      // Optional fields
      if (formData.release_date) {
        submitData.append('release_date', formData.release_date);
      }
      if (formData.related_content_id) {
        submitData.append('related_content_id', formData.related_content_id);
      }
      
      // Booleans
      submitData.append('is_featured', formData.is_featured.toString());
      submitData.append('is_trending', formData.is_trending.toString());
      submitData.append('is_premium', formData.is_premium.toString());
      
      // Status
      const status = action === 'publish' ? 'published' : 'draft';
      submitData.append('status', status);

      // Files
      if (formData.video_file) {
        submitData.append('video_file', formData.video_file);
      }
      if (formData.thumbnail) {
        submitData.append('thumbnail', formData.thumbnail);
      }
      if (formData.poster) {
        submitData.append('poster', formData.poster);
      }

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/sneak-peeks/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: submitData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.detail || 'Failed to create sneak peek');
      }

      await response.json();
      
      // Show success message
      const actionText = action === 'publish' ? 'published' : 'saved as draft';
      alert(`Sneak peek "${formData.title}" has been ${actionText} successfully!`);

      // Navigate back to content management
      navigate('/admin/content');

    } catch (err: unknown) {
      console.error('Error creating sneak peek:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create sneak peek. Please try again.';
      setError(errorMessage);
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
                  <Eye className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600 mr-2 sm:mr-3 flex-shrink-0" />
                  <div className="min-w-0">
                    <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">Add New Sneak Peek</h1>
                    <p className="mt-1 sm:mt-2 text-xs sm:text-base text-gray-600">Create a new sneak peek preview</p>
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
            {/* Required fields indicator */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-700">
                <span className="font-medium">Fields marked with * are required.</span> 
                Please fill out all required fields before submitting.
              </p>
            </div>

            {/* Basic Information */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Basic Information</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sneak Peek Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm sm:text-base"
                    placeholder="Enter sneak peek title"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm sm:text-base"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm sm:text-base"
                  placeholder="Enter detailed sneak peek description"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm sm:text-base"
                  placeholder="Brief description for previews and social media (optional - will use main description if empty)"
                />
              </div>
            </div>

            {/* Media Files */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Media Files</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Video File */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Video File *
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
                          <span className="text-blue-600 hover:text-orange-700">Upload video file</span>
                          <input
                            type="file"
                            name="video_file"
                            onChange={handleFileChange}
                            accept="video/*"
                            className="hidden"
                          />
                        </label>
                        <p className="text-xs text-gray-500 mt-2">Maximum 10 minutes duration</p>
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
                          <span className="text-blue-600 hover:text-orange-700">Upload thumbnail</span>
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
                          <span className="text-blue-600 hover:text-orange-700">Upload poster</span>
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
              </div>
            </div>

            {/* Technical Information */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Technical Information</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
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
                      max="600"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm sm:text-base"
                      placeholder="Duration in seconds"
                    />
                    <span className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-600 min-w-fit">
                      {formatDuration(formData.duration)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Max 10 minutes (600 seconds)</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Video Quality
                  </label>
                  <select
                    name="video_quality"
                    value={formData.video_quality}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm sm:text-base"
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
                    Content Rating
                  </label>
                  <select
                    name="content_rating"
                    value={formData.content_rating}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm sm:text-base"
                  >
                    {contentRatingOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Related Content */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Related Content & Release Information</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Related Content Type
                  </label>
                  <select
                    name="related_content_type"
                    value={formData.related_content_type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm sm:text-base"
                  >
                    {relatedContentTypeOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Related Content ID
                  </label>
                  <input
                    type="text"
                    name="related_content_id"
                    value={formData.related_content_id || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm sm:text-base"
                    placeholder="UUID of related content (optional)"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expected Release Date
                  </label>
                  <input
                    type="date"
                    name="release_date"
                    value={formData.release_date || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm sm:text-base"
                  />
                </div>
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
                  disabled={formData.tags.length >= 10}
                />
                <button
                  type="button"
                  onClick={addTag}
                  disabled={formData.tags.length >= 10}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center justify-center gap-2 disabled:opacity-50 min-h-[44px] text-sm sm:text-base"
                >
                  <Plus className="w-4 h-4" />
                  Add Tag
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-orange-600 hover:text-orange-800 p-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              {formData.tags.length > 0 && (
                <p className="text-xs text-gray-500 mt-2">
                  {formData.tags.length}/10 tags used
                </p>
              )}
            </div>

            {/* SEO Metadata */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-6">SEO Metadata</h3>
              
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    name="meta_title"
                    value={formData.meta_title}
                    onChange={handleInputChange}
                    maxLength={60}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm sm:text-base"
                    placeholder="SEO title (max 60 characters)"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.meta_title.length}/60 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Description
                  </label>
                  <textarea
                    name="meta_description"
                    value={formData.meta_description}
                    onChange={handleInputChange}
                    rows={2}
                    maxLength={160}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm sm:text-base"
                    placeholder="SEO description (max 160 characters)"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.meta_description.length}/160 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Keywords
                  </label>
                  <input
                    type="text"
                    name="meta_keywords"
                    value={formData.meta_keywords}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm sm:text-base"
                    placeholder="Comma-separated keywords for SEO"
                  />
                </div>
              </div>
            </div>

            {/* Settings */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 space-y-4 sm:space-y-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 sm:pb-3">Settings</h3>
              
              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4">
                <label className="flex items-center gap-2 sm:gap-3 p-2 rounded hover:bg-gray-50 transition-colors min-h-[44px]">
                  <input
                    type="checkbox"
                    name="is_featured"
                    checked={formData.is_featured}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 sm:w-5 sm:h-5"
                  />
                  <span className="text-sm sm:text-base text-gray-700 font-medium">Featured Sneak Peek</span>
                </label>

                <label className="flex items-center gap-2 sm:gap-3 p-2 rounded hover:bg-gray-50 transition-colors min-h-[44px]">
                  <input
                    type="checkbox"
                    name="is_trending"
                    checked={formData.is_trending}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 sm:w-5 sm:h-5"
                  />
                  <span className="text-sm sm:text-base text-gray-700 font-medium">Trending</span>
                </label>

                <label className="flex items-center gap-2 sm:gap-3 p-2 rounded hover:bg-gray-50 transition-colors min-h-[44px]">
                  <input
                    type="checkbox"
                    name="is_premium"
                    checked={formData.is_premium}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 sm:w-5 sm:h-5"
                  />
                  <span className="text-sm sm:text-base text-gray-700 font-medium">Premium Content</span>
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
                    className="flex items-center justify-center px-4 sm:px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 text-sm sm:text-base"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {loading ? 'Publishing...' : 'Publish Sneak Peek'}
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

export default AddSneakPeekPage;
