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
  // State for user login status
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(AuthService.isAuthenticated());
  // State for the user's book collection
  const [myBooks, setMyBooks] = useState([]);
  // State to indicate if user's books are loading
  const [isLoadingMyBooks, setIsLoadingMyBooks] = useState(true);

  // Handles successful user login
  const handleLoginSuccess = () => {
    setIsUserLoggedIn(true);
    fetchMyBooks();
  };

  // Handles user logout
  const handleLogout = () => {
    AuthService.logout();
    setIsUserLoggedIn(false);
    setMyBooks([]);
  };

  // Asynchronously fetches user's books
  const fetchMyBooks = async () => {
    setIsLoadingMyBooks(true);
    try {
      if (AuthService.isAuthenticated()) {
        const books = await BookService.getMyBooks();
        // Ensure books.content or books is an array
        setMyBooks(Array.isArray(books.content) ? books.content : books);
      } else {
        setMyBooks([]);
      }
    } catch (error) {
      console.error("Error fetching my books:", error);
      setMyBooks([]);
    } finally {
      setIsLoadingMyBooks(false);
    }
  };

  // Effect to fetch books on mount or login status change
  useEffect(() => {
    fetchMyBooks();
  }, [isUserLoggedIn]); // Ensures books are reloaded when login status changes

  // Handles adding a book from the search page
  const handleAddBookFromSearch = async (bookGoogleId) => {
    if (!isUserLoggedIn) {
      throw new Error("You must be logged in to add books to your collection.");
    }
    try {
      const addedBook = await BookService.saveBookFromGoogle(bookGoogleId);
      fetchMyBooks(); // Reloads my books for HomePage
      return addedBook;
    } catch (error) {
      throw error;
    }
  };

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gray-900 font-sans text-gray-100">
        {/* Pass login status and logout function to Header */}
        <Header isLoggedIn={isUserLoggedIn} onLogout={handleLogout} />
        <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            {/* Route for the home page */}
            <Route
              path="/"
              element={
                <HomePage
                  myBooks={myBooks}
                  isLoading={isLoadingMyBooks}
                  refreshBooks={fetchMyBooks} // Key change here!
                />
              }
            />
            {/* Route for the search page */}
            <Route
              path="/search"
              element={<SearchPage
                isLoggedIn={isUserLoggedIn}
                onAdd={handleAddBookFromSearch}
              />}
            />
            {/* Route for the book details page */}
            <Route path="/books/:bookId" element={<BookDetailPage />} />
            {/* Route for the login page */}
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
