import React from 'react';
import BookCard from './BookCard';

const BookList = ({ books, isSearchList, emptyMessage, onAdd, onDelete }) => {
  return (
    <div className="w-full">
      {/* Responsive grid: starts at 2 cols on tiny screens, scales up */}
      <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2 sm:gap-3 w-full">
        {books.length > 0 ? (
          books.map((book) => (
            <BookCard 
              key={book.googleBookId || book.id || Math.random()} // Ensure unique key
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