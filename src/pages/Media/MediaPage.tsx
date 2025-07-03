import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Film, Play, ArrowRight, TrendingUp, Clock, Eye } from 'lucide-react';
import MainLayout from '../../components/MainLayout/MainLayout';
import SearchFilter from '../../components/Common/SearchFilter';
import ContentCard from '../../components/Common/ContentCard';

// Mock data - replace with actual API calls
const mockFilms = [
  {
    id: '1',
    title: 'Digital Dreams',
    description: 'A journey through the future of technology and human connection.',
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=600&fit=crop',
    duration: '2h 15m',
    type: 'film' as const,
    tags: ['Sci-Fi', 'Drama', 'Technology'],
    views: 125000,
    likes: 8500,
    isTrending: true
  },
  {
    id: '2',
    title: 'Ocean\'s Whisper',
    description: 'An underwater adventure exploring the mysteries of the deep sea.',
    thumbnail: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=600&fit=crop',
    duration: '1h 45m',
    type: 'film' as const,
    tags: ['Adventure', 'Nature', 'Documentary'],
    views: 89000,
    likes: 6200
  }
];

const mockContents = [
  {
    id: '3',
    title: 'Tech Review: Latest Innovations',
    description: 'Exploring the newest technological breakthroughs and their impact.',
    thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=600&fit=crop',
    duration: '25m',
    type: 'content' as const,
    tags: ['Technology', 'Review', 'Innovation'],
    views: 45000,
    likes: 3200
  },
  {
    id: '4',
    title: 'Cooking Masterclass',
    description: 'Learn professional cooking techniques from renowned chefs.',
    thumbnail: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=600&fit=crop',
    duration: '35m',
    type: 'content' as const,
    tags: ['Cooking', 'Tutorial', 'Lifestyle'],
    views: 67000,
    likes: 4100
  }
];

const MediaPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('newest');
  const [activeTab, setActiveTab] = useState<'all' | 'films' | 'contents'>('all');

  const allContent = [...mockFilms, ...mockContents];
  const availableTags = Array.from(new Set(allContent.flatMap(item => item.tags)));

  const getFilteredContent = () => {
    let content = allContent;

    // Filter by tab
    if (activeTab === 'films') {
      content = mockFilms;
    } else if (activeTab === 'contents') {
      content = mockContents;
    }

    // Apply search filter
    if (searchTerm) {
      content = content.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply tag filter
    if (selectedTags.length > 0) {
      content = content.filter(item =>
        selectedTags.some(tag => item.tags.includes(tag))
      );
    }

    // Apply sorting
    switch (sortBy) {
      case 'most-liked':
        content.sort((a, b) => b.likes - a.likes);
        break;
      case 'most-viewed':
        content.sort((a, b) => b.views - a.views);
        break;
      case 'alphabetical':
        content.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'trending':
        content.sort((a, b) => (b.isTrending ? 1 : 0) - (a.isTrending ? 1 : 0));
        break;
      default:
        // newest first - already in order
        break;
    }

    return content;
  };

  const filteredContent = getFilteredContent();
  const trendingContent = allContent.filter(item => item.isTrending)[0];

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
              {trendingContent && (
                <div className="relative">
                  <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl">
                    <div className="aspect-[4/5] bg-gradient-to-br from-slate-800 to-slate-900 relative">
                      <img 
                        src={trendingContent.thumbnail} 
                        alt={trendingContent.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20"></div>
                      
                      <div className="absolute top-4 left-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        Trending
                      </div>
                      
                      <div className="absolute bottom-6 left-6 right-6 text-white">
                        <h3 className="text-2xl font-bold mb-2">{trendingContent.title}</h3>
                        <p className="text-gray-200 text-sm mb-4">{trendingContent.description}</p>
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {trendingContent.duration}
                          </div>
                          <div className="flex items-center">
                            <Eye className="w-4 h-4 mr-1" />
                            {(trendingContent.views / 1000).toFixed(0)}K views
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
                onClick={() => setActiveTab(tab.key as any)}
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
          <SearchFilter
  onSearch={setSearchTerm}
  onFilter={(filters) => {
    setSelectedTags(filters.tags);
    setSortBy(filters.sortBy);
    // optionally handle filters.duration and filters.dateRange if needed
  }}
  contentType="media"
/>

          {/* Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredContent.map(item => (
              <ContentCard
                key={item.id}
                {...item}
                onLike={(id) => {}}
              />
            ))}
          </div>

          {/* Empty State */}
          {filteredContent.length === 0 && (
            <div className="text-center py-12">
              <Film className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No content found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default MediaPage;