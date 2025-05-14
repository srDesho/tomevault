import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // Import useLocation for URL access
import BookList from '../components/books/BookList';
import * as BookService from '../services/BookService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { SearchIcon } from '@heroicons/react/outline'; // Ensure SearchIcon is imported

const SearchPage = ({ isLoggedIn, onAdd }) => {
  const navigate = useNavigate();
  const location = useLocation(); // Hook to access the current URL's location object

  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [searchErrorMessage, setSearchErrorMessage] = useState(null);
  const [addBookMessage, setAddBookMessage] = useState(null);

  // Effect to clear messages after a timeout
  useEffect(() => {
    let timer;
    if (addBookMessage || searchErrorMessage) {
      timer = setTimeout(() => {
        setAddBookMessage(null);
        setSearchErrorMessage(null);
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [addBookMessage, searchErrorMessage]);

  // useCallback to memoize the core search logic for stable dependencies
  const executeSearch = useCallback(async (queryToSearch) => {
    if (!queryToSearch.trim()) {
      setSearchResults([]);
      setSearchErrorMessage(null);
      setHasSearched(false); // Reset hasSearched if query is empty
      return;
    }

    setIsSearching(true);
    setHasSearched(true); // Indicate that a search operation has been initiated
    setSearchErrorMessage(null);
    setAddBookMessage(null); // Clear any previous add book messages

    try {
      const results = await BookService.searchGoogleBooks(queryToSearch);
      // Filter out results without valid Google Book IDs
      const validResults = results.filter(book => book.googleBookId && book.googleBookId.trim() !== '' && book.googleBookId.toLowerCase() !== 'null');
      setSearchResults(validResults);

      if (validResults.length === 0) {
        if (results.length > 0) {
          setSearchErrorMessage("No se encontraron libros válidos para tu búsqueda. Algunos resultados pueden tener IDs no disponibles.");
        } else {
          setSearchErrorMessage("No se encontraron libros para tu búsqueda.");
        }
      }
    } catch (error) {
      setSearchResults([]);
      setSearchErrorMessage(error.message || 'Error al buscar libros. Intenta de nuevo.');
    } finally {
      setIsSearching(false);
    }
  }, []); // Empty dependency array ensures this function is created once

  // Effect to read the search term from the URL on component mount or URL change
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const queryFromUrl = queryParams.get('query'); // Get 'query' parameter from URL

    if (queryFromUrl) {
      setSearchTerm(queryFromUrl); // Update the input field with the URL query
      executeSearch(queryFromUrl); // Execute the search with the URL query
    } else {
      // If no query in URL (e.g., initial load or user manually cleared URL),
      // reset search states to initial values.
      setSearchResults([]);
      setSearchTerm('');
      setHasSearched(false);
      setSearchErrorMessage(null);
      setAddBookMessage(null);
    }
  }, [location.search, executeSearch]); // Dependencies: re-run if URL search part changes or executeSearch changes

  // Handles search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      // If search term is empty, navigate to the base path without query param
      navigate(location.pathname);
      setSearchErrorMessage("Por favor, ingresa un término de búsqueda.");
      setSearchResults([]);
      setHasSearched(false);
      return;
    }
    // Update the URL with the new search term.
    // The `useEffect` above will detect this URL change and trigger `executeSearch`.
    navigate(`?query=${encodeURIComponent(searchTerm)}`);
  };

  // Handles adding a book to the personal collection
  const handleAddBook = async (book) => {
    setAddBookMessage(null); // Clear any previous messages

    if (!isLoggedIn) {
      setAddBookMessage({ type: 'error', text: "Debes iniciar sesión para agregar libros a tu colección." });
      setTimeout(() => navigate('/login'), 1500); // Redirect to login after a short delay
      return;
    }

    try {
      const addedBook = await onAdd(book.googleBookId); // Call the onAdd prop with googleBookId
      setAddBookMessage({ type: 'success', text: `"${addedBook.title}" agregado a tu colección.` });
    } catch (error) {
      let errorMessage = error.message || 'Error al agregar el libro.';

      // Specific error handling based on common API responses
      if (errorMessage.includes("403") || errorMessage.includes("401") || errorMessage.includes("Unauthorized") || errorMessage.includes("session")) {
        errorMessage = "Tu sesión ha expirado o no tienes permisos. Por favor, inicia sesión de nuevo.";
        setTimeout(() => navigate('/login'), 2000); // Redirect to login after a short delay
      } else if (errorMessage.includes("already exists") || errorMessage.includes("existe")) {
        errorMessage = "Este libro ya está en tu colección.";
      } else if (errorMessage.includes("ID no puede ser nulo o vacío") || errorMessage.includes("invalid book ID")) {
        errorMessage = "Error: ID de libro inválido. No se pudo agregar.";
      }

      setAddBookMessage({ type: 'error', text: errorMessage });
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8 w-full">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-6 text-center">
          Buscar Libros
        </h2>
        {/* Search form */}
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 w-full max-w-2xl mx-auto">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar libros en Google Books..."
            className="flex-1 p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={isSearching || !searchTerm.trim()} // Disable if search is in progress or input is empty
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center gap-2"
          >
            {isSearching ? (
              // Loading spinner when searching
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              // Search icon when not searching
              <SearchIcon className="h-5 w-5" />
            )}
            {isSearching ? 'Buscando...' : 'Buscar'}
          </button>
        </form>
      </div>

      {/* Displays success/error messages for adding books */}
      {addBookMessage && (
        <div className={`p-4 rounded-lg text-center mb-4 ${addBookMessage.type === 'success' ? 'bg-green-600' : 'bg-red-600'} text-white`}>
          {addBookMessage.text}
        </div>
      )}
      {/* Displays search error messages */}
      {searchErrorMessage && (
        <div className="p-4 rounded-lg bg-red-600 text-white text-center mb-4">
          {searchErrorMessage}
        </div>
      )}

      <div className="w-full min-w-0">
        {/* Displays loading spinner or search results */}
        {isSearching ? (
          <LoadingSpinner />
        ) : (
          <BookList
            books={searchResults}
            isSearchList={true}
            onAdd={handleAddBook}
            // Messages for different search states (e.g., initial prompt, no results)
            emptyMessage={
              // Message displayed when no search has been performed yet and input is empty
              (!hasSearched && !searchTerm.trim()) ? (
                <div className="col-span-full py-12 text-center">
                  <p className="text-gray-400">Realiza una búsqueda para encontrar libros.</p>
                </div>
              ) : // Message displayed when a search was performed but yielded no results
              (searchResults.length === 0 && hasSearched) ? (
                <div className="col-span-full py-12 text-center">
                  <div className="bg-gray-800 p-6 rounded-lg inline-block">
                    <p className="text-gray-400 mb-4">No se encontraron libros para tu búsqueda.</p>
                    <button
                      onClick={() => setSearchTerm('')} // Clears the search term to allow a new search
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
                    >
                      Intentar otra búsqueda
                    </button>
                  </div>
                </div>
              ) : null // No empty message if there are search results
            }
          />
        )}
      </div>
    </div>
  );
};

export default SearchPage;
