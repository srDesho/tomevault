import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/common/Header';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import BookDetailPage from './pages/BookDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserSettingsPage from './pages/UserSettingsPage';
import AdminUsersPage from './pages/AdminUsersPage';
import EditUserPage from './pages/EditUserPage';
import * as BookService from './services/BookService';
import * as AuthService from './services/AuthService';
import { AuthProvider, useAuth } from './context/AuthContext';

import './App.css';
import './index.css';

const App = () => {
  const [myBooks, setMyBooks] = useState([]);
  const [isLoadingMyBooks, setIsLoadingMyBooks] = useState(true);

  const fetchMyBooks = async () => {
    setIsLoadingMyBooks(true);
    try {
      let books = [];
      if (AuthService.isAuthenticated()) {
        const response = await BookService.getMyBooks();
        books = Array.isArray(response.content) ? response.content : (Array.isArray(response) ? response : []);
      }
      setMyBooks(books);
    } catch (error) {
      console.error("Error al obtener mis libros:", error);
      setMyBooks([]);
    } finally {
      setIsLoadingMyBooks(false);
    }
  };

  useEffect(() => {
    fetchMyBooks();
  }, []);

  const handleAddBookFromSearch = async (googleBookId) => {
    if (!AuthService.isAuthenticated()) {
      throw new Error("Debes iniciar sesión.");
    }
    const addedBook = await BookService.saveBookFromGoogle(googleBookId);
    fetchMyBooks();
    return addedBook;
  };

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-gray-900 font-sans text-gray-100">
          <Header />
          <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* ✅ Todos los usuarios autenticados, incluidos admins, ven HomePage */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <HomePage
                      myBooks={myBooks}
                      isLoading={isLoadingMyBooks}
                      refreshBooks={fetchMyBooks}
                    />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <UserSettingsPage />
                  </ProtectedRoute>
                }
              />

              {/* ✅ Solo admins pueden ver esta ruta */}
              <Route
                path="/admin/users"
                element={
                  <AdminRoute>
                    <AdminUsersPage />
                  </AdminRoute>
                }
              />

              <Route
                path="/admin/users/:id/edit"
                element={
                  <AdminRoute>
                    <EditUserPage />
                  </AdminRoute>
                }
              />

              {/* ✅ Búsqueda pública */}
              <Route path="/search" element={<SearchPage onAdd={handleAddBookFromSearch} refreshBooks={fetchMyBooks} />} />

              <Route path="/books/:bookId" element={<BookDetailPage />} />

              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
};

// ✅ Solo verifica autenticación
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated()) return <Navigate to="/login" />;
  return children;
};

// ✅ Solo permite acceso a admins
const AdminRoute = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated()) return <Navigate to="/login" />;
  if (!user?.roles?.some(r => ['ADMIN', 'SUPER_ADMIN'].includes(r))) {
    return <Navigate to="/" />;
  }
  return children;
};

export default App;