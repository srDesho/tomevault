import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/common/Header';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import BookDetailPage from './pages/BookDetailPage';
import * as BookService from './services/BookService';
import './App.css';
import './index.css';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [myBooks, setMyBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMyBooks = async () => {
      try {
        const books = await BookService.getMyBooks();
        setMyBooks(books);
      } catch (error) {
        console.error("Error loading books:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMyBooks();
  }, []);

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gray-900 font-sans text-gray-100 min-w-[320px]">
        <Header isLoggedIn={isLoggedIn} />
        <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<HomePage myBooks={myBooks} isLoading={isLoading} />} />
            <Route path="/search" element={<SearchPage isLoggedIn={isLoggedIn} />} />
            <Route path="/books/:bookId" element={<BookDetailPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;