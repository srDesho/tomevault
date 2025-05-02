import React from 'react';
import { Link } from 'react-router-dom';

const Header = ({ isLoggedIn }) => {
  return (
    <header className="bg-gray-800 shadow-lg sticky top-0 z-50 w-full">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
          TomeVault
        </Link>
        <nav className="flex items-center space-x-4">
          <Link to="/" className="p-2 text-gray-300 hover:text-white transition duration-200">
            Mis Libros
          </Link>
          <Link to="/search" className="p-2 text-gray-300 hover:text-white transition duration-200">
            Buscar
          </Link>
          {isLoggedIn ? (
            <button className="py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
              Cerrar Sesión
            </button>
          ) : (
            <button className="py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              Iniciar Sesión
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;