import React from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpenIcon, 
  SearchIcon, 
  UserGroupIcon,
  HeartIcon,
  MailIcon
} from '@heroicons/react/outline';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 border-t border-gray-800">
      {/* Main footer section with grid layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Brand and description column */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
              TomeVault
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Tu contador personal de lecturas. Registra y haz seguimiento de todos los libros 
              que has leído y los que planeas leer.
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <HeartIcon className="h-4 w-4 text-red-400" />
              <span>Hecho con pasión por la lectura</span>
            </div>
          </div>

          {/* Navigation links column */}
          <div className="space-y-4">
            <h4 className="text-white font-semibold text-lg mb-4">Navegación</h4>
            <nav className="flex flex-col space-y-3">
              <Link 
                to="/" 
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
              >
                <BookOpenIcon className="h-4 w-4 group-hover:scale-110 transition-transform" />
                <span>Mis Libros</span>
              </Link>
              <Link 
                to="/search" 
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
              >
                <SearchIcon className="h-4 w-4 group-hover:scale-110 transition-transform" />
                <span>Buscar Libros</span>
              </Link>
              <Link 
                to="/about" 
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
              >
                <UserGroupIcon className="h-4 w-4 group-hover:scale-110 transition-transform" />
                <span>Acerca de</span>
              </Link>
            </nav>
          </div>

          {/* Features column */}
          <div className="space-y-4">
            <h4 className="text-white font-semibold text-lg mb-4">Lo que ofrece</h4>
            <nav className="flex flex-col space-y-3">
              <div className="text-gray-400 text-sm">
                Contador de lecturas por libro
              </div>
              <div className="text-gray-400 text-sm">
                Biblioteca personal
              </div>
              <div className="text-gray-400 text-sm">
                Búsqueda de libros
              </div>
              <div className="text-gray-400 text-sm">
                Gestión de colección
              </div>
            </nav>
          </div>

          {/* Contact information column */}
          <div className="space-y-4">
            <h4 className="text-white font-semibold text-lg mb-4">Contacto</h4>
            
            {/* Email contact */}
            <div className="flex items-start gap-2 text-sm">
              <MailIcon className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-gray-400">Contáctame:</p>
                <a 
                  href="mailto:cristianmo775@gmail.com" 
                  className="text-blue-400 hover:text-blue-300 transition-colors break-all"
                >
                  cristianmo775@gmail.com
                </a>
              </div>
            </div>

            {/* GitHub link */}
            <div className="space-y-2">
              <p className="text-gray-400 text-sm">Código fuente:</p>
              <a
                href="https://github.com/srDesho"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors text-sm block"
              >
                GitHub - srDesho
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar with copyright and attribution */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            
            {/* Copyright and credits */}
            <div className="text-sm text-gray-500 text-center md:text-left">
              <p className="flex items-center gap-2 justify-center md:justify-start">
                <span>© {currentYear} TomeVault.</span>
                <span className="hidden sm:inline">Todos los derechos reservados.</span>
              </p>
              <p className="mt-1 flex items-center gap-1 justify-center md:justify-start">
                <span>Desarrollado por</span>
                <span className="text-blue-400 font-medium">Cristian</span>
              </p>
            </div>

            {/* Project note */}
            <div className="text-xs text-gray-600 text-center md:text-right">
              <p>
                Proyecto de portfolio •{' '}
                <a 
                  href="https://github.com/srDesho/tomevault" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-400 transition-colors"
                >
                  Ver código en GitHub
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;