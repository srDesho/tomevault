import React from 'react';
import BookCard from './BookCard';

const BookList = ({ books, isSearchList, isLoggedIn, onAdd }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
        <div className="col-span-full flex justify-center items-center min-h-[200px]">
          <p className="text-center text-gray-400">No se encontraron libros.</p>
        </div>
      )}
    </div>
  );
};

export default BookList;
