import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import BookDetailPage from './pages/BookDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserSettingsPage from './pages/UserSettingsPage';
import AdminUsersPage from './pages/AdminUsersPage';
import EditUserPage from './pages/EditUserPage';
import AboutPage from './pages/AboutPage';
import * as BookService from './services/BookService';
import * as AuthService from './services/AuthService';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SearchProvider } from './context/SearchContext';
import { HomeSearchProvider } from './context/HomeSearchContext';
import { AdminUsersProvider } from './context/AdminUsersContext';

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
                books = Array.isArray(response.content) ? response.content : [];
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
            <SearchProvider>
                <HomeSearchProvider>
                    <AdminUsersProvider>
                        <Router>
                            <div className="min-h-screen flex flex-col bg-gray-900 font-sans text-gray-100">
                                <Header />
                                <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                                    <Routes>
                                        <Route path="/login" element={<LoginPage />} />
                                        <Route path="/register" element={<RegisterPage />} />
                                        <Route path="/about" element={<AboutPage />} />
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
                                        <Route
                                            path="/search"
                                            element={
                                                <SearchPage
                                                    onAdd={handleAddBookFromSearch}
                                                    refreshBooks={fetchMyBooks}
                                                />
                                            }
                                        />
                                        <Route path="/books/:bookId" element={<BookDetailPage />} />
                                        <Route path="*" element={<Navigate to="/" />} />
                                    </Routes>
                                </main>
                                <Footer />
                            </div>
                        </Router>
                    </AdminUsersProvider>
                </HomeSearchProvider>
            </SearchProvider>
        </AuthProvider>
    );
};

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();
    if (!isAuthenticated()) return <Navigate to="/login" />;
    return children;
};

const AdminRoute = ({ children }) => {
    const { user, isAuthenticated } = useAuth();
    if (!isAuthenticated()) return <Navigate to="/login" />;
    if (!user?.roles?.some(r => ['ADMIN', 'SUPER_ADMIN'].includes(r))) {
        return <Navigate to="/" />;
    }
    return children;
};

export default App;