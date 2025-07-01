// src/pages/Admin/AddPodcastPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Save, 
  Upload, 
  X, 
  FileText,
  Plus,
  AlertTriangle,
  Mic,
  Video,
  Image as ImageIcon
} from 'lucide-react';
import AdminLayout from '../../components/Admin/AdminLayout';

interface PodcastSeries {
  id: string;
  title: string;
  slug: string;
}

interface PodcastFormData {
  title: string;
  description: string;
  summary: string;
  series: string;
  episode_number: number;
  season_number: number;
  episode_type: 'full' | 'trailer' | 'bonus' | 'interview' | 'recap' | 'special';
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

const AddPodcastPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [podcastSeries, setPodcastSeries] = useState<PodcastSeries[]>([]);
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
  const [tagInput, setTagInput] = useState('');

  const episodeTypeOptions = [
    { value: 'full', label: 'Full Episode' },
    { value: 'trailer', label: 'Trailer' },
    { value: 'bonus', label: 'Bonus Content' },
    { value: 'interview', label: 'Interview' },
    { value: 'recap', label: 'Recap' },
    { value: 'special', label: 'Special Episode' }
  ];

  const audioQualityOptions = [
    { value: '64kbps', label: '64 kbps' },
    { value: '128kbps', label: '128 kbps' },
    { value: '192kbps', label: '192 kbps' },
    { value: '256kbps', label: '256 kbps' },
    { value: '320kbps', label: '320 kbps' }
  ];

  useEffect(() => {
    fetchPodcastSeries();
  }, []);

  const fetchPodcastSeries = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/podcasts/series/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPodcastSeries(data.results || data);
      }
    } catch (err) {
      console.error('Error fetching podcast series:', err);
    }
  };

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

  const removeFile = (fieldName: keyof PodcastFormData) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: null
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

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (action: 'save' | 'publish' | 'schedule') => {
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
      if (!formData.series) {
        throw new Error('Podcast series is required');
      }
      if (!formData.audio_file && !formData.external_url && !formData.video_file) {
        throw new Error('Audio file, video file, or external URL is required');
      }
      if (action === 'schedule' && !formData.scheduled_at) {
        throw new Error('Scheduled date is required for scheduled posts');
      }

      const submitData = new FormData();
      
      // Basic fields
      submitData.append('title', formData.title.trim());
      submitData.append('description', formData.description.trim());
      submitData.append('summary', formData.summary.trim() || formData.description.substring(0, 250));
      submitData.append('series', formData.series);
      submitData.append('episode_number', formData.episode_number.toString());
      submitData.append('season_number', formData.season_number.toString());
      submitData.append('episode_type', formData.episode_type);
      submitData.append('guest', formData.guest.trim());
      submitData.append('tags', JSON.stringify(formData.tags));
      submitData.append('duration', formData.duration.toString());
      submitData.append('audio_quality', formData.audio_quality);
      submitData.append('external_url', formData.external_url.trim());
      submitData.append('is_featured', formData.is_featured.toString());
      submitData.append('is_premium', formData.is_premium.toString());
      submitData.append('is_explicit', formData.is_explicit.toString());
      
      // Status
      let status = 'draft';
      if (action === 'publish') status = 'published';
      else if (action === 'schedule') status = 'scheduled';
      submitData.append('status', status);
      
      // Scheduled date
      if (formData.scheduled_at) {
        submitData.append('scheduled_at', formData.scheduled_at);
      }

      // Files
      if (formData.audio_file) {
        submitData.append('audio_file', formData.audio_file);
      }
      if (formData.video_file) {
        submitData.append('video_file', formData.video_file);
      }
      if (formData.transcript_file) {
        submitData.append('transcript_file', formData.transcript_file);
      }
      if (formData.cover_image) {
        submitData.append('cover_image', formData.cover_image);
      }
      if (formData.thumbnail) {
        submitData.append('thumbnail', formData.thumbnail);
      }

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/podcasts/episodes/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: submitData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.detail || 'Failed to create podcast episode');
      }

      await response.json();
      
      // Show success message
      const actionText = action === 'publish' ? 'published' : action === 'schedule' ? 'scheduled' : 'saved as draft';
      alert(`Podcast episode "${formData.title}" has been ${actionText} successfully!`);

      // Navigate back to content management
      navigate('/admin/content');

    } catch (err: unknown) {
      console.error('Error creating podcast episode:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create podcast episode. Please try again.';
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
            <Mic className="w-8 h-8 text-purple-600" />
            <h1 className="text-2xl font-bold text-gray-900">Add New Podcast Episode</h1>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Episode Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter episode title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Podcast Series *
                </label>
                <select
                  name="series"
                  value={formData.series}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select a series</option>
                  {podcastSeries.map(series => (
                    <option key={series.id} value={series.id}>
                      {series.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Episode Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter detailed episode description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Episode Summary
              </label>
              <textarea
                name="summary"
                value={formData.summary}
                onChange={handleInputChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Brief episode summary (optional - will use description if empty)"
              />
            </div>

            {/* Episode Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Episode Number *
                </label>
                <input
                  type="number"
                  name="episode_number"
                  value={formData.episode_number}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Season Number
                </label>
                <input
                  type="number"
                  name="season_number"
                  value={formData.season_number}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Episode Type
                </label>
                <select
                  name="episode_type"
                  value={formData.episode_type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {episodeTypeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Guest(s)
                </label>
                <input
                  type="text"
                  name="guest"
                  value={formData.guest}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Episode guest names"
                />
              </div>

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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Duration in seconds"
                  />
                  <span className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-600 min-w-fit">
                    {formatDuration(formData.duration)}
                  </span>
                </div>
              </div>
            </div>

            {/* Media Files */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Media Files</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Audio File */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Audio File
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    {formData.audio_file ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Mic className="w-5 h-5 text-purple-600" />
                          <span className="text-sm text-gray-600 truncate">
                            {formData.audio_file.name}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile('audio_file')}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <label className="cursor-pointer">
                          <span className="text-purple-600 hover:text-purple-700">Upload audio file</span>
                          <input
                            type="file"
                            name="audio_file"
                            onChange={handleFileChange}
                            accept="audio/*"
                            className="hidden"
                          />
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {/* Video File */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Video File (Optional)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    {formData.video_file ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Video className="w-5 h-5 text-purple-600" />
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
                          <span className="text-purple-600 hover:text-purple-700">Upload video file</span>
                          <input
                            type="file"
                            name="video_file"
                            onChange={handleFileChange}
                            accept="video/*"
                            className="hidden"
                          />
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {/* Cover Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cover Image
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    {formData.cover_image ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ImageIcon className="w-5 h-5 text-purple-600" />
                          <span className="text-sm text-gray-600 truncate">
                            {formData.cover_image.name}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile('cover_image')}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <label className="cursor-pointer">
                          <span className="text-purple-600 hover:text-purple-700">Upload cover image</span>
                          <input
                            type="file"
                            name="cover_image"
                            onChange={handleFileChange}
                            accept="image/*"
                            className="hidden"
                          />
                        </label>
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
                          <ImageIcon className="w-5 h-5 text-purple-600" />
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
                          <span className="text-purple-600 hover:text-purple-700">Upload thumbnail</span>
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
              </div>

              {/* Transcript File */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transcript File (Optional)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  {formData.transcript_file ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-purple-600" />
                        <span className="text-sm text-gray-600 truncate">
                          {formData.transcript_file.name}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile('transcript_file')}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <label className="cursor-pointer">
                        <span className="text-purple-600 hover:text-purple-700">Upload transcript</span>
                        <input
                          type="file"
                          name="transcript_file"
                          onChange={handleFileChange}
                          accept=".txt,.pdf,.doc,.docx"
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* External URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  External URL (Alternative to file upload)
                </label>
                <input
                  type="url"
                  name="external_url"
                  value={formData.external_url}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="https://example.com/podcast-episode.mp3"
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Add a tag and press Enter"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-purple-600 hover:text-purple-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Audio Quality
                  </label>
                  <select
                    name="audio_quality"
                    value={formData.audio_quality}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                    Schedule Publication (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    name="scheduled_at"
                    value={formData.scheduled_at || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="is_featured"
                    checked={formData.is_featured}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">Featured Episode</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="is_premium"
                    checked={formData.is_premium}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">Premium Content</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="is_explicit"
                    checked={formData.is_explicit}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">Explicit Content</span>
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
                className="px-6 py-2 border border-purple-300 text-purple-700 rounded-lg hover:bg-purple-50 flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Saving...' : 'Save Draft'}
              </button>

              {formData.scheduled_at && (
                <button
                  type="button"
                  onClick={() => handleSubmit('schedule')}
                  disabled={loading}
                  className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {loading ? 'Scheduling...' : 'Schedule'}
                </button>
              )}

              <button
                type="button"
                onClick={() => handleSubmit('publish')}
                disabled={loading}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 disabled:opacity-50"
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

export default AddPodcastPage;
