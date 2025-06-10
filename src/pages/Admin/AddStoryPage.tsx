// src/pages/Admin/AddStoryPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { 
  Save, 
  Eye, 
  Upload, 
  X, 
  Plus, 
  BookOpen, 
  Image,
  Type,
  Tag
} from 'lucide-react';
import { contentService } from '../../services/contentService';
import { uiActions } from '../../store/reducers/uiReducers';
import MainLayout from '../../components/MainLayout/MainLayout';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

interface StoryFormData {
  title: string;
  slug: string;
  description: string;
  tags: string[];
  category: string;
  thumbnail: File | null;
  coverImage: File | null;
  content: string;
  status: 'draft' | 'published';
  isFeatured: boolean;
}

const AddStoryPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState<StoryFormData>({
    title: '',
    slug: '',
    description: '',
    tags: [],
    category: '',
    thumbnail: null,
    coverImage: null,
    content: '',
    status: 'draft',
    isFeatured: false
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const categories = [
    'Fiction',
    'Non-Fiction',
    'Science Fiction',
    'Fantasy',
    'Mystery',
    'Romance',
    'Thriller',
    'Adventure',
    'Technology',
    'Business',
    'Personal Development',
    'Health & Wellness'
  ];

  useEffect(() => {
    if (isEditing && id) {
      fetchStory();
    }
  }, [id, isEditing]);

  useEffect(() => {
    // Auto-generate slug from title
    if (formData.title && !isEditing) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.title, isEditing]);

  const fetchStory = async () => {
    try {
      setIsLoading(true);
      const story = await contentService.getStory(id!);
      setFormData({
        title: story.title,
        slug: story.slug,
        description: story.description,
        tags: story.tags,
        category: story.category || '',
        thumbnail: null,
        coverImage: null,
        content: story.contentBody || '',
        status: story.status as 'draft' | 'published',
        isFeatured: story.isFeatured || false
      });
      
      if (story.thumbnail) {
        setThumbnailPreview(story.thumbnail);
      }
    } catch (error: any) {
      dispatch(uiActions.addNotification({
        type: 'error',
        message: error.message || 'Failed to load story'
      }));
      navigate('/admin/all-posts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'thumbnail' | 'coverImage') => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, [field]: file }));
      
      const reader = new FileReader();
      reader.onloadend = () => {
        if (field === 'thumbnail') {
          setThumbnailPreview(reader.result as string);
        } else {
          setCoverPreview(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (status: 'draft' | 'published') => {
    try {
      setIsSaving(true);
      
      const submitData = {
        ...formData,
        status,
        content: formData.content
      };

      let result;
      if (isEditing) {
        result = await contentService.updateStory(id!, submitData);
      } else {
        result = await contentService.createStory(submitData);
      }

      dispatch(uiActions.addNotification({
        type: 'success',
        message: `Story ${status === 'published' ? 'published' : 'saved as draft'} successfully!`
      }));

      navigate('/admin/all-posts');
    } catch (error: any) {
      dispatch(uiActions.addNotification({
        type: 'error',
        message: error.message || `Failed to ${isEditing ? 'update' : 'create'} story`
      }));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {isEditing ? 'Edit Story' : 'Add New Story'}
                  </h1>
                  <p className="text-gray-600">
                    {isEditing ? 'Update your story content' : 'Create engaging stories for your audience'}
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => navigate('/admin/all-posts')}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSubmit('draft')}
                  disabled={isSaving}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Save Draft
                </button>
                <button
                  onClick={() => handleSubmit('published')}
                  disabled={isSaving || !formData.title || !formData.content}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSaving ? <LoadingSpinner size="sm" className="inline mr-2" /> : <Upload className="h-4 w-4 mr-2 inline" />}
                  {isEditing ? 'Update Story' : 'Publish Story'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h2>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                      Title *
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter story title"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
                      URL Slug *
                    </label>
                    <input
                      type="text"
                      id="slug"
                      name="slug"
                      value={formData.slug}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="story-url-slug"
                      required
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      This will be used in the story URL
                    </p>
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Description *
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={3}
                      value={formData.description}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Brief description of the story"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                      Category
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select a category</option>
                      {categories.map(category => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Content Editor */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Story Content</h2>
                
                <div>
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                    Story Content *
                  </label>
                  <textarea
                    id="content"
                    name="content"
                    rows={20}
                    value={formData.content}
                    onChange={handleInputChange}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Write your story here..."
                    required
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    Write your story content. Support for rich text formatting will be added in future updates.
                  </p>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Images */}
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Images</h3>
                
                <div className="space-y-4">
                  {/* Thumbnail */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Thumbnail Image
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                      {thumbnailPreview ? (
                        <div className="relative">
                          <img 
                            src={thumbnailPreview} 
                            alt="Thumbnail preview" 
                            className="w-full h-32 object-cover rounded"
                          />
                          <button
                            onClick={() => {
                              setThumbnailPreview(null);
                              setFormData(prev => ({ ...prev, thumbnail: null }));
                            }}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <label className="cursor-pointer flex flex-col items-center">
                          <Image className="h-8 w-8 text-gray-400 mb-2" />
                          <span className="text-sm text-gray-600">Upload thumbnail</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, 'thumbnail')}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Tags</h3>
                
                <div className="space-y-3">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                      className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="Add tag"
                    />
                    <button
                      onClick={handleAddTag}
                      className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 text-blue-600 hover:text-blue-800"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Settings */}
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Settings</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      id="isFeatured"
                      name="isFeatured"
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isFeatured" className="ml-2 block text-sm text-gray-900">
                      Featured Story
                    </label>
                  </div>
                  
                  <p className="text-xs text-gray-500">
                    Featured stories appear prominently on the homepage
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AddStoryPage;