import React from 'react';
import BookCard from './BookCard';

const BookList = ({ books, isSearchList, emptyMessage, onAdd, onDelete }) => {
  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 w-full">
        {books.length > 0 ? (
          books.map(book => (
            <BookCard 
              key={book.id} 
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