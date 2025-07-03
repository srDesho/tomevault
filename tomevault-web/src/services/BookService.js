import { BACKEND_BASE_URL, getAuthHeader } from './AuthService';

// Generic function to handle API calls with authentication and retry logic
const fetchWithRetry = async (url, options = {}, retries = 3, delay = 1000) => {
    const authHeader = getAuthHeader();
    const finalHeaders = new Headers(options.headers);

    if (authHeader) {
        finalHeaders.set('Authorization', authHeader);
    }
    finalHeaders.set('Content-Type', 'application/json');

    const newOptions = {
        ...options,
        headers: finalHeaders,
    };

    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, newOptions);
            
            // Check for authentication errors (handled by interceptor)
            if (response.status === 401 || response.status === 403) {
                throw new Error('Sesión expirada');
            }
            
            if (!response.ok) {
                const errorBody = await response.text();
                throw new Error(`Error HTTP! Estado: ${response.status} - ${response.statusText}. Detalles: ${errorBody}`);
            }
            
            return await response.json();
        } catch (error) {
            // Don't retry on authentication errors
            if (error.message === 'Sesión expirada') {
                throw error;
            }
            
            console.error(`Intento ${i + 1} fallido para ${url}:`, error);
            if (i < retries - 1) {
                await new Promise(res => setTimeout(res, delay * Math.pow(2, i)));
            } else {
                throw error;
            }
        }
    }
};

// Fetches a paginated list of the user's books
export const getMyBooks = async (page = 0, size = 12) => {
    console.log("Calling API: get paginated books");
    try {
        const response = await fetchWithRetry(
            `${BACKEND_BASE_URL}/books?page=${page}&size=${size}&sort=addedAt,desc`
        );
        return response;
    } catch (error) {
        console.error("Error getting paginated books:", error);
        throw new Error("No se pudieron cargar los libros.");
    }
};

// Fetches all of the user's books by iterating through all pages
export const getAllMyBooks = async () => {
    console.log("Calling API: get all books");
    try {
        let allBooks = [];
        let page = 0;
        let hasMore = true;
        
        while (hasMore) {
            const response = await fetchWithRetry(
                `${BACKEND_BASE_URL}/books?page=${page}&size=100&sort=addedAt,desc`
            );
            
            if (response.content && response.content.length > 0) {
                allBooks = [...allBooks, ...response.content];
                page++;
                hasMore = page < response.totalPages;
            } else {
                hasMore = false;
            }
        }
        
        return allBooks;
    } catch (error) {
        console.error("Error getting all books:", error);
        throw new Error("No se pudieron cargar todos los libros.");
    }
};

// Checks if a book exists in user's collection and returns it
export const getBookByGoogleId = async (googleBookId) => {
    console.log(`Calling API: check if book exists in collection by Google ID: ${googleBookId}`);
    try {
        const response = await fetchWithRetry(`${BACKEND_BASE_URL}/books/${googleBookId}`);
        return { ...response, fromUserCollection: true };
    } catch (error) {
        console.warn(`Book with Google ID ${googleBookId} not found in user's collection`);
        return null;
    }
};

// Fetches book from Google Books API
export const getBookFromGoogleApi = async (googleBookId) => {
    console.log(`Calling API: get book from Google API: ${googleBookId}`);
    try {
        const response = await fetchWithRetry(`${BACKEND_BASE_URL}/books/google-api/${googleBookId}`);
        return { ...response, fromUserCollection: false };
    } catch (error) {
        console.error(`Error getting book from Google API:`, error);
        throw new Error("No se pudo cargar la información del libro desde Google Books.");
    }
};

// Main function to get book - first tries user collection, then Google API
export const getBookById = async (googleBookId) => {
    console.log(`Calling API: get book with ID: ${googleBookId}`);
    
    // First try to get from user's collection
    const userBook = await getBookByGoogleId(googleBookId);
    if (userBook) {
        return userBook;
    }
    
    // If not in collection, get from Google API
    return await getBookFromGoogleApi(googleBookId);
};

// Searches for books using the Google Books API via the backend
export const searchGoogleBooks = async (query) => {
    console.log("Calling API: search books on your Spring Backend with query:", query);
    try {
        const url = `${BACKEND_BASE_URL}/books/search-google?query=${encodeURIComponent(query)}`;
        const data = await fetchWithRetry(url, { headers: { 'Content-Type': 'application/json' }});
        return data;
    } catch (error) {
        console.error("Error searching books on your Spring Backend:", error);
        throw new Error("No se pudieron buscar libros. Verifica la conexión con tu backend.");
    }
};

// Reactivates a soft-deleted book
export const activateBook = async (googleBookId, keepProgress = true) => {
    console.log("Reactivating book with ID:", googleBookId, "Keep progress:", keepProgress);
    try {
        const response = await fetchWithRetry(`${BACKEND_BASE_URL}/books/activate/${googleBookId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ keepProgress }),
        });
        return response;
    } catch (error) {
        console.error("Error reactivating book:", error);
        throw error;
    }
};

// Saves a book from the Google Books API to the user's collection
export const saveBookFromGoogle = async (googleBookId) => {
    console.log("Calling API: save book from Google Books to your Spring Backend with ID:", googleBookId);
    try {
        const createdBook = await fetchWithRetry(`${BACKEND_BASE_URL}/books/from-google/${googleBookId}`, {
            method: 'POST',
        });
        return createdBook;
    } catch (error) {
        console.error("Error saving book from Google Books:", error);
        throw error;
    }
};

// Updates a book's read count
export const updateReadCount = async (bookId, newReadCount) => {
    console.log(`Calling API: update read count for book ${bookId} to ${newReadCount} on`, BACKEND_BASE_URL);
    try {
        const currentBook = await getBookById(bookId);
        if (!currentBook) {
            throw new Error("No se encontró el libro para actualizar el contador de lecturas.");
        }
        const bookToUpdate = {
            ...currentBook,
            readCount: newReadCount
        };

        const updatedBook = await fetchWithRetry(`${BACKEND_BASE_URL}/books/${bookId}`, {
            method: 'PUT',
            body: JSON.stringify(bookToUpdate),
        });
        return updatedBook;
    } catch (error) {
        console.error(`Error updating read count for book ${bookId}:`, error);
        throw new Error("No se pudo actualizar el contador de lecturas. Verifica la conexión con el backend o tus permisos.");
    }
};

// Increments a book's read count
export const incrementReadCount = async (bookId) => {
    console.log("Calling API: increment read count for book ID:", bookId);
    try {
        const updatedBook = await fetchWithRetry(`${BACKEND_BASE_URL}/books/increment-read/${bookId}`, {
            method: 'POST'
        });
        return updatedBook;
    } catch (error) {
        console.error("Error incrementing read count:", error);
        throw new Error(error.message || "No se pudo incrementar el contador de lecturas.");
    }
};

// Decrements a book's read count
export const decrementReadCount = async (bookId) => {
    console.log("Calling API: decrement read count for book ID:", bookId);
    try {
        const updatedBook = await fetchWithRetry(`${BACKEND_BASE_URL}/books/decrement-read/${bookId}`, {
            method: 'POST'
        });
        return updatedBook;
    } catch (error) {
        console.error("Error decrementing read count:", error);
        throw new Error(error.message || "No se pudo decrementar el contador de lecturas.");
    }
};

// Deletes a book from the user's collection
export const deleteBook = async (bookId) => {
    console.log("Calling API: delete book ID:", bookId);
    try {
        await fetchWithRetry(`${BACKEND_BASE_URL}/books/${bookId}`, {
            method: 'DELETE'
        });
        return true;
    } catch (error) {
        console.error("Error deleting book:", error);
        throw new Error(error.message || "No se pudo eliminar el libro.");
    }
};

// Gets the status of a book
export const getBookStatus = async (googleBookId) => {
    console.log(`Calling API: check status for book ${googleBookId}`);
    try {
        const response = await fetchWithRetry(`${BACKEND_BASE_URL}/books/status/${googleBookId}`);
        return response;
    } catch (error) {
        console.error("Error checking book status:", error);
        throw error;
    }
};