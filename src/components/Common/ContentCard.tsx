import React from 'react';
import { Play, BookOpen, Heart, Eye, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

interface ContentCardProps {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  type: 'story' | 'film' | 'content' | 'podcast' | 'animation' | 'sneak-peek';
  tags: string[];
  views?: number;
  likes?: number;
  isTrailerAvailable?: boolean;
  size?: 'small' | 'medium' | 'large';
  featured?: boolean;
  // New props for podcast episode info
  season?: number;
  episode?: number;
  // New props for animation info
  style?: string;
  complexity?: string;
  // New props for sneak peek info
  category?: string;
}

interface RootState {
  user: {
    userInfo: unknown;
  };
}

const ContentCard: React.FC<ContentCardProps> = ({
  id,
  title,
  description,
  thumbnail,
  duration,
  type,
  tags,
  views = 0,
  likes = 0,
  isTrailerAvailable = true,
  size = 'medium',
  featured = false,
  season,
  episode,
  style,
  complexity,
  category
}) => {
  const navigate = useNavigate();
  const userInfo = useSelector((state: RootState) => state.user.userInfo);



  const handleTrailerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!userInfo) {
      navigate('/login');
      return;
    }
    
    if (type === 'film' || type === 'content') {
      navigate(`/watch/${type}/${id}?trailer=true`);
    }
  };

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!userInfo) {
      navigate('/login');
      return;
    }
    
    if (type === 'story') {
      navigate(`/story/${id}`);
    } else {
      navigate(`/watch/${type}/${id}`);
    }
  };

  const getSizeClasses = () => {
    if (featured) {
      return 'col-span-1 md:col-span-2 lg:col-span-3 row-span-2';
    }
    
    switch (size) {
      case 'small':
        return 'col-span-1';
      case 'large':
        return 'col-span-1 md:col-span-2';
      default:
        return 'col-span-1';
    }
  };

  return (
    <div 
      className={`group relative rounded-2xl overflow-hidden border border-slate-200 hover:border-purple-500 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-400 cursor-pointer ${getSizeClasses()} flex flex-col h-full`}
      onClick={() => handlePlayClick({ stopPropagation: () => {} } as React.MouseEvent)}
    >
      {/* Thumbnail */}
      <div className="relative w-full h-64 md:h-80 lg:h-96 overflow-hidden flex-shrink-0">
        <img 
          src={thumbnail} 
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
        
        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
            <Play className="w-8 h-8 text-white ml-1" />
          </div>
        </div>
        
        {/* Episode Badge - Top Left for podcasts */}
        {season && episode && (
          <div className="absolute top-4 left-4 bg-purple-500 text-white px-2 py-1 rounded text-xs font-medium">
            S{season} E{episode}
          </div>
        )}
        
        {/* Animation Style and Complexity Badges - Top Right for animations */}
        {style && complexity && (
          <div className="absolute top-4 right-4 flex flex-col gap-1">
            <div className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">
              {style}
            </div>
            <div className="bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
              {complexity}
            </div>
          </div>
        )}
        
        {/* Category Badge - Top Right for sneak peeks */}
        {category && (
          <div className="absolute top-4 right-4 bg-indigo-500 text-white px-2 py-1 rounded text-xs font-medium">
            {category}
          </div>
        )}
        
        {/* Duration - Only show if not an animation or sneak peek with special badges */}
        {!style && !complexity && !category && (
          <div className="absolute top-4 right-4 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-md text-white text-xs flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {duration}
          </div>
        )}
        
        {/* Duration for animations - positioned below style/complexity badges */}
        {style && complexity && (
          <div className="absolute top-20 right-4 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-md text-white text-xs flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {duration}
          </div>
        )}
        
        {/* Duration for sneak peeks - positioned below category badge */}
        {category && (
          <div className="absolute top-12 right-4 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-md text-white text-xs flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {duration}
          </div>
        )}
        
        {/* Featured Badge */}
        {featured && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold rounded-full">
            FEATURED
          </div>
        )}
      </div>
      
      {/* Content - Flex grow to fill remaining space */}
      <div className="p-4 md:p-6 flex-grow flex flex-col">
        <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 line-clamp-2">
          {title}
        </h3>
        
        <p className="text-gray-600 text-sm md:text-base mb-4 line-clamp-3 flex-grow">
          {description}
        </p>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.slice(0, 3).map((tag, index) => (
            <span 
              key={index}
              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
        
        {/* Stats */}
        <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {views.toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              {likes.toLocaleString()}
            </span>
          </div>
        </div>
        
        {/* Action Buttons - At the bottom */}
        <div className="flex gap-2 mt-auto">
          {type === 'story' ? (
            <button
              onClick={handlePlayClick}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2"
            >
              <BookOpen className="h-4 w-4" />
              Start Reading
            </button>
          ) : (
            <>
              {isTrailerAvailable && (
                <button
                  onClick={handleTrailerClick}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Play className="h-4 w-4" />
                  Trailer
                </button>
              )}
              <button
                onClick={handlePlayClick}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Play className="h-4 w-4" />
                Play Now
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentCard;