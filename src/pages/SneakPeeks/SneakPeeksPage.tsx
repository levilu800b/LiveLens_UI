import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Camera, Clock, Star, Film, Clapperboard } from 'lucide-react';
import MainLayout from '../../components/MainLayout/MainLayout';
import SearchFilter from '../../components/Common/SearchFilter';
import ContentCard from '../../components/Common/ContentCard';
import Pagination from '../../components/Common/Pagination';
import sneakPeekService, { type SneakPeek } from '../../services/sneakPeekService';

// Helper function to build full media URLs
const buildMediaUrl = (path: string | undefined): string => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';
  return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
};

// Helper function to get safe thumbnail URL
const getSafeThumbnailUrl = (thumbnail: string | undefined): string | undefined => {
  const url = buildMediaUrl(thumbnail);
  return url || undefined; // Return undefined instead of empty string to prevent empty src
};

const SneakPeeksPage = () => {
  const navigate = useNavigate();
  
  // State management
  const [sneakPeeks, setSneakPeeks] = useState<SneakPeek[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [totalCount, setTotalCount] = useState(0);

  // Refresh mechanism
  const [refreshKey, setRefreshKey] = useState(0);

  // API data loading
  useEffect(() => {
    const loadSneakPeeks = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await sneakPeekService.getSneakPeeks({
          page: currentPage,
          page_size: pageSize,
          category: selectedCategory !== 'All' ? selectedCategory : undefined,
          search: searchTerm || undefined,
          ordering: sortBy === 'newest' ? '-created_at' :
                   sortBy === 'oldest' ? 'created_at' :
                   sortBy === 'most-viewed' ? '-view_count' :
                   sortBy === 'most-liked' ? '-like_count' :
                   sortBy === 'alphabetical' ? 'title' :
                   sortBy === 'featured' ? '-featured_at' : '-created_at',
          _refresh: refreshKey || undefined // Force refresh when refreshKey changes
        });
        
        setSneakPeeks(response.sneakPeeks);
        setTotalCount(response.total);
      } catch (err) {
        console.error('Error loading sneak peeks:', err);
        setError('Failed to load sneak peeks');
      } finally {
        setLoading(false);
      }
    };

    loadSneakPeeks();
  }, [currentPage, pageSize, selectedCategory, searchTerm, sortBy, refreshKey]);

  // Listen for storage events to trigger refresh when data is updated elsewhere
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'sneakPeekDataUpdated') {
        setRefreshKey(Date.now());
        localStorage.removeItem('sneakPeekDataUpdated');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also check for updates on focus
    const handleFocus = () => {
      const lastUpdate = localStorage.getItem('sneakPeekDataUpdated');
      if (lastUpdate) {
        setRefreshKey(Date.now());
        localStorage.removeItem('sneakPeekDataUpdated');
      }
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const getFilteredSneakPeeks = () => {
    // Since filtering is now done server-side, just return the sneakPeeks
    return sneakPeeks;
  };

  const filteredSneakPeeks = getFilteredSneakPeeks();
  const featuredSneakPeek = sneakPeeks.find(peek => peek.featuredAt) || sneakPeeks[0];

  const totalSneakPeeks = totalCount;
  const totalViews = sneakPeeks.reduce((sum, peek) => sum + peek.views, 0);
  const avgDuration = sneakPeeks.length > 0 ? Math.round(
    sneakPeeks.reduce((sum, peek) => {
      const duration = peek.duration || 0;
      const minutes = Math.floor(duration / 60);
      const seconds = duration % 60;
      return sum + minutes + (seconds / 60);
    }, 0) / sneakPeeks.length
  ) : 0;

  const formatDuration = (duration?: number) => {
    if (!duration) return '0:00';
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const categories = ['All', 'Animation', 'Production', 'Design', 'Technology', 'Performance', 'Writing', 'Culture'];

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-center mb-4">
                  <Camera className="h-8 w-8 text-indigo-400 mr-3" />
                  <span className="text-indigo-400 font-semibold">LiveLens Sneak Peeks</span>
                </div>
                <h1 className="text-5xl md:text-6xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                    Behind the Magic
                  </span>
                </h1>
                <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                  Get exclusive access to our creative process. From initial concepts to final production, 
                  discover the artistry, technology, and passion that brings our content to life.
                </p>
                
                {/* Stats */}
                <div className="flex flex-wrap gap-8 mb-8">
                  <div className="text-center">
                    <div className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
                      {totalSneakPeeks}+
                    </div>
                    <div className="text-sm text-gray-400">Exclusive Videos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                      {(totalViews / 1000).toFixed(0)}K+
                    </div>
                    <div className="text-sm text-gray-400">Total Views</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                      {avgDuration.toFixed(0)}m
                    </div>
                    <div className="text-sm text-gray-400">Avg. Length</div>
                  </div>
                </div>

                {/* Creative Elements */}
                <div className="flex items-center space-x-4 mb-8">
                  <Film className="w-6 h-6 text-indigo-400 animate-pulse" />
                  <div className="flex space-x-2">
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className="w-2 h-6 bg-gradient-to-t from-indigo-500 to-purple-500 rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                  <Clapperboard className="w-6 h-6 text-purple-400 animate-pulse" />
                </div>
              </div>
              
              {/* Featured Sneak Peek */}
              {featuredSneakPeek && (
                <div className="relative">
                  <div 
                    className="relative z-10 rounded-3xl overflow-hidden shadow-2xl cursor-pointer transform transition-transform hover:scale-105"
                    onClick={() => navigate(`/sneak-peek/${featuredSneakPeek.slug || featuredSneakPeek.id}`)}
                  >
                    <div className="aspect-[4/5] bg-gradient-to-br from-slate-800 to-slate-900 relative">
                      {getSafeThumbnailUrl(featuredSneakPeek.thumbnail) ? (
                        <img 
                          src={getSafeThumbnailUrl(featuredSneakPeek.thumbnail)} 
                          alt={featuredSneakPeek.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/60">
                          <div className="text-center">
                            <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <div className="text-sm">No Thumbnail</div>
                          </div>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20"></div>
                      
                      {featuredSneakPeek.featuredAt && (
                        <div className="absolute top-4 left-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center">
                          <Star className="w-4 h-4 mr-1" />
                          Featured
                        </div>
                      )}
                      
                      <div className="absolute top-4 right-4 bg-indigo-500 text-white px-2 py-1 rounded text-xs font-medium">
                        {featuredSneakPeek.category}
                      </div>
                      
                      <div className="absolute bottom-6 left-6 right-6 text-white">
                        <h3 className="text-2xl font-bold mb-2">{featuredSneakPeek.title}</h3>
                        <p className="text-gray-200 text-sm mb-4 line-clamp-2">{featuredSneakPeek.description}</p>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-4">
                            <span className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {formatDuration(featuredSneakPeek.duration)}
                            </span>
                            <span className="flex items-center">
                              <Eye className="w-4 h-4 mr-1" />
                              {(featuredSneakPeek.views / 1000).toFixed(0)}K views
                            </span>
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

        {/* Sneak Peeks Collection */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Behind the Scenes</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore the creative journey behind our content. From brainstorming sessions to final touches, 
              witness the dedication and artistry of our talented teams.
            </p>
          </div>

          {/* Category Filters */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-3">Content Category</label>
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedCategory === category
                      ? 'bg-indigo-500 text-white shadow-lg'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Search and Sort */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1">
              <SearchFilter
                onSearch={setSearchTerm}
                placeholder="Search behind-the-scenes content..."
              />
            </div>
            <div className="md:w-48">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="most-viewed">Most Viewed</option>
                <option value="most-liked">Most Liked</option>
                <option value="alphabetical">A-Z</option>
                <option value="featured">Featured</option>
              </select>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
              <div className="text-2xl font-bold text-indigo-600 mb-2">
                {totalSneakPeeks}
              </div>
              <div className="text-gray-600">Total Videos</div>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
              <div className="text-2xl font-bold text-green-600 mb-2">
                {categories.length - 1}
              </div>
              <div className="text-gray-600">Categories</div>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
              <div className="text-2xl font-bold text-purple-600 mb-2">
                {sneakPeeks.filter(peek => peek.featuredAt).length}
              </div>
              <div className="text-gray-600">Featured</div>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
              <div className="text-2xl font-bold text-orange-600 mb-2">
                HD
              </div>
              <div className="text-gray-600">Quality</div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading sneak peeks...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <div className="text-red-500 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Error Loading Content</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Sneak Peeks Grid */}
          {!loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredSneakPeeks.map(sneakPeek => (
                <ContentCard
                  key={sneakPeek.id}
                  id={sneakPeek.slug || sneakPeek.id}
                  title={sneakPeek.title}
                  description={sneakPeek.description}
                  thumbnail={getSafeThumbnailUrl(sneakPeek.thumbnail)}
                  duration={formatDuration(sneakPeek.duration)}
                  type="sneak-peek"
                  tags={sneakPeek.tags || []}
                  views={sneakPeek.views}
                  likes={sneakPeek.likes}
                  category={sneakPeek.category}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && !error && totalCount > pageSize && (
            <div className="mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(totalCount / pageSize)}
                totalItems={totalCount}
                itemsPerPage={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
              />
            </div>
          )}

          {/* Empty State */}
          {filteredSneakPeeks.length === 0 && (
            <div className="text-center py-12">
              <Camera className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No sneak peeks found</h3>
              <p className="text-gray-600">Try adjusting your search, category, or filter criteria.</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default SneakPeeksPage;