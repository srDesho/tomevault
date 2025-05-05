import React from 'react';
import BookList from '../components/books/BookList';
import LoadingSpinner from '../components/common/LoadingSpinner'; // Asegúrate de importar LoadingSpinner

const HomePage = ({ myBooks, isLoading }) => {
  return (
    <div className="w-full">
      <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-8 text-center">
        Mis Libros
      </h2>
      
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <BookList 
          books={myBooks} 
          isSearchList={false}
          emptyMessage={
            <div className="col-span-full py-12 text-center">
              <div className="bg-gray-800 p-6 rounded-lg inline-block">
                <p className="text-gray-400 mb-4">No tienes libros en tu colección</p>
                <a 
                  href="/search" 
                  className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  Agregar mi primer libro
                </a>
              </div>
            </div>
          }
        />
      )}
    </div>
  );
};

export default HomePage;
