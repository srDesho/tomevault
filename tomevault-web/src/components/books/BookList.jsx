import React from 'react';
import BookCard from './BookCard';

const BookList = ({ books, isSearchList, emptyMessage, onAdd }) => {
  return (
    <div className="w-full overflow-x-hidden">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 w-full">
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