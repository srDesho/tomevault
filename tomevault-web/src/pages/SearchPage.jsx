import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import BookList from '../components/books/BookList';
import * as BookService from '../services/BookService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { SearchIcon } from '@heroicons/react/outline';
import { useAuth } from '../context/AuthContext';
import { useSearch } from '../context/SearchContext';

const SearchPage = ({ onAdd, refreshBooks }) => {
  const { isAuthenticated } = useAuth();
  const {
    searchTerm,
    setSearchTerm,
    searchResults,
    setSearchResults,
    searchScrollPosition,
    setSearchScrollPosition
  } = useSearch();
  const navigate = useNavigate();
  const location = useLocation();
  const searchContainerRef = useRef(null);

  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchErrorMessage, setSearchErrorMessage] = useState(null);
  const [addBookMessage, setAddBookMessage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentBook, setCurrentBook] = useState(null);

  const saveScrollPosition = () => {
    if (searchContainerRef.current) {
      setSearchScrollPosition(searchContainerRef.current.scrollTop);
    }
  };

  useEffect(() => {
    if (searchContainerRef.current && searchScrollPosition > 0) {
      searchContainerRef.current.scrollTop = searchScrollPosition;
    }
  }, [searchResults, searchScrollPosition]);

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

  useEffect(() => {
    if (searchResults.length > 0) {
      setHasSearched(true);
    }
  }, [searchResults]);

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
  }, [setSearchResults]);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const queryFromUrl = queryParams.get('query');

    if (queryFromUrl && queryFromUrl !== searchTerm) {
      setSearchTerm(queryFromUrl);
      executeSearch(queryFromUrl);
    } else if (searchTerm && !queryFromUrl) {
      navigate(`?query=${encodeURIComponent(searchTerm)}`, { replace: true });
    }
  }, [location.search, searchTerm, executeSearch, navigate, setSearchTerm]);

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

  const handleAddBook = async (book) => {
    setAddBookMessage(null);
    setCurrentBook(book);

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
      const status = await BookService.getBookStatus(book.googleBookId);

      if (status.existsActive) {
        setAddBookMessage({
          type: 'error',
          text: 'Este libro ya está en tu colección.',
        });
        return;
      }

      if (status.existsInactive) {
        setShowModal(true);
        return;
      }

      const addedBook = await onAdd(book.googleBookId);
      setAddBookMessage({
        type: 'success',
        text: `"${addedBook?.title || book.title}" agregado a tu colección.`,
      });

      if (refreshBooks && typeof refreshBooks === 'function') {
        await refreshBooks();
      }
    } catch (error) {
      if (error.message.includes('401') || error.message.includes('403')) {
        setAddBookMessage({
          type: 'error',
          text: 'Tu sesión ha expirado. Por favor, inicia sesión de nuevo.',
          action: () => navigate('/login'),
        });
      } else {
        setAddBookMessage({
          type: 'error',
          text: error.message || 'Error al verificar o agregar el libro.',
        });
      }
    }
  };

  const handleKeepProgress = async () => {
    try {
      const activated = await BookService.activateBook(currentBook.googleBookId, true);
      setAddBookMessage({
        type: 'success',
        text: `"${activated.title}" reactivado. Continuando desde tu último progreso.`,
      });
      setShowModal(false);

      if (typeof refreshBooks === 'function') {
        refreshBooks();
      }
    } catch (err) {
      console.error('Error al reactivar con progreso:', err);
      setAddBookMessage({
        type: 'error',
        text: 'Error al reactivar el libro.',
      });
      setShowModal(false);
    }
  };

  const handleStartFromZero = async () => {
    try {
      const activated = await BookService.activateBook(currentBook.googleBookId, false);
      setAddBookMessage({
        type: 'success',
        text: `"${activated.title}" reactivado. Contador reiniciado.`,
      });
      setShowModal(false);

      if (typeof refreshBooks === 'function') {
        refreshBooks();
      }
    } catch (err) {
      console.error('Error al reactivar sin progreso:', err);
      setAddBookMessage({
        type: 'error',
        text: 'Error al reactivar el libro.',
      });
      setShowModal(false);
    }
  };

  return (
    <div className="w-full" ref={searchContainerRef} onScroll={saveScrollPosition}>
      <div className="mb-8 w-full">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-6 text-center">
          Buscar Libros
        </h2>
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
      {searchErrorMessage && (
        <div className="p-4 rounded-lg bg-red-600 text-white text-center mb-4">
          {searchErrorMessage}
        </div>
      )}
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
      {showModal && currentBook && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-2xl max-w-sm w-full text-center">
            <h3 className="text-xl font-bold text-white mb-4">¿Reactivar este libro?</h3>
            <p className="text-gray-300 mb-6">
              Este libro fue eliminado anteriormente. ¿Desea volver a agregarlo a su colección?
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleKeepProgress}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
              >
                Reactivar (mantener progreso)
              </button>
              <button
                onClick={handleStartFromZero}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
              >
                Reactivar (empezar desde cero)
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchPage;