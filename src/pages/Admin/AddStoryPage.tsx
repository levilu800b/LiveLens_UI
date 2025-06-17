// src/pages/Admin/AddStoryPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Upload, X, Image, Type, Tag } from 'lucide-react';
import MainLayout from '../../components/MainLayout/MainLayout';

const AddStoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    content: '',
    tags: [''],
    thumbnail: null as File | null,
    duration: '',
    status: 'draft'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Auto-generate slug from title
    if (name === 'title') {
      const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, thumbnail: file }));
    }
  };

  const handleTagChange = (index: number, value: string) => {
    const newTags = [...formData.tags];
    newTags[index] = value;
    setFormData(prev => ({ ...prev, tags: newTags }));
  };

  const addTag = () => {
    setFormData(prev => ({ ...prev, tags: [...prev.tags, ''] }));
  };

  const removeTag = (index: number) => {
    const newTags = formData.tags.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, tags: newTags }));
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.content.trim()) newErrors.content = 'Content is required';
    if (!formData.duration.trim()) newErrors.duration = 'Duration is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (status: 'draft' | 'published') => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const submitData = new FormData();
      
      Object.entries({...formData, status}).forEach(([key, value]) => {
        if (key === 'tags') {
          submitData.append(key, JSON.stringify(value.filter(tag => tag.trim())));
        } else if (key === 'thumbnail' && value) {
          submitData.append(key, value);
        } else if (value && key !== 'thumbnail') {
          submitData.append(key, value.toString());
        }
      });
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      navigate('/admin');
    } catch (error) {
      console.error('Error creating story:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Add New Story</h1>
              <button
                onClick={() => navigate('/admin')}
                className="text-gray-600 hover:text-gray-800"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form className="space-y-6">
              {/* Title & Slug */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Type className="h-4 w-4 inline mr-2" />
                    Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Enter story title"
                  />
                  {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Slug *
                  </label>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                    placeholder="story-url-slug"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Brief description of the story"
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Tag className="h-4 w-4 inline mr-2" />
                  Tags
                </label>
                {formData.tags.map((tag, index) => (
                  <div key={index} className="flex items-center mb-2">
                    <input
                      type="text"
                      value={tag}
                      onChange={(e) => handleTagChange(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Enter tag"
                    />
                    <button
                      type="button"
                      onClick={() => removeTag(index)}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addTag}
                  className="text-purple-600 hover:text-purple-800 text-sm"
                >
                  + Add Tag
                </button>
              </div>

              {/* Duration & Thumbnail */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reading Duration *
                  </label>
                  <input
                    type="text"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                    placeholder="e.g., 10 min read"
                  />
                  {errors.duration && <p className="text-red-500 text-sm mt-1">{errors.duration}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Image className="h-4 w-4 inline mr-2" />
                    Thumbnail Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Content Editor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Story Content *
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  rows={20}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 font-mono"
                  placeholder="Write your story here..."
                />
                {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content}</p>}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-4 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => navigate('/admin')}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                
                <button
                  type="button"
                  onClick={() => handleSubmit('draft')}
                  disabled={isLoading}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  <Save className="h-4 w-4 inline mr-2" />
                  Save Draft
                </button>
                
                <button
                  type="button"
                  onClick={() => handleSubmit('published')}
                  disabled={isLoading}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  <Upload className="h-4 w-4 inline mr-2" />
                  Publish Story
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AddStoryPage;