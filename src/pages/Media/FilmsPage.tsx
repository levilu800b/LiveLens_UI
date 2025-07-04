import { useState, useEffect, useCallback } from 'react';
import { Film, Award, Calendar, Star } from 'lucide-react';
import MainLayout from '../../components/MainLayout/MainLayout';
import MediaFilter, { type FilterOptions } from '../../components/Common/MediaFilter';
import ContentCard from '../../components/Common/ContentCard';
import mediaService, { type Film as FilmType } from '../../services/mediaService';

interface FilmItem {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  type: 'film';
  tags: string[];
  views: number;
  likes: number;
  isTrending?: boolean;
  releaseDate: string;
  rating: number;
}

const FilmsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('newest');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Data states
  const [films, setFilms] = useState<FilmType[]>([]);
  const [featuredFilms, setFeaturedFilms] = useState<FilmType[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  // Load films data
  useEffect(() => {
    loadFilmsData();
  }, []);

  const loadFilmsData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load films and featured films in parallel
      const [filmsResponse, featuredResponse] = await Promise.all([
        mediaService.getFilms({ page_size: 50, status: 'published' }),
        mediaService.getFeaturedFilms().catch(() => [])
      ]);

      setFilms(filmsResponse.results);
      setFeaturedFilms(featuredResponse);

      // Extract unique tags
      const allTags = new Set<string>();
      filmsResponse.results.forEach(film => {
        if (film.tags && Array.isArray(film.tags)) {
          film.tags.forEach(tag => {
            if (tag && typeof tag === 'string') {
              allTags.add(tag);
            }
          });
        }
      });
      setAvailableTags(Array.from(allTags).sort());

    } catch (err) {
      console.error('Error loading films:', err);
      setError(err instanceof Error ? err.message : 'Failed to load films');
    } finally {
      setLoading(false);
    }
  };

  // Convert API data to FilmItem format for display
  const convertToFilmItem = (film: FilmType): FilmItem => ({
    id: film.id,
    title: film.title || '',
    description: film.description || '',
    thumbnail: film.thumbnail || '',
    duration: film.duration_formatted || '0m',
    type: 'film',
    tags: film.tags || [],
    views: film.view_count || 0,
    likes: film.like_count || 0,
    isTrending: film.is_trending || false,
    releaseDate: film.published_at || film.created_at || '',
    rating: film.average_rating || 0
  });

  const getFilteredFilms = (): FilmItem[] => {
    let filmItems = films.map(convertToFilmItem);

    // Apply search filter
    if (searchTerm) {
      filmItems = filmItems.filter(item =>
        (item.title && item.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.tags && item.tags.some(tag => tag && tag.toLowerCase().includes(searchTerm.toLowerCase())))
      );
    }

    // Apply tag filter
    if (selectedTags.length > 0) {
      filmItems = filmItems.filter(item =>
        item.tags && selectedTags.some(tag => item.tags.includes(tag))
      );
    }

    // Apply sorting
    switch (sortBy) {
      case 'most-liked':
        filmItems.sort((a, b) => b.likes - a.likes);
        break;
      case 'most-viewed':
        filmItems.sort((a, b) => b.views - a.views);
        break;
      case 'alphabetical':
        filmItems.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        break;
      case 'trending':
        filmItems.sort((a, b) => (b.isTrending ? 1 : 0) - (a.isTrending ? 1 : 0));
        break;
      case 'highest-rated':
        filmItems.sort((a, b) => b.rating - a.rating);
        break;
      case 'oldest':
        filmItems.sort((a, b) => new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime());
        break;
      default:
        // newest first
        filmItems.sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime());
        break;
    }

    return filmItems;
  };

  const filteredFilms = getFilteredFilms();
  const featuredFilm = featuredFilms[0] || filteredFilms.find(film => film.isTrending) || filteredFilms[0];

  // Memoized handlers to prevent infinite re-renders in MediaFilter
  const handleSearch = useCallback((search: string) => {
    setSearchTerm(search);
  }, []);

  const handleFilter = useCallback((filters: FilterOptions) => {
    setSelectedTags(filters.tags);
    setSortBy(filters.sortBy);
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-4 h-4 fill-current text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" className="w-4 h-4 fill-current text-yellow-400 opacity-50" />);
    }

    return stars;
  };

  if (loading && films.length === 0) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading films...</p>
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
              <Film className="h-12 w-12 mx-auto mb-2" />
              <p className="text-lg font-semibold">Error Loading Films</p>
            </div>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={loadFilmsData}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-center mb-4">
                  <Film className="h-8 w-8 text-purple-400 mr-3" />
                  <span className="text-purple-400 font-semibold">LiveLens Films</span>
                </div>
                <h1 className="text-5xl md:text-6xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Cinematic Stories
                  </span>
                </h1>
                <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                  Immerse yourself in our collection of carefully crafted films. From thought-provoking dramas 
                  to thrilling adventures, discover stories that captivate and inspire.
                </p>
                
                {/* Stats */}
                <div className="flex flex-wrap gap-8 mb-8">
                  <div className="text-center">
                    <div className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                      {films.length}+
                    </div>
                    <div className="text-sm text-gray-400">Films Available</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                      4.5★
                    </div>
                    <div className="text-sm text-gray-400">Average Rating</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text text-transparent">
                      HD
                    </div>
                    <div className="text-sm text-gray-400">Quality</div>
                  </div>
                </div>
              </div>
              
              {/* Featured Film */}
              {featuredFilm && (
                <div className="relative">
                  <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl">
                    <div className="aspect-[4/5] bg-gradient-to-br from-slate-800 to-slate-900 relative">
                      <img 
                        src={featuredFilm.thumbnail} 
                        alt={featuredFilm.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20"></div>
                      
                      {featuredFilm?.is_trending && (
                        <div className="absolute top-4 left-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center">
                          <Award className="w-4 h-4 mr-1" />
                          Featured
                        </div>
                      )}
                      
                      <div className="absolute bottom-6 left-6 right-6 text-white">
                        <h3 className="text-2xl font-bold mb-2">{featuredFilm.title}</h3>
                        <div className="flex items-center mb-2">
                          {renderStars(featuredFilm?.average_rating || 0)}
                          <span className="ml-2 text-sm text-gray-300">{featuredFilm?.average_rating || 0}</span>
                        </div>
                        <p className="text-gray-200 text-sm mb-4 line-clamp-2">{featuredFilm.description}</p>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-4">
                            <span className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {formatDate(featuredFilm?.published_at || featuredFilm?.created_at || '')}
                            </span>
                            <span>{featuredFilm?.duration_formatted}</span>
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

        {/* Films Collection */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Film Collection</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore our diverse range of films, each telling a unique story and crafted with passion and creativity.
            </p>
          </div>

          {/* Search and Filters */}
          <MediaFilter
            onSearch={handleSearch}
            onFilter={handleFilter}
            contentType="film"
            availableTags={availableTags}
          />

          {/* Films Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredFilms.map(film => (
              <ContentCard
                key={film.id}
                {...film}
              />
            ))}
          </div>

          {/* Empty State */}
          {filteredFilms.length === 0 && (
            <div className="text-center py-12">
              <Film className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No films found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default FilmsPage;