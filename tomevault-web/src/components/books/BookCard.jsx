import React from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon, EyeIcon, TrashIcon, BookOpenIcon } from '@heroicons/react/outline';

const BookCard = ({ book, isSearchList, onAdd, onDelete }) => {
  const imageUrl = book.thumbnail || "https://placehold.co/300x450/1a202c/FFF?text=No+Cover";
  const detailId = isSearchList ? book.googleBookId : (book.googleBookId || book.id);
  const isLinkDisabled = !detailId;

  // Truncate author name if too long to prevent layout overflow
  const truncateAuthor = (author) => {
    if (!author) return '';
    // Limit to 25 characters for clean display in small card
    if (author.length > 25) {
      return author.substring(0, 25) + '...';
    }
    return author;
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all overflow-hidden w-full h-[240px] flex flex-col">
      {/* Compact image section */}
      <div className="relative w-full h-[150px] overflow-hidden flex-shrink-0">
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
      {/* Compact content section */}
      <div className="p-2 flex flex-col h-[90px]">
        <div className="flex-1 min-h-0 mb-2">
          <h3
            className="font-medium text-white text-xs leading-tight line-clamp-2 mb-1 break-words"
            title={book.title}
          >
            {book.title}
          </h3>
          <p
            className="text-gray-400 text-xs break-words overflow-hidden"
            style={{ 
              display: '-webkit-box',
              WebkitLineClamp: 1,
              WebkitBoxOrient: 'vertical',
              lineHeight: '1.2'
            }}
            title={book.author}
          >
            {truncateAuthor(book.author)}
          </p>
        </div>
        <div className="flex justify-between items-center h-6 flex-shrink-0">
          {!isSearchList && (
            <div className="flex items-center flex-shrink-0 mr-1" title={`Leído ${book.readCount || 0} ${(book.readCount || 0) === 1 ? 'vez' : 'veces'}`}>
              <BookOpenIcon className="h-4 w-4 text-blue-400" />
              <span className="text-blue-400 text-xs ml-1 font-medium">
                {book.readCount || 0}
              </span>
            </div>
          )}
          <div className="flex gap-1 ml-auto flex-shrink-0">
            {isSearchList ? (
              <>
                <Link
                  to={`/books/${detailId}`}
                  className={`bg-gray-700 hover:bg-gray-600 text-white p-1 rounded text-xs flex items-center justify-center w-6 h-6 ${isLinkDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={(e) => { if (isLinkDisabled) e.preventDefault(); }}
                  title="Ver detalles"
                >
                  <EyeIcon className="h-3 w-3" />
                </Link>
                <button
                  onClick={() => onAdd(book)}
                  className="bg-green-600 hover:bg-green-700 text-white p-1 rounded text-xs flex items-center justify-center w-6 h-6"
                  title="Agregar a mi colección"
                >
                  <PlusIcon className="h-3 w-3" />
                </button>
              </>
            ) : (
              <>
                <Link
                  to={`/books/${detailId}`}
                  className={`bg-blue-600 hover:bg-blue-700 text-white p-1 rounded text-xs flex items-center justify-center w-6 h-6 ${isLinkDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                  className="bg-red-600 hover:bg-red-700 text-white p-1 rounded text-xs flex items-center justify-center w-6 h-6"
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