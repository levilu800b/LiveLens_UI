import { useState } from 'react';
import { Headphones, Play, Mic, TrendingUp, Users, Volume2 } from 'lucide-react';
import MainLayout from '../../components/MainLayout/MainLayout';
import SearchFilter from '../../components/Common/SearchFilter';
import ContentCard from '../../components/Common/ContentCard';

// Mock data - replace with actual API calls
const mockPodcasts = [
  {
    id: '1',
    title: 'Tech Talk: AI Revolution',
    description: 'Exploring the latest developments in artificial intelligence and machine learning.',
    thumbnail: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400&h=600&fit=crop',
    duration: '45m',
    type: 'podcast' as const,
    tags: ['Technology', 'AI', 'Innovation'],
    views: 89000,
    likes: 6200,
    isTrending: true,
    releaseDate: '2024-11-20',
    episode: 15,
    season: 2
  },
  {
    id: '2',
    title: 'Creative Minds',
    description: 'Conversations with artists, designers, and creative professionals about their craft.',
    thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=600&fit=crop',
    duration: '52m',
    type: 'podcast' as const,
    tags: ['Creative', 'Art', 'Design'],
    views: 67000,
    likes: 4800,
    releaseDate: '2024-11-18',
    episode: 8,
    season: 1
  },
  {
    id: '3',
    title: 'Business Insights',
    description: 'Deep dives into successful business strategies and entrepreneurial journeys.',
    thumbnail: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=600&fit=crop',
    duration: '38m',
    type: 'podcast' as const,
    tags: ['Business', 'Entrepreneurship', 'Strategy'],
    views: 124000,
    likes: 8900,
    releaseDate: '2024-11-22',
    episode: 23,
    season: 3
  },
  {
    id: '4',
    title: 'Mindful Living',
    description: 'Wellness tips, meditation practices, and mental health discussions.',
    thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600&fit=crop',
    duration: '29m',
    type: 'podcast' as const,
    tags: ['Wellness', 'Meditation', 'Health'],
    views: 78000,
    likes: 5600,
    isTrending: true,
    releaseDate: '2024-11-19',
    episode: 12,
    season: 2
  },
  {
    id: '5',
    title: 'Future of Work',
    description: 'Exploring how technology and culture are reshaping the modern workplace.',
    thumbnail: 'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=400&h=600&fit=crop',
    duration: '41m',
    type: 'podcast' as const,
    tags: ['Work', 'Future', 'Technology'],
    views: 92000,
    likes: 6700,
    releaseDate: '2024-11-21',
    episode: 18,
    season: 2
  },
  {
    id: '6',
    title: 'Science Stories',
    description: 'Making complex scientific discoveries accessible through engaging storytelling.',
    thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop',
    duration: '35m',
    type: 'podcast' as const,
    tags: ['Science', 'Education', 'Discovery'],
    views: 56000,
    likes: 4200,
    releaseDate: '2024-11-17',
    episode: 7,
    season: 1
  },
  {
    id: '7',
    title: 'Cultural Connections',
    description: 'Celebrating diversity through stories from different cultures around the world.',
    thumbnail: 'https://images.unsplash.com/photo-1529258283598-8d6fe60b27f4?w=400&h=600&fit=crop',
    duration: '48m',
    type: 'podcast' as const,
    tags: ['Culture', 'Diversity', 'Global'],
    views: 43000,
    likes: 3100,
    releaseDate: '2024-11-16',
    episode: 5,
    season: 1
  },
  {
    id: '8',
    title: 'Climate Conversations',
    description: 'Important discussions about climate change and environmental sustainability.',
    thumbnail: 'https://images.unsplash.com/photo-1569163139394-de4e4f43e4e5?w=400&h=600&fit=crop',
    duration: '43m',
    type: 'podcast' as const,
    tags: ['Environment', 'Climate', 'Sustainability'],
    views: 71000,
    likes: 5300,
    releaseDate: '2024-11-15',
    episode: 9,
    season: 1
  }
];

const PodcastsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('newest');

  const availableTags = Array.from(new Set(mockPodcasts.flatMap(item => item.tags)));

  const getFilteredPodcasts = () => {
    let podcasts = [...mockPodcasts];

    // Apply search filter
    if (searchTerm) {
      podcasts = podcasts.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply tag filter
    if (selectedTags.length > 0) {
      podcasts = podcasts.filter(item =>
        selectedTags.some(tag => item.tags.includes(tag))
      );
    }

    // Apply sorting
    switch (sortBy) {
      case 'most-liked':
        podcasts.sort((a, b) => b.likes - a.likes);
        break;
      case 'most-viewed':
        podcasts.sort((a, b) => b.views - a.views);
        break;
      case 'alphabetical':
        podcasts.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'trending':
        podcasts.sort((a, b) => (b.isTrending ? 1 : 0) - (a.isTrending ? 1 : 0));
        break;
      case 'oldest':
        podcasts.sort((a, b) => new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime());
        break;
      default:
        // newest first
        podcasts.sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime());
        break;
    }

    return podcasts;
  };

  const filteredPodcasts = getFilteredPodcasts();
  const featuredPodcast = mockPodcasts.find(podcast => podcast.isTrending) || mockPodcasts[0];

  const totalEpisodes = mockPodcasts.length;
  const totalListeners = mockPodcasts.reduce((sum, podcast) => sum + podcast.views, 0);
  const avgDuration = Math.round(
    mockPodcasts.reduce((sum, podcast) => sum + parseInt(podcast.duration), 0) / mockPodcasts.length
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
                  <Headphones className="h-8 w-8 text-purple-400 mr-3" />
                  <span className="text-purple-400 font-semibold">LiveLens Podcasts</span>
                </div>
                <h1 className="text-5xl md:text-6xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Stories That Speak
                  </span>
                </h1>
                <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                  Tune into conversations that matter. From technology to wellness, business to culture, 
                  discover podcasts that inform, inspire, and entertain.
                </p>
                
                {/* Stats */}
                <div className="flex flex-wrap gap-8 mb-8">
                  <div className="text-center">
                    <div className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                      {totalEpisodes}+
                    </div>
                    <div className="text-sm text-gray-400">Episodes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                      {(totalListeners / 1000).toFixed(0)}K+
                    </div>
                    <div className="text-sm text-gray-400">Listeners</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text text-transparent">
                      {avgDuration}m
                    </div>
                    <div className="text-sm text-gray-400">Avg. Length</div>
                  </div>
                </div>

                {/* Audio Visualization */}
                <div className="flex items-center space-x-2 mb-8">
                  <Volume2 className="w-5 h-5 text-purple-400" />
                  <div className="flex space-x-1">
                    {[...Array(20)].map((_, i) => (
                      <div
                        key={i}
                        className="w-1 bg-gradient-to-t from-purple-500 to-pink-500 rounded-full animate-pulse"
                        style={{
                          height: `${Math.random() * 30 + 10}px`,
                          animationDelay: `${i * 0.1}s`
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Featured Podcast */}
              {featuredPodcast && (
                <div className="relative">
                  <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl">
                    <div className="aspect-[4/5] bg-gradient-to-br from-slate-800 to-slate-900 relative">
                      <img 
                        src={featuredPodcast.thumbnail} 
                        alt={featuredPodcast.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20"></div>
                      
                      {featuredPodcast.isTrending && (
                        <div className="absolute top-4 left-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center">
                          <TrendingUp className="w-4 h-4 mr-1" />
                          Trending
                        </div>
                      )}
                      
                      <div className="absolute bottom-6 left-6 right-6 text-white">
                        <div className="bg-purple-500 text-white px-2 py-1 rounded text-xs font-medium mb-2 inline-block">
                          S{featuredPodcast.season} E{featuredPodcast.episode}
                        </div>
                        <h3 className="text-2xl font-bold mb-2">{featuredPodcast.title}</h3>
                        <p className="text-gray-200 text-sm mb-4 line-clamp-2">{featuredPodcast.description}</p>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-4">
                            <span className="flex items-center">
                              <Mic className="w-4 h-4 mr-1" />
                              {featuredPodcast.duration}
                            </span>
                            <span className="flex items-center">
                              <Users className="w-4 h-4 mr-1" />
                              {(featuredPodcast.views / 1000).toFixed(0)}K plays
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

        {/* Podcasts Collection */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Podcast Library</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover engaging conversations and thought-provoking discussions across various topics and interests.
            </p>
          </div>

          {/* Search and Filters */}
          <SearchFilter
            onSearch={setSearchTerm}
            onFilter={(filters) => {
              setSelectedTags(filters.tags);
              setSortBy(filters.sortBy);
              // optionally handle filters.duration and filters.dateRange if needed
            }}
            contentType="podcast"
          />

          {/* Podcasts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPodcasts.map(podcast => (
              <ContentCard
                key={podcast.id}
                {...podcast}
                season={podcast.season}
                episode={podcast.episode}
                onLike={(id) => {}}
              />
            ))}
          </div>

          {/* Empty State */}
          {filteredPodcasts.length === 0 && (
            <div className="text-center py-12">
              <Headphones className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No podcasts found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default PodcastsPage;