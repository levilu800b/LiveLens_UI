// src/pages/Admin/AddFilmPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { 
  Save, 
  Upload, 
  X, 
  Film,
  AlertTriangle
} from 'lucide-react';
import AdminLayout from '../../components/Admin/AdminLayout';
import { uiActions } from '../../store/reducers/uiReducers';
import mediaService from '../../services/mediaService';

interface FilmFormData {
  title: string;
  description: string;
  short_description: string;
  category: string;
  tags: string[];
  thumbnail?: File | null;
  poster?: File | null;
  banner?: File | null;
  video_file?: File | null;
  duration: number;
  video_quality: string;
  status: 'draft' | 'published';
  release_year?: number;
  language: string;
  director: string;
  cast: string[];
  producer: string;
  studio: string;
  mpaa_rating: string;
  is_series: boolean;
  series_name: string;
  episode_number?: number;
  season_number?: number;
}

const AddFilmPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FilmFormData>({
    title: '',
    description: '',
    short_description: '',
    category: 'drama',
    tags: [],
    duration: 90,
    video_quality: '1080p',
    status: 'draft',
    language: 'English',
    director: '',
    cast: [],
    producer: '',
    studio: '',
    mpaa_rating: 'PG-13',
    is_series: false,
    series_name: ''
  });
  const [tagInput, setTagInput] = useState('');
  const [castInput, setCastInput] = useState('');

  const categoryOptions = [
    { value: 'action', label: 'Action' },
    { value: 'adventure', label: 'Adventure' },
    { value: 'comedy', label: 'Comedy' },
    { value: 'drama', label: 'Drama' },
    { value: 'horror', label: 'Horror' },
    { value: 'thriller', label: 'Thriller' },
    { value: 'romance', label: 'Romance' },
    { value: 'science_fiction', label: 'Science Fiction' },
    { value: 'fantasy', label: 'Fantasy' },
    { value: 'documentary', label: 'Documentary' },
    { value: 'animation', label: 'Animation' },
    { value: 'musical', label: 'Musical' },
    { value: 'biography', label: 'Biography' },
    { value: 'history', label: 'History' },
    { value: 'crime', label: 'Crime' },
    { value: 'mystery', label: 'Mystery' },
    { value: 'war', label: 'War' },
    { value: 'western', label: 'Western' },
    { value: 'short_film', label: 'Short Film' },
    { value: 'other', label: 'Other' }
  ];

  const qualityOptions = [
    { value: '360p', label: '360p' },
    { value: '480p', label: '480p' },
    { value: '720p', label: '720p HD' },
    { value: '1080p', label: '1080p Full HD' },
    { value: '1440p', label: '1440p QHD' },
    { value: '2160p', label: '4K UHD' },
    { value: '4320p', label: '8K UHD' }
  ];

  const ratingOptions = [
    { value: 'G', label: 'G - General Audiences' },
    { value: 'PG', label: 'PG - Parental Guidance' },
    { value: 'PG-13', label: 'PG-13 - Parents Strongly Cautioned' },
    { value: 'R', label: 'R - Restricted' },
    { value: 'NC-17', label: 'NC-17 - Adults Only' },
    { value: 'NR', label: 'NR - Not Rated' }
  ];

  const handleInputChange = (field: keyof FilmFormData, value: string | number | boolean | File | null | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (field: 'thumbnail' | 'poster' | 'banner' | 'video_file', file: File | null) => {
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

  const addCastMember = () => {
    if (castInput.trim() && !formData.cast.includes(castInput.trim())) {
      setFormData(prev => ({
        ...prev,
        cast: [...prev.cast, castInput.trim()]
      }));
      setCastInput('');
    }
  };

  const removeCastMember = (memberToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      cast: prev.cast.filter(member => member !== memberToRemove)
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
      // Video file is optional for now
      // if (!formData.video_file) {
      //   throw new Error('Video file is required');
      // }

      // Create FormData for file uploads
      const submitData = new FormData();
      
      // Add text fields
      submitData.append('title', formData.title.trim());
      submitData.append('description', formData.description.trim());
      submitData.append('short_description', formData.short_description.trim() || formData.description.substring(0, 200));
      submitData.append('category', formData.category);
      submitData.append('duration', formData.duration.toString());
      submitData.append('video_quality', formData.video_quality);
      submitData.append('status', action === 'publish' ? 'published' : 'draft');
      submitData.append('language', formData.language);
      submitData.append('director', formData.director);
      submitData.append('producer', formData.producer);
      submitData.append('studio', formData.studio);
      submitData.append('mpaa_rating', formData.mpaa_rating);
      submitData.append('is_series', formData.is_series.toString());
      submitData.append('series_name', formData.series_name);

      // Add optional fields
      if (formData.release_year) {
        submitData.append('release_year', formData.release_year.toString());
      }
      if (formData.episode_number) {
        submitData.append('episode_number', formData.episode_number.toString());
      }
      if (formData.season_number) {
        submitData.append('season_number', formData.season_number.toString());
      }

      // Add arrays (tags and cast)
      formData.tags.forEach(tag => {
        submitData.append('tags', tag);
      });
      formData.cast.forEach(member => {
        submitData.append('cast', member);
      });

      // Add file uploads
      if (formData.thumbnail) {
        submitData.append('thumbnail', formData.thumbnail);
      }
      if (formData.poster) {
        submitData.append('poster', formData.poster);
      }
      if (formData.banner) {
        submitData.append('banner', formData.banner);
      }
      if (formData.video_file) {
        submitData.append('video_file', formData.video_file);
      }

      await mediaService.createFilm(submitData);
      
      // Show success message
      const actionText = action === 'publish' ? 'published' : 'saved as draft';
      dispatch(uiActions.addNotification({
        type: 'success',
        message: `Film "${formData.title}" has been ${actionText} successfully!`
      }));

      // Navigate to the media/films page to show the new film
      if (action === 'publish') {
        navigate('/media/films');
      } else {
        navigate('/admin/content');
      }

    } catch (err: unknown) {
      console.error('Error creating film:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create film. Please try again.';
      setError(errorMessage);
      dispatch(uiActions.addNotification({
        type: 'error',
        message: errorMessage
      }));
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
                  <Film className="h-6 w-6 sm:h-8 sm:w-8 text-red-600 mr-2 sm:mr-3 flex-shrink-0" />
                  <div className="min-w-0">
                    <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">Add New Film</h1>
                    <p className="mt-1 sm:mt-2 text-xs sm:text-base text-gray-600">Create a new film entry</p>
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
            <div className="mb-4 sm:mb-6 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">{error}</div>
                </div>
              </div>
            </div>
          )}

          <form className="space-y-4 sm:space-y-6 lg:space-y-8">
            {/* Basic Information */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Basic Information</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Film Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm sm:text-base"
                    placeholder="Enter film title"
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
                    placeholder="Enter film description"
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
                    Video Quality
                  </label>
                  <select
                    value={formData.video_quality}
                    onChange={(e) => handleInputChange('video_quality', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm sm:text-base"
                  >
                    {qualityOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.duration}
                    onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 90)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Language
                  </label>
                  <input
                    type="text"
                    value={formData.language}
                    onChange={(e) => handleInputChange('language', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm sm:text-base"
                    placeholder="e.g., English, Spanish"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Release Year
                  </label>
                  <input
                    type="number"
                    min="1900"
                    max={new Date().getFullYear() + 5}
                    value={formData.release_year || ''}
                    onChange={(e) => handleInputChange('release_year', parseInt(e.target.value) || null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    MPAA Rating
                  </label>
                  <select
                    value={formData.mpaa_rating}
                    onChange={(e) => handleInputChange('mpaa_rating', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  >
                    {ratingOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Director
                  </label>
                  <input
                    type="text"
                    value={formData.director}
                    onChange={(e) => handleInputChange('director', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Director name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Producer
                  </label>
                  <input
                    type="text"
                    value={formData.producer}
                    onChange={(e) => handleInputChange('producer', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Producer name"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Studio
                  </label>
                  <input
                    type="text"
                    value={formData.studio}
                    onChange={(e) => handleInputChange('studio', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Production studio"
                  />
                </div>
              </div>
            </div>

            {/* Series Information */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Series Information</h3>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_series"
                    checked={formData.is_series}
                    onChange={(e) => handleInputChange('is_series', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_series" className="ml-2 block text-sm text-gray-900">
                    This is part of a series
                  </label>
                </div>

                {formData.is_series && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Series Name
                      </label>
                      <input
                        type="text"
                        value={formData.series_name}
                        onChange={(e) => handleInputChange('series_name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        placeholder="Series name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Season Number
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.season_number || ''}
                        onChange={(e) => handleInputChange('season_number', parseInt(e.target.value) || null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Episode Number
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.episode_number || ''}
                        onChange={(e) => handleInputChange('episode_number', parseInt(e.target.value) || null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Cast */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Cast</h3>
              
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="text"
                  value={castInput}
                  onChange={(e) => setCastInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCastMember())}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Add cast member and press Enter"
                />
                <button
                  type="button"
                  onClick={addCastMember}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Cast
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {formData.cast.map((member, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                  >
                    {member}
                    <button
                      type="button"
                      onClick={() => removeCastMember(member)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
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

            {/* Media Files */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Media Files</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Video File * (MP4, AVI, MOV)
                  </label>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => handleFileChange('video_file', e.target.files?.[0] || null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thumbnail Image (JPG, PNG)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange('thumbnail', e.target.files?.[0] || null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Poster Image (JPG, PNG)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange('poster', e.target.files?.[0] || null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Banner Image (JPG, PNG)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange('banner', e.target.files?.[0] || null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
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
                    {loading ? 'Publishing...' : 'Publish Film'}
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

export default AddFilmPage;
