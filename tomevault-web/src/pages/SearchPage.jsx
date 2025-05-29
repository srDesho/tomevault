import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import BookList from '../components/books/BookList';
import * as BookService from '../services/BookService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { SearchIcon } from '@heroicons/react/outline';
import { useAuth } from '../context/AuthContext';

const SearchPage = ({ onAdd }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [searchErrorMessage, setSearchErrorMessage] = useState(null);
  const [addBookMessage, setAddBookMessage] = useState(null);

  // Limpia mensajes después de 3 segundos
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

  // Ejecuta la búsqueda
  const executeSearch = useCallback(async (queryToSearch) => {
    if (!queryToSearch.trim()) {
      setSearchResults([]);
      setSearchErrorMessage(null);
      setHasSearched(false);
      return;
    }

    setIsSearching(true);
    setHasSearched(true);
    setSearchErrorMessage(null);
    setAddBookMessage(null);

    try {
      const results = await BookService.searchGoogleBooks(queryToSearch);
      const validResults = results.filter(
        (book) =>
          book.googleBookId && book.googleBookId.trim() !== '' && book.googleBookId.toLowerCase() !== 'null'
      );
      setSearchResults(validResults);

      if (validResults.length === 0) {
        const msg = results.length > 0
          ? 'No se encontraron libros válidos para tu búsqueda. Algunos resultados pueden tener IDs no disponibles.'
          : 'No se encontraron libros para tu búsqueda.';
        setSearchErrorMessage(msg);
      }
    } catch (error) {
      setSearchResults([]);
      setSearchErrorMessage(error.message || 'Error al buscar libros. Intenta de nuevo.');
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Lee el término de búsqueda de la URL
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const queryFromUrl = queryParams.get('query');

    if (queryFromUrl) {
      setSearchTerm(queryFromUrl);
      executeSearch(queryFromUrl);
    } else {
      setSearchResults([]);
      setSearchTerm('');
      setHasSearched(false);
      setSearchErrorMessage(null);
      setAddBookMessage(null);
    }
  }, [location.search, executeSearch]);

  // Maneja el envío del formulario
  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      navigate(location.pathname);
      setSearchErrorMessage('Por favor, ingresa un término de búsqueda.');
      setSearchResults([]);
      setHasSearched(false);
      return;
    }
    navigate(`?query=${encodeURIComponent(searchTerm)}`);
  };

  // Maneja agregar libro
  const handleAddBook = async (book) => {
    setAddBookMessage(null);

    if (!isAuthenticated()) {
      setAddBookMessage({
        type: 'error',
        text: 'Debes iniciar sesión para agregar libros a tu colección.',
      });
      setTimeout(() => navigate('/login'), 1500);
      return;
    }

    if (typeof onAdd !== 'function') {
      setAddBookMessage({
        type: 'error',
        text: 'No se puede agregar libros en este momento.',
      });
      return;
    }

    try {
      const addedBook = await onAdd(book.googleBookId);
      setAddBookMessage({
        type: 'success',
        text: `"${addedBook?.title || book.title}" agregado a tu colección.`,
      });
    } catch (error) {
      let errorMessage = error.message || 'Error al agregar el libro.';
      let action = null;

      if (error.message?.includes('401') || error.message?.includes('403') || error.message?.includes('Unauthorized')) {
        errorMessage = 'Tu sesión ha expirado o no tienes permisos.';
        action = () => navigate('/login');
      } else if (error.message?.includes('already exists')) {
        errorMessage = 'Este libro ya está en tu colección.';
      } else if (error.message?.includes('ID no puede ser nulo')) {
        errorMessage = 'Error: ID de libro inválido.';
      }

      setAddBookMessage({
        type: 'error',
        text: errorMessage,
        action,
      });
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8 w-full">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-6 text-center">
          Buscar Libros
        </h2>

        {/* Formulario de búsqueda */}
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
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center gap-2"
          >
            {isSearching ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <SearchIcon className="h-5 w-5" />
            )}
            {isSearching ? 'Buscando...' : 'Buscar'}
          </button>
        </form>
      </div>

      {/* Mensaje de éxito/error al agregar */}
      {addBookMessage && (
        <div key="add-message" className={`p-4 rounded-lg text-center mb-4 ${addBookMessage.type === 'success' ? 'bg-green-600' : 'bg-red-600'} text-white`}>
          {addBookMessage.text}
          {addBookMessage.action && (
            <button onClick={addBookMessage.action} className="underline ml-2 hover:text-gray-200">
              Ir a inicio de sesión
            </button>
          )}
        </div>
      )}

      {/* Mensaje de error de búsqueda */}
      {searchErrorMessage && (
        <div className="p-4 rounded-lg bg-red-600 text-white text-center mb-4">
          {searchErrorMessage}
        </div>
      )}

      {/* Resultados */}
      <div className="w-full min-w-0">
        {isSearching ? (
          <LoadingSpinner />
        ) : (
          <BookList
            books={searchResults}
            isSearchList={true}
            onAdd={handleAddBook}
            emptyMessage={
              !hasSearched && !searchTerm.trim() ? (
                <div className="col-span-full py-12 text-center">
                  <p className="text-gray-400">Realiza una búsqueda para encontrar libros.</p>
                </div>
              ) : searchResults.length === 0 && hasSearched ? (
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