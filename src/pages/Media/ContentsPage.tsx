import { useState } from 'react';
import { BookOpen, TrendingUp, Users, Clock } from 'lucide-react';
import MainLayout from '../../components/MainLayout/MainLayout';
import SearchFilter from '../../components/Common/SearchFilter';
import ContentCard from '../../components/Common/ContentCard';

// Mock data - replace with actual API calls
const mockContents = [
  {
    id: '1',
    title: 'Tech Review: Latest Innovations',
    description: 'Exploring the newest technological breakthroughs and their impact on our daily lives.',
    thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=600&fit=crop',
    duration: '25m',
    type: 'content' as const,
    tags: ['Technology', 'Review', 'Innovation'],
    views: 45000,
    likes: 3200,
    releaseDate: '2024-11-15',
    category: 'Educational'
  },
  {
    id: '2',
    title: 'Cooking Masterclass',
    description: 'Learn professional cooking techniques from renowned chefs around the world.',
    thumbnail: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=600&fit=crop',
    duration: '35m',
    type: 'content' as const,
    tags: ['Cooking', 'Tutorial', 'Lifestyle'],
    views: 67000,
    likes: 4100,
    isTrending: true,
    releaseDate: '2024-11-20',
    category: 'Tutorial'
  },
  {
    id: '3',
    title: 'Photography Basics',
    description: 'Master the fundamentals of photography with this comprehensive beginner\'s guide.',
    thumbnail: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=600&fit=crop',
    duration: '28m',
    type: 'content' as const,
    tags: ['Photography', 'Tutorial', 'Creative'],
    views: 52000,
    likes: 3800,
    releaseDate: '2024-11-10',
    category: 'Tutorial'
  },
  {
    id: '4',
    title: 'Sustainable Living Guide',
    description: 'Practical tips and strategies for living a more environmentally conscious lifestyle.',
    thumbnail: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=600&fit=crop',
    duration: '42m',
    type: 'content' as const,
    tags: ['Environment', 'Lifestyle', 'Sustainability'],
    views: 38000,
    likes: 2900,
    releaseDate: '2024-11-05',
    category: 'Educational'
  },
  {
    id: '5',
    title: 'Digital Marketing Trends',
    description: 'Stay ahead of the curve with the latest digital marketing strategies and trends.',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=600&fit=crop',
    duration: '31m',
    type: 'content' as const,
    tags: ['Marketing', 'Business', 'Digital'],
    views: 73000,
    likes: 5200,
    isTrending: true,
    releaseDate: '2024-11-18',
    category: 'Business'
  },
  {
    id: '6',
    title: 'Fitness at Home',
    description: 'Effective workout routines you can do from the comfort of your own home.',
    thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=600&fit=crop',
    duration: '20m',
    type: 'content' as const,
    tags: ['Fitness', 'Health', 'Workout'],
    views: 89000,
    likes: 6700,
    releaseDate: '2024-11-12',
    category: 'Health'
  },
  {
    id: '7',
    title: 'Creative Writing Workshop',
    description: 'Unleash your creativity with proven techniques for better storytelling and writing.',
    thumbnail: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&h=600&fit=crop',
    duration: '45m',
    type: 'content' as const,
    tags: ['Writing', 'Creative', 'Workshop'],
    views: 34000,
    likes: 2600,
    releaseDate: '2024-11-08',
    category: 'Creative'
  },
  {
    id: '8',
    title: 'Personal Finance 101',
    description: 'Essential financial literacy skills for managing your money and building wealth.',
    thumbnail: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=600&fit=crop',
    duration: '38m',
    type: 'content' as const,
    tags: ['Finance', 'Money', 'Investment'],
    views: 61000,
    likes: 4300,
    releaseDate: '2024-11-14',
    category: 'Educational'
  }
];

const categories = ['All', 'Educational', 'Tutorial', 'Business', 'Health', 'Creative'];

const ContentsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('newest');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const availableTags = Array.from(new Set(mockContents.flatMap(item => item.tags)));

  const getFilteredContents = () => {
    let contents = [...mockContents];

    // Apply category filter
    if (selectedCategory !== 'All') {
      contents = contents.filter(item => item.category === selectedCategory);
    }

    // Apply search filter
    if (searchTerm) {
      contents = contents.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply tag filter
    if (selectedTags.length > 0) {
      contents = contents.filter(item =>
        selectedTags.some(tag => item.tags.includes(tag))
      );
    }

    // Apply sorting
    switch (sortBy) {
      case 'most-liked':
        contents.sort((a, b) => b.likes - a.likes);
        break;
      case 'most-viewed':
        contents.sort((a, b) => b.views - a.views);
        break;
      case 'alphabetical':
        contents.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'trending':
        contents.sort((a, b) => (b.isTrending ? 1 : 0) - (a.isTrending ? 1 : 0));
        break;
      case 'oldest':
        contents.sort((a, b) => new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime());
        break;
      default:
        // newest first
        contents.sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime());
        break;
    }

    return contents;
  };

  const filteredContents = getFilteredContents();
  const featuredContent = mockContents.find(content => content.isTrending) || mockContents[0];

  const totalViews = mockContents.reduce((sum, content) => sum + content.views, 0);
  const avgDuration = Math.round(
    mockContents.reduce((sum, content) => sum + parseInt(content.duration), 0) / mockContents.length
  );

  return (
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
                      {mockContents.length}+
                    </div>
                    <div className="text-sm text-gray-400">Learning Videos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                      {(totalViews / 1000).toFixed(0)}K+
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
                        src={featuredContent.thumbnail} 
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
                        <div className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium mb-2 inline-block">
                          {featuredContent.category}
                        </div>
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
                              {(featuredContent.views / 1000).toFixed(0)}K views
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

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedCategory === category
                    ? 'bg-purple-500 text-white shadow-lg'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Search and Filters */}
          <SearchFilter
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedTags={selectedTags}
            onTagChange={setSelectedTags}
            sortBy={sortBy}
            onSortChange={setSortBy}
            availableTags={availableTags}
            contentType="content"
          />

          {/* Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredContents.map(content => (
              <ContentCard
                key={content.id}
                {...content}
                onLike={(id) => console.log('Liked content:', id)}
              />
            ))}
          </div>

          {/* Empty State */}
          {filteredContents.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No content found</h3>
              <p className="text-gray-600">Try adjusting your search, category, or filter criteria.</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default ContentsPage;