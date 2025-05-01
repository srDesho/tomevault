import React from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon } from '@heroicons/react/outline';

// Agregamos la prop onAdd para el botón "Agregar"
const BookCard = ({ book, isSearchList, onAdd }) => {
  return (
    <div className="bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden transform hover:scale-105">
      <img
        src={book.thumbnail}
        alt={`Portada de ${book.title}`}
        className="w-full h-48 object-cover rounded-t-xl"
        onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/128x194/FFF/000?text=No+Cover" }}
      />
      <div className="p-4 flex flex-col items-start">
        <h3 className="text-lg font-semibold text-white truncate w-full mb-1">{book.title}</h3>
        <p className="text-sm text-gray-400 italic mb-2 truncate w-full">{book.author}</p>
        {/* Muestra el contador de lecturas si no es una lista de búsqueda */}
        {!isSearchList && (
          <div className="flex items-center gap-1 text-sm text-gray-400 mb-2">
            📖 {book.readCount}
          </div>
        )}
        <div className="mt-auto w-full space-y-2">
          {isSearchList ? (
            <button
              className="w-full p-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center justify-center gap-1"
              onClick={() => onAdd(book)}
            >
              <PlusIcon className="h-4 w-4" /> Agregar
            </button>
          ) : (
            <Link 
              to={`/books/${book.id}`} 
              className="w-full p-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
            >
              Ver detalles
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookCard;