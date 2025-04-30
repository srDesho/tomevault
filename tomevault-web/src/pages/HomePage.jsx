import React, { useState, useEffect } from 'react';
import Header from '../components/common/Header';
import BookList from '../components/books/BookList';
import * as BookService from '../services/BookService';

const HomePage = () => {
    const [books, setBooks] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBooks = async () => {
            setIsLoading(true);
            try {
                const fetchedBooks = await BookService.getAllBooks();
                setBooks(fetchedBooks);
                setError(null);
            } catch (err) {
                setError("No se pudieron cargar los libros.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchBooks();
    }, []);

    const handleSearch = async (query) => {
        setIsLoading(true);
        try {
            const fetchedBooks = await BookService.searchBooks(query);
            setBooks(fetchedBooks);
            setError(null);
        } catch (err) {
            setError("No se pudieron encontrar libros con esa búsqueda.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <Header onSearch={handleSearch} />
            <main className="container mx-auto p-4 md:p-8">
                {isLoading ? (
                    <div className="flex justify-center items-center h-64 text-xl">Cargando libros...</div>
                ) : error ? (
                    <div className="flex justify-center items-center h-64 text-xl text-red-400">Error: {error}</div>
                ) : books.length > 0 ? (
                    <BookList books={books} />
                ) : (
                    <div className="flex justify-center items-center h-64 text-xl text-gray-400">No se encontraron libros.</div>
                )}
            </main>
        </div>
    );
};

export default HomePage;
