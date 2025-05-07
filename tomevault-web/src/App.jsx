import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/common/Header';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import BookDetailPage from './pages/BookDetailPage';
import LoginPage from './pages/LoginPage';
import * as BookService from './services/BookService';
import * as AuthService from './services/AuthService';
import './App.css';
import './index.css';

const App = () => {
  // Estado para el inicio de sesión del usuario
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(AuthService.isAuthenticated());
  // Estado para la colección de libros del usuario
  const [myBooks, setMyBooks] = useState([]);
  // Estado para indicar si los libros del usuario están cargando
  const [isLoadingMyBooks, setIsLoadingMyBooks] = useState(true);

  // Maneja el éxito del inicio de sesión
  const handleLoginSuccess = () => {
    setIsUserLoggedIn(true);
    fetchMyBooks();
  };

  // Maneja el cierre de sesión del usuario
  const handleLogout = () => {
    AuthService.logout();
    setIsUserLoggedIn(false);
    setMyBooks([]);
  };

  // Obtiene asincrónicamente los libros del usuario
  const fetchMyBooks = async () => {
    setIsLoadingMyBooks(true);
    try {
      if (AuthService.isAuthenticated()) {
        const books = await BookService.getMyBooks();
        setMyBooks(books.content || books);
      } else {
        setMyBooks([]);
      }
    } catch (error) {
      setMyBooks([]);
    } finally {
      setIsLoadingMyBooks(false);
    }
  };

  // Efecto para obtener libros al montar o cambiar el estado de login
  useEffect(() => {
    fetchMyBooks();
  }, [isUserLoggedIn]);

  // Maneja la adición de un libro desde la página de búsqueda
  const handleAddBookFromSearch = async (bookGoogleId) => {
    if (!isUserLoggedIn) {
      throw new Error("Debes iniciar sesión para agregar libros a tu colección.");
    }
    try {
      const addedBook = await BookService.saveBookFromGoogle(bookGoogleId);
      fetchMyBooks(); // Recarga mis libros para el HomePage
      return addedBook;
    } catch (error) {
      throw error;
    }
  };

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gray-900 font-sans text-gray-100">
        {/* Pasa el estado de login y la función de logout al Header */}
        <Header isLoggedIn={isUserLoggedIn} onLogout={handleLogout} />
        <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            {/* Ruta para la página de inicio */}
            <Route
              path="/"
              element={<HomePage myBooks={myBooks} isLoading={isLoadingMyBooks} />}
            />
            {/* Ruta para la página de búsqueda */}
            <Route
              path="/search"
              element={<SearchPage
                isLoggedIn={isUserLoggedIn}
                onAdd={handleAddBookFromSearch}
              />}
            />
            {/* Ruta para la página de detalles del libro */}
            <Route path="/books/:bookId" element={<BookDetailPage />} />
            {/* Ruta para la página de login */}
            <Route
              path="/login"
              element={<LoginPage onLoginSuccess={handleLoginSuccess} />}
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
