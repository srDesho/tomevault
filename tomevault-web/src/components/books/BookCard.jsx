import React from 'react';

const BookCard = ({ book }) => {
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
        <p className="text-sm text-gray-400 italic mb-4 truncate w-full">{book.author}</p>
        <div className="mt-auto w-full">
          <button className="w-full p-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
            Ver detalles
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookCard;
