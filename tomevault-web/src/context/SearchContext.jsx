import React, { createContext, useContext, useState, useEffect } from 'react';

const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
  const [searchTerm, setSearchTerm] = useState(() => {
    return localStorage.getItem('searchTerm') || '';
  });

  const [searchResults, setSearchResults] = useState(() => {
    const saved = localStorage.getItem('searchResults');
    try {
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [searchScrollPosition, setSearchScrollPosition] = useState(() => {
    const saved = localStorage.getItem('searchScrollPosition');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [hasSearched, setHasSearched] = useState(() => {
    return localStorage.getItem('searchHasSearched') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('searchTerm', searchTerm);
    localStorage.setItem('searchResults', JSON.stringify(searchResults));
    localStorage.setItem('searchScrollPosition', searchScrollPosition.toString());
    localStorage.setItem('searchHasSearched', hasSearched.toString());
  }, [searchTerm, searchResults, searchScrollPosition, hasSearched]);

  const clearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
    setHasSearched(false);
    setSearchScrollPosition(0);
    
    try {
      localStorage.removeItem('searchTerm');
      localStorage.removeItem('searchResults');
      localStorage.removeItem('searchHasSearched');
      localStorage.removeItem('searchScrollPosition');
    } catch (e) {
      console.warn('Error clearing search localStorage:', e);
    }
  };

  return (
    <SearchContext.Provider value={{
      searchTerm,
      setSearchTerm,
      searchResults,
      setSearchResults,
      searchScrollPosition,
      setSearchScrollPosition,
      hasSearched,
      setHasSearched,
      clearSearch
    }}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};