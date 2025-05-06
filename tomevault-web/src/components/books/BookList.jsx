import React from 'react';
import BookCard from './BookCard';

const BookList = ({ books, isSearchList, emptyMessage, onAdd }) => {
  return (
    <div className="w-full">
      {/* Responsive grid for displaying book cards. */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 w-full">
        {/* Maps and renders book cards if books exist, otherwise displays an empty message. */}
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
            {/* Displays a message if the book list is empty. */}
            {emptyMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookList;
