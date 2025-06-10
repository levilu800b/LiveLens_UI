// src/pages/User/FavoritesPage.tsx
import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Heart, BookOpen, Play, Filter, Grid, List } from 'lucide-react';
import { contentService } from '../../services/contentService';
import type { ContentItem } from '../../types';
import MainLayout from '../../components/MainLayout/MainLayout';
import ContentCard from '../../components/Common/ContentCard';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import SearchFilter from '../../components/Common/SearchFilter';
import { uiActions } from '../../store/reducers/uiReducers';

const FavoritesPage: React.FC = () => {
  const dispatch = useDispatch();
  const [favorites, setFavorites] = useState<ContentItem[]>([]);
  const [filteredFavorites, setFilteredFavorites] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<string>('newest');

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setIsLoading(true);
      const favoritesData = await contentService.getUserFavorites();
      setFavorites(favoritesData);
      setFilteredFavorites(favoritesData);
    } catch (error: any) {
      dispatch(uiActions.addNotification({
        type: 'error',
        message: error.message || 'Failed to load favorites'
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    const filtered = favorites.filter(item =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    );
    setFilteredFavorites(filtered);
  };

  const handleTypeFilter = (type: string) => {
    setSelectedType(type);
    let filtered = type === 'all' ? favorites : favorites.filter(item => item.type === type);
    
    // Apply sorting
    filtered = sortContent(filtered, sortBy);
    setFilteredFavorites(filtered);
  };

  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy);
    const sorted = sortContent(filteredFavorites, newSortBy);
    setFilteredFavorites(sorted);
  };

  const sortContent = (content: ContentItem[], sortType: string) => {
    return [...content].sort((a, b) => {
      switch (sortType) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'most-liked':
          return b.likes - a.likes;
        case 'most-viewed':
          return b.views - a.views;
        case 'alphabetical':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });
  };

  const handleUnfavorite = async (contentType: string, contentId: string) => {
    try {
      await contentService.favoriteContent(contentType, contentId);
      // Remove from local state
      const updated = favorites.filter(item => item.id !== contentId);
      setFavorites(updated);
      setFilteredFavorites(updated.filter(item => 
        selectedType === 'all' || item.type === selectedType
      ));
      
      dispatch(uiActions.addNotification({
        type: 'success',
        message: 'Removed from favorites'
      }));
    } catch (error: any) {
      dispatch(uiActions.addNotification({
        type: 'error',
        message: error.message || 'Failed to remove from favorites'
      }));
    }
  };

  const contentTypes = [
    { key: 'all', label: 'All Favorites', icon: Heart },
    { key: 'story', label: 'Stories', icon: BookOpen },
    { key: 'film', label: 'Films', icon: Play },
    { key: 'content', label: 'Content', icon: Play },
    { key: 'podcast', label: 'Podcasts', icon: Play },
    { key: 'animation', label: 'Animations', icon: Play },
    { key: 'sneak-peek', label: 'Sneak Peeks', icon: Play },
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'most-liked', label: 'Most Liked' },
    { value: 'most-viewed', label: 'Most Viewed' },
    { value: 'alphabetical', label: 'A-Z' },
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
        <div className="bg-gradient-to-r from-pink-500 to-red-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center mb-4">
                  <Heart className="h-8 w-8 mr-3" />
                  <h1 className="text-4xl font-bold">My Favorites</h1>
                </div>
                <p className="text-xl text-pink-100">
                  Content you've loved ({favorites.length} items)
                </p>
              </div>
              
              {/* View Toggle */}
              <div className="flex items-center space-x-2 bg-white/10 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid' ? 'bg-white/20' : 'hover:bg-white/10'
                  }`}
                >
                  <Grid className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list' ? 'bg-white/20' : 'hover:bg-white/10'
                  }`}
                >
                  <List className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search and Filters */}
          <div className="mb-8 space-y-4">
            <SearchFilter
              onSearch={handleSearch}
              placeholder="Search your favorites..."
            />
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Type Filters */}
              <div className="flex flex-wrap gap-2">
                {contentTypes.map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => handleTypeFilter(key)}
                    className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedType === key
                        ? 'bg-pink-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {label}
                  </button>
                ))}
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-pink-500 focus:border-pink-500"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Content Display */}
          {filteredFavorites.length > 0 ? (
            <div className={
              viewMode === 'grid' 
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "space-y-4"
            }>
              {filteredFavorites.map((item) => (
                <ContentCard
                  key={item.id}
                  content={item}
                  viewMode={viewMode}
                  showFavoriteButton={true}
                  onUnfavorite={() => handleUnfavorite(item.type, item.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Heart className="mx-auto h-16 w-16 text-gray-400 mb-6" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                {selectedType === 'all' ? 'No favorites yet' : `No ${selectedType} favorites found`}
              </h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                {selectedType === 'all' 
                  ? 'Start exploring content and heart the ones you love to see them here'
                  : `You haven't favorited any ${selectedType} content yet`
                }
              </p>
              <a
                href="/"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 transition-colors"
              >
                <Heart className="h-5 w-5 mr-2" />
                Discover Content
              </a>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default FavoritesPage;
