import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { uiActions } from '../../store/reducers/uiReducers';
import { 
  X, 
  AlertTriangle,
  Upload,
  ArrowLeft
} from 'lucide-react';
import AdminLayout from '../../components/Admin/AdminLayout';
import liveVideoService, { type CreateLiveVideoData } from '../../services/liveVideoService';

interface LiveVideoFormData {
  title: string;
  description: string;
  thumbnail?: File | null;
  videoFile?: File | null;
}

const AddLiveVideoPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<LiveVideoFormData>({
    title: '',
    description: '',
    thumbnail: null,
    videoFile: null
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files, name } = e.target;
    if (files && files[0]) {
      setFormData(prev => ({
        ...prev,
        [name]: files[0]
      }));
    }
  };

  const removeFile = (fieldName: 'thumbnail' | 'videoFile') => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: null
    }));
  };

  const handleUploadVideo = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!formData.title.trim()) {
        throw new Error('Title is required');
      }
      if (!formData.description.trim()) {
        throw new Error('Description is required');
      }
      if (!formData.videoFile) {
        throw new Error('Video file is required');
      }

      const createData: CreateLiveVideoData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        thumbnail: formData.thumbnail,
        videoFile: formData.videoFile,
        mode: 'upload'
      };

      await liveVideoService.createLiveVideo(createData);
      
      dispatch(uiActions.addNotification({
        type: 'success',
        message: 'Video uploaded successfully! It will appear on the homepage.'
      }));

      navigate('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload video');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="mb-4 sm:mb-0">
                <button
                  onClick={() => navigate('/admin')}
                  className="flex items-center text-gray-600 hover:text-gray-900 mb-2"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </button>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
                  <Upload className="h-8 w-8 text-blue-500 mr-3" />
                  Upload Video
                </h1>
                <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">
                  Upload a video that will be featured on the homepage
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="max-w-2xl mx-auto">
          
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <p className="mt-1 text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Upload className="h-5 w-5 text-blue-500 mr-2" />
                Video Upload Details
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Fill in the information for your video upload
              </p>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter video title..."
                  required
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe what this video is about..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thumbnail (Optional)
                </label>
                {!formData.thumbnail ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">Upload a thumbnail image</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      name="thumbnail"
                      className="hidden"
                      id="thumbnail-upload"
                    />
                    <label
                      htmlFor="thumbnail-upload"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 cursor-pointer"
                    >
                      Choose File
                    </label>
                  </div>
                ) : (
                  <div className="border border-gray-300 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                          <Upload className="h-6 w-6 text-gray-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{formData.thumbnail.name}</p>
                          <p className="text-xs text-gray-500">
                            {(formData.thumbnail.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile('thumbnail')}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Video File *
                </label>
                {!formData.videoFile ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">Upload your video file</p>
                    <p className="text-xs text-gray-500 mb-3">Supported formats: MP4, MOV, AVI (Max: 500MB)</p>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleFileChange}
                      name="videoFile"
                      className="hidden"
                      id="video-upload"
                    />
                    <label
                      htmlFor="video-upload"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 cursor-pointer"
                    >
                      Choose Video File
                    </label>
                  </div>
                ) : (
                  <div className="border border-gray-300 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                          <Upload className="h-6 w-6 text-gray-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{formData.videoFile.name}</p>
                          <p className="text-xs text-gray-500">
                            {(formData.videoFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile('videoFile')}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                <div className="flex">
                  <Upload className="h-5 w-5 text-blue-500 mt-0.5 mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-blue-800">
                      Uploading Video
                    </h3>
                    <p className="mt-1 text-sm text-blue-700">
                      Your video will be uploaded and processed. Once ready, it will be available on the homepage for users to watch.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate('/admin')}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUploadVideo}
                disabled={
                  loading || 
                  !formData.title.trim() || 
                  !formData.description.trim() ||
                  !formData.videoFile
                }
                className="px-6 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Video
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AddLiveVideoPage;