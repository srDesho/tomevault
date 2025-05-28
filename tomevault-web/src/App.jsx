import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/common/Header';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import BookDetailPage from './pages/BookDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserSettingsPage from './pages/UserSettingsPage'; // Importa el nuevo componente
import * as BookService from './services/BookService';
import * as AuthService from './services/AuthService';

import './App.css';
import './index.css';

const App = () => {
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(AuthService.isAuthenticated());
  const [myBooks, setMyBooks] = useState([]);
  const [isLoadingMyBooks, setIsLoadingMyBooks] = useState(true);

  const handleLoginSuccess = () => {
    setIsUserLoggedIn(true);
    fetchMyBooks();
  };

  const handleLogout = () => {
    AuthService.logout();
    setIsUserLoggedIn(false);
    setMyBooks([]);
  };

  const fetchMyBooks = async () => {
    setIsLoadingMyBooks(true);
    try {
      if (AuthService.isAuthenticated()) {
        const books = await BookService.getMyBooks();
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

  useEffect(() => {
    fetchMyBooks();
  }, [isUserLoggedIn]);

  const handleAddBookFromSearch = async (bookGoogleId) => {
    if (!isUserLoggedIn) {
      throw new Error("Debes iniciar sesión para añadir libros a tu colección.");
    }
    try {
      const addedBook = await BookService.saveBookFromGoogle(bookGoogleId);
      fetchMyBooks();
      return addedBook;
    } catch (error) {
      throw error;
    }
  };

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gray-900 font-sans text-gray-100">
        <Header isLoggedIn={isUserLoggedIn} onLogout={handleLogout} />
        <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route
              path="/"
              element={
                <HomePage
                  myBooks={myBooks}
                  isLoading={isLoadingMyBooks}
                  refreshBooks={fetchMyBooks}
                />
              }
            />
            <Route
              path="/search"
              element={<SearchPage
                isLoggedIn={isUserLoggedIn}
                onAdd={handleAddBookFromSearch}
              />}
            />
            <Route path="/books/:bookId" element={<BookDetailPage />} />
            <Route
              path="/login"
              element={<LoginPage onLoginSuccess={handleLoginSuccess} />}
            />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/settings" element={<UserSettingsPage />} /> {/* Nueva ruta para ajustes */}
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;