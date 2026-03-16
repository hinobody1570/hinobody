"use client";

import { IoIosSearch } from "react-icons/io";
import { PiIntersectThree } from "react-icons/pi";
import { useTranslations } from "next-intl";
import { useState, useEffect, useRef } from "react";
import { searchApi } from "@/lib/api";
import { SearchResultsModal } from "./SearchResultsModal";

export const SearchBar = ({ placeholder }: { placeholder?: string }) => {
  const t = useTranslations('header');
  const defaultPlaceholder = placeholder || t('findAnything');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [searchResults, setSearchResults] = useState<any>(null);
  const searchBarRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setShowResults(false);
      setSearchResults(null);
      return;
    }

    const searchTimer = setTimeout(async () => {
      try {
        setIsSearching(true);
        const results = await searchApi.search({ q: searchQuery.trim(), limit: 5 });
        setSearchResults(results);
        setShowResults(true);
      } catch (error: any) {
        console.error('Error searching:', error);
        setSearchResults(null);
      } finally {
        setIsSearching(false);
      }
    }, 500); // 500ms debounce

    return () => {
      clearTimeout(searchTimer);
    };
  }, [searchQuery]);

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleInputFocus = () => {
    if (searchResults) {
      setShowResults(true);
    }
  };

  // Show dropdown when clicking search icon or end icon (focus input + show results if any)
  const handleIconClick = () => {
    inputRef.current?.focus();
    if (searchResults) {
      setShowResults(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      // Could navigate to full search results page
      setShowResults(true);
    }
  };
  
  return (
    <div className="relative flex-1 max-w-2xl" ref={searchBarRef}>
      {/* Left search icon - clickable to focus and show dropdown */}
      <button
        type="button"
        onClick={handleIconClick}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
        aria-label={t('findAnything')}
      >
        <IoIosSearch size={20} />
      </button>

      {/* Input */}
      <input
        ref={inputRef}
        type="text"
        value={searchQuery}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onKeyDown={handleKeyDown}
        placeholder={defaultPlaceholder}
        className="
          w-full
          pl-12
          pr-24
          py-2.5
          bg-gray-100
          border border-gray-200
          rounded-full
          focus:outline-none
          focus:border-orange-500
          focus:bg-white
          transition-colors
          text-center
        "
      />

      {/* Loading indicator */}
      {isSearching && (
        <div className="absolute right-16 top-1/2 -translate-y-1/2">
          <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Right button inside input - click to focus and show dropdown */}
      <button
        type="button"
        onClick={handleIconClick}
        className="
          absolute
          right-2
          top-1/2
          -translate-y-1/2
          flex
          items-center
          gap-1
          px-3
          py-3
          rounded-full
          text-sm
          text-black
          cursor-pointer
        "
      >
        <PiIntersectThree size={16} className="text-orange-600"/>
        {t('ask')}
      </button>

      {/* Search Results Modal */}
      {showResults && searchResults && (
        <SearchResultsModal
          results={searchResults}
          searchQuery={searchQuery}
          onClose={() => setShowResults(false)}
        />
      )}
    </div>
  );
};
