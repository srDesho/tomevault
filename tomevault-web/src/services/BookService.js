// src/services/BookService.js

import { getAuthHeader } from './AuthService';

// Base URL for the backend API.
const BACKEND_BASE_URL = 'http://localhost:8080/api/v1';

// Utility function for API calls with exponential backoff retry logic.
const fetchWithRetry = async (url, options = {}, retries = 3, delay = 1000) => {
  // Adds authorization header to each request if available.
  const authHeader = getAuthHeader();
  const newOptions = {
    ...options,
    headers: {
      ...options.headers,
      'Content-Type': 'application/json',
      ...(authHeader && { 'Authorization': authHeader })
    },
  };

  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, newOptions);
      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`HTTP error! Status: ${response.status} - ${response.statusText}. Details: ${errorBody}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Attempt ${i + 1} failed for ${url}:`, error);
      if (i < retries - 1) {
        await new Promise(res => setTimeout(res, delay * Math.pow(2, i)));
      } else {
        throw error;
      }
    }
  }
};

// Fetches all books from the user's collection via the backend.
export const getMyBooks = async () => {
  console.log("Llamando a API: obtener mis libros desde", BACKEND_BASE_URL);
  try {
    const books = await fetchWithRetry(`${BACKEND_BASE_URL}/books`);
    return books;
  } catch (error) {
    console.error("Error al obtener mis libros:", error);
    throw new Error("No se pudieron cargar tus libros. Asegúrate de que tu backend esté funcionando y accesible.");
  }
};

// Fetches details of a specific book by Googke Book ID from the backend.
export const getBookById = async (googleBookId) => {
  console.log(`Llamando a API: obtener libro con ID: ${googleBookId} desde`, BACKEND_BASE_URL);
  try {
  const userBook = await fetchWithRetry(`${BACKEND_BASE_URL}/books/${googleBookId}`);
        console.log("Libro encontrado en la colección del usuario:", userBook);
        // Añadir una bandera para saber que viene de la colección del usuario
        return { ...userBook, fromUserCollection: true };
      } catch (error) {
        // Si no se encuentra en la colección del usuario (ej. 404), intentar de la API de Google
        console.warn(`Libro con Google ID ${googleBookId} no encontrado en la colección del usuario, intentando desde la API de Google...`, error);
        try {
          const googleApiBook = await fetchWithRetry(`${BACKEND_BASE_URL}/books/google-api/${googleBookId}`);
          console.log("Libro encontrado en la API de Google:", googleApiBook);
          // Añadir una bandera para saber que viene de Google API
          return { ...googleApiBook, fromUserCollection: false };
        } catch (googleApiError) {
          console.error(`Error al obtener libro con Google ID ${googleBookId} de la API de Google:`, googleApiError);
          throw new Error("No se pudo cargar la información del libro desde tu colección ni desde Google Books.");
        }
      }
};

// Searches for books using the Google Books API via the backend.
export const searchGoogleBooks = async (query) => {
  console.log("Llamando a API: buscar libros en tu Backend Spring con query:", query);
  try {
    const url = `${BACKEND_BASE_URL}/books/search-google?query=${encodeURIComponent(query)}`;
    const data = await fetchWithRetry(url, { headers: { 'Content-Type': 'application/json' }});
    return data;
  } catch (error) {
    console.error("Error al buscar libros en tu Backend Spring:", error);
    throw new Error("No se pudieron buscar libros. Verifica la conexión a tu backend.");
  }
};

// Saves a book to the user's collection from a Google Books ID via the backend.
export const saveBookFromGoogle = async (googleBookId) => {
  console.log("Llamando a API: guardar libro desde Google Books en tu Backend Spring con ID:", googleBookId);
  try {
    const createdBook = await fetchWithRetry(`${BACKEND_BASE_URL}/books/from-google/${googleBookId}`, {
      method: 'POST',
    });
    return createdBook;
  } catch (error) {
    console.error("Error al guardar libro desde Google Books:", error);
    throw new Error(error.message || "No se pudo agregar el libro a tu colección. Verifica la conexión al backend y los permisos.");
  }
};

// Updates the read count for a specific book in the backend.
export const updateReadCount = async (bookId, newReadCount) => {
  console.log(`Llamando a API: actualizar contador de lecturas para el libro ${bookId} a ${newReadCount} en`, BACKEND_BASE_URL);
  try {
    const currentBook = await getBookById(bookId);
    if (!currentBook) {
      throw new Error("Libro no encontrado para actualizar el contador.");
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
    console.error(`Error al actualizar el contador de lecturas para el libro ${bookId}:`, error);
    throw new Error("No se pudo actualizar el contador de lecturas. Verifica la conexión al backend o los permisos.");
  }
};

// Increment read count
export const incrementReadCount = async (bookId) => {
  console.log("Llamando a API: incrementar contador de lecturas para libro ID:", bookId);
  try {
    const updatedBook = await fetchWithRetry(`${BACKEND_BASE_URL}/books/increment-read/${bookId}`, {
      method: 'POST'
    });
    return updatedBook;
  } catch (error) {
    console.error("Error al incrementar contador de lecturas:", error);
    throw new Error(error.message || "No se pudo incrementar el contador de lecturas.");
  }
};

// Decrement read count
export const decrementReadCount = async (bookId) => {
  console.log("Llamando a API: decrementar contador de lecturas para libro ID:", bookId);
  try {
    const updatedBook = await fetchWithRetry(`${BACKEND_BASE_URL}/books/decrement-read/${bookId}`, {
      method: 'POST'
    });
    return updatedBook;
  } catch (error) {
    console.error("Error al decrementar contador de lecturas:", error);
    throw new Error(error.message || "No se pudo decrementar el contador de lecturas.");
  }
};

// Delete book
export const deleteBook = async (bookId) => {
  console.log("Llamando a API: eliminar libro ID:", bookId);
  try {
    await fetchWithRetry(`${BACKEND_BASE_URL}/books/${bookId}`, {
      method: 'DELETE'
    });
    return true;
  } catch (error) {
    console.error("Error al eliminar libro:", error);
    throw new Error(error.message || "No se pudo eliminar el libro.");
  }
};