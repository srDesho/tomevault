// Este servicio simula las llamadas a la API de backend.

const mockBooks = [
    { id: '1', title: 'The Lord of the Rings', author: 'J.R.R. Tolkien', thumbnail: 'https://placehold.co/128x194/FFF/000?text=LOTR' },
    { id: '2', title: 'Dune', author: 'Frank Herbert', thumbnail: 'https://placehold.co/128x194/FFF/000?text=Dune' },
    { id: '3', title: '1984', author: 'George Orwell', thumbnail: 'https://placehold.co/128x194/FFF/000?text=1984' },
    { id: '4', title: 'Brave New World', author: 'Aldous Huxley', thumbnail: 'https://placehold.co/128x194/FFF/000?text=BNW' },
    { id: '5', title: 'The Hitchhiker\'s Guide to the Galaxy', author: 'Douglas Adams', thumbnail: 'https://placehold.co/128x194/FFF/000?text=HGTG' },
    { id: '6', title: 'The Hobbit', author: 'J.R.R. Tolkien', thumbnail: 'https://placehold.co/128x194/FFF/000?text=Hobbit' }
  ];
  
  export const getAllBooks = async () => {
      console.log("Simulando llamada a API: obtener todos los libros");
      return new Promise(resolve => setTimeout(() => resolve(mockBooks), 1000));
  };
  
  export const searchBooks = async (query) => {
      console.log("Simulando llamada a API: buscar libros con query:", query);
      const filteredBooks = mockBooks.filter(book =>
          book.title.toLowerCase().includes(query.toLowerCase()) ||
          book.author.toLowerCase().includes(query.toLowerCase())
      );
      return new Promise(resolve => setTimeout(() => resolve(filteredBooks), 500));
  };
  
  export const createBook = async (newBookData) => {
      console.log("Simulando llamada a API: crear nuevo libro", newBookData);
      // Lógica para enviar un POST al backend
      return new Promise(resolve => setTimeout(() => resolve({ ...newBookData, id: Date.now() }), 500));
  };
  