import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import BookList from '../components/books/BookList';
import * as BookService from '../services/BookService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { SearchIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/outline';
import { useAuth } from '../context/AuthContext';
import { useSearch } from '../context/SearchContext'; // Global search context for state persistence

const SearchPage = ({ onAdd, refreshBooks }) => {
    const { isAuthenticated } = useAuth();
    
    // Deconstruct persistent search state from context. Essential for UX (scroll, results).
    const {
        searchTerm,
        setSearchTerm,
        searchResults,
        setSearchResults,
        searchScrollPosition,
        setSearchScrollPosition,
        hasSearched, // Flag to track if a search has been executed.
        setHasSearched,
        clearSearch
    } = useSearch();
    
    const navigate = useNavigate();
    const location = useLocation(); // To read and update URL query parameters.
    const isInitialLoad = useRef(true); // Flag to differentiate mount from updates (used for URL sync).

    // Local Component State
    const [isSearching, setIsSearching] = useState(false);
    const [toast, setToast] = useState(null);
    const [showModal, setShowModal] = useState(false); // Controls book reactivation modal.
    const [currentBook, setCurrentBook] = useState(null); // The book being processed for the modal.
    const [scrollRestored, setScrollRestored] = useState(false); // Ensures scroll restoration only happens once.

    // Show toast notification with auto-dismiss
    const showToast = (type, message, action = null) => {
        setToast({ type, message, action });
        setTimeout(() => setToast(null), 4000);
    };

    // --- UX Persistence Effects ---

    // [Effect 1]: Save scroll position to context on user scroll.
    useEffect(() => {
        let scrollTimer;
        const handleScroll = () => {
            clearTimeout(scrollTimer);
            scrollTimer = setTimeout(() => {
                setSearchScrollPosition(window.scrollY);
            }, 150); // Debounced scroll save.
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', handleScroll);
            clearTimeout(scrollTimer);
        };
    }, [setSearchScrollPosition]);

    // [Effect 2]: Restore scroll position after results load.
    useEffect(() => {
        if (!isSearching && searchResults.length > 0 && searchScrollPosition > 0 && !scrollRestored) {
            const restoreScroll = () => {
                // Ensure target position is valid and within bounds before scrolling.
                const targetPosition = Math.min(searchScrollPosition, document.body.scrollHeight - window.innerHeight); 
                if (targetPosition >= 0) {
                    window.scrollTo({ top: targetPosition, behavior: 'instant' });
                    setScrollRestored(true); // Prevent re-execution.
                }
            };

            const timer = setTimeout(restoreScroll, 50); // Small delay to wait for DOM rendering.
            return () => clearTimeout(timer);
        }
    }, [isSearching, searchResults.length, searchScrollPosition, scrollRestored]);

    // --- Core Search Logic ---

    // Executes the search against the external service (Google Books).
    const executeSearch = useCallback(async (queryToSearch) => {
        if (!queryToSearch.trim()) {
            setSearchResults([]);
            setHasSearched(false);
            return;
        }

        setIsSearching(true);
        setHasSearched(true);
        setToast(null);

        try {
            const results = await BookService.searchGoogleBooks(queryToSearch);
            
            // IMPORTANT: Filter out results without a valid Google ID. We can't track them in the DB.
            const validResults = results.filter(
                (book) =>
                    book.googleBookId && 
                    book.googleBookId.trim() !== '' && 
                    book.googleBookId.toLowerCase() !== 'null'
            );
            
            setSearchResults(validResults);

            if (validResults.length === 0) {
                const msg = results.length > 0
                    ? 'No se encontraron libros válidos para tu búsqueda. Algunos resultados pueden tener IDs no disponibles.'
                    : 'No se encontraron libros para tu búsqueda.';
                showToast('error', msg);
            }
        } catch (error) {
            setSearchResults([]);
            showToast('error', error.message || 'Error al buscar libros. Intenta de nuevo.');
        } finally {
            setIsSearching(false);
        }
    }, [setSearchResults, setHasSearched]);

    // --- URL Synchronization ---

    // [Effect 4]: Initial sync on mount. Reads 'query' from URL and executes search if present.
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const queryFromUrl = queryParams.get('query');

        if (queryFromUrl && queryFromUrl !== searchTerm) {
            setSearchTerm(queryFromUrl);
            executeSearch(queryFromUrl);
        } else if (!queryFromUrl && searchTerm && hasSearched) {
            // If state has search data but URL doesn't, push the state to the URL (replace history).
            navigate(`?query=${encodeURIComponent(searchTerm)}`, { replace: true });
        }
    }, []); // Run only on mount.

    // [Effect 5]: Handle URL changes *after* initial load (e.g., browser back/forward buttons).
    useEffect(() => {
        if (isInitialLoad.current) {
            isInitialLoad.current = false;
            return;
        }

        const queryParams = new URLSearchParams(location.search);
        const queryFromUrl = queryParams.get('query');

        // If URL query changes, update state and re-execute search.
        if (queryFromUrl && queryFromUrl !== searchTerm) {
            setSearchTerm(queryFromUrl);
            executeSearch(queryFromUrl);
        }
    }, [location.search]); // Depend on URL changes.

    // --- Handlers ---

    const handleSearch = (e) => {
        e.preventDefault();
        
        if (!searchTerm.trim()) {
            // Clear URL if search term is empty and prevent form submission.
            navigate(location.pathname, { replace: true });
            showToast('error', 'Por favor, ingresa un término de búsqueda.');
            setSearchResults([]);
            setHasSearched(false);
            return;
        }
        
        // Reset scroll state before new search execution.
        setSearchScrollPosition(0);
        setScrollRestored(true);
        
        // Update URL first, then execute search.
        const newUrl = `${location.pathname}?query=${encodeURIComponent(searchTerm)}`;
        navigate(newUrl);
        executeSearch(searchTerm);
    };

    const handleInputChange = (e) => {
        setSearchTerm(e.target.value);
    };

    // Main logic for adding a book to the user's collection.
    const handleAddBook = async (book) => {
        setToast(null);
        setCurrentBook(book);

        if (!isAuthenticated()) {
            // Must be authenticated to add a book. Redirect to login.
            showToast('error', 'Debes iniciar sesión para agregar libros a tu colección.', () => navigate('/login'));
            return;
        }

        if (typeof onAdd !== 'function') {
            showToast('error', 'No se puede agregar libros en este momento.');
            return;
        }

        try {
            // 1. Check if the book already exists in the user's collection.
            const status = await BookService.getBookStatus(book.googleBookId);

            if (status.existsActive) {
                showToast('error', 'Este libro ya está en tu colección.');
                return;
            }

            if (status.existsInactive) {
                // 2. If it was previously deleted (inactive), show the reactivation modal (good UX).
                setShowModal(true);
                return;
            }

            // 3. If new, add it normally.
            const addedBook = await onAdd(book.googleBookId);
            showToast('success', `"${addedBook?.title || book.title}" agregado a tu colección.`);

            if (refreshBooks && typeof refreshBooks === 'function') {
                await refreshBooks(); // Refresh the main book list (e.g., HomePage).
            }
        } catch (error) {
    // Error handling for authentication/service issues.
    if (error.message.includes('401') || 
        error.message.includes('403') || 
        error.message.includes('Session expired')) {
        showToast('error', 'Tu sesión ha expirado. Por favor, inicia sesión de nuevo.', () => navigate('/login'));
    }
    else if (error.message.includes('Demo limit')) {
        showToast('error', 'Límite máximo de 10 libros alcanzado para Usuario Demo.');
    }
    else {
        showToast('error', error.message || 'Error al verificar o agregar el libro.');
    }
}
    };

    // Modal action: Reactivate and keep existing reading progress.
    const handleKeepProgress = async () => {
        try {
            // activateBook(googleBookId, keepProgress: true)
            const activated = await BookService.activateBook(currentBook.googleBookId, true); 
            showToast('success', `"${activated.title}" reactivado. Continuando desde tu último progreso.`);
            setShowModal(false);

            if (typeof refreshBooks === 'function') {
                refreshBooks();
            }
        } catch (err) {
            console.error('Error al reactivar con progreso:', err);
            showToast('error', 'Error al reactivar el libro.');
            setShowModal(false);
        }
    };

    // Modal action: Reactivate and reset reading progress.
    const handleStartFromZero = async () => {
        try {
            // activateBook(googleBookId, keepProgress: false)
            const activated = await BookService.activateBook(currentBook.googleBookId, false);
            showToast('success', `"${activated.title}" reactivado. Contador reiniciado.`);
            setShowModal(false);

            if (typeof refreshBooks === 'function') {
                refreshBooks();
            }
        } catch (err) {
            console.error('Error al reactivar sin progreso:', err);
            showToast('error', 'Error al reactivar el libro.');
            setShowModal(false);
        }
    };

    // Resets all search state (term, results, URL) via context.
    const handleClearSearch = () => {
        clearSearch();
        navigate(location.pathname, { replace: true }); // Clean up the URL query param.
        setToast(null);
        setScrollRestored(false);
    };

    return (
        <div className="w-full px-2 sm:px-4 max-w-full overflow-x-hidden">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-4 sm:mb-6 text-center px-2 leading-tight">
                    Buscar Libros
                </h2>
                
                {/* Toast notification - appears in top right corner */}
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
                        <span className="text-sm sm:text-base font-medium flex-1">{toast.message}</span>
                        {toast.action && (
                            <button 
                                onClick={toast.action}
                                className="underline ml-2 hover:text-gray-200 text-sm font-medium"
                            >
                                Ir a inicio de sesión
                            </button>
                        )}
                    </div>
                )}

                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 w-full max-w-2xl mx-auto mb-4">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={handleInputChange}
                        placeholder="Buscar libros en Google Books..."
                        className="flex-1 p-2 sm:p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                    />
                    <button
                        type="submit"
                        disabled={isSearching || !searchTerm.trim()}
                        className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center gap-2 text-sm sm:text-base"
                    >
                        {isSearching ? (
                            // Simple spinner animation using inline SVG and Tailwind classes
                            <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <SearchIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                        )}
                        {isSearching ? 'Buscando...' : 'Buscar'}
                    </button>
                </form>

                {/* Clear search button only visible if a term is present and a search was run */}
                {searchTerm && hasSearched && (
                    <div className="text-center mb-6">
                        <button
                            onClick={handleClearSearch}
                            className="text-blue-400 hover:text-blue-300 text-xs sm:text-sm"
                        >
                            Limpiar búsqueda
                        </button>
                    </div>
                )}

                <div className="w-full min-w-0">
                    {isSearching ? (
                        <LoadingSpinner />
                    ) : (
                        // Display search results using the generic BookList component
                        <BookList
                            books={searchResults}
                            isSearchList={true} // Tells BookList to show the "Add" button
                            onAdd={handleAddBook}
                            emptyMessage={
                                // Different messages based on search state
                                !hasSearched && !searchTerm.trim() ? (
                                    <div className="col-span-full py-8 sm:py-12 text-center px-2">
                                        <div className="bg-gray-800 p-4 sm:p-6 rounded-lg inline-block max-w-full">
                                            <p className="text-gray-400 mb-3 sm:mb-4 text-sm sm:text-base">Realiza una búsqueda para encontrar libros.</p>
                                        </div>
                                    </div>
                                ) : searchResults.length === 0 && hasSearched ? (
                                    <div className="col-span-full py-8 sm:py-12 text-center px-2">
                                        <div className="bg-gray-800 p-4 sm:p-6 rounded-lg inline-block max-w-full">
                                            <p className="text-gray-400 mb-3 sm:mb-4 text-sm sm:text-base">No se encontraron libros para tu búsqueda.</p>
                                            <button
                                                onClick={handleClearSearch}
                                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-colors text-sm sm:text-base"
                                            >
                                                Intentar otra búsqueda
                                            </button>
                                        </div>
                                    </div>
                                ) : null
                            }
                        />
                    )}
                </div>

                {/* Modal: Reactivate book with progress option */}
                {showModal && currentBook && (
                    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-3 sm:p-4 z-50">
                        <div className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-2xl max-w-sm w-full text-center mx-2 border border-gray-700">
                            <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-4">¿Reactivar este libro?</h3>
                            <p className="text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base break-words">
                                Este libro fue eliminado anteriormente. ¿Desea volver a agregarlo a su colección?
                            </p>
                            <div className="flex flex-col gap-2 sm:gap-3">
                                <button
                                    onClick={handleKeepProgress}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-colors text-sm sm:text-base"
                                >
                                    Reactivar (mantener progreso)
                                </button>
                                <button
                                    onClick={handleStartFromZero}
                                    className="bg-green-600 hover:bg-green-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-colors text-sm sm:text-base"
                                >
                                    Reactivar (empezar desde cero)
                                </button>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-colors text-sm sm:text-base"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

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

export default SearchPage;