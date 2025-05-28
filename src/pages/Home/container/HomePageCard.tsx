import React, { useState } from 'react';
import { Play, Film, Headphones, BookOpen, X } from 'lucide-react';

interface ContentItem {
  id: string;
  type: 'film' | 'podcast' | 'story';
  title: string;
  description: string;
  duration: string;
  genre: string;
  thumbnail: string;
  trailerUrl: string;
}

const contentItems: ContentItem[] = [
  // ... your contentItems as before
  {
    id: '1',
    type: 'film',
    title: 'Resilience',
    description: 'Learn how to tackle adversity, challenges and professional setbacks.',
    duration: '2h',
    genre: 'Organizational',
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=600&fit=crop',
    trailerUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
  },
  {
    id: '2',
    type: 'podcast',
    title: 'Growth',
    description: 'Create a development plan that best fits your goals and sense of purpose.',
    duration: '45m',
    genre: 'Organizational',
    thumbnail: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400&h=600&fit=crop',
    trailerUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
  },
  {
    id: '3',
    type: 'story',
    title: 'Engagement',
    description: 'Develop your sense of belonging and active involvement in meaningful work.',
    duration: '1h 20m',
    genre: 'Organizational',
    thumbnail: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=600&fit=crop',
    trailerUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
  },
  {
    id: '4',
    type: 'film',
    title: 'Visioning',
    description: 'Learn how to strategize and formulate your own professional goals.',
    duration: '2h 10m',
    genre: 'Organizational',
    thumbnail: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=600&fit=crop',
    trailerUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
  },
  {
    id: '5',
    type: 'podcast',
    title: 'Goal Orientation',
    description: 'Adapt your strategies to maximize personal and professional success.',
    duration: '50m',
    genre: 'Organizational',
    thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=600&fit=crop',
    trailerUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
  },
  {
    id: '6',
    type: 'story',
    title: 'Self-belief',
    description: 'Gain confidence in your abilities and empower your mindset.',
    duration: '30m',
    genre: 'Organizational',
    thumbnail: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=400&h=600&fit=crop',
    trailerUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
  },
];

const getIcon = (type: string) => {
  switch (type) {
    case 'film': return <Film className="w-5 h-5" />;
    case 'podcast': return <Headphones className="w-5 h-5" />;
    case 'story': return <BookOpen className="w-5 h-5" />;
    default: return <Play className="w-5 h-5" />;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'film': return 'from-red-500 to-pink-600';
    case 'podcast': return 'from-blue-500 to-indigo-600';
    case 'story': return 'from-green-500 to-emerald-600';
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
  const [activeTrailer, setActiveTrailer] = useState<string | null>(null);

  // Example Play Now handler
  const handlePlayNow = (item: ContentItem) => {
    alert(`Play Now: ${item.title}`);
  };

  // Example Read Story handler
  const handleReadStory = (item: ContentItem) => {
    alert(`Read Story: ${item.title}`);
  };

  return (
    <div className="min-h-screen bg-white py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-2">Featured Content</h2>
          <p className="text-gray-500">Preview our latest releases before diving into the full experience</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 auto-rows-[220px] md:auto-rows-[200px] lg:auto-rows-[250px] gap-6">
          {contentItems.map((item, idx) => (
            <div
              key={item.id}
              className={`group relative rounded-2xl overflow-hidden border border-slate-200 hover:border-purple-500 transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-400 ${gridSpans[idx]}`}
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

              {/* Card content with hover animation for film/podcast */}
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
                  <div className="flex gap-2">
                    <button
                      onClick={() => setActiveTrailer(item.id)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold shadow transition"
                      type="button"
                    >
                      <Play className="w-4 h-4" /> Watch Trailer
                    </button>
                    <button
                      onClick={() => handlePlayNow(item)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/80 hover:bg-white text-purple-700 font-semibold text-sm shadow transition"
                      type="button"
                    >
                      <Film className="w-4 h-4" /> Play Now
                    </button>
                  </div>
                )}
              </div>

              {/* Optional: Play icon overlay for film/podcast */}
              {item.type !== 'story' && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition bg-black/30 z-0">
                  <Play className="w-12 h-12 text-white drop-shadow-lg" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Trailer Modal */}
      {activeTrailer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-3xl bg-slate-900 rounded-2xl overflow-hidden">
            <button
              onClick={() => setActiveTrailer(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white"
              aria-label="Close trailer"
              type="button"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="aspect-video bg-black">
              <video
                controls
                autoPlay
                className="w-full h-full object-cover"
                poster={contentItems.find(item => item.id === activeTrailer)?.thumbnail}
              >
                <source src={contentItems.find(item => item.id === activeTrailer)?.trailerUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>

            <div className="p-6">
              <h3 className="text-2xl font-bold text-white mb-2">
                {contentItems.find(item => item.id === activeTrailer)?.title}
              </h3>
              <p className="text-gray-400">{contentItems.find(item => item.id === activeTrailer)?.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentTrailerSection;
