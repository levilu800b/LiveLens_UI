import { useState } from 'react';
import { Eye, Camera, Users, Clock, Star, Film, Clapperboard } from 'lucide-react';
import MainLayout from '../../components/MainLayout/MainLayout';
import SearchFilter from '../../components/Common/SearchFilter';
import ContentCard from '../../components/Common/ContentCard';

// Mock data for sneak peeks - replace with actual API calls
const mockSneakPeeks = [
  {
    id: '1',
    title: 'Making of Digital Dreamscape',
    description: 'Go behind the scenes of our most ambitious 3D animation project. See the creative process, technical challenges, and artistic decisions that brought this digital world to life.',
    thumbnail: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=600&fit=crop',
    duration: '8m 45s',
    type: 'sneak-peek' as const,
    tags: ['Animation', 'Behind-the-Scenes', '3D', 'Creative Process'],
    views: 89000,
    likes: 7200,
    isFeatured: true,
    releaseDate: '2024-11-22',
    category: 'Animation',
    crew: 'Animation Team'
  },
  {
    id: '2',
    title: 'Podcast Studio Setup',
    description: 'Take a tour of our state-of-the-art podcast recording studio. Learn about the equipment, acoustics, and setup that makes our audio content sound professional.',
    thumbnail: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400&h=600&fit=crop',
    duration: '5m 30s',
    type: 'sneak-peek' as const,
    tags: ['Podcast', 'Studio', 'Audio', 'Equipment'],
    views: 65000,
    likes: 4800,
    releaseDate: '2024-11-20',
    category: 'Production',
    crew: 'Audio Team'
  },
  {
    id: '3',
    title: 'Character Design Process',
    description: 'Watch our artists create memorable characters from initial sketches to final designs. See the iteration process and creative decisions behind beloved characters.',
    thumbnail: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=600&fit=crop',
    duration: '12m 15s',
    type: 'sneak-peek' as const,
    tags: ['Character Design', 'Art', 'Creative', 'Process'],
    views: 124000,
    likes: 9800,
    isFeatured: true,
    releaseDate: '2024-11-18',
    category: 'Design',
    crew: 'Design Team'
  },
  {
    id: '4',
    title: 'Voice Acting Sessions',
    description: 'Step into the recording booth with our talented voice actors. Experience the magic of bringing characters to life through voice and emotion.',
    thumbnail: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&h=600&fit=crop',
    duration: '7m 20s',
    type: 'sneak-peek' as const,
    tags: ['Voice Acting', 'Recording', 'Performance', 'Audio'],
    views: 78000,
    likes: 6100,
    releaseDate: '2024-11-16',
    category: 'Performance',
    crew: 'Voice Cast'
  },
  {
    id: '5',
    title: 'Story Development Workshop',
    description: 'Join our writers in brainstorming sessions where stories come to life. See how ideas evolve from concepts to compelling narratives.',
    thumbnail: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&h=600&fit=crop',
    duration: '10m 05s',
    type: 'sneak-peek' as const,
    tags: ['Writing', 'Story', 'Development', 'Creative'],
    views: 56000,
    likes: 4200,
    releaseDate: '2024-11-14',
    category: 'Writing',
    crew: 'Writing Team'
  },
  {
    id: '6',
    title: 'Motion Capture Magic',
    description: 'Discover how we capture realistic movements for our 3D animations. From suit setup to data processing, see the technology in action.',
    thumbnail: 'https://images.unsplash.com/photo-1551731409-43eb3e517a1a?w=400&h=600&fit=crop',
    duration: '9m 30s',
    type: 'sneak-peek' as const,
    tags: ['Motion Capture', 'Technology', '3D', 'Animation'],
    views: 95000,
    likes: 7600,
    releaseDate: '2024-11-12',
    category: 'Technology',
    crew: 'Tech Team'
  },
  {
    id: '7',
    title: 'Set Design Timelapse',
    description: 'Watch virtual sets come to life in fast-forward. See the meticulous detail that goes into creating immersive digital environments.',
    thumbnail: 'https://images.unsplash.com/photo-1515378791036-0648a814c963?w=400&h=600&fit=crop',
    duration: '4m 45s',
    type: 'sneak-peek' as const,
    tags: ['Set Design', 'Environment', 'Digital', 'Timelapse'],
    views: 73000,
    likes: 5400,
    releaseDate: '2024-11-10',
    category: 'Design',
    crew: 'Environment Team'
  },
  {
    id: '8',
    title: 'Team Collaboration',
    description: 'See how our diverse creative teams work together to bring projects from concept to completion. Experience our collaborative culture.',
    thumbnail: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=600&fit=crop',
    duration: '6m 15s',
    type: 'sneak-peek' as const,
    tags: ['Teamwork', 'Collaboration', 'Culture', 'Process'],
    views: 42000,
    likes: 3200,
    releaseDate: '2024-11-08',
    category: 'Culture',
    crew: 'Full Team'
  }
];

const categories = ['All', 'Animation', 'Production', 'Design', 'Performance', 'Writing', 'Technology', 'Culture'];

const SneakPeeksPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('newest');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const availableTags = Array.from(new Set(mockSneakPeeks.flatMap(item => item.tags)));

  const getFilteredSneakPeeks = () => {
    let sneakPeeks = [...mockSneakPeeks];

    // Apply category filter
    if (selectedCategory !== 'All') {
      sneakPeeks = sneakPeeks.filter(item => item.category === selectedCategory);
    }

    // Apply search filter
    if (searchTerm) {
      sneakPeeks = sneakPeeks.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
        item.crew.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply tag filter
    if (selectedTags.length > 0) {
      sneakPeeks = sneakPeeks.filter(item =>
        selectedTags.some(tag => item.tags.includes(tag))
      );
    }

    // Apply sorting
    switch (sortBy) {
      case 'most-liked':
        sneakPeeks.sort((a, b) => b.likes - a.likes);
        break;
      case 'most-viewed':
        sneakPeeks.sort((a, b) => b.views - a.views);
        break;
      case 'alphabetical':
        sneakPeeks.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'featured':
        sneakPeeks.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
        break;
      case 'oldest':
        sneakPeeks.sort((a, b) => new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime());
        break;
      default:
        // newest first
        sneakPeeks.sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime());
        break;
    }

    return sneakPeeks;
  };

  const filteredSneakPeeks = getFilteredSneakPeeks();
  const featuredSneakPeek = mockSneakPeeks.find(peek => peek.isFeatured) || mockSneakPeeks[0];

  const totalSneakPeeks = mockSneakPeeks.length;
  const totalViews = mockSneakPeeks.reduce((sum, peek) => sum + peek.views, 0);
  const avgDuration = Math.round(
    mockSneakPeeks.reduce((sum, peek) => {
      const minutes = peek.duration.includes('m') ? parseInt(peek.duration.split('m')[0]) : 0;
      const seconds = peek.duration.includes('s') ? parseInt(peek.duration.split('m')[1]?.replace('s', '') || '0') : 0;
      return sum + minutes + (seconds / 60);
    }, 0) / mockSneakPeeks.length
  );

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-center mb-4">
                  <Camera className="h-8 w-8 text-indigo-400 mr-3" />
                  <span className="text-indigo-400 font-semibold">LiveLens Sneak Peeks</span>
                </div>
                <h1 className="text-5xl md:text-6xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                    Behind the Magic
                  </span>
                </h1>
                <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                  Get exclusive access to our creative process. From initial concepts to final production, 
                  discover the artistry, technology, and passion that brings our content to life.
                </p>
                
                {/* Stats */}
                <div className="flex flex-wrap gap-8 mb-8">
                  <div className="text-center">
                    <div className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
                      {totalSneakPeeks}+
                    </div>
                    <div className="text-sm text-gray-400">Exclusive Videos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                      {(totalViews / 1000).toFixed(0)}K+
                    </div>
                    <div className="text-sm text-gray-400">Total Views</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                      {avgDuration.toFixed(0)}m
                    </div>
                    <div className="text-sm text-gray-400">Avg. Length</div>
                  </div>
                </div>

                {/* Creative Elements */}
                <div className="flex items-center space-x-4 mb-8">
                  <Film className="w-6 h-6 text-indigo-400 animate-pulse" />
                  <div className="flex space-x-2">
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className="w-2 h-6 bg-gradient-to-t from-indigo-500 to-purple-500 rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                  <Clapperboard className="w-6 h-6 text-purple-400 animate-pulse" />
                </div>
              </div>
              
              {/* Featured Sneak Peek */}
              {featuredSneakPeek && (
                <div className="relative">
                  <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl">
                    <div className="aspect-[4/5] bg-gradient-to-br from-slate-800 to-slate-900 relative">
                      <img 
                        src={featuredSneakPeek.thumbnail} 
                        alt={featuredSneakPeek.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20"></div>
                      
                      {featuredSneakPeek.isFeatured && (
                        <div className="absolute top-4 left-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center">
                          <Star className="w-4 h-4 mr-1" />
                          Featured
                        </div>
                      )}
                      
                      <div className="absolute top-4 right-4 bg-indigo-500 text-white px-2 py-1 rounded text-xs font-medium">
                        {featuredSneakPeek.category}
                      </div>
                      
                      <div className="absolute bottom-6 left-6 right-6 text-white">
                        <h3 className="text-2xl font-bold mb-2">{featuredSneakPeek.title}</h3>
                        <p className="text-gray-200 text-sm mb-4 line-clamp-2">{featuredSneakPeek.description}</p>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-4">
                            <span className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {featuredSneakPeek.duration}
                            </span>
                            <span className="flex items-center">
                              <Users className="w-4 h-4 mr-1" />
                              {(featuredSneakPeek.views / 1000).toFixed(0)}K views
                            </span>
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-gray-300">
                          By {featuredSneakPeek.crew}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sneak Peeks Collection */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Behind the Scenes</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore the creative journey behind our content. From brainstorming sessions to final touches, 
              witness the dedication and artistry of our talented teams.
            </p>
          </div>

          {/* Category Filters */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-3">Content Category</label>
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedCategory === category
                      ? 'bg-indigo-500 text-white shadow-lg'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Search and Filters */}
          <SearchFilter
            onSearch={setSearchTerm}
            onFilter={(filters) => {
              setSelectedTags(filters.tags);
              setSortBy(filters.sortBy);
            }}
            contentType="sneak-peek"
            placeholder="Search behind-the-scenes content..."
          />

          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
              <div className="text-2xl font-bold text-indigo-600 mb-2">
                {filteredSneakPeeks.length}
              </div>
              <div className="text-gray-600">Available Videos</div>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
              <div className="text-2xl font-bold text-green-600 mb-2">
                {categories.length - 1}
              </div>
              <div className="text-gray-600">Categories</div>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
              <div className="text-2xl font-bold text-purple-600 mb-2">
                {mockSneakPeeks.filter(peek => peek.isFeatured).length}
              </div>
              <div className="text-gray-600">Featured</div>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
              <div className="text-2xl font-bold text-orange-600 mb-2">
                HD
              </div>
              <div className="text-gray-600">Quality</div>
            </div>
          </div>

          {/* Sneak Peeks Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredSneakPeeks.map(sneakPeek => (
              <ContentCard
                key={sneakPeek.id}
                {...sneakPeek}
                category={sneakPeek.category}
                isTrailerAvailable={false}
                onLike={(id) => {}}
              />
            ))}
          </div>

          {/* Empty State */}
          {filteredSneakPeeks.length === 0 && (
            <div className="text-center py-12">
              <Camera className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No sneak peeks found</h3>
              <p className="text-gray-600">Try adjusting your search, category, or filter criteria.</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default SneakPeeksPage;