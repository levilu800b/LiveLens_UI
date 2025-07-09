// src/pages/Admin/AddPodcastPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { uiActions } from '../../store/reducers/uiReducers';
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
import podcastService from '../../services/podcastService';

interface PodcastSeries {
  id: string;
  title: string;
  slug?: string;
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

const AddPodcastPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
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
  const [showCreateSeriesModal, setShowCreateSeriesModal] = useState(false);
  const [seriesFormData, setSeriesFormData] = useState({
    title: '',
    description: '',
    short_description: '',
    host: '',
    category: '',
    language: 'en',
    tags: [] as string[],
    is_featured: false,
    is_explicit: false
  });
  const [seriesTagInput, setSeriesTagInput] = useState('');

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
    fetchPodcastSeries();
  }, []);

  const fetchPodcastSeries = async () => {
    try {
      const response = await podcastService.getPodcastSeries();
      setPodcastSeries(response.results);
    } catch (err) {
      console.error('Error fetching podcast series:', err);
    }
  };

  const fetchNextEpisodeNumber = async (seriesId: string, seasonNumber: number = 1) => {
    try {
      const response = await podcastService.getNextEpisodeNumber(seriesId, seasonNumber);
      setFormData(prev => ({
        ...prev,
        episode_number: response.next_episode_number
      }));
    } catch (err) {
      console.error('Error fetching next episode number:', err);
      // If there's an error, default to episode 1 as a fallback
      // User can manually change it if needed
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
      const numValue = parseInt(value) || 0;
      setFormData(prev => ({
        ...prev,
        [name]: numValue
      }));
      
      // If season number changes and we have a series selected, fetch next episode number
      if (name === 'season_number' && formData.series) {
        fetchNextEpisodeNumber(formData.series, numValue);
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // If series changes, fetch next episode number
    if (name === 'series' && value) {
      fetchNextEpisodeNumber(value, formData.season_number);
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

  // Series creation functions
  const handleSeriesInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setSeriesFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setSeriesFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const addSeriesTag = () => {
    if (seriesTagInput.trim() && !seriesFormData.tags.includes(seriesTagInput.trim().toLowerCase())) {
      setSeriesFormData(prev => ({
        ...prev,
        tags: [...prev.tags, seriesTagInput.trim().toLowerCase()]
      }));
      setSeriesTagInput('');
    }
  };

  const removeSeriesTag = (tagToRemove: string) => {
    setSeriesFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleCreateSeries = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!seriesFormData.title || !seriesFormData.description || !seriesFormData.host || !seriesFormData.category) {
        throw new Error('Please fill in all required fields');
      }

      const submitData = new FormData();
      submitData.append('title', seriesFormData.title);
      submitData.append('description', seriesFormData.description);
      submitData.append('short_description', seriesFormData.short_description);
      submitData.append('host', seriesFormData.host);
      submitData.append('category', seriesFormData.category);
      submitData.append('language', seriesFormData.language);
      submitData.append('is_featured', seriesFormData.is_featured.toString());
      submitData.append('is_explicit', seriesFormData.is_explicit.toString());
      
      if (seriesFormData.tags.length > 0) {
        submitData.append('tags', JSON.stringify(seriesFormData.tags));
      }

      const newSeries = await podcastService.createPodcastSeries(submitData);
      
      // Refresh the series list
      await fetchPodcastSeries();
      
      // Select the newly created series
      setFormData(prev => ({
        ...prev,
        series: newSeries.id
      }));
      
      // Reset the series form
      setSeriesFormData({
        title: '',
        description: '',
        short_description: '',
        host: '',
        category: '',
        language: 'en',
        tags: [],
        is_featured: false,
        is_explicit: false
      });
      setSeriesTagInput('');
      setShowCreateSeriesModal(false);
      
      // If we have a season number, fetch next episode number for the new series
      if (newSeries.id) {
        fetchNextEpisodeNumber(newSeries.id, formData.season_number);
      }
      
    } catch (err) {
      console.error('Error creating series:', err);
      setError(err instanceof Error ? err.message : 'Failed to create series');
    } finally {
      setLoading(false);
    }
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

      await podcastService.createEpisode(submitData);
      
      // Show success message with episode type context
      const actionText = action === 'publish' ? 'published' : action === 'schedule' ? 'scheduled' : 'saved as draft';
      const episodeTypeText = episodeTypeOptions.find(opt => opt.value === formData.episode_type)?.label || 'Episode';
      
      dispatch(uiActions.addNotification({
        message: `${episodeTypeText} "${formData.title}" has been ${actionText} successfully!`,
        type: 'success'
      }));

      // Navigate based on episode type and action
      if (action === 'publish') {
        // If published, navigate to the appropriate public page based on episode type
        switch (formData.episode_type) {
          case 'full':
          case 'interview':
          case 'special':
          case 'bonus':
          case 'recap':
            navigate('/podcasts'); // All types go to main podcasts page
            break;
          default:
            navigate('/podcasts');
        }
      } else {
        // If draft or scheduled, go back to admin content management
        navigate('/admin/content');
      }

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
        <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between pt-16 lg:pt-0">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <Mic className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 flex-shrink-0" />
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">Add New Podcast Episode</h1>
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

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
              {error && (
                <div className="mb-4 sm:mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <p className="text-red-700 text-sm sm:text-base">{error}</p>
                </div>
              )}

              <form className="space-y-4 sm:space-y-6">
                {/* Required fields indicator */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 sm:mb-6">
                  <p className="text-xs sm:text-sm text-blue-700">
                    <span className="font-medium">Fields marked with * are required.</span> 
                    Please fill out all required fields before submitting.
                  </p>
                </div>
            {/* Basic Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Episode Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm sm:text-base"
                  placeholder="Enter episode title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Podcast Series *
                </label>
                <div className="flex gap-2">
                  <select
                    name="series"
                    value={formData.series}
                    onChange={handleInputChange}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  >
                    <option value="">Select a series</option>
                    {podcastSeries.map(series => (
                      <option key={series.id} value={series.id}>
                        {series.title}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowCreateSeriesModal(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 whitespace-nowrap"
                  >
                    <Plus className="w-4 h-4" />
                    New Series
                  </button>
                </div>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.series ? 'Auto-updated based on selected series' : 'Select a series to auto-set episode number'}
                </p>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Episode Type *
                </label>
                <select
                  name="episode_type"
                  value={formData.episode_type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  required
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
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
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Add a tag and press Enter"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
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
                    className="rounded border-gray-300 text-purple-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Featured Episode</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="is_premium"
                    checked={formData.is_premium}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-purple-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Premium Content</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="is_explicit"
                    checked={formData.is_explicit}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-purple-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Explicit Content</span>
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
                  {formData.scheduled_at && (
                    <button
                      type="button"
                      onClick={() => handleSubmit('schedule')}
                      disabled={loading}
                      className="flex items-center justify-center px-4 sm:px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 text-sm sm:text-base"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {loading ? 'Scheduling...' : 'Schedule'}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleSubmit('publish')}
                    disabled={loading}
                    className="flex items-center justify-center px-4 sm:px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 text-sm sm:text-base"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {loading ? 'Publishing...' : 'Publish Podcast'}
                  </button>
                </div>
              </div>
            </div>
          </form>
            </div>
          </div>
        </div>
      </div>

      {/* Create New Series Modal */}
      {showCreateSeriesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Create New Podcast Series</h2>
                <button
                  onClick={() => {
                    setShowCreateSeriesModal(false);
                    setSeriesFormData({
                      title: '',
                      description: '',
                      short_description: '',
                      host: '',
                      category: '',
                      language: 'en',
                      tags: [],
                      is_featured: false,
                      is_explicit: false
                    });
                    setSeriesTagInput('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                handleCreateSeries();
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Series Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={seriesFormData.title}
                      onChange={handleSeriesInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="Enter series title"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      name="description"
                      value={seriesFormData.description}
                      onChange={handleSeriesInputChange}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="Enter detailed series description"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Short Description
                    </label>
                    <textarea
                      name="short_description"
                      value={seriesFormData.short_description}
                      onChange={handleSeriesInputChange}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="Brief series summary"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Host *
                      </label>
                      <input
                        type="text"
                        name="host"
                        value={seriesFormData.host}
                        onChange={handleSeriesInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        placeholder="Host name"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category *
                      </label>
                      <select
                        name="category"
                        value={seriesFormData.category}
                        onChange={handleSeriesInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        required
                      >
                        <option value="">Select category</option>
                        <option value="technology">Technology</option>
                        <option value="business">Business</option>
                        <option value="education">Education</option>
                        <option value="entertainment">Entertainment</option>
                        <option value="health_fitness">Health & Fitness</option>
                        <option value="arts">Arts</option>
                        <option value="comedy">Comedy</option>
                        <option value="news">News</option>
                        <option value="sports">Sports</option>
                        <option value="science">Science</option>
                        <option value="history">History</option>
                        <option value="true_crime">True Crime</option>
                        <option value="society_culture">Society & Culture</option>
                        <option value="religion_spirituality">Religion & Spirituality</option>
                        <option value="kids_family">Kids & Family</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Language
                    </label>
                    <select
                      name="language"
                      value={seriesFormData.language}
                      onChange={handleSeriesInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                      <option value="it">Italian</option>
                      <option value="pt">Portuguese</option>
                      <option value="ja">Japanese</option>
                      <option value="ko">Korean</option>
                      <option value="zh">Chinese</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tags
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={seriesTagInput}
                        onChange={(e) => setSeriesTagInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSeriesTag())}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        placeholder="Add tags..."
                      />
                      <button
                        type="button"
                        onClick={addSeriesTag}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {seriesFormData.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeSeriesTag(tag)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="is_featured"
                        checked={seriesFormData.is_featured}
                        onChange={handleSeriesInputChange}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Featured Series</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="is_explicit"
                        checked={seriesFormData.is_explicit}
                        onChange={handleSeriesInputChange}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Explicit Content</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateSeriesModal(false);
                      setSeriesFormData({
                        title: '',
                        description: '',
                        short_description: '',
                        host: '',
                        category: '',
                        language: 'en',
                        tags: [],
                        is_featured: false,
                        is_explicit: false
                      });
                      setSeriesTagInput('');
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Create Series
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AddPodcastPage;
