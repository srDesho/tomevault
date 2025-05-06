import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import * as BookService from '../services/BookService';
import { PlusIcon, MinusIcon, BookmarkIcon } from '@heroicons/react/outline';
import LoadingSpinner from '../components/common/LoadingSpinner';

const BookDetailPage = () => {
  // Retrieves the book ID from URL parameters.
  const { bookId } = useParams();
  const [bookDetails, setBookDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [readCount, setReadCount] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState(null); // For success/error messages.

  // Fetches book details when the component mounts or bookId changes.
  useEffect(() => {
    const fetchBook = async () => {
      try {
        setLoading(true);
        setMessage(null); // Clears previous messages.
        const book = await BookService.getBookById(bookId);
        setBookDetails(book);
        if (book) {
          setReadCount(book.readCount);
        }
      } catch (error) {
        console.error("Error fetching book:", error);
        setMessage({ type: 'error', text: error.message || "Error al cargar los detalles del libro." });
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [bookId]);

  // Handles incrementing or decrementing the read count.
  const handleCountChange = async (amount) => {
    const newCount = Math.max(0, readCount + amount);
    // Updates only if the count actually changes.
    if (newCount === readCount) {
      setShowModal(false);
      return;
    }

    try {
      setMessage(null); // Clears previous messages.
      // Calls the service to update the count in the backend.
      const updatedBook = await BookService.updateReadCount(bookId, newCount);
      setReadCount(updatedBook.readCount);
      setMessage({ type: 'success', text: `Contador de lecturas actualizado a ${updatedBook.readCount}.` });
    } catch (error) {
      console.error("Error updating count:", error);
      setMessage({ type: 'error', text: error.message || "Error al actualizar el contador de lecturas." });
    } finally {
      setShowModal(false);
    }
  };

  // Displays a loading spinner while data is being fetched.
  if (loading) {
    return <LoadingSpinner />;
  }

  // Displays an error message if the book is not found or there's an issue.
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
      <div className="max-w-6xl mx-auto">
        {/* Link to go back to the homepage. */}
        <Link to="/" className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-6 transition-colors">
          ← Volver
        </Link>

        {/* Displays success or error messages. */}
        {message && (
          <div className={`p-4 rounded-lg text-center mb-4 ${message.type === 'success' ? 'bg-green-600' : 'bg-red-600'} text-white`}>
            {message.text}
          </div>
        )}

        <div className="bg-gray-800 rounded-xl shadow-xl overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Book cover section. */}
            <div className="md:w-1/3 lg:w-1/4 p-4 md:p-6">
              <img
                src={bookDetails.thumbnail || "https://placehold.co/400x600/1a202c/FFF?text=No+Cover"}
                alt={`Portada de ${bookDetails.title}`}
                className="w-full rounded-lg shadow-lg"
              />
            </div>
            
            {/* Book details section. */}
            <div className="md:w-2/3 lg:w-3/4 p-6">
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{bookDetails.title}</h1>
              <p className="text-xl text-gray-400 mb-6">{bookDetails.author}</p>
              
              {/* Book description. */}
              <div className="prose prose-invert max-w-none mb-8">
                <p className="text-gray-300">{bookDetails.description || "No hay descripción disponible."}</p>
              </div>
              
              {/* Read count controls. */}
              <div className="flex flex-wrap items-center gap-4 mt-8">
                {/* Displays current read count. */}
                <div className="flex items-center bg-gray-700 rounded-lg px-4 py-3">
                  <span className="text-blue-400 mr-2">📖</span>
                  <span className="font-medium">Lecturas:</span>
                  <span className="ml-2 text-white">{readCount}</span>
                </div>
                
                {/* Button to add a read (opens confirmation modal). */}
                <button
                  onClick={() => setShowModal(true)}
                  className="flex items-center bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg transition-colors"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Añadir lectura
                </button>
                
                {/* Button to remove a read. */}
                <button
                  onClick={() => handleCountChange(-1)}
                  disabled={readCount <= 0}
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                    readCount <= 0 
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                >
                  <MinusIcon className="h-5 w-5 mr-2" />
                  Quitar lectura
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation modal for adding a read. */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 p-8 rounded-lg shadow-2xl max-w-sm w-full text-center">
            <BookmarkIcon className="h-16 w-16 text-blue-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">¿Quieres registrar una nueva lectura?</h3>
            <p className="text-gray-300 mb-6">El contador para "{bookDetails.title}" se incrementará en 1.</p>
            <div className="flex justify-center gap-4">
              {/* Button to confirm and add read. */}
              <button 
                onClick={() => handleCountChange(1)}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
              >
                Confirmar
              </button>
              {/* Button to cancel. */}
              <button 
                onClick={() => setShowModal(false)}
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
