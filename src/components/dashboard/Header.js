'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSearch } from '@/contexts/SearchContext';
import { Bell, Search, X } from 'lucide-react';

export default function Header() {
  const { user } = useAuth();
  const { searchTerm, handleSearch, clearSearch } = useSearch();
  const [localSearchTerm, setLocalSearchTerm] = useState('');

  // Sync local search term with global search term
  useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setLocalSearchTerm(value);
  };

  // Debounce the search to avoid too many API calls
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(localSearchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [localSearchTerm, handleSearch]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch(localSearchTerm);
    }
  };

  const handleClearSearch = () => {
    setLocalSearchTerm('');
    clearSearch();
  };

  return (
    <div className="hidden lg:block bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Welcome back, {user?.firstName}! 👋
              </h1>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative input-with-icon">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search blogs..."
                value={localSearchTerm}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-xl leading-5 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-200 bg-gray-50 focus:bg-white text-gray-900"
              />
              {localSearchTerm && (
                <button
                  onClick={handleClearSearch}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600 text-gray-400"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <button className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200">
              <Bell className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}