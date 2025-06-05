import React, { useState, useEffect } from 'react';
import BookList from '../components/books/BookList';
import * as BookService from '../services/BookService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Pagination from '../components/common/Pagination';

const HomePage = () => {
  const [myBooks, setMyBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bookToDelete, setBookToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // ✅ Cargar libros con paginación
  const loadBooks = async (page = 0, size = 20) => { // Aumenta el tamaño a 20 como solicitaste.
    setIsLoading(true);
    try {
      const response = await BookService.getMyBooks(page, size);
      setMyBooks(response.content || []);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
      setCurrentPage(response.number);
    } catch (error) {
      console.error("Error loading books:", error);
      setMyBooks([]);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Cargar libros al montar el componente
  useEffect(() => {
    loadBooks();
  }, []);

  const handleDelete = async (bookId) => {
    try {
      await BookService.deleteBook(bookId);
      setNotification({
        type: 'success',
        message: 'Libro eliminado correctamente'
      });
      // ✅ Recargar la página actual después de eliminar
      await loadBooks(currentPage);
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

  // ✅ Cambiar de página
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    loadBooks(newPage);
  };

  return (
    <div className="w-full">
      <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-8 text-center">
        Mis Libros ({totalElements} libros)
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
      ) : myBooks.length > 0 ? (
        <>
          <BookList
            books={myBooks}
            isSearchList={false}
            emptyMessage={null}
            onDelete={(id) => {
              const book = myBooks.find(b => b.id === id);
              setBookToDelete(book);
              setShowDeleteModal(true);
            }}
          />
          {/* ✅ Agregar paginación */}
         
          { <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          /> }
        </>
      ) : (
        <div className="py-12 text-center">
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
                onClick={() => handleDelete(bookToDelete.id)}
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