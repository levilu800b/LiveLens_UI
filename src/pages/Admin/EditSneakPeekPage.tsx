// src/pages/Admin/EditSneakPeekPage.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { X, Plus, AlertTriangle, Film, ArrowLeft } from 'lucide-react';
import AdminLayout from '../../components/Admin/AdminLayout';
import sneakPeekService, { type SneakPeekFormData } from '../../services/sneakPeekService';

const EditSneakPeekPage: React.FC = () => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const [formData, setFormData] = useState<SneakPeekFormData>({
    title: '',
    description: '',
    summary: '',
    short_description: '',
    category: 'upcoming_content',
    tags: [],
    content_type: 'video',
    upcoming_content_type: '',
    upcoming_content_title: '',
    upcoming_release_date: '',
    duration: 0,
    video_quality: '1080p',
    content_rating: 'PG',
    release_date: '',
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    related_content_type: '',
    related_content_id: '',
    is_featured: false,
    is_trending: false,
    is_premium: false,
    is_explicit: false,
    status: 'draft',
  });

  const [currentFiles, setCurrentFiles] = useState({
    cover_image: '',
    thumbnail: '',
    poster: '',
    video_file: '',
    image_file: '',
  });

  const [newTag, setNewTag] = useState('');

  const categories = useMemo(() => [
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
  ], []);

  // Helper function to get a valid category
  const getValidCategory = useCallback((category: string): string => {
    const validCategories = categories.map(cat => cat.value);
    if (validCategories.includes(category)) {
      return category;
    }
    // If the category is invalid, try to map it to a reasonable alternative
    const categoryMappings: Record<string, string> = {
      'writing': 'upcoming_story',
      'story': 'upcoming_story',
      'film': 'upcoming_film',
      'movie': 'upcoming_film',
      'podcast': 'upcoming_podcast',
      'animation': 'upcoming_animation',
      'content': 'upcoming_content'
    };
    
    const lowercaseCategory = category.toLowerCase();
    return categoryMappings[lowercaseCategory] || 'other';
  }, [categories]);

  const contentTypes = [
    { value: 'video', label: 'Video' },
    { value: 'image', label: 'Image' },
    { value: 'text', label: 'Text' },
  ];

  const statusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'published', label: 'Published' },
    { value: 'archived', label: 'Archived' },
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

  // Load sneak peek data
  useEffect(() => {
    const loadSneakPeek = async () => {
      if (!slug) {
        setError('No sneak peek slug provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const sneakPeek = await sneakPeekService.getSneakPeek(slug);
        
        // Check if category needs to be converted
        const originalCategory = sneakPeek.category || 'upcoming_content';
        const validCategory = getValidCategory(originalCategory);
        
        setFormData({
          title: sneakPeek.title,
          description: sneakPeek.description,
          summary: sneakPeek.summary || '',
          short_description: sneakPeek.short_description || '',
          category: validCategory,
          tags: (() => {
            // Safely parse tags, handling different formats
            const rawTags = sneakPeek.tags;
            
            if (!rawTags) return [];
            
            // Function to extract clean tag from malformed strings
            const extractCleanTag = (input: string): string[] => {
              // Remove all brackets, quotes, and extra characters
              const cleaned = input
                .replace(/^\["|"?\]$|^"|"$/g, '') // Remove leading [" or trailing "] or " 
                .replace(/\\"/g, '"') // Unescape quotes
                .trim();
              
              // If it's empty after cleaning, return empty array
              if (!cleaned) return [];
              
              // If it contains commas, split and clean each part
              if (cleaned.includes(',')) {
                return cleaned.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
              }
              
              return [cleaned];
            };
            
            try {
              let finalTags: string[] = [];
              
              // Handle the specific format we're seeing: ['["game"', '"studio"]']
              if (Array.isArray(rawTags)) {
                for (const item of rawTags) {
                  if (typeof item === 'string') {
                    const cleanedTags = extractCleanTag(item);
                    finalTags.push(...cleanedTags);
                  }
                }
              } else if (typeof rawTags === 'string') {
                // Handle single string case
                const cleanedTags = extractCleanTag(rawTags);
                finalTags.push(...cleanedTags);
              }
              
              // Remove duplicates and empty strings
              finalTags = [...new Set(finalTags)].filter(tag => tag.length > 0);
              
              return finalTags;
            } catch (error) {
              console.error('Error processing tags:', error);
              return [];
            }
          })(),
          content_type: sneakPeek.content_type || 'video',
          upcoming_content_type: sneakPeek.upcoming_content_type || '',
          upcoming_content_title: sneakPeek.upcoming_content_title || '',
          upcoming_release_date: sneakPeek.upcoming_release_date || '',
          duration: sneakPeek.duration || 0,
          video_quality: sneakPeek.video_quality || '1080p',
          content_rating: sneakPeek.content_rating || 'PG',
          release_date: sneakPeek.release_date || '',
          meta_title: sneakPeek.meta_title || '',
          meta_description: sneakPeek.meta_description || '',
          meta_keywords: sneakPeek.meta_keywords || '',
          related_content_type: sneakPeek.related_content_type || '',
          related_content_id: sneakPeek.related_content_id || '',
          is_featured: !!sneakPeek.featuredAt, // Convert featuredAt to boolean
          is_trending: !!sneakPeek.is_trending,
          is_premium: !!sneakPeek.is_premium,
          is_explicit: !!sneakPeek.is_explicit,
          status: sneakPeek.status || 'draft',
        });

        // Show warning if category was converted
        if (originalCategory !== validCategory) {
          setError(`Note: Category was automatically converted from "${originalCategory}" to "${validCategory}" to match backend requirements.`);
        }

        setCurrentFiles({
          cover_image: sneakPeek.thumbnail || '',
          thumbnail: sneakPeek.thumbnail || '',
          poster: '',
          video_file: sneakPeek.video_file || '',
          image_file: sneakPeek.image_file || '',
        });

      } catch (error) {
        console.error('Error loading sneak peek:', error);
        setError(error instanceof Error ? error.message : 'Failed to load sneak peek');
      } finally {
        setLoading(false);
      }
    };

    loadSneakPeek();
  }, [slug, getValidCategory]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: keyof SneakPeekFormData) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, [fieldName]: file }));
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!slug) {
      setError('No sneak peek slug provided');
      return;
    }

    if (!formData.title.trim() || !formData.description.trim()) {
      setError('Title and description are required');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      
      await sneakPeekService.updateSneakPeek(slug, formData);
      
      // Signal that sneak peek data has been updated
      localStorage.setItem('sneakPeekDataUpdated', Date.now().toString());
      
      // Trigger storage event for cross-tab communication
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'sneakPeekDataUpdated',
        newValue: Date.now().toString(),
        storageArea: localStorage
      }));
      
      navigate('/admin/content');
    } catch (error) {
      console.error('Error updating sneak peek:', error);
      setError(error instanceof Error ? error.message : 'Failed to update sneak peek');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!slug) return;

    try {
      await sneakPeekService.deleteSneakPeek(slug);
      navigate('/admin/content');
    } catch (error) {
      console.error('Error deleting sneak peek:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete sneak peek');
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading sneak peek...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error && !formData.title) {
    return (
      <AdminLayout>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Sneak Peek</h2>
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
                  <Film className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 mr-2 sm:mr-3 flex-shrink-0" />
                  <div className="min-w-0">
                    <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">Edit Sneak Peek</h1>
                    <p className="mt-1 sm:mt-2 text-xs sm:text-base text-gray-600">Update sneak peek details</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 max-w-5xl mx-auto">
          {/* Error Display */}
          {error && (
            <div className={`mb-6 border rounded-md p-4 ${
              error.startsWith('Note:') 
                ? 'bg-yellow-50 border-yellow-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex">
                <AlertTriangle className={`h-5 w-5 ${
                  error.startsWith('Note:') ? 'text-yellow-400' : 'text-red-400'
                }`} />
                <div className="ml-3">
                  <h3 className={`text-sm font-medium ${
                    error.startsWith('Note:') ? 'text-yellow-800' : 'text-red-800'
                  }`}>
                    {error.startsWith('Note:') ? 'Notice' : 'Error'}
                  </h3>
                  <div className={`mt-2 text-sm ${
                    error.startsWith('Note:') ? 'text-yellow-700' : 'text-red-700'
                  }`}>
                    {error}
                  </div>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
            {/* Basic Information */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Basic Information</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Title */}
                <div className="lg:col-span-2">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-sm sm:text-base"
                    placeholder="Enter sneak peek title"
                    required
                  />
                </div>

                {/* Category */}
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-sm sm:text-base"
                  >
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Content Type */}
                <div>
                  <label htmlFor="content_type" className="block text-sm font-medium text-gray-700 mb-2">
                    Content Type
                  </label>
                  <select
                    id="content_type"
                    name="content_type"
                    value={formData.content_type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-sm sm:text-base"
                  >
                    {contentTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-sm sm:text-base"
                  >
                    {statusOptions.map(status => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div className="lg:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-sm sm:text-base resize-y"
                    placeholder="Enter sneak peek description"
                    required
                  />
                </div>

                {/* Summary */}
                <div className="lg:col-span-2">
                  <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-2">
                    Summary
                  </label>
                  <textarea
                    id="summary"
                    name="summary"
                    value={formData.summary}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-sm sm:text-base resize-y"
                    placeholder="Brief summary for previews..."
                  />
                </div>

                {/* Short Description */}
                <div className="lg:col-span-2">
                  <label htmlFor="short_description" className="block text-sm font-medium text-gray-700 mb-2">
                    Short Description
                  </label>
                  <textarea
                    id="short_description"
                    name="short_description"
                    value={formData.short_description || ''}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-sm sm:text-base resize-y"
                    placeholder="Brief description for previews and social media (optional - will use main description if empty)"
                  />
                </div>
              </div>
            </div>

            {/* Upcoming Content Information */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Upcoming Content Details</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Upcoming Content Type */}
                <div>
                  <label htmlFor="upcoming_content_type" className="block text-sm font-medium text-gray-700 mb-2">
                    Upcoming Content Type
                  </label>
                  <input
                    type="text"
                    id="upcoming_content_type"
                    name="upcoming_content_type"
                    value={formData.upcoming_content_type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-sm sm:text-base"
                    placeholder="e.g., Film, Series, Documentary..."
                  />
                </div>

                {/* Upcoming Content Title */}
                <div>
                  <label htmlFor="upcoming_content_title" className="block text-sm font-medium text-gray-700 mb-2">
                    Upcoming Content Title
                  </label>
                  <input
                    type="text"
                    id="upcoming_content_title"
                    name="upcoming_content_title"
                    value={formData.upcoming_content_title}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-sm sm:text-base"
                    placeholder="Title of the upcoming content..."
                  />
                </div>

                {/* Release Date */}
                <div className="lg:col-span-2">
                  <label htmlFor="upcoming_release_date" className="block text-sm font-medium text-gray-700 mb-2">
                    Expected Release Date
                  </label>
                  <input
                    type="date"
                    id="upcoming_release_date"
                    name="upcoming_release_date"
                    value={formData.upcoming_release_date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-sm sm:text-base"
                  />
                </div>
              </div>
            </div>

            {/* Media Files */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Media Files</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Video File (if content type is video) */}
                {formData.content_type === 'video' && (
                  <div className="lg:col-span-2">
                    <label htmlFor="video_file" className="block text-sm font-medium text-gray-700 mb-2">
                      Video File
                    </label>
                    {currentFiles.video_file && (
                      <div className="mb-3">
                        <video 
                          src={currentFiles.video_file} 
                          className="w-full h-48 object-cover rounded-lg border border-gray-200"
                          controls
                        />
                        <p className="text-xs text-gray-500 mt-1">Current video file</p>
                      </div>
                    )}
                    <input
                      type="file"
                      id="video_file"
                      accept="video/*"
                      onChange={(e) => handleFileChange(e, 'video_file')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-sm file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:bg-purple-600 file:text-white hover:file:bg-purple-700"
                    />
                  </div>
                )}

                {/* Image File (if content type is image) */}
                {formData.content_type === 'image' && (
                  <div className="lg:col-span-2">
                    <label htmlFor="image_file" className="block text-sm font-medium text-gray-700 mb-2">
                      Image File
                    </label>
                    {currentFiles.image_file && (
                      <div className="mb-3">
                        <img 
                          src={currentFiles.image_file} 
                          alt="Current content" 
                          className="w-full h-48 object-cover rounded-lg border border-gray-200"
                        />
                        <p className="text-xs text-gray-500 mt-1">Current image file</p>
                      </div>
                    )}
                    <input
                      type="file"
                      id="image_file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'image_file')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-sm file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:bg-purple-600 file:text-white hover:file:bg-purple-700"
                    />
                  </div>
                )}

                {/* Cover Image */}
                <div>
                  <label htmlFor="cover_image" className="block text-sm font-medium text-gray-700 mb-2">
                    Cover Image
                  </label>
                  {currentFiles.cover_image && (
                    <div className="mb-3">
                      <img 
                        src={currentFiles.cover_image} 
                        alt="Current cover" 
                        className="w-full h-32 object-cover rounded-lg border border-gray-200"
                      />
                      <p className="text-xs text-gray-500 mt-1">Current cover image</p>
                    </div>
                  )}
                  <input
                    type="file"
                    id="cover_image"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'cover_image')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-sm file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:bg-purple-600 file:text-white hover:file:bg-purple-700"
                  />
                </div>

                {/* Thumbnail */}
                <div>
                  <label htmlFor="thumbnail" className="block text-sm font-medium text-gray-700 mb-2">
                    Thumbnail
                  </label>
                  {currentFiles.thumbnail && (
                    <div className="mb-3">
                      <img 
                        src={currentFiles.thumbnail} 
                        alt="Current thumbnail" 
                        className="w-full h-32 object-cover rounded-lg border border-gray-200"
                      />
                      <p className="text-xs text-gray-500 mt-1">Current thumbnail</p>
                    </div>
                  )}
                  <input
                    type="file"
                    id="thumbnail"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'thumbnail')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-sm file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:bg-purple-600 file:text-white hover:file:bg-purple-700"
                  />
                </div>

                {/* Poster */}
                <div className="lg:col-span-2">
                  <label htmlFor="poster" className="block text-sm font-medium text-gray-700 mb-2">
                    Poster
                  </label>
                  {currentFiles.poster && (
                    <div className="mb-3">
                      <img 
                        src={currentFiles.poster} 
                        alt="Current poster" 
                        className="w-full h-48 object-cover rounded-lg border border-gray-200"
                      />
                      <p className="text-xs text-gray-500 mt-1">Current poster</p>
                    </div>
                  )}
                  <input
                    type="file"
                    id="poster"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'poster')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-sm file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:bg-purple-600 file:text-white hover:file:bg-purple-700"
                  />
                </div>
              </div>
            </div>

            {/* Technical Information */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Technical Information</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                <div>
                  <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (seconds)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      id="duration"
                      name="duration"
                      value={formData.duration || 0}
                      onChange={handleInputChange}
                      min="0"
                      max="600"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-sm sm:text-base"
                      placeholder="Duration in seconds"
                    />
                    <span className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-600 min-w-fit">
                      {formatDuration(formData.duration || 0)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Max 10 minutes (600 seconds)</p>
                </div>

                <div>
                  <label htmlFor="video_quality" className="block text-sm font-medium text-gray-700 mb-2">
                    Video Quality
                  </label>
                  <select
                    id="video_quality"
                    name="video_quality"
                    value={formData.video_quality || '1080p'}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-sm sm:text-base"
                  >
                    {videoQualityOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="content_rating" className="block text-sm font-medium text-gray-700 mb-2">
                    Content Rating
                  </label>
                  <select
                    id="content_rating"
                    name="content_rating"
                    value={formData.content_rating || 'PG'}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-sm sm:text-base"
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
                  <label htmlFor="related_content_type" className="block text-sm font-medium text-gray-700 mb-2">
                    Related Content Type
                  </label>
                  <select
                    id="related_content_type"
                    name="related_content_type"
                    value={formData.related_content_type || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-sm sm:text-base"
                  >
                    {relatedContentTypeOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="related_content_id" className="block text-sm font-medium text-gray-700 mb-2">
                    Related Content ID
                  </label>
                  <input
                    type="text"
                    id="related_content_id"
                    name="related_content_id"
                    value={formData.related_content_id || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-sm sm:text-base"
                    placeholder="UUID of related content (optional)"
                  />
                </div>

                <div className="lg:col-span-2">
                  <label htmlFor="release_date" className="block text-sm font-medium text-gray-700 mb-2">
                    Expected Release Date
                  </label>
                  <input
                    type="date"
                    id="release_date"
                    name="release_date"
                    value={formData.release_date || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-sm sm:text-base"
                  />
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Tags</h3>
              
              {/* Current Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 text-purple-600 hover:text-purple-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              {/* Add New Tag */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  placeholder="Add a tag..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-sm sm:text-base"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* SEO Metadata */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-6">SEO Metadata</h3>
              
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label htmlFor="meta_title" className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    id="meta_title"
                    name="meta_title"
                    value={formData.meta_title || ''}
                    onChange={handleInputChange}
                    maxLength={60}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-sm sm:text-base"
                    placeholder="SEO title (max 60 characters)"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {(formData.meta_title || '').length}/60 characters
                  </p>
                </div>

                <div>
                  <label htmlFor="meta_description" className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Description
                  </label>
                  <textarea
                    id="meta_description"
                    name="meta_description"
                    value={formData.meta_description || ''}
                    onChange={handleInputChange}
                    rows={2}
                    maxLength={160}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-sm sm:text-base resize-y"
                    placeholder="SEO description (max 160 characters)"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {(formData.meta_description || '').length}/160 characters
                  </p>
                </div>

                <div>
                  <label htmlFor="meta_keywords" className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Keywords
                  </label>
                  <input
                    type="text"
                    id="meta_keywords"
                    name="meta_keywords"
                    value={formData.meta_keywords || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-sm sm:text-base"
                    placeholder="Comma-separated keywords for SEO"
                  />
                </div>
              </div>
            </div>

            {/* Settings */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Settings</h3>
              
              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_featured"
                    checked={formData.is_featured}
                    onChange={handleInputChange}
                    className="mr-3 w-4 h-4 text-purple-600 bg-white border-gray-300 rounded focus:ring-purple-500"
                  />
                  <span className="text-gray-700">Featured sneak peek</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_trending"
                    checked={formData.is_trending || false}
                    onChange={handleInputChange}
                    className="mr-3 w-4 h-4 text-purple-600 bg-white border-gray-300 rounded focus:ring-purple-500"
                  />
                  <span className="text-gray-700">Trending</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_premium"
                    checked={formData.is_premium}
                    onChange={handleInputChange}
                    className="mr-3 w-4 h-4 text-purple-600 bg-white border-gray-300 rounded focus:ring-purple-500"
                  />
                  <span className="text-gray-700">Premium content</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_explicit"
                    checked={formData.is_explicit}
                    onChange={handleInputChange}
                    className="mr-3 w-4 h-4 text-purple-600 bg-white border-gray-300 rounded focus:ring-purple-500"
                  />
                  <span className="text-gray-700">Explicit content</span>
                </label>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
              <button
                type="button"
                onClick={() => navigate('/admin/content')}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating...
                  </>
                ) : (
                  'Update Sneak Peek'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Sneak Peek</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete this sneak peek? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default EditSneakPeekPage;
