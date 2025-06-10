import React from 'react';
import BookCard from './BookCard';

const BookList = ({ books, isSearchList, emptyMessage, onAdd, onDelete }) => {
  return (
    <div className="w-full">
      {/* Grid responsive: 3 en móvil, 4 en sm, 5 en md, 6 en lg, 7 en xl */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3 w-full">
        {books.length > 0 ? (
          books.map(book => (
            <BookCard 
              key={book.googleBookId || book.id || Math.random()} // ✅ Asegura key única
              book={book} 
              isSearchList={isSearchList} 
              onAdd={onAdd}
              onDelete={onDelete}
            />
          ))
        ) : (
          <div className="col-span-full">
            {emptyMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookList;