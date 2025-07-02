import React, { useState, useEffect } from 'react';
import MainLayout from '../../components/MainLayout/MainLayout';
import SearchFilter from '../../components/Common/SearchFilter';
import ContentCard from '../../components/Common/ContentCard';
import { BookOpen, TrendingUp, Clock, Heart } from 'lucide-react';
import storyService from '../../services/storyService';
import type { Story, StoryListItem } from '../../services/storyService';

const StoriesPage: React.FC = () => {
  console.log('🔍 StoriesPage: Component rendering - Version 2');
  
  const [stories, setStories] = useState<StoryListItem[]>([]);
  const [filteredStories, setFilteredStories] = useState<StoryListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [featuredStory, setFeaturedStory] = useState<Story | null>(null);
  const [stats, setStats] = useState({
    total_stories: 0,
    total_reads: 0,
    total_likes: 0,
    avg_read_time: 0
  });

  const loadStories = async () => {
    try {
      console.log('🔍 StoriesPage: Loading stories...');
      setLoading(true);
      const response = await storyService.getStories({
        status: 'published',
        page_size: 50
      });
      console.log('🔍 StoriesPage: Stories loaded:', response);
      console.log('🔍 StoriesPage: Number of stories:', response.results.length);
      setStories(response.results);
      setFilteredStories(response.results);
    } catch (error) {
      console.error('🔍 StoriesPage: Error loading stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadHeroStory = async () => {
    try {
      const hero = await storyService.getHeroStory();
      setFeaturedStory(hero);
    } catch (error) {
      console.error('Error loading hero story:', error);
      // Fallback logic: select hero story based on trending or recent stories
      if (stories.length > 0) {
        try {
          // First, try to find a trending story
          let heroStory = stories.find(story => story.is_trending);
          
          // If no trending story, find the most recent featured story
          if (!heroStory) {
            heroStory = stories.find(story => story.is_featured);
          }
          
          // If no featured story, find the story with highest engagement (likes + reads)
          if (!heroStory) {
            heroStory = stories.reduce((prev, current) => {
              const prevScore = prev.like_count + prev.read_count;
              const currentScore = current.like_count + current.read_count;
              return currentScore > prevScore ? current : prev;
            });
          }
          
          if (heroStory) {
            const fullStory = await storyService.getStory(heroStory.id);
            setFeaturedStory(fullStory);
          }
        } catch (err) {
          console.error('Error loading fallback hero story:', err);
        }
      }
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await storyService.getStats();
      setStats({
        total_stories: statsData.total_stories,
        total_reads: statsData.total_reads,
        total_likes: statsData.total_likes,
        avg_read_time: Math.round(statsData.avg_read_time || 0)
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  useEffect(() => {
    const initializePage = async () => {
      await loadStories();
      await loadHeroStory();
      await loadStats();
    };
    
    initializePage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-load hero story when stories are loaded (for fallback logic)
  useEffect(() => {
    if (stories.length > 0 && !featuredStory) {
      loadHeroStory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stories]);

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setFilteredStories(stories);
      return;
    }

    try {
      const searchResults = await storyService.searchStories(query);
      setFilteredStories(searchResults.results);
    } catch (error) {
      console.error('Error searching stories:', error);
      // Fallback to local filtering
      const filtered = stories.filter(story =>
        story.title.toLowerCase().includes(query.toLowerCase()) ||
        story.description.toLowerCase().includes(query.toLowerCase()) ||
        story.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase())) ||
        story.author.username.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredStories(filtered);
    }
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
                        src={featuredStory.thumbnail || '/api/placeholder/600/400'}
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
                      <p className="text-gray-300 mb-4">{featuredStory.excerpt || featuredStory.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-400 mb-6">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {featuredStory.estimated_read_time} min read
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="h-4 w-4" />
                          {featuredStory.like_count.toLocaleString()}
                        </span>
                      </div>
                      <button 
                        onClick={() => window.location.href = `/story/${featuredStory.id}`}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105"
                      >
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
              placeholder="Search stories, authors, or themes"
            />

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
              <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
                <div className="text-2xl font-bold text-purple-600 mb-2">
                  {stats.total_stories}
                </div>
                <div className="text-gray-600">Total Stories</div>
              </div>
              <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
                <div className="text-2xl font-bold text-green-600 mb-2">
                  {stats.total_reads.toLocaleString()}
                </div>
                <div className="text-gray-600">Total Reads</div>
              </div>
              <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
                <div className="text-2xl font-bold text-red-600 mb-2">
                  {stats.total_likes.toLocaleString()}
                </div>
                <div className="text-gray-600">Total Likes</div>
              </div>
              <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  {stats.avg_read_time}
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
                    thumbnail={story.thumbnail || '/api/placeholder/400/300'}
                    duration={`${story.estimated_read_time} min read`}
                    type="story"
                    tags={story.tags}
                    views={story.read_count}
                    likes={story.like_count}
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
