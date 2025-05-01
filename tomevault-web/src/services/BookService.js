// Este servicio simula las llamadas a la API de backend y Google Books.

// Mock data for my books (will be replaced by API calls)
export const mockMyBooks = [
    {
      id: 'my-1',
      title: 'The Hobbit',
      author: 'J.R.R. Tolkien',
      thumbnail: 'https://placehold.co/128x194/FFF/000?text=Hobbit',
      description: 'A children\'s fantasy novel by J.R.R. Tolkien.',
      readCount: 3,
    },
    {
      id: 'my-2',
      title: 'The Hitchhiker\'s Guide to the Galaxy',
      author: 'Douglas Adams',
      thumbnail: 'https://placehold.co/128x194/FFF/000?text=HGTG',
      description: 'A comedy science fiction series created by Douglas Adams.',
      readCount: 1,
    },
  ];
  
  // Mock data for Google Books search results (will be replaced by API calls)
  export const mockGoogleBooks = [
    {
      id: 'google-1',
      title: 'The Lord of the Rings',
      author: 'J.R.R. Tolkien',
      thumbnail: 'https://placehold.co/128x194/cccccc/000000?text=LOTR',
      description: 'A fantasy novel by J. R. R. Tolkien.',
    },
    {
      id: 'google-2',
      title: 'Dune',
      author: 'Frank Herbert',
      thumbnail: 'https://placehold.co/128x194/cccccc/000000?text=Dune',
      description: 'A science fiction novel by Frank Herbert.',
    },
    {
      id: 'google-3',
      title: '1984',
      author: 'George Orwell',
      thumbnail: 'https://placehold.co/128x194/cccccc/000000?text=1984',
      description: 'A dystopian social science fiction novel by George Orwell.',
    },
    {
      id: 'google-4',
      title: 'Brave New World',
      author: 'Aldous Huxley',
      thumbnail: 'https://placehold.co/128x194/cccccc/000000?text=BNW',
      description: 'A dystopian social science fiction novel by Aldous Huxley.',
    },
  ];
  
  export const getMyBooks = async () => {
    console.log("Simulando llamada a API: obtener mis libros");
    return new Promise(resolve => setTimeout(() => resolve(mockMyBooks), 500));
  };
  
  export const getBookById = async (id) => {
    console.log(`Simulando llamada a API: obtener libro con ID: ${id}`);
    const book = mockMyBooks.find(b => b.id === id);
    return new Promise(resolve => setTimeout(() => resolve(book), 300));
  };
  
  export const searchGoogleBooks = async (query) => {
    console.log("Simulando llamada a API: buscar libros en Google Books con query:", query);
    const filteredBooks = mockGoogleBooks.filter(book =>
      book.title.toLowerCase().includes(query.toLowerCase()) ||
      book.author.toLowerCase().includes(query.toLowerCase())
    );
    return new Promise(resolve => setTimeout(() => resolve(filteredBooks), 500));
  };
  
  export const createBook = async (newBookData) => {
    console.log("Simulando llamada a API: crear nuevo libro", newBookData);
    return new Promise(resolve => setTimeout(() => resolve({ ...newBookData, id: Date.now() }), 500));
  };
  
  export const updateReadCount = async (bookId) => {
    console.log("Simulando llamada a API: actualizar contador de lecturas para el libro", bookId);
    const book = mockMyBooks.find(b => b.id === bookId);
    if (book) {
      return new Promise(resolve => setTimeout(() => resolve({ ...book, readCount: book.readCount + 1 }), 300));
    }
    return new Promise(resolve => setTimeout(() => resolve(null), 300));
  };