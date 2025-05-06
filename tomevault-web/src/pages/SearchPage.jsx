import React, { useState, useEffect } from 'react';
import BookList from '../components/books/BookList';
import * as BookService from '../services/BookService';
import LoadingSpinner from '../components/common/LoadingSpinner';

const SearchPage = ({ isLoggedIn }) => {
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [searchErrorMessage, setSearchErrorMessage] = useState(null); // Declared here
  const [addBookMessage, setAddBookMessage] = useState(null);

  // Effect for debugging: logs the current search state.
  useEffect(() => {
    console.log("Current searchResults state:", searchResults);
    console.log("isSearching:", isSearching);
    console.log("hasSearched:", hasSearched);
    console.log("searchErrorMessage:", searchErrorMessage);
  }, [searchResults, isSearching, hasSearched, searchErrorMessage]);

  // Handles the submission of the search form.
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      setSearchErrorMessage("Por favor, ingresa un término de búsqueda.");
      setSearchResults([]); 
      setHasSearhed(false); 
      return;
    }
    
    setIsSearching(true);
    setHasSearched(true);
    setSearchErrorMessage(null);
    setAddBookMessage(null);

    try {
      // Calls the search service to get books from Google Books via the backend.
      const results = await BookService.searchGoogleBooks(searchTerm);
      setSearchResults(results);
      if (results.length === 0) {
        setSearchErrorMessage("No se encontraron libros para tu búsqueda.");
      }
    } catch (error) {
      console.error('Error al buscar libros:', error);
      setSearchResults([]);
      setSearchErrorMessage(error.message || 'Error al buscar libros. Intenta de nuevo.');
    } finally {
      setIsSearching(false);
    }
  };

  // Handles adding a book to the personal collection.
  const handleAddBook = async (book) => {
    try {
      setAddBookMessage(null);
      // Calls the service to save the Google Books book to the user's collection.
      const createdBook = await BookService.saveBookFromGoogle(book.id); 
      console.log('Libro agregado con éxito:', createdBook);
      setAddBookMessage({ type: 'success', text: `"${createdBook.title}" agregado a tu colección.` });
    } catch (error) {
      console.error('Error al agregar libro:', error);
      setAddBookMessage({ type: 'error', text: error.message || 'Error al agregar el libro.' });
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8 w-full">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-6 text-center">
          Buscar Libros
        </h2>
        {/* Search form. */}
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
            disabled={isSearching || !searchTerm.trim()}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {isSearching ? 'Buscando...' : 'Buscar'}
          </button>
        </form>
      </div>

      {/* Displays search error messages. */}
      {searchErrorMessage && (
        <div className="p-4 rounded-lg bg-red-600 text-white text-center mb-4">
          {searchErrorMessage}
        </div>
      )}
      {/* Displays add book success/error messages. */}
      {addBookMessage && (
        <div className={`p-4 rounded-lg text-center mb-4 ${addBookMessage.type === 'success' ? 'bg-green-600' : 'bg-red-600'} text-white`}>
          {addBookMessage.text}
        </div>
      )}

      <div className="w-full min-w-0">
        {/* Displays loading spinner or search results. */}
        {isSearching ? (
          <LoadingSpinner />
        ) : (
          <BookList
            books={searchResults}
            isSearchList={true}
            onAdd={handleAddBook}
            // Messages for different search states.
            emptyMessage={
              (!hasSearched && !searchTerm.trim()) ? (
                <div className="col-span-full py-12 text-center">
                  <p className="text-gray-400">Realiza una búsqueda para encontrar libros.</p>
                </div>
              ) : (searchResults.length === 0 && hasSearched) ? (
                <div className="col-span-full py-12 text-center">
                  <div className="bg-gray-800 p-6 rounded-lg inline-block">
                    <p className="text-gray-400 mb-4">No se encontraron libros para tu búsqueda.</p>
                    <button
                      onClick={() => setSearchTerm('')}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
                    >
                      Intentar otra búsqueda
                    </button>
                  </div>
                </div>
              ) : null
            }
          />
        )}
      </div>
    </div>
  );
};

export default SearchPage;
