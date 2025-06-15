// src/components/Common/ContentCard.tsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
  Play, 
  BookOpen, 
  Heart, 
  Clock, 
  Eye, 
  ThumbsUp,
  MoreVertical,
  Bookmark,
  Share2,
  Download
} from 'lucide-react';
import type { ContentItem } from '../../types';
import type { RootState } from '../../store';
import { contentService } from '../../services/contentService';
import { uiActions } from '../../store/reducers/uiReducers';

interface ContentCardProps {
  content: ContentItem;
  viewMode?: 'grid' | 'list';
  showFavoriteButton?: boolean;
  showProgress?: boolean;
  onUnfavorite?: () => void;
  className?: string;
}

const ContentCard: React.FC<ContentCardProps> = ({
  content,
  viewMode = 'grid',
  showFavoriteButton = false,
  showProgress = false,
  onUnfavorite,
  className = ''
}) => {
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state: RootState) => state.user);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFavorited, setIsFavorited] = useState(content.isFavorited);
  const [isBookmarked, setIsBookmarked] = useState(content.isBookmarked);

  const getContentIcon = () => {
    switch (content.type) {
      case 'story':
        return BookOpen;
      case 'film':
      case 'content':
      case 'podcast':
      case 'animation':
      case 'sneak-peek':
        return Play;
      default:
        return Play;
    }
  };

  const getContentPath = () => {
    if (content.type === 'story') {
      return `/story/${content.id}`;
    }
    return `/watch/${content.type}/${content.id}`;
  };

  const getActionButtonText = () => {
    switch (content.type) {
      case 'story':
        return 'Start Reading';
      default:
        return 'Play Now';
    }
  };

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!userInfo) return;
    
    try {
      await contentService.favoriteContent(content.type, content.id);
      setIsFavorited(!isFavorited);
      
      if (showFavoriteButton && onUnfavorite && isFavorited) {
        onUnfavorite();
      }
      
      dispatch(uiActions.addNotification({
        type: 'success',
        message: isFavorited ? 'Removed from favorites' : 'Added to favorites'
      }));
    } catch (error: any) {
      dispatch(uiActions.addNotification({
        type: 'error',
        message: error.message || 'Failed to update favorites'
      }));
    }
  };

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!userInfo) return;
    
    try {
      await contentService.bookmarkContent(content.type, content.id);
      setIsBookmarked(!isBookmarked);
      
      dispatch(uiActions.addNotification({
        type: 'success',
        message: isBookmarked ? 'Removed from bookmarks' : 'Added to bookmarks'
      }));
    } catch (error: any) {
      dispatch(uiActions.addNotification({
        type: 'error',
        message: error.message || 'Failed to update bookmarks'
      }));
    }
  };

  const formatDuration = (duration: number) => {
    if (content.type === 'story') {
      return `${duration} min read`;
    }
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatProgress = (progress: number) => {
    return Math.round(progress * 100);
  };

  const Icon = getContentIcon();

  if (viewMode === 'list') {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow ${className}`}>
        <div className="flex items-center p-4">
          {/* Thumbnail */}
          <div className="relative w-24 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
            {content.thumbnail ? (
              <img
                src={content.thumbnail}
                alt={content.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-blue-100">
                <Icon className="h-6 w-6 text-purple-600" />
              </div>
            )}
            {showProgress && content.watchProgress && (
              <div className="absolute bottom-0 left-0 right-0 bg-gray-900/75">
                <div 
                  className="h-1 bg-purple-500"
                  style={{ width: `${formatProgress(content.watchProgress)}%` }}
                />
              </div>
            )}
          </div>

          {/* Content Info */}
          <div className="flex-1 ml-4 min-w-0">
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {content.title}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                  {content.description}
                </p>
                <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatDuration(content.duration)}
                  </div>
                  <div className="flex items-center">
                    <Eye className="h-3 w-3 mr-1" />
                    {content.views?.toLocaleString() || 0}
                  </div>
                  <div className="flex items-center">
                    <ThumbsUp className="h-3 w-3 mr-1" />
                    {content.likes?.toLocaleString() || 0}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2 ml-4">
                <Link
                  to={getContentPath()}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 transition-colors"
                >
                  <Icon className="h-3 w-3 mr-1" />
                  {getActionButtonText()}
                </Link>
                
                {userInfo && (
                  <>
                    <button
                      onClick={handleFavorite}
                      className={`p-1.5 rounded-full transition-colors ${
                        isFavorited 
                          ? 'text-red-500 hover:text-red-600' 
                          : 'text-gray-400 hover:text-red-500'
                      }`}
                    >
                      <Heart className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
                    </button>
                    
                    <button
                      onClick={handleBookmark}
                      className={`p-1.5 rounded-full transition-colors ${
                        isBookmarked 
                          ? 'text-blue-500 hover:text-blue-600' 
                          : 'text-gray-400 hover:text-blue-500'
                      }`}
                    >
                      <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid view (default)
  return (
    <div className={`bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group ${className}`}>
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gray-100 overflow-hidden">
        {content.thumbnail ? (
          <img
            src={content.thumbnail}
            alt={content.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-blue-100">
            <Icon className="h-12 w-12 text-purple-600" />
          </div>
        )}
        
        {/* Progress Bar */}
        {showProgress && content.watchProgress && (
          <div className="absolute bottom-0 left-0 right-0 bg-gray-900/75">
            <div 
              className="h-1 bg-purple-500"
              style={{ width: `${formatProgress(content.watchProgress)}%` }}
            />
          </div>
        )}

        {/* Overlay Actions */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <Link
            to={getContentPath()}
            className="inline-flex items-center px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full text-gray-900 font-medium hover:bg-white transition-colors"
          >
            <Icon className="h-4 w-4 mr-2" />
            {getActionButtonText()}
          </Link>
        </div>

        {/* Top Actions */}
        {userInfo && (
          <div className="absolute top-3 right-3 flex space-x-2">
            <button
              onClick={handleFavorite}
              className={`p-2 rounded-full backdrop-blur-sm transition-all ${
                isFavorited 
                  ? 'bg-red-500/90 text-white' 
                  : 'bg-white/90 text-gray-600 hover:bg-red-500/90 hover:text-white'
              }`}
            >
              <Heart className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
            </button>
            
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMenuOpen(!isMenuOpen);
                }}
                className="p-2 rounded-full bg-white/90 text-gray-600 hover:bg-white transition-colors"
              >
                <MoreVertical className="h-4 w-4" />
              </button>

              {isMenuOpen && (
                <div className="absolute top-full right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-10">
                  <button
                    onClick={handleBookmark}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Bookmark className="h-4 w-4 mr-3" />
                    {isBookmarked ? 'Remove Bookmark' : 'Add Bookmark'}
                  </button>
                  <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    <Share2 className="h-4 w-4 mr-3" />
                    Share
                  </button>
                  <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    <Download className="h-4 w-4 mr-3" />
                    Download
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Duration Badge */}
        <div className="absolute bottom-3 left-3">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-black/75 text-white backdrop-blur-sm">
            <Clock className="h-3 w-3 mr-1" />
            {formatDuration(content.duration)}
          </span>
        </div>
      </div>

      {/* Content Info */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 mb-2">
          {content.title}
        </h3>
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
          {content.description}
        </p>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              <Eye className="h-3 w-3 mr-1" />
              {content.views?.toLocaleString() || 0}
            </div>
            <div className="flex items-center">
              <ThumbsUp className="h-3 w-3 mr-1" />
              {content.likes?.toLocaleString() || 0}
            </div>
          </div>
          
          {showProgress && content.watchProgress && (
            <span className="text-purple-600 font-medium">
              {formatProgress(content.watchProgress)}% complete
            </span>
          )}
        </div>

        {/* Tags */}
        {content.tags && content.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {content.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
              >
                {tag}
              </span>
            ))}
            {content.tags.length > 3 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                +{content.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentCard;