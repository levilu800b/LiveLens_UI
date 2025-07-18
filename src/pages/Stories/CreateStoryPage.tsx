// src/pages/Stories/CreateStoryPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { uiActions } from '../../store/reducers/uiReducers';
import { 
  Save, 
  Upload, 
  X, 
  FileText,
  Plus,
  Minus,
  AlertTriangle,
  ArrowLeft
} from 'lucide-react';
import MainLayout from '../../components/MainLayout/MainLayout';
import RichTextEditor from '../../components/Common/RichTextEditor';
import { storyService } from '../../services/storyService';
import type { CreateStoryData } from '../../services/storyService';

interface StoryPage {
  title: string;
  content: string;
  page_image?: File | null;
}

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
  pages_data: StoryPage[];
}

const CreateStoryPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
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
    pages_data: [{ title: 'Page 1', content: '', page_image: null }]
  });
  const [tagInput, setTagInput] = useState('');

  const categoryOptions = [
    { value: 'fiction', label: 'Fiction' },
    { value: 'non_fiction', label: 'Non-Fiction' },
    { value: 'tech', label: 'Technology' },
    { value: 'lifestyle', label: 'Lifestyle' },
    { value: 'adventure', label: 'Adventure' },
    { value: 'romance', label: 'Romance' },
    { value: 'mystery', label: 'Mystery' },
    { value: 'fantasy', label: 'Fantasy' },
    { value: 'sci_fi', label: 'Science Fiction' },
    { value: 'biography', label: 'Biography' },
    { value: 'educational', label: 'Educational' },
    { value: 'other', label: 'Other' }
  ];

  const handleInputChange = (field: keyof StoryFormData, value: string | number | File | null | string[]) => {
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

  const handlePageChange = (pageIndex: number, field: keyof StoryPage, value: string | File | null) => {
    setFormData(prev => ({
      ...prev,
      pages_data: prev.pages_data.map((page, index) => 
        index === pageIndex ? { ...page, [field]: value } : page
      )
    }));
  };

  const addPage = () => {
    setFormData(prev => ({
      ...prev,
      pages_data: [...prev.pages_data, { 
        title: `Page ${prev.pages_data.length + 1}`, 
        content: '', 
        page_image: null 
      }]
    }));
  };

  const removePage = (pageIndex: number) => {
    if (formData.pages_data.length > 1) {
      setFormData(prev => ({
        ...prev,
        pages_data: prev.pages_data.filter((_, index) => index !== pageIndex)
      }));
    }
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
      if (formData.pages_data.some(page => !page.content.trim())) {
        throw new Error('All pages must have content');
      }

      // Check word count for each page (500-600 words limit)
      for (let i = 0; i < formData.pages_data.length; i++) {
        const wordCount = formData.pages_data[i].content.trim().split(/\s+/).length;
        if (wordCount > 600) {
          throw new Error(`Page ${i + 1} exceeds the 600-word limit (current: ${wordCount} words). Please reduce the content.`);
        }
      }

      const storyData: CreateStoryData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        tags: formData.tags,
        status: action === 'publish' ? 'published' : 'draft',
        pages_data: formData.pages_data.map(page => ({
          title: page.title,
          content: page.content,
          ...(page.page_image && { page_image: page.page_image })
        }))
      };

      if (formData.cover_image) {
        storyData.cover_image = formData.cover_image;
      }
      
      if (formData.thumbnail) {
        storyData.thumbnail = formData.thumbnail;
      }

      const newStory = await storyService.createStory(storyData);
      
      // Show success message
      const actionText = action === 'publish' ? 'published' : 'saved as draft';
      dispatch(uiActions.addNotification({
        message: `Story "${formData.title}" has been ${actionText} successfully!`,
        type: 'success'
      }));

      // Navigate to the new story
      navigate(`/story/${newStory.id}`);

    } catch (err: unknown) {
      console.error('Error creating story:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create story. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <button
                    onClick={() => navigate('/stories')}
                    className="p-2 text-gray-600 hover:text-gray-900 transition-colors mr-4"
                    aria-label="Back to Stories"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <FileText className="h-6 w-6 text-blue-600 mr-3" />
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Create New Story</h1>
                    <p className="text-gray-600">Share your story with the world</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

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

          <form className="space-y-8">
            {/* Basic Information */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Basic Information</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Story Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Enter your story title"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-y"
                    placeholder="Describe your story"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>

                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cover Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange('cover_image', e.target.files?.[0] || null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    This will be used for story cards and previews (smaller size).
                  </p>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Tags</h3>
              
              <div className="flex gap-2 mb-4">
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
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Tag
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm bg-blue-100 text-blue-800"
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

            {/* Story Pages */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Story Pages</h3>
                <button
                  type="button"
                  onClick={addPage}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Page
                </button>
              </div>

              {formData.pages_data.map((page, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900">Page {index + 1}</h4>
                    {formData.pages_data.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePage(index)}
                        className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                        aria-label={`Remove page ${index + 1}`}
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Page Title
                      </label>
                      <input
                        type="text"
                        value={page.title}
                        onChange={(e) => handlePageChange(index, 'title', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        placeholder={`Page ${index + 1} title`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Page Content * (Max 600 words)
                      </label>
                      <RichTextEditor
                        value={page.content}
                        onChange={(content) => handlePageChange(index, 'content', content)}
                        placeholder="Write your story content here..."
                        className="min-h-[200px] border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent"
                      />
                      <div className="mt-2 flex justify-between items-center">
                        <span className="text-xs text-gray-500">
                          Word count: {page.content.trim() ? page.content.trim().split(/\s+/).length : 0}/600
                        </span>
                        {page.content.trim().split(/\s+/).length > 600 && (
                          <span className="text-xs text-red-600 flex items-center">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Exceeds word limit
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Page Image (Optional)
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handlePageChange(index, 'page_image', e.target.files?.[0] || null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  * Required fields
                </div>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => navigate('/stories')}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSubmit('save')}
                    disabled={loading}
                    className="flex items-center px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Saving...' : 'Save as Draft'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSubmit('publish')}
                    disabled={loading}
                    className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
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
    </MainLayout>
  );
};

export default CreateStoryPage;
