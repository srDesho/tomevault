import React from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon, EyeIcon } from '@heroicons/react/outline';

const BookCard = ({ book, isSearchList, onAdd }) => {
  // Sets the image URL for the book cover or a placeholder if not available.
  const imageUrl = book.thumbnail || "https://placehold.co/400x600/1a202c/FFF?text=No+Cover";

  return (
    <div className="bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all overflow-hidden h-full flex flex-col">
      <div className="aspect-[2/3] relative">
        <img
          src={imageUrl}
          alt={`Portada de ${book.title}`}
          className="w-full h-full object-cover"
          // Handles image loading errors by replacing with a placeholder image.
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://placehold.co/400x600/1a202c/FFF?text=No+Cover";
          }}
        />
      </div>
      
      <div className="p-3 flex-1 flex flex-col">
        {/* Displays the book title, truncated if too long. */}
        <h3 className="font-medium text-white line-clamp-2 text-sm mb-1">{book.title}</h3>
        {/* Displays the book author, truncated if too long. */}
        <p className="text-gray-400 text-xs line-clamp-1 mb-2">{book.author}</p>
        
        <div className="flex justify-between items-center mt-auto">
          {/* Displays the read count only if it's not a search list. */}
          {!isSearchList && (
            <span className="text-blue-400 text-xs flex items-center">
              <span className="mr-1">📖</span>
              {book.readCount || 0}x
            </span>
          )}
          
          <div className="flex gap-2">
            {/* Renders different buttons based on whether it's a search list or not. */}
            {isSearchList ? (
              <>
                {/* Button to view book details from search results. */}
                <Link
                  to={`/books/${book.id}`}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded text-xs flex items-center justify-center gap-1"
                >
                  <EyeIcon className="h-3 w-3" />
                  <span>Ver</span>
                </Link>
                {/* Button to add the book to the personal collection. */}
                <button
                  onClick={() => onAdd(book)}
                  className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs flex items-center justify-center gap-1"
                >
                  <PlusIcon className="h-3 w-3" />
                  <span>Agregar</span>
                </button>
              </>
            ) : (
              // Button to view book details from the personal collection.
              <Link
                to={`/books/${book.id}`}
                className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs flex items-center justify-center gap-1"
              >
                <EyeIcon className="h-3 w-3" />
                <span>Detalles</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookCard;
