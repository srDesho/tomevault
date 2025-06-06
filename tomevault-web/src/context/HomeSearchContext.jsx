import React, { createContext, useContext, useState, useEffect } from 'react';

// Create a new context to manage home page search and state.
const HomeSearchContext = createContext();

export const HomeSearchProvider = ({ children }) => {
    // State for the search term, initialized from localStorage.
    const [homeSearchTerm, setHomeSearchTerm] = useState(() => {
        return localStorage.getItem('homeSearchTerm') || '';
    });

    // State for the scroll position, initialized from localStorage.
    const [homeScrollPosition, setHomeScrollPosition] = useState(() => {
        const saved = localStorage.getItem('homeScrollPosition');
        return saved ? parseInt(saved, 10) : 0;
    });

    // State to track if a search is currently active, initialized from localStorage.
    const [isSearchActive, setIsSearchActive] = useState(() => {
        return localStorage.getItem('homeIsSearchActive') === 'true';
    });

    // State for the current page number in regular view, initialized from localStorage.
    const [currentPage, setCurrentPage] = useState(() => {
        const saved = localStorage.getItem('homeCurrentPage');
        return saved ? parseInt(saved, 10) : 0;
    });

    // State for the current page number in search view, initialized from localStorage.
    const [searchPage, setSearchPage] = useState(() => {
        const saved = localStorage.getItem('homeSearchPage');
        return saved ? parseInt(saved, 10) : 0;
    });

    // Effect to save the state to localStorage whenever it changes.
    useEffect(() => {
        localStorage.setItem('homeSearchTerm', homeSearchTerm);
        localStorage.setItem('homeIsSearchActive', isSearchActive.toString());
        localStorage.setItem('homeScrollPosition', homeScrollPosition.toString());
        localStorage.setItem('homeCurrentPage', currentPage.toString());
        localStorage.setItem('homeSearchPage', searchPage.toString());
    }, [homeSearchTerm, isSearchActive, homeScrollPosition, currentPage, searchPage]);

    // Function to clear all search-related state and localStorage items.
    const clearSearch = () => {
        setHomeSearchTerm('');
        setIsSearchActive(false);
        setSearchPage(0);
        try {
            localStorage.removeItem('homeSearchTerm');
            localStorage.removeItem('homeIsSearchActive');
            localStorage.removeItem('homeSearchPage');
        } catch (e) {
            console.warn('Error clearing search localStorage:', e);
        }
    };

    // The value provided by the context provider.
    const value = {
        homeSearchTerm,
        // Custom setter for search term that also updates the search active state.
        setHomeSearchTerm: (term) => {
            setHomeSearchTerm(term);
            setIsSearchActive(!!term.trim());
        },
        homeScrollPosition,
        setHomeScrollPosition,
        isSearchActive,
        clearSearch,
        currentPage,
        setCurrentPage,
        searchPage,
        setSearchPage
    };

    return (
        <HomeSearchContext.Provider value={value}>
            {children}
        </HomeSearchContext.Provider>
    );
};

// Custom hook to easily consume the HomeSearchContext.
export const useHomeSearch = () => {
    const context = useContext(HomeSearchContext);
    if (!context) {
        throw new Error('useHomeSearch must be used within a HomeSearchProvider');
    }
    return context;
};