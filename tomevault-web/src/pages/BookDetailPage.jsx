import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import * as BookService from '../services/BookService';
import * as AuthService from '../services/AuthService';
import { PlusIcon, MinusIcon, BookmarkIcon } from '@heroicons/react/outline';
import LoadingSpinner from '../components/common/LoadingSpinner';

const BookDetailPage = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const [bookDetails, setBookDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [readCount, setReadCount] = useState(0);
  const [showIncrementModal, setShowIncrementModal] = useState(false);
  const [showDecrementModal, setShowDecrementModal] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [internalId, setInternalId] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(AuthService.isAuthenticated());

  useEffect(() => {
    const fetchBook = async () => {
      try {
        setLoading(true);
        setMessage(null);
        const book = await BookService.getBookById(bookId);
        
        if (!book) {
          throw new Error('Libro no encontrado');
        }

        setBookDetails(book);
        setReadCount(book.readCount || 0);
        setInternalId(book.id);
      } catch (error) {
        console.error("Error fetching book:", error);
        setError(error);
        setMessage({ 
          type: 'error', 
          text: error.message || "Error al cargar los detalles del libro." 
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchBook();
  }, [bookId]);

  const handleIncrement = async () => {
    if (!isLoggedIn) {
      setMessage({ type: 'error', text: "Debes iniciar sesión para registrar lecturas" });
      setTimeout(() => navigate('/login'), 1500);
      return;
    }

    try {
      const updatedBook = await BookService.incrementReadCount(internalId);
      setReadCount(updatedBook.readCount);
      setMessage({ type: 'success', text: `Contador incrementado a ${updatedBook.readCount}` });
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  const handleDecrement = async () => {
    if (!isLoggedIn) return;

    try {
      const updatedBook = await BookService.decrementReadCount(internalId);
      setReadCount(updatedBook.readCount);
      setMessage({ type: 'success', text: `Contador decrementado a ${updatedBook.readCount}` });
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !bookDetails) {
    return (
      <div className="text-center py-16">
        <h3 className="text-xl text-red-400 mb-4">
          {message ? message.text : "Libro no encontrado o error al cargar."}
        </h3>
        <Link to="/" className="text-blue-400 hover:underline">
          Volver a la colección
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <Link to="/" className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-6 transition-colors">
          ← Volver
        </Link>

        {message && (
          <div className={`p-4 rounded-lg text-center mb-4 ${
            message.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          } text-white`}>
            {message.text}
          </div>
        )}

        <div className="bg-gray-800 rounded-xl shadow-xl overflow-hidden">
          <div className="flex flex-col md:flex-row items-start gap-6 p-4 md:p-6">
            {/* Imagen centrada y responsive */}
            <div className="flex justify-center w-full md:w-auto md:flex-shrink-0">
              <img
                src={bookDetails.thumbnail || "https://placehold.co/400x600/1a202c/FFF?text=No+Cover"}
                alt={`Portada de ${bookDetails.title}`}
                className="w-full max-w-[200px] md:max-w-[250px] rounded-lg shadow-lg object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://placehold.co/400x600/1a202c/FFF?text=No+Cover";
                }}
              />
            </div>

            {/* Contenido del libro */}
            <div className="flex-1 min-w-0 w-full">
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 text-center md:text-left">
                {bookDetails.title}
              </h1>
              <p className="text-xl text-gray-400 mb-6 text-center md:text-left">
                {bookDetails.author}
              </p>
              
              <div className="prose prose-invert max-w-none mb-8">
                <div 
                  className="text-gray-300"
                  dangerouslySetInnerHTML={{ 
                    __html: bookDetails.description || "No hay descripción disponible." 
                  }}
                />
              </div>
              
              {/* Controles responsive */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mt-8">
                {/* Contador de lecturas - siempre visible */}
                <div className="flex items-center justify-center bg-gray-700 rounded-lg px-4 py-3">
                  <span className="text-blue-400 mr-2">📖</span>
                  <span className="font-medium">Lecturas:</span>
                  <span className="ml-2 text-white">{readCount}</span>
                </div>
                
                {/* Botones - se apilan en móvil */}
                <div className="flex flex-col xs:flex-row gap-2 flex-1 justify-center sm:justify-end">
                  {isLoggedIn ? (
                    <>
                      <button
                        onClick={() => setShowIncrementModal(true)}
                        className="flex items-center justify-center bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg transition-colors flex-1 xs:flex-none"
                      >
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Añadir lectura
                      </button>
                      
                      <button
                        onClick={() => readCount > 0 && setShowDecrementModal(true)}
                        disabled={readCount <= 0}
                        className={`flex items-center justify-center px-4 py-3 rounded-lg transition-colors flex-1 xs:flex-none ${
                          readCount <= 0 
                            ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                            : 'bg-red-600 hover:bg-red-700 text-white'
                        }`}
                      >
                        <MinusIcon className="h-5 w-5 mr-2" />
                        Quitar lectura
                      </button>
                    </>
                  ) : (
                    <div className="text-yellow-400 text-sm text-center py-2">
                      Inicia sesión para registrar lecturas
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para incrementar */}
      {showIncrementModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 p-8 rounded-lg shadow-2xl max-w-sm w-full text-center">
            <BookmarkIcon className="h-16 w-16 text-blue-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">
              ¿Registrar nueva lectura?
            </h3>
            <p className="text-gray-300 mb-6">
              El contador para "{bookDetails.title}" aumentará en 1.
            </p>
            <div className="flex justify-center gap-4">
              <button 
                onClick={() => {
                  handleIncrement();
                  setShowIncrementModal(false);
                }}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
              >
                Confirmar
              </button>
              <button 
                onClick={() => setShowIncrementModal(false)}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para decrementar */}
      {showDecrementModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 p-8 rounded-lg shadow-2xl max-w-sm w-full text-center">
            <BookmarkIcon className="h-16 w-16 text-blue-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">
              ¿Quitar una lectura?
            </h3>
            <p className="text-gray-300 mb-6">
              El contador para "{bookDetails.title}" disminuirá en 1.
            </p>
            <div className="flex justify-center gap-4">
              <button 
                onClick={() => {
                  handleDecrement();
                  setShowDecrementModal(false);
                }}
                className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition"
              >
                Confirmar
              </button>
              <button 
                onClick={() => setShowDecrementModal(false)}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BookDetailPage;