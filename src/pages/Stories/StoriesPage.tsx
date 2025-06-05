// src/pages/Stories/StoriesPage.tsx
import React, { useState, useEffect } from 'react';
import {  useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  BookOpen,
  Clock,
  User,
  Heart,
  Eye,
  Search,
  TrendingUp,
} from 'lucide-react';
import type { RootState } from '../../store';
//import { contentActions } from '../../store/reducers/contentReducers';
import MainLayout from '../../components/MainLayout/MainLayout';
//import ContentCard from '../../components/Content/ContentCard';
//import SearchAndFilter from '../../components/Content/SearchAndFilter';

interface Story {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail: string;
  readTime: string;
  tags: string[];
  likes: number;
  views: number;
  isLiked?: boolean;
  isFavorited?: boolean;
  createdAt: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  isTrending?: boolean;
  excerpt: string;
}

const StoriesPage: React.FC = () => {
  const navigate = useNavigate();
  // Adjust this line to match your actual user state shape
  const isAuthenticated = useSelector((state: RootState) => Boolean(state.user.userInfo));
  // Removed unused destructuring from state.content
  
  const [stories, setStories] = useState<Story[]>([]);
  const [featuredStory, setFeaturedStory] = useState<Story | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Mock data - replace with real API calls
  useEffect(() => {
    const mockStories: Story[] = [
      {
        id: '1',
        title: 'The Future of Artificial Intelligence in Creative Industries',
        slug: 'future-ai-creative-industries',
        description: 'Exploring how AI is reshaping the landscape of creativity, from writing to visual arts, and what it means for creators.',
        thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
        readTime: '8 min read',
        tags: ['Technology', 'AI', 'Creativity'],
        likes: 342,
        views: 1250,
        isLiked: false,
        isFavorited: false,
        createdAt: '2024-01-15',
        author: {
          id: 'author1',
          name: 'Sarah Johnson',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b056048f?w=100'
        },
        isTrending: true,
        excerpt: 'As we stand at the crossroads of technology and creativity, artificial intelligence emerges as both a tool and a collaborator...'
      },
      {
        id: '2',
        title: 'Journey Through the Digital Renaissance',
        slug: 'digital-renaissance-journey',
        description: 'A deep dive into how digital tools are creating a new renaissance in art and storytelling.',
        thumbnail: 'https://images.unsplash.com/photo-1561736778-92e52a7769ef?w=800',
        readTime: '12 min read',
        tags: ['Digital Art', 'Renaissance', 'Technology'],
        likes: 198,
        views: 890,
        isLiked: true,
        isFavorited: false,
        createdAt: '2024-01-12',
        author: {
          id: 'author2',
          name: 'Michael Chen',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'
        },
        isTrending: false,
        excerpt: 'In the digital age, we are witnessing a renaissance that rivals the great artistic movements of the past...'
      },
      {
        id: '3',
        title: 'The Art of Visual Storytelling in the Modern Era',
        slug: 'visual-storytelling-modern-era',
        description: 'How visual narratives are evolving with new technologies and changing audience expectations.',
        thumbnail: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800',
        readTime: '6 min read',
        tags: ['Storytelling', 'Visual Arts', 'Media'],
        likes: 276,
        views: 1150,
        isLiked: false,
        isFavorited: true,
        createdAt: '2024-01-10',
        author: {
          id: 'author3',
          name: 'Emma Rodriguez',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100'
        },
        isTrending: false,
        excerpt: 'Visual storytelling has always been at the heart of human communication, but today it takes on new dimensions...'
      },
      {
        id: '4',
        title: 'Behind the Scenes: Creating Immersive Experiences',
        slug: 'behind-scenes-immersive-experiences',
        description: 'A look at the process and technology behind creating truly immersive digital experiences.',
        thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800',
        readTime: '10 min read',
        tags: ['Immersive', 'Technology', 'Design'],
        likes: 156,
        views: 720,
        isLiked: false,
        isFavorited: false,
        createdAt: '2024-01-08',
        author: {
          id: 'author4',
          name: 'David Kim',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100'
        },
        isTrending: false,
        excerpt: 'Creating immersive experiences requires a delicate balance of technology, creativity, and user psychology...'
      }
    ];

    setStories(mockStories);
    setFeaturedStory(mockStories.find(story => story.isTrending) || mockStories[0]);
  }, []);

  const handleReadStory = (storyId: string) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/story/${storyId}` } });
    } else {
      navigate(`/story/${storyId}`);
    }
  };

  const handleLikeStory = (storyId: string) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    setStories(prevStories =>
      prevStories.map(story =>
        story.id === storyId
          ? {
              ...story,
              isLiked: !story.isLiked,
              likes: story.isLiked ? story.likes - 1 : story.likes + 1
            }
          : story
      )
    );
  };

  const allTags = Array.from(new Set(stories.flatMap(story => story.tags)));

  const filteredStories = stories.filter(story => {
    const matchesSearch = story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         story.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = !selectedTag || story.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'most-liked':
        return b.likes - a.likes;
      case 'most-viewed':
        return b.views - a.views;
      default:
        return 0;
    }
  });

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        
        {/* Hero Section */}
        {featuredStory && (
          <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
            {/* Background Image */}
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${featuredStory.thumbnail})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/70"></div>
            </div>

            {/* Floating Elements */}
            <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>

            {/* Content */}
            <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="mb-6">
                <span className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 backdrop-blur-sm text-purple-300 text-sm font-medium">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Trending Story
                </span>
              </div>

              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                {featuredStory.title}
              </h1>

              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                {featuredStory.description}
              </p>

              <div className="flex flex-wrap items-center justify-center gap-6 mb-8 text-gray-300">
                <div className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  <span>{featuredStory.author.name}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  <span>{featuredStory.readTime}</span>
                </div>
                <div className="flex items-center">
                  <Eye className="h-5 w-5 mr-2" />
                  <span>{featuredStory.views.toLocaleString()} views</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => handleReadStory(featuredStory.id)}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3 rounded-full font-semibold text-lg transition-all duration-300 hover:scale-105 shadow-2xl hover:shadow-purple-500/25 flex items-center justify-center"
                >
                  <BookOpen className="h-5 w-5 mr-2" />
                  Start Reading
                </button>
                
                <button
                  onClick={() => handleLikeStory(featuredStory.id)}
                  className={`px-8 py-3 rounded-full font-semibold text-lg transition-all duration-300 hover:scale-105 flex items-center justify-center ${
                    featuredStory.isLiked
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                  }`}
                >
                  <Heart className={`h-5 w-5 mr-2 ${featuredStory.isLiked ? 'fill-current' : ''}`} />
                  {featuredStory.likes.toLocaleString()}
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Content Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Section Header */}
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Featured Stories</h2>
              <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                Discover captivating narratives that inspire, educate, and entertain. 
                From thought-provoking essays to immersive tales.
              </p>
            </div>

            {/* Search and Filter */}
            <div className="mb-8">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search stories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-white/20 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                {/* Filters */}
                <div className="flex gap-4">
                  <select
                    value={selectedTag}
                    onChange={(e) => setSelectedTag(e.target.value)}
                    className="bg-slate-800/50 border border-white/20 rounded-full px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">All Tags</option>
                    {allTags.map(tag => (
                      <option key={tag} value={tag}>{tag}</option>
                    ))}
                  </select>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-slate-800/50 border border-white/20 rounded-full px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                    <option value="most-liked">Most Liked</option>
                    <option value="most-viewed">Most Viewed</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Stories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredStories.map((story) => (
                <div
                  key={story.id}
                  className="bg-slate-800/50 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 group"
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={story.thumbnail}
                      alt={story.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    
                    {/* Tags */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                      {story.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-purple-500/80 text-white text-xs rounded-full backdrop-blur-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Reading Time */}
                    <div className="absolute bottom-3 right-3 flex items-center bg-black/50 rounded-full px-3 py-1 backdrop-blur-sm">
                      <Clock className="h-3 w-3 text-white mr-1" />
                      <span className="text-white text-xs">{story.readTime}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-3 leading-tight group-hover:text-purple-300 transition-colors duration-200">
                      {story.title}
                    </h3>
                    
                    <p className="text-gray-300 text-sm mb-4 leading-relaxed line-clamp-3">
                      {story.excerpt}
                    </p>

                    {/* Author */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <img
                          src={story.author.avatar}
                          alt={story.author.name}
                          className="h-8 w-8 rounded-full object-cover mr-3"
                        />
                        <div>
                          <p className="text-white text-sm font-medium">{story.author.name}</p>
                          <p className="text-gray-400 text-xs">{new Date(story.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4 text-gray-400 text-sm">
                        <span className="flex items-center">
                          <Eye className="h-4 w-4 mr-1" />
                          {story.views.toLocaleString()}
                        </span>
                        <span className="flex items-center">
                          <Heart className="h-4 w-4 mr-1" />
                          {story.likes.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleReadStory(story.id)}
                        className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-2 px-4 rounded-full font-medium transition-all duration-200 hover:scale-105 flex items-center justify-center"
                      >
                        <BookOpen className="h-4 w-4 mr-2" />
                        Start Reading
                      </button>
                      
                      <button
                        onClick={() => handleLikeStory(story.id)}
                        className={`p-2 rounded-full transition-all duration-200 hover:scale-110 ${
                          story.isLiked
                            ? 'bg-red-500 hover:bg-red-600 text-white'
                            : 'bg-slate-700 hover:bg-slate-600 text-gray-300'
                        }`}
                      >
                        <Heart className={`h-4 w-4 ${story.isLiked ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More */}
            <div className="text-center mt-12">
              <button className="bg-slate-800/50 hover:bg-slate-700/50 text-white px-8 py-3 rounded-full font-medium transition-all duration-200 hover:scale-105 border border-white/20">
                Load More Stories
              </button>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

export default StoriesPage;