import React, { useState } from 'react';
import BookList from '../components/books/BookList';
import * as BookService from '../services/BookService';
import LoadingSpinner from '../components/common/LoadingSpinner';

const SearchPage = ({ isLoggedIn }) => {
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setIsSearching(true);
    setHasSearched(true);

    try {
      const results = await BookService.searchGoogleBooks(searchTerm);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching books:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddBook = (book) => {
    console.log('Agregando libro:', book);
    // Lógica para agregar libro
  };

  return (
    <div className="w-full">
      <div className="mb-8 w-full">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-6">
          Buscar Libros
        </h2>
        <form onSubmit={handleSearch} className="flex gap-4 w-full max-w-2xl">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar libros en Google Books..."
            className="flex-1 p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
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

      <div className="w-full min-w-0">
        {isSearching ? (
          <LoadingSpinner />
        ) : (
          <BookList
            books={searchResults}
            isSearchList={true}
            onAdd={handleAddBook}
            emptyMessage={
              <div className="col-span-full py-12 text-center">
                <div className="bg-gray-800 p-6 rounded-lg inline-block">
                  {hasSearched ? (
                    <>
                      <p className="text-gray-400 mb-4">No se encontraron resultados</p>
                      <button
                        onClick={() => setSearchTerm('')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
                      >
                        Intentar otra búsqueda
                      </button>
                    </>
                  ) : (
                    <p className="text-gray-400">Realiza una búsqueda para encontrar libros</p>
                  )}
                </div>
              </div>
            }
          />
        )}
      </div>
    </div>
  );
};

export default SearchPage;