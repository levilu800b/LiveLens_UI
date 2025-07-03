import { useState } from 'react';
import { Film, Award, Calendar, Star } from 'lucide-react';
import MainLayout from '../../components/MainLayout/MainLayout';
import SearchFilter from '../../components/Common/SearchFilter';
import ContentCard from '../../components/Common/ContentCard';

// Mock data - replace with actual API calls
const mockFilms = [
  {
    id: '1',
    title: 'Digital Dreams',
    description: 'A journey through the future of technology and human connection in a world where digital and reality merge.',
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=600&fit=crop',
    duration: '2h 15m',
    type: 'film' as const,
    tags: ['Sci-Fi', 'Drama', 'Technology'],
    views: 125000,
    likes: 8500,
    isTrending: true,
    releaseDate: '2024-10-15',
    rating: 4.8
  },
  {
    id: '2',
    title: 'Ocean\'s Whisper',
    description: 'An underwater adventure exploring the mysteries of the deep sea and the creatures that call it home.',
    thumbnail: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=600&fit=crop',
    duration: '1h 45m',
    type: 'film' as const,
    tags: ['Adventure', 'Nature', 'Documentary'],
    views: 89000,
    likes: 6200,
    releaseDate: '2024-09-20',
    rating: 4.5
  },
  {
    id: '3',
    title: 'Midnight Chronicles',
    description: 'A thrilling mystery that unfolds through the dark streets of a city that never sleeps.',
    thumbnail: 'https://images.unsplash.com/photo-1489599440998-0c7eaad21187?w=400&h=600&fit=crop',
    duration: '1h 58m',
    type: 'film' as const,
    tags: ['Thriller', 'Mystery', 'Crime'],
    views: 156000,
    likes: 12000,
    releaseDate: '2024-11-05',
    rating: 4.9
  },
  {
    id: '4',
    title: 'Canvas of Life',
    description: 'An artistic journey following a painter who discovers that their art has the power to change reality.',
    thumbnail: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=600&fit=crop',
    duration: '2h 30m',
    type: 'film' as const,
    tags: ['Drama', 'Art', 'Fantasy'],
    views: 78000,
    likes: 5900,
    releaseDate: '2024-08-12',
    rating: 4.3
  },
  {
    id: '5',
    title: 'Beyond the Horizon',
    description: 'A space exploration epic that takes us to the edge of known universe and beyond.',
    thumbnail: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=400&h=600&fit=crop',
    duration: '2h 42m',
    type: 'film' as const,
    tags: ['Sci-Fi', 'Space', 'Adventure'],
    views: 203000,
    likes: 15600,
    isTrending: true,
    releaseDate: '2024-12-01',
    rating: 4.7
  },
  {
    id: '6',
    title: 'The Last Garden',
    description: 'In a post-apocalyptic world, a botanist fights to preserve the last remaining garden on Earth.',
    thumbnail: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=600&fit=crop',
    duration: '1h 52m',
    type: 'film' as const,
    tags: ['Post-Apocalyptic', 'Drama', 'Nature'],
    views: 92000,
    likes: 7800,
    releaseDate: '2024-07-18',
    rating: 4.4
  }
];

const FilmsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('newest');

  const availableTags = Array.from(new Set(mockFilms.flatMap(item => item.tags)));

  const getFilteredFilms = () => {
    let films = [...mockFilms];

    // Apply search filter
    if (searchTerm) {
      films = films.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply tag filter
    if (selectedTags.length > 0) {
      films = films.filter(item =>
        selectedTags.some(tag => item.tags.includes(tag))
      );
    }

    // Apply sorting
    switch (sortBy) {
      case 'most-liked':
        films.sort((a, b) => b.likes - a.likes);
        break;
      case 'most-viewed':
        films.sort((a, b) => b.views - a.views);
        break;
      case 'alphabetical':
        films.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'trending':
        films.sort((a, b) => (b.isTrending ? 1 : 0) - (a.isTrending ? 1 : 0));
        break;
      case 'oldest':
        films.sort((a, b) => new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime());
        break;
      default:
        // newest first
        films.sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime());
        break;
    }

    return films;
  };

  const filteredFilms = getFilteredFilms();
  const featuredFilm = mockFilms.find(film => film.isTrending) || mockFilms[0];

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
                      {mockFilms.length}+
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
                      
                      {featuredFilm.isTrending && (
                        <div className="absolute top-4 left-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center">
                          <Award className="w-4 h-4 mr-1" />
                          Featured
                        </div>
                      )}
                      
                      <div className="absolute bottom-6 left-6 right-6 text-white">
                        <h3 className="text-2xl font-bold mb-2">{featuredFilm.title}</h3>
                        <div className="flex items-center mb-2">
                          {renderStars(featuredFilm.rating)}
                          <span className="ml-2 text-sm text-gray-300">{featuredFilm.rating}</span>
                        </div>
                        <p className="text-gray-200 text-sm mb-4 line-clamp-2">{featuredFilm.description}</p>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-4">
                            <span className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {formatDate(featuredFilm.releaseDate)}
                            </span>
                            <span>{featuredFilm.duration}</span>
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
          <SearchFilter
  onSearch={setSearchTerm}
  onFilter={(filters) => {
    setSelectedTags(filters.tags);
    setSortBy(filters.sortBy);
    // optionally handle filters.duration and filters.dateRange if needed
  }}
  contentType="film"
/>

          {/* Films Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredFilms.map(film => (
              <ContentCard
                key={film.id}
                {...film}
                onLike={(id) => {}}
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