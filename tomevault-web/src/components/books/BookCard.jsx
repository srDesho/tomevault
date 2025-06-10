import React from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon, EyeIcon, TrashIcon } from '@heroicons/react/outline';

const BookCard = ({ book, isSearchList, onAdd, onDelete }) => {
  const imageUrl = book.thumbnail || "https://placehold.co/300x450/1a202c/FFF?text=No+Cover";
  const detailId = isSearchList ? book.googleBookId : (book.googleBookId || book.id);
  const isLinkDisabled = !detailId;
  
  return (
    <div className="bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all overflow-hidden w-full h-full min-h-[300px] max-h-[320px] flex flex-col">
      {/* Imagen con altura fija pero responsive */}
      <div className="relative w-full h-[160px] sm:h-[180px] overflow-hidden flex-shrink-0">
        <img
          src={imageUrl}
          alt={`Portada de ${book.title}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://placehold.co/300x450/1a202c/FFF?text=No+Cover";
          }}
        />
      </div>

      {/* Contenido flexible */}
      <div className="p-2 flex flex-col flex-grow justify-between min-h-[140px]">
        <div className="flex-1 overflow-hidden mb-1">
          <h3 
            className="font-medium text-white text-xs leading-tight line-clamp-2 mb-1 break-words" 
            title={book.title}
          >
            {book.title}
          </h3>
          <p 
            className="text-gray-400 text-xs line-clamp-2 break-words" 
            title={book.author}
          >
            {book.author}
          </p>
        </div>

        <div className="flex justify-between items-center mt-auto pt-1">
          {!isSearchList && (
            <span className="text-blue-400 text-xs flex items-center flex-shrink-0 mr-1">
              <span className="mr-1 hidden xs:inline">📖</span>
              {book.readCount || 0}x
            </span>
          )}

          <div className="flex gap-1 ml-auto flex-shrink-0">
            {isSearchList ? (
              <>
                <Link
                  to={`/books/${detailId}`}
                  className={`bg-gray-700 hover:bg-gray-600 text-white p-1 rounded text-xs flex items-center justify-center ${isLinkDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={(e) => { if (isLinkDisabled) e.preventDefault(); }}
                  title="Ver detalles"
                >
                  <EyeIcon className="h-3 w-3" />
                </Link>
                <button
                  onClick={() => onAdd(book)}
                  className="bg-green-600 hover:bg-green-700 text-white p-1 rounded text-xs flex items-center justify-center"
                  title="Agregar a mi colección"
                >
                  <PlusIcon className="h-3 w-3" />
                </button>
              </>
            ) : (
              <>
                <Link
                  to={`/books/${detailId}`}
                  className={`bg-blue-600 hover:bg-blue-700 text-white p-1 rounded text-xs flex items-center justify-center ${isLinkDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={(e) => { if (isLinkDisabled) e.preventDefault(); }}
                  title="Ver detalles"
                >
                  <EyeIcon className="h-3 w-3" />
                </Link>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(book.id);
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white p-1 rounded text-xs flex items-center justify-center"
                  title="Eliminar libro"
                >
                  <TrashIcon className="h-3 w-3" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookCard;