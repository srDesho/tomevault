import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import BookList from '../components/books/BookList';
import * as BookService from '../services/BookService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { SearchIcon } from '@heroicons/react/outline';
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
    const [searchErrorMessage, setSearchErrorMessage] = useState(null);
    const [addBookMessage, setAddBookMessage] = useState(null); // Messages for add operations.
    const [showModal, setShowModal] = useState(false); // Controls book reactivation modal.
    const [currentBook, setCurrentBook] = useState(null); // The book being processed for the modal.
    const [scrollRestored, setScrollRestored] = useState(false); // Ensures scroll restoration only happens once.

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

    // [Effect 3]: Clear error/success messages after a timeout.
    useEffect(() => {
        let timer;
        if (addBookMessage || searchErrorMessage) {
            timer = setTimeout(() => {
                setAddBookMessage(null);
                setSearchErrorMessage(null);
            }, 3000);
        }
        return () => clearTimeout(timer);
    }, [addBookMessage, searchErrorMessage]);

    // --- Core Search Logic ---

    // Executes the search against the external service (Google Books).
    const executeSearch = useCallback(async (queryToSearch) => {
        if (!queryToSearch.trim()) {
            setSearchResults([]);
            setSearchErrorMessage(null);
            setHasSearched(false);
            return;
        }

        setIsSearching(true);
        setHasSearched(true);
        setSearchErrorMessage(null);
        setAddBookMessage(null);

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
                    ? 'No se encontraron libros válidos para tu búsqueda. Algunos resultados pueden tener IDs no disponibles.' // Original Spanish text preserved
                    : 'No se encontraron libros para tu búsqueda.'; // Original Spanish text preserved
                setSearchErrorMessage(msg);
            }
        } catch (error) {
            setSearchResults([]);
            setSearchErrorMessage(error.message || 'Error al buscar libros. Intenta de nuevo.'); // Original Spanish text preserved
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
            setSearchErrorMessage('Por favor, ingresa un término de búsqueda.'); // Original Spanish text preserved
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
        setAddBookMessage(null);
        setCurrentBook(book);

        if (!isAuthenticated()) {
            // Must be authenticated to add a book. Redirect to login.
            setAddBookMessage({
                type: 'error',
                text: 'Debes iniciar sesión para agregar libros a tu colección.', // Original Spanish text preserved
            });
            setTimeout(() => navigate('/login'), 1500);
            return;
        }

        if (typeof onAdd !== 'function') {
            setAddBookMessage({
                type: 'error',
                text: 'No se puede agregar libros en este momento.', // Original Spanish text preserved
            });
            return;
        }

        try {
            // 1. Check if the book already exists in the user's collection.
            const status = await BookService.getBookStatus(book.googleBookId);

            if (status.existsActive) {
                setAddBookMessage({
                    type: 'error',
                    text: 'Este libro ya está en tu colección.', // Original Spanish text preserved
                });
                return;
            }

            if (status.existsInactive) {
                // 2. If it was previously deleted (inactive), show the reactivation modal (good UX).
                setShowModal(true);
                return;
            }

            // 3. If new, add it normally.
            const addedBook = await onAdd(book.googleBookId);
            setAddBookMessage({
                type: 'success',
                text: `"${addedBook?.title || book.title}" agregado a tu colección.`, // Original Spanish text preserved
            });

            if (refreshBooks && typeof refreshBooks === 'function') {
                await refreshBooks(); // Refresh the main book list (e.g., HomePage).
            }
        } catch (error) {
            // Error handling for authentication/service issues.
            if (error.message.includes('401') || error.message.includes('403')) {
                setAddBookMessage({
                    type: 'error',
                    text: 'Tu sesión ha expirado. Por favor, inicia sesión de nuevo.', // Original Spanish text preserved
                    action: () => navigate('/login'),
                });
            } else {
                setAddBookMessage({
                    type: 'error',
                    text: error.message || 'Error al verificar o agregar el libro.', // Original Spanish text preserved
                });
            }
        }
    };

    // Modal action: Reactivate and keep existing reading progress.
    const handleKeepProgress = async () => {
        try {
            // activateBook(googleBookId, keepProgress: true)
            const activated = await BookService.activateBook(currentBook.googleBookId, true); 
            setAddBookMessage({
                type: 'success',
                text: `"${activated.title}" reactivado. Continuando desde tu último progreso.`, // Original Spanish text preserved
            });
            setShowModal(false);

            if (typeof refreshBooks === 'function') {
                refreshBooks();
            }
        } catch (err) {
            console.error('Error al reactivar con progreso:', err);
            setAddBookMessage({
                type: 'error',
                text: 'Error al reactivar el libro.', // Original Spanish text preserved
            });
            setShowModal(false);
        }
    };

    // Modal action: Reactivate and reset reading progress.
    const handleStartFromZero = async () => {
        try {
            // activateBook(googleBookId, keepProgress: false)
            const activated = await BookService.activateBook(currentBook.googleBookId, false);
            setAddBookMessage({
                type: 'success',
                text: `"${activated.title}" reactivado. Contador reiniciado.`, // Original Spanish text preserved
            });
            setShowModal(false);

            if (typeof refreshBooks === 'function') {
                refreshBooks();
            }
        } catch (err) {
            console.error('Error al reactivar sin progreso:', err);
            setAddBookMessage({
                type: 'error',
                text: 'Error al reactivar el libro.', // Original Spanish text preserved
            });
            setShowModal(false);
        }
    };

    // Resets all search state (term, results, URL) via context.
    const handleClearSearch = () => {
        clearSearch();
        navigate(location.pathname, { replace: true }); // Clean up the URL query param.
        setSearchErrorMessage(null);
        setAddBookMessage(null);
        setScrollRestored(false);
    };

    return (
        <div className="w-full">
            <div className="mb-8 w-full">
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-6 text-center">
                    Buscar Libros
                </h2>
                
                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 w-full max-w-2xl mx-auto">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={handleInputChange}
                        placeholder="Buscar libros en Google Books..."
                        className="flex-1 p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        type="submit"
                        disabled={isSearching || !searchTerm.trim()}
                        className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                        {isSearching ? (
                            // Simple spinner animation using inline SVG and Tailwind classes
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <SearchIcon className="h-5 w-5" />
                        )}
                        {isSearching ? 'Buscando...' : 'Buscar'}
                    </button>
                </form>

                {/* Clear search button only visible if a term is present and a search was run */}
                {searchTerm && hasSearched && (
                    <div className="text-center mt-4">
                        <button
                            onClick={handleClearSearch}
                            className="text-blue-400 hover:text-blue-300 text-sm"
                        >
                            Limpiar búsqueda
                        </button>
                    </div>
                )}
            </div>

            {/* General message display (success/error) */}
            {addBookMessage && (
                <div key="add-message" className={`p-4 rounded-lg text-center mb-4 ${addBookMessage.type === 'success' ? 'bg-green-600' : 'bg-red-600'} text-white`}>
                    {addBookMessage.text}
                    {addBookMessage.action && (
                        <button onClick={addBookMessage.action} className="underline ml-2 hover:text-gray-200">
                            Ir a inicio de sesión
                        </button>
                    )}
                </div>
            )}

            {/* Specific search error display */}
            {searchErrorMessage && (
                <div className="p-4 rounded-lg bg-red-600 text-white text-center mb-4">
                    {searchErrorMessage}
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
                                <div className="col-span-full py-12 text-center">
                                    <div className="bg-gray-800 p-6 rounded-lg inline-block">
                                        <p className="text-gray-400 mb-4">Realiza una búsqueda para encontrar libros.</p>
                                    </div>
                                </div>
                            ) : searchResults.length === 0 && hasSearched ? (
                                <div className="col-span-full py-12 text-center">
                                    <div className="bg-gray-800 p-6 rounded-lg inline-block">
                                        <p className="text-gray-400 mb-4">No se encontraron libros para tu búsqueda.</p>
                                        <button
                                            onClick={handleClearSearch}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
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
                <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-gray-800 p-6 rounded-lg shadow-2xl max-w-sm w-full text-center">
                        <h3 className="text-xl font-bold text-white mb-4">¿Reactivar este libro?</h3>
                        <p className="text-gray-300 mb-6">
                            Este libro fue eliminado anteriormente. ¿Desea volver a agregarlo a su colección?
                        </p>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleKeepProgress}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
                            >
                                Reactivar (mantener progreso)
                            </button>
                            <button
                                onClick={handleStartFromZero}
                                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
                            >
                                Reactivar (empezar desde cero)
                            </button>
                            <button
                                onClick={() => setShowModal(false)}
                                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg"
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

export default SearchPage;