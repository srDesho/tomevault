import React from 'react';
import BookList from '../components/books/BookList';

const HomePage = ({ myBooks }) => {
  return (
    <section className="min-h-[60vh] transition-all duration-300">
      <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-6">
        Mis Libros
      </h2>
      <BookList books={myBooks} isSearchList={false} />
    </section>
  );
};

export default HomePage;
