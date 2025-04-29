import React, { useState } from 'react';
import { SearchIcon } from '@heroicons/react/outline';

const Header = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  return (
    <header className="bg-gray-800 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto p-4 flex flex-col md:flex-row items-center justify-between">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-4 md:mb-0">
          TomeVault
        </h1>
        <form onSubmit={handleSearch} className="w-full md:w-1/2 flex items-center">
          <input
            type="text"
            className="flex-grow p-3 rounded-l-lg border-2 border-gray-700 bg-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            placeholder="Buscar libros..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            type="submit"
            className="p-3 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
          >
            <SearchIcon className="h-6 w-6" />
          </button>
        </form>
      </div>
    </header>
  );
};

export default Header;
