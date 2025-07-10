import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Film, Play, ArrowRight, TrendingUp, Clock, Eye } from 'lucide-react';
import MainLayout from '../../components/MainLayout/MainLayout';
import MediaFilter, { type FilterOptions } from '../../components/Common/MediaFilter';
import ContentCard from '../../components/Common/ContentCard';
import Pagination from '../../components/Common/Pagination';
import mediaService, { type Film as FilmType, type Content as ContentType, type HeroMediaResponse } from '../../services/mediaService';

interface MediaItem {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  type: 'film' | 'content';
  tags: string[];
  views: number;
  likes: number;
  isTrending?: boolean;
  category: string;
}

const MediaPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('newest');
  const [activeTab, setActiveTab] = useState<'all' | 'films' | 'contents'>('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // Data states
  const [films, setFilms] = useState<FilmType[]>([]);
  const [contents, setContents] = useState<ContentType[]>([]);
  const [heroMedia, setHeroMedia] = useState<HeroMediaResponse | null>(null);
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  // Load initial data
  useEffect(() => {
    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, itemsPerPage, activeTab]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load hero media only once (not paginated)
      const heroPromise = heroMedia ? Promise.resolve(heroMedia) : mediaService.getHeroMedia('film').catch(() => null);

      // Load films and content based on active tab with pagination
      let filmsPromise, contentsPromise;
      
      if (activeTab === 'films' || activeTab === 'all') {
        filmsPromise = mediaService.getFilms({ 
          page: currentPage, 
          page_size: itemsPerPage, 
          status: 'published' 
        });
      }
      
      if (activeTab === 'contents' || activeTab === 'all') {
        contentsPromise = mediaService.getContent({ 
          page: currentPage, 
          page_size: itemsPerPage, 
          status: 'published' 
        });
      }

      const responses = await Promise.all([
        heroPromise,
        filmsPromise || Promise.resolve({ results: [], count: 0 }),
        contentsPromise || Promise.resolve({ results: [], count: 0 })
      ]);

      const [heroResponse, filmsResponse, contentsResponse] = responses;

      if (heroResponse && !heroMedia) {
        setHeroMedia(heroResponse);
      }

      setFilms(filmsResponse.results);
      setContents(contentsResponse.results);

      // Calculate total count and pages based on active tab
      let totalItems = 0;
      if (activeTab === 'films') {
        totalItems = filmsResponse.count;
      } else if (activeTab === 'contents') {
        totalItems = contentsResponse.count;
      } else {
        totalItems = filmsResponse.count + contentsResponse.count;
      }
      
      setTotalCount(totalItems);
      setTotalPages(Math.ceil(totalItems / itemsPerPage));

      // Extract unique tags from both films and content
      const allTags = new Set<string>();
      filmsResponse.results.forEach(film => {
        if (film.tags && Array.isArray(film.tags)) {
          film.tags.forEach(tag => {
            if (tag && typeof tag === 'string') {
              allTags.add(tag);
            }
          });
        }
      });
      contentsResponse.results.forEach(content => {
        if (content.tags && Array.isArray(content.tags)) {
          content.tags.forEach(tag => {
            if (tag && typeof tag === 'string') {
              allTags.add(tag);
            }
          });
        }
      });
      setAvailableTags(Array.from(allTags).sort());

    } catch (err) {
      console.error('Error loading media data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load media content');
    } finally {
      setLoading(false);
    }
  };

  // Convert API data to MediaItem format for ContentCard
  const convertToMediaItem = (item: FilmType | ContentType, type: 'film' | 'content'): MediaItem => ({
    id: item.id,
    title: item.title || '',
    description: item.short_description || item.description || '',
    thumbnail: item.thumbnail || `https://picsum.photos/400/300?random=${item.id}`,
    duration: item.duration_formatted || '0m',
    type,
    tags: item.tags || [],
    views: item.view_count || 0,
    likes: item.like_count || 0,
    isTrending: item.is_trending || false,
    category: item.category || ''
  });

  const getFilteredContent = (): MediaItem[] => {
    let allContent: MediaItem[] = [];

    // Filter by tab
    if (activeTab === 'films') {
      allContent = films.map(film => convertToMediaItem(film, 'film'));
    } else if (activeTab === 'contents') {
      allContent = contents.map(content => convertToMediaItem(content, 'content'));
    } else {
      allContent = [
        ...films.map(film => convertToMediaItem(film, 'film')),
        ...contents.map(content => convertToMediaItem(content, 'content'))
      ];
    }

    // Apply search filter
    if (searchTerm) {
      allContent = allContent.filter(item =>
        (item.title && item.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.tags && item.tags.some(tag => tag && tag.toLowerCase().includes(searchTerm.toLowerCase())))
      );
    }

    // Apply tag filter
    if (selectedTags.length > 0) {
      allContent = allContent.filter(item =>
        item.tags && selectedTags.some(tag => item.tags.includes(tag))
      );
    }

    // Apply sorting
    switch (sortBy) {
      case 'most-liked':
        allContent.sort((a, b) => b.likes - a.likes);
        break;
      case 'most-viewed':
        allContent.sort((a, b) => b.views - a.views);
        break;
      case 'alphabetical':
        allContent.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        break;
      case 'trending':
        allContent.sort((a, b) => (b.isTrending ? 1 : 0) - (a.isTrending ? 1 : 0));
        break;
      default:
        // newest first - data already comes sorted by newest
        break;
    }

    return allContent;
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageSizeChange = (pageSize: number) => {
    setItemsPerPage(pageSize);
    setCurrentPage(1); // Reset to first page when page size changes
  };

  const handleTabChange = (tab: 'all' | 'films' | 'contents') => {
    setActiveTab(tab);
    setCurrentPage(1); // Reset to first page when changing tabs
  };

  // Memoized handlers to prevent infinite re-renders in MediaFilter
  const handleSearch = useCallback((search: string) => {
    setSearchTerm(search);
  }, []);

  const handleFilter = useCallback((filters: FilterOptions) => {
    setSelectedTags(filters.tags);
    setSortBy(filters.sortBy);
    // optionally handle filters.duration and filters.dateRange if needed
  }, []);

  if (loading && films.length === 0 && contents.length === 0) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading media content...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <Film className="h-12 w-12 mx-auto mb-2" />
              <p className="text-lg font-semibold">Error Loading Media</p>
            </div>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={loadInitialData}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-5xl md:text-6xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Media Hub
                  </span>
                </h1>
                <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                  Discover our collection of films and content. From cinematic masterpieces to educational content, 
                  explore stories that inspire and entertain.
                </p>
                
                {/* Quick Links */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    to="/media/films"
                    className="group bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 hover:scale-105 shadow-2xl hover:shadow-purple-500/25 flex items-center justify-center"
                  >
                    <Film className="mr-2 h-5 w-5" />
                    Explore Films
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                  </Link>
                  
                  <Link
                    to="/media/contents"
                    className="group bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 hover:scale-105 flex items-center justify-center"
                  >
                    <Play className="mr-2 h-5 w-5" />
                    Browse Content
                  </Link>
                </div>
              </div>
              
              {/* Featured Content */}
              {heroMedia && (
                <div className="relative">
                  <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl">
                    <div className="aspect-[4/5] bg-gradient-to-br from-slate-800 to-slate-900 relative">
                      <img 
                        src={heroMedia.thumbnail?.trim() ? 
                             heroMedia.thumbnail :
                             `https://picsum.photos/400/600?random=${heroMedia.id || 'hero'}`
                        } 
                        alt={heroMedia.title}
                        className="w-full h-full object-cover"
                      />
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20"></div>
                      
                      <div className="absolute top-4 left-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        {heroMedia.is_featured ? 'Featured' : 'Trending'}
                      </div>
                      
                      <div className="absolute bottom-6 left-6 right-6 text-white">
                        {heroMedia.category && (
                          <div className={`text-white px-2 py-1 rounded text-xs font-medium mb-2 inline-block ${
                            heroMedia.type === 'film' ? 'bg-red-500' : 'bg-blue-500'
                          }`}>
                            {heroMedia.category}
                          </div>
                        )}
                        <h3 className="text-2xl font-bold mb-2">{heroMedia.title}</h3>
                        <p className="text-gray-200 text-sm mb-4">{heroMedia.short_description || heroMedia.description}</p>
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {heroMedia.duration_formatted}
                          </div>
                          <div className="flex items-center">
                            <Eye className="w-4 h-4 mr-1" />
                            {((heroMedia.view_count || 0) / 1000).toFixed(0)}K views
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Tabs */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-8 max-w-md">
            {[
              { key: 'all', label: 'All Media' },
              { key: 'films', label: 'Films' },
              { key: 'contents', label: 'Contents' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key as 'all' | 'films' | 'contents')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.key
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search and Filters */}
          <MediaFilter
            onSearch={handleSearch}
            onFilter={handleFilter}
            contentType="media"
            availableTags={availableTags}
          />

          {/* Content Grid */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {getFilteredContent().map((item: MediaItem) => (
              <ContentCard
                key={item.id}
                {...item}
              />
            ))}
          </div>

          {/* Empty State */}
          {getFilteredContent().length === 0 && (
            <div className="text-center py-12">
              <Film className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No content found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalCount}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                pageSizeOptions={[12, 24, 36]}
                showPageSizeSelector={true}
                showItemsInfo={true}
              />
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default MediaPage;