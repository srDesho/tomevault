import React from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon, EyeIcon, TrashIcon } from '@heroicons/react/outline';

const BookCard = ({ book, isSearchList, onAdd, onDelete }) => {
  const imageUrl = book.thumbnail || "https://placehold.co/400x600/1a202c/FFF?text=No+Cover";
  const detailId = isSearchList ? book.googleBookId : (book.googleBookId || book.id);
  const isLinkDisabled = !detailId;

  return (
    <div className="bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all overflow-hidden h-full flex flex-col">
      <div className="aspect-[2/3] relative">
        <img
          src={imageUrl}
          alt={`Portada de ${book.title}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://placehold.co/400x600/1a202c/FFF?text=No+Cover";
          }}
        />
      </div>
      
      <div className="p-3 flex-1 flex flex-col">
        <h3 className="font-medium text-white line-clamp-2 text-sm mb-1">{book.title}</h3>
        <p className="text-gray-400 text-xs line-clamp-1 mb-2">{book.author}</p>
        
        <div className="flex justify-between items-center mt-auto">
          {!isSearchList && (
            <span className="text-blue-400 text-xs flex items-center">
              <span className="mr-1">📖</span>
              {book.readCount || 0}x
            </span>
          )}
          
          <div className="flex gap-2">
            {isSearchList ? (
              <>
                <Link
                  to={`/books/${detailId}`}
                  className={`bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded text-xs flex items-center justify-center gap-1 ${isLinkDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={(e) => { if (isLinkDisabled) e.preventDefault(); }}
                >
                  <EyeIcon className="h-3 w-3" />
                  <span>Ver</span>
                </Link>
                <button
                  onClick={() => onAdd(book)}
                  className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs flex items-center justify-center gap-1"
                >
                  <PlusIcon className="h-3 w-3" />
                  <span>Agregar</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to={`/books/${detailId}`}
                  className={`bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs flex items-center justify-center gap-1 ${isLinkDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={(e) => { if (isLinkDisabled) e.preventDefault(); }}
                >
                  <EyeIcon className="h-3 w-3" />
                  <span>Detalles</span>
                </Link>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(book.id);
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs flex items-center justify-center gap-1"
                  title="Eliminar libro"
                >
                  <TrashIcon className="h-3 w-3" />
                  <span>Eliminar</span>
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