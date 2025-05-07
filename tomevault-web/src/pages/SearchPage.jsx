import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BookList from '../components/books/BookList';
import * as BookService from '../services/BookService';
import LoadingSpinner from '../components/common/LoadingSpinner';

const SearchPage = ({ isLoggedIn, onAdd }) => {
  const navigate = useNavigate();

  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [searchErrorMessage, setSearchErrorMessage] = useState(null);
  const [addBookMessage, setAddBookMessage] = useState(null);

  // Efecto para limpiar mensajes después de un tiempo
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

  // Maneja el envío del formulario de búsqueda
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      setSearchErrorMessage("Por favor, ingresa un término de búsqueda.");
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    setIsSearching(true);
    setHasSearched(true);
    setSearchErrorMessage(null);
    setAddBookMessage(null);

    try {
      const results = await BookService.searchGoogleBooks(searchTerm);
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
  };

  // Maneja la adición de un libro a la colección personal
  const handleAddBook = async (book) => {
    setAddBookMessage(null);

    if (!isLoggedIn) {
      setAddBookMessage({ type: 'error', text: "Debes iniciar sesión para agregar libros a tu colección." });
      setTimeout(() => navigate('/login'), 1500);
      return;
    }

    try {
      const addedBook = await onAdd(book.googleBookId);
      setAddBookMessage({ type: 'success', text: `"${addedBook.title}" agregado a tu colección.` });
    } catch (error) {
      let errorMessage = error.message || 'Error al agregar el libro.';

      if (errorMessage.includes("403") || errorMessage.includes("401") || errorMessage.includes("Unauthorized") || errorMessage.includes("session")) {
        errorMessage = "Tu sesión ha expirado o no tienes permisos. Por favor, inicia sesión de nuevo.";
        setTimeout(() => navigate('/login'), 2000);
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
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {isSearching ? 'Buscando...' : 'Buscar'}
          </button>
        </form>
      </div>

      {/* Muestra mensajes de éxito/error al añadir libro */}
      {addBookMessage && (
        <div className={`p-4 rounded-lg text-center mb-4 ${addBookMessage.type === 'success' ? 'bg-green-600' : 'bg-red-600'} text-white`}>
          {addBookMessage.text}
        </div>
      )}
      {/* Muestra mensajes de error de búsqueda */}
      {searchErrorMessage && (
        <div className="p-4 rounded-lg bg-red-600 text-white text-center mb-4">
          {searchErrorMessage}
        </div>
      )}

      <div className="w-full min-w-0">
        {/* Muestra spinner de carga o resultados de búsqueda */}
        {isSearching ? (
          <LoadingSpinner />
        ) : (
          <BookList
            books={searchResults}
            isSearchList={true}
            onAdd={handleAddBook}
            // Mensajes para diferentes estados de búsqueda
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
