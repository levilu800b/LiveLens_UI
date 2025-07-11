import { useState, useEffect, useCallback } from 'react';
import { Palette, Sparkles, Users, Clock, Award } from 'lucide-react';
import MainLayout from '../../components/MainLayout/MainLayout';
import SearchFilter from '../../components/Common/SearchFilter';
import ContentCard from '../../components/Common/ContentCard';
import Pagination from '../../components/Common/Pagination';
import animationService, { type Animation } from '../../services/animationService';

const styles = ['All', '2D', '3D', 'Mixed'];
const complexityLevels = ['All', 'Beginner', 'Intermediate', 'Advanced'];

const AnimationsPage = () => {
  const [animations, setAnimations] = useState<Animation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('newest');
  const [selectedStyle, setSelectedStyle] = useState('All');
  const [selectedComplexity, setSelectedComplexity] = useState('All');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  const [stats, setStats] = useState({ total: 0, totalViews: 0 });

  // Fetch animations on component mount
  useEffect(() => {
    const fetchAnimations = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await animationService.getAnimations({
          page: currentPage,
          page_size: itemsPerPage,
          status: 'published'
        });
        setAnimations(response.results || []);
        setTotalCount(response.count || 0);
        setTotalPages(Math.ceil((response.count || 0) / itemsPerPage));
        
        // Get stats (optional, if it fails we'll use fallback values)
        try {
          const statsResponse = await animationService.getAnimationStats();
          setStats({
            total: statsResponse.total_animations || response.results?.length || 0,
            totalViews: statsResponse.total_views || 0
          });
        } catch (statsError) {
          console.warn('Could not load animation stats:', statsError);
          setStats({
            total: response.results?.length || 0,
            totalViews: 0
          });
        }
      } catch (err) {
        console.error('Error fetching animations:', err);
        // Check if it's an authentication error and show appropriate message
        const errorMessage = err instanceof Error ? err.message : String(err);
        if (errorMessage.includes('Authentication') || errorMessage.includes('credentials')) {
          setError('Unable to load animations. This content may require authentication.');
        } else {
          setError('Failed to load animations. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAnimations();
  }, [currentPage, itemsPerPage]);

  // Get available tags from loaded animations
  const availableTags = Array.from(new Set(animations.flatMap((item: Animation) => item.tags || [])));

  const getFilteredAnimations = useCallback(() => {
    let filteredAnimations = [...animations];

    // Apply style filter (using animation_type as a proxy for style)
    if (selectedStyle !== 'All') {
      filteredAnimations = filteredAnimations.filter(item => item.animation_type === selectedStyle);
    }

    // Apply complexity filter (this may need custom mapping or we skip this filter)
    // Since complexity is not in the Animation model, we can implement this later
    // if (selectedComplexity !== 'All') {
    //   filteredAnimations = filteredAnimations.filter(item => item.complexity === selectedComplexity);
    // }

    // Apply search filter
    if (searchTerm) {
      filteredAnimations = filteredAnimations.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.short_description && item.short_description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.tags && item.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase())))
      );
    }

    // Apply tag filter
    if (selectedTags.length > 0) {
      filteredAnimations = filteredAnimations.filter(item =>
        item.tags && selectedTags.some(tag => item.tags!.includes(tag))
      );
    }

    // Apply sorting
    switch (sortBy) {
      case 'most-liked':
        filteredAnimations.sort((a, b) => (b.like_count || 0) - (a.like_count || 0));
        break;
      case 'most-viewed':
        filteredAnimations.sort((a, b) => (b.view_count || 0) - (a.view_count || 0));
        break;
      case 'alphabetical':
        filteredAnimations.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'trending':
        filteredAnimations.sort((a, b) => (b.is_trending ? 1 : 0) - (a.is_trending ? 1 : 0));
        break;
      case 'oldest':
        filteredAnimations.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      default:
        // newest first
        filteredAnimations.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
    }

    return filteredAnimations;
  }, [animations, searchTerm, selectedTags, sortBy, selectedStyle]);

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageSizeChange = (pageSize: number) => {
    setItemsPerPage(pageSize);
    setCurrentPage(1); // Reset to first page when page size changes
  };

  const filteredAnimations = getFilteredAnimations();
  const featuredAnimation = animations.find((animation: Animation) => animation.is_trending) || animations[0];

  // Debug logging for search functionality
  useEffect(() => {
  }, [searchTerm, animations, filteredAnimations]);

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Palette className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600">Loading animations...</p>
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
            <Palette className="mx-auto h-12 w-12 text-red-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Animations</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
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
                <div className="flex items-center mb-4">
                  <Palette className="h-8 w-8 text-purple-400 mr-3" />
                  <span className="text-purple-400 font-semibold">LiveLens Animations</span>
                </div>
                <h1 className="text-5xl md:text-6xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Motion & Magic
                  </span>
                </h1>
                <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                  Dive into a world of creative animations. From 2D character studies to complex 3D simulations, 
                  explore the artistry of motion graphics and visual storytelling.
                </p>
                
                {/* Stats */}
                <div className="flex flex-wrap gap-8 mb-8">
                  <div className="text-center">
                    <div className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                      {stats.total}+
                    </div>
                    <div className="text-sm text-gray-400">Animations</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                      {(stats.totalViews / 1000).toFixed(0)}K+
                    </div>
                    <div className="text-sm text-gray-400">Total Views</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text text-transparent">
                      4K
                    </div>
                    <div className="text-sm text-gray-400">Quality</div>
                  </div>
                </div>

                {/* Animation Elements */}
                <div className="flex items-center space-x-4 mb-8">
                  <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
                  <div className="flex space-x-2">
                    {[...Array(8)].map((_, i) => (
                      <div
                        key={i}
                        className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 0.2}s` }}
                      />
                    ))}
                  </div>
                  <Sparkles className="w-6 h-6 text-cyan-400 animate-pulse" />
                </div>
              </div>
              
              {/* Featured Animation */}
              {featuredAnimation && (
                <div className="relative">
                  <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl">
                    <div className="aspect-[4/5] bg-gradient-to-br from-slate-800 to-slate-900 relative">
                      <img 
                        src={featuredAnimation.thumbnail || `https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=400&h=600&fit=crop&auto=format&q=80`} 
                        alt={featuredAnimation.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          img.src = `https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=400&h=600&fit=crop&auto=format&q=80`;
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20"></div>
                      
                      {featuredAnimation.is_trending && (
                        <div className="absolute top-4 left-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center">
                          <Award className="w-4 h-4 mr-1" />
                          Featured
                        </div>
                      )}
                      
                      <div className="absolute top-4 right-4 flex space-x-2">
                        <div className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">
                          {featuredAnimation.animation_type}
                        </div>
                        <div className="bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
                          {featuredAnimation.category}
                        </div>
                      </div>
                      
                      <div className="absolute bottom-6 left-6 right-6 text-white">
                        <h3 className="text-2xl font-bold mb-2">{featuredAnimation.title}</h3>
                        <p className="text-gray-200 text-sm mb-4 line-clamp-2">
                          {featuredAnimation.short_description || featuredAnimation.description || 'No description available'}
                        </p>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-4">
                            <span className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {featuredAnimation.duration_formatted}
                            </span>
                            <span className="flex items-center">
                              <Users className="w-4 h-4 mr-1" />
                              {(featuredAnimation.view_count / 1000).toFixed(0)}K views
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

        {/* Animations Collection */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Animation Gallery</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover stunning animations across different styles and complexity levels, from beginner-friendly 2D to advanced 3D masterpieces.
            </p>
          </div>

          {/* Style and Complexity Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Animation Style</label>
              <div className="flex flex-wrap gap-2">
                {styles.map(style => (
                  <button
                    key={style}
                    onClick={() => setSelectedStyle(style)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      selectedStyle === style
                        ? 'bg-purple-500 text-white shadow-lg'
                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Complexity Level</label>
              <div className="flex flex-wrap gap-2">
                {complexityLevels.map(level => (
                  <button
                    key={level}
                    onClick={() => setSelectedComplexity(level)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      selectedComplexity === level
                        ? 'bg-green-500 text-white shadow-lg'
                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mb-8">
            <SearchFilter
              onSearch={setSearchTerm}
              placeholder="Search animations..."
              className="mb-6"
            />
            
            {/* Additional Filter Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Sort By */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="most-viewed">Most Viewed</option>
                  <option value="most-liked">Most Liked</option>
                  <option value="trending">Trending</option>
                  <option value="alphabetical">A-Z</option>
                </select>
              </div>
              
              {/* Tags Filter */}
              {availableTags.length > 0 && (
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Filter by Tags:</label>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.slice(0, 10).map(tag => (
                      <button
                        key={tag}
                        onClick={() => {
                          if (selectedTags.includes(tag)) {
                            setSelectedTags(selectedTags.filter(t => t !== tag));
                          } else {
                            setSelectedTags([...selectedTags, tag]);
                          }
                        }}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                          selectedTags.includes(tag)
                            ? 'bg-blue-500 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                    {selectedTags.length > 0 && (
                      <button
                        onClick={() => setSelectedTags([])}
                        className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-600 hover:bg-red-200 border border-red-300 transition-all duration-200"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Animations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAnimations.map(animation => (
              <ContentCard
                key={animation.id}
                id={animation.id}
                title={animation.title}
                description={animation.short_description || animation.description || 'No description available'}
                thumbnail={animation.thumbnail || `https://images.unsplash.com/photo-1558618047-3c8347c4d814?w=400&h=600&fit=crop&auto=format&q=80`}
                duration={animation.duration_formatted}
                type="animation"
                tags={animation.tags || []}
                views={animation.view_count}
                likes={animation.like_count}
                style={animation.animation_type}
                complexity={animation.category}
              />
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-8">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalCount}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              pageSizeOptions={[12, 24, 48]}
            />
          </div>

          {/* Empty State */}
          {filteredAnimations.length === 0 && !loading && (
            <div className="text-center py-12">
              <Palette className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No animations found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || selectedTags.length > 0 
                  ? 'Try adjusting your search or filter criteria.' 
                  : 'No animations are available at the moment.'}
              </p>
              {(searchTerm || selectedTags.length > 0) && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedTags([]);
                    setSelectedStyle('All');
                    setSelectedComplexity('All');
                  }}
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default AnimationsPage;