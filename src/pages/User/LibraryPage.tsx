// src/pages/User/LibraryPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { Clock, BookOpen, Play } from 'lucide-react';
import { contentService } from '../../services/contentService';
import type { ContentItem } from '../../types';
import MainLayout from '../../components/MainLayout/MainLayout';
import ContentCard from '../../components/Common/ContentCard';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import SearchFilter from '../../components/Common/SearchFilter';
import { uiActions } from '../../store/reducers/uiReducers';

const LibraryPage: React.FC = () => {
  const dispatch = useDispatch();
  const [library, setLibrary] = useState<ContentItem[]>([]);
  const [filteredLibrary, setFilteredLibrary] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('all');

  const fetchLibrary = useCallback(async () => {
    try {
      setIsLoading(true);
      const libraryData = await contentService.getUserLibrary();
      setLibrary(libraryData);
      setFilteredLibrary(libraryData);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load library';
      dispatch(uiActions.addNotification({
        type: 'error',
        message: errorMessage
      }));
    } finally {
      setIsLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    fetchLibrary();
  }, [fetchLibrary]);

  const handleSearch = (query: string) => {
    const baseItems = selectedType === 'all' ? library : library.filter(item => item.type === selectedType);
    const filtered = baseItems.filter(item =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredLibrary(filtered);
  };

  const handleTypeFilter = (type: string) => {
    setSelectedType(type);
    if (type === 'all') {
      setFilteredLibrary(library);
    } else {
      const filtered = library.filter(item => item.type === type);
      setFilteredLibrary(filtered);
    }
  };

  const contentTypes = [
    { key: 'all', label: 'All Content', icon: Play },
    { key: 'story', label: 'Stories', icon: BookOpen },
    { key: 'film', label: 'Films', icon: Play },
    { key: 'content', label: 'Content', icon: Play },
    { key: 'podcast', label: 'Podcasts', icon: Play },
    { key: 'animation', label: 'Animations', icon: Play },
    { key: 'sneak-peek', label: 'Sneak Peeks', icon: Play },
    { key: 'live-video', label: 'Live Videos', icon: Play },
  ];

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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Library</h1>
                <p className="mt-2 text-gray-600">
                  Content you've watched and read ({library.length} items)
                </p>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                <span>Recently viewed first</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search and Filters */}
          <div className="mb-8">
            <SearchFilter
              onSearch={handleSearch}
              placeholder="Search your library..."
            />
            
            <div className="mt-4 flex flex-wrap gap-2">
              {contentTypes.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => handleTypeFilter(key)}
                  className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedType === key
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Content Grid */}
          {filteredLibrary.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredLibrary.map((item) => (
                <ContentCard
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  description={item.description}
                  thumbnail={item.thumbnail}
                  duration={item.duration.toString()}
                  type={item.type}
                  tags={item.tags}
                  views={item.views}
                  likes={item.likes}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {selectedType === 'all' ? 'No content in library' : `No ${selectedType} content found`}
              </h3>
              <p className="text-gray-500 mb-6">
                {selectedType === 'all' 
                  ? 'Start watching or reading content to build your library'
                  : `You haven't watched any ${selectedType} content yet`
                }
              </p>
              <a
                href="/"
                className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Explore Content
              </a>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default LibraryPage;