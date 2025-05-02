import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import * as BookService from '../services/BookService';
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
        console.error("Error fetching book:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [bookId]);

  const handleCountChange = async (amount) => {
    const newCount = Math.max(0, readCount + amount);
    setReadCount(newCount);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!bookDetails) {
    return (
      <div className="text-center py-16">
        <h3 className="text-xl text-red-400 mb-4">Libro no encontrado</h3>
        <Link to="/" className="text-blue-400 hover:underline">
          Volver a la colección
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <Link to="/" className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-6 transition-colors">
        ← Volver
      </Link>

      <div className="bg-gray-800 rounded-xl shadow-xl overflow-hidden">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/3 lg:w-1/4 p-4 md:p-6">
            <img
              src={bookDetails.thumbnail || "https://placehold.co/400x600/1a202c/FFF?text=No+Cover"}
              alt={`Portada de ${bookDetails.title}`}
              className="w-full rounded-lg shadow-lg"
            />
          </div>
          
          <div className="md:w-2/3 lg:w-3/4 p-6">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{bookDetails.title}</h1>
            <p className="text-xl text-gray-400 mb-6">{bookDetails.author}</p>
            
            <div className="prose prose-invert max-w-none mb-8">
              <p className="text-gray-300">{bookDetails.description || "No hay descripción disponible."}</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 mt-8">
              <div className="flex items-center bg-gray-700 rounded-lg px-4 py-3">
                <span className="text-blue-400 mr-2">📖</span>
                <span className="font-medium">Lecturas:</span>
                <span className="ml-2 text-white">{readCount}</span>
              </div>
              
              <button
                onClick={() => handleCountChange(1)}
                className="flex items-center bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg transition-colors"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Añadir lectura
              </button>
              
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
  );
};

export default BookDetailPage;