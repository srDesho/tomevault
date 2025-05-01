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

  useEffect(() => {
    const fetchMyBooks = async () => {
      const books = await BookService.getMyBooks();
      setMyBooks(books);
    };
    fetchMyBooks();
  }, []);

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gray-900 font-sans text-gray-100">
        <Header isLoggedIn={isLoggedIn} />
        <main className="flex-grow container mx-auto p-4 md:p-8 transition-all duration-300">
          <Routes>
            <Route path="/" element={<HomePage myBooks={myBooks} />} />
            <Route path="/search" element={<SearchPage isLoggedIn={isLoggedIn} />} />
            <Route path="/books/:bookId" element={<BookDetailPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
