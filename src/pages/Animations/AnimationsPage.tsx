import { useState } from 'react';
import { Palette, Sparkles, Users, Clock, Award } from 'lucide-react';
import MainLayout from '../../components/MainLayout/MainLayout';
import SearchFilter from '../../components/Common/SearchFilter';
import ContentCard from '../../components/Common/ContentCard';

// Mock data - replace with actual API calls
const mockAnimations = [
  {
    id: '1',
    title: 'Digital Dreamscape',
    description: 'A mesmerizing journey through abstract digital landscapes and geometric patterns.',
    thumbnail: 'https://images.unsplash.com/photo-1558618047-3c8347c4d814?w=400&h=600&fit=crop',
    duration: '3m 20s',
    type: 'animation' as const,
    tags: ['Abstract', 'Digital', 'Geometric'],
    views: 145000,
    likes: 12000,
    isTrending: true,
    releaseDate: '2024-11-20',
    style: '3D',
    complexity: 'Advanced'
  },
  {
    id: '2',
    title: 'Nature\'s Symphony',
    description: 'Beautiful hand-drawn animation showcasing the harmony of nature and wildlife.',
    thumbnail: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=600&fit=crop',
    duration: '4m 15s',
    type: 'animation' as const,
    tags: ['Nature', 'Hand-drawn', 'Wildlife'],
    views: 89000,
    likes: 7800,
    releaseDate: '2024-11-18',
    style: '2D',
    complexity: 'Intermediate'
  },
  {
    id: '3',
    title: 'Character Study',
    description: 'Expressive character animations demonstrating emotion and personality.',
    thumbnail: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=600&fit=crop',
    duration: '2m 45s',
    type: 'animation' as const,
    tags: ['Character', 'Emotion', 'Expression'],
    views: 78000,
    likes: 6200,
    releaseDate: '2024-11-16',
    style: '2D',
    complexity: 'Beginner'
  },
  {
    id: '4',
    title: 'Cosmic Dance',
    description: 'An otherworldly animation exploring space, planets, and celestial movements.',
    thumbnail: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=400&h=600&fit=crop',
    duration: '5m 30s',
    type: 'animation' as const,
    tags: ['Space', 'Cosmic', 'Planets'],
    views: 203000,
    likes: 18500,
    isTrending: true,
    releaseDate: '2024-11-22',
    style: '3D',
    complexity: 'Advanced'
  },
  {
    id: '5',
    title: 'Urban Pulse',
    description: 'Dynamic animation capturing the energy and rhythm of city life.',
    thumbnail: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=600&fit=crop',
    duration: '3m 50s',
    type: 'animation' as const,
    tags: ['Urban', 'City', 'Energy'],
    views: 92000,
    likes: 7400,
    releaseDate: '2024-11-19',
    style: 'Mixed',
    complexity: 'Intermediate'
  },
  {
    id: '6',
    title: 'Metamorphosis',
    description: 'Artistic transformation animation showing objects evolving into new forms.',
    thumbnail: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=600&fit=crop',
    duration: '2m 10s',
    type: 'animation' as const,
    tags: ['Transformation', 'Art', 'Evolution'],
    views: 65000,
    likes: 5100,
    releaseDate: '2024-11-15',
    style: '2D',
    complexity: 'Intermediate'
  },
  {
    id: '7',
    title: 'Liquid Motion',
    description: 'Fluid simulation showcasing the beauty of liquid dynamics and physics.',
    thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600&fit=crop',
    duration: '1m 55s',
    type: 'animation' as const,
    tags: ['Liquid', 'Physics', 'Simulation'],
    views: 134000,
    likes: 10800,
    releaseDate: '2024-11-21',
    style: '3D',
    complexity: 'Advanced'
  },
  {
    id: '8',
    title: 'Typography Dance',
    description: 'Creative kinetic typography animation with dynamic text movements.',
    thumbnail: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&h=600&fit=crop',
    duration: '2m 30s',
    type: 'animation' as const,
    tags: ['Typography', 'Kinetic', 'Text'],
    views: 56000,
    likes: 4300,
    releaseDate: '2024-11-14',
    style: '2D',
    complexity: 'Beginner'
  }
];

const styles = ['All', '2D', '3D', 'Mixed'];
const complexityLevels = ['All', 'Beginner', 'Intermediate', 'Advanced'];

const AnimationsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('newest');
  const [selectedStyle, setSelectedStyle] = useState('All');
  const [selectedComplexity, setSelectedComplexity] = useState('All');

  const availableTags = Array.from(new Set(mockAnimations.flatMap(item => item.tags)));

  const getFilteredAnimations = () => {
    let animations = [...mockAnimations];

    // Apply style filter
    if (selectedStyle !== 'All') {
      animations = animations.filter(item => item.style === selectedStyle);
    }

    // Apply complexity filter
    if (selectedComplexity !== 'All') {
      animations = animations.filter(item => item.complexity === selectedComplexity);
    }

    // Apply search filter
    if (searchTerm) {
      animations = animations.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply tag filter
    if (selectedTags.length > 0) {
      animations = animations.filter(item =>
        selectedTags.some(tag => item.tags.includes(tag))
      );
    }

    // Apply sorting
    switch (sortBy) {
      case 'most-liked':
        animations.sort((a, b) => b.likes - a.likes);
        break;
      case 'most-viewed':
        animations.sort((a, b) => b.views - a.views);
        break;
      case 'alphabetical':
        animations.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'trending':
        animations.sort((a, b) => (b.isTrending ? 1 : 0) - (a.isTrending ? 1 : 0));
        break;
      case 'oldest':
        animations.sort((a, b) => new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime());
        break;
      default:
        // newest first
        animations.sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime());
        break;
    }

    return animations;
  };

  const filteredAnimations = getFilteredAnimations();
  const featuredAnimation = mockAnimations.find(animation => animation.isTrending) || mockAnimations[0];

  const totalAnimations = mockAnimations.length;
  const totalViews = mockAnimations.reduce((sum, animation) => sum + animation.views, 0);

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-center mb-4">
                  <Palette className="h-8 w-8 text-purple-400 mr-3" />
                  <span className="text-purple-400 font-semibold">LiveLens Animations</span>
                </div>
                <h1 className="text-5xl md:text-6xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Motion & Magic
                  </span>
                </h1>
                <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                  Dive into a world of creative animations. From 2D character studies to complex 3D simulations, 
                  explore the artistry of motion graphics and visual storytelling.
                </p>
                
                {/* Stats */}
                <div className="flex flex-wrap gap-8 mb-8">
                  <div className="text-center">
                    <div className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                      {totalAnimations}+
                    </div>
                    <div className="text-sm text-gray-400">Animations</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                      {(totalViews / 1000).toFixed(0)}K+
                    </div>
                    <div className="text-sm text-gray-400">Total Views</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text text-transparent">
                      4K
                    </div>
                    <div className="text-sm text-gray-400">Quality</div>
                  </div>
                </div>

                {/* Animation Elements */}
                <div className="flex items-center space-x-4 mb-8">
                  <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
                  <div className="flex space-x-2">
                    {[...Array(8)].map((_, i) => (
                      <div
                        key={i}
                        className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 0.2}s` }}
                      />
                    ))}
                  </div>
                  <Sparkles className="w-6 h-6 text-cyan-400 animate-pulse" />
                </div>
              </div>
              
              {/* Featured Animation */}
              {featuredAnimation && (
                <div className="relative">
                  <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl">
                    <div className="aspect-[4/5] bg-gradient-to-br from-slate-800 to-slate-900 relative">
                      <img 
                        src={featuredAnimation.thumbnail} 
                        alt={featuredAnimation.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20"></div>
                      
                      {featuredAnimation.isTrending && (
                        <div className="absolute top-4 left-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center">
                          <Award className="w-4 h-4 mr-1" />
                          Featured
                        </div>
                      )}
                      
                      <div className="absolute top-4 right-4 flex space-x-2">
                        <div className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">
                          {featuredAnimation.style}
                        </div>
                        <div className="bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
                          {featuredAnimation.complexity}
                        </div>
                      </div>
                      
                      <div className="absolute bottom-6 left-6 right-6 text-white">
                        <h3 className="text-2xl font-bold mb-2">{featuredAnimation.title}</h3>
                        <p className="text-gray-200 text-sm mb-4 line-clamp-2">{featuredAnimation.description}</p>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-4">
                            <span className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {featuredAnimation.duration}
                            </span>
                            <span className="flex items-center">
                              <Users className="w-4 h-4 mr-1" />
                              {(featuredAnimation.views / 1000).toFixed(0)}K views
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

        {/* Animations Collection */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Animation Gallery</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover stunning animations across different styles and complexity levels, from beginner-friendly 2D to advanced 3D masterpieces.
            </p>
          </div>

          {/* Style and Complexity Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Animation Style</label>
              <div className="flex flex-wrap gap-2">
                {styles.map(style => (
                  <button
                    key={style}
                    onClick={() => setSelectedStyle(style)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      selectedStyle === style
                        ? 'bg-purple-500 text-white shadow-lg'
                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Complexity Level</label>
              <div className="flex flex-wrap gap-2">
                {complexityLevels.map(level => (
                  <button
                    key={level}
                    onClick={() => setSelectedComplexity(level)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      selectedComplexity === level
                        ? 'bg-green-500 text-white shadow-lg'
                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <SearchFilter
            onSearch={setSearchTerm}
            onFilter={(filters) => {
              setSelectedTags(filters.tags);
              setSortBy(filters.sortBy);
              // optionally handle filters.duration and filters.dateRange if needed
            }}
            contentType="animations"
          />

          {/* Animations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAnimations.map(animation => (
              <ContentCard
                key={animation.id}
                {...animation}
                style={animation.style}
                complexity={animation.complexity}
                type="animation"
                onLike={() => console.log(`Liked ${animation.title}`)}
              />
            ))}
          </div>

          {/* Empty State */}
          {filteredAnimations.length === 0 && (
            <div className="text-center py-12">
              <Palette className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No animations found</h3>
              <p className="text-gray-600">Try adjusting your search, style, or filter criteria.</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default AnimationsPage;