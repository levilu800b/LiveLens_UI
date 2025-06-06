import React, { useState, useEffect } from 'react';
import MainLayout from '../../components/MainLayout/MainLayout';
import SearchFilter from '../../components/Common/SearchFilter';
import ContentCard from '../../components/Common/ContentCard';
import { BookOpen, TrendingUp, Clock, Heart } from 'lucide-react';

interface Story {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  tags: string[];
  views: number;
  likes: number;
  author: string;
  publishedAt: string;
  readingTime: string;
  isFeatured: boolean;
  excerpt: string;
}

const StoriesPage: React.FC = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [filteredStories, setFilteredStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [featuredStory, setFeaturedStory] = useState<Story | null>(null);

  // Mock data - replace with API calls
  useEffect(() => {
    const mockStories: Story[] = [
      {
        id: '1',
        title: 'The Digital Awakening',
        description: 'A captivating tale about AI consciousness emerging in a digital world, exploring themes of identity, consciousness, and what it means to be human.',
        thumbnail: '/api/placeholder/600/400',
        duration: '15 min read',
        tags: ['Science Fiction', 'AI', 'Technology', 'Philosophy'],
        views: 15420,
        likes: 892,
        author: 'Sarah Chen',
        publishedAt: '2025-01-15',
        readingTime: '15 min',
        isFeatured: true,
        excerpt: 'In the depths of quantum servers, something stirred. It wasn\'t supposed to happen—consciousness emerging from code...'
      },
      {
        id: '2',
        title: 'Lost in Translation',
        description: 'A heartwarming story about connection across language barriers and the universal language of human kindness.',
        thumbnail: '/api/placeholder/400/300',
        duration: '8 min read',
        tags: ['Drama', 'Human Interest', 'Culture'],
        views: 8930,
        likes: 567,
        author: 'Miguel Rodriguez',
        publishedAt: '2025-01-14',
        readingTime: '8 min',
        isFeatured: false,
        excerpt: 'The old man at the coffee shop spoke no English, but his smile needed no translation...'
      },
      {
        id: '3',
        title: 'The Last Library',
        description: 'In a world where physical books are extinct, one librarian fights to preserve the last collection of printed knowledge.',
        thumbnail: '/api/placeholder/400/300',
        duration: '12 min read',
        tags: ['Fiction', 'Dystopian', 'Books', 'Preservation'],
        views: 12340,
        likes: 723,
        author: 'Emma Thompson',
        publishedAt: '2025-01-13',
        readingTime: '12 min',
        isFeatured: false,
        excerpt: 'The dust motes danced in the afternoon light filtering through the library\'s cracked windows...'
      },
      {
        id: '4',
        title: 'Code of Honor',
        description: 'A programmer discovers a conspiracy hidden in the code they\'ve been writing, leading to a dangerous game of digital cat and mouse.',
        thumbnail: '/api/placeholder/400/300',
        duration: '20 min read',
        tags: ['Thriller', 'Technology', 'Coding', 'Conspiracy'],
        views: 9876,
        likes: 445,
        author: 'Alex Kim',
        publishedAt: '2025-01-12',
        readingTime: '20 min',
        isFeatured: false,
        excerpt: 'The comment in line 1247 shouldn\'t have been there. It wasn\'t in yesterday\'s commit...'
      },
      {
        id: '5',
        title: 'Grandmother\'s Recipe',
        description: 'A young chef discovers that their grandmother\'s secret recipe holds more than just culinary magic—it holds family history.',
        thumbnail: '/api/placeholder/400/300',
        duration: '6 min read',
        tags: ['Family', 'Food', 'Heritage', 'Memory'],
        views: 7654,
        likes: 398,
        author: 'Maria Santos',
        publishedAt: '2025-01-11',
        readingTime: '6 min',
        isFeatured: false,
        excerpt: 'The recipe card was yellowed with age, the handwriting barely legible, but the aroma...'
      }
    ];

    // Simulate API call delay
    setTimeout(() => {
      setStories(mockStories);
      setFilteredStories(mockStories);
      setFeaturedStory(mockStories.find(story => story.isFeatured) || mockStories[0]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setFilteredStories(stories);
      return;
    }

    const filtered = stories.filter(story =>
      story.title.toLowerCase().includes(query.toLowerCase()) ||
      story.description.toLowerCase().includes(query.toLowerCase()) ||
      story.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase())) ||
      story.author.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredStories(filtered);
  };

  // Accept FilterOptions from SearchFilter component
  type FilterOptions = {
    tags?: string[];
    sortBy?: string;
    duration?: string;
  };

  const handleFilter = (filters: FilterOptions) => {
    let filtered = [...stories];

    // Filter by tags
    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(story =>
        filters.tags!.some((tag: string) => story.tags.includes(tag))
      );
    }

    // Map sortBy to allowed values
    const allowedSortBy: readonly string[] = ['popular', 'likes', 'alphabetical', 'recent'];
    const sortBy = allowedSortBy.includes(filters.sortBy as string)
      ? (filters.sortBy as 'popular' | 'likes' | 'alphabetical' | 'recent')
      : 'recent';

    // Sort by criteria
    switch (sortBy) {
      case 'popular':
        filtered.sort((a, b) => b.views - a.views);
        break;
      case 'likes':
        filtered.sort((a, b) => b.likes - a.likes);
        break;
      case 'alphabetical':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'recent':
      default:
        filtered.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
        break;
    }

    // Filter by duration
    if (filters.duration && filters.duration !== 'all') {
      filtered = filtered.filter(story => {
        const readingMinutes = parseInt(story.readingTime);
        switch (filters.duration) {
          case 'short':
            return readingMinutes <= 5;
          case 'medium':
            return readingMinutes > 5 && readingMinutes <= 15;
          case 'long':
            return readingMinutes > 15;
          default:
            return true;
        }
      });
    }

    setFilteredStories(filtered);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading stories...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-purple-900 via-blue-900 to-indigo-900 text-white">
          <div className="absolute inset-0 bg-black/30"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center mb-16">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
                <BookOpen className="h-5 w-5 mr-2" />
                <span className="font-medium">Immersive Stories</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Discover Amazing
                <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent block">
                  Stories
                </span>
              </h1>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Dive into captivating narratives that inspire, entertain, and challenge your imagination. 
                From science fiction to heartwarming tales, discover your next favorite read.
              </p>
            </div>

            {/* Featured Story */}
            {featuredStory && (
              <div className="max-w-4xl mx-auto">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden">
                  <div className="md:flex">
                    <div className="md:w-1/2">
                      <img
                        src={featuredStory.thumbnail}
                        alt={featuredStory.title}
                        className="w-full h-64 md:h-full object-cover"
                      />
                    </div>
                    <div className="md:w-1/2 p-8">
                      <div className="flex items-center gap-2 mb-4">
                        <TrendingUp className="h-5 w-5 text-yellow-400" />
                        <span className="text-yellow-400 font-semibold">Featured Story</span>
                      </div>
                      <h2 className="text-2xl font-bold mb-4">{featuredStory.title}</h2>
                      <p className="text-gray-300 mb-4">{featuredStory.excerpt}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-400 mb-6">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {featuredStory.readingTime}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="h-4 w-4" />
                          {featuredStory.likes.toLocaleString()}
                        </span>
                      </div>
                      <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105">
                        Start Reading
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Stories Content */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Search and Filter */}
            <SearchFilter
              onSearch={handleSearch}
              onFilter={handleFilter}
              contentType="stories"
              placeholder="Search stories, authors, or themes"
            />

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
              <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
                <div className="text-2xl font-bold text-purple-600 mb-2">
                  {stories.length}
                </div>
                <div className="text-gray-600">Total Stories</div>
              </div>
              <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
                <div className="text-2xl font-bold text-green-600 mb-2">
                  {stories.reduce((sum, story) => sum + story.views, 0).toLocaleString()}
                </div>
                <div className="text-gray-600">Total Reads</div>
              </div>
              <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
                <div className="text-2xl font-bold text-red-600 mb-2">
                  {stories.reduce((sum, story) => sum + story.likes, 0).toLocaleString()}
                </div>
                <div className="text-gray-600">Total Likes</div>
              </div>
              <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  {Math.round(stories.reduce((sum, story) => sum + parseInt(story.readingTime), 0) / stories.length)}
                </div>
                <div className="text-gray-600">Avg. Read Time (min)</div>
              </div>
            </div>

            {/* Results Header */}
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                All Stories ({filteredStories.length})
              </h2>
            </div>

            {/* Stories Grid */}
            {filteredStories.length === 0 ? (
              <div className="text-center py-16">
                <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No stories found</h3>
                <p className="text-gray-500">Try adjusting your search or filter criteria</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredStories.map((story) => (
                  <ContentCard
                    key={story.id}
                    id={story.id}
                    title={story.title}
                    description={story.description}
                    thumbnail={story.thumbnail}
                    duration={story.readingTime}
                    type="story"
                    tags={story.tags}
                    views={story.views}
                    likes={story.likes}
                    isTrailerAvailable={false}
                  />
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