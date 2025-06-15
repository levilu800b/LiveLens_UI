// src/components/Common/SearchFilter.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { Search, X, Filter } from 'lucide-react';
import { debounce } from 'lodash';

interface SearchFilterProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
  showClearButton?: boolean;
  debounceMs?: number;
  initialValue?: string;
}

const SearchFilter: React.FC<SearchFilterProps> = ({
  onSearch,
  placeholder = "Search...",
  className = "",
  showClearButton = true,
  debounceMs = 300,
  initialValue = ""
}) => {
  const [query, setQuery] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);

  // Create debounced search function
  const debouncedSearch = useCallback(
    debounce((searchQuery: string) => {
      onSearch(searchQuery);
    }, debounceMs),
    [onSearch, debounceMs]
  );

  // Effect to call debounced search when query changes
  useEffect(() => {
    debouncedSearch(query);
    
    // Cleanup function to cancel pending debounced calls
    return () => {
      debouncedSearch.cancel();
    };
  }, [query, debouncedSearch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleClear = () => {
    setQuery("");
    onSearch("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    debouncedSearch.cancel(); // Cancel any pending debounced calls
    onSearch(query); // Execute search immediately
  };

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className={`relative flex items-center transition-all duration-200 ${
          isFocused 
            ? 'ring-2 ring-purple-500 ring-opacity-50' 
            : 'hover:shadow-sm'
        }`}>
          {/* Search Icon */}
          <div className="absolute left-3 flex items-center pointer-events-none">
            <Search className={`h-5 w-5 transition-colors ${
              isFocused ? 'text-purple-500' : 'text-gray-400'
            }`} />
          </div>

          {/* Input Field */}
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500 transition-all duration-200"
          />

          {/* Clear Button */}
          {showClearButton && query && (
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

      {/* Search Suggestions or Recent Searches (Optional Enhancement) */}
      {isFocused && query.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {/* You can add search suggestions here */}
          <div className="p-3 text-sm text-gray-500 border-b">
            <div className="flex items-center">
              <Search className="h-4 w-4 mr-2" />
              Search for "{query}"
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchFilter;