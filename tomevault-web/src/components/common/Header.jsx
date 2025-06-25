import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  MenuIcon, 
  XIcon, 
  UserIcon, 
  CogIcon, 
  LogoutIcon,
  ChevronDownIcon,
  BookOpenIcon,
  SearchIcon,
  UserGroupIcon,
  LockClosedIcon // Added for Admin Panel icon
} from '@heroicons/react/outline';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const mobileMenuRef = useRef(null);

  /**
   * Closes both mobile and user dropdown menus when a link is clicked.
   */
  const handleLinkClick = () => {
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
  };

  /**
   * Handles user logout and closes all open menus.
   */
  const handleLogoutClick = () => {
    logout();
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
  };

  /**
   * Toggles the visibility of the user dropdown menu.
   */
  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  // Region: Accessibility and UX Effects
  // ---

  /**
   * Effect to close menus on 'Escape' key press.
   */
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  /**
   * Effect to close menus when clicking outside their respective boundaries.
   */
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check for user menu
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
      // Check for mobile menu (prevents closure when clicking the toggle button)
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target) && 
          !event.target.closest('button[aria-label="Toggle menu"]')) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /**
   * Effect to prevent body scrolling when the mobile menu is open (UX enhancement).
   */
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    // Cleanup function ensures scroll is reset when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  // ---
  // End Region: Accessibility and UX Effects

  const isAdmin = user?.roles?.some(r => ['ADMIN', 'SUPER_ADMIN'].includes(r));
  const userDisplayName = user?.username || 'Usuario';
  const userInitial = userDisplayName.charAt(0).toUpperCase();

  return (
    <header className="bg-gray-800 shadow-lg sticky top-0 z-50 w-full border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and left navigation container */}
          <div className="flex items-center">
            <Link 
              to="/" 
              className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 hover:from-blue-300 hover:to-purple-400 transition-all duration-300"
              aria-label="TomeVault - Home"
            >
              TomeVault
            </Link>
            
            {/* Primary Navigation - Desktop (Cleaned up: Admin Panel moved to dropdown) */}
            <nav className="hidden lg:flex lg:items-center lg:space-x-2 ml-10" aria-label="Main navigation">
              {isAuthenticated() && (
                <Link 
                  to="/" 
                  className="flex items-center gap-2 text-gray-300 hover:text-white transition-all duration-200 font-medium px-3 py-2 rounded-lg hover:bg-gray-700 group"
                >
                  <BookOpenIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  <span>Mis Libros</span>
                </Link>
              )}
              
              <Link 
                to="/search" 
                className="flex items-center gap-2 text-gray-300 hover:text-white transition-all duration-200 font-medium px-3 py-2 rounded-lg hover:bg-gray-700 group"
              >
                <SearchIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                <span>Buscar Libros</span>
              </Link>

              {/* 'About' Link - Visible to all, positioned at the end of primary links */}
              <Link 
                to="/about" 
                className="flex items-center gap-2 text-gray-300 hover:text-white transition-all duration-200 font-medium px-3 py-2 rounded-lg hover:bg-gray-700 group"
              >
                <UserGroupIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                <span>Acerca de</span>
              </Link>
              
              {/* NOTE: Admin Panel Link REMOVED from main nav for cleaner UI, now in user dropdown. */}
            </nav>
          </div>

          {/* Right Navigation / User Actions */}
          <div className="flex items-center gap-3">
            {/* User Menu - Desktop */}
            {isAuthenticated() ? (
              <div className="hidden lg:block relative" ref={userMenuRef}>
                <button 
                  onClick={toggleUserMenu}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-700 transition-all duration-200 group min-w-0"
                  aria-expanded={isUserMenuOpen}
                  aria-haspopup="true"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-200">
                    {userInitial}
                  </div>
                  <div className="text-left min-w-0 flex-1 hidden xl:block">
                    <p className="text-white font-medium text-sm truncate">{userDisplayName}</p>
                    <p className="text-gray-400 text-xs truncate">{user?.email}</p>
                  </div>
                  <ChevronDownIcon 
                    className={`h-4 w-4 text-gray-400 transition-all duration-300 flex-shrink-0 ${
                      isUserMenuOpen ? 'rotate-180' : ''
                    }`} 
                  />
                </button>
                
                {/* Dropdown menu with animation */}
                <div 
                  className={`absolute right-0 top-full mt-2 w-64 bg-gray-700 rounded-lg shadow-xl border border-gray-600 py-2 z-50 transition-all duration-200 origin-top-right ${
                    isUserMenuOpen 
                      ? 'opacity-100 scale-100 visible' 
                      : 'opacity-0 scale-95 invisible'
                  }`}
                  role="menu"
                  aria-orientation="vertical"
                >
                  {/* User info section */}
                  <div className="px-4 py-3 border-b border-gray-600">
                    <p className="text-white font-medium truncate">{userDisplayName}</p>
                    <p className="text-gray-400 text-sm truncate mt-1">{user?.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-900/50 text-blue-200 border border-blue-700">
                        {user?.roles?.[0] || 'USUARIO'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Menu Links */}
                  {/* Admin Panel Link: MOVED HERE to keep account options grouped. */}
                  {isAdmin && (
                    <Link 
                      to="/admin/users" 
                      className="flex items-center gap-3 px-4 py-3 text-red-300 hover:text-red-100 hover:bg-gray-600 transition-colors group border-b border-gray-600"
                      onClick={() => setIsUserMenuOpen(false)}
                      role="menuitem"
                    >
                      <LockClosedIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                      <span className="font-semibold">Panel de Admin</span>
                    </Link>
                  )}

                  <Link 
                    to="/settings" 
                    className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-600 transition-colors group"
                    onClick={() => setIsUserMenuOpen(false)}
                    role="menuitem"
                  >
                    <CogIcon className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
                    <span className="font-medium">Ajustes de Cuenta</span>
                  </Link>
                  
                  <button 
                    onClick={handleLogoutClick}
                    className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:text-red-300 hover:bg-gray-600 transition-colors text-left group"
                    role="menuitem"
                  >
                    <LogoutIcon className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    <span className="font-medium">Cerrar Sesión</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="hidden lg:flex items-center gap-3">
                <Link 
                  to="/login"
                  className="text-gray-300 hover:text-white transition-colors font-medium px-4 py-2 rounded-lg hover:bg-gray-700"
                >
                  Iniciar Sesión
                </Link>
                <Link 
                  to="/register"
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Registrarse
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle Button */}
            <div className="lg:hidden">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg transition-colors"
                aria-label="Toggle menu"
                aria-expanded={isMenuOpen}
              >
                {isMenuOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown with animation */}
        <div 
          ref={mobileMenuRef}
          className={`lg:hidden border-t border-gray-700 overflow-hidden transition-all duration-300 ease-in-out ${
            isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="px-2 pt-2 pb-3 space-y-1">
            {/* User info in mobile view */}
            {isAuthenticated() && (
              <div className="px-3 py-4 border-b border-gray-600 mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold shadow-lg">
                    {userInitial}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-white font-medium truncate">{userDisplayName}</p>
                    <p className="text-gray-400 text-sm truncate">{user?.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-900/50 text-blue-200 border border-blue-700">
                        {user?.roles?.[0] || 'USUARIO'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Mobile Navigation Links */}
            {isAuthenticated() && (
              <Link 
                to="/" 
                className="flex items-center gap-3 px-3 py-3 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                onClick={handleLinkClick}
              >
                <BookOpenIcon className="h-5 w-5" />
                <span className="font-medium">Mis Libros</span>
              </Link>
            )}
            
            <Link 
              to="/search" 
              className="flex items-center gap-3 px-3 py-3 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              onClick={handleLinkClick}
            >
              <SearchIcon className="h-5 w-5" />
              <span className="font-medium">Buscar</span>
            </Link>

            {/* 'About' Link in mobile view */}
            <Link 
              to="/about" 
              className="flex items-center gap-3 px-3 py-3 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              onClick={handleLinkClick}
            >
              <UserGroupIcon className="h-5 w-5" />
              <span className="font-medium">Acerca de</span>
            </Link>

            {/* Admin Panel Link in mobile view */}
            {isAdmin && (
              <Link 
                to="/admin/users" 
                className="flex items-center gap-3 px-3 py-3 text-red-300 hover:text-red-100 hover:bg-gray-700 rounded-lg transition-colors font-semibold"
                onClick={handleLinkClick}
              >
                <LockClosedIcon className="h-5 w-5" />
                <span>Panel de Admin</span>
              </Link>
            )}

            {isAuthenticated() && (
              <Link 
                to="/settings" 
                className="flex items-center gap-3 px-3 py-3 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                onClick={handleLinkClick}
              >
                <CogIcon className="h-5 w-5" />
                <span className="font-medium">Ajustes</span>
              </Link>
            )}

            {/* Mobile User Actions (Sign Out / Sign In / Register) */}
            <div className="pt-2 border-t border-gray-600 mt-2">
              {isAuthenticated() ? (
                <button 
                  onClick={handleLogoutClick}
                  className="flex items-center gap-3 w-full px-3 py-3 text-red-400 hover:text-red-300 hover:bg-gray-700 rounded-lg transition-colors text-left"
                >
                  <LogoutIcon className="h-5 w-5" />
                  <span className="font-medium">Cerrar Sesión</span>
                </button>
              ) : (
                <div className="space-y-2">
                  <Link 
                    to="/login"
                    className="flex items-center justify-center gap-3 px-3 py-3 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                    onClick={handleLinkClick}
                  >
                    <UserIcon className="h-5 w-5" />
                    <span className="font-medium">Iniciar Sesión</span>
                  </Link>
                  <Link 
                    to="/register"
                    className="flex items-center justify-center gap-3 px-3 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all shadow-lg"
                    onClick={handleLinkClick}
                  >
                    <span className="font-medium">Registrarse</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;