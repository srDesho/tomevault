import React from 'react';
import BookCard from './BookCard';

const BookList = ({ books, isSearchList, emptyMessage, onAdd }) => {
  return (
    <div className="w-full">
      {/* Ajuste de columnas: 1 en extra-pequeño, 2 en sm, 3 en md, 4 en lg, 5 en xl */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 w-full">
        {books.length > 0 ? (
          books.map(book => (
            <BookCard 
              key={book.id} 
              book={book} 
              isSearchList={isSearchList} 
              onAdd={onAdd}
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
