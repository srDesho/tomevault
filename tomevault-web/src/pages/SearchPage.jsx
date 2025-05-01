import React, { useState } from 'react';
import BookList from '../components/books/BookList';
import * as BookService from '../services/BookService'; // Importamos el servicio de libros

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
      // Llamada al servicio de búsqueda para obtener los libros.
      // Corregido: Ahora se llama a la función `searchGoogleBooks`
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
    // Lógica para agregar el libro a 'Mis Libros'
    console.log('Agregando libro:', book);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Barra de búsqueda */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-6">
          Buscar Libros
        </h2>
        
        <form onSubmit={handleSearch} className="flex gap-4 max-w-2xl">
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

      {/* Contenedor de resultados con altura mínima */}
      <div className="w-full">
        {isSearching ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin text-4xl mb-4">🔍</div>
              <p className="text-gray-400">Buscando libros...</p>
            </div>
          </div>
        ) : (
          <BookList 
            books={searchResults} 
            isSearchList={true} 
            isLoggedIn={isLoggedIn}
            onAdd={handleAddBook}
          />
        )}
      </div>
    </div>
  );
};

export default SearchPage;
