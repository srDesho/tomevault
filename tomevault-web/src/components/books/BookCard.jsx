import React from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon, EyeIcon, TrashIcon } from '@heroicons/react/outline';


const BookCard = ({ book, isSearchList, onAdd, onDelete }) => {
  // Sets the image URL for the book cover or a placeholder if not available.
  const imageUrl = book.thumbnail || "https://placehold.co/400x600/1a202c/FFF?text=No+Cover";
  
  // Determina el ID correcto para el enlace de detalles.
  // Si es una lista de búsqueda, usa el googleBookId.
  // Si es la colección del usuario, usa googleBookId y si no existe (para libros manuales), usa el id interno.
  const detailId = isSearchList ? book.googleBookId : (book.googleBookId || book.id);
  const isLinkDisabled = !detailId; // Deshabilita el enlace si no hay ID válido
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
                  to={`/books/${detailId}`} // 
                  className={`bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded text-xs flex items-center justify-center gap-1 ${isLinkDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={(e) => { if (isLinkDisabled) e.preventDefault(); }} // Previene la navegación si el ID es nulo
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
              <>
              <Link
                to={`/books/${detailId}`} // <-- USA detailId (que ahora es book.googleBookId o id interno)
                className={`bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs flex items-center justify-center gap-1 ${isLinkDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={(e) => { if (isLinkDisabled) e.preventDefault(); }} // Previene la navegación si el ID es nulo
              >
                <EyeIcon className="h-3 w-3" />
                <span>Detalles</span>
              </Link>
            <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(`¿Estás seguro de eliminar "${book.title}"?`)) {
                      onDelete(book.id);
                    }
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
