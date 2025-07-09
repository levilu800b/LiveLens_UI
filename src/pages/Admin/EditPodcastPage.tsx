// src/pages/Admin/EditPodcastPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  X, 
  Plus,
  AlertTriangle,
  Mic,
  ArrowLeft,
  Trash2
} from 'lucide-react';
import AdminLayout from '../../components/Admin/AdminLayout';
import podcastService from '../../services/podcastService';
import type { ContentItem } from '../../types';

interface PodcastSeries {
  id: string;
  title: string;
  slug?: string;
}

interface ExtendedPodcast extends ContentItem {
  episode?: number;
  season?: number;
  isTrending?: boolean;
  releaseDate?: string;
  series?: {
    id: string;
    title: string;
    slug?: string;
  };
  guest?: string;
  audioFile?: string;
  videoFile?: string;
  transcriptFile?: string;
  episodeType?: string;
  isExplicit?: boolean;
  isPremium?: boolean;
  averageRating?: number;
  ratingCount?: number;
  isLiked?: boolean;
  userRating?: number;
  listenProgress?: number;
  summary?: string;
  episode_number?: number;
  season_number?: number;
  episode_type?: string;
  is_featured?: boolean;
  is_premium?: boolean;
  is_explicit?: boolean;
  status?: 'draft' | 'published' | 'archived';
  audio_file?: string;
  video_file?: string;
  transcript_file?: string;
  cover_image?: string;
}

interface PodcastFormData {
  title: string;
  description: string;
  summary: string;
  series: string;
  episode_number: number;
  season_number: number;
  episode_type: 'full' | 'bonus' | 'interview' | 'recap' | 'special';
  audio_file?: File | null;
  video_file?: File | null;
  transcript_file?: File | null;
  cover_image?: File | null;
  thumbnail?: File | null;
  guest: string;
  tags: string[];
  status: 'draft' | 'published' | 'scheduled';
  is_featured: boolean;
  is_premium: boolean;
  is_explicit: boolean;
  duration: number;
  audio_quality: '64kbps' | '128kbps' | '192kbps' | '256kbps' | '320kbps';
  external_url: string;
  scheduled_at?: string;
}

const EditPodcastPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const [podcast, setPodcast] = useState<ExtendedPodcast | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [series, setSeries] = useState<PodcastSeries[]>([]);
  const [tagInput, setTagInput] = useState('');

  const [formData, setFormData] = useState<PodcastFormData>({
    title: '',
    description: '',
    summary: '',
    series: '',
    episode_number: 1,
    season_number: 1,
    episode_type: 'full',
    guest: '',
    tags: [],
    status: 'draft',
    is_featured: false,
    is_premium: false,
    is_explicit: false,
    duration: 0,
    audio_quality: '128kbps',
    external_url: ''
  });

  const episodeTypeOptions = [
    { value: 'full', label: 'Full Episode', description: 'Complete podcast episode' },
    { value: 'bonus', label: 'Bonus Content', description: 'Additional content for subscribers' },
    { value: 'interview', label: 'Interview', description: 'Guest interview episode' },
    { value: 'recap', label: 'Recap/Summary', description: 'Summary of previous content' },
    { value: 'special', label: 'Special Episode', description: 'Special event or themed episode' }
  ];

  const audioQualityOptions = [
    { value: '64kbps', label: '64 kbps' },
    { value: '128kbps', label: '128 kbps' },
    { value: '192kbps', label: '192 kbps' },
    { value: '256kbps', label: '256 kbps' },
    { value: '320kbps', label: '320 kbps' }
  ];

  useEffect(() => {
    const loadPodcast = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const podcastData = await podcastService.getPodcast(id) as ExtendedPodcast;
        setPodcast(podcastData);
        
        // Populate form with existing data
        setFormData({
          title: podcastData.title || '',
          description: podcastData.description || '',
          summary: podcastData.summary || podcastData.description || '',
          series: podcastData.series?.id || '',
          episode_number: podcastData.episode || podcastData.episode_number || 1,
          season_number: podcastData.season || podcastData.season_number || 1,
          episode_type: (podcastData.episodeType || podcastData.episode_type || 'full') as 'full' | 'bonus' | 'interview' | 'recap' | 'special',
          guest: podcastData.guest || '',
          tags: podcastData.tags || [],
          status: (podcastData.status === 'archived' ? 'draft' : podcastData.status || 'draft') as 'draft' | 'published' | 'scheduled',
          is_featured: podcastData.is_featured || false,
          is_premium: podcastData.is_premium || false,
          is_explicit: podcastData.is_explicit || false,
          duration: podcastData.duration || 0,
          audio_quality: '128kbps',
          external_url: ''
        });
        
        // Load series list
        const seriesData = await podcastService.getPodcastSeries();
        setSeries(seriesData.results.map(s => ({ id: s.id, title: s.title })));
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load podcast');
      } finally {
        setLoading(false);
      }
    };

    loadPodcast();
  }, [id]);

  const handleInputChange = (field: keyof PodcastFormData, value: string | number | boolean | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (field: keyof PodcastFormData, file: File | null) => {
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

  const handleSubmit = async (action: 'draft' | 'publish') => {
    if (!id) return;
    
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // Check if there are any files to upload
      const hasFiles = formData.audio_file || formData.video_file || formData.transcript_file || 
                      formData.cover_image || formData.thumbnail;

      if (hasFiles) {
        // Use FormData for file uploads
        const submitFormData = new FormData();
        
        // Add all form fields
        submitFormData.append('title', formData.title);
        submitFormData.append('description', formData.description);
        submitFormData.append('summary', formData.summary);
        submitFormData.append('series', formData.series);
        submitFormData.append('episode_number', formData.episode_number.toString());
        submitFormData.append('season_number', formData.season_number.toString());
        submitFormData.append('episode_type', formData.episode_type);
        submitFormData.append('guest', formData.guest);
        submitFormData.append('tags', JSON.stringify(formData.tags));
        submitFormData.append('status', action === 'publish' ? 'published' : 'draft');
        submitFormData.append('is_featured', formData.is_featured.toString());
        submitFormData.append('is_premium', formData.is_premium.toString());
        submitFormData.append('is_explicit', formData.is_explicit.toString());
        submitFormData.append('duration', formData.duration.toString());
        submitFormData.append('audio_quality', formData.audio_quality);
        submitFormData.append('external_url', formData.external_url);
        
        if (formData.scheduled_at) {
          submitFormData.append('scheduled_at', formData.scheduled_at);
        }

        // Add files if they exist
        if (formData.audio_file) {
          submitFormData.append('audio_file', formData.audio_file);
        }
        if (formData.video_file) {
          submitFormData.append('video_file', formData.video_file);
        }
        if (formData.transcript_file) {
          submitFormData.append('transcript_file', formData.transcript_file);
        }
        if (formData.cover_image) {
          submitFormData.append('cover_image', formData.cover_image);
        }
        if (formData.thumbnail) {
          submitFormData.append('thumbnail', formData.thumbnail);
        }

        await podcastService.updatePodcast(id, submitFormData);
      } else {
        // Use JSON for updates without files
        const updateData = {
          title: formData.title,
          description: formData.description,
          summary: formData.summary,
          series: formData.series,
          episode_number: formData.episode_number,
          season_number: formData.season_number,
          episode_type: formData.episode_type,
          guest: formData.guest,
          tags: formData.tags,
          status: action === 'publish' ? 'published' : 'draft',
          is_featured: formData.is_featured,
          is_premium: formData.is_premium,
          is_explicit: formData.is_explicit,
          duration: formData.duration,
          audio_quality: formData.audio_quality,
          external_url: formData.external_url,
          scheduled_at: formData.scheduled_at
        };

        await podcastService.updatePodcast(id, updateData);
      }

      const actionText = action === 'publish' ? 'published' : 'saved';
      const episodeTypeText = episodeTypeOptions.find(opt => opt.value === formData.episode_type)?.label || 'Episode';
      
      alert(`${episodeTypeText} "${formData.title}" has been ${actionText} successfully!`);

      // Navigate back to content management page
      navigate('/admin/content');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update podcast');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    
    const confirmDelete = confirm(
      `Are you sure you want to delete "${formData.title}"? This action cannot be undone.`
    );
    
    if (!confirmDelete) return;
    
    setSaving(true);
    setError(null);
    
    try {
      await podcastService.deletePodcast(id);
      
      // Show success message
      alert(`Podcast episode "${formData.title}" has been deleted successfully.`);
      
      // Navigate back to content management page
      navigate('/admin/content');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete podcast');
      console.error('Error deleting podcast:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading podcast...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error && !podcast) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => navigate('/admin/content')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
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
                <div className="flex items-center min-w-0 flex-1">
                  <button
                    onClick={() => navigate('/admin/content')}
                    className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
                  >
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    <span className="hidden sm:inline">Back to Content Management</span>
                    <span className="sm:hidden">Back</span>
                  </button>
                  <div className="min-w-0">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">Edit Podcast Episode</h1>
                    <p className="text-sm sm:text-base text-gray-600 hidden sm:block">Update podcast episode details</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <Mic className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                  <span className="text-xs sm:text-sm text-gray-500 hidden md:inline">Podcast Management</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        <form className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Episode Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter episode title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Series
                </label>
                <select
                  value={formData.series}
                  onChange={(e) => handleInputChange('series', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select a series</option>
                  {series.map(s => (
                    <option key={s.id} value={s.id}>{s.title}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Season Number
                </label>
                <input
                  type="number"
                  value={formData.season_number}
                  onChange={(e) => handleInputChange('season_number', parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Episode Number
                </label>
                <input
                  type="number"
                  value={formData.episode_number}
                  onChange={(e) => handleInputChange('episode_number', parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  min="1"
                />
              </div>

              <div className="sm:col-span-2 lg:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Episode Type
                </label>
                <select
                  value={formData.episode_type}
                  onChange={(e) => handleInputChange('episode_type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {episodeTypeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-sm text-gray-500">
                  {episodeTypeOptions.find(opt => opt.value === formData.episode_type)?.description || 'Select an episode type'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Guest(s)
                </label>
                <input
                  type="text"
                  value={formData.guest}
                  onChange={(e) => handleInputChange('guest', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Guest name(s)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  value={Math.round(formData.duration / 60)}
                  onChange={(e) => handleInputChange('duration', (parseInt(e.target.value) || 0) * 60)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  min="0"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Detailed episode description"
              />
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Summary
              </label>
              <textarea
                value={formData.summary}
                onChange={(e) => handleInputChange('summary', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Brief episode summary"
              />
            </div>
          </div>

          {/* File Uploads */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Media Files</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Audio File
                </label>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => handleFileChange('audio_file', e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                {podcast?.audioFile && (
                  <div className="mt-2 text-sm text-gray-600">
                    Current audio file exists
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Video File (Optional)
                </label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => handleFileChange('video_file', e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                {podcast?.videoFile && (
                  <div className="mt-2 text-sm text-gray-600">
                    Current video file exists
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cover Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange('cover_image', e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                {podcast?.cover_image && (
                  <div className="mt-2 text-sm text-gray-600">
                    Current cover image exists
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thumbnail
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange('thumbnail', e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                {podcast?.thumbnail && (
                  <div className="mt-2 text-sm text-gray-600">
                    Current thumbnail exists
                  </div>
                )}
              </div>

              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transcript File (Optional)
                </label>
                <input
                  type="file"
                  accept=".txt,.pdf,.doc,.docx"
                  onChange={(e) => handleFileChange('transcript_file', e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                {podcast?.transcriptFile && (
                  <div className="mt-2 text-sm text-gray-600">
                    Current transcript file exists
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Tags</h2>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-2 text-purple-600 hover:text-purple-800"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Add a tag"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center"
              >
                <Plus className="h-4 w-4 mr-1" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Settings */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Settings</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Audio Quality
                </label>
                <select
                  value={formData.audio_quality}
                  onChange={(e) => handleInputChange('audio_quality', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {audioQualityOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  External URL (Optional)
                </label>
                <input
                  type="url"
                  value={formData.external_url}
                  onChange={(e) => handleInputChange('external_url', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="https://example.com/podcast"
                />
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_explicit"
                  checked={formData.is_explicit}
                  onChange={(e) => handleInputChange('is_explicit', e.target.checked)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="is_explicit" className="ml-2 block text-sm text-gray-700">
                  Explicit Content
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_premium"
                  checked={formData.is_premium}
                  onChange={(e) => handleInputChange('is_premium', e.target.checked)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="is_premium" className="ml-2 block text-sm text-gray-700">
                  Premium Content
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_featured"
                  checked={formData.is_featured}
                  onChange={(e) => handleInputChange('is_featured', e.target.checked)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="is_featured" className="ml-2 block text-sm text-gray-700">
                  Featured Episode
                </label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
              <button
                type="button"
                onClick={handleDelete}
                disabled={saving}
                className="px-4 sm:px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center space-x-2 order-2 sm:order-1"
              >
                <Trash2 className="h-4 w-4" />
                <span>{saving ? 'Deleting...' : 'Delete Episode'}</span>
              </button>
              
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 order-1 sm:order-2">
                <button
                  type="button"
                  onClick={() => navigate('/admin/content')}
                  className="px-4 sm:px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSubmit('draft')}
                  disabled={saving}
                  className="px-4 sm:px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Draft'}
                </button>
                <button
                  type="button"
                  onClick={() => handleSubmit('publish')}
                  disabled={saving}
                  className="px-4 sm:px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  {saving ? 'Publishing...' : 'Update & Publish'}
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

export default EditPodcastPage;
