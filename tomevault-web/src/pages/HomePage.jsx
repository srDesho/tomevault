// This component manages the main page displaying a user's book collection.
// It includes features for viewing, searching, and deleting books with pagination.
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import BookList from '../components/books/BookList';
import * as BookService from '../services/BookService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Pagination from '../components/common/Pagination';
import { useHomeSearch } from '../context/HomeSearchContext';

const HomePage = ({ refreshBooks }) => {
    // Access global state for search and pagination from a custom hook.
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
    
    // State for managing books, loading, notifications, and modals.
    const [allBooks, setAllBooks] = useState([]);
    const [displayBooks, setDisplayBooks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [notification, setNotification] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [bookToDelete, setBookToDelete] = useState(null);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [scrollRestored, setScrollRestored] = useState(false);
    const SEARCH_SIZE = 21;
    
    // Refs to manage component behavior across renders.
    const isInitialLoad = useRef(true);
    const previousSearchTerm = useRef(homeSearchTerm);

    // Fetches books with pagination from the service.
    const loadBooksPaginated = useCallback(async (page = 0) => {
        setIsLoading(true);
        try {
            const response = await BookService.getMyBooks(page, SEARCH_SIZE);
            setDisplayBooks(response.content || []);
            setTotalPages(response.totalPages);
            setTotalElements(response.totalElements);
        } catch (error) {
            console.error("Error loading books:", error);
            setDisplayBooks([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Fetches all books from the service for local searching.
    const loadAllBooksForSearch = useCallback(async () => {
        try {
            const allBooksData = await BookService.getAllMyBooks();
            setAllBooks(allBooksData);
            return allBooksData;
        } catch (error) {
            console.error("Error loading all books for search:", error);
            setAllBooks([]);
            return [];
        }
    }, []);

    // Filters books based on the search term. This is memoized for performance.
    const filteredBooks = useMemo(() => {
        if (!homeSearchTerm.trim() || allBooks.length === 0) {
            return [];
        }

        return allBooks.filter(book =>
            book.title?.toLowerCase().includes(homeSearchTerm.toLowerCase()) ||
            book.author?.toLowerCase().includes(homeSearchTerm.toLowerCase()) ||
            (book.categories && book.categories.some(cat => 
                cat.toLowerCase().includes(homeSearchTerm.toLowerCase())
            ))
        );
    }, [allBooks, homeSearchTerm]);

    // Resets the search page when the search term changes.
    useEffect(() => {
        if (!isInitialLoad.current && isSearchActive && homeSearchTerm !== previousSearchTerm.current) {
            setSearchPage(0);
        }
        previousSearchTerm.current = homeSearchTerm;
    }, [homeSearchTerm, isSearchActive, setSearchPage]);

    // Saves the current scroll position of the window.
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

    // Handles the initial data load when the component mounts.
    useEffect(() => {
        const loadInitialData = async () => {
            setIsLoading(true);
            setScrollRestored(false);
            
            const allBooksData = await loadAllBooksForSearch();
            
            if (isSearchActive && homeSearchTerm) {
                const start = searchPage * SEARCH_SIZE;
                const end = start + SEARCH_SIZE;
                const currentFilteredBooks = allBooksData.filter(book =>
                    book.title?.toLowerCase().includes(homeSearchTerm.toLowerCase()) ||
                    book.author?.toLowerCase().includes(homeSearchTerm.toLowerCase()) ||
                    (book.categories && book.categories.some(cat => 
                        cat.toLowerCase().includes(homeSearchTerm.toLowerCase())
                    ))
                );
                const paginatedResults = currentFilteredBooks.slice(start, end);
                setDisplayBooks(paginatedResults);
                setTotalPages(Math.ceil(currentFilteredBooks.length / SEARCH_SIZE));
                setTotalElements(currentFilteredBooks.length);
            } else {
                await loadBooksPaginated(currentPage);
            }
            
            isInitialLoad.current = false;
            setIsLoading(false);
        };
        
        loadInitialData();
    }, []);

    // Updates the displayed books when search term, page, or other dependencies change.
    useEffect(() => {
        if (!isInitialLoad.current && allBooks.length > 0) {
            if (isSearchActive && homeSearchTerm) {
                const start = searchPage * SEARCH_SIZE;
                const end = start + SEARCH_SIZE;
                const paginatedResults = filteredBooks.slice(start, end);
                setDisplayBooks(paginatedResults);
                setTotalPages(Math.ceil(filteredBooks.length / SEARCH_SIZE));
                setTotalElements(filteredBooks.length);
            } else if (!isSearchActive) {
                loadBooksPaginated(currentPage);
            }
        }
    }, [
        homeSearchTerm,
        isSearchActive,
        filteredBooks,
        allBooks.length,
        currentPage,
        loadBooksPaginated,
        searchPage
    ]);

    // Restores the previous scroll position after data loads.
    useEffect(() => {
        if (!isLoading && displayBooks.length > 0 && homeScrollPosition > 0 && !scrollRestored) {
            const restoreScroll = () => {
                const targetPosition = Math.min(homeScrollPosition, document.body.scrollHeight - window.innerHeight);
                if (targetPosition >= 0) {
                    window.scrollTo({ top: targetPosition, behavior: 'instant' });
                    setScrollRestored(true);
                }
            };

            const timer = setTimeout(restoreScroll, 50);
            return () => clearTimeout(timer);
        }
    }, [isLoading, displayBooks.length, homeScrollPosition, scrollRestored]);

    // Handles the book deletion process.
    const handleDelete = async (bookId) => {
        try {
            await BookService.deleteBook(bookId);
            setNotification({
                type: 'success',
                message: 'Libro eliminado correctamente'
            });
            
            const updatedBooks = await loadAllBooksForSearch();
            
            if (isSearchActive && homeSearchTerm) {
                const newFiltered = updatedBooks.filter(book =>
                    book.title?.toLowerCase().includes(homeSearchTerm.toLowerCase()) ||
                    book.author?.toLowerCase().includes(homeSearchTerm.toLowerCase()) ||
                    (book.categories && book.categories.some(cat => 
                        cat.toLowerCase().includes(homeSearchTerm.toLowerCase())
                    ))
                );
                const totalFiltered = newFiltered.length;
                const newTotalPages = Math.ceil(totalFiltered / SEARCH_SIZE);
                const safePage = Math.min(searchPage, Math.max(0, newTotalPages - 1));
                
                if (safePage !== searchPage) {
                    setSearchPage(safePage);
                }

                const start = safePage * SEARCH_SIZE;
                const end = start + SEARCH_SIZE;
                setDisplayBooks(newFiltered.slice(start, end));
                setTotalPages(newTotalPages);
                setTotalElements(totalFiltered);
            } else {
                await loadBooksPaginated(currentPage);
            }
            
        } catch (error) {
            setNotification({
                type: 'error',
                message: error.message || 'Error al eliminar el libro'
            });
        } finally {
            setShowDeleteModal(false);
            setTimeout(() => setNotification(null), 3000);
        }
    };

    // Handles changing pages for both general and search views.
    const handlePageChange = (newPage) => {
        if (isSearchActive && homeSearchTerm) {
            setSearchPage(newPage);
            const start = newPage * SEARCH_SIZE;
            const end = start + SEARCH_SIZE;
            const paginatedResults = filteredBooks.slice(start, end);
            setDisplayBooks(paginatedResults);
            window.scrollTo(0, 0);
        } else {
            setCurrentPage(newPage);
            loadBooksPaginated(newPage);
            setHomeScrollPosition(0);
            setScrollRestored(true);
            window.scrollTo(0, 0);
        }
    };

    // Generates the text for displaying the current book count.
    const getBookCountText = () => {
        if (isSearchActive && homeSearchTerm) {
            const total = filteredBooks.length;
            const start = searchPage * SEARCH_SIZE + 1;
            const end = Math.min((searchPage + 1) * SEARCH_SIZE, total);
            return `${start}-${end} de ${total} libros encontrados`;
        }
        return `${totalElements} libro${totalElements !== 1 ? 's' : ''} en total`;
    };

    return (
        <div className="w-full px-2 sm:px-4">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-4 sm:mb-6 lg:mb-8 text-center px-2 leading-tight">
                <span className="block sm:inline break-words">Mis Libros</span>
                <span className="block text-sm sm:text-base lg:text-lg text-gray-300 mt-1 sm:mt-0 sm:ml-2 break-words">
                    ({getBookCountText()})
                </span>
                {isSearchActive && homeSearchTerm && (
                    <span className="block text-xs sm:text-sm text-gray-400 mt-2 px-2 break-words">
                        Buscando: "{homeSearchTerm}"
                    </span>
                )}
            </h2>

            <div className="mb-4 sm:mb-6">
                <input
                    type="text"
                    value={homeSearchTerm}
                    onChange={(e) => setHomeSearchTerm(e.target.value)}
                    placeholder="Buscar en tus libros por título, autor o categoría..."
                    className="w-full p-2 sm:p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
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

            {notification && (
                <div className={`p-3 sm:p-4 rounded-lg text-center mb-3 sm:mb-4 mx-2 text-sm sm:text-base ${
                    notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'
                } text-white break-words`}>
                    {notification.message}
                </div>
            )}

            {isLoading ? (
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
                    
                    {/* Show pagination only if there's more than one page */}
                    {totalPages > 1 && (
                        <Pagination
                            currentPage={isSearchActive ? searchPage : currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                    )}
                </>
            ) : homeSearchTerm ? (
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
        </div>
    );
};

export default HomePage;