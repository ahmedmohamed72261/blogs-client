'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const SearchContext = createContext();

export function SearchProvider({ children }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleSearch = useCallback((term) => {
    setSearchTerm(term);
    
    // If we're not on the blogs page and there's a search term, navigate to blogs
    if (term && !pathname.includes('/dashboard/blogs')) {
      router.push(`/dashboard/blogs?search=${encodeURIComponent(term)}`);
    }
  }, [pathname, router]);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
  }, []);

  const value = {
    searchTerm,
    setSearchTerm,
    handleSearch,
    clearSearch,
    isSearching,
    setIsSearching,
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
}