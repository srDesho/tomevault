import React, { useState } from 'react';
import BookList from '../components/books/BookList';
import LoadingSpinner from '../components/common/LoadingSpinner';
import * as BookService from '../services/BookService';

const HomePage = ({ myBooks, isLoading, refreshBooks }) => {
  const [notification, setNotification] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bookToDelete, setBookToDelete] = useState(null);

  const handleDelete = async (bookId) => {
    try {
      await BookService.deleteBook(bookId);
      setNotification({
        type: 'success',
        message: 'Libro eliminado correctamente'
      });
      refreshBooks();
    } catch (error) {
      setNotification({
        type: 'error',
        message: error.message || 'Error al eliminar el libro'
      });
    } finally {
      setShowDeleteModal(false);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  // Filtrar solo libros activos
  const activeBooks = myBooks.filter(book => book.active !== false);

  return (
    <div className="w-full">
      <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-8 text-center">
        Mis Libros
      </h2>

      {notification && (
        <div className={`p-4 rounded-lg text-center mb-4 ${
          notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        } text-white`}>
          {notification.message}
        </div>
      )}

      {isLoading ? (
        <LoadingSpinner />
      ) : activeBooks.length > 0 ? (
        <BookList
          books={activeBooks}
          isSearchList={false}
          emptyMessage={null}
          onDelete={(id) => {
            const book = activeBooks.find(b => b.id === id);
            setBookToDelete(book);
            setShowDeleteModal(true);
          }}
        />
      ) : (
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
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && bookToDelete && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 p-8 rounded-lg shadow-2xl max-w-sm w-full text-center">
            <h3 className="text-xl font-bold text-white mb-2">
              ¿Eliminar este libro?
            </h3>
            <p className="text-gray-300 mb-6">
              "{bookToDelete.title}" se eliminará de tu colección.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  handleDelete(bookToDelete.id);
                }}
                className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition"
              >
                Eliminar
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;