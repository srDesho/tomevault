import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import * as BookService from '../services/BookService';
import * as AuthService from '../services/AuthService';
import { 
  PlusIcon, 
  MinusIcon, 
  BookmarkIcon, 
  ArrowLeftIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  LoginIcon 
} from '@heroicons/react/outline';
import LoadingSpinner from '../components/common/LoadingSpinner';

const BookDetailPage = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [bookDetails, setBookDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [readCount, setReadCount] = useState(0);
  const [showIncrementModal, setShowIncrementModal] = useState(false);
  const [showDecrementModal, setShowDecrementModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [internalId, setInternalId] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(AuthService.isAuthenticated());
  const [isInCollection, setIsInCollection] = useState(false);

  // Check if session is still valid
  const checkSessionValidity = () => {
    const stillLoggedIn = AuthService.isAuthenticated();
    if (!stillLoggedIn && isLoggedIn) {
      // Session expired
      setIsLoggedIn(false);
      showToast('error', 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
      setTimeout(() => navigate('/login', { state: { from: location.pathname } }), 2000);
      return false;
    }
    return stillLoggedIn;
  };

  useEffect(() => {
    if (location.state?.from) {
      sessionStorage.setItem('bookDetailSource', location.state.from);
    }
  }, [location.state]);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        setLoading(true);
        setToast(null);
        
        const book = await BookService.getBookById(bookId);
        
        if (!book) {
          throw new Error('Libro no encontrado');
        }

        setBookDetails(book);
        
        if (book.fromUserCollection && book.id) {
          setIsInCollection(true);
          setInternalId(book.id);
          setReadCount(book.readCount || 0);
        } else {
          setIsInCollection(false);
          setInternalId(null);
          setReadCount(0);
        }
        
      } catch (error) {
        if (error.message === 'Sesión expirada') {
          return;
        }
        console.error("Error fetching book:", error);
        showToast('error', error.message || "Error al cargar los detalles del libro.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchBook();
  }, [bookId]);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleIncrement = async () => {
    // Check session validity before proceeding
    if (!checkSessionValidity()) {
      return;
    }

    if (!isInCollection || !internalId) {
      showToast('error', "Primero debes agregar este libro a tu colección");
      return;
    }

    try {
      const updatedBook = await BookService.incrementReadCount(internalId);
      setReadCount(updatedBook.readCount);
      showToast('success', `Contador incrementado a ${updatedBook.readCount}`);
    } catch (error) {
      if (error.message === 'Sesión expirada') {
        handleSessionExpired();
        return;
      }
      showToast('error', error.message);
    }
  };

  const handleDecrement = async () => {
    // Check session validity before proceeding
    if (!checkSessionValidity()) {
      return;
    }

    if (!isInCollection || !internalId) {
      showToast('error', "Este libro no está en tu colección");
      return;
    }

    try {
      const updatedBook = await BookService.decrementReadCount(internalId);
      setReadCount(updatedBook.readCount);
      showToast('success', `Contador decrementado a ${updatedBook.readCount}`);
    } catch (error) {
      if (error.message === 'Sesión expirada') {
        handleSessionExpired();
        return;
      }
      showToast('error', error.message);
    }
  };

  const handleAddToCollection = async () => {
    // Check session validity before proceeding
    if (!checkSessionValidity()) {
      return;
    }

    try {
      showToast('info', "Agregando libro a tu colección...");
      const addedBook = await BookService.saveBookFromGoogle(bookDetails.googleBookId);
      setInternalId(addedBook.id);
      setReadCount(addedBook.readCount || 0);
      setIsInCollection(true);
      setBookDetails(addedBook);
      showToast('success', `"${bookDetails.title}" agregado a tu colección`);
    } catch (error) {
      if (error.message === 'Sesión expirada') {
        handleSessionExpired();
        return;
      }
      showToast('error', error.message || "Error al agregar el libro a tu colección");
    }
  };

  const handleSessionExpired = () => {
    setIsLoggedIn(false);
    showToast('error', 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
    setTimeout(() => navigate('/login', { state: { from: location.pathname } }), 2000);
  };

  const handleGoBack = () => {
    const source = sessionStorage.getItem('bookDetailSource');
    sessionStorage.removeItem('bookDetailSource');
    
    if (source === 'search') {
      navigate('/search');
    } else {
      navigate('/');
    }
  };

  const getBackButtonText = () => {
    const source = sessionStorage.getItem('bookDetailSource');
    return source === 'search' ? 'Volver a búsqueda' : 'Volver a mi colección';
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!bookDetails) {
    return (
      <div className="w-full px-2 sm:px-4 max-w-full overflow-x-hidden">
        <div className="max-w-6xl mx-auto text-center py-12 sm:py-16">
          <h3 className="text-lg sm:text-xl text-red-400 mb-4">
            {toast ? toast.message : "Libro no encontrado o error al cargar."}
          </h3>
          <button 
            onClick={handleGoBack}
            className="text-blue-400 hover:text-blue-300 text-sm sm:text-base"
          >
            {getBackButtonText()}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-2 sm:px-4 max-w-full overflow-x-hidden">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-4 sm:mb-6 text-center px-2 leading-tight">
          Detalles del Libro
        </h2>

        <button 
          onClick={handleGoBack}
          className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-4 sm:mb-6 transition-colors text-sm sm:text-base"
        >
          <ArrowLeftIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
          {getBackButtonText()}
        </button>

        {toast && (
          <div className={`fixed top-20 right-4 z-50 p-4 rounded-lg shadow-2xl flex items-center gap-3 animate-slide-in max-w-md ${
            toast.type === 'success' 
              ? 'bg-green-600 text-white' 
              : toast.type === 'error'
              ? 'bg-red-600 text-white'
              : 'bg-blue-600 text-white'
          }`}>
            {toast.type === 'success' ? (
              <CheckCircleIcon className="h-6 w-6 flex-shrink-0" />
            ) : (
              <XCircleIcon className="h-6 w-6 flex-shrink-0" />
            )}
            <span className="text-sm sm:text-base font-medium">{toast.message}</span>
          </div>
        )}

        <div className="bg-gray-800 rounded-lg sm:rounded-xl shadow-xl overflow-hidden border border-gray-700">
          <div className="flex flex-col md:flex-row items-start gap-4 sm:gap-6 p-4 sm:p-6">
            <div className="flex justify-center w-full md:w-auto md:flex-shrink-0">
              <img
                src={bookDetails.thumbnail || "https://placehold.co/400x600/1a202c/FFF?text=No+Cover"}
                alt={`Portada de ${bookDetails.title}`}
                className="w-full max-w-[180px] sm:max-w-[200px] md:max-w-[250px] rounded-lg shadow-lg object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://placehold.co/400x600/1a202c/FFF?text=No+Cover";
                }}
              />
            </div>

            <div className="flex-1 min-w-0 w-full">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2 text-center md:text-left break-words">
                {bookDetails.title}
              </h1>
              <p className="text-lg sm:text-xl text-gray-400 mb-4 sm:mb-6 text-center md:text-left">
                {bookDetails.author}
              </p>
              
              <div className="prose prose-invert max-w-none mb-6 sm:mb-8">
                <div 
                  className="text-sm sm:text-base text-gray-300 line-clamp-6 sm:line-clamp-none"
                  dangerouslySetInnerHTML={{ 
                    __html: bookDetails.description || "No hay descripción disponible." 
                  }}
                />
              </div>
              
              {!isLoggedIn && (
                <div className="mb-4 p-4 bg-blue-900 bg-opacity-30 border border-blue-500 rounded-lg">
                  <div className="flex items-start gap-3">
                    <LoginIcon className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-blue-200 text-sm font-medium mb-2">
                        Inicia sesión para gestionar este libro
                      </p>
                      <p className="text-blue-300 text-xs mb-3">
                        Podrás agregar el libro a tu colección y llevar un registro de tus lecturas.
                      </p>
                      <button
                        onClick={() => navigate('/login', { state: { from: location.pathname } })}
                        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        <LoginIcon className="h-4 w-4" />
                        Iniciar Sesión
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {isLoggedIn && !isInCollection && (
                <div className="mb-4 p-3 bg-yellow-900 bg-opacity-20 border border-yellow-600 rounded-lg">
                  <p className="text-yellow-400 text-sm text-center">
                    ⚠️ Este libro no está en tu colección. Agrégalo para poder registrar lecturas.
                  </p>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mt-6 sm:mt-8">
                {isInCollection && (
                  <div className="flex items-center justify-center bg-gray-700 rounded-lg px-4 py-3 border border-gray-600">
                    <BookmarkIcon className="h-5 w-5 text-blue-400 mr-2" />
                    <span className="font-medium text-sm sm:text-base">Lecturas:</span>
                    <span className="ml-2 text-white font-semibold text-sm sm:text-base">{readCount}</span>
                  </div>
                )}
                
                <div className="flex flex-col xs:flex-row gap-2 flex-1 justify-center sm:justify-end">
                  {isLoggedIn ? (
                    <>
                      {isInCollection ? (
                        <>
                          <button
                            onClick={() => setShowIncrementModal(true)}
                            className="flex items-center justify-center bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg transition-colors flex-1 xs:flex-none text-sm sm:text-base"
                          >
                            <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                            Añadir lectura
                          </button>
                          
                          <button
                            onClick={() => readCount > 0 && setShowDecrementModal(true)}
                            disabled={readCount <= 0}
                            className={`flex items-center justify-center px-4 py-3 rounded-lg transition-colors flex-1 xs:flex-none text-sm sm:text-base ${
                              readCount <= 0 
                                ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                                : 'bg-red-600 hover:bg-red-700 text-white'
                            }`}
                          >
                            <MinusIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                            Quitar lectura
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={handleAddToCollection}
                          className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-colors flex-1 xs:flex-none text-sm sm:text-base"
                        >
                          <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                          Agregar a mi colección
                        </button>
                      )}
                    </>
                  ) : (
                    <button
                      onClick={() => navigate('/login', { state: { from: location.pathname } })}
                      className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-colors text-sm sm:text-base"
                    >
                      <LoginIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                      Iniciar sesión
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showIncrementModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="bg-gray-800 p-6 sm:p-8 rounded-lg shadow-2xl max-w-sm w-full text-center mx-2 border border-gray-700">
            <BookmarkIcon className="h-12 w-12 sm:h-16 sm:w-16 text-blue-500 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
              ¿Registrar nueva lectura?
            </h3>
            <p className="text-sm sm:text-base text-gray-300 mb-6 break-words">
              El contador para "{bookDetails.title}" aumentará en 1.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4">
              <button 
                onClick={() => {
                  handleIncrement();
                  setShowIncrementModal(false);
                }}
                className="bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-blue-700 transition text-sm sm:text-base order-2 sm:order-1"
              >
                Confirmar
              </button>
              <button 
                onClick={() => setShowIncrementModal(false)}
                className="bg-gray-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-gray-700 transition text-sm sm:text-base order-1 sm:order-2"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {showDecrementModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="bg-gray-800 p-6 sm:p-8 rounded-lg shadow-2xl max-w-sm w-full text-center mx-2 border border-gray-700">
            <BookmarkIcon className="h-12 w-12 sm:h-16 sm:w-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
              ¿Quitar una lectura?
            </h3>
            <p className="text-sm sm:text-base text-gray-300 mb-6 break-words">
              El contador para "{bookDetails.title}" disminuirá en 1.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4">
              <button 
                onClick={() => {
                  handleDecrement();
                  setShowDecrementModal(false);
                }}
                className="bg-red-500 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-red-600 transition text-sm sm:text-base order-2 sm:order-1"
              >
                Confirmar
              </button>
              <button 
                onClick={() => setShowDecrementModal(false)}
                className="bg-gray-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-gray-700 transition text-sm sm:text-base order-1 sm:order-2"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default BookDetailPage;