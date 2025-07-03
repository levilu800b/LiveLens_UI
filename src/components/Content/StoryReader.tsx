// src/components/Content/StoryReader.tsx
import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause, Heart, MessageCircle } from 'lucide-react';

interface StoryReaderProps {
  story: {
    id: string;
    title: string;
    content: string;
    author: string;
    likes: number;
    isLiked?: boolean;
  };
  onLike?: () => void;
  onComment?: () => void;
}

const StoryReader: React.FC<StoryReaderProps> = ({ story, onLike, onComment }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isReading, setIsReading] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [pages, setPages] = useState<string[]>([]);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Split content into pages (5000 words per page for better reading experience)
  useEffect(() => {
    const words = story.content.split(' ');
    const wordsPerPage = 5000;
    const storyPages: string[] = [];

    for (let i = 0; i < words.length; i += wordsPerPage) {
      const pageWords = words.slice(i, i + wordsPerPage);
      storyPages.push(pageWords.join(' '));
    }

    setPages(storyPages);
  }, [story.content]);

  const nextPage = () => {
    if (currentPage < pages.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const toggleReading = () => {
    if (isReading) {
      speechSynthesis.cancel();
      setIsReading(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(pages[currentPage - 1]);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      utterance.onend = () => {
        setIsReading(false);
        if (currentPage < pages.length) {
          setCurrentPage(currentPage + 1);
        }
      };
      
      speechRef.current = utterance;
      speechSynthesis.speak(utterance);
      setIsReading(true);
    }
  };

  const changeFontSize = (delta: number) => {
    setFontSize(Math.max(12, Math.min(24, fontSize + delta)));
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
        <h1 className="text-3xl font-bold mb-2">{story.title}</h1>
        <p className="text-purple-100">by {story.author}</p>
      </div>

      {/* Controls */}
      <div className="bg-gray-50 px-6 py-4 border-b flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleReading}
            className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            {isReading ? (
              <>
                <Pause className="h-4 w-4" />
                <span>Pause Reading</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                <span>Read Aloud</span>
              </>
            )}
          </button>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Font Size:</span>
            <button
              onClick={() => changeFontSize(-2)}
              className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded flex items-center justify-center transition-colors"
            >
              A-
            </button>
            <button
              onClick={() => changeFontSize(2)}
              className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded flex items-center justify-center transition-colors"
            >
              A+
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            Page {currentPage} of {pages.length}
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={onLike}
              className={`flex items-center space-x-1 px-3 py-1 rounded-lg transition-colors ${
                story.isLiked 
                  ? 'bg-red-100 text-red-600' 
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              <Heart className={`h-4 w-4 ${story.isLiked ? 'fill-current' : ''}`} />
              <span>{story.likes}</span>
            </button>
            <button
              onClick={onComment}
              className="flex items-center space-x-1 bg-gray-200 text-gray-600 hover:bg-gray-300 px-3 py-1 rounded-lg transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Comment</span>
            </button>
          </div>
        </div>
      </div>

      {/* Story Content */}
      <div className="p-8">
        <div 
          className="prose prose-lg max-w-none leading-relaxed text-gray-800"
          style={{ fontSize: `${fontSize}px`, lineHeight: '1.8' }}
        >
          {pages[currentPage - 1]}
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t">
        <button
          onClick={prevPage}
          disabled={currentPage === 1}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            currentPage === 1
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-purple-600 text-white hover:bg-purple-700'
          }`}
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Previous</span>
        </button>

        <div className="flex items-center space-x-2">
          {Array.from({ length: pages.length }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`w-3 h-3 rounded-full transition-colors ${
                currentPage === i + 1
                  ? 'bg-purple-600'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>

        <button
          onClick={nextPage}
          disabled={currentPage === pages.length}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            currentPage === pages.length
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-purple-600 text-white hover:bg-purple-700'
          }`}
        >
          <span>Next</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default StoryReader;