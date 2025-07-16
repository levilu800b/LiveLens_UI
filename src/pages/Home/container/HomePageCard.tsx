import React, { useState, useEffect } from 'react';
import { Play, Headphones, BookOpen } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { uiActions } from '../../../store/reducers/uiReducers';
import storyService from '../../../services/storyService';
import podcastService from '../../../services/podcastService';
import mediaService from '../../../services/mediaService';
import animationService from '../../../services/animationService';
import sneakPeekService from '../../../services/sneakPeekService';
import unifiedAuth from '../../../utils/unifiedAuth';

interface ContentItem {
  id: string;
  type: 'content' | 'podcast' | 'story' | 'film' | 'animation' | 'sneakpeek';
  title: string;
  description: string;
  duration: string;
  genre?: string;
  category?: string;
  thumbnail: string;
}

interface RootState {
  user: {
    userInfo: {
      id: string;
      email: string;
      first_name: string;
      last_name: string;
    } | null;
  };
}

const getIcon = (type: string) => {
  switch (type) {
    case 'content': 
    case 'film': 
    case 'animation':
    case 'sneakpeek':
      return <Play className="w-5 h-5" />;
    case 'podcast': return <Headphones className="w-5 h-5" />;
    case 'story': return <BookOpen className="w-5 h-5" />;
    default: return <Play className="w-5 h-5" />;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'content':
    case 'film': 
      return 'from-red-500 to-pink-600';
    case 'podcast': return 'from-blue-500 to-indigo-600';
    case 'story': return 'from-green-500 to-emerald-600';
    case 'animation': return 'from-purple-500 to-violet-600';
    case 'sneakpeek': return 'from-orange-500 to-yellow-600';
    default: return 'from-gray-500 to-gray-600';
  }
};

const gridSpans = [
  'col-span-1 md:col-span-2 md:row-span-2', // Card 1: large
  'col-span-1 md:col-span-1 md:row-span-1', // Card 2: small
  'col-span-1 md:col-span-1 md:row-span-1', // Card 3: small
  'col-span-1 md:col-span-2 md:row-span-2', // Card 4: large
  'col-span-1 md:col-span-1 md:row-span-1', // Card 5: small
  'col-span-1 md:col-span-1 md:row-span-1', // Card 6: small
];

const ContentTrailerSection: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userInfo = useSelector((state: RootState) => state.user.userInfo);
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load featured content from various services
  useEffect(() => {
    const loadFeaturedContent = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch featured content from all services in parallel
        const [storiesResponse, podcastsResponse, filmsResponse, contentResponse, animationsResponse, sneakPeeksResponse] = await Promise.allSettled([
          storyService.getFeaturedStories(),
          podcastService.getFeaturedPodcasts(),
          mediaService.getFeaturedFilms(),
          mediaService.getFeaturedContent(),
          animationService.getFeaturedAnimations(),
          sneakPeekService.getFeaturedSneakPeeks()
        ]);

        // Collect all featured items from all sources
        const allItems: ContentItem[] = [];

        // Process stories
        if (storiesResponse.status === 'fulfilled' && storiesResponse.value && storiesResponse.value.length > 0) {
          const stories = storiesResponse.value
            .filter((story: any) => story.thumbnail || story.cover_image) // eslint-disable-line @typescript-eslint/no-explicit-any
            .map((story: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
              id: story.id,
              type: 'story' as const,
              title: story.title,
              description: story.description || story.short_description || story.excerpt || '',
              duration: `${story.estimated_read_time || 5}m read`,
              category: story.category || 'Story',
              thumbnail: story.thumbnail || story.cover_image,
            }));
          allItems.push(...stories);
        }

        // Process podcasts
        if (podcastsResponse.status === 'fulfilled' && podcastsResponse.value && podcastsResponse.value.length > 0) {
          const podcasts = podcastsResponse.value
            .filter((podcast: any) => podcast.thumbnail) // eslint-disable-line @typescript-eslint/no-explicit-any
            .map((podcast: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
              id: podcast.id,
              type: 'podcast' as const,
              title: podcast.title,
              description: podcast.description || '',
              duration: `${podcast.duration || 30}m`,
              category: podcast.category || 'Podcast',
              thumbnail: podcast.thumbnail,
            }));
          allItems.push(...podcasts);
        }

        // Process films
        if (filmsResponse.status === 'fulfilled' && filmsResponse.value && filmsResponse.value.length > 0) {
          const films = filmsResponse.value
            .filter((film: any) => film.thumbnail) // eslint-disable-line @typescript-eslint/no-explicit-any
            .map((film: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
              id: film.id,
              type: 'film' as const,
              title: film.title,
              description: film.description || film.short_description || '',
              duration: film.duration_formatted || '2h',
              category: film.category || 'Film',
              thumbnail: film.thumbnail,
            }));
          allItems.push(...films);
        }

        // Process content
        if (contentResponse.status === 'fulfilled' && contentResponse.value && contentResponse.value.length > 0) {
          const content = contentResponse.value
            .filter((item: any) => item.thumbnail) // eslint-disable-line @typescript-eslint/no-explicit-any
            .map((item: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
              id: item.id,
              type: 'content' as const,
              title: item.title,
              description: item.description || item.short_description || '',
              duration: item.duration_formatted || '1h',
              category: item.category || 'Content',
              thumbnail: item.thumbnail,
            }));
          allItems.push(...content);
        }

        // Process animations
        if (animationsResponse.status === 'fulfilled' && animationsResponse.value && animationsResponse.value.length > 0) {
          const animations = animationsResponse.value
            .filter((animation: any) => animation.thumbnail) // eslint-disable-line @typescript-eslint/no-explicit-any
            .map((animation: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
              id: animation.id,
              type: 'animation' as const,
              title: animation.title,
              description: animation.description || animation.short_description || '',
              duration: animation.duration_formatted || '10m',
              category: animation.category || 'Animation',
              thumbnail: animation.thumbnail,
            }));
          allItems.push(...animations);
        }

        // Process sneak peeks
        if (sneakPeeksResponse.status === 'fulfilled' && sneakPeeksResponse.value && sneakPeeksResponse.value.length > 0) {
          const sneakPeeks = sneakPeeksResponse.value
            .filter((sneakPeek: any) => sneakPeek.thumbnail) // eslint-disable-line @typescript-eslint/no-explicit-any
            .map((sneakPeek: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
              id: sneakPeek.id,
              type: 'sneakpeek' as const,
              title: sneakPeek.title,
              description: sneakPeek.description || sneakPeek.short_description || '',
              duration: sneakPeek.duration_formatted || '5m',
              category: sneakPeek.category || 'Sneak Peek',
              thumbnail: sneakPeek.thumbnail,
            }));
          allItems.push(...sneakPeeks);
        }

        // Shuffle all items randomly and take exactly 6 (or all if less than 6)
        const shuffledItems = allItems.sort(() => Math.random() - 0.5);
        const finalItems = shuffledItems.slice(0, 6);

        setContentItems(finalItems);
      } catch {
        setError('Failed to load featured content');
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedContent();
  }, []);

  // Check if user is authenticated
  const isAuthenticated = () => {
    return unifiedAuth.isAuthenticated() && userInfo;
  };

  // Handle Play Now action with authentication check
  const handlePlayNow = (item: ContentItem) => {
    if (!isAuthenticated()) {
      dispatch(uiActions.addNotification({
        message: 'Please login to access content',
        type: 'info'
      }));
      navigate('/login');
      return;
    }

    // Navigate to appropriate page based on content type
    switch (item.type) {
      case 'story':
        navigate(`/story/${item.id}`);
        break;
      case 'podcast':
        navigate(`/podcast/${item.id}`);
        break;
      case 'film':
        navigate(`/watch/film/${item.id}`);
        break;
      case 'content':
        navigate(`/watch/content/${item.id}`);
        break;
      case 'animation':
        navigate(`/animation/${item.id}`);
        break;
      case 'sneakpeek':
        navigate(`/sneak-peek/${item.id}`);
        break;
      default:
        dispatch(uiActions.addNotification({
          message: `Play Now: ${item.title}`,
          type: 'info'
        }));
    }
  };

  // Handle Read Story action with authentication check
  const handleReadStory = (item: ContentItem) => {
    if (!isAuthenticated()) {
      dispatch(uiActions.addNotification({
        message: 'Please login to read stories',
        type: 'info'
      }));
      navigate('/login');
      return;
    }

    navigate(`/story/${item.id}`);
  };

  return (
    <div className="min-h-screen bg-white py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-2">Featured Content</h2>
          <p className="text-gray-500">Explore our curated selection of stories, podcasts, and films</p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading featured content...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Content Grid */}
        {!loading && !error && contentItems.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 auto-rows-[220px] md:auto-rows-[200px] lg:auto-rows-[250px] gap-6">
            {contentItems.map((item, idx) => (
              <div
                key={item.id}
                className={`group relative rounded-2xl overflow-hidden border border-slate-200 hover:border-purple-500 transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-400 ${gridSpans[idx % gridSpans.length]}`}
              >
                {/* Card image and hover animation */}
                <div className={`absolute inset-0 w-full h-full z-0 transition-transform duration-500
                  ${item.type !== 'story' ? 'group-hover:-translate-y-2 group-hover:scale-105' : ''}
                `}>
                  <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                </div>

                {/* Card badge */}
                <div className={`absolute top-4 left-4 px-3 py-1 rounded-full bg-gradient-to-r ${getTypeColor(item.type)} text-white text-xs font-semibold flex items-center gap-2 shadow-md z-10`}>
                  {getIcon(item.type)}
                  {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                </div>

                {/* Card content with hover animation for non-story types */}
                <div className={`absolute bottom-4 left-4 right-4 text-white z-10 transition-transform duration-500
                  ${item.type !== 'story' ? 'group-hover:-translate-y-2' : ''}
                `}>
                  <h3 className="text-lg font-bold">{item.title}</h3>
                  <p className="text-sm text-gray-200 line-clamp-2 mb-3">{item.description}</p>
                  {/* Buttons */}
                  {item.type === 'story' ? (
                    <button
                      onClick={() => handleReadStory(item)}
                      className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-semibold shadow transition"
                      type="button"
                    >
                      Start Reading
                    </button>
                  ) : (
                    <button
                      onClick={() => handlePlayNow(item)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold shadow transition"
                      type="button"
                    >
                      <Play className="w-4 h-4" /> Play Now
                    </button>
                  )}
                </div>

                {/* Optional: Play icon overlay for non-story types */}
                {item.type !== 'story' && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition bg-black/30 z-0">
                    <Play className="w-12 h-12 text-white drop-shadow-lg" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && contentItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No featured content available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentTrailerSection;
