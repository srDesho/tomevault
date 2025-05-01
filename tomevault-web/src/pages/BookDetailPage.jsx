import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import * as BookService from '../services/BookService'; // Importamos el servicio
import { PlusIcon, MinusIcon, BookmarkIcon } from '@heroicons/react/outline';

const BookDetailPage = () => {
  const { bookId } = useParams();
  const [bookDetails, setBookDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [readCount, setReadCount] = useState(0);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        setLoading(true);
        const book = await BookService.getBookById(bookId);
        setBookDetails(book);
        if (book) {
          setReadCount(book.readCount);
        }
      } catch (error) {
        console.error("Error fetching book details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [bookId]);

  const handleIncrementRead = async () => {
    // Aquí puedes llamar al servicio para actualizar en el backend
    // const updatedBook = await BookService.updateReadCount(bookId);
    // setReadCount(updatedBook.readCount);
    setReadCount(readCount + 1);
    setShowModal(false);
  };

  const handleDecrementRead = () => {
    if (readCount > 0) {
      setReadCount(readCount - 1);
    }
  };

  if (loading) {
    return <p className="text-center text-xl text-gray-400">Cargando detalles del libro...</p>;
  }

  if (!bookDetails) {
    return <p className="text-center text-xl text-red-400">No se encontraron detalles para este libro.</p>;
  }

  return (
    <>
      <div className="flex flex-col md:flex-row gap-8 p-6 bg-gray-800 rounded-lg shadow-lg">
        <img 
          src={bookDetails.thumbnail} 
          alt={`Portada de ${bookDetails.title}`} 
          className="w-full md:w-1/3 h-auto object-cover rounded-lg shadow-xl" 
        />
        <div className="md:w-2/3 text-gray-200">
          <h1 className="text-3xl font-bold text-white">{bookDetails.title}</h1>
          <p className="text-xl text-gray-400">{bookDetails.author}</p>
          <p className="mt-4 text-lg text-gray-300">{bookDetails.description}</p>
          <div className="mt-6 flex items-center gap-4">
            <button 
              onClick={() => setShowModal(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600 transition duration-200"
            >
              <PlusIcon className="h-5 w-5" /> +1 Lectura
            </button>
            <button 
              onClick={handleDecrementRead}
              className="bg-red-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-600 transition duration-200"
            >
              <MinusIcon className="h-5 w-5" /> -1 Lectura
            </button>
            <span className="text-lg text-white">Total: {readCount}</span>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 p-8 rounded-lg shadow-2xl max-w-sm w-full text-center">
            <BookmarkIcon className="h-16 w-16 text-blue-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">¿Quieres registrar una nueva lectura?</h3>
            <p className="text-gray-300 mb-6">El contador para "{bookDetails.title}" se incrementará en 1.</p>
            <div className="flex justify-center gap-4">
              <button 
                onClick={handleIncrementRead}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
              >
                Confirmar
              </button>
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
