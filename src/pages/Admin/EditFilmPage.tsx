// src/pages/Admin/EditFilmPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Save, 
  X, 
  AlertTriangle,
  ArrowLeft,
  Film
} from 'lucide-react';
import AdminLayout from '../../components/Admin/AdminLayout';
import mediaService from '../../services/mediaService';
import type { Film as FilmType } from '../../services/mediaService';

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
  status: 'draft' | 'published' | 'archived';
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
  is_featured: boolean;
  is_trending: boolean;
  is_premium: boolean;
}

const EditFilmPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [film, setFilm] = useState<FilmType | null>(null);
  const [formData, setFormData] = useState<FilmFormData>({
    title: '',
    description: '',
    short_description: '',
    category: 'action',
    tags: [],
    duration: 0,
    video_quality: '1080p',
    status: 'draft',
    language: 'English',
    director: '',
    cast: [],
    producer: '',
    studio: '',
    mpaa_rating: 'PG-13',
    is_series: false,
    series_name: '',
    is_featured: false,
    is_trending: false,
    is_premium: false,
  });
  
  const [tagInput, setTagInput] = useState('');
  const [castInput, setCastInput] = useState('');

  // Film categories
  const categoryOptions = [
    { value: 'action', label: 'Action' },
    { value: 'adventure', label: 'Adventure' },
    { value: 'comedy', label: 'Comedy' },
    { value: 'drama', label: 'Drama' },
    { value: 'horror', label: 'Horror' },
    { value: 'romance', label: 'Romance' },
    { value: 'sci-fi', label: 'Science Fiction' },
    { value: 'thriller', label: 'Thriller' },
    { value: 'documentary', label: 'Documentary' },
    { value: 'animation', label: 'Animation' },
    { value: 'crime', label: 'Crime' },
    { value: 'family', label: 'Family' },
    { value: 'fantasy', label: 'Fantasy' },
    { value: 'mystery', label: 'Mystery' },
    { value: 'war', label: 'War' },
    { value: 'western', label: 'Western' },
    { value: 'other', label: 'Other' }
  ];

  const qualityOptions = [
    { value: '480p', label: '480p (SD)' },
    { value: '720p', label: '720p (HD)' },
    { value: '1080p', label: '1080p (Full HD)' },
    { value: '4K', label: '4K (Ultra HD)' },
    { value: '8K', label: '8K' }
  ];

  const ratingOptions = [
    { value: 'G', label: 'G - General Audiences' },
    { value: 'PG', label: 'PG - Parental Guidance' },
    { value: 'PG-13', label: 'PG-13 - Parents Strongly Cautioned' },
    { value: 'R', label: 'R - Restricted' },
    { value: 'NC-17', label: 'NC-17 - Adults Only' },
    { value: 'NR', label: 'NR - Not Rated' }
  ];

  // Load film data
  useEffect(() => {
    const loadFilm = async () => {
      if (!id) {
        setError('No film ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const filmData = await mediaService.getFilm(id);
        setFilm(filmData);
        
        // Populate form with existing data
        setFormData({
          title: filmData.title,
          description: filmData.description,
          short_description: filmData.short_description,
          category: filmData.category,
          tags: filmData.tags,
          duration: filmData.duration,
          video_quality: filmData.video_quality,
          status: filmData.status,
          release_year: filmData.release_year,
          language: filmData.language,
          director: filmData.director,
          cast: filmData.cast,
          producer: filmData.producer,
          studio: filmData.studio,
          mpaa_rating: filmData.mpaa_rating,
          is_series: filmData.is_series,
          series_name: filmData.series_name || '',
          episode_number: filmData.episode_number,
          season_number: filmData.season_number,
          is_featured: filmData.is_featured,
          is_trending: filmData.is_trending,
          is_premium: filmData.is_premium,
        });
      } catch (err) {
        console.error('Error loading film:', err);
        setError(err instanceof Error ? err.message : 'Failed to load film');
      } finally {
        setLoading(false);
      }
    };

    loadFilm();
  }, [id]);

  const handleInputChange = (field: keyof FilmFormData, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (field: keyof FilmFormData, file: File | null) => {
    setFormData(prev => ({ ...prev, [field]: file }));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setSaving(true);
    setError(null);

    try {
      // Check if there are any files to upload
      const hasFiles = formData.thumbnail || formData.poster || formData.banner || 
                      formData.video_file;

      if (hasFiles) {
        // Use FormData for file uploads
        const submitFormData = new FormData();
        
        // Add all form fields
        submitFormData.append('title', formData.title);
        submitFormData.append('description', formData.description);
        submitFormData.append('short_description', formData.short_description);
        submitFormData.append('category', formData.category);
        submitFormData.append('duration', formData.duration.toString());
        submitFormData.append('video_quality', formData.video_quality);
        submitFormData.append('status', formData.status);
        submitFormData.append('language', formData.language);
        submitFormData.append('director', formData.director);
        submitFormData.append('producer', formData.producer);
        submitFormData.append('studio', formData.studio);
        submitFormData.append('mpaa_rating', formData.mpaa_rating);
        submitFormData.append('is_series', formData.is_series.toString());
        submitFormData.append('series_name', formData.series_name);
        submitFormData.append('is_featured', formData.is_featured.toString());
        submitFormData.append('is_trending', formData.is_trending.toString());
        submitFormData.append('is_premium', formData.is_premium.toString());

        // Add arrays (tags and cast)
        formData.tags.forEach(tag => {
          submitFormData.append('tags', tag);
        });
        formData.cast.forEach(member => {
          submitFormData.append('cast', member);
        });

        if (formData.release_year) {
          submitFormData.append('release_year', formData.release_year.toString());
        }
        if (formData.episode_number) {
          submitFormData.append('episode_number', formData.episode_number.toString());
        }
        if (formData.season_number) {
          submitFormData.append('season_number', formData.season_number.toString());
        }

        // Add files if present
        if (formData.thumbnail) {
          submitFormData.append('thumbnail', formData.thumbnail);
        }
        if (formData.poster) {
          submitFormData.append('poster', formData.poster);
        }
        if (formData.banner) {
          submitFormData.append('banner', formData.banner);
        }
        if (formData.video_file) {
          submitFormData.append('video_file', formData.video_file);
        }

        await mediaService.updateFilm(id, submitFormData);
      } else {
        // Use JSON for updates without files
        const updateData = {
          title: formData.title,
          description: formData.description,
          short_description: formData.short_description,
          category: formData.category,
          tags: formData.tags,
          duration: formData.duration,
          video_quality: formData.video_quality,
          status: formData.status,
          release_year: formData.release_year,
          language: formData.language,
          director: formData.director,
          cast: formData.cast,
          producer: formData.producer,
          studio: formData.studio,
          mpaa_rating: formData.mpaa_rating,
          is_series: formData.is_series,
          series_name: formData.series_name,
          episode_number: formData.episode_number,
          season_number: formData.season_number,
          is_featured: formData.is_featured,
          is_trending: formData.is_trending,
          is_premium: formData.is_premium,
        };

        await mediaService.updateFilm(id, updateData);
      }

      // Simple success message - you can implement notifications later
      navigate('/admin/content');
    } catch (err) {
      console.error('Error updating film:', err);
      setError(err instanceof Error ? err.message : 'Failed to update film');
      // Simple error message - you can implement notifications later
      console.error('Failed to update film');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading film...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error && !film) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => navigate('/admin/content')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/admin/content')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back</span>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Film</h1>
              <p className="text-gray-600">Update film details and media files</p>
            </div>
          </div>
          <Film className="h-8 w-8 text-blue-600" />
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {categoryOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief description for previews..."
                />
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Tags</h2>
            <div className="space-y-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter a tag..."
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add
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
                      <X className="h-4 w-4" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Media Files */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Media Files</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thumbnail
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange('thumbnail', e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {film?.thumbnail && (
                  <div className="mt-2 text-sm text-gray-600">
                    Current: <a href={film.thumbnail} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View current thumbnail</a>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Poster
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange('poster', e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {film?.poster && (
                  <div className="mt-2 text-sm text-gray-600">
                    Current: <a href={film.poster} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View current poster</a>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Banner
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange('banner', e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {film?.banner && (
                  <div className="mt-2 text-sm text-gray-600">
                    Current: <a href={film.banner} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View current banner</a>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Video Quality
                </label>
                <select
                  value={formData.video_quality}
                  onChange={(e) => handleInputChange('video_quality', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {qualityOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Main Video File
                </label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => handleFileChange('video_file', e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {film?.video_file && (
                  <div className="mt-2 text-sm text-gray-600">
                    Current video file exists ({film.duration_formatted})
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Duration and Technical Details */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Technical Details</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Release Year
                </label>
                <input
                  type="number"
                  value={formData.release_year || ''}
                  onChange={(e) => handleInputChange('release_year', parseInt(e.target.value) || undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1900"
                  max={new Date().getFullYear()}
                />
              </div>
            </div>
          </div>

          {/* Film Details */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Film Details</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Director
                </label>
                <input
                  type="text"
                  value={formData.director}
                  onChange={(e) => handleInputChange('director', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Studio
                </label>
                <input
                  type="text"
                  value={formData.studio}
                  onChange={(e) => handleInputChange('studio', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  MPAA Rating
                </label>
                <select
                  value={formData.mpaa_rating}
                  onChange={(e) => handleInputChange('mpaa_rating', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  Language
                </label>
                <input
                  type="text"
                  value={formData.language}
                  onChange={(e) => handleInputChange('language', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value as 'draft' | 'published' | 'archived')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
          </div>

          {/* Cast */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Cast</h2>
            <div className="space-y-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={castInput}
                  onChange={(e) => setCastInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCastMember())}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter cast member name..."
                />
                <button
                  type="button"
                  onClick={addCastMember}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.cast.map((member, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
                  >
                    {member}
                    <button
                      type="button"
                      onClick={() => removeCastMember(member)}
                      className="ml-2 text-green-600 hover:text-green-800"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Series Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Series Information</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="is_series"
                  checked={formData.is_series}
                  onChange={(e) => handleInputChange('is_series', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is_series" className="text-sm font-medium text-gray-700">
                  This is part of a series
                </label>
              </div>

              {formData.is_series && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Series Name
                    </label>
                    <input
                      type="text"
                      value={formData.series_name}
                      onChange={(e) => handleInputChange('series_name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Season Number
                    </label>
                    <input
                      type="number"
                      value={formData.season_number || ''}
                      onChange={(e) => handleInputChange('season_number', parseInt(e.target.value) || undefined)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Episode Number
                    </label>
                    <input
                      type="number"
                      value={formData.episode_number || ''}
                      onChange={(e) => handleInputChange('episode_number', parseInt(e.target.value) || undefined)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="1"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Flags */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Film Flags</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="is_featured"
                  checked={formData.is_featured}
                  onChange={(e) => handleInputChange('is_featured', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is_featured" className="text-sm font-medium text-gray-700">
                  Featured Film
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="is_trending"
                  checked={formData.is_trending}
                  onChange={(e) => handleInputChange('is_trending', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is_trending" className="text-sm font-medium text-gray-700">
                  Trending Film
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="is_premium"
                  checked={formData.is_premium}
                  onChange={(e) => handleInputChange('is_premium', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is_premium" className="text-sm font-medium text-gray-700">
                  Premium Content
                </label>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/admin/content')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 flex items-center space-x-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Updating Film...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Update Film</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default EditFilmPage;
