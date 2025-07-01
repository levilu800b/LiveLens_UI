// src/pages/Admin/AddStoryPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Save, 
  Upload, 
  X, 
  FileText,
  Plus,
  Minus,
  AlertTriangle
} from 'lucide-react';
import AdminLayout from '../../components/Admin/AdminLayout';

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
  thumbnail?: File | null;
  estimated_read_time: number;
  status: 'draft' | 'published';
  pages_data: StoryPage[];
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
    estimated_read_time: 5,
    status: 'draft',
    pages_data: [{ title: 'Page 1', content: '', page_image: null }]
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

  const handleInputChange = (field: keyof StoryFormData, value: string | number | File | null | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (field: 'thumbnail', file: File | null) => {
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

      const submitData = new FormData();
      
      // Basic fields
      submitData.append('title', formData.title.trim());
      submitData.append('description', formData.description.trim());
      submitData.append('short_description', formData.short_description.trim() || formData.description.substring(0, 200));
      submitData.append('category', formData.category);
      submitData.append('tags', JSON.stringify(formData.tags));
      submitData.append('estimated_read_time', formData.estimated_read_time.toString());
      submitData.append('status', action === 'publish' ? 'published' : 'draft');
      
      // Thumbnail
      if (formData.thumbnail) {
        submitData.append('thumbnail', formData.thumbnail);
      }

      // Pages data
      submitData.append('pages_data', JSON.stringify(
        formData.pages_data.map(page => ({
          title: page.title,
          content: page.content
        }))
      ));

      // Handle page images separately if needed
      formData.pages_data.forEach((page, index) => {
        if (page.page_image) {
          submitData.append(`page_${index}_image`, page.page_image);
        }
      });

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/stories/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: submitData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.detail || 'Failed to create story');
      }

      await response.json();
      
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
                <div className="flex items-center min-w-0 flex-1 pt-12 lg:pt-0">
                  <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 mr-3 flex-shrink-0" />
                  <div className="min-w-0">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Add New Story</h1>
                    <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600 hidden sm:block">Create a new story with multiple pages</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/admin/content')}
                  className="p-2 text-gray-600 hover:text-gray-900 transition-colors flex-shrink-0"
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Story Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter story title"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter story description"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Short Description
                  </label>
                  <textarea
                    value={formData.short_description}
                    onChange={(e) => handleInputChange('short_description', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thumbnail Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange('thumbnail', e.target.files?.[0] || null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Tags</h3>
              
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add a tag and press Enter"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Add Tag
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
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
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
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
                        className="text-red-600 hover:text-red-800"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={`Page ${index + 1} title`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Page Content *
                      </label>
                      <textarea
                        value={page.content}
                        onChange={(e) => handlePageChange(index, 'content', e.target.value)}
                        rows={8}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Write your story content here..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Page Image (Optional)
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handlePageChange(index, 'page_image', e.target.files?.[0] || null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="sticky bottom-0 bg-white rounded-lg border border-gray-200 p-4 sm:p-6 shadow-lg">
              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center space-y-3 sm:space-y-0">
                <div className="text-sm text-gray-600 text-center sm:text-left order-2 sm:order-1">
                  * Required fields
                </div>
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 order-1 sm:order-2">
                  <button
                    type="button"
                    onClick={() => navigate('/admin/content')}
                    className="px-4 sm:px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSubmit('save')}
                    disabled={loading}
                    className="flex items-center justify-center px-4 sm:px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors disabled:opacity-50"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Saving...' : 'Save as Draft'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSubmit('publish')}
                    disabled={loading}
                    className="flex items-center justify-center px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
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
