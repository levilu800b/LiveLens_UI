// src/pages/Admin/AddLiveVideoPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Save, 
  Upload, 
  X, 
  Plus,
  AlertTriangle,
  Radio,
  Image as ImageIcon,
  Calendar,
  Users,
  Settings,
  Link
} from 'lucide-react';
import AdminLayout from '../../components/Admin/AdminLayout';

interface LiveVideoFormData {
  title: string;
  description: string;
  short_description: string;
  thumbnail?: File | null;
  video_file?: File | null;
  scheduled_start_time: string;
  scheduled_end_time?: string;
  live_stream_url: string;
  backup_stream_url: string;
  stream_key: string;
  video_quality: '360p' | '480p' | '720p' | '1080p' | '1440p' | '2160p';
  duration?: number;
  max_viewers: number;
  host_name: string;
  guest_speakers: string;
  tags: string[];
  is_featured: boolean;
  is_premium: boolean;
  allow_chat: boolean;
  allow_recording: boolean;
  auto_start: boolean;
}

const AddLiveVideoPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<LiveVideoFormData>({
    title: '',
    description: '',
    short_description: '',
    scheduled_start_time: '',
    live_stream_url: '',
    backup_stream_url: '',
    stream_key: '',
    video_quality: '1080p',
    max_viewers: 1000,
    host_name: '',
    guest_speakers: '',
    tags: [],
    is_featured: false,
    is_premium: false,
    allow_chat: true,
    allow_recording: true,
    auto_start: false
  });
  const [tagInput, setTagInput] = useState('');

  const videoQualityOptions = [
    { value: '360p', label: '360p' },
    { value: '480p', label: '480p' },
    { value: '720p', label: '720p HD' },
    { value: '1080p', label: '1080p Full HD' },
    { value: '1440p', label: '1440p 2K' },
    { value: '2160p', label: '2160p 4K' }
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

  const removeFile = (fieldName: keyof LiveVideoFormData) => {
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

  const handleSubmit = async () => {
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
      if (!formData.scheduled_start_time) {
        throw new Error('Scheduled start time is required');
      }
      if (!formData.host_name.trim()) {
        throw new Error('Host name is required');
      }
      if (formData.max_viewers < 1) {
        throw new Error('Max viewers must be at least 1');
      }
      if (formData.max_viewers > 100000) {
        throw new Error('Max viewers cannot exceed 100,000');
      }

      // Check if scheduled time is in the future
      const startTime = new Date(formData.scheduled_start_time);
      if (startTime <= new Date()) {
        throw new Error('Scheduled start time must be in the future');
      }

      // Check if end time is after start time
      if (formData.scheduled_end_time) {
        const endTime = new Date(formData.scheduled_end_time);
        if (endTime <= startTime) {
          throw new Error('End time must be after start time');
        }
      }

      const submitData = new FormData();
      
      // Basic fields
      submitData.append('title', formData.title.trim());
      submitData.append('description', formData.description.trim());
      submitData.append('short_description', formData.short_description.trim() || formData.description.substring(0, 250));
      submitData.append('scheduled_start_time', formData.scheduled_start_time);
      submitData.append('live_stream_url', formData.live_stream_url.trim());
      submitData.append('backup_stream_url', formData.backup_stream_url.trim());
      submitData.append('stream_key', formData.stream_key.trim());
      submitData.append('video_quality', formData.video_quality);
      submitData.append('max_viewers', formData.max_viewers.toString());
      submitData.append('host_name', formData.host_name.trim());
      submitData.append('guest_speakers', formData.guest_speakers.trim());
      submitData.append('tags', formData.tags.join(', '));
      
      // Optional fields
      if (formData.scheduled_end_time) {
        submitData.append('scheduled_end_time', formData.scheduled_end_time);
      }
      if (formData.duration) {
        submitData.append('duration', formData.duration.toString());
      }
      
      // Booleans
      submitData.append('is_featured', formData.is_featured.toString());
      submitData.append('is_premium', formData.is_premium.toString());
      submitData.append('allow_chat', formData.allow_chat.toString());
      submitData.append('allow_recording', formData.allow_recording.toString());
      submitData.append('auto_start', formData.auto_start.toString());

      // Files
      if (formData.thumbnail) {
        submitData.append('thumbnail', formData.thumbnail);
      }
      if (formData.video_file) {
        submitData.append('video_file', formData.video_file);
      }

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/live-video/live-videos/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: submitData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.detail || 'Failed to create live video');
      }

      await response.json();
      
      // Show success message
      alert(`Live video "${formData.title}" has been scheduled successfully!`);

      // Navigate back to content management
      navigate('/admin/content');

    } catch (err: unknown) {
      console.error('Error creating live video:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create live video. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Generate a default end time 2 hours after start time
  const generateDefaultEndTime = () => {
    if (formData.scheduled_start_time) {
      const startTime = new Date(formData.scheduled_start_time);
      const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000); // Add 2 hours
      return endTime.toISOString().slice(0, 16); // Format for datetime-local input
    }
    return '';
  };

  return (
    <AdminLayout>
      <div className="flex flex-col h-full">
        {/* Fixed Header */}
        <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-3">
                <Radio className="w-8 h-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">Schedule New Live Video</h1>
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
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Live Video Title *
                        </label>
                        <input
                          type="text"
                          name="title"
                          value={formData.title}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          placeholder="Enter live video title"
                        />
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          placeholder="Enter detailed live video description"
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          placeholder="Brief description for cards (optional - will use main description if empty)"
                        />
                      </div>
                    </div>

                    {/* Schedule */}
                    <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Schedule
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Time *
                      </label>
                      <input
                        type="datetime-local"
                        name="scheduled_start_time"
                        value={formData.scheduled_start_time}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Time (Optional)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="datetime-local"
                          name="scheduled_end_time"
                          value={formData.scheduled_end_time || ''}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, scheduled_end_time: generateDefaultEndTime() }))}
                          className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 text-sm"
                          title="Set default +2 hours"
                        >
                          +2h
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expected Duration (minutes)
                      </label>
                      <input
                        type="number"
                        name="duration"
                        value={formData.duration ? Math.floor(formData.duration / 60) : ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, duration: (parseInt(e.target.value) || 0) * 60 }))}
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        placeholder="Expected duration in minutes"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Viewers
                      </label>
                      <input
                        type="number"
                        name="max_viewers"
                        value={formData.max_viewers}
                        onChange={handleInputChange}
                        min="1"
                        max="100000"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        placeholder="Maximum concurrent viewers"
                      />
                    </div>
                  </div>
                </div>

                {/* Stream Configuration */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 flex items-center gap-2">
                    <Link className="w-5 h-5" />
                    Stream Configuration
                  </h3>
                  
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Live Stream URL
                      </label>
                      <input
                        type="url"
                        name="live_stream_url"
                        value={formData.live_stream_url}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        placeholder="https://example.com/live-stream (RTMP, HLS, etc.)"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Backup Stream URL
                      </label>
                      <input
                        type="url"
                        name="backup_stream_url"
                        value={formData.backup_stream_url}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        placeholder="https://example.com/backup-stream (optional)"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Stream Key
                        </label>
                        <input
                          type="password"
                          name="stream_key"
                          value={formData.stream_key}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          placeholder="Stream key for broadcasting"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Video Quality
                        </label>
                        <select
                          name="video_quality"
                          value={formData.video_quality}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        >
                          {videoQualityOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Host and Guests */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Host and Guests
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Host Name *
                      </label>
                      <input
                        type="text"
                        name="host_name"
                        value={formData.host_name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        placeholder="Live stream host name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Guest Speakers
                      </label>
                      <textarea
                        name="guest_speakers"
                        value={formData.guest_speakers}
                        onChange={handleInputChange}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        placeholder="List of guest speakers (comma-separated)"
                      />
                    </div>
                  </div>
                </div>

                {/* Media Files */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Media Files</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Thumbnail */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Thumbnail
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        {formData.thumbnail ? (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <ImageIcon className="w-5 h-5 text-blue-600" />
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
                              <span className="text-blue-600 hover:text-blue-700">Upload thumbnail</span>
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

                    {/* Video File */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pre-recorded Video (Optional)
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        {formData.video_file ? (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Radio className="w-5 h-5 text-blue-600" />
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
                              <span className="text-blue-600 hover:text-blue-700">Upload video file</span>
                              <input
                                type="file"
                                name="video_file"
                                onChange={handleFileChange}
                                accept="video/*"
                                className="hidden"
                              />
                            </label>
                            <p className="text-xs text-gray-500 mt-1">For backup or scheduled playback</p>
                          </div>
                        )}
                      </div>
                    </div>
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
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Settings
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="is_featured"
                        checked={formData.is_featured}
                        onChange={handleInputChange}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Featured Live Video</span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="is_premium"
                        checked={formData.is_premium}
                        onChange={handleInputChange}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Premium Content</span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="allow_chat"
                        checked={formData.allow_chat}
                        onChange={handleInputChange}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Allow Chat</span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="allow_recording"
                        checked={formData.allow_recording}
                        onChange={handleInputChange}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Allow Recording</span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="auto_start"
                        checked={formData.auto_start}
                        onChange={handleInputChange}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </label>
                  </div>
                </div>

              </form>
            </div>
          </div>
        </div>

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

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50 transition-colors"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Scheduling...' : 'Schedule Live Video'}
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AddLiveVideoPage;
