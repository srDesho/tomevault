import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MenuIcon, XIcon } from '@heroicons/react/outline';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLinkClick = () => setIsMenuOpen(false);
  const handleLogoutClick = () => {
    logout();
    setIsMenuOpen(false);
  };

  const isAdmin = user?.roles?.some(r => ['ADMIN', 'SUPER_ADMIN'].includes(r));

  return (
    <header className="bg-gray-800 shadow-lg sticky top-0 z-50 w-full">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between relative">
        <Link to="/" className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 flex-shrink-0">
          TomeVault
        </Link>

        <div className="xl:hidden">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
          >
            {isMenuOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
          </button>
        </div>

        <nav className={`
          xl:flex items-center space-x-4 
          ${isMenuOpen ? 'flex flex-col absolute top-full right-0 bg-gray-700 w-48 py-2 shadow-lg rounded-b-lg items-center space-x-0 space-y-2 z-40' : 'hidden'} 
          xl:static xl:w-auto xl:py-0 xl:shadow-none xl:rounded-none xl:flex-row xl:space-y-0
        `}>
          {!isAdmin ? (
            <>
              <Link to="/" className="p-2 text-gray-300 hover:text-white text-sm sm:text-base transition duration-200 w-full text-center xl:w-auto" onClick={handleLinkClick}>
                Mis Libros
              </Link>
              <Link to="/search" className="p-2 text-gray-300 hover:text-white text-sm sm:text-base transition duration-200 w-full text-center xl:w-auto" onClick={handleLinkClick}>
                Buscar
              </Link>
            </>
          ) : (
            <Link to="/admin/users" className="p-2 text-red-300 hover:text-red-100 font-semibold text-sm sm:text-base transition duration-200 w-full text-center xl:w-auto" onClick={handleLinkClick}>
              Panel de Admin
            </Link>
          )}

          {isAuthenticated() && (
            <Link to="/settings" className="p-2 text-gray-300 hover:text-white text-sm sm:text-base transition duration-200 w-full text-center xl:w-auto" onClick={handleLinkClick}>
              Ajustes
            </Link>
          )}

          {isAuthenticated() ? (
            <button 
              className="text-red-400 hover:text-red-300 text-sm sm:text-base transition-colors w-full text-center py-2 px-3 sm:px-4 xl:w-auto"
              onClick={handleLogoutClick}
            >
              Cerrar Sesión
            </button>
          ) : (
            <Link 
              to="/login"
              className="text-green-400 hover:text-green-300 text-sm sm:text-base transition-colors w-full text-center py-2 px-3 sm:px-4 xl:w-auto"
              onClick={handleLinkClick}
            >
              Iniciar Sesión
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;