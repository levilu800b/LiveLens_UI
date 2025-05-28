import { useState, useEffect } from 'react';
import { Play, Film, Mic, BookOpen, Heart, Eye } from 'lucide-react';

// Floating Background Particles Component
export const FloatingParticles = ({ className = "" }) => {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      <div className="absolute top-40 right-10 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '4s' }}></div>
      <div className="absolute top-1/2 right-1/4 w-60 h-60 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-pulse" style={{ animationDelay: '1s' }}></div>
    </div>
  );
};

// Animated Content Type Icons
type ContentTypeOrbProps = {
  type: 'podcast' | 'film' | 'animation' | 'story';
  isActive?: boolean;
  size?: 'small' | 'medium' | 'large';
};

export const ContentTypeOrb = ({ type, isActive = false, size = "large" }: ContentTypeOrbProps) => {
  const icons = {
    podcast: <Mic className={size === "large" ? "w-8 h-8" : "w-6 h-6"} />,
    film: <Film className={size === "large" ? "w-8 h-8" : "w-6 h-6"} />,
    animation: <Play className={size === "large" ? "w-8 h-8" : "w-6 h-6"} />,
    story: <BookOpen className={size === "large" ? "w-8 h-8" : "w-6 h-6"} />
  };

  const sizeClasses = {
    small: "w-12 h-12",
    medium: "w-16 h-16",
    large: "w-20 h-20"
  };

  return (
    <div className={`
      ${sizeClasses[size]} rounded-2xl flex items-center justify-center 
      transition-all duration-500 transform hover:scale-110 cursor-pointer
      ${isActive 
        ? 'bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/50 animate-pulse' 
        : 'bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600'
      }
    `}>
      <div className={`transition-colors duration-300 ${isActive ? 'text-white' : 'text-purple-400'}`}>
        {icons[type]}
      </div>
    </div>
  );
};

// Floating Action Orbs (for decorative purposes)
export const FloatingOrbs = ({ className = "" }) => {
  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      <div className="absolute top-10 right-20 w-8 h-8 bg-yellow-400 rounded-full animate-bounce opacity-80"></div>
      <div className="absolute bottom-20 left-16 w-6 h-6 bg-green-400 rounded-full animate-bounce opacity-80" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/3 right-10 w-4 h-4 bg-blue-400 rounded-full animate-pulse opacity-80"></div>
      <div className="absolute bottom-1/3 left-8 w-5 h-5 bg-pink-400 rounded-full animate-pulse opacity-80" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/2 left-1/4 w-3 h-3 bg-purple-400 rounded-full animate-bounce opacity-80" style={{ animationDelay: '0.5s' }}></div>
    </div>
  );
};

// Enhanced Card Wrapper with Animations
import type { ReactNode } from 'react';

type AnimatedCardProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
};

export const AnimatedCard = ({ children, delay = 0, className = "" }: AnimatedCardProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div className={`
      transform transition-all duration-700 ease-out
      ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}
      hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20
      ${className}
    `}>
      {children}
    </div>
  );
};

// Glowing Border Effect Component
type GlowingBorderProps = {
  children: React.ReactNode;
  color?: "purple" | "pink" | "blue" | "green";
  intensity?: "low" | "medium" | "high";
};

export const GlowingBorder = ({ children, color = "purple", intensity = "medium" }: GlowingBorderProps) => {
  const colors = {
    purple: "shadow-purple-500/50 border-purple-500/50",
    pink: "shadow-pink-500/50 border-pink-500/50",
    blue: "shadow-blue-500/50 border-blue-500/50",
    green: "shadow-green-500/50 border-green-500/50"
  };

  const intensities = {
    low: "shadow-sm",
    medium: "shadow-lg",
    high: "shadow-xl"
  };

  return (
    <div className={`
      relative rounded-xl border transition-all duration-300
      hover:${colors[color]} hover:${intensities[intensity]}
      group
    `}>
      {children}
      <div className={`
        absolute -inset-0.5 bg-gradient-to-r from-${color}-600 to-pink-600 
        rounded-xl blur opacity-0 group-hover:opacity-30 transition duration-300
      `}></div>
    </div>
  );
};

// Content Showcase Grid
type ContentShowcaseItem = {
  icon: React.ReactElement;
  type: string;
  title: string;
  description?: string;
  stats?: { views: string; likes: string };
  duration?: string;
  date?: string;
  tags?: string[];
};

type ContentShowcaseProps = {
  contents?: ContentShowcaseItem[];
  onActiveChange?: (index: number) => void;
  activeIndex?: number;
};

export const ContentShowcase = ({ contents = [], onActiveChange, activeIndex: externalActiveIndex }: ContentShowcaseProps) => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (externalActiveIndex !== undefined) {
      setActiveIndex(externalActiveIndex);
    }
  }, [externalActiveIndex]);

  useEffect(() => {
    const interval = setInterval(() => {
      const newIndex = (activeIndex + 1) % contents.length;
      setActiveIndex(newIndex);
      if (onActiveChange) {
        onActiveChange(newIndex);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [contents.length, activeIndex, onActiveChange]);

interface HandleMouseEnter {
    (index: number): void;
}

const handleMouseEnter: HandleMouseEnter = (index) => {
    setActiveIndex(index);
    if (onActiveChange) {
        onActiveChange(index);
    }
};

  return (
    <div className="relative">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {contents.map((content, index) => (
          <div 
            key={index}
            className={`
              p-4 sm:p-6 rounded-xl transition-all duration-500 cursor-pointer transform min-h-[120px] sm:min-h-[140px]
              ${activeIndex === index 
                ? 'bg-gradient-to-br from-purple-900/50 to-pink-900/50 border border-purple-500/50 scale-105 shadow-lg shadow-purple-500/20' 
                : 'bg-slate-800/50 border border-slate-700 hover:border-purple-500/30 hover:scale-102'
              }
            `}
            onMouseEnter={() => handleMouseEnter(index)}
          >
            <div className={`mb-2 sm:mb-3 transition-colors duration-300 ${
              activeIndex === index ? 'text-purple-300' : 'text-gray-300'
            }`}>
              {content.icon}
            </div>
            <div className="text-xs sm:text-sm text-gray-200 mb-1">{content.type}</div>
            <div className="text-base sm:text-lg font-semibold text-gray-100 mb-2 sm:mb-3 leading-tight">{content.title}</div>
            {content.stats && (
              <div className="flex items-center space-x-2 sm:space-x-3 mt-auto text-xs sm:text-sm text-gray-300">
                <span className="flex items-center"><Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />{content.stats.views}</span>
                <span className="flex items-center"><Heart className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />{content.stats.likes}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Flipping Carousel Component
type ContentItem = {
  icon: React.ReactElement;
  type: string;
  title: string;
  description: string;
  stats: { views: string; likes: string };
  duration: string;
  date: string;
  tags: string[];
};

type FlippingCarouselProps = {
  contents?: ContentItem[];
  activeIndex?: number;
};

export const FlippingCarousel = ({ contents = [], activeIndex = 0 }: FlippingCarouselProps) => {
  const [isFlipping, setIsFlipping] = useState(false);
  const [displayIndex, setDisplayIndex] = useState(activeIndex);

  useEffect(() => {
    if (activeIndex !== displayIndex) {
      setIsFlipping(true);
      
      const timer = setTimeout(() => {
        setDisplayIndex(activeIndex);
        setIsFlipping(false);
      }, 250);
      
      return () => clearTimeout(timer);
    }
  }, [activeIndex, displayIndex]);

  const currentContent = contents[displayIndex] || contents[0];

  if (!currentContent) return null;

  return (
    <div className="h-full min-h-[400px] sm:min-h-[480px]">
      <div className={`
        h-full transition-all duration-500 transform
        ${isFlipping ? 'scale-95 opacity-50 rotate-y-12' : 'scale-100 opacity-100 rotate-y-0'}
      `}>
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700 h-full flex flex-col overflow-hidden">
          {/* Content Image - Responsive height */}
          <div className="relative rounded-lg overflow-hidden bg-gradient-to-br from-purple-900/30 to-pink-900/30 h-32 sm:h-40 flex items-center justify-center flex-shrink-0 m-4 sm:m-6 mb-3 sm:mb-4">
            <div className="text-3xl sm:text-5xl opacity-30 text-purple-300">
              {currentContent.icon}
            </div>
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-black/50 text-gray-100 text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-md">
              {currentContent.type}
            </div>
          </div>
          
          {/* Content Info - Flexible with proper spacing */}
          <div className="px-4 sm:px-6 pb-4 sm:pb-6 flex-1 flex flex-col justify-between min-h-0">
            <div className="space-y-2 sm:space-y-3">
              <h4 className="text-lg sm:text-xl font-bold text-gray-100 leading-tight">{currentContent.title}</h4>
              <p className="text-gray-200 text-sm leading-relaxed line-clamp-2 sm:line-clamp-3 flex-shrink-0">{currentContent.description}</p>
              
              {/* Tags/Categories */}
              <div className="flex flex-wrap gap-1 sm:gap-2">
                {currentContent.tags?.slice(0, 2).map((tag, index) => (
                  <span key={index} className="text-xs sm:text-sm bg-purple-900/50 text-purple-200 px-2 sm:px-3 py-1 rounded-md">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            
            {/* Stats - Always at bottom */}
            <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-slate-700 mt-auto flex-shrink-0">
              <div className="flex items-center space-x-3 sm:space-x-4 text-xs sm:text-sm text-gray-200">
                <span className="flex items-center"><Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />{currentContent.stats?.views}</span>
                <span className="flex items-center"><Heart className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />{currentContent.stats?.likes}</span>
              </div>
              <span className="text-xs sm:text-sm text-purple-300">{currentContent.date}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Auto-rotating Icon Orbs Component
type RotatingContentOrbsProps = {
  contents?: Array<{
    icon: React.ReactElement;
    type: string;
    title: string;
    description: string;
    stats: { views: string; likes: string };
    duration: string;
    date: string;
    tags: string[];
  }>;
  className?: string;
};

export const RotatingContentOrbs = ({ contents = [], className = "" }: RotatingContentOrbsProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % contents.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [contents.length]);

  const contentTypes: Array<'podcast' | 'film' | 'animation' | 'story'> = ['podcast', 'film', 'animation', 'story'];

  return (
    <div className={`flex justify-center space-x-2 sm:space-x-4 ${className}`}>
      {contentTypes.map((type, index) => (
        <ContentTypeOrb 
          key={type}
          type={type} 
          isActive={activeIndex === index}
          size={isMobile ? 'medium' : 'large'}
        />
      ))}
    </div>
  );
};

// Demo Component showing how to use them together
const AnimationDemo = () => {
  const [activeContentIndex, setActiveContentIndex] = useState(0);

  const myContent = [
    { 
      icon: <Mic className="w-6 h-6" />, 
      type: "Podcast", 
      title: "Tech Talk #15",
      description: "Diving deep into the latest AI developments and their impact on creative industries. We explore machine learning, automation, and the future of human creativity.",
      stats: { views: "2.3K", likes: "89" },
      duration: "45 min",
      date: "2 days ago",
      tags: ["Technology", "AI", "Future"]
    },
    { 
      icon: <Film className="w-6 h-6" />, 
      type: "Short Film", 
      title: "Morning Coffee",
      description: "A cinematic journey through the ritual of morning coffee. Shot entirely in natural light, exploring themes of solitude, routine, and finding beauty in everyday moments.",
      stats: { views: "1.2K", likes: "156" },
      duration: "8 min",
      date: "1 week ago",
      tags: ["Drama", "Lifestyle", "Cinematic"]
    },
    { 
      icon: <Play className="w-6 h-6" />, 
      type: "Animation", 
      title: "Logo Reveal",
      description: "Dynamic logo animation featuring particle effects and smooth transitions. Created using modern animation techniques with a focus on brand storytelling and visual impact.",
      stats: { views: "890", likes: "67" },
      duration: "30 sec",
      date: "3 days ago",
      tags: ["Motion Graphics", "Branding", "Design"]
    },
    { 
      icon: <BookOpen className="w-6 h-6" />, 
      type: "Story", 
      title: "Chapter 3: The Journey",
      description: "The protagonist faces their greatest challenge yet. This chapter explores themes of perseverance, self-discovery, and the power of human connection in times of adversity.",
      stats: { views: "445", likes: "23" },
      duration: "12 min read",
      date: "5 days ago",
      tags: ["Fiction", "Adventure", "Character Development"]
    }
  ];

  // Sync content detail with content showcase
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveContentIndex((prev) => (prev + 1) % myContent.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [myContent.length]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4 sm:p-6 lg:p-8">
      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
        .rotate-y-12 { transform: rotateY(12deg); }
        .rotate-y-0 { transform: rotateY(0deg); }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        @media (max-width: 640px) {
          .line-clamp-3 {
            -webkit-line-clamp: 2;
          }
        }
      `}</style>
      
      <div className="max-w-sm sm:max-w-4xl lg:max-w-6xl mx-auto space-y-8 sm:space-y-12">
        {/* Example: Enhanced Hero Section */}
        <div className="relative">
          <FloatingParticles />
          <FloatingOrbs />
          
          <div className="relative z-10 text-center space-y-6 sm:space-y-8">
            <RotatingContentOrbs contents={myContent} />
          </div>
        </div>

        {/* Example: Enhanced Card Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-10 items-stretch">
          <AnimatedCard delay={200} className="bg-slate-800/50 rounded-xl border border-slate-700">
            <GlowingBorder color="purple">
              <div className="p-4 sm:p-6 lg:p-8">
                <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-100">Latest Content</h3>
                <ContentShowcase 
                  contents={myContent} 
                  onActiveChange={setActiveContentIndex}
                  activeIndex={activeContentIndex}
                />
              </div>
            </GlowingBorder>
          </AnimatedCard>

          <AnimatedCard delay={400} className="bg-slate-800/50 rounded-xl border border-slate-700">
            <GlowingBorder color="pink">
              <div className="p-4 sm:p-6 lg:p-8 h-full flex flex-col">
                <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-100">Featured</h3>
                <div className="flex-1 min-h-0">
                  <FlippingCarousel 
                    contents={myContent}
                    activeIndex={activeContentIndex}
                  />
                </div>
              </div>
            </GlowingBorder>
          </AnimatedCard>
        </div>
      </div>
    </div>
  );
};

export default AnimationDemo;