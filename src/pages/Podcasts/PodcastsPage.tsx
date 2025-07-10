import { useState, useEffect, useCallback } from 'react';
import { Headphones, Mic, TrendingUp, Users, Volume2 } from 'lucide-react';
import MainLayout from '../../components/MainLayout/MainLayout';
import SearchFilter from '../../components/Common/SearchFilter';
import ContentCard from '../../components/Common/ContentCard';
import podcastService from '../../services/podcastService';
import type { ContentItem } from '../../types';

const PodcastsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [podcasts, setPodcasts] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalEpisodes: 0,
    totalListeners: 0,
    avgDuration: 0,
  });

  // Load initial data
  useEffect(() => {
    loadStats();
  }, []);

  const loadPodcasts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        search: searchTerm || undefined,
        sortBy: '-created_at', // Re-enable ordering now that backend is fixed
        limit: 50,
      };

      const response = await podcastService.getPodcasts(params);
      setPodcasts(response.results);
    } catch (err) {
      console.error('Error loading podcasts:', err);
      setError('Failed to load podcasts. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  // Load podcasts when filters change
  useEffect(() => {
    loadPodcasts();
  }, [loadPodcasts]);

  const loadStats = async () => {
    try {
      const statsData = await podcastService.getStats();
      setStats({
        totalEpisodes: statsData.total_episodes || 0,
        totalListeners: statsData.total_plays || 0,
        avgDuration: Math.round((statsData.total_duration || 0) / 60), // Convert to minutes
      });
    } catch (err) {
      console.error('Error loading stats:', err);
      // Don't show error for stats, just use defaults
    }
  };

  const getFilteredPodcasts = () => {
    return podcasts; // Filtering is now done server-side
  };

  const filteredPodcasts = getFilteredPodcasts();
  const featuredPodcast = podcasts.find((podcast: ContentItem & { isTrending?: boolean }) => podcast.isTrending) || podcasts[0];

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
                      {stats.totalEpisodes}+
                    </div>
                    <div className="text-sm text-gray-400">Episodes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                      {(stats.totalListeners / 1000).toFixed(0)}K+
                    </div>
                    <div className="text-sm text-gray-400">Listeners</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text text-transparent">
                      {stats.avgDuration}m
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
                      {featuredPodcast.thumbnail && (
                        <img 
                          src={featuredPodcast.thumbnail} 
                          alt={featuredPodcast.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20"></div>
                      
                      {(featuredPodcast as ContentItem & { isTrending?: boolean })?.isTrending && (
                        <div className="absolute top-4 left-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center">
                          <TrendingUp className="w-4 h-4 mr-1" />
                          Trending
                        </div>
                      )}
                      
                      <div className="absolute bottom-6 left-6 right-6 text-white">
                        <div className="bg-purple-500 text-white px-2 py-1 rounded text-xs font-medium mb-2 inline-block">
                          S{(featuredPodcast as ContentItem & { season?: number, episode?: number })?.season || 1} E{(featuredPodcast as ContentItem & { season?: number, episode?: number })?.episode || 1}
                        </div>
                        <h3 className="text-2xl font-bold mb-2">{featuredPodcast.title}</h3>
                        <p className="text-gray-200 text-sm mb-4 line-clamp-2">{featuredPodcast.description}</p>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-4">
                            <span className="flex items-center">
                              <Mic className="w-4 h-4 mr-1" />
                              {featuredPodcast.duration}m
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
            placeholder="Search podcasts..."
          />

          {/* Podcasts Grid */}
          {loading ? (
            <div className="text-center py-12 mt-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading podcasts...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12 mt-8">
              <p className="text-red-600 mb-4">{error}</p>
              <button 
                onClick={loadPodcasts}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
              {filteredPodcasts.map(podcast => {
                const podcastWithExtras = podcast as ContentItem & {
                  season?: number;
                  episode?: number;
                  isTrending?: boolean;
                  releaseDate?: string;
                };
                
                return (
                  <ContentCard
                    key={podcast.id}
                    {...podcast}
                    thumbnail={podcast.thumbnail || undefined}
                    duration={`${podcast.duration}m`}
                    season={podcastWithExtras.season}
                    episode={podcastWithExtras.episode}
                  />
                );
              })}
            </div>
          )}

          {/* Empty State */}
          {filteredPodcasts.length === 0 && (
            <div className="text-center py-12 mt-8">
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