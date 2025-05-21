import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/common/Header'; // Ruta corregida
import HomePage from './pages/HomePage'; // Ruta corregida
import SearchPage from './pages/SearchPage'; // Ruta corregida
import BookDetailPage from './pages/BookDetailPage'; // Ruta corregida
import LoginPage from './pages/LoginPage'; // Ruta corregida
import RegisterPage from './pages/RegisterPage'; // Ruta corregida
import * as BookService from './services/BookService'; // Ruta corregida
import * as AuthService from './services/AuthService'; // Ruta corregida

import './App.css'; // Ruta corregida
import './index.css'; // Ruta corregida

const App = () => {
  // Estado para el estado de inicio de sesión del usuario
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(AuthService.isAuthenticated());
  // Estado para la colección de libros del usuario
  const [myBooks, setMyBooks] = useState([]);
  // Estado para indicar si los libros del usuario están cargando
  const [isLoadingMyBooks, setIsLoadingMyBooks] = useState(true);

  // Maneja el inicio de sesión exitoso del usuario
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
        // Asegura que books.content o books sea un array
        setMyBooks(Array.isArray(books.content) ? books.content : books);
      } else {
        setMyBooks([]);
      }
    } catch (error) {
      console.error("Error al obtener mis libros:", error);
      setMyBooks([]);
    } finally {
      setIsLoadingMyBooks(false);
    }
  };

  // Efecto para obtener libros al montar o al cambiar el estado de inicio de sesión
  useEffect(() => {
    fetchMyBooks();
  }, [isUserLoggedIn]); // Asegura que los libros se recarguen cuando cambia el estado de inicio de sesión

  // Maneja la adición de un libro desde la página de búsqueda
  const handleAddBookFromSearch = async (bookGoogleId) => {
    if (!isUserLoggedIn) {
      throw new Error("Debes iniciar sesión para añadir libros a tu colección.");
    }
    try {
      const addedBook = await BookService.saveBookFromGoogle(bookGoogleId);
      fetchMyBooks(); // Recarga mis libros para HomePage
      return addedBook;
    } catch (error) {
      throw error;
    }
  };

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gray-900 font-sans text-gray-100">
        {/* Pasa el estado de inicio de sesión y la función de cierre de sesión al Header */}
        <Header isLoggedIn={isUserLoggedIn} onLogout={handleLogout} />
        <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            {/* Ruta para la página de inicio */}
            <Route
              path="/"
              element={
                <HomePage
                  myBooks={myBooks}
                  isLoading={isLoadingMyBooks}
                  refreshBooks={fetchMyBooks} // Cambio clave aquí!
                />
              }
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
            {/* Ruta para la página de inicio de sesión */}
            <Route
              path="/login"
              element={<LoginPage onLoginSuccess={handleLoginSuccess} />}
            />
            {/* Nueva ruta para la página de registro */}
            <Route path="/register" element={<RegisterPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
