// src/pages/Admin/AddStoryPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Save, 
  Upload, 
  X, 
  FileText,
  AlertTriangle
} from 'lucide-react';
import AdminLayout from '../../components/Admin/AdminLayout';
import RichTextEditor from '../../components/Common/RichTextEditor';
import { storyService } from '../../services/storyService';
import { uploadService } from '../../services/uploadService';
import type { CreateStoryData } from '../../services/storyService';

interface StoryFormData {
  title: string;
  description: string;
  short_description: string;
  category: string;
  tags: string[];
  cover_image?: File | null;
  thumbnail?: File | null;
  estimated_read_time: number;
  status: 'draft' | 'published';
  content: string; // Single long content field
  // Series support
  series_id?: string;
  series_position?: number;
  create_new_series?: boolean;
  new_series_title?: string;
  new_series_description?: string;
}

const AddStoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<StoryFormData>({
    title: '',
    description: '',
    short_description: '',
    category: 'fiction',
    tags: [],
    cover_image: null,
    estimated_read_time: 5,
    status: 'draft',
    content: '', // Single content field
    // Series defaults
    series_id: undefined,
    series_position: undefined,
    create_new_series: false,
    new_series_title: '',
    new_series_description: ''
  });
  const [tagInput, setTagInput] = useState('');

  const categoryOptions = [
    { value: 'fiction', label: 'Fiction' },
    { value: 'non_fiction', label: 'Non-Fiction' },
    { value: 'mystery', label: 'Mystery' },
    { value: 'romance', label: 'Romance' },
    { value: 'science_fiction', label: 'Science Fiction' },
    { value: 'fantasy', label: 'Fantasy' },
    { value: 'thriller', label: 'Thriller' },
    { value: 'horror', label: 'Horror' },
    { value: 'biography', label: 'Biography' },
    { value: 'history', label: 'History' },
    { value: 'technology', label: 'Technology' },
    { value: 'other', label: 'Other' }
  ];

  const handleInputChange = (field: keyof StoryFormData, value: string | number | File | null | string[] | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (field: 'thumbnail' | 'cover_image', file: File | null) => {
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
      if (!formData.content.trim()) {
        throw new Error('Story content is required');
      }

      const storyData: CreateStoryData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        tags: formData.tags,
        status: action === 'publish' ? 'published' : 'draft',
        content: formData.content.trim()
      };

      if (formData.cover_image) {
        storyData.cover_image = formData.cover_image;
      }
      
      if (formData.thumbnail) {
        storyData.thumbnail = formData.thumbnail;
      }

      await storyService.createStory(storyData);
      
      // Show success message
      const actionText = action === 'publish' ? 'published' : 'saved as draft';
      alert(`Story "${formData.title}" has been ${actionText} successfully!`);

      // Navigate back to content management
      navigate('/admin/content');

    } catch (err: unknown) {
      console.error('Error creating story:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create story. Please try again.';
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
                  <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 mr-2 sm:mr-3 flex-shrink-0" />
                  <div className="min-w-0">
                    <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">Add New Story</h1>
                    <p className="mt-1 sm:mt-2 text-xs sm:text-base text-gray-600">Create a new story with unlimited content length</p>
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
              <h3 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Basic Information</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Story Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm sm:text-base"
                    placeholder="Enter story title"
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
                    placeholder="Enter story description"
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
                    Estimated Read Time (minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.estimated_read_time}
                    onChange={(e) => handleInputChange('estimated_read_time', parseInt(e.target.value) || 5)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm sm:text-base"
                  />
                </div>

                {/* Series Configuration */}
                <div className="lg:col-span-2">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Series Configuration</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.create_new_series}
                            onChange={(e) => handleInputChange('create_new_series', e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm font-medium text-gray-700">
                            Create New Series
                          </span>
                        </label>
                      </div>

                      {formData.create_new_series && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 ml-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Series Title
                            </label>
                            <input
                              type="text"
                              value={formData.new_series_title || ''}
                              onChange={(e) => handleInputChange('new_series_title', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Enter series title"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Series Position
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={formData.series_position || 1}
                              onChange={(e) => handleInputChange('series_position', parseInt(e.target.value) || 1)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <div className="lg:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Series Description
                            </label>
                            <textarea
                              value={formData.new_series_description || ''}
                              onChange={(e) => handleInputChange('new_series_description', e.target.value)}
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Describe the series"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cover Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange('cover_image', e.target.files?.[0] || null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    This will be displayed as the main cover image for your story.
                  </p>
                </div>

                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thumbnail Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange('thumbnail', e.target.files?.[0] || null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    This will be used for story cards and previews (smaller size).
                  </p>
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

            {/* Story Content */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Story Content</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Story Content * (No word limit - will be split into pages on reading)
                </label>
                <RichTextEditor
                  value={formData.content}
                  onChange={(content) => handleInputChange('content', content)}
                  placeholder="Write your complete story content here. It will be automatically split into readable pages when users view it..."
                  className="min-h-[400px] border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent"
                  onImageUpload={uploadService.uploadImage.bind(uploadService)}
                />
                <div className="mt-2">
                  <span className="text-xs text-gray-500">
                    Word count: {formData.content.trim() ? formData.content.trim().split(/\s+/).length : 0} words
                  </span>
                  <p className="text-xs text-gray-600 mt-1">
                    Your story will be automatically split into ~5000 word pages when readers view it. Write as much as you need!
                  </p>
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
                    {loading ? 'Publishing...' : 'Publish Story'}
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

export default AddStoryPage;
