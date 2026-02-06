// This component manages the main page displaying a user's book collection.
// Features: server-side pagination, server-side search with debounce, scroll preservation
// Optimized for Neon PostgreSQL Free Tier - loads only 21 books per page
import React, { useState, useEffect, useCallback, useRef } from 'react';
import BookList from '../components/books/BookList';
import * as BookService from '../services/BookService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Pagination from '../components/common/Pagination';
import { useHomeSearch } from '../context/HomeSearchContext';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/outline';

const HomePage = ({ refreshBooks }) => {
    // Access global state for search and pagination from context
    const { 
        homeSearchTerm, 
        setHomeSearchTerm, 
        homeScrollPosition, 
        setHomeScrollPosition,
        isSearchActive,
        clearSearch,
        currentPage,              
        setCurrentPage,
        searchPage,
        setSearchPage
    } = useHomeSearch();
    
    // Core state management
    const [displayBooks, setDisplayBooks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [bookToDelete, setBookToDelete] = useState(null);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [scrollRestored, setScrollRestored] = useState(false);
    const BOOKS_PER_PAGE = 21;
    
    // Refs for behavior control
    const isInitialLoad = useRef(true);
    const searchTimeoutRef = useRef(null);

    // Show toast notification with auto-dismiss
    const showToast = (type, message) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 4000);
    };

    /**
     * Loads paginated books from the server with optional search query
     * Optimized for Neon PostgreSQL Free Tier with paginated requests
     */
    const loadPaginatedBooks = useCallback(async (page, searchQuery = '') => {
        setIsLoading(true);
        
        try {
            let response;
            
            if (searchQuery.trim()) {
                // Use backend search endpoint for filtered results
                response = await BookService.searchMyBooks(
                    searchQuery.trim(), 
                    page, 
                    BOOKS_PER_PAGE
                );
            } else {
                // Use paginated endpoint for all active books
                response = await BookService.getMyBooks(page, BOOKS_PER_PAGE);
            }
            
            setDisplayBooks(response.content || []);
            setTotalPages(response.totalPages || 0);
            setTotalElements(response.totalElements || 0);
            
        } catch (error) {
            if (error.message === 'Sesión expirada') {
                return;
            }
            console.error("Error loading books:", error);
            showToast('error', 'Error al cargar libros');
            setDisplayBooks([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Initial data loading
    useEffect(() => {
        const loadInitial = async () => {
            await loadPaginatedBooks(currentPage, '');
            isInitialLoad.current = false;
        };
        loadInitial();
    }, []);

    // Debounced search effect with 500ms delay to prevent excessive requests
    useEffect(() => {
        if (isInitialLoad.current) return;

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
            const searchQuery = homeSearchTerm.trim();
            
            if (searchQuery) {
                // Reset to first page when search term changes
                setSearchPage(0);
                loadPaginatedBooks(0, searchQuery);
            } else {
                // Load normal paginated view when search is cleared
                loadPaginatedBooks(currentPage, '');
            }
        }, 500);

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [homeSearchTerm, loadPaginatedBooks, currentPage, setSearchPage]);

    // Handle page change for non-search view
    useEffect(() => {
        if (!isInitialLoad.current && !homeSearchTerm.trim()) {
            loadPaginatedBooks(currentPage, '');
        }
    }, [currentPage, homeSearchTerm, loadPaginatedBooks]);

    // Handle page change for search view
    useEffect(() => {
        if (!isInitialLoad.current && homeSearchTerm.trim()) {
            loadPaginatedBooks(searchPage, homeSearchTerm);
        }
    }, [searchPage, homeSearchTerm, loadPaginatedBooks]);

    // Save scroll position during scrolling
    useEffect(() => {
        let scrollTimer;
        const handleScroll = () => {
            clearTimeout(scrollTimer);
            scrollTimer = setTimeout(() => {
                setHomeScrollPosition(window.scrollY);
            }, 150);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', handleScroll);
            clearTimeout(scrollTimer);
        };
    }, [setHomeScrollPosition]);

    // Restore previous scroll position after loading
    useEffect(() => {
        if (!isLoading && displayBooks.length > 0 && homeScrollPosition > 0 && !scrollRestored) {
            const restoreScroll = () => {
                const targetPosition = Math.min(
                    homeScrollPosition, 
                    document.body.scrollHeight - window.innerHeight
                );
                if (targetPosition >= 0) {
                    window.scrollTo({ top: targetPosition, behavior: 'instant' });
                    setScrollRestored(true);
                }
            };

            const timer = setTimeout(restoreScroll, 50);
            return () => clearTimeout(timer);
        }
    }, [isLoading, displayBooks.length, homeScrollPosition, scrollRestored]);

    // Handle book deletion with page reload
    const handleDelete = async (bookId) => {
        try {
            await BookService.deleteBook(bookId);
            showToast('success', 'Libro eliminado correctamente');
            
            const currentPageNum = homeSearchTerm.trim() ? searchPage : currentPage;
            const searchQuery = homeSearchTerm.trim();
            
            // If deleting the last book on a page, navigate to previous page
            if (displayBooks.length === 1 && currentPageNum > 0) {
                const newPage = Math.max(0, currentPageNum - 1);
                
                if (searchQuery) {
                    setSearchPage(newPage);
                    await loadPaginatedBooks(newPage, searchQuery);
                } else {
                    setCurrentPage(newPage);
                    await loadPaginatedBooks(newPage, '');
                }
            } else {
                // Otherwise reload current page
                await loadPaginatedBooks(currentPageNum, searchQuery);
            }
            
        } catch (error) {
            if (error.message === 'Sesión expirada') {
                return;
            }
            showToast('error', error.message || 'Error al eliminar el libro');
        } finally {
            setShowDeleteModal(false);
        }
    };

    // Handle page change in pagination
    const handlePageChange = (newPage) => {
        if (homeSearchTerm.trim()) {
            setSearchPage(newPage);
        } else {
            setCurrentPage(newPage);
        }
        setHomeScrollPosition(0);
        setScrollRestored(true);
        window.scrollTo(0, 0);
    };

    // Generate book count text for display
    const getBookCountText = () => {
        const currentPageNum = homeSearchTerm.trim() ? searchPage : currentPage;
        const start = currentPageNum * BOOKS_PER_PAGE + 1;
        const end = Math.min((currentPageNum + 1) * BOOKS_PER_PAGE, totalElements);
        
        if (homeSearchTerm.trim()) {
            return `${start}-${end} de ${totalElements} libros encontrados`;
        }
        return `${totalElements} libro${totalElements !== 1 ? 's' : ''}`;
    };

    if (isLoading && isInitialLoad.current) {
        return <LoadingSpinner />;
    }

    return (
        <div className="w-full px-2 sm:px-4 max-w-full overflow-x-hidden">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-4 sm:mb-6 lg:mb-8 text-center px-2 leading-tight">
                <span className="block sm:inline break-words">Mis Libros</span>
                {homeSearchTerm.trim() && (
                    <span className="block text-xs sm:text-sm text-gray-400 mt-2 px-2 break-words">
                        Buscando: "{homeSearchTerm}"
                    </span>
                )}
            </h2>

            {/* Toast notification */}
            {toast && (
                <div className={`fixed top-20 right-4 z-50 p-4 rounded-lg shadow-2xl flex items-center gap-3 animate-slide-in max-w-md ${
                    toast.type === 'success' 
                        ? 'bg-green-600 text-white' 
                        : 'bg-red-600 text-white'
                }`}>
                    {toast.type === 'success' ? (
                        <CheckCircleIcon className="h-6 w-6 flex-shrink-0" />
                    ) : (
                        <XCircleIcon className="h-6 w-6 flex-shrink-0" />
                    )}
                    <span className="text-sm sm:text-base font-medium">{toast.message}</span>
                </div>
            )}

            {/* Search input */}
            <div className="mb-4 sm:mb-6 w-full max-w-full">
                <input
                    type="text"
                    value={homeSearchTerm}
                    onChange={(e) => setHomeSearchTerm(e.target.value)}
                    placeholder="Buscar en tus libros por título, autor o categoría..."
                    className="w-full max-w-full p-2 sm:p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                />
                {homeSearchTerm && (
                    <button
                        onClick={clearSearch}
                        className="mt-2 text-blue-400 hover:text-blue-300 text-xs sm:text-sm"
                    >
                        Limpiar búsqueda y ver todos
                    </button>
                )}
            </div>

            {/* Books display */}
            {isLoading && displayBooks.length === 0 ? (
                <LoadingSpinner />
            ) : displayBooks.length > 0 ? (
                <>
                    <BookList
                        books={displayBooks}
                        isSearchList={false}
                        emptyMessage={null}
                        onDelete={(id) => {
                            const book = displayBooks.find(b => b.id === id);
                            setBookToDelete(book);
                            setShowDeleteModal(true);
                        }}
                    />
                    
                    {/* Pagination component - using the same common Pagination component as AdminUsersPage */}
                    {totalPages > 1 && (
                        <Pagination
                            currentPage={homeSearchTerm.trim() ? searchPage : currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                            totalItems={totalElements}
                            itemsPerPage={BOOKS_PER_PAGE}
                            itemName="libro"
                        />
                    )}
                </>
            ) : homeSearchTerm ? (
                /* Empty search results */
                <div className="py-8 sm:py-12 text-center px-2">
                    <div className="bg-gray-800 p-4 sm:p-6 rounded-lg inline-block max-w-full">
                        <p className="text-gray-400 mb-3 sm:mb-4 text-sm sm:text-base break-words">
                            No se encontraron libros que coincidan con "{homeSearchTerm}"
                        </p>
                        <button
                            onClick={clearSearch}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-colors text-sm sm:text-base"
                        >
                            Ver todos los libros
                        </button>
                    </div>
                </div>
            ) : (
                /* Empty collection */
                <div className="py-8 sm:py-12 text-center px-2">
                    <div className="bg-gray-800 p-4 sm:p-6 rounded-lg inline-block max-w-full">
                        <p className="text-gray-400 mb-3 sm:mb-4 text-sm sm:text-base">
                            No tienes libros en tu colección
                        </p>
                        <a
                            href="/search"
                            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-colors text-sm sm:text-base"
                        >
                            Agregar mi primer libro
                        </a>
                    </div>
                </div>
            )}

            {/* Delete confirmation modal */}
            {showDeleteModal && bookToDelete && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-3 sm:p-4 z-50">
                    <div className="bg-gray-800 p-4 sm:p-6 lg:p-8 rounded-lg shadow-2xl max-w-sm w-full text-center mx-2">
                        <h3 className="text-lg sm:text-xl font-bold text-white mb-2 break-words">
                            ¿Eliminar este libro?
                        </h3>
                        <p className="text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base break-words">
                            "{bookToDelete.title}" se eliminará de tu colección.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4">
                            <button 
                                onClick={() => handleDelete(bookToDelete.id)} 
                                className="bg-red-500 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-red-600 transition text-sm sm:text-base order-2 sm:order-1"
                            >
                                Eliminar
                            </button>
                            <button 
                                onClick={() => setShowDeleteModal(false)} 
                                className="bg-gray-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-gray-700 transition text-sm sm:text-base order-1 sm:order-2"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes slide-in {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                .animate-slide-in {
                    animation: slide-in 0.3s ease-out;
                }
            `}</style>
        </div>
    );
};

export default HomePage;