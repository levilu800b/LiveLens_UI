// src/pages/Stories/StoryReaderPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Heart, 
  MessageCircle, 
  Bookmark, 
  Share2, 
  Eye,
  Clock,
  ChevronLeft,
  ChevronRight,
  User,
  Calendar,
  ThumbsUp,
  Send
} from 'lucide-react';
import { useSelector } from 'react-redux';
import storyService from '../../services/storyService';
import commentService from '../../services/commentService';
import MainLayout from '../../components/MainLayout/MainLayout';
import type { Story } from '../../services/storyService';
import type { Comment } from '../../services/commentService';
import { config } from '../../config';

interface RootState {
  user: {
    userInfo: {
      id: string;
      username: string;
      first_name: string;
      last_name: string;
      avatar?: string;
    } | null;
  };
}

// Helper function to get full avatar URL
const getFullAvatarUrl = (avatarUrl: string | null | undefined): string | undefined => {
  if (!avatarUrl) return undefined;
  // If it's already a full URL, return as is
  if (avatarUrl.startsWith('http')) return avatarUrl;
  // If it's a relative path, prepend the backend URL
  return `${config.backendUrl}${avatarUrl}`;
};

const StoryReaderPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const userInfo = useSelector((state: RootState) => state.user.userInfo);
  
  const [story, setStory] = useState<Story | null>(null);
  const [paginatedContent, setPaginatedContent] = useState<Array<{
    content: string;
    wordCount: number;
    title?: string;
    image?: string;
  }>>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  
  // Comments state
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  
  // Reading progress tracking
  const [startTime] = useState<number>(Date.now());
  const pageRef = useRef<HTMLDivElement>(null);

  // Split content into 5000-word chunks
  const splitContentIntoPages = (content: string, maxWordsPerPage: number = 5000) => {
    // Remove HTML tags for word counting but keep them for display
    const textContent = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const words = textContent.split(' ');
    
    if (words.length <= maxWordsPerPage) {
      return [{ content, wordCount: words.length }];
    }

    const pages: Array<{ content: string; wordCount: number }> = [];
    const contentWithSpaces = content.replace(/>\s*</g, '> <'); // Add spaces between tags
    const contentWords = contentWithSpaces.split(' ');
    
    let currentPageContent: string[] = [];
    let currentWordCount = 0;

    for (let i = 0; i < contentWords.length; i++) {
      const word = contentWords[i];
      const wordText = word.replace(/<[^>]*>/g, '').trim();
      
      if (wordText && currentWordCount >= maxWordsPerPage) {
        // Save current page
        pages.push({
          content: currentPageContent.join(' '),
          wordCount: currentWordCount
        });
        
        // Start new page
        currentPageContent = [word];
        currentWordCount = wordText ? 1 : 0;
      } else {
        currentPageContent.push(word);
        if (wordText) {
          currentWordCount++;
        }
      }
    }

    // Add the last page if it has content
    if (currentPageContent.length > 0) {
      pages.push({
        content: currentPageContent.join(' '),
        wordCount: currentWordCount
      });
    }

    return pages;
  };

  // Combine all story pages and split by word count
  const loadStory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!id) {
        throw new Error('Story ID is required');
      }

      const storyData = await storyService.getStory(id);
      setStory(storyData);

      // Use the main content field and split it into 5000-word pages
      if (storyData.content && storyData.content.trim()) {
        const wordBasedPages = splitContentIntoPages(storyData.content, 5000);
        setPaginatedContent(wordBasedPages);
        setTotalPages(wordBasedPages.length);
      } else {
        console.warn('No content found in story');
        // Create a placeholder if no content is available
        setPaginatedContent([{ 
          content: '<p>This story has no content available.</p>', 
          wordCount: 7 
        }]);
        setTotalPages(1);
      }

    } catch (err) {
      console.error('Error loading story:', err);
      setError(err instanceof Error ? err.message : 'Failed to load story');
    } finally {
      setLoading(false);
    }
  };

  // Set initial page based on reading progress after totalPages is set
  useEffect(() => {
    if (story?.reading_progress?.last_page_read && totalPages > 0) {
      setCurrentPage(Math.min(story.reading_progress.last_page_read, totalPages));
    }
  }, [story, totalPages]);

  const loadComments = async (signal?: AbortSignal) => {
    if (!id) return;
    
    try {
      setCommentsLoading(true);
      
      // Check if request was cancelled
      if (signal?.aborted) return;
      
      const commentsData = await commentService.getStoryComments(id, 1, 20, signal);
      
      // Check again if request was cancelled after the async operation
      if (signal?.aborted) return;
      
      // Ensure we have the results array
      const commentsArray = commentsData.results || [];
      setComments(commentsArray);
      
      // Update story comment count if it differs
      if (story && commentsData.count !== story.comment_count) {
        setStory(prev => prev ? { ...prev, comment_count: commentsData.count } : null);
      }
    } catch (err) {
      // Don't log errors if the request was aborted
      if (err instanceof Error && err.name === 'AbortError') return;
      if (signal?.aborted) return;
      console.error('Error loading comments:', err);
      // Don't show error to user for comments loading failure
    } finally {
      if (!signal?.aborted) {
        setCommentsLoading(false);
      }
    }
  };

  const trackReadingProgress = async () => {
    if (!story || !userInfo) return;

    try {
      await storyService.interactWithStory(story.id, 'read', {
        last_page_read: currentPage,
        reading_progress: Math.round((currentPage / totalPages) * 100)
      });

      // Track view time
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      await storyService.trackStoryView(story.id, {
        time_spent: timeSpent,
        pages_viewed: [currentPage]
      });
    } catch (err) {
      console.error('Error tracking reading progress:', err);
    }
  };

  useEffect(() => {
    const abortController = new AbortController();
    
    if (id) {
      loadStory();
      loadComments(abortController.signal);
    }
    
    // Cleanup function to cancel requests if component unmounts or dependencies change
    return () => {
      abortController.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, userInfo]);

  useEffect(() => {
    // Track page view and reading progress when page changes
    if (story && currentPage > 0) {
      trackReadingProgress();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, story]);

  const handleLike = async () => {
    if (!story || !userInfo) {
      navigate('/login');
      return;
    }

    try {
      await storyService.interactWithStory(story.id, 'like');
      
      // Optimistically update the UI
      setStory(prev => {
        if (!prev) return null;
        const newStory = {
          ...prev,
          is_liked: !prev.is_liked,
          like_count: prev.is_liked ? prev.like_count - 1 : prev.like_count + 1
        };
        return newStory;
      });
    } catch (err) {
      console.error('Error liking story:', err);
      alert(`Failed to ${story.is_liked ? 'unlike' : 'like'} story. Please try again.`);
    }
  };

  const handleBookmark = async () => {
    if (!story || !userInfo) {
      navigate('/login');
      return;
    }

    try {
      await storyService.interactWithStory(story.id, 'bookmark');
      
      setStory(prev => prev ? {
        ...prev,
        is_bookmarked: !prev.is_bookmarked
      } : null);
    } catch (err) {
      console.error('Error bookmarking story:', err);
      alert(`Failed to ${story.is_bookmarked ? 'remove bookmark' : 'bookmark'} story. Please try again.`);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: story?.title,
          text: story?.description,
          url: window.location.href,
        });
      } catch {
        // User cancelled sharing
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const submitComment = async () => {
    if (!newComment.trim() || !story || !userInfo) return;

    try {
      const comment = await commentService.createStoryComment(story.id, newComment.trim());
      
      // Validate the comment response
      if (!comment || !comment.id || !comment.user) {
        throw new Error('Invalid comment response from server');
      }
      
      // Add comment to list and clear form
      setComments(prev => [comment, ...prev]);
      setNewComment('');
      
      // Update comment count
      setStory(prev => prev ? {
        ...prev,
        comment_count: prev.comment_count + 1
      } : null);
      
      // Refresh comments to ensure consistency
      setTimeout(() => {
        loadComments();
      }, 1000);
      
    } catch (err) {
      console.error('Error submitting comment:', err);
      alert('Failed to submit comment. Please try again.');
    }
  };

  const submitReply = async (parentId: string) => {
    if (!replyText.trim() || !story || !userInfo) return;

    try {
      const reply = await commentService.createStoryComment(story.id, replyText.trim(), parentId);
      
      // Validate the reply response
      if (!reply || !reply.id || !reply.user) {
        throw new Error('Invalid reply response from server');
      }
      
      // Update comments to include the reply
      setComments(prev => prev.map(comment => 
        comment.id === parentId 
          ? { 
              ...comment, 
              replies: [...(comment.replies || []), reply], 
              reply_count: (comment.reply_count || 0) + 1 
            }
          : comment
      ));
      
      setReplyText('');
      setReplyTo(null);
      
      // Refresh comments to ensure consistency
      setTimeout(() => {
        loadComments();
      }, 1000);
      
    } catch (err) {
      console.error('Error submitting reply:', err);
      alert('Failed to submit reply. Please try again.');
    }
  };

  const likeComment = async (commentId: string) => {
    if (!userInfo) {
      navigate('/login');
      return;
    }

    try {
      await commentService.interactWithComment(commentId, 'like');
      
      // Update comment like count (optimistic update)
      setComments(prev => prev.map(comment => {
        const updateComment = (c: typeof comment): typeof comment => {
          if (c.id === commentId) {
            const wasLiked = c.user_interaction?.liked || false;
            return {
              ...c,
              like_count: wasLiked ? c.like_count - 1 : c.like_count + 1,
              user_interaction: {
                ...c.user_interaction,
                liked: !wasLiked,
                disliked: false
              }
            };
          }
          // Also check replies
          if (c.replies) {
            return {
              ...c,
              replies: c.replies.map(updateComment)
            };
          }
          return c;
        };
        return updateComment(comment);
      }));
      
      // Refresh comments after a short delay to ensure consistency
      setTimeout(() => {
        loadComments();
      }, 500);
      
    } catch (err) {
      console.error('Error liking comment:', err);
      alert('Failed to like comment. Please try again.');
    }
  };

  const navigateToPage = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      pageRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading story...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !story) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error || 'Story not found'}</p>
            <button
              onClick={() => navigate('/stories')}
              className="text-purple-600 hover:text-purple-700"
            >
              ← Back to Stories
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const currentPageData = paginatedContent[currentPage - 1];

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm sticky top-0 z-40">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigate('/stories')}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Stories
              </button>
              
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">
                  Page {currentPage} of {totalPages}
                </span>
                
                {/* Action buttons */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleLike}
                    className={`p-2 rounded-full transition-colors ${
                      story.is_liked 
                        ? 'bg-red-100 text-red-600' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    title="Like story"
                  >
                    <Heart className={`h-5 w-5 ${story.is_liked ? 'fill-current' : ''}`} />
                  </button>
                  
                  <button
                    onClick={handleBookmark}
                    className={`p-2 rounded-full transition-colors ${
                      story.is_bookmarked 
                        ? 'bg-blue-100 text-blue-600' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    title="Bookmark story"
                  >
                    <Bookmark className={`h-5 w-5 ${story.is_bookmarked ? 'fill-current' : ''}`} />
                  </button>
                  
                  <button
                    onClick={handleShare}
                    className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                    title="Share story"
                  >
                    <Share2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Story Header */}
          <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
            <div className="mb-6">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {story.title}
              </h1>
              
              {story.series && (
                <div className="mb-4">
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-700 border border-purple-200">
                    <span className="mr-2">📚</span>
                    {story.series.title} - Part {story.series.current_position}
                  </div>
                </div>
              )}
              
              {/* Cover Image */}
              {story.cover_image && (
                <div className="mb-6">
                  <img
                    src={story.cover_image}
                    alt={story.title}
                    className="w-full h-auto rounded-lg shadow-lg"
                  />
                </div>
              )}
              
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {story.author.avatar && getFullAvatarUrl(story.author.avatar) ? (
                      <img
                        src={getFullAvatarUrl(story.author.avatar)!}
                        alt={story.author.username}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-purple-600" />
                      </div>
                    )}
                    <span className="text-gray-700 font-medium">
                      {story.author.first_name} {story.author.last_name}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-gray-500 text-sm">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatDate(story.published_at)}
                  </div>
                  
                  <div className="flex items-center text-gray-500 text-sm">
                    <Clock className="h-4 w-4 mr-1" />
                    {story.estimated_read_time} min read
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 text-gray-500 text-sm">
                  <div className="flex items-center">
                    <Eye className="h-4 w-4 mr-1" />
                    {story.read_count.toLocaleString()}
                  </div>
                  <div className="flex items-center">
                    <Heart className="h-4 w-4 mr-1" />
                    {story.like_count.toLocaleString()}
                  </div>
                  <div className="flex items-center">
                    <MessageCircle className="h-4 w-4 mr-1" />
                    {story.comment_count.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
            
            <p className="text-gray-600 text-lg leading-relaxed">
              {story.description}
            </p>
          </div>

          {/* Story Content */}
          <div ref={pageRef} className="bg-white rounded-xl shadow-sm p-8 mb-8">
            {currentPageData ? (
              <div>
                {currentPageData.title && (
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    {currentPageData.title}
                  </h2>
                )}
                
                {currentPageData.image && (
                  <div className="mb-6">
                    <img
                      src={currentPageData.image}
                      alt={currentPageData.title || `Page ${currentPage}`}
                      className="w-full h-auto rounded-lg"
                    />
                  </div>
                )}
                
                <div 
                  className="prose max-w-none text-gray-800 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: currentPageData.content }}
                />
                
                <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
                  Words: {currentPageData.wordCount}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Page not found</p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigateToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentPage === 1
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-purple-600 hover:bg-purple-50'
                }`}
              >
                <ChevronLeft className="h-5 w-5 mr-1" />
                Previous
              </button>
              
              <div className="flex items-center space-x-2">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => navigateToPage(pageNum)}
                      className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                        pageNum === currentPage
                          ? 'bg-purple-600 text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => navigateToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentPage === totalPages
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-purple-600 hover:bg-purple-50'
                }`}
              >
                Next
                <ChevronRight className="h-5 w-5 ml-1" />
              </button>
            </div>
          </div>

          {/* Series Navigation */}
          {story.series && (
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Part of: {story.series.title}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {story.series.description}
                </p>
                <div className="mt-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                    Story {story.series.current_position} of {story.series.total_stories}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                {story.previous_in_series ? (
                  <button
                    onClick={() => navigate(`/story/${story.previous_in_series!.id}`)}
                    className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    <div className="text-left">
                      <div className="text-xs text-gray-500">Previous</div>
                      <div className="text-sm font-medium text-gray-900">
                        {story.previous_in_series.title}
                      </div>
                    </div>
                  </button>
                ) : (
                  <div></div>
                )}
                
                {story.next_in_series ? (
                  <button
                    onClick={() => navigate(`/story/${story.next_in_series!.id}`)}
                    className="flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                  >
                    <div className="text-right">
                      <div className="text-xs opacity-90">Next</div>
                      <div className="text-sm font-medium">
                        {story.next_in_series.title}
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </button>
                ) : (
                  <div></div>
                )}
              </div>
            </div>
          )}

          {/* Comments Section */}
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Comments ({story.comment_count})
            </h3>
            
            {/* Add Comment */}
            {userInfo ? (
              <div className="mb-8">
                <div className="flex space-x-4">
                  {userInfo.avatar && getFullAvatarUrl(userInfo.avatar) ? (
                    <img
                      src={getFullAvatarUrl(userInfo.avatar)!}
                      alt={userInfo.username}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-purple-600" />
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Share your thoughts..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                      rows={3}
                    />
                    
                    <div className="flex justify-end mt-3">
                      <button
                        onClick={submitComment}
                        disabled={!newComment.trim()}
                        className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Post Comment
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-8 p-4 bg-gray-50 rounded-lg text-center">
                <p className="text-gray-600 mb-4">Please log in to leave a comment</p>
                <button
                  onClick={() => navigate('/login')}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Log In
                </button>
              </div>
            )}
            
            {/* Comments List */}
            {commentsLoading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading comments...</p>
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No comments yet. Be the first to share your thoughts!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {comments.map((comment) => {
                  // Add safety checks to prevent rendering errors
                  if (!comment || !comment.id || !comment.user) {
                    console.warn('Invalid comment data:', comment);
                    return null;
                  }
                  
                  return (
                    <div key={comment.id} className="border-b border-gray-100 pb-6 last:border-b-0"
                    >
                    <div className="flex space-x-4">
                      {comment.user.avatar_url && getFullAvatarUrl(comment.user.avatar_url) ? (
                        <img
                          src={getFullAvatarUrl(comment.user.avatar_url)!}
                          alt={comment.user.username}
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-600" />
                        </div>
                      )}
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-medium text-gray-900">
                            {comment.user.first_name} {comment.user.last_name}
                          </span>
                          <span className="text-gray-500 text-sm">
                            {comment.time_since || formatDate(comment.created_at)}
                          </span>
                          {comment.is_edited && (
                            <span className="text-gray-400 text-xs">(edited)</span>
                          )}
                        </div>
                        
                        <p className="text-gray-800 mb-3">{comment.text}</p>
                        
                        <div className="flex items-center space-x-4">
                          <button
                            onClick={() => likeComment(comment.id)}
                            className={`flex items-center space-x-1 text-sm transition-colors ${
                              comment.user_interaction?.liked
                                ? 'text-purple-600'
                                : 'text-gray-500 hover:text-purple-600'
                            }`}
                          >
                            <ThumbsUp className="h-4 w-4" />
                            <span>{comment.like_count}</span>
                          </button>
                          
                          {userInfo && (
                            <button
                              onClick={() => setReplyTo(comment.id)}
                              className="text-sm text-gray-500 hover:text-purple-600 transition-colors"
                            >
                              Reply
                            </button>
                          )}
                        </div>
                        
                        {/* Reply Form */}
                        {replyTo === comment.id && (
                          <div className="mt-4">
                            <div className="flex space-x-3">
                              {userInfo?.avatar && getFullAvatarUrl(userInfo.avatar) ? (
                                <img
                                  src={getFullAvatarUrl(userInfo.avatar)!}
                                  alt={userInfo.username}
                                  className="w-8 h-8 rounded-full"
                                />
                              ) : (
                                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                  <User className="h-4 w-4 text-purple-600" />
                                </div>
                              )}
                              
                              <div className="flex-1">
                                <textarea
                                  value={replyText}
                                  onChange={(e) => setReplyText(e.target.value)}
                                  placeholder={`Reply to ${comment.user.first_name}...`}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none text-sm"
                                  rows={2}
                                />
                                
                                <div className="flex justify-end space-x-2 mt-2">
                                  <button
                                    onClick={() => {
                                      setReplyTo(null);
                                      setReplyText('');
                                    }}
                                    className="px-3 py-1 text-gray-600 hover:text-gray-800 transition-colors text-sm"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => submitReply(comment.id)}
                                    disabled={!replyText.trim()}
                                    className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                                  >
                                    Reply
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Replies - Display as threaded conversation */}
                        {comment.replies && comment.replies.length > 0 && (
                          <div className="mt-4 space-y-4 ml-8 border-l-2 border-gray-100 pl-4">
                            {comment.replies.map((reply) => (
                              <div key={reply.id} className="flex space-x-3">
                                {reply.user.avatar_url && getFullAvatarUrl(reply.user.avatar_url) ? (
                                  <img
                                    src={getFullAvatarUrl(reply.user.avatar_url)!}
                                    alt={reply.user.username}
                                    className="w-8 h-8 rounded-full"
                                  />
                                ) : (
                                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                    <User className="h-4 w-4 text-gray-600" />
                                  </div>
                                )}
                                
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <span className="font-medium text-gray-900 text-sm">
                                      {reply.user.first_name} {reply.user.last_name}
                                    </span>
                                    <span className="text-gray-500 text-xs">
                                      {reply.time_since || formatDate(reply.created_at)}
                                    </span>
                                    {reply.is_edited && (
                                      <span className="text-gray-400 text-xs">(edited)</span>
                                    )}
                                  </div>
                                  
                                  <p className="text-gray-800 text-sm mb-2">{reply.text}</p>
                                  
                                  <div className="flex items-center space-x-3">
                                    <button
                                      onClick={() => likeComment(reply.id)}
                                      className={`flex items-center space-x-1 text-xs transition-colors ${
                                        reply.user_interaction?.liked
                                          ? 'text-purple-600'
                                          : 'text-gray-500 hover:text-purple-600'
                                      }`}
                                    >
                                      <ThumbsUp className="h-3 w-3" />
                                      <span>{reply.like_count}</span>
                                    </button>
                                    
                                    {userInfo && (
                                      <button
                                        onClick={() => setReplyTo(reply.id)}
                                        className="text-xs text-gray-500 hover:text-purple-600 transition-colors"
                                      >
                                        Reply
                                      </button>
                                    )}
                                  </div>
                                  
                                  {/* Nested reply form */}
                                  {replyTo === reply.id && (
                                    <div className="mt-3">
                                      <div className="flex space-x-2">
                                        {userInfo?.avatar && getFullAvatarUrl(userInfo.avatar) ? (
                                          <img
                                            src={getFullAvatarUrl(userInfo.avatar)!}
                                            alt={userInfo.username}
                                            className="w-6 h-6 rounded-full"
                                          />
                                        ) : (
                                          <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                                            <User className="h-3 w-3 text-purple-600" />
                                          </div>
                                        )}
                                        
                                        <div className="flex-1">
                                          <textarea
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                            placeholder={`Reply to ${reply.user.first_name}...`}
                                            className="w-full px-2 py-1 border border-gray-300 rounded text-xs resize-none"
                                            rows={2}
                                          />
                                          
                                          <div className="flex justify-end space-x-1 mt-1">
                                            <button
                                              onClick={() => {
                                                setReplyTo(null);
                                                setReplyText('');
                                              }}
                                              className="px-2 py-1 text-gray-600 hover:text-gray-800 transition-colors text-xs"
                                            >
                                              Cancel
                                            </button>
                                            <button
                                              onClick={() => submitReply(comment.id)} // Reply to main comment, not the nested reply
                                              disabled={!replyText.trim()}
                                              className="px-2 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs"
                                            >
                                              Reply
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default StoryReaderPage;
