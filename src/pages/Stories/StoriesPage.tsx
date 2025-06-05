// src/pages/Stories/StoriesPage.tsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Search, Filter, BookOpen, Heart, Eye, Clock, User, Play, TrendingUp } from 'lucide-react';
import MainLayout from '../../components/MainLayout/MainLayout';

interface Story {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  author: string;
  publishedAt: string;
  readTime: string;
  tags: string[];
  likes: number;
  views: number;
  isTrending?: boolean;
  excerpt: string;
}

interface RootState {
  user: {
    userInfo: any;
  };
}

const StoriesPage = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [filteredStories, setFilteredStories] = useState<Story[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  const { userInfo } = useSelector((state: RootState) => state.user);
  const navigate = useNavigate();

  // Mock data
  const mockStories: Story[] = [
    {
      id: '1',
      title: 'The Future of Artificial Intelligence',
      description: 'Exploring the transformative potential of AI in our daily lives and its implications for humanity.',
      thumbnail: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=600&fit=crop',
      author: 'LiveLens Team',
      publishedAt: '2025-01-01',
      readTime: '8 min read',
      tags: ['Technology', 'AI', 'Future'],
      likes: 342,
      views: 2145,
      isTrending: true,
      excerpt: 'As we stand at the threshold of a new era, artificial intelligence continues to reshape our understanding of what\'s possible...'
    },
    {
      id: '2',
      title: 'Stories from the Digital Frontier',
      description: 'Personal accounts of creators navigating the evolving landscape of digital storytelling.',
      thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=600&fit=crop',
      author: 'Sarah Chen',
      publishedAt: '2024-12-28',
      readTime: '12 min read',
      tags: ['Digital', 'Creativity', 'Storytelling'],
      likes: 128,
      views: 987,
      excerpt: 'In the vast expanse of the digital realm, creators are finding new ways to connect with audiences through immersive storytelling...'
    },
    {
      id: '3',
      title: 'The Art of Visual Narrative',
      description: 'How modern filmmakers are using cutting-edge technology to enhance traditional storytelling.',
      thumbnail: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&h=600&fit=crop',
      author: 'Marcus Rodriguez',
      publishedAt: '2024-12-25',
      readTime: '6 min read',
      tags: ['Film', 'Visual Arts', 'Technology'],
      likes: 89,
      views: 654,
      excerpt: 'Visual storytelling has evolved beyond traditional boundaries, embracing new technologies to create experiences that blur the line between reality and fiction...'
    },
    {
      id: '4',
      title: 'Building Communities Through Content',
      description: 'The power of authentic storytelling in creating meaningful connections in the digital age.',
      thumbnail: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop',
      author: 'Emma Thompson',
      publishedAt: '2024-12-20',
      readTime: '10 min read',
      tags: ['Community', 'Social', 'Content'],
      likes: 267,
      views: 1543,
      excerpt: 'In an increasingly connected world, the stories we tell have the power to bring people together, creating communities that transcend geographical boundaries...'
    },
    {
      id: '5',
      title: 'The Science of Engagement',
      description: 'Understanding the psychology behind what makes content truly captivating.',
      thumbnail: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=600&fit=crop',
      author: 'Dr. Alex Kim',
      publishedAt: '2024-12-15',
      readTime: '15 min read',
      tags: ['Psychology', 'Engagement', 'Research'],
      likes: 156,
      views: 892,
      excerpt: 'What makes some stories stick while others fade away? Recent research in cognitive psychology reveals the key factors that capture and hold human attention...'
    }
  ];

  const allTags = ['all', ...Array.from(new Set(mockStories.flatMap(story => story.tags)))];

  useEffect(() => {
    // Simulate loading
    const loadStories = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStories(mockStories);
      setFilteredStories(mockStories);
      setIsLoading(false);
    };

    loadStories();
  }, []);

  useEffect(() => {
    let filtered = stories;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(story =>
        story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        story.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        story.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by tag
    if (selectedTag !== 'all') {
      filtered = filtered.filter(story => story.tags.includes(selectedTag));
    }

    setFilteredStories(filtered);
  }, [stories, searchTerm, selectedTag]);

  const handleReadStory = (storyId: string) => {
    if (!userInfo) {
      navigate('/login');
      return;
    }
    navigate(`/story/${storyId}`);
  };

  const featuredStory = stories.find(story => story.isTrending) || stories[0];

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Hero Section */}
        <section className="relative py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Stories
                </span>
              </h1>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Discover captivating narratives that inspire, educate, and entertain. 
                From personal journeys to groundbreaking insights.
              </p>
            </div>

            {/* Featured Story */}
            {featuredStory && (
              <div className="relative bg-slate-800/50 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden mb-16">
                <div className="absolute top-4 left-4 z-10">
                  <span className="flex items-center bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    Trending
                  </span>
                </div>
                
                <div className="grid lg:grid-cols-2 gap-8 p-8">
                  <div className="relative">
                    <img
                      src={featuredStory.thumbnail}
                      alt={featuredStory.title}
                      className="w-full h-64 lg:h-80 object-cover rounded-xl"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-xl" />
                  </div>
                  
                  <div className="flex flex-col justify-center space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {featuredStory.tags.map(tag => (
                        <span key={tag} className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    <h2 className="text-3xl font-bold text-white">{featuredStory.title}</h2>
                    <p className="text-gray-300 text-lg">{featuredStory.excerpt}</p>
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-400">
                      <span className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        {featuredStory.author}
                      </span>
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {featuredStory.readTime}
                      </span>
                      <span className="flex items-center">
                        <Eye className="h-4 w-4 mr-1" />
                        {featuredStory.views.toLocaleString()}
                      </span>
                      <span className="flex items-center">
                        <Heart className="h-4 w-4 mr-1" />
                        {featuredStory.likes}
                      </span>
                    </div>
                    
                    <button
                      onClick={() => handleReadStory(featuredStory.id)}
                      className="self-start bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3 rounded-full font-medium transition-all duration-200 hover:scale-105 flex items-center"
                    >
                      <BookOpen className="h-5 w-5 mr-2" />
                      Start Reading
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Search and Filter Section */}
        <section className="px-4 sm:px-6 lg:px-8 mb-12">
          <div className="max-w-7xl mx-auto">
            <div className="bg-slate-800/50 backdrop-blur-md rounded-xl border border-white/10 p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search stories, topics, or authors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* Filter by Tag */}
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <select
                    value={selectedTag}
                    onChange={(e) => setSelectedTag(e.target.value)}
                    className="pl-10 pr-8 py-3 bg-slate-700/50 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
                  >
                    {allTags.map(tag => (
                      <option key={tag} value={tag} className="bg-slate-700">
                        {tag === 'all' ? 'All Categories' : tag}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stories Grid */}
        <section className="px-4 sm:px-6 lg:px-8 pb-20">
          <div className="max-w-7xl mx-auto">
            {isLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-slate-800/50 rounded-xl border border-white/10 overflow-hidden animate-pulse">
                    <div className="h-48 bg-slate-700" />
                    <div className="p-6 space-y-3">
                      <div className="h-4 bg-slate-700 rounded w-3/4" />
                      <div className="h-4 bg-slate-700 rounded w-1/2" />
                      <div className="h-20 bg-slate-700 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredStories.length === 0 ? (
              <div className="text-center py-20">
                <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">No stories found</h3>
                <p className="text-gray-400">Try adjusting your search or filter criteria</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredStories.map((story) => (
                  <div
                    key={story.id}
                    className="group bg-slate-800/50 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden hover:border-purple-500/50 transition-all duration-300 hover:scale-105"
                  >
                    <div className="relative">
                      <img
                        src={story.thumbnail}
                        alt={story.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                        {story.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="bg-black/50 text-white px-2 py-1 rounded text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
                        {story.title}
                      </h3>
                      
                      <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                        {story.description}
                      </p>

                      <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                        <span className="flex items-center">
                          <User className="h-3 w-3 mr-1" />
                          {story.author}
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {story.readTime}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-xs text-gray-400">
                          <span className="flex items-center">
                            <Eye className="h-3 w-3 mr-1" />
                            {story.views.toLocaleString()}
                          </span>
                          <span className="flex items-center">
                            <Heart className="h-3 w-3 mr-1" />
                            {story.likes}
                          </span>
                        </div>

                        <button
                          onClick={() => handleReadStory(story.id)}
                          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 flex items-center"
                        >
                          <BookOpen className="h-4 w-4 mr-1" />
                          Read
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

export default StoriesPage;