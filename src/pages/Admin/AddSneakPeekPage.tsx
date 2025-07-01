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
  Eye,
  Calendar
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
      <div className="flex flex-col h-full">
        {/* Fixed Header */}
        <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <Eye className="w-8 h-8 text-orange-600" />
            <h1 className="text-2xl font-bold text-gray-900">Add New Sneak Peek</h1>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6">
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <p className="text-red-700">{error}</p>
                </div>
              )}

              <form className="space-y-6">
                {/* Required fields indicator */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-700">
                    <span className="font-medium">Fields marked with * are required.</span> 
                    Please fill out all required fields before submitting.
                  </p>
                </div>
            {/* Basic Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sneak Peek Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Brief description for previews and social media (optional - will use main description if empty)"
                />
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
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Video File *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    {formData.video_file ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Play className="w-5 h-5 text-orange-600" />
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
                          <span className="text-orange-600 hover:text-orange-700">Upload video file</span>
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
                          <ImageIcon className="w-5 h-5 text-orange-600" />
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
                          <span className="text-orange-600 hover:text-orange-700">Upload thumbnail</span>
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
                          <ImageIcon className="w-5 h-5 text-orange-600" />
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
                          <span className="text-orange-600 hover:text-orange-700">Upload poster</span>
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
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Technical Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Related Content & Release Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Related Content Type
                  </label>
                  <select
                    name="related_content_type"
                    value={formData.related_content_type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags (Maximum 10)
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Add a tag and press Enter"
                  disabled={formData.tags.length >= 10}
                />
                <button
                  type="button"
                  onClick={addTag}
                  disabled={formData.tags.length >= 10}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2 disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  Add
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
                      className="text-orange-600 hover:text-orange-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {formData.tags.length}/10 tags used
              </p>
            </div>

            {/* SEO Metadata */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">SEO Metadata</h3>
              
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Comma-separated keywords for SEO"
                  />
                </div>
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
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <span className="text-sm text-gray-700">Featured Sneak Peek</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="is_trending"
                    checked={formData.is_trending}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <span className="text-sm text-gray-700">Trending</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="is_premium"
                    checked={formData.is_premium}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <span className="text-sm text-gray-700">Premium Content</span>
                </label>
              </div>
            </div>

          </form>
            </div>
          </div>
        </div>

        {/* Fixed Footer with Action Buttons */}
        <div className="flex-shrink-0 bg-white border-t border-gray-200 px-6 py-4">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <button
              type="button"
              onClick={() => window.history.back()}
              disabled={loading}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
            >
              Cancel
            </button>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => handleSubmit('save')}
                disabled={loading}
                className="px-6 py-2 border border-orange-300 text-orange-700 rounded-lg hover:bg-orange-50 flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Saving...' : 'Save Draft'}
              </button>

              <button
                type="button"
                onClick={() => handleSubmit('publish')}
                disabled={loading}
                className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2 disabled:opacity-50"
              >
                <Upload className="w-4 h-4" />
                {loading ? 'Publishing...' : 'Publish'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AddSneakPeekPage;
