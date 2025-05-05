import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MenuIcon, XIcon } from '@heroicons/react/outline'; // Importamos los iconos de hamburguesa y cierre

const Header = ({ isLoggedIn }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Estado para controlar la visibilidad del menú móvil

  return (
    <header className="bg-gray-800 shadow-lg sticky top-0 z-50 w-full">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between relative"> {/* Añadido relative para posicionamiento absoluto del menú */}
        <Link to="/" className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 flex-shrink-0">
          TomeVault
        </Link>

        {/* Botón de hamburguesa para móviles y tablets */}
        <div className="xl:hidden"> {/* Se oculta solo en pantallas XL y mayores */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
          >
            {isMenuOpen ? (
              <XIcon className="h-6 w-6" /> // Icono de cierre si el menú está abierto
            ) : (
              <MenuIcon className="h-6 w-6" /> // Icono de hamburguesa si el menú está cerrado
            )}
          </button>
        </div>

        {/* Menú de navegación - visible en desktop (XL y mayores), oculto por defecto en móvil/tablet */}
        {/* Posicionamiento absoluto y z-index para superponer el menú móvil/tablet */}
        <nav className={`
          xl:flex items-center space-x-4 
          ${isMenuOpen ? 'flex flex-col absolute top-full right-0 bg-gray-700 w-48 py-2 shadow-lg rounded-b-lg items-center space-x-0 space-y-2 z-40' : 'hidden'} 
          xl:static xl:w-auto xl:py-0 xl:shadow-none xl:rounded-none xl:flex-row xl:space-y-0
        `}>
          <Link 
            to="/" 
            className="p-2 text-gray-300 hover:text-white text-sm sm:text-base transition duration-200 w-full text-center xl:w-auto"
            onClick={() => setIsMenuOpen(false)} // Cierra el menú al hacer clic en una opción
          >
            Mis Libros
          </Link>
          <Link 
            to="/search" 
            className="p-2 text-gray-300 hover:text-white text-sm sm:text-base transition duration-200 w-full text-center xl:w-auto"
            onClick={() => setIsMenuOpen(false)} // Cierra el menú al hacer clic en una opción
          >
            Buscar
          </Link>
          {isLoggedIn ? (
            <button 
              // Estilo de botón plano
              className="text-red-400 hover:text-red-300 text-sm sm:text-base transition-colors w-full text-center py-2 px-3 sm:px-4 xl:w-auto"
              onClick={() => setIsMenuOpen(false)} // Cierra el menú al hacer clic en el botón
            >
              Cerrar Sesión
            </button>
          ) : (
            <button 
              // Estilo de botón plano
              className="text-green-400 hover:text-green-300 text-sm sm:text-base transition-colors w-full text-center py-2 px-3 sm:px-4 xl:w-auto"
              onClick={() => setIsMenuOpen(false)} // Cierra el menú al hacer clic en el botón
            >
              Iniciar Sesión
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
