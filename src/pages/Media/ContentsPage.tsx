import { useState, useEffect, useCallback } from 'react';
import { BookOpen, TrendingUp, Users, Clock } from 'lucide-react';
import MainLayout from '../../components/MainLayout/MainLayout';
import MediaFilter, { type FilterOptions } from '../../components/Common/MediaFilter';
import ContentCard from '../../components/Common/ContentCard';
import mediaService, { type Content as ContentType } from '../../services/mediaService';

interface ContentItem {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  type: 'content';
  tags: string[];
  views: number;
  likes: number;
  isTrending?: boolean;
  releaseDate: string;
  category: string;
}

const ContentsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('newest');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Data states
  const [contents, setContents] = useState<ContentType[]>([]);
  const [featuredContents, setFeaturedContents] = useState<ContentType[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  // Load contents data
  useEffect(() => {
    loadContentsData();
  }, []);

  const loadContentsData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load contents and featured contents in parallel
      const [contentsResponse, featuredResponse] = await Promise.all([
        mediaService.getContent({ page_size: 50, status: 'published' }),
        mediaService.getFeaturedContent().catch(() => [])
      ]);

      setContents(contentsResponse.results);
      setFeaturedContents(featuredResponse);

      // Extract unique tags
      const allTags = new Set<string>();
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
      console.error('Error loading contents:', err);
      setError(err instanceof Error ? err.message : 'Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  // Convert API data to ContentItem format for display
  const convertToContentItem = (content: ContentType): ContentItem => ({
    id: content.id,
    title: content.title,
    description: content.short_description || content.description || '',
    thumbnail: content.thumbnail || `https://picsum.photos/400/300?random=${content.id}`,
    duration: content.duration_formatted,
    type: 'content',
    tags: content.tags,
    views: content.view_count,
    likes: content.like_count,
    isTrending: content.is_trending,
    releaseDate: content.published_at || content.created_at,
    category: content.category
  });

  const getFilteredContents = (): ContentItem[] => {
    let contentItems = contents.map(convertToContentItem);

    // Apply search filter
    if (searchTerm) {
      contentItems = contentItems.filter(item =>
        (item.title && item.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.tags && item.tags.some(tag => tag && tag.toLowerCase().includes(searchTerm.toLowerCase())))
      );
    }

    // Apply tag filter
    if (selectedTags.length > 0) {
      contentItems = contentItems.filter(item =>
        item.tags && selectedTags.some(tag => item.tags.includes(tag))
      );
    }

    // Apply sorting
    switch (sortBy) {
      case 'most-liked':
        contentItems.sort((a, b) => b.likes - a.likes);
        break;
      case 'most-viewed':
        contentItems.sort((a, b) => b.views - a.views);
        break;
      case 'alphabetical':
        contentItems.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        break;
      case 'trending':
        contentItems.sort((a, b) => (b.isTrending ? 1 : 0) - (a.isTrending ? 1 : 0));
        break;
      case 'oldest':
        contentItems.sort((a, b) => new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime());
        break;
      default:
        // newest first
        contentItems.sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime());
        break;
    }

    return contentItems;
  };

  const filteredContents = getFilteredContents();
  const featuredContent = featuredContents.length > 0 
    ? convertToContentItem(featuredContents[0]) 
    : filteredContents.find(content => content.isTrending) || filteredContents[0];

  // Memoized handlers to prevent infinite re-renders in MediaFilter
  const handleSearch = useCallback((search: string) => {
    setSearchTerm(search);
  }, []);

  const handleFilter = useCallback((filters: FilterOptions) => {
    setSelectedTags(filters.tags);
    setSortBy(filters.sortBy);
  }, []);

  // Calculate stats from real data
  const totalViews = contents.reduce((sum, content) => sum + content.view_count, 0);
  const avgDuration = contents.length > 0 
    ? Math.round(contents.reduce((sum, content) => sum + (content.duration || 0), 0) / contents.length)
    : 0;

  // Format view count for display
  const formatViewCount = (views: number): string => {
    if (views >= 1000000) {
      const millions = views / 1000000;
      return millions % 1 === 0 ? `${millions.toFixed(0)}M` : `${millions.toFixed(1)}M`;
    } else if (views >= 1000) {
      const thousands = views / 1000;
      return thousands % 1 === 0 ? `${thousands.toFixed(0)}K` : `${thousands.toFixed(1)}K`;
    }
    return views.toString();
  };

  if (loading && contents.length === 0) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading content...</p>
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
              <BookOpen className="h-12 w-12 mx-auto mb-2" />
              <p className="text-lg font-semibold">Error Loading Content</p>
            </div>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={loadContentsData}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-center mb-4">
                  <BookOpen className="h-8 w-8 text-purple-400 mr-3" />
                  <span className="text-purple-400 font-semibold">LiveLens Content</span>
                </div>
                <h1 className="text-5xl md:text-6xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Learn & Grow
                  </span>
                </h1>
                <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                  Dive into our curated collection of educational content, tutorials, and insights. 
                  From professional skills to personal development, find content that empowers your journey.
                </p>
                
                {/* Stats */}
                <div className="flex flex-wrap gap-8 mb-8">
                  <div className="text-center">
                    <div className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                      {contents.length}+
                    </div>
                    <div className="text-sm text-gray-400">Learning Videos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                      {formatViewCount(totalViews)}+
                    </div>
                    <div className="text-sm text-gray-400">Total Views</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text text-transparent">
                      {avgDuration}m
                    </div>
                    <div className="text-sm text-gray-400">Avg. Duration</div>
                  </div>
                </div>
              </div>
              
              {/* Featured Content */}
              {featuredContent && (
                <div className="relative">
                  <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl">
                    <div className="aspect-[4/5] bg-gradient-to-br from-slate-800 to-slate-900 relative">
                      <img 
                        src={featuredContent.thumbnail && featuredContent.thumbnail.trim() ? 
                             featuredContent.thumbnail :
                             `https://picsum.photos/400/600?random=${featuredContent.id}`
                        } 
                        alt={featuredContent.title}
                        className="w-full h-full object-cover"
                      />
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20"></div>
                      
                      {featuredContent.isTrending && (
                        <div className="absolute top-4 left-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center">
                          <TrendingUp className="w-4 h-4 mr-1" />
                          Popular
                        </div>
                      )}
                      
                      <div className="absolute bottom-6 left-6 right-6 text-white">
                        {featuredContent.category && (
                          <div className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium mb-2 inline-block">
                            {featuredContent.category}
                          </div>
                        )}
                        <h3 className="text-2xl font-bold mb-2">{featuredContent.title}</h3>
                        <p className="text-gray-200 text-sm mb-4 line-clamp-2">{featuredContent.description}</p>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-4">
                            <span className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {featuredContent.duration}
                            </span>
                            <span className="flex items-center">
                              <Users className="w-4 h-4 mr-1" />
                              {formatViewCount(featuredContent.views)} views
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

        {/* Content Collection */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Educational Content</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover tutorials, guides, and educational content designed to help you learn new skills and expand your knowledge.
            </p>
          </div>

          {/* Search and Filters */}
          <MediaFilter
            availableTags={availableTags}
            onSearch={handleSearch}
            onFilter={handleFilter}
            contentType="content"
            placeholder="Search content..."
          />

          {/* Content Grid */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredContents.map(content => (
              <ContentCard
                key={content.id}
                {...content}
              />
            ))}
          </div>

          {/* Empty State */}
          {filteredContents.length === 0 && !loading && (
            <div className="text-center py-12">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No content found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default ContentsPage;