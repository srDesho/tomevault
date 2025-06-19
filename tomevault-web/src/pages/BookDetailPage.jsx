// Book detail page showing book information and read count management
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import * as BookService from '../services/BookService';
import * as AuthService from '../services/AuthService';
import { PlusIcon, MinusIcon, BookmarkIcon, ArrowLeftIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/outline';
import LoadingSpinner from '../components/common/LoadingSpinner';

const BookDetailPage = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  
  const [bookDetails, setBookDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [readCount, setReadCount] = useState(0);
  const [showIncrementModal, setShowIncrementModal] = useState(false);
  const [showDecrementModal, setShowDecrementModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [internalId, setInternalId] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(AuthService.isAuthenticated());
  const [isInCollection, setIsInCollection] = useState(false);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        setLoading(true);
        setToast(null);
        
        // Try to get book - this will check collection first, then Google API
        const book = await BookService.getBookById(bookId);
        
        if (!book) {
          throw new Error('Libro no encontrado');
        }

        setBookDetails(book);
        
        // Check if book is from user's collection
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
        console.error("Error fetching book:", error);
        showToast('error', error.message || "Error al cargar los detalles del libro.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchBook();
  }, [bookId]);

  // Show toast notification with auto-dismiss
  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleIncrement = async () => {
    if (!isLoggedIn) {
      showToast('error', "Debes iniciar sesión para registrar lecturas");
      setTimeout(() => navigate('/login'), 1500);
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
      showToast('error', error.message);
    }
  };

  const handleDecrement = async () => {
    if (!isLoggedIn) {
      showToast('error', "Debes iniciar sesión para registrar lecturas");
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
      showToast('error', error.message);
    }
  };

  const handleAddToCollection = async () => {
    if (!isLoggedIn) {
      showToast('error', "Debes iniciar sesión para agregar libros");
      setTimeout(() => navigate('/login'), 1500);
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
      showToast('error', error.message || "Error al agregar el libro a tu colección");
    }
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
          <Link to="/" className="text-blue-400 hover:text-blue-300 text-sm sm:text-base">
            Volver a la colección
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-2 sm:px-4 max-w-full overflow-x-hidden">
      <div className="max-w-6xl mx-auto">
        {/* Page Title - Consistent with other pages */}
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-4 sm:mb-6 text-center px-2 leading-tight">
          Detalles del Libro
        </h2>

        {/* Back Button */}
        <Link 
          to="/" 
          className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-4 sm:mb-6 transition-colors text-sm sm:text-base"
        >
          <ArrowLeftIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
          Volver
        </Link>

        {/* Toast notification - appears in top right corner */}
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

        {/* Book Details Card */}
        <div className="bg-gray-800 rounded-lg sm:rounded-xl shadow-xl overflow-hidden border border-gray-700">
          <div className="flex flex-col md:flex-row items-start gap-4 sm:gap-6 p-4 sm:p-6">
            {/* Book Cover - Centered and responsive */}
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

            {/* Book Information */}
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
              
              {/* Warning message - only show if NOT in collection */}
              {!isInCollection && (
                <div className="mb-4 p-3 bg-yellow-900 bg-opacity-20 border border-yellow-600 rounded-lg">
                  <p className="text-yellow-400 text-sm text-center">
                    ⚠️ Este libro no está en tu colección. Agrégalo para poder registrar lecturas.
                  </p>
                </div>
              )}
              
              {/* Read Count and Actions - Responsive */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mt-6 sm:mt-8">
                {/* Read Counter */}
                <div className="flex items-center justify-center bg-gray-700 rounded-lg px-4 py-3 border border-gray-600">
                  <BookmarkIcon className="h-5 w-5 text-blue-400 mr-2" />
                  <span className="font-medium text-sm sm:text-base">Lecturas:</span>
                  <span className="ml-2 text-white font-semibold text-sm sm:text-base">{readCount}</span>
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-col xs:flex-row gap-2 flex-1 justify-center sm:justify-end">
                  {isLoggedIn ? (
                    <>
                      {isInCollection ? (
                        // Book is in collection - show increment/decrement buttons
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
                        // Book is NOT in collection - show add button
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
                    <div className="text-yellow-400 text-xs sm:text-sm text-center py-2 px-4 bg-yellow-900 bg-opacity-20 rounded-lg border border-yellow-600">
                      Inicia sesión para registrar lecturas
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Increment Read Count */}
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

      {/* Modal: Decrement Read Count */}
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