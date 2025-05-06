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
  // State to manage user login status, initialized from AuthService.
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(AuthService.isAuthenticated());
  // State to store the user's book collection.
  const [myBooks, setMyBooks] = useState([]);
  // State to indicate if the user's books are currently loading.
  const [isLoadingMyBooks, setIsLoadingMyBooks] = useState(true);

  // Callback function for successful login.
  const handleLoginSuccess = () => {
    setIsUserLoggedIn(true);
    fetchMyBooks(); // Reloads user's books after successful login.
  };

  // Handles user logout.
  const handleLogout = () => {
    AuthService.logout();
    setIsUserLoggedIn(false);
    setMyBooks([]); // Clears the user's book list.
  };

  // Asynchronously fetches user's books from the backend.
  const fetchMyBooks = async () => {
    try {
      setIsLoadingMyBooks(true);
      // Only attempts to load books if the user is authenticated.
      if (AuthService.isAuthenticated()) {
        const books = await BookService.getMyBooks();
        // Assumes 'books' is an array or has a 'content' property if it's a Page object.
        setMyBooks(books.content || books);
      } else {
        setMyBooks([]); // No books to display if not logged in.
      }
    } catch (error) {
      console.error("Error loading books:", error);
      setMyBooks([]); // Clears books in case of an error.
    } finally {
      setIsLoadingMyBooks(false);
    }
  };

  // Effect hook to fetch user's books on component mount or authentication status change.
  useEffect(() => {
    fetchMyBooks();
  }, [isUserLoggedIn]);

  // Handles adding a book from the search page to the user's collection.
  const handleAddBookFromSearch = async (bookGoogleId) => {
    // Alerts and prevents action if the user is not logged in.
    if (!isUserLoggedIn) {
      alert("Debes iniciar sesión para agregar libros a tu colección.");
      return;
    }
    try {
      // Calls the service to save the book using its Google Books ID.
      const addedBook = await BookService.saveBookFromGoogle(bookGoogleId);
      alert(`"${addedBook.title}" agregado a tu colección.`);
      fetchMyBooks(); // Reloads my books list to display the newly added book.
    } catch (error) {
      console.error("Error al agregar libro:", error);
      alert(`Error al agregar el libro: ${error.message}`);
    }
  };

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gray-900 font-sans text-gray-100">
        {/* Passes login status and logout function to the Header component. */}
        <Header isLoggedIn={isUserLoggedIn} onLogout={handleLogout} />
        <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            {/* Passes user's books and loading status to HomePage. */}
            <Route
              path="/"
              element={<HomePage myBooks={myBooks} isLoading={isLoadingMyBooks} />}
            />
            {/* Passes login status and add book function to SearchPage. */}
            <Route
              path="/search"
              element={<SearchPage
                isLoggedIn={isUserLoggedIn}
                onAdd={handleAddBookFromSearch}
              />}
            />
            {/* Route for book details page. */}
            <Route path="/books/:bookId" element={<BookDetailPage />} />
            {/* Route for login page, passing the login success callback. */}
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
