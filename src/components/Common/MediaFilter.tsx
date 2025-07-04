// src/components/Common/MediaFilter.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Search, X, SlidersHorizontal, ChevronDown } from 'lucide-react';

export interface FilterOptions {
  tags: string[];
  sortBy: string;
  duration?: string;
  dateRange?: string;
}

interface MediaFilterProps {
  onSearch: (query: string) => void;
  onFilter: (filters: FilterOptions) => void;
  contentType: 'media' | 'film' | 'content' | 'story' | 'podcast' | 'animation';
  placeholder?: string;
  className?: string;
  debounceMs?: number;
  initialValue?: string;
  availableTags?: string[];
}

const MediaFilter: React.FC<MediaFilterProps> = ({
  onSearch,
  onFilter,
  contentType,
  placeholder = "Search...",
  className = "",
  debounceMs = 300,
  initialValue = "",
  availableTags = []
}) => {
  const [query, setQuery] = useState(initialValue);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('newest');
  const [duration, setDuration] = useState('');
  const [dateRange, setDateRange] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const debounceRef = useRef<number | null>(null);
  const onSearchRef = useRef(onSearch);
  const onFilterRef = useRef(onFilter);

  // Keep refs updated
  useEffect(() => {
    onSearchRef.current = onSearch;
    onFilterRef.current = onFilter;
  });

  // Effect to call debounced search when query changes
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      onSearchRef.current(query);
    }, debounceMs);
    
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, debounceMs]);

  // Effect to call onFilter when filter options change
  useEffect(() => {
    onFilterRef.current({
      tags: selectedTags,
      sortBy,
      duration,
      dateRange
    });
  }, [selectedTags, sortBy, duration, dateRange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleClear = () => {
    setQuery("");
    onSearch("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    onSearch(query);
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSelectedTags([]);
    setSortBy('newest');
    setDuration('');
    setDateRange('');
  };

  // Sort options based on content type
  const getSortOptions = () => {
    const baseOptions = [
      { value: 'newest', label: 'Newest First' },
      { value: 'oldest', label: 'Oldest First' },
      { value: 'alphabetical', label: 'A-Z' },
      { value: 'most-liked', label: 'Most Liked' },
      { value: 'most-viewed', label: 'Most Viewed' }
    ];

    if (contentType === 'media' || contentType === 'film' || contentType === 'content') {
      return [
        ...baseOptions,
        { value: 'trending', label: 'Trending' },
        { value: 'featured', label: 'Featured' },
        { value: 'highest-rated', label: 'Highest Rated' }
      ];
    }

    if (contentType === 'story') {
      return [
        ...baseOptions,
        { value: 'trending', label: 'Trending' },
        { value: 'featured', label: 'Featured' },
        { value: 'reading-time', label: 'Reading Time' }
      ];
    }

    return baseOptions;
  };

  // Duration options based on content type
  const getDurationOptions = () => {
    if (contentType === 'film') {
      return [
        { value: '', label: 'Any Duration' },
        { value: 'short', label: 'Under 90 min' },
        { value: 'medium', label: '90-150 min' },
        { value: 'long', label: 'Over 150 min' }
      ];
    }

    if (contentType === 'content') {
      return [
        { value: '', label: 'Any Duration' },
        { value: 'short', label: 'Under 10 min' },
        { value: 'medium', label: '10-30 min' },
        { value: 'long', label: 'Over 30 min' }
      ];
    }

    if (contentType === 'story') {
      return [
        { value: '', label: 'Any Length' },
        { value: 'short', label: 'Quick Read (< 5 min)' },
        { value: 'medium', label: 'Medium Read (5-15 min)' },
        { value: 'long', label: 'Long Read (15+ min)' }
      ];
    }

    if (contentType === 'podcast') {
      return [
        { value: '', label: 'Any Duration' },
        { value: 'short', label: 'Under 15 min' },
        { value: 'medium', label: '15-45 min' },
        { value: 'long', label: 'Over 45 min' }
      ];
    }

    return [];
  };

  const hasActiveFilters = selectedTags.length > 0 || sortBy !== 'newest' || duration || dateRange;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Bar */}
      <div className="relative">
        <form onSubmit={handleSubmit} className="relative">
          <div className={`relative flex items-center transition-all duration-200 ${
            isFocused 
              ? 'ring-2 ring-purple-500 ring-opacity-50' 
              : 'hover:shadow-sm'
          }`}>
            <div className="absolute left-3 flex items-center pointer-events-none">
              <Search className={`h-5 w-5 transition-colors ${
                isFocused ? 'text-purple-500' : 'text-gray-400'
              }`} />
            </div>

            <input
              type="text"
              value={query}
              onChange={handleInputChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={placeholder}
              className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500 transition-all duration-200"
            />

            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-3 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Filter Toggle */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors"
        >
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Filters
          {hasActiveFilters && (
            <span className="ml-2 bg-purple-100 text-purple-800 text-xs font-medium px-2 py-0.5 rounded-full">
              {selectedTags.length + (sortBy !== 'newest' ? 1 : 0) + (duration ? 1 : 0) + (dateRange ? 1 : 0)}
            </span>
          )}
          <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-purple-600 hover:text-purple-800 font-medium"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Filter Options */}
      {showFilters && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {getSortOptions().map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Duration Filter */}
          {getDurationOptions().length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {getDurationOptions().map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Published
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Any Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>

          {/* Tags Filter */}
          {availableTags.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {availableTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => handleTagToggle(tag)}
                    className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                      selectedTags.includes(tag)
                        ? 'bg-purple-100 border-purple-300 text-purple-800'
                        : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Active Filters Display */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map(tag => (
            <span
              key={tag}
              className="inline-flex items-center px-3 py-1 text-sm bg-purple-100 text-purple-800 rounded-full"
            >
              {tag}
              <button
                onClick={() => handleTagToggle(tag)}
                className="ml-2 hover:text-purple-600"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default MediaFilter;
