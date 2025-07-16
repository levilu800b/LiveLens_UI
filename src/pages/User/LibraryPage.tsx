// src/pages/User/LibraryPage.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { Clock, BookOpen, Play } from 'lucide-react';
import { contentService } from '../../services/contentService';
import type { ContentItem } from '../../types';
import MainLayout from '../../components/MainLayout/MainLayout';
import ContentCard from '../../components/Common/ContentCard';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import SearchFilter from '../../components/Common/SearchFilter';
import Pagination from '../../components/Common/Pagination';
import { uiActions } from '../../store/reducers/uiReducers';

const LibraryPage: React.FC = () => {
  const dispatch = useDispatch();
  const [library, setLibrary] = useState<ContentItem[]>([]);
  const [filteredLibrary, setFilteredLibrary] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  // Calculate paginated items
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredLibrary.slice(startIndex, endIndex);
  }, [filteredLibrary, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredLibrary.length / itemsPerPage);

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

  // Filter and search effect - runs when library, selectedType, or searchTerm changes
  useEffect(() => {
    let filtered = selectedType === 'all' ? library : library.filter(item => item.type === selectedType);
    
    if (searchTerm.trim()) {
      filtered = filtered.filter(item =>
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredLibrary(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [library, selectedType, searchTerm]);

  const handleTypeFilter = (type: string) => {
    setSelectedType(type);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setItemsPerPage(newPageSize);
    setCurrentPage(1); // Reset to first page
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
              onSearch={setSearchTerm}
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
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {paginatedItems.map((item) => (
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

              {/* Pagination */}
              {filteredLibrary.length > itemsPerPage && (
                <div className="mt-8">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={filteredLibrary.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                    pageSizeOptions={[8, 12, 24, 48]}
                    className="border-t border-gray-200 pt-6"
                  />
                </div>
              )}
            </>
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